import { useState, useMemo } from 'react'
import './App.css'
import { parseExcel }       from './utils/parseExcel'
import { calcularMetricas } from './utils/calcularMetricas'
import UploadSection        from './components/UploadSection'
import Filtros              from './components/Filtros'
import KPICards             from './components/KPICards'
import TablaDetalle         from './components/TablaDetalle'

const FILTROS_INIT = { fechaDesde: '', fechaHasta: '', unidad: '', responsable: '' }

function App() {
  const [registros,     setRegistros]     = useState([])
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState(null)
  const [nombreArchivo, setNombreArchivo] = useState('')
  const [filtros,       setFiltros]       = useState(FILTROS_INIT)

  const handleFile = async (file) => {
    setLoading(true)
    setError(null)
    try {
      const data = await parseExcel(file)
      if (data.length === 0) throw new Error('El archivo no contiene registros válidos.')
      setRegistros(data)
      setNombreArchivo(file.name)
      setFiltros(FILTROS_INIT)
    } catch (e) {
      setError(e.message || 'Error al leer el archivo. Verifica que sea el CONTROL ING Y RET.xlsx correcto.')
    } finally {
      setLoading(false)
    }
  }

  const unidades = useMemo(
    () => [...new Set(registros.map((r) => r.unidad).filter((v) => v && v !== '-'))].sort(),
    [registros]
  )
  const responsables = useMemo(
    () => [...new Set(registros.map((r) => r.responsable).filter((v) => v && v !== '-'))].sort(),
    [registros]
  )

  const registrosFiltrados = useMemo(() => {
    return registros.filter((r) => {
      if (filtros.unidad      && r.unidad      !== filtros.unidad)      return false
      if (filtros.responsable && r.responsable !== filtros.responsable) return false
      if (filtros.fechaDesde || filtros.fechaHasta) {
        if (!r.fechaRecibido) return false
        if (filtros.fechaDesde) {
          const [y, m, d] = filtros.fechaDesde.split('-').map(Number)
          if (r.fechaRecibido < new Date(Date.UTC(y, m - 1, d))) return false
        }
        if (filtros.fechaHasta) {
          const [y, m, d] = filtros.fechaHasta.split('-').map(Number)
          if (r.fechaRecibido > new Date(Date.UTC(y, m - 1, d, 23, 59, 59))) return false
        }
      }
      return true
    })
  }, [registros, filtros])

  const metricas = useMemo(() => calcularMetricas(registrosFiltrados), [registrosFiltrados])
  const tieneDatos = registros.length > 0

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo-container">
              <div className="logo">
                <img src="/Logo syp.png" alt="Solutions & Payroll Logo" width="60" height="60" />
              </div>
              <div className="header-text">
                <h1>Solutions & Payroll</h1>
                <p className="subtitle">Informes de Contratación — ADP</p>
              </div>
            </div>

            {tieneDatos ? (
              <div className="header-actions no-print">
                <div className="archivo-badge">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span title={nombreArchivo}>{nombreArchivo}</span>
                </div>
                <button
                  className="btn-nuevo-archivo"
                  onClick={() => { setRegistros([]); setNombreArchivo(''); setError(null) }}
                >
                  Cargar otro archivo
                </button>
              </div>
            ) : (
              <div className="welcome-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>Informes ADP</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="main-content">
        <div className="container">
          {!tieneDatos ? (
            <UploadSection onFile={handleFile} loading={loading} error={error} />
          ) : (
            <>
              <Filtros
                filtros={filtros}
                onChange={setFiltros}
                unidades={unidades}
                responsables={responsables}
              />
              <KPICards metricas={metricas} />
              <TablaDetalle registros={registrosFiltrados} metricas={metricas} />
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>
            &copy; {new Date().getFullYear()} Solutions &amp; Payroll. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
