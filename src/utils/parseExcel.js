import * as XLSX from 'xlsx'

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

        const registros = rows
          .slice(1) // omitir encabezado
          .filter((row) => row[4] !== '' && row[4] != null)
          .map((row) => {
            const fechaRecibido = excelDateToJS(row[19])
            const fechaExamenes = excelDateToJS(row[20])
            const fechaFirma    = excelDateToJS(row[21])
            const fechaIngreso  = excelDateToJS(row[15])

            return {
              pais:           String(row[0] || '').trim() || '-',
              responsable:    String(row[1] || '').trim() || '-',
              unidad:         String(row[2] || '').trim() || '-',
              cliente:        String(row[3] || '').trim() || '-',
              identificacion: String(row[4]),
              apellidos:      `${row[5] || ''} ${row[6] || ''}`.trim(),
              nombres:        `${row[7] || ''} ${row[8] || ''}`.trim(),
              nombreCompleto: `${row[7] || ''} ${row[8] || ''} ${row[5] || ''} ${row[6] || ''}`.trim(),
              cargo:          String(row[14] || '').trim() || '-',
              tipoContrato:   String(row[16] || '').trim() || '-',
              seguimiento:    String(row[18] || '').trim(),
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
