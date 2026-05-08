# Informes de Contratacion ADP/ERW

Aplicacion web interna para generar estadisticas de contratacion a partir del archivo Excel CONTROL ING Y RET.

El flujo actual esta pensado para que el usuario cargue el archivo manualmente y obtenga de inmediato indicadores y detalle operativo para seguimiento de contrataciones.

## Objetivo

Entregar una herramienta simple para consulta de informes por parte de jefatura (Eduard, Ricardo y William), con foco en fechas clave del proceso:

- F. RECIBIDO SOLICITUD
- F. EXAMENES INGRESO
- F. FIRMA CONTRATO

## Alcance funcional actual

- Carga de archivo .xlsx/.xls via drag and drop.
- Lectura de la hoja INGRESOS (si existe; en caso contrario usa la primera hoja).
- Normalizacion de datos y conversion de fechas de Excel a fecha real.
- KPIs principales:
  - Total de contrataciones.
  - Procesos completos.
  - Promedio Solicitud -> Examenes Ingreso.
  - Promedio Examenes Ingreso -> Firma.
  - Promedio total Solicitud -> Firma.
- Filtros por:
  - Rango de fecha recibido solicitud.
  - Unidad.
  - Responsable.
- Tabla de detalle con:
  - Busqueda por nombre, cargo, cliente o identificacion.
  - Ordenamiento por columnas clave.
  - Paginacion.
  - Semaforo de tiempos (verde/amarillo/rojo).
- Exportacion a PDF usando impresion del navegador.

## Reglas de calculo

Se calculan diferencias en dias calendario:

- Solicitud -> Examenes = F. EXAMENES INGRESO - F. RECIBIDO SOLICITUD
- Examenes -> Firma = F. FIRMA CONTRATO - F. EXAMENES INGRESO
- Total = F. FIRMA CONTRATO - F. RECIBIDO SOLICITUD

Si falta alguna de las fechas requeridas para una resta, se muestra "-" en ese indicador puntual.

## Estructura del proyecto

```text
Informes contratacion - ERW/
├── public/
│   └── Logo syp.png
├── src/
│   ├── components/
│   │   ├── Filtros.jsx
│   │   ├── KPICards.jsx
│   │   ├── TablaDetalle.jsx
│   │   └── UploadSection.jsx
│   ├── utils/
│   │   ├── calcularMetricas.js
│   │   └── parseExcel.js
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── CONTROL ING Y RET.xlsx
├── index.html
├── package.json
└── vite.config.js
```

## Requisitos

- Node.js 18 o superior recomendado.
- npm 9 o superior.

## Instalacion y ejecucion

```bash
npm install
npm run dev
```

Compilacion de produccion:

```bash
npm run build
```

## Dependencias principales

- React
- Vite
- xlsx

## Consideraciones de datos

- La logica de lectura usa indices de columna (T, U, V para fechas), por lo que cambios de nombre de encabezado no rompen el calculo mientras se mantenga la posicion.
- Se recomienda mantener el formato de fechas y la estructura general de la hoja para evitar datos vacios o invalidos.

## Hoja de ruta sugerida

Primera fase (actual): carga manual de Excel en frontend.

Siguiente fase (opcional): integracion con Power Automate/OneDrive/endpoint API.

La arquitectura ya esta separada para facilitar migracion: la logica de procesamiento de registros se puede reutilizar cambiando solo la fuente de datos.

## Licencia

Uso interno de Solutions & Payroll.
