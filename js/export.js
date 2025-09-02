// Módulo de exportación de datos (opcional, ya incluido en dns-lookup.js)
// Este archivo es adicional por si se quiere extender la funcionalidad de exportación

const Export = {
    // Exportar configuración completa de la app
    exportAppConfig() {
        const config = {
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            settings: Storage.getSettings(),
            favorites: Storage.getFavorites(),
            history: Storage.getHistory(),
            theme: Storage.getTheme()
        };
        
        const json = JSON.stringify(config, null, 2);
        Utils.downloadFile(json, `dns_inspector_config_${Date.now()}.json`, 'application/json');
    },
    
    // Importar configuración
    async importAppConfig(file) {
        try {
            const text = await file.text();
            const config = JSON.parse(text);
            
            // Validar estructura
            if (!config.version || !config.timestamp) {
                throw new Error('Archivo de configuración inválido');
            }
            
            // Aplicar configuración
            if (config.settings) Storage.saveSettings(config.settings);
            if (config.favorites) localStorage.setItem('dns_favorites', JSON.stringify(config.favorites));
            if (config.history) localStorage.setItem('dns_history', JSON.stringify(config.history));
            if (config.theme) Storage.setTheme(config.theme);
            
            return true;
        } catch (error) {
            console.error('Error al importar configuración:', error);
            return false;
        }
    }
};

// Hacer Export disponible globalmente
window.Export = Export;
