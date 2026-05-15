import { useState, useEffect, useRef } from 'react'
import XLSX from 'xlsx-js-style'

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

export default function TablaDetalle({ registros, metricas }) {
  const [busqueda, setBusqueda]   = useState('')
  const [pagina, setPagina]       = useState(1)
  const [orden, setOrden]         = useState({ campo: 'fechaRecibido', dir: 'desc' })

  const topScrollRef = useRef(null)
  const topSpacerRef = useRef(null)
  const bottomScrollRef = useRef(null)
  const tableRef = useRef(null)
  const syncLockRef = useRef(false)

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
  const displayRows  = ordenados.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE)

  useEffect(() => {
    const updateTopScroll = () => {
      const table = tableRef.current
      const bottom = bottomScrollRef.current
      const spacer = topSpacerRef.current
      if (!table || !bottom || !spacer) return

      spacer.style.width = `${table.scrollWidth}px`
    }

    updateTopScroll()

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(updateTopScroll)
      : null

    if (resizeObserver) {
      if (tableRef.current) resizeObserver.observe(tableRef.current)
      if (bottomScrollRef.current) resizeObserver.observe(bottomScrollRef.current)
    }

    window.addEventListener('resize', updateTopScroll)
    return () => {
      if (resizeObserver) resizeObserver.disconnect()
      window.removeEventListener('resize', updateTopScroll)
    }
  }, [displayRows.length])

  const toggleOrden = (campo) => {
    setOrden((prev) => ({
      campo,
      dir: prev.campo === campo && prev.dir === 'asc' ? 'desc' : 'asc',
    }))
    setPagina(1)
  }

  const exportarExcel = () => {
    const fecha      = new Date()
    const fechaStr   = fecha.toLocaleDateString('es-CO', { year:'numeric', month:'2-digit', day:'2-digit' }).replace(/\//g, '-')
    const fechaLabel = fecha.toLocaleDateString('es-CO', { year:'numeric', month:'long', day:'numeric' })

    // ── Paleta corporativa S&P ────────────────────────────────────────────
    const C = {
      darkBlue : '1B4F72',
      medBlue  : '2874A6',
      teal     : '148F77',
      altRow   : 'EAF2FF',
      white    : 'FFFFFF',
      border   : 'AED6F1',
      text     : '1C2833',
    }

    // ── Helpers de estilos ────────────────────────────────────────────────
    const brd     = { style: 'thin', color: { rgb: C.border } }
    const borders = { top: brd, bottom: brd, left: brd, right: brd }
    const sTitle  = { font: { bold:true, sz:15, color:{ rgb:C.white }, name:'Calibri' }, fill: { patternType:'solid', fgColor:{ rgb:C.darkBlue } }, alignment: { horizontal:'center', vertical:'center' } }
    const sSub    = { font: { italic:true, sz:9, color:{ rgb:C.white }, name:'Calibri' }, fill: { patternType:'solid', fgColor:{ rgb:C.medBlue  } }, alignment: { horizontal:'center', vertical:'center' } }
    const sSec    = { font: { bold:true, sz:10, color:{ rgb:C.white }, name:'Calibri' }, fill: { patternType:'solid', fgColor:{ rgb:C.teal     } }, alignment: { horizontal:'left',   vertical:'center' }, border: borders }
    const sHdr    = { font: { bold:true, sz:10, color:{ rgb:C.white }, name:'Calibri' }, fill: { patternType:'solid', fgColor:{ rgb:C.medBlue  } }, alignment: { horizontal:'center', vertical:'center', wrapText:true }, border: borders }
    const sD = (even, center = false) => ({
      font:      { sz:10, name:'Calibri', color:{ rgb:C.text } },
      fill:      { patternType:'solid', fgColor:{ rgb: even ? C.white : C.altRow } },
      alignment: { horizontal: center ? 'center' : 'left', vertical:'center' },
      border:    borders,
    })
    const sBlank = { font: { sz:6 }, fill: { patternType:'solid', fgColor:{ rgb:C.white } } }
    const cell  = (v, s) => ({ v, s })
    const blank = ()     => ({ v: '', s: sBlank })

    // ══════════════════════════════════════════════════════════════════════
    // HOJA 1 — RESUMEN
    // ══════════════════════════════════════════════════════════════════════
    const kpiRows = [
      ['Total contrataciones (filtro actual)',           metricas?.total                             ?? '-'],
      ['Procesos con ciclo completo',                    metricas?.procesosCompletos                 ?? '-'],
      ['Días prom. Recibido → Exámenes Ingreso',        metricas?.promedioRecibidoExamenes != null   ? `${metricas.promedioRecibidoExamenes} días` : 'Sin datos'],
      ['Días prom. Exámenes Ingreso → Firma Contrato',  metricas?.promedioExamenesFirma    != null   ? `${metricas.promedioExamenesFirma} días`    : 'Sin datos'],
      ['Días prom. Proceso Total',                       metricas?.promedioTotal            != null   ? `${metricas.promedioTotal} días`            : 'Sin datos'],
    ]
    const unidadRows = Object.entries(metricas?.porUnidad ?? {}).sort((a, b) => b[1] - a[1])

    // Estructura (índices de fila 0-based):
    // 0: título | 1: subtítulo | 2: vacía | 3: sección KPI | 4: cabecera KPI
    // 5-9: datos KPI (5 filas fijas) | 10: vacía | 11: sección Unidad | 12: cabecera Unidad
    // 13+: datos por unidad | última: vacía
    const aoaR = [
      [cell('INFORME DE CONTRATACIONES — ADP',                              sTitle), blank()],
      [cell(`Solutions & Payroll  ·  Generado: ${fechaLabel}`,             sSub),   blank()],
      [blank(), blank()],
      [cell('▌  INDICADORES GENERALES',                                    sSec),   blank()],
      [cell('Indicador', sHdr),         cell('Valor', sHdr)],
      ...kpiRows.map(([k, v], i) => [cell(k, sD(i%2===0)), cell(v, sD(i%2===0, true))]),
      [blank(), blank()],
      [cell('▌  CONTRATACIONES POR UNIDAD',                                sSec),   blank()],
      [cell('Unidad', sHdr),            cell('Contrataciones', sHdr)],
      ...unidadRows.map(([u, n], i) => [cell(u, sD(i%2===0)), cell(n, sD(i%2===0, true))]),
      [blank(), blank()],
    ]

    const wsR = XLSX.utils.aoa_to_sheet(aoaR)
    wsR['!cols']   = [{ wch: 52 }, { wch: 20 }]
    wsR['!rows']   = [{ hpx: 34 }, { hpx: 18 }]
    wsR['!merges'] = [0, 1, 2, 3, 10, 11].map(r => ({ s: { r, c: 0 }, e: { r, c: 1 } }))

    // ══════════════════════════════════════════════════════════════════════
    // HOJA 2 — CONTRATACIONES (DETALLE)
    // ══════════════════════════════════════════════════════════════════════
    const HDR = [
      'País', 'Responsable', 'Unidad', 'Cliente', 'Identificación',
      'Nombres', 'Apellidos', 'Cargo', 'Tipo Contrato',
      'F. Recibido Solicitud', 'F. Exámenes Ingreso', 'F. Firma Contrato',
      'Días Solicitud→Exámenes', 'Días Exámenes→Firma', 'Días Total',
    ]
    const NC = HDR.length  // 15

    const aoaD = [
      [cell('DETALLE DE CONTRATACIONES', sTitle), ...Array(NC - 1).fill(blank())],
      [cell(`Solutions & Payroll  ·  Generado: ${fechaLabel}  ·  Total registros: ${ordenados.length}`, sSub), ...Array(NC - 1).fill(blank())],
      HDR.map(h => cell(h, sHdr)),
      ...ordenados.map((r, i) => {
        const e = i % 2 === 0
        return [
          cell(r.pais              ?? '', sD(e)),
          cell(r.responsable       ?? '', sD(e)),
          cell(r.unidad            ?? '', sD(e, true)),
          cell(r.cliente           ?? '', sD(e)),
          cell(r.identificacion    ?? '', sD(e, true)),
          cell(r.nombres           ?? '', sD(e)),
          cell(r.apellidos         ?? '', sD(e)),
          cell(r.cargo             ?? '', sD(e)),
          cell(r.tipoContrato      ?? '', sD(e)),
          cell(r.fechaRecibidoStr  ?? '', sD(e, true)),
          cell(r.fechaExamenesStr  ?? '', sD(e, true)),
          cell(r.fechaFirmaStr     ?? '', sD(e, true)),
          cell(r.diasRecibidoExamenes ?? '', sD(e, true)),
          cell(r.diasExamenesFirma    ?? '', sD(e, true)),
          cell(r.diasTotal            ?? '', sD(e, true)),
        ]
      }),
    ]

    const wsD = XLSX.utils.aoa_to_sheet(aoaD)
    wsD['!cols'] = [
      { wch:10 }, { wch:20 }, { wch:10 }, { wch:35 }, { wch:14 },
      { wch:22 }, { wch:22 }, { wch:35 }, { wch:20 },
      { wch:22 }, { wch:22 }, { wch:22 },
      { wch:24 }, { wch:22 }, { wch:12 },
    ]
    wsD['!rows']   = [{ hpx: 32 }, { hpx: 16 }, { hpx: 28 }]
    wsD['!merges'] = [
      { s: { r:0, c:0 }, e: { r:0, c:NC-1 } },
      { s: { r:1, c:0 }, e: { r:1, c:NC-1 } },
    ]

    // ── Ensamblar workbook ────────────────────────────────────────────────
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, wsR, 'Resumen')
    XLSX.utils.book_append_sheet(wb, wsD, 'Contrataciones')
    XLSX.writeFile(wb, `Informe_Contrataciones_${fechaStr}.xlsx`)
  }

  const syncScroll = (sourceRef, targetRef) => {
    if (syncLockRef.current) return
    const source = sourceRef.current
    const target = targetRef.current
    if (!source || !target) return

    syncLockRef.current = true
    target.scrollLeft = source.scrollLeft
    requestAnimationFrame(() => {
      syncLockRef.current = false
    })
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
          <button className="btn-export" onClick={exportarExcel}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <polyline points="9 15 12 18 15 15" />
            </svg>
            Exportar Excel
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

      <div
        className="tabla-scroll-top no-print"
        ref={topScrollRef}
        onScroll={() => syncScroll(topScrollRef, bottomScrollRef)}
        aria-hidden="true"
      >
        <div className="tabla-scroll-spacer" ref={topSpacerRef} />
      </div>

      <div
        className="tabla-container"
        ref={bottomScrollRef}
        onScroll={() => syncScroll(bottomScrollRef, topScrollRef)}
      >
        <table className="tabla-detalle" ref={tableRef}>
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

      {totalPaginas > 1 && (
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
