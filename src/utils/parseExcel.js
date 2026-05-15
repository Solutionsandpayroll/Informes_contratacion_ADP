import * as XLSX from 'xlsx'

function normalizeHeader(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()
}

function getColumnIndex(headerMap, candidates, fallbackIndex) {
  for (const candidate of candidates) {
    const idx = headerMap.get(normalizeHeader(candidate))
    if (idx !== undefined) return idx
  }
  return fallbackIndex
}

function valueAt(row, idx) {
  return idx >= 0 ? row[idx] : ''
}

// Convierte serial de fecha Excel a Date en UTC
function excelDateToJS(value) {
  if (!value) return null
  if (typeof value === 'number') {
    return new Date(Date.UTC(1899, 11, 30) + value * 86400000)
  }
  if (typeof value === 'string' && value.trim()) {
    // dd/mm/yyyy
    const parts = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (parts) {
      return new Date(Date.UTC(Number(parts[3]), Number(parts[2]) - 1, Number(parts[1])))
    }
    const d = new Date(value)
    if (!isNaN(d)) return d
  }
  return null
}

function formatDate(date) {
  if (!date) return '-'
  return date.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function diffDias(a, b) {
  if (!a || !b) return null
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

export function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' })
        const sheetName = wb.SheetNames.includes('INGRESOS') ? 'INGRESOS' : wb.SheetNames[0]
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], {
          header: 1,
          defval: '',
        })

        if (!rows.length) {
          throw new Error('La hoja seleccionada no contiene datos.')
        }

        const headers = rows[0] || []
        const headerMap = new Map(
          headers.map((h, i) => [normalizeHeader(h), i])
        )

        const idxPais = getColumnIndex(headerMap, ['PAIS'], 0)
        const idxResponsable = getColumnIndex(headerMap, ['RESPONSABLE'], 1)
        const idxUnidad = getColumnIndex(headerMap, ['UNIDAD'], 2)
        const idxCliente = getColumnIndex(headerMap, ['CLIENTE'], 3)
        const idxIdentificacion = getColumnIndex(headerMap, ['IDENTIFICACION'], 4)
        const idxApellido1 = getColumnIndex(headerMap, ['APELLIDO1'], 5)
        const idxApellido2 = getColumnIndex(headerMap, ['APELLIDO 2', 'APELLIDO2'], 6)
        const idxNombre1 = getColumnIndex(headerMap, ['NOMBRE1'], 7)
        const idxNombre2 = getColumnIndex(headerMap, ['NOMBRE 2', 'NOMBRE2'], 8)
        const idxCargo = getColumnIndex(headerMap, ['CARGO'], 14)
        const idxFechaIngreso = getColumnIndex(headerMap, ['F. INGRESO'], 15)
        const idxTipoContrato = getColumnIndex(headerMap, ['T. CONTRATO'], 16)
        const idxSeguimiento = getColumnIndex(headerMap, ['SEGUIMIENTO'], 18)

        const idxFechaRecibido = getColumnIndex(
          headerMap,
          ['F. RECIBIDO SOLICITUD', 'F. RECIBIDO'],
          19
        )
        const idxFechaExamenes = getColumnIndex(
          headerMap,
          ['F. EXAMENES INGRESO', 'F. EXAMENES MEDICOS'],
          20
        )
        const idxFechaFirma = getColumnIndex(
          headerMap,
          ['F. FIRMA CONTRATO'],
          21
        )

        const registros = rows
          .slice(1) // omitir encabezado
          .filter((row) => {
            const identificacion = valueAt(row, idxIdentificacion)
            return identificacion !== '' && identificacion != null
          })
          .map((row) => {
            const fechaRecibido = excelDateToJS(valueAt(row, idxFechaRecibido))
            const fechaExamenes = excelDateToJS(valueAt(row, idxFechaExamenes))
            const fechaFirma    = excelDateToJS(valueAt(row, idxFechaFirma))
            const fechaIngreso  = excelDateToJS(valueAt(row, idxFechaIngreso))

            const apellido1 = valueAt(row, idxApellido1)
            const apellido2 = valueAt(row, idxApellido2)
            const nombre1 = valueAt(row, idxNombre1)
            const nombre2 = valueAt(row, idxNombre2)

            return {
              pais:           String(valueAt(row, idxPais) || '').trim() || '-',
              responsable:    String(valueAt(row, idxResponsable) || '').trim() || '-',
              unidad:         String(valueAt(row, idxUnidad) || '').trim() || '-',
              cliente:        String(valueAt(row, idxCliente) || '').trim() || '-',
              identificacion: String(valueAt(row, idxIdentificacion) || ''),
              apellidos:      `${apellido1 || ''} ${apellido2 || ''}`.trim(),
              nombres:        `${nombre1 || ''} ${nombre2 || ''}`.trim(),
              nombreCompleto: `${nombre1 || ''} ${nombre2 || ''} ${apellido1 || ''} ${apellido2 || ''}`.trim(),
              cargo:          String(valueAt(row, idxCargo) || '').trim() || '-',
              tipoContrato:   String(valueAt(row, idxTipoContrato) || '').trim() || '-',
              seguimiento:    String(valueAt(row, idxSeguimiento) || '').trim(),
              fechaIngreso,
              fechaRecibido,
              fechaExamenes,
              fechaFirma,
              fechaIngresoStr:   formatDate(fechaIngreso),
              fechaRecibidoStr:  formatDate(fechaRecibido),
              fechaExamenesStr:  formatDate(fechaExamenes),
              fechaFirmaStr:     formatDate(fechaFirma),
              diasRecibidoExamenes: diffDias(fechaRecibido, fechaExamenes),
              diasExamenesFirma:    diffDias(fechaExamenes, fechaFirma),
              diasTotal:            diffDias(fechaRecibido, fechaFirma),
            }
          })

        resolve(registros)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'))
    reader.readAsArrayBuffer(file)
  })
}
