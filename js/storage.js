// Gestión de almacenamiento local (caché, historial, favoritos)

const Storage = {
    // Prefijos para las claves de localStorage
    KEYS: {
        CACHE: 'dns_cache_',
        HISTORY: 'dns_history',
        FAVORITES: 'dns_favorites',
        SETTINGS: 'dns_settings',
        THEME: 'dns_theme'
    },

    // === CACHÉ ===
    
    // Obtener del caché
    getFromCache(domain, recordTypes) {
        if (!CONFIG.CACHE_ENABLED) return null;
        
        const cacheKey = this.KEYS.CACHE + domain + '_' + recordTypes.join(',');
        const cached = localStorage.getItem(cacheKey);
        
        if (!cached) return null;
        
        try {
            const data = JSON.parse(cached);
            const now = Date.now();
            
            // Verificar si el caché ha expirado
            if (now - data.timestamp > CONFIG.CACHE_TTL) {
                localStorage.removeItem(cacheKey);
                return null;
            }
            
            return data.records;
        } catch (e) {
            console.error('Error al leer caché:', e);
            return null;
        }
    },

    // Guardar en caché
    saveToCache(domain, recordTypes, records) {
        if (!CONFIG.CACHE_ENABLED) return;
        
        const cacheKey = this.KEYS.CACHE + domain + '_' + recordTypes.join(',');
        const data = {
            timestamp: Date.now(),
            domain,
            recordTypes,
            records
        };
        
        try {
            localStorage.setItem(cacheKey, JSON.stringify(data));
            this.cleanOldCache();
        } catch (e) {
            console.error('Error al guardar en caché:', e);
            // Si localStorage está lleno, limpiar caché viejo
            if (e.name === 'QuotaExceededError') {
                this.clearCache();
            }
        }
    },

    // Limpiar caché viejo
    cleanOldCache() {
        const keys = Object.keys(localStorage);
        const cacheEntries = [];
        
        keys.forEach(key => {
            if (key.startsWith(this.KEYS.CACHE)) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    cacheEntries.push({ key, timestamp: data.timestamp });
                } catch (e) {
                    // Eliminar entrada corrupta
                    localStorage.removeItem(key);
                }
            }
        });
        
        // Si hay más entradas que el máximo permitido, eliminar las más viejas
        if (cacheEntries.length > CONFIG.MAX_CACHE_SIZE) {
            cacheEntries.sort((a, b) => a.timestamp - b.timestamp);
            const toRemove = cacheEntries.slice(0, cacheEntries.length - CONFIG.MAX_CACHE_SIZE);
            toRemove.forEach(entry => localStorage.removeItem(entry.key));
        }
    },

    // Limpiar todo el caché
    clearCache() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.KEYS.CACHE)) {
                localStorage.removeItem(key);
            }
        });
    },

    // === HISTORIAL ===
    
    // Obtener historial
    getHistory() {
        try {
            const history = localStorage.getItem(this.KEYS.HISTORY);
            return history ? JSON.parse(history) : [];
        } catch (e) {
            console.error('Error al leer historial:', e);
            return [];
        }
    },

    // Añadir al historial
    addToHistory(domain) {
        try {
            let history = this.getHistory();
            
            // Eliminar duplicados
            history = history.filter(item => item.domain !== domain);
            
            // Añadir al principio
            history.unshift({
                domain,
                timestamp: Date.now(),
                id: Utils.generateId()
            });
            
            // Limitar tamaño
            if (history.length > CONFIG.MAX_HISTORY_ITEMS) {
                history = history.slice(0, CONFIG.MAX_HISTORY_ITEMS);
            }
            
            localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(history));
            return history;
        } catch (e) {
            console.error('Error al guardar en historial:', e);
            return [];
        }
    },

    // Eliminar del historial
    removeFromHistory(id) {
        try {
            let history = this.getHistory();
            history = history.filter(item => item.id !== id);
            localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(history));
            return history;
        } catch (e) {
            console.error('Error al eliminar del historial:', e);
            return [];
        }
    },

    // Limpiar historial
    clearHistory() {
        localStorage.removeItem(this.KEYS.HISTORY);
    },

    // === FAVORITOS ===
    
    // Obtener favoritos
    getFavorites() {
        try {
            const favorites = localStorage.getItem(this.KEYS.FAVORITES);
            return favorites ? JSON.parse(favorites) : [];
        } catch (e) {
            console.error('Error al leer favoritos:', e);
            return [];
        }
    },

    // Añadir a favoritos
    addToFavorites(domain, name = null) {
        try {
            let favorites = this.getFavorites();
            
            // Verificar si ya existe
            if (favorites.some(fav => fav.domain === domain)) {
                return favorites;
            }
            
            favorites.push({
                domain,
                name: name || domain,
                timestamp: Date.now(),
                id: Utils.generateId()
            });
            
            localStorage.setItem(this.KEYS.FAVORITES, JSON.stringify(favorites));
            return favorites;
        } catch (e) {
            console.error('Error al añadir a favoritos:', e);
            return [];
        }
    },

    // Eliminar de favoritos
    removeFromFavorites(id) {
        try {
            let favorites = this.getFavorites();
            favorites = favorites.filter(fav => fav.id !== id);
            localStorage.setItem(this.KEYS.FAVORITES, JSON.stringify(favorites));
            return favorites;
        } catch (e) {
            console.error('Error al eliminar de favoritos:', e);
            return [];
        }
    },

    // Verificar si es favorito
    isFavorite(domain) {
        const favorites = this.getFavorites();
        return favorites.some(fav => fav.domain === domain);
    },

    // === CONFIGURACIÓN ===
    
    // Obtener configuración
    getSettings() {
        try {
            const settings = localStorage.getItem(this.KEYS.SETTINGS);
            return settings ? JSON.parse(settings) : this.getDefaultSettings();
        } catch (e) {
            console.error('Error al leer configuración:', e);
            return this.getDefaultSettings();
        }
    },

    // Configuración por defecto
    getDefaultSettings() {
        return {
            cacheEnabled: true,
            cacheTTL: 5,
            autoSubdomains: false,
            notifications: false,
            language: 'es',
            defaultView: 'cards',
            defaultServer: 'google',
            checkAllTypes: true
        };
    },

    // Guardar configuración
    saveSettings(settings) {
        try {
            localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
            
            // Aplicar configuración inmediatamente
            CONFIG.CACHE_ENABLED = settings.cacheEnabled;
            CONFIG.CACHE_TTL = settings.cacheTTL * 60 * 1000;
            
            return true;
        } catch (e) {
            console.error('Error al guardar configuración:', e);
            return false;
        }
    },

    // Obtener una configuración específica
    getSetting(key) {
        const settings = this.getSettings();
        return settings[key];
    },

    // Actualizar una configuración específica
    updateSetting(key, value) {
        const settings = this.getSettings();
        settings[key] = value;
        return this.saveSettings(settings);
    },

    // === TEMA ===
    
    // Obtener tema actual
    getTheme() {
        return localStorage.getItem(this.KEYS.THEME) || 'dark';
    },

    // Guardar tema
    setTheme(theme) {
        localStorage.setItem(this.KEYS.THEME, theme);
        this.applyTheme(theme);
    },

    // Aplicar tema
    applyTheme(theme) {
        const root = document.documentElement;
        const body = document.body;
        
        // Establecer el tema usando data-theme
        root.setAttribute('data-theme', theme);
        
        // Actualizar clases de Tailwind para el tema
        if (theme === 'light') {
            // Remover clases oscuras y añadir clases claras
            body.classList.remove('bg-gray-900', 'text-white');
            body.classList.add('bg-white', 'text-gray-900');
            
            // Actualizar otros elementos con clases dinámicas
            this.updateElementClasses(theme);
        } else {
            // Remover clases claras y añadir clases oscuras
            body.classList.remove('bg-white', 'text-gray-900');
            body.classList.add('bg-gray-900', 'text-white');
            
            // Actualizar otros elementos con clases dinámicas
            this.updateElementClasses(theme);
        }
        
        // Actualizar meta theme-color
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.content = theme === 'light' ? '#ffffff' : '#1e293b';
        }
    },
    
    // Actualizar clases de elementos según el tema
    updateElementClasses(theme) {
        const updates = {
            light: {
                header: 'bg-white/90 border-gray-200',
                input: 'bg-gray-50 border-gray-300 text-gray-900',
                button: 'bg-gray-100 hover:bg-gray-200',
                card: 'bg-white border-gray-200',
                modal: 'bg-white',
                dropdown: 'bg-white',
                badge: 'bg-gray-100',
                table: 'bg-white'
            },
            dark: {
                header: 'bg-gray-900/90 border-gray-700',
                input: 'bg-gray-800 border-gray-700 text-white',
                button: 'bg-gray-800 hover:bg-gray-700',
                card: 'bg-gray-800 border-gray-700',
                modal: 'bg-gray-800',
                dropdown: 'bg-gray-800',
                badge: 'bg-gray-800',
                table: 'bg-gray-800'
            }
        };
        
        const classes = updates[theme];
        
        // Actualizar header
        const header = document.querySelector('header');
        if (header) {
            header.className = header.className.replace(/bg-\S+\/90|border-\S+/g, '');
            header.classList.add(...classes.header.split(' '));
        }
        
        // Actualizar inputs
        document.querySelectorAll('input[type="text"], textarea, select').forEach(el => {
            if (!el.classList.contains('toggle-switch')) {
                el.className = el.className.replace(/bg-gray-\d+|border-gray-\d+|text-\S+/g, '');
                el.classList.add(...classes.input.split(' '));
            }
        });
        
        // Actualizar botones de configuración
        document.querySelectorAll('#themeToggle, #settingsBtn, .tab-btn, .view-btn').forEach(el => {
            el.className = el.className.replace(/bg-gray-\d+|hover:bg-gray-\d+/g, '');
            el.classList.add(...classes.button.split(' '));
        });
        
        // Actualizar modales
        document.querySelectorAll('#settingsModal > div > div').forEach(el => {
            el.className = el.className.replace(/bg-gray-\d+/g, '');
            el.classList.add(...classes.modal.split(' '));
        });
        
        // Actualizar dropdowns
        document.querySelectorAll('#historyDropdown, #dnsTooltip').forEach(el => {
            el.className = el.className.replace(/bg-gray-\d+/g, '');
            el.classList.add(...classes.dropdown.split(' '));
        });
        
        // Actualizar tablas
        document.querySelectorAll('.dns-table, table').forEach(el => {
            el.className = el.className.replace(/bg-gray-\d+/g, '');
            el.classList.add(...classes.table.split(' '));
        });
    },

    // Toggle tema
    toggleTheme() {
        const currentTheme = this.getTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        return newTheme;
    },

    // === ESTADÍSTICAS ===
    
    // Obtener estadísticas de uso
    getStats() {
        const history = this.getHistory();
        const favorites = this.getFavorites();
        const cacheSize = Object.keys(localStorage).filter(k => k.startsWith(this.KEYS.CACHE)).length;
        
        // Dominios más consultados
        const domainCounts = {};
        history.forEach(item => {
            domainCounts[item.domain] = (domainCounts[item.domain] || 0) + 1;
        });
        
        const topDomains = Object.entries(domainCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([domain, count]) => ({ domain, count }));
        
        return {
            totalSearches: history.length,
            favoritesCount: favorites.length,
            cacheSize,
            topDomains,
            lastSearch: history[0] || null
        };
    },

    // === IMPORTAR/EXPORTAR ===
    
    // Exportar todos los datos
    exportData() {
        const data = {
            version: '1.0',
            timestamp: Date.now(),
            history: this.getHistory(),
            favorites: this.getFavorites(),
            settings: this.getSettings(),
            theme: this.getTheme()
        };
        
        return JSON.stringify(data, null, 2);
    },

    // Importar datos
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            // Validar estructura
            if (!data.version || !data.timestamp) {
                throw new Error('Formato de datos inválido');
            }
            
            // Importar cada sección
            if (data.history) {
                localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(data.history));
            }
            if (data.favorites) {
                localStorage.setItem(this.KEYS.FAVORITES, JSON.stringify(data.favorites));
            }
            if (data.settings) {
                this.saveSettings(data.settings);
            }
            if (data.theme) {
                this.setTheme(data.theme);
            }
            
            return true;
        } catch (e) {
            console.error('Error al importar datos:', e);
            return false;
        }
    }
};

// Hacer Storage disponible globalmente
window.Storage = Storage;
