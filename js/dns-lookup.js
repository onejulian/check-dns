// Módulo principal para consultas DNS

const DNSLookup = {
    // Estado actual
    currentDomain: null,
    currentResults: [],
    isSearching: false,
    abortController: null,

    // Buscar registros DNS para un dominio
    async lookup(domain, options = {}) {
        // Validar dominio
        if (!Utils.validateDomain(domain)) {
            throw new Error(Utils.getMessage('invalidDomain'));
        }

        // Limpiar dominio
        domain = Utils.cleanDomain(domain);
        this.currentDomain = domain;

        // Opciones por defecto
        const defaultOptions = {
            recordTypes: CONFIG.RECORD_TYPES.slice(0, 7), // Por defecto los 7 primeros
            server: 'google',
            useCache: CONFIG.CACHE_ENABLED,
            checkSubdomains: false
        };

        options = { ...defaultOptions, ...options };

        // Verificar caché
        if (options.useCache) {
            const cached = Storage.getFromCache(domain, options.recordTypes);
            if (cached) {
                console.log('Resultados obtenidos del caché');
                this.currentResults = cached;
                return { domain, records: cached, fromCache: true };
            }
        }

        // Añadir al historial
        Storage.addToHistory(domain);

        // Preparar consultas
        const queries = [];
        
        // Consultas para el dominio principal
        queries.push({
            domain,
            types: options.recordTypes,
            server: options.server
        });

        // Si se solicita, añadir subdominios comunes
        if (options.checkSubdomains) {
            CONFIG.COMMON_SUBDOMAINS.forEach(subdomain => {
                queries.push({
                    domain: `${subdomain}.${domain}`,
                    types: ['A', 'CNAME'],
                    server: options.server
                });
            });
        }

        // Ejecutar consultas
        const results = await this.executeQueries(queries, options);
        
        // Guardar en caché
        if (options.useCache && results.records.length > 0) {
            Storage.saveToCache(domain, options.recordTypes, results.records);
        }

        this.currentResults = results.records;
        return results;
    },

    // Ejecutar múltiples consultas DNS
    async executeQueries(queries, options) {
        this.isSearching = true;
        this.abortController = new AbortController();
        
        const allRecords = [];
        const errors = [];
        let completed = 0;
        const total = queries.reduce((sum, q) => sum + q.types.length, 0);

        try {
            // Procesar cada consulta
            for (const query of queries) {
                const serverConfig = CONFIG.DNS_SERVERS[query.server] || CONFIG.DNS_SERVERS.google;
                
                // Crear promesas para cada tipo de registro
                const promises = query.types.map(async type => {
                    try {
                        const response = await this.queryDNSRecord(
                            query.domain,
                            type,
                            serverConfig,
                            this.abortController.signal
                        );
                        
                        completed++;
                        this.updateProgress(completed, total);
                        
                        if (response && response.Answer) {
                            return response.Answer.map(answer => ({
                                domain: query.domain,
                                type,
                                value: answer.data,
                                ttl: answer.TTL,
                                server: query.server,
                                ...Utils.parseDNSRecord(type, answer.data)
                            }));
                        }
                        return [];
                    } catch (error) {
                        console.error(`Error consultando ${type} para ${query.domain}:`, error);
                        errors.push({ domain: query.domain, type, error: error.message });
                        completed++;
                        this.updateProgress(completed, total);
                        return [];
                    }
                });

                // Esperar todas las consultas del dominio actual
                const results = await Promise.all(promises);
                results.forEach(recordSet => {
                    allRecords.push(...recordSet);
                });
            }
        } finally {
            this.isSearching = false;
            this.abortController = null;
        }

        return {
            domain: queries[0].domain,
            records: allRecords,
            errors,
            fromCache: false
        };
    },

    // Consultar un registro DNS específico
    async queryDNSRecord(domain, type, serverConfig, signal) {
        const url = `${serverConfig.url}?name=${encodeURIComponent(domain)}&type=${type}`;
        
        const options = {
            method: 'GET',
            headers: serverConfig.headers || {},
            signal
        };

        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    },

    // Buscar múltiples dominios (batch)
    async batchLookup(domains, options = {}) {
        const results = [];
        const errors = [];

        for (let i = 0; i < domains.length; i++) {
            const domain = Utils.cleanDomain(domains[i]);
            
            if (!domain) continue;
            
            try {
                UI.updateBatchProgress(i + 1, domains.length, domain);
                const result = await this.lookup(domain, options);
                results.push(result);
            } catch (error) {
                console.error(`Error al buscar ${domain}:`, error);
                errors.push({ domain, error: error.message });
            }
        }

        return { results, errors };
    },

    // Comparar DNS de múltiples servidores
    async compareServers(domain, recordTypes = ['A', 'MX', 'NS']) {
        const results = {};
        
        for (const [serverId, serverConfig] of Object.entries(CONFIG.DNS_SERVERS)) {
            try {
                const serverResults = await this.lookup(domain, {
                    recordTypes,
                    server: serverId,
                    useCache: false
                });
                results[serverId] = serverResults.records;
            } catch (error) {
                console.error(`Error con servidor ${serverId}:`, error);
                results[serverId] = { error: error.message };
            }
        }

        return this.analyzeServerDifferences(results);
    },

    // Analizar diferencias entre servidores DNS
    analyzeServerDifferences(serverResults) {
        const analysis = {
            consistent: [],
            inconsistent: [],
            missing: []
        };

        // Obtener todos los tipos de registros únicos
        const allTypes = new Set();
        Object.values(serverResults).forEach(records => {
            if (Array.isArray(records)) {
                records.forEach(r => allTypes.add(r.type));
            }
        });

        // Comparar cada tipo de registro
        allTypes.forEach(type => {
            const serverValues = {};
            
            Object.entries(serverResults).forEach(([server, records]) => {
                if (Array.isArray(records)) {
                    const values = records
                        .filter(r => r.type === type)
                        .map(r => r.value)
                        .sort();
                    
                    if (values.length > 0) {
                        serverValues[server] = values;
                    }
                }
            });

            // Analizar consistencia
            const uniqueValueSets = new Set(
                Object.values(serverValues).map(v => JSON.stringify(v))
            );

            if (uniqueValueSets.size === 1 && Object.keys(serverValues).length === Object.keys(CONFIG.DNS_SERVERS).length) {
                analysis.consistent.push({
                    type,
                    values: Object.values(serverValues)[0]
                });
            } else if (uniqueValueSets.size > 1) {
                analysis.inconsistent.push({
                    type,
                    servers: serverValues
                });
            } else if (Object.keys(serverValues).length < Object.keys(CONFIG.DNS_SERVERS).length) {
                analysis.missing.push({
                    type,
                    presentIn: Object.keys(serverValues),
                    missingFrom: Object.keys(CONFIG.DNS_SERVERS).filter(s => !serverValues[s])
                });
            }
        });

        return analysis;
    },

    // Verificar propagación DNS
    async checkPropagation(domain, recordType = 'A') {
        const servers = Object.keys(CONFIG.DNS_SERVERS);
        const results = [];

        for (const server of servers) {
            try {
                const response = await this.lookup(domain, {
                    recordTypes: [recordType],
                    server,
                    useCache: false
                });

                results.push({
                    server,
                    status: 'success',
                    records: response.records,
                    timestamp: Date.now()
                });
            } catch (error) {
                results.push({
                    server,
                    status: 'error',
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        }

        return this.analyzePropagation(results);
    },

    // Analizar estado de propagación
    analyzePropagation(results) {
        const successful = results.filter(r => r.status === 'success');
        const failed = results.filter(r => r.status === 'error');
        
        // Calcular porcentaje de propagación
        const propagationPercentage = (successful.length / results.length) * 100;
        
        // Verificar consistencia de valores
        const values = new Set();
        successful.forEach(r => {
            r.records.forEach(record => {
                values.add(record.value);
            });
        });

        const isConsistent = values.size <= 1; // Solo un valor único o ninguno

        return {
            percentage: propagationPercentage,
            consistent: isConsistent,
            successful: successful.length,
            failed: failed.length,
            total: results.length,
            values: Array.from(values),
            details: results,
            status: propagationPercentage === 100 && isConsistent ? 'complete' : 
                    propagationPercentage > 50 ? 'partial' : 'incomplete'
        };
    },

    // Actualizar progreso
    updateProgress(completed, total) {
        const percentage = Math.round((completed / total) * 100);
        
        if (typeof UI !== 'undefined' && UI.updateProgress) {
            UI.updateProgress(percentage, `Consultando registros DNS... ${completed}/${total}`);
        }
    },

    // Cancelar búsqueda actual
    cancelSearch() {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
            this.isSearching = false;
        }
    },

    // Exportar resultados actuales
    exportResults(format = 'json') {
        if (!this.currentResults || this.currentResults.length === 0) {
            throw new Error('No hay resultados para exportar');
        }

        const exporters = {
            json: () => this.exportAsJSON(),
            csv: () => this.exportAsCSV(),
            txt: () => this.exportAsText()
        };

        const exporter = exporters[format.toLowerCase()];
        if (!exporter) {
            throw new Error(`Formato no soportado: ${format}`);
        }

        return exporter();
    },

    // Exportar como JSON
    exportAsJSON() {
        const data = {
            domain: this.currentDomain,
            timestamp: new Date().toISOString(),
            records: this.currentResults,
            analysis: Utils.analyzeDNSHealth(this.currentResults)
        };

        return JSON.stringify(data, null, 2);
    },

    // Exportar como CSV
    exportAsCSV() {
        const headers = ['Domain', 'Type', 'Value', 'TTL', 'Priority', 'Server'];
        const rows = [headers];

        this.currentResults.forEach(record => {
            rows.push([
                record.domain || this.currentDomain,
                record.type,
                record.value,
                record.ttl || '',
                record.priority || '',
                record.server || ''
            ]);
        });

        return rows.map(row => row.map(cell => 
            cell.toString().includes(',') ? `"${cell}"` : cell
        ).join(',')).join('\n');
    },

    // Exportar como texto plano
    exportAsText() {
        let text = `Registros DNS para ${this.currentDomain}\n`;
        text += `Fecha: ${new Date().toLocaleString()}\n`;
        text += '='.repeat(50) + '\n\n';

        // Agrupar por tipo
        const grouped = Utils.groupRecordsByType(this.currentResults);

        Object.entries(grouped).forEach(([type, records]) => {
            text += `${type} Records:\n`;
            records.forEach(record => {
                text += `  ${record.value}`;
                if (record.ttl) text += ` (TTL: ${record.ttl})`;
                if (record.priority) text += ` (Priority: ${record.priority})`;
                text += '\n';
            });
            text += '\n';
        });

        // Añadir análisis
        const analysis = Utils.analyzeDNSHealth(this.currentResults);
        if (analysis.good.length > 0) {
            text += 'Configuraciones correctas:\n';
            analysis.good.forEach(item => text += `  ✓ ${item}\n`);
            text += '\n';
        }

        if (analysis.warnings.length > 0) {
            text += 'Advertencias:\n';
            analysis.warnings.forEach(item => text += `  ⚠ ${item}\n`);
            text += '\n';
        }

        return text;
    }
};

// Hacer DNSLookup disponible globalmente
window.DNSLookup = DNSLookup;
