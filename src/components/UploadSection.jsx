import { useState, useRef } from 'react'

export default function UploadSection({ onFile, loading, error }) {
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else if (e.type === 'dragleave') setDragActive(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) onFile(file)
  }

  const handleChange = (e) => {
    const file = e.target.files[0]
    if (file) onFile(file)
  }

  return (
    <div className="card" style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div className="card-header">
        <h2>Cargar Archivo de Contrataciones</h2>
        <p className="description">
          Sube el archivo <strong>CONTROL ING Y RET.xlsx</strong> para generar
          los informes de Eduard, Ricardo y William.
        </p>
      </div>
      <div className="card-body">
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="file-input"
          onChange={handleChange}
        />
        <div
          className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          {loading ? (
            <div className="drop-zone-content">
              <svg
                className="spinner"
                width="52"
                height="52"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              <div className="drop-zone-text">
                <span className="drop-zone-title">Procesando archivo…</span>
                <span className="drop-zone-subtitle">Un momento por favor</span>
              </div>
            </div>
          ) : (
            <div className="drop-zone-content">
              <svg
                width="52"
                height="52"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <polyline points="9 15 12 12 15 15" />
              </svg>
              <div className="drop-zone-text">
                <span className="drop-zone-title">
                  {dragActive
                    ? 'Suelta el archivo aquí'
                    : 'Arrastra el archivo Excel aquí'}
                </span>
                <span className="drop-zone-subtitle">
                  o haz clic para seleccionarlo
                </span>
              </div>
              <span className="drop-zone-hint">Formatos aceptados: .xlsx, .xls</span>
            </div>
          )}
        </div>

        {error && (
          <div className="upload-error">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
