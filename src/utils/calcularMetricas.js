function avg(nums) {
  const valid = nums.filter((n) => n !== null && n !== undefined && n >= 0)
  if (!valid.length) return null
  return Math.round(valid.reduce((s, n) => s + n, 0) / valid.length)
}

export function calcularMetricas(registros) {
  return {
    total: registros.length,
    procesosCompletos: registros.filter(
      (r) => r.fechaRecibido && r.fechaExamenes && r.fechaFirma
    ).length,
    promedioRecibidoExamenes: avg(registros.map((r) => r.diasRecibidoExamenes)),
    promedioExamenesFirma:    avg(registros.map((r) => r.diasExamenesFirma)),
    promedioTotal:            avg(registros.map((r) => r.diasTotal)),
    porUnidad: registros.reduce((acc, r) => {
      acc[r.unidad] = (acc[r.unidad] || 0) + 1
      return acc
    }, {}),
  }
}
