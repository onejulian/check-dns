// Service Worker para DNS Inspector Pro

const CACHE_NAME = 'dns-inspector-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/js/config.js',
    '/js/utils.js',
    '/js/storage.js',
    '/js/dns-lookup.js',
    '/js/ui.js',
    '/js/app.js',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
    console.log('[SW] Instalando Service Worker...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Cacheando archivos...');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('[SW] Instalación completada');
                self.skipWaiting(); // Activar inmediatamente
            })
            .catch((error) => {
                console.error('[SW] Error durante instalación:', error);
            })
    );
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
    console.log('[SW] Activando Service Worker...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Eliminar cachés antiguos
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Eliminando caché antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[SW] Activación completada');
            return self.clients.claim(); // Tomar control inmediatamente
        })
    );
});

// Interceptar peticiones
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Solo cachear peticiones GET
    if (request.method !== 'GET') {
        return;
    }
    
    // Estrategia: Network First para API, Cache First para recursos estáticos
    if (url.hostname.includes('dns.google') || 
        url.hostname.includes('cloudflare-dns.com') || 
        url.hostname.includes('dns.opendns.com')) {
        // API calls - Network First
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Clonar la respuesta antes de usarla
                    const responseToCache = response.clone();
                    
                    // Guardar en caché si es exitosa
                    if (response.status === 200) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseToCache);
                        });
                    }
                    
                    return response;
                })
                .catch(() => {
                    // Si falla la red, intentar desde caché
                    return caches.match(request);
                })
        );
    } else {
        // Recursos estáticos - Cache First
        event.respondWith(
            caches.match(request)
                .then((response) => {
                    if (response) {
                        // Encontrado en caché
                        return response;
                    }
                    
                    // No está en caché, buscar en la red
                    return fetch(request).then((response) => {
                        // Verificar si es una respuesta válida
                        if (!response || response.status !== 200) {
                            return response;
                        }
                        
                        // Solo cachear respuestas del mismo origen o CORS válidas
                        if (response.type === 'basic' || response.type === 'cors') {
                            // Clonar la respuesta
                            const responseToCache = response.clone();
                            
                            // Guardar en caché
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(request, responseToCache).catch(err => {
                                    console.warn('No se pudo cachear:', request.url, err);
                                });
                            });
                        }
                        
                        return response;
                    });
                })
                .catch(() => {
                    // Página de fallback offline
                    if (request.destination === 'document') {
                        return caches.match('/offline.html');
                    }
                })
        );
    }
});

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
    console.log('[SW] Mensaje recibido:', event.data);
    
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
    
    if (event.data.action === 'clearCache') {
        caches.delete(CACHE_NAME).then(() => {
            console.log('[SW] Caché eliminado');
        });
    }
});

// Sincronización en background
self.addEventListener('sync', (event) => {
    console.log('[SW] Sincronización en background:', event.tag);
    
    if (event.tag === 'sync-dns-results') {
        event.waitUntil(syncDNSResults());
    }
});

// Función para sincronizar resultados DNS
async function syncDNSResults() {
    try {
        // Aquí podrías sincronizar datos pendientes con un servidor
        console.log('[SW] Sincronizando resultados DNS...');
        return true;
    } catch (error) {
        console.error('[SW] Error en sincronización:', error);
        return false;
    }
}

// Push notifications
self.addEventListener('push', (event) => {
    console.log('[SW] Push notification recibida');
    
    const options = {
        body: event.data ? event.data.text() : 'Nueva actualización disponible',
        icon: '/icon-192.png',
        badge: '/icon-72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Ver ahora',
                icon: '/icon-check.png'
            },
            {
                action: 'close',
                title: 'Cerrar',
                icon: '/icon-close.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('DNS Inspector Pro', options)
    );
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notificación clickeada:', event.action);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        // Abrir la app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Periodicidad de sincronización en background
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'check-dns-updates') {
        console.log('[SW] Verificando actualizaciones DNS periódicas');
        event.waitUntil(checkDNSUpdates());
    }
});

async function checkDNSUpdates() {
    // Aquí podrías verificar cambios en los DNS favoritos
    console.log('[SW] Verificando cambios en DNS...');
}

console.log('[SW] Service Worker cargado');
