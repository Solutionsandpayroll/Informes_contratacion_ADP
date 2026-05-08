import { useState, useEffect } from 'react'
import { flushSync } from 'react-dom'

const PAGE_SIZE = 25

function DiasBadge({ dias }) {
  if (dias === null || dias === undefined)
    return <span className="dias-badge dias-gris">—</span>
  if (dias < 0)
    return <span className="dias-badge dias-rojo">{dias}d ⚠</span>
  if (dias <= 7)
    return <span className="dias-badge dias-verde">{dias}d</span>
  if (dias <= 15)
    return <span className="dias-badge dias-amarillo">{dias}d</span>
  return <span className="dias-badge dias-rojo">{dias}d</span>
}

function SortIcon({ campo, orden }) {
  if (orden.campo !== campo) return <span className="sort-icon">↕</span>
  return <span className="sort-icon active">{orden.dir === 'asc' ? '↑' : '↓'}</span>
}

export default function TablaDetalle({ registros }) {
  const [busqueda, setBusqueda]   = useState('')
  const [pagina, setPagina]       = useState(1)
  const [isPrinting, setIsPrinting] = useState(false)
  const [orden, setOrden]         = useState({ campo: 'fechaRecibido', dir: 'desc' })

  // Reiniciar página cuando cambien los registros filtrados del padre
  useEffect(() => { setPagina(1) }, [registros])

  const filtrados = registros.filter((r) => {
    if (!busqueda) return true
    const q = busqueda.toLowerCase()
    return (
      r.nombreCompleto.toLowerCase().includes(q) ||
      r.cargo.toLowerCase().includes(q) ||
      r.cliente.toLowerCase().includes(q) ||
      r.identificacion.includes(q)
    )
  })

  const ordenados = [...filtrados].sort((a, b) => {
    let va = a[orden.campo]
    let vb = b[orden.campo]
    if (va == null) return 1
    if (vb == null) return -1
    if (va < vb) return orden.dir === 'asc' ? -1 : 1
    if (va > vb) return orden.dir === 'asc' ? 1 : -1
    return 0
  })

  const totalPaginas = Math.ceil(ordenados.length / PAGE_SIZE)
  const displayRows  = isPrinting ? ordenados : ordenados.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE)

  const toggleOrden = (campo) => {
    setOrden((prev) => ({
      campo,
      dir: prev.campo === campo && prev.dir === 'asc' ? 'desc' : 'asc',
    }))
    setPagina(1)
  }

  const exportarPDF = () => {
    flushSync(() => setIsPrinting(true))
    window.print()
    setIsPrinting(false)
  }

  return (
    <div className="card tabla-section">
      <div className="card-header tabla-card-header">
        <div>
          <h2>Detalle de Contrataciones</h2>
          <p className="description">
            {filtrados.length} registro{filtrados.length !== 1 ? 's' : ''}
            {busqueda ? ` · búsqueda: "${busqueda}"` : ''}
          </p>
        </div>
        <div className="tabla-acciones no-print">
          <input
            type="text"
            className="select-input busqueda-input"
            placeholder="Buscar por nombre, cargo, cliente…"
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setPagina(1) }}
          />
          <button className="btn-export" onClick={exportarPDF}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <polyline points="9 15 12 18 15 15" />
            </svg>
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Leyenda de colores */}
      <div className="leyenda">
        <span className="leyenda-titulo">Días de proceso:</span>
        <span className="dias-badge dias-verde">≤7d</span><span className="leyenda-item">Óptimo</span>
        <span className="dias-badge dias-amarillo">≤15d</span><span className="leyenda-item">Normal</span>
        <span className="dias-badge dias-rojo">&gt;15d</span><span className="leyenda-item">Requiere atención</span>
      </div>

      <div className="tabla-container">
        <table className="tabla-detalle">
          <thead>
            <tr>
              <th className="th-sort" onClick={() => toggleOrden('nombreCompleto')}>
                Nombre <SortIcon campo="nombreCompleto" orden={orden} />
              </th>
              <th>Cargo</th>
              <th>Cliente</th>
              <th>Unidad</th>
              <th className="th-sort" onClick={() => toggleOrden('fechaRecibido')}>
                F. Recibido Solicitud <SortIcon campo="fechaRecibido" orden={orden} />
              </th>
              <th>F. Exámenes Ingreso</th>
              <th>F. Firma Contrato</th>
              <th className="th-sort" onClick={() => toggleOrden('diasRecibidoExamenes')}>
                Solicitud→Exam <SortIcon campo="diasRecibidoExamenes" orden={orden} />
              </th>
              <th className="th-sort" onClick={() => toggleOrden('diasExamenesFirma')}>
                Exam→Firma <SortIcon campo="diasExamenesFirma" orden={orden} />
              </th>
              <th className="th-sort" onClick={() => toggleOrden('diasTotal')}>
                Total <SortIcon campo="diasTotal" orden={orden} />
              </th>
            </tr>
          </thead>
          <tbody>
            {displayRows.length === 0 ? (
              <tr>
                <td colSpan={10} className="tabla-empty">
                  No hay registros que coincidan con la búsqueda
                </td>
              </tr>
            ) : (
              displayRows.map((r, i) => (
                <tr key={`${r.identificacion}-${i}`} className="tabla-row">
                  <td className="td-nombre">
                    <div>{r.nombres}</div>
                    <div className="td-apellido">{r.apellidos}</div>
                  </td>
                  <td className="td-cargo">{r.cargo}</td>
                  <td className="td-cliente">{r.cliente}</td>
                  <td>
                    <span className="unidad-badge">{r.unidad}</span>
                  </td>
                  <td className="td-fecha">{r.fechaRecibidoStr}</td>
                  <td className="td-fecha">{r.fechaExamenesStr}</td>
                  <td className="td-fecha">{r.fechaFirmaStr}</td>
                  <td><DiasBadge dias={r.diasRecibidoExamenes} /></td>
                  <td><DiasBadge dias={r.diasExamenesFirma} /></td>
                  <td><DiasBadge dias={r.diasTotal} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 && !isPrinting && (
        <div className="paginacion no-print">
          <button
            className="btn-pag"
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            disabled={pagina === 1}
          >
            ← Anterior
          </button>
          <span className="pag-info">
            Página {pagina} de {totalPaginas} &nbsp;·&nbsp; {filtrados.length} registros
          </span>
          <button
            className="btn-pag"
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            disabled={pagina === totalPaginas}
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  )
}
