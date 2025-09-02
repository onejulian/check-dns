# 🌐 DNS Inspector Pro

Una herramienta profesional y completa para consultar, analizar y gestionar registros DNS con funcionalidades avanzadas.

## ✨ Características Principales

### 🔍 Búsqueda y Consulta
- **Búsqueda Simple**: Consulta registros DNS de cualquier dominio
- **Búsqueda en Lote**: Analiza múltiples dominios simultáneamente
- **Comparación de Dominios**: Compara registros DNS entre dos dominios
- **Limpieza Automática de URLs**: Extrae automáticamente el dominio de URLs completas
- **Validación de Dominios**: Valida el formato antes de realizar consultas

### 📊 Tipos de Registros Soportados
- **A** - Direcciones IPv4
- **AAAA** - Direcciones IPv6
- **MX** - Servidores de correo
- **NS** - Servidores de nombres
- **TXT** - Registros de texto (SPF, DKIM, etc.)
- **CNAME** - Alias de dominio
- **SOA** - Start of Authority
- **CAA** - Certificate Authority Authorization
- **PTR** - Reverse DNS
- **SRV** - Registros de servicios

### 🎨 Interfaz de Usuario
- **Modo Oscuro/Claro**: Toggle entre temas con persistencia
- **3 Vistas de Resultados**: Tarjetas, Tabla y Compacta
- **Diseño Responsive**: Optimizado para móvil y escritorio
- **Animaciones Suaves**: Transiciones y efectos visuales
- **Tooltips Educativos**: Información sobre cada tipo de registro

### 💾 Gestión de Datos
- **Sistema de Caché**: Caché inteligente con TTL configurable
- **Historial de Búsquedas**: Las últimas 20 búsquedas con autocompletado
- **Favoritos**: Guarda dominios frecuentemente consultados
- **Exportación**: JSON, CSV y TXT
- **Importación**: Carga listas de dominios desde archivos

### 🚀 Funcionalidades Avanzadas
- **Comparación de Servidores DNS**: Google, Cloudflare, OpenDNS
- **Verificación de Propagación**: Estado de propagación global
- **Análisis de Salud DNS**: Detecta problemas de configuración
- **Búsqueda de Subdominios**: Verifica subdominios comunes automáticamente
- **Filtrado de Resultados**: Búsqueda en tiempo real en los resultados

### ⚡ Optimizaciones
- **Progressive Web App (PWA)**: Instalable y funciona offline
- **Service Worker**: Caché de recursos y sincronización en background
- **Lazy Loading**: Carga diferida de recursos
- **Debounce/Throttle**: Optimización de eventos

### ⌨️ Atajos de Teclado
- `Ctrl/Cmd + K`: Enfocar búsqueda
- `Ctrl/Cmd + D`: Cambiar tema
- `Ctrl/Cmd + E`: Exportar resultados
- `Escape`: Limpiar resultados
- `Enter`: Ejecutar búsqueda

## 🛠️ Instalación

### Opción 1: Usar directamente
Simplemente abre el archivo `index.html` en tu navegador.

### Opción 2: Servidor local
```bash
# Con Python 3
python -m http.server 8000

# Con Node.js
npx http-server

# Con PHP
php -S localhost:8000
```

### Opción 3: Instalar como PWA
1. Abre la aplicación en Chrome/Edge
2. Haz clic en el botón "Instalar App" o en el icono de instalación en la barra de direcciones
3. La aplicación se instalará y estará disponible como una app nativa

## 📁 Estructura del Proyecto

```
dns-inspector-pro/
├── index.html          # Archivo HTML principal
├── styles.css          # Estilos personalizados
├── manifest.json       # Configuración PWA
├── sw.js              # Service Worker
├── js/
│   ├── config.js      # Configuración global
│   ├── utils.js       # Utilidades generales
│   ├── storage.js     # Gestión de almacenamiento
│   ├── dns-lookup.js  # Lógica de consultas DNS
│   ├── ui.js          # Gestión de interfaz
│   └── app.js         # Aplicación principal
└── icons/             # Iconos de la PWA (crear si es necesario)
```

## 🔧 Configuración

La aplicación incluye un panel de configuración accesible desde el icono de engranaje:

- **Caché**: Habilitar/deshabilitar y configurar TTL
- **Subdominios**: Búsqueda automática de subdominios comunes
- **Notificaciones**: Activar notificaciones de escritorio
- **Idioma**: Español/Inglés
- **Vista por defecto**: Tarjetas/Tabla/Compacta

## 🌍 Servidores DNS Soportados

- **Google DNS** (8.8.8.8)
- **Cloudflare DNS** (1.1.1.1)
- **OpenDNS** (208.67.222.222)

## 📝 Casos de Uso

### Para Desarrolladores
- Verificar configuración DNS antes de lanzar un sitio
- Depurar problemas de resolución DNS
- Comparar configuraciones entre ambientes

### Para Administradores de Sistemas
- Monitorear propagación de cambios DNS
- Auditar configuraciones de seguridad (SPF, DMARC)
- Gestionar múltiples dominios

### Para Profesionales de Marketing
- Verificar configuración de email marketing
- Comprobar subdominios de campañas
- Exportar reportes para clientes

## 🔒 Privacidad y Seguridad

- **Sin servidor backend**: Todas las consultas se realizan directamente desde el navegador
- **Datos locales**: Todo se almacena en localStorage del navegador
- **HTTPS**: Las consultas DNS se realizan sobre HTTPS
- **Sin tracking**: No se recopilan datos de usuario

## 🚀 Mejoras Futuras Planificadas

- [ ] Integración con APIs de WHOIS
- [ ] Monitoreo automático de cambios
- [ ] Notificaciones de expiración de dominios
- [ ] Gráficos de tiempo de respuesta
- [ ] Integración con servicios de DNS dinámico
- [ ] API REST para automatización
- [ ] Extensión de navegador

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo licencia MIT. Ver archivo LICENSE para más detalles.

## 👨‍💻 Autor

Desarrollado con ❤️ por [Tu Nombre]

## 🙏 Agradecimientos

- Google DNS API
- Cloudflare DNS API
- Tailwind CSS
- Font Awesome

---

**DNS Inspector Pro** - La herramienta definitiva para gestión y análisis de DNS 🚀
