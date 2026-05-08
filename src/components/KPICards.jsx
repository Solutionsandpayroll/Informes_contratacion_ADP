function KPICard({ icon, value, label, sublabel, variant }) {
  return (
    <div className={`kpi-card kpi-${variant}`}>
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-body">
        <div className="kpi-value">{value ?? '-'}</div>
        <div className="kpi-label">{label}</div>
        {sublabel && <div className="kpi-sublabel">{sublabel}</div>}
      </div>
    </div>
  )
}

export default function KPICards({ metricas }) {
  return (
    <div className="kpi-grid">
      <KPICard
        variant="primary"
        icon={
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        }
        value={metricas.total}
        label="Total Contrataciones"
        sublabel={`${metricas.procesosCompletos} con proceso completo`}
      />
      <KPICard
        variant="info"
        icon={
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        }
        value={
          metricas.promedioRecibidoExamenes !== null
            ? `${metricas.promedioRecibidoExamenes} días`
            : '-'
        }
        label="Solicitud → Exámenes Ingreso"
        sublabel="Tiempo promedio"
      />
      <KPICard
        variant="success"
        icon={
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        }
        value={
          metricas.promedioExamenesFirma !== null
            ? `${metricas.promedioExamenesFirma} días`
            : '-'
        }
        label="Exámenes Ingreso → Firma"
        sublabel="Tiempo promedio"
      />
      <KPICard
        variant="warning"
        icon={
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        }
        value={
          metricas.promedioTotal !== null ? `${metricas.promedioTotal} días` : '-'
        }
        label="Proceso Total"
        sublabel="Solicitud → Firma Contrato"
      />
    </div>
  )
}
