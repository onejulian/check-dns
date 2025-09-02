// Utilidades generales de la aplicación

const Utils = {
    // Validar formato de dominio
    validateDomain(domain) {
        // Limpiar protocolo si existe
        domain = this.cleanDomain(domain);
        
        // Regex para validar dominio
        const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
        return domainRegex.test(domain);
    },

    // Limpiar dominio de protocolos y paths
    cleanDomain(input) {
        if (!input) return '';
        
        // Eliminar protocolo
        input = input.replace(/^https?:\/\//i, '');
        input = input.replace(/^ftp:\/\//i, '');
        
        // Eliminar www. si es el único subdominio
        // input = input.replace(/^www\./i, '');
        
        // Eliminar path, query y hash
        input = input.split('/')[0];
        input = input.split('?')[0];
        input = input.split('#')[0];
        
        // Eliminar puerto
        input = input.split(':')[0];
        
        // Eliminar espacios
        input = input.trim();
        
        return input.toLowerCase();
    },

    // Formatear fecha relativa
    formatRelativeTime(date) {
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return 'Hace un momento';
        if (minutes < 60) return `Hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
        if (hours < 24) return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
        if (days < 7) return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
        
        return date.toLocaleDateString();
    },

    // Copiar al portapapeles
    async copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback para contextos no seguros
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                try {
                    document.execCommand('copy');
                    return true;
                } catch (err) {
                    console.error('Error al copiar:', err);
                    return false;
                } finally {
                    document.body.removeChild(textArea);
                }
            }
        } catch (err) {
            console.error('Error al copiar al portapapeles:', err);
            return false;
        }
    },

    // Descargar archivo
    downloadFile(content, filename, type = 'text/plain') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    // Debounce para optimizar eventos
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle para limitar llamadas
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Generar ID único
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    // Parsear registros DNS según tipo
    parseDNSRecord(type, data) {
        const record = {
            type,
            value: data,
            ttl: null,
            priority: null,
            additional: {}
        };

        switch (type) {
            case 'MX':
                // Formato: "priority domain"
                const mxParts = data.split(' ');
                if (mxParts.length >= 2) {
                    record.priority = parseInt(mxParts[0]);
                    record.value = mxParts.slice(1).join(' ');
                }
                break;
                
            case 'SOA':
                // Formato complejo del SOA
                const soaParts = data.split(' ');
                if (soaParts.length >= 7) {
                    record.additional = {
                        mname: soaParts[0],
                        rname: soaParts[1],
                        serial: soaParts[2],
                        refresh: soaParts[3],
                        retry: soaParts[4],
                        expire: soaParts[5],
                        minimum: soaParts[6]
                    };
                }
                break;
                
            case 'SRV':
                // Formato: "priority weight port target"
                const srvParts = data.split(' ');
                if (srvParts.length >= 4) {
                    record.priority = parseInt(srvParts[0]);
                    record.additional = {
                        weight: parseInt(srvParts[1]),
                        port: parseInt(srvParts[2]),
                        target: srvParts[3]
                    };
                }
                break;
        }

        return record;
    },

    // Formatear tamaño de archivo
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i), 2) + ' ' + sizes[i];
    },

    // Obtener icono según tipo de registro
    getRecordIcon(type) {
        const icons = {
            'A': 'fa-globe',
            'AAAA': 'fa-globe-americas',
            'MX': 'fa-envelope',
            'NS': 'fa-server',
            'TXT': 'fa-file-alt',
            'CNAME': 'fa-link',
            'SOA': 'fa-crown',
            'CAA': 'fa-certificate',
            'PTR': 'fa-exchange-alt',
            'SRV': 'fa-cogs'
        };
        return icons[type] || 'fa-question-circle';
    },

    // Obtener color según tipo de registro
    getRecordColor(type) {
        const colors = {
            'A': 'blue',
            'AAAA': 'purple',
            'MX': 'red',
            'NS': 'orange',
            'TXT': 'green',
            'CNAME': 'cyan',
            'SOA': 'pink',
            'CAA': 'indigo',
            'PTR': 'yellow',
            'SRV': 'gray'
        };
        return colors[type] || 'gray';
    },

    // Verificar si es dispositivo móvil
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    // Obtener idioma actual
    getCurrentLanguage() {
        return localStorage.getItem('language') || 'es';
    },

    // Obtener mensaje traducido
    getMessage(key) {
        const lang = this.getCurrentLanguage();
        return CONFIG.MESSAGES[lang][key] || CONFIG.MESSAGES['es'][key] || key;
    },

    // Analizar salud del DNS
    analyzeDNSHealth(records) {
        const issues = [];
        const warnings = [];
        const good = [];

        // Verificar registros A
        const aRecords = records.filter(r => r.type === 'A');
        if (aRecords.length === 0) {
            warnings.push('No hay registros A configurados');
        } else if (aRecords.length > 1) {
            good.push('Múltiples registros A para balanceo de carga');
        }

        // Verificar MX
        const mxRecords = records.filter(r => r.type === 'MX');
        if (mxRecords.length === 0) {
            warnings.push('No hay registros MX - el dominio no puede recibir emails');
        } else if (mxRecords.length > 1) {
            good.push('Múltiples registros MX para redundancia de email');
        }

        // Verificar SPF
        const txtRecords = records.filter(r => r.type === 'TXT');
        const hasSPF = txtRecords.some(r => r.value.includes('v=spf1'));
        if (!hasSPF) {
            warnings.push('No hay registro SPF configurado');
        } else {
            good.push('Registro SPF configurado correctamente');
        }

        // Verificar DMARC
        const hasDMARC = txtRecords.some(r => r.value.includes('v=DMARC1'));
        if (!hasDMARC) {
            warnings.push('No hay registro DMARC configurado');
        } else {
            good.push('Registro DMARC configurado correctamente');
        }

        // Verificar CAA
        const caaRecords = records.filter(r => r.type === 'CAA');
        if (caaRecords.length === 0) {
            warnings.push('No hay registros CAA - cualquier CA puede emitir certificados');
        } else {
            good.push('Registros CAA configurados para seguridad SSL');
        }

        return { issues, warnings, good };
    },

    // Comparar registros DNS
    compareDNSRecords(records1, records2) {
        const differences = [];
        const similarities = [];

        // Agrupar por tipo
        const grouped1 = this.groupRecordsByType(records1);
        const grouped2 = this.groupRecordsByType(records2);

        // Comparar cada tipo
        const allTypes = new Set([...Object.keys(grouped1), ...Object.keys(grouped2)]);
        
        for (const type of allTypes) {
            const set1 = new Set((grouped1[type] || []).map(r => r.value));
            const set2 = new Set((grouped2[type] || []).map(r => r.value));

            // Encontrar diferencias
            const onlyIn1 = [...set1].filter(x => !set2.has(x));
            const onlyIn2 = [...set2].filter(x => !set1.has(x));
            const inBoth = [...set1].filter(x => set2.has(x));

            if (onlyIn1.length > 0) {
                differences.push({
                    type,
                    domain: 1,
                    values: onlyIn1,
                    message: `Solo en el primer dominio`
                });
            }

            if (onlyIn2.length > 0) {
                differences.push({
                    type,
                    domain: 2,
                    values: onlyIn2,
                    message: `Solo en el segundo dominio`
                });
            }

            if (inBoth.length > 0) {
                similarities.push({
                    type,
                    values: inBoth,
                    message: `Idéntico en ambos dominios`
                });
            }
        }

        return { differences, similarities };
    },

    // Agrupar registros por tipo
    groupRecordsByType(records) {
        return records.reduce((acc, record) => {
            if (!acc[record.type]) {
                acc[record.type] = [];
            }
            acc[record.type].push(record);
            return acc;
        }, {});
    },

    // Estimar tiempo de propagación DNS
    estimatePropagationTime(type) {
        const times = {
            'A': '15-60 minutos',
            'AAAA': '15-60 minutos',
            'CNAME': '15-60 minutos',
            'MX': '1-4 horas',
            'NS': '24-48 horas',
            'TXT': '15-60 minutos',
            'SOA': '24-48 horas',
            'CAA': '15-60 minutos'
        };
        return times[type] || '1-24 horas';
    }
};

// Hacer Utils disponible globalmente
window.Utils = Utils;
