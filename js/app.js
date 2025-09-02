// Aplicación principal - DNS Inspector Pro

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar módulos
    UI.init();
    
    // Verificar parámetros de URL
    checkURLParams();
    
    // Solicitar permisos de notificación si está habilitado
    if (Storage.getSetting('notifications')) {
        requestNotificationPermission();
    }
    
    // Registrar Service Worker para PWA
    registerServiceWorker();
    
    // Mostrar mensaje de bienvenida si es primera vez
    checkFirstVisit();
    
    console.log('DNS Inspector Pro iniciado correctamente');
});

// Verificar parámetros de URL
function checkURLParams() {
    const params = new URLSearchParams(window.location.search);
    const domain = params.get('domain');
    
    if (domain && UI.elements.domainInput) {
        // Auto-buscar si viene un dominio en la URL
        UI.elements.domainInput.value = domain;
        setTimeout(() => UI.handleSearch(), 500);
    }
}

// Solicitar permisos de notificación
async function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            UI.showToast('Notificaciones habilitadas', 'success');
            Storage.updateSetting('notifications', true);
        } else {
            Storage.updateSetting('notifications', false);
        }
    }
}

// Registrar Service Worker
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('sw.js');
            console.log('Service Worker registrado:', registration);
            
            // Verificar actualizaciones
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // Nueva versión disponible
                        UI.showToast('Nueva versión disponible. Recarga para actualizar.', 'info');
                    }
                });
            });
        } catch (error) {
            console.error('Error al registrar Service Worker:', error);
        }
    }
}

// Verificar primera visita
function checkFirstVisit() {
    const hasVisited = localStorage.getItem('dns_has_visited');
    
    if (!hasVisited) {
        // Mostrar tutorial o tips
        setTimeout(() => {
            UI.showToast('💡 Tip: Presiona Ctrl+K para enfocar la búsqueda', 'info');
        }, 2000);
        
        localStorage.setItem('dns_has_visited', 'true');
    }
}

// Manejar errores globales
window.addEventListener('error', (event) => {
    console.error('Error global:', event.error);
    
    // Enviar error a servicio de tracking si está configurado
    if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
            description: event.error.message,
            fatal: false
        });
    }
});

// Manejar promesas rechazadas
window.addEventListener('unhandledrejection', (event) => {
    console.error('Promesa rechazada:', event.reason);
    
    // Mostrar error al usuario si es relevante
    if (event.reason && event.reason.message) {
        UI.showError('Error inesperado: ' + event.reason.message);
    }
});

// Detectar conexión offline/online
window.addEventListener('online', () => {
    UI.showToast('Conexión restaurada', 'success');
});

window.addEventListener('offline', () => {
    UI.showToast('Sin conexión a Internet', 'error');
});

// Prevenir cierre accidental si hay búsqueda en progreso
window.addEventListener('beforeunload', (event) => {
    if (DNSLookup.isSearching) {
        event.preventDefault();
        event.returnValue = 'Hay una búsqueda en progreso. ¿Estás seguro de que quieres salir?';
    }
});

// Detectar cambios de visibilidad de la página
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pausar animaciones o procesos costosos
        console.log('Página oculta');
    } else {
        // Reanudar si es necesario
        console.log('Página visible');
    }
});

// Manejar instalación de PWA
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevenir el prompt automático
    e.preventDefault();
    deferredPrompt = e;
    
    // Mostrar botón de instalación personalizado
    showInstallButton();
});

function showInstallButton() {
    // Crear botón de instalación si no existe
    if (!document.getElementById('installPWA')) {
        const button = document.createElement('button');
        button.id = 'installPWA';
        button.className = 'fixed bottom-20 right-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-lg transition z-30';
        button.innerHTML = '<i class="fas fa-download mr-2"></i>Instalar App';
        button.addEventListener('click', installPWA);
        document.body.appendChild(button);
    }
}

async function installPWA() {
    if (!deferredPrompt) return;
    
    // Mostrar prompt de instalación
    deferredPrompt.prompt();
    
    // Esperar respuesta del usuario
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
        UI.showToast('Aplicación instalada exitosamente', 'success');
        
        // Ocultar botón de instalación
        const button = document.getElementById('installPWA');
        if (button) button.remove();
    }
    
    deferredPrompt = null;
}

// Detectar si la app fue instalada
window.addEventListener('appinstalled', () => {
    console.log('PWA instalada');
    
    // Enviar evento de analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'app_installed');
    }
});

// Funciones de utilidad global
window.App = {
    version: '1.0.0',
    
    // Obtener estadísticas de uso
    getStats() {
        return Storage.getStats();
    },
    
    // Exportar toda la configuración
    exportConfig() {
        const data = Storage.exportData();
        Utils.downloadFile(data, `dns_inspector_backup_${Date.now()}.json`, 'application/json');
        UI.showToast('Configuración exportada', 'success');
    },
    
    // Importar configuración
    async importConfig(file) {
        try {
            const text = await file.text();
            const success = Storage.importData(text);
            
            if (success) {
                UI.showToast('Configuración importada exitosamente', 'success');
                // Recargar página para aplicar cambios
                setTimeout(() => window.location.reload(), 1000);
            } else {
                UI.showToast('Error al importar configuración', 'error');
            }
        } catch (error) {
            console.error('Error al importar:', error);
            UI.showToast('Error al importar archivo', 'error');
        }
    },
    
    // Limpiar todos los datos
    clearAllData() {
        if (confirm('¿Estás seguro de que quieres eliminar todos los datos guardados?')) {
            localStorage.clear();
            UI.showToast('Todos los datos han sido eliminados', 'info');
            setTimeout(() => window.location.reload(), 1000);
        }
    },
    
    // Modo debug
    enableDebug() {
        window.DEBUG = true;
        console.log('Modo debug activado');
        
        // Mostrar información adicional
        console.log('Configuración:', Storage.getSettings());
        console.log('Estadísticas:', Storage.getStats());
        console.log('Tema actual:', Storage.getTheme());
    }
};

// Exponer API pública para extensiones o scripts externos
window.DNSInspectorAPI = {
    lookup: (domain, options) => DNSLookup.lookup(domain, options),
    batchLookup: (domains, options) => DNSLookup.batchLookup(domains, options),
    compareServers: (domain) => DNSLookup.compareServers(domain),
    checkPropagation: (domain, type) => DNSLookup.checkPropagation(domain, type),
    exportResults: (format) => DNSLookup.exportResults(format),
    getConfig: () => CONFIG,
    getStats: () => Storage.getStats()
};
