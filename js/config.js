// Configuración global de la aplicación
const CONFIG = {
    // Servidores DNS disponibles
    DNS_SERVERS: {
        google: {
            name: 'Google DNS',
            url: 'https://dns.google/resolve',
            ip: '8.8.8.8'
        },
        cloudflare: {
            name: 'Cloudflare DNS',
            url: 'https://cloudflare-dns.com/dns-query',
            ip: '1.1.1.1',
            headers: { 'Accept': 'application/dns-json' }
        },
        opendns: {
            name: 'OpenDNS',
            url: 'https://dns.opendns.com/dns-query',
            ip: '208.67.222.222'
        }
    },

    // Tipos de registros DNS
    RECORD_TYPES: ['A', 'AAAA', 'MX', 'NS', 'TXT', 'CNAME', 'SOA', 'CAA', 'PTR', 'SRV'],

    // Subdominios comunes para verificar
    COMMON_SUBDOMAINS: [
        'www', 'mail', 'ftp', 'webmail', 'smtp', 'pop', 'imap',
        'blog', 'shop', 'api', 'cdn', 'admin', 'portal', 'secure',
        'vpn', 'remote', 'test', 'dev', 'staging', 'app', 'm', 'mobile'
    ],

    // Configuración de caché
    CACHE_ENABLED: true,
    CACHE_TTL: 5 * 60 * 1000, // 5 minutos en ms
    MAX_CACHE_SIZE: 100, // Máximo número de entradas en caché

    // Configuración de historial
    MAX_HISTORY_ITEMS: 20,

    // Configuración de exportación
    EXPORT_FORMATS: ['json', 'csv', 'txt'],

    // Mensajes de la aplicación
    MESSAGES: {
        es: {
            // Mensajes principales
            searching: 'Buscando registros DNS...',
            noResults: 'No se encontraron registros DNS',
            error: 'Error al buscar registros DNS',
            copied: 'Copiado al portapapeles',
            exported: 'Archivo exportado exitosamente',
            invalidDomain: 'Por favor, ingresa un dominio válido',
            cacheCleared: 'Caché limpiado exitosamente',
            historyCleared: 'Historial limpiado exitosamente',
            favoriteAdded: 'Añadido a favoritos',
            favoriteRemoved: 'Eliminado de favoritos',
            notificationsEnabled: 'Notificaciones habilitadas',
            notificationsDenied: 'Notificaciones denegadas',
            languageChanged: 'Idioma cambiado exitosamente',
            
            // Elementos de interfaz
            searchButton: 'Buscar DNS',
            domainPlaceholder: 'ejemplo.com o https://ejemplo.com',
            singleSearch: 'Búsqueda Simple',
            batchSearch: 'Búsqueda en Lote',
            compareSearch: 'Comparar DNS',
            advancedOptions: 'Opciones Avanzadas',
            
            // Títulos y headers
            mainTitle: 'Analizador de Registros DNS',
            mainSubtitle: 'Consulta y analiza registros DNS con herramientas profesionales',
            batchTitle: 'Búsqueda en Lote',
            batchSubtitle: 'Analiza múltiples dominios simultáneamente',
            compareTitle: 'Comparar Dominios',
            compareSubtitle: 'Compara registros DNS entre dos dominios',
            
            // Botones y acciones
            clearButton: 'Limpiar',
            exportButton: 'Exportar',
            shareButton: 'Compartir',
            copyButton: 'Copiar',
            compareButton: 'Comparar Dominios',
            batchSearchButton: 'Buscar en Lote',
            importFile: 'Importar archivo',
            clearCache: 'Limpiar Caché',
            clearHistory: 'Limpiar Historial',
            
            // Labels de formularios
            dnsServer: 'Servidor DNS',
            recordTypes: 'Tipos de Registro',
            checkAll: 'Marcar todos',
            uncheckAll: 'Desmarcar todos',
            autoSubdomains: 'Verificar subdominios comunes',
            
            // Vistas
            cardsView: 'Vista de Tarjetas',
            tableView: 'Vista de Tabla',
            compactView: 'Vista Compacta',
            filterPlaceholder: 'Filtrar resultados...',
            
            // Configuración
            settingsTitle: 'Configuración',
            cacheSettings: 'Configuración de Caché',
            cacheEnabled: 'Habilitar caché',
            cacheTTL: 'TTL de caché (minutos)',
            notificationSettings: 'Notificaciones',
            enableNotifications: 'Habilitar notificaciones',
            
            // Favoritos e historial
            favoritesTitle: 'Dominios Favoritos',
            historyTitle: 'Historial de Búsquedas',
            noFavorites: 'No hay favoritos guardados',
            noHistory: 'No hay historial disponible'
        },
        en: {
            // Main messages
            searching: 'Searching DNS records...',
            noResults: 'No DNS records found',
            error: 'Error searching DNS records',
            copied: 'Copied to clipboard',
            exported: 'File exported successfully',
            invalidDomain: 'Please enter a valid domain',
            cacheCleared: 'Cache cleared successfully',
            historyCleared: 'History cleared successfully',
            favoriteAdded: 'Added to favorites',
            favoriteRemoved: 'Removed from favorites',
            notificationsEnabled: 'Notifications enabled',
            notificationsDenied: 'Notifications denied',
            languageChanged: 'Language changed successfully',
            
            // Interface elements
            searchButton: 'Search DNS',
            domainPlaceholder: 'example.com or https://example.com',
            singleSearch: 'Single Search',
            batchSearch: 'Batch Search',
            compareSearch: 'Compare DNS',
            advancedOptions: 'Advanced Options',
            
            // Titles and headers
            mainTitle: 'DNS Records Analyzer',
            mainSubtitle: 'Query and analyze DNS records with professional tools',
            batchTitle: 'Batch Search',
            batchSubtitle: 'Analyze multiple domains simultaneously',
            compareTitle: 'Compare Domains',
            compareSubtitle: 'Compare DNS records between two domains',
            
            // Buttons and actions
            clearButton: 'Clear',
            exportButton: 'Export',
            shareButton: 'Share',
            copyButton: 'Copy',
            compareButton: 'Compare Domains',
            batchSearchButton: 'Batch Search',
            importFile: 'Import file',
            clearCache: 'Clear Cache',
            clearHistory: 'Clear History',
            
            // Form labels
            dnsServer: 'DNS Server',
            recordTypes: 'Record Types',
            checkAll: 'Check all',
            uncheckAll: 'Uncheck all',
            autoSubdomains: 'Check common subdomains',
            
            // Views
            cardsView: 'Cards View',
            tableView: 'Table View',
            compactView: 'Compact View',
            filterPlaceholder: 'Filter results...',
            
            // Settings
            settingsTitle: 'Settings',
            cacheSettings: 'Cache Settings',
            cacheEnabled: 'Enable cache',
            cacheTTL: 'Cache TTL (minutes)',
            notificationSettings: 'Notifications',
            enableNotifications: 'Enable notifications',
            
            // Favorites and history
            favoritesTitle: 'Favorite Domains',
            historyTitle: 'Search History',
            noFavorites: 'No saved favorites',
            noHistory: 'No history available'
        }
    },

    // Información educativa sobre tipos de DNS (Español)
    DNS_INFO: {
        A: {
            title: 'Registro A (Address)',
            description: 'Mapea un nombre de dominio a una dirección IPv4',
            example: 'ejemplo.com → 93.184.216.34',
            use: 'Usado para dirigir el tráfico web a servidores'
        },
        AAAA: {
            title: 'Registro AAAA (IPv6 Address)',
            description: 'Mapea un nombre de dominio a una dirección IPv6',
            example: 'ejemplo.com → 2606:2800:220:1:248:1893:25c8:1946',
            use: 'Versión IPv6 del registro A'
        },
        MX: {
            title: 'Registro MX (Mail Exchange)',
            description: 'Especifica los servidores de correo para el dominio',
            example: '10 mail.ejemplo.com',
            use: 'Dirige los emails al servidor de correo correcto'
        },
        NS: {
            title: 'Registro NS (Name Server)',
            description: 'Indica qué servidores DNS son autoritativos para el dominio',
            example: 'ns1.ejemplo.com',
            use: 'Delega la autoridad DNS a otros servidores'
        },
        TXT: {
            title: 'Registro TXT (Text)',
            description: 'Contiene información de texto arbitraria',
            example: 'v=spf1 include:_spf.google.com ~all',
            use: 'Verificación de dominio, SPF, DKIM, etc.'
        },
        CNAME: {
            title: 'Registro CNAME (Canonical Name)',
            description: 'Alias de un dominio a otro dominio',
            example: 'www.ejemplo.com → ejemplo.com',
            use: 'Crear alias para subdominios'
        },
        SOA: {
            title: 'Registro SOA (Start of Authority)',
            description: 'Información sobre la zona DNS y el servidor primario',
            example: 'ns1.ejemplo.com admin.ejemplo.com 2024010101',
            use: 'Define parámetros de la zona DNS'
        },
        CAA: {
            title: 'Registro CAA (Certification Authority Authorization)',
            description: 'Especifica qué CAs pueden emitir certificados SSL',
            example: '0 issue "letsencrypt.org"',
            use: 'Control de emisión de certificados SSL'
        },
        PTR: {
            title: 'Registro PTR (Pointer)',
            description: 'Mapea una dirección IP a un nombre de dominio (DNS inverso)',
            example: '34.216.184.93.in-addr.arpa → ejemplo.com',
            use: 'Verificación de identidad del servidor'
        },
        SRV: {
            title: 'Registro SRV (Service)',
            description: 'Define ubicación de servicios específicos',
            example: '_sip._tcp.ejemplo.com',
            use: 'Localizar servicios como VoIP, chat, etc.'
        }
    },
    
    // Información educativa sobre tipos de DNS (English)
    DNS_INFO_EN: {
        A: {
            title: 'A Record (Address)',
            description: 'Maps a domain name to an IPv4 address',
            example: 'example.com → 93.184.216.34',
            use: 'Used to direct web traffic to servers'
        },
        AAAA: {
            title: 'AAAA Record (IPv6 Address)',
            description: 'Maps a domain name to an IPv6 address',
            example: 'example.com → 2606:2800:220:1:248:1893:25c8:1946',
            use: 'IPv6 version of A record'
        },
        MX: {
            title: 'MX Record (Mail Exchange)',
            description: 'Specifies mail servers for the domain',
            example: '10 mail.example.com',
            use: 'Direct emails to the correct mail servers'
        },
        NS: {
            title: 'NS Record (Name Server)',
            description: 'Specifies authoritative name servers',
            example: 'ns1.example.com',
            use: 'Delegates DNS zone control'
        },
        TXT: {
            title: 'TXT Record (Text)',
            description: 'Contains text information',
            example: 'v=spf1 include:_spf.google.com ~all',
            use: 'SPF, DKIM, domain verification'
        },
        CNAME: {
            title: 'CNAME Record (Canonical Name)',
            description: 'Creates an alias for another domain',
            example: 'www.example.com → example.com',
            use: 'Redirect subdomains to main domain'
        },
        SOA: {
            title: 'SOA Record (Start of Authority)',
            description: 'Contains administrative information',
            example: 'ns1.example.com admin.example.com 2024010101',
            use: 'Defines DNS zone parameters'
        },
        CAA: {
            title: 'CAA Record (Certification Authority Authorization)',
            description: 'Specifies which CAs can issue SSL certificates',
            example: '0 issue "letsencrypt.org"',
            use: 'SSL certificate issuance control'
        },
        PTR: {
            title: 'PTR Record (Pointer)',
            description: 'Maps an IP address to a domain name (reverse DNS)',
            example: '34.216.184.93.in-addr.arpa → example.com',
            use: 'Server identity verification'
        },
        SRV: {
            title: 'SRV Record (Service)',
            description: 'Defines location of specific services',
            example: '_sip._tcp.example.com',
            use: 'Locate services like VoIP, chat, etc.'
        }
    },

    // Atajos de teclado
    KEYBOARD_SHORTCUTS: {
        'Ctrl+K': 'focusSearch',
        'Ctrl+/': 'showHelp',
        'Ctrl+E': 'exportResults',
        'Ctrl+D': 'toggleTheme',
        'Ctrl+H': 'showHistory',
        'Ctrl+B': 'showFavorites',
        'Escape': 'clearResults'
    },

    // Configuración de temas
    THEMES: {
        dark: {
            name: 'Modo Oscuro',
            class: 'dark-theme'
        },
        light: {
            name: 'Modo Claro',
            class: 'light-theme'
        }
    }
};

// Hacer CONFIG disponible globalmente
window.CONFIG = CONFIG;
