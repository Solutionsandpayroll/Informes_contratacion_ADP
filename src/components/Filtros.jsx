export default function Filtros({ filtros, onChange, unidades, responsables }) {
  const set = (field, value) => onChange((prev) => ({ ...prev, [field]: value }))

  const limpiar = () =>
    onChange({ fechaDesde: '', fechaHasta: '', unidad: '', responsable: '' })

  const hayFiltros = Object.values(filtros).some((v) => v !== '')

  return (
    <div className="card filtros-bar no-print">
      <div className="card-body" style={{ padding: '1.25rem 2rem' }}>
        <div className="filtros-header">
          <div className="filtros-titulo">
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span>Filtros</span>
          </div>
          {hayFiltros && (
            <button className="btn-limpiar" onClick={limpiar}>
              Limpiar filtros
            </button>
          )}
        </div>
        <div className="filtros-grid">
          <div className="form-group">
            <label className="label">Fecha recibido desde</label>
            <input
              type="date"
              className="select-input"
              value={filtros.fechaDesde}
              onChange={(e) => set('fechaDesde', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="label">Fecha recibido hasta</label>
            <input
              type="date"
              className="select-input"
              value={filtros.fechaHasta}
              onChange={(e) => set('fechaHasta', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="label">Unidad</label>
            <select
              className="select-input"
              value={filtros.unidad}
              onChange={(e) => set('unidad', e.target.value)}
            >
              <option value="">Todas las unidades</option>
              {unidades.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Responsable</label>
            <select
              className="select-input"
              value={filtros.responsable}
              onChange={(e) => set('responsable', e.target.value)}
            >
              <option value="">Todos los responsables</option>
              {responsables.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
