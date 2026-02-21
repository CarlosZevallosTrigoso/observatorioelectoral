# Observatorio Electoral · Perú 2026

Dashboard interactivo para seguimiento de encuestas electorales.

## 🚀 Configuración inicial

### 1. Configura Google Sheets como fuente de datos

1. Sube el archivo `plantilla_encuestas.xlsx` a Google Drive
2. Ábrelo con Google Sheets
3. Ve a **Archivo → Compartir → Publicar en la web**
4. Selecciona la hoja "Encuestas" y formato **CSV**
5. Haz clic en **Publicar**
6. Copia la URL generada

### 2. Configura el proyecto

1. Abre `src/App.jsx`
2. Busca la línea `GOOGLE_SHEET_CSV_URL`
3. Reemplaza la URL con la tuya:

```javascript
const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/TU_ID/pub?output=csv';
```

### 3. Configura el nombre del repositorio

1. Abre `vite.config.js`
2. Cambia `base` al nombre de tu repositorio:

```javascript
base: '/tu-nombre-de-repo/',
```

## 📦 Instalación local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build
```

## 🌐 Publicar en GitHub Pages

### Opción A: Deploy automático (recomendado)

1. Sube el proyecto a GitHub
2. Ve a **Settings → Pages**
3. En "Source", selecciona **GitHub Actions**
4. Cada vez que hagas push a `main`, se desplegará automáticamente

### Opción B: Deploy manual

```bash
npm run build
# Sube el contenido de /dist a la rama gh-pages
```

## 📊 Agregar nuevas encuestas

Solo agrega filas en tu Google Sheet con el formato:

| Encuestadora | Periodo | Candidato | Valor |
|--------------|---------|-----------|-------|
| DATUM | Mar 2026 | Rafael López Aliaga | 12.5 |
| DATUM | Mar 2026 | Keiko Fujimori | 9.0 |

La web se actualiza automáticamente al recargar.

## 🎨 Personalización

### Colores de encuestadoras
Edita `pollsterColors` en `src/App.jsx`:

```javascript
const pollsterColors = {
  'DATUM': '#3b82f6',
  'CPI': '#ef4444',
  // Agrega más...
};
```

### Colores de candidatos
Edita `candidateColors` en `src/App.jsx`:

```javascript
const candidateColors = {
  'Rafael López Aliaga': '#1e40af',
  // Agrega más...
};
```

### Partidos políticos
Edita `parties` en `src/App.jsx` para mostrar el partido de cada candidato.

## 📁 Estructura

```
observatorio-electoral/
├── src/
│   ├── App.jsx          # Componente principal
│   ├── main.jsx         # Punto de entrada
│   └── index.css        # Estilos
├── .github/
│   └── workflows/
│       └── deploy.yml   # Deploy automático
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 📝 Licencia

MIT
