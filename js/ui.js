// Módulo de interfaz de usuario

const UI = {
    // Elementos del DOM
    elements: {},
    
    // Estado de la UI
    state: {
        currentView: 'cards',
        isAdvancedOpen: false,
        favoritesOpen: false,
        settingsOpen: false
    },

    // Inicializar UI
    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadSettings();
        this.updateHistory();
        this.updateFavorites();
        this.initKeyboardShortcuts();
        this.initTooltips();
        
        // Aplicar tema guardado
        const savedTheme = Storage.getTheme();
        Storage.applyTheme(savedTheme);
        
        // Actualizar icono del toggle según el tema
        const icon = this.elements.themeToggle.querySelector('i');
        if (savedTheme === 'light') {
            icon.classList.remove('fa-moon', 'text-yellow-400');
            icon.classList.add('fa-sun', 'text-orange-500');
        } else {
            icon.classList.remove('fa-sun', 'text-orange-500');
            icon.classList.add('fa-moon', 'text-yellow-400');
        }
        
        // Actualizar clases para el tema inicial
        this.updateThemeClasses(savedTheme);
        
        // Inicializar idioma
        this.initLanguage();
    },

    // Cachear elementos del DOM
    cacheElements() {
        // Formularios y controles principales
        this.elements.domainInput = document.getElementById('domainInput');
        this.elements.lookupButton = document.getElementById('lookupButton');
        this.elements.clearInput = document.getElementById('clearInput');
        this.elements.historyDropdown = document.getElementById('historyDropdown');
        
        // Tabs de modo
        this.elements.tabButtons = document.querySelectorAll('.tab-btn');
        this.elements.searchForms = {
            single: document.getElementById('singleSearchForm'),
            batch: document.getElementById('batchSearchForm'),
            compare: document.getElementById('compareForm')
        };
        
        // Opciones avanzadas
        this.elements.toggleAdvanced = document.getElementById('toggleAdvanced');
        this.elements.advancedOptions = document.getElementById('advancedOptions');
        this.elements.dnsServer = document.getElementById('dnsServer');
        this.elements.checkSubdomains = document.getElementById('checkSubdomains');
        this.elements.recordTypes = document.querySelectorAll('.record-type');
        
        // Batch y comparación
        this.elements.batchDomains = document.getElementById('batchDomains');
        this.elements.batchLookupButton = document.getElementById('batchLookupButton');
        this.elements.importFile = document.getElementById('importFile');
        this.elements.compareDomain1 = document.getElementById('compareDomain1');
        this.elements.compareDomain2 = document.getElementById('compareDomain2');
        this.elements.compareButton = document.getElementById('compareButton');
        
        // Resultados
        this.elements.resultsToolbar = document.getElementById('resultsToolbar');
        this.elements.resultsContainer = document.getElementById('resultsContainer');
        this.elements.cardsView = document.getElementById('cardsView');
        this.elements.tableView = document.getElementById('tableView');
        this.elements.compactView = document.getElementById('compactView');
        this.elements.filterResults = document.getElementById('filterResults');
        
        // Estado y progreso
        this.elements.statusContainer = document.getElementById('statusContainer');
        this.elements.progressBar = document.getElementById('progressBar');
        this.elements.progressFill = document.getElementById('progressFill');
        this.elements.progressText = document.getElementById('progressText');
        this.elements.loader = document.getElementById('loader');
        this.elements.errorMessage = document.getElementById('errorMessage');
        this.elements.successMessage = document.getElementById('successMessage');
        
        // Controles del header
        this.elements.themeToggle = document.getElementById('themeToggle');
        this.elements.languageSelector = document.getElementById('languageSelector');
        this.elements.settingsBtn = document.getElementById('settingsBtn');
        
        // Modales y paneles
        this.elements.settingsModal = document.getElementById('settingsModal');
        this.elements.closeSettings = document.getElementById('closeSettings');
        this.elements.favoritesPanel = document.getElementById('favoritesPanel');
        this.elements.toggleFavorites = document.getElementById('toggleFavorites');
        this.elements.closeFavorites = document.getElementById('closeFavorites');
        this.elements.favoritesList = document.getElementById('favoritesList');
        
        // Toast
        this.elements.toast = document.getElementById('toast');
        this.elements.toastIcon = document.getElementById('toastIcon');
        this.elements.toastMessage = document.getElementById('toastMessage');
        
        // Tooltip
        this.elements.dnsTooltip = document.getElementById('dnsTooltip');
    },

    // Vincular eventos
    bindEvents() {
        // Búsqueda principal
        this.elements.lookupButton.addEventListener('click', () => this.handleSearch());
        this.elements.domainInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });
        
        // Input events
        this.elements.domainInput.addEventListener('input', (e) => {
            this.toggleClearButton(e.target.value);
            this.filterHistory(e.target.value);
        });
        
        this.elements.domainInput.addEventListener('focus', () => {
            this.showHistoryDropdown();
        });
        
        document.addEventListener('click', (e) => {
            if (!this.elements.domainInput.contains(e.target) && 
                !this.elements.historyDropdown.contains(e.target)) {
                this.hideHistoryDropdown();
            }
        });
        
        this.elements.clearInput.addEventListener('click', () => {
            this.elements.domainInput.value = '';
            this.toggleClearButton('');
            this.elements.domainInput.focus();
        });
        
        // Tabs de modo
        this.elements.tabButtons.forEach(btn => {
            btn.addEventListener('click', () => this.switchMode(btn.dataset.mode));
        });
        
        // Opciones avanzadas
        this.elements.toggleAdvanced.addEventListener('click', () => this.toggleAdvancedOptions());
        
        // Búsqueda en lote
        this.elements.batchLookupButton.addEventListener('click', () => this.handleBatchSearch());
        this.elements.importFile.addEventListener('change', (e) => this.handleFileImport(e));
        
        // Comparación
        this.elements.compareButton.addEventListener('click', () => this.handleCompare());
        
        // Vistas de resultados
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchView(btn.dataset.view));
        });
        
        // Filtro de resultados
        this.elements.filterResults.addEventListener('input', 
            Utils.debounce((e) => this.filterResults(e.target.value), 300)
        );
        
        // Exportación
        document.getElementById('exportJSON')?.addEventListener('click', () => this.exportResults('json'));
        document.getElementById('exportCSV')?.addEventListener('click', () => this.exportResults('csv'));
        document.getElementById('exportTXT')?.addEventListener('click', () => this.exportResults('txt'));
        
        // Compartir
        document.getElementById('shareResults')?.addEventListener('click', () => this.shareResults());
        document.getElementById('copyAllResults')?.addEventListener('click', () => this.copyAllResults());
        
        // Tema
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Idioma
        this.elements.languageSelector.addEventListener('change', (e) => this.changeLanguage(e.target.value));
        
        // Configuración
        this.elements.settingsBtn.addEventListener('click', () => this.openSettings());
        this.elements.closeSettings.addEventListener('click', () => this.closeSettings());
        
        document.getElementById('clearCache')?.addEventListener('click', () => this.clearCache());
        document.getElementById('clearHistory')?.addEventListener('click', () => this.clearHistory());
        
        // Favoritos
        this.elements.toggleFavorites.addEventListener('click', () => this.toggleFavorites());
        this.elements.closeFavorites.addEventListener('click', () => this.closeFavorites());
        document.getElementById('addCurrentToFavorites')?.addEventListener('click', () => this.addCurrentToFavorites());
    },

    // Manejar búsqueda principal
    async handleSearch() {
        const domain = this.elements.domainInput.value.trim();
        
        if (!domain) {
            this.showError(Utils.getMessage('invalidDomain'));
            return;
        }

        // Obtener opciones seleccionadas
        const recordTypes = Array.from(this.elements.recordTypes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
        
        const server = this.elements.dnsServer.value;
        const checkSubdomains = this.elements.checkSubdomains.checked;

        // Mostrar estado de carga
        this.showLoader();
        this.clearResults();

        try {
            const result = await DNSLookup.lookup(domain, {
                recordTypes,
                server,
                checkSubdomains
            });

            this.displayResults(result);
            
            if (result.fromCache) {
                this.showSuccess('Resultados obtenidos del caché');
            }
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.hideLoader();
        }
    },

    // Manejar búsqueda en lote
    async handleBatchSearch() {
        const domainsText = this.elements.batchDomains.value.trim();
        
        if (!domainsText) {
            this.showError('Por favor, ingresa al menos un dominio');
            return;
        }

        const domains = domainsText.split('\n').filter(d => d.trim());
        
        if (domains.length === 0) {
            this.showError('No se encontraron dominios válidos');
            return;
        }

        this.showLoader();
        this.clearResults();

        try {
            const results = await DNSLookup.batchLookup(domains);
            this.displayBatchResults(results);
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.hideLoader();
        }
    },

    // Manejar comparación
    async handleCompare() {
        const domain1 = this.elements.compareDomain1.value.trim();
        const domain2 = this.elements.compareDomain2.value.trim();
        
        if (!domain1 || !domain2) {
            this.showError('Por favor, ingresa ambos dominios para comparar');
            return;
        }

        this.showLoader();
        this.clearResults();

        try {
            const [result1, result2] = await Promise.all([
                DNSLookup.lookup(domain1),
                DNSLookup.lookup(domain2)
            ]);

            const comparison = Utils.compareDNSRecords(result1.records, result2.records);
            this.displayComparison(domain1, domain2, comparison);
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.hideLoader();
        }
    },

    // Mostrar resultados
    displayResults(result) {
        const { domain, records } = result;
        
        if (!records || records.length === 0) {
            this.showError(Utils.getMessage('noResults'));
            return;
        }

        // Mostrar toolbar
        this.elements.resultsToolbar.classList.remove('hidden');
        
        // Agrupar por tipo
        const grouped = Utils.groupRecordsByType(records);
        
        // Limpiar vistas
        this.elements.cardsView.innerHTML = '';
        document.getElementById('tableBody').innerHTML = '';
        this.elements.compactView.innerHTML = '';
        
        // Renderizar según vista actual
        switch (this.state.currentView) {
            case 'cards':
                this.renderCardsView(grouped);
                break;
            case 'table':
                this.renderTableView(records);
                break;
            case 'compact':
                this.renderCompactView(grouped);
                break;
        }

        // Añadir animación de entrada
        requestAnimationFrame(() => {
            document.querySelectorAll('.dns-card').forEach((card, index) => {
                setTimeout(() => card.classList.add('fade-in'), index * 50);
            });
        });

        // Análisis de salud DNS
        const analysis = Utils.analyzeDNSHealth(records);
        if (analysis.warnings.length > 0 || analysis.issues.length > 0) {
            this.showDNSAnalysis(analysis);
        }
    },

    // Renderizar vista de tarjetas
    renderCardsView(grouped) {
        Object.entries(grouped).forEach(([type, records]) => {
            const card = document.createElement('div');
            card.className = 'dns-card';
            
            const color = Utils.getRecordColor(type);
            const icon = Utils.getRecordIcon(type);
            
            card.innerHTML = `
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-2">
                        <i class="fas ${icon} text-${color}-500"></i>
                        <span class="dns-type-badge badge-${type}">${type}</span>
                        <button class="info-icon" data-type="${type}">?</button>
                    </div>
                    <span class="text-sm text-gray-500">${records.length} registro${records.length > 1 ? 's' : ''}</span>
                </div>
                <div class="space-y-2">
                    ${records.map(record => `
                        <div class="dns-record-value">
                            <span>${this.formatRecordValue(record)}</span>
                            <button class="copy-btn" data-value="${record.value}">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;
            
            this.elements.cardsView.appendChild(card);
            
            // Vincular eventos de copia
            card.querySelectorAll('.copy-btn').forEach(btn => {
                btn.addEventListener('click', () => this.copyValue(btn.dataset.value));
            });
            
            // Vincular tooltips
            card.querySelector('.info-icon').addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target, type);
            });
        });
    },

    // Renderizar vista de tabla
    renderTableView(records) {
        const tbody = document.getElementById('tableBody');
        
        records.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-4 py-3">
                    <span class="dns-type-badge badge-${record.type}">${record.type}</span>
                </td>
                <td class="px-4 py-3 font-mono text-sm">${record.value}</td>
                <td class="px-4 py-3">${record.ttl || '-'}</td>
                <td class="px-4 py-3">${record.priority || '-'}</td>
                <td class="px-4 py-3 text-center">
                    <button class="copy-btn-inline text-blue-500 hover:text-blue-400" data-value="${record.value}">
                        <i class="fas fa-copy"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
            
            row.querySelector('.copy-btn-inline').addEventListener('click', () => {
                this.copyValue(record.value);
            });
        });
        
        this.elements.tableView.classList.remove('hidden');
        this.elements.cardsView.classList.add('hidden');
        this.elements.compactView.classList.add('hidden');
    },

    // Renderizar vista compacta
    renderCompactView(grouped) {
        Object.entries(grouped).forEach(([type, records]) => {
            records.forEach(record => {
                const item = document.createElement('div');
                item.className = 'compact-item';
                item.innerHTML = `
                    <div class="flex items-center gap-3">
                        <span class="dns-type-badge badge-${type}">${type}</span>
                        <span class="font-mono text-sm">${record.value}</span>
                    </div>
                    <button class="copy-btn-inline text-blue-500" data-value="${record.value}">
                        <i class="fas fa-copy"></i>
                    </button>
                `;
                this.elements.compactView.appendChild(item);
                
                item.querySelector('.copy-btn-inline').addEventListener('click', () => {
                    this.copyValue(record.value);
                });
            });
        });
        
        this.elements.compactView.classList.remove('hidden');
        this.elements.cardsView.classList.add('hidden');
        this.elements.tableView.classList.add('hidden');
    },

    // Formatear valor de registro
    formatRecordValue(record) {
        let value = record.value;
        
        if (record.type === 'MX' && record.priority) {
            value = `[${record.priority}] ${value}`;
        } else if (record.type === 'SRV' && record.additional) {
            const { weight, port, target } = record.additional;
            value = `[${record.priority}] [${weight}] :${port} → ${target}`;
        }
        
        if (record.ttl) {
            value += ` (TTL: ${record.ttl}s)`;
        }
        
        return value;
    },

    // Copiar valor al portapapeles
    async copyValue(value) {
        const success = await Utils.copyToClipboard(value);
        if (success) {
            this.showToast('Copiado al portapapeles', 'success');
        } else {
            this.showToast('Error al copiar', 'error');
        }
    },

    // Copiar todos los resultados
    async copyAllResults() {
        try {
            const text = DNSLookup.exportAsText();
            const success = await Utils.copyToClipboard(text);
            if (success) {
                this.showToast('Todos los resultados copiados', 'success');
            }
        } catch (error) {
            this.showToast('Error al copiar resultados', 'error');
        }
    },

    // Exportar resultados
    exportResults(format) {
        try {
            const content = DNSLookup.exportResults(format);
            const filename = `dns_${DNSLookup.currentDomain}_${Date.now()}.${format}`;
            Utils.downloadFile(content, filename);
            this.showToast('Archivo exportado exitosamente', 'success');
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    },

    // Compartir resultados
    async shareResults() {
        if (navigator.share) {
            try {
                const text = DNSLookup.exportAsText();
                await navigator.share({
                    title: `Registros DNS de ${DNSLookup.currentDomain}`,
                    text: text
                });
            } catch (error) {
                console.log('Error al compartir:', error);
            }
        } else {
            // Fallback: copiar enlace
            const url = window.location.href;
            await Utils.copyToClipboard(url);
            this.showToast('Enlace copiado al portapapeles', 'info');
        }
    },

    // Cambiar modo de búsqueda
    switchMode(mode) {
        // Actualizar tabs
        this.elements.tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        
        // Mostrar formulario correspondiente
        Object.entries(this.elements.searchForms).forEach(([key, form]) => {
            form.classList.toggle('hidden', key !== mode);
        });
    },

    // Cambiar vista de resultados
    switchView(view) {
        this.state.currentView = view;
        
        // Actualizar botones
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        // Re-renderizar si hay resultados
        if (DNSLookup.currentResults.length > 0) {
            this.displayResults({
                domain: DNSLookup.currentDomain,
                records: DNSLookup.currentResults
            });
        }
    },

    // Toggle opciones avanzadas
    toggleAdvancedOptions() {
        this.state.isAdvancedOpen = !this.state.isAdvancedOpen;
        this.elements.advancedOptions.classList.toggle('hidden');
        
        const icon = this.elements.toggleAdvanced.querySelector('i');
        icon.classList.toggle('fa-chevron-down');
        icon.classList.toggle('fa-chevron-up');
    },

    // Mostrar/ocultar dropdown de historial
    showHistoryDropdown() {
        const history = Storage.getHistory();
        if (history.length === 0) return;
        
        this.elements.historyDropdown.innerHTML = history.slice(0, 5).map(item => `
            <div class="history-item" data-domain="${item.domain}">
                <span>${item.domain}</span>
                <span class="history-time">${Utils.formatRelativeTime(new Date(item.timestamp))}</span>
            </div>
        `).join('');
        
        this.elements.historyDropdown.classList.remove('hidden');
        
        // Vincular eventos
        this.elements.historyDropdown.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                this.elements.domainInput.value = item.dataset.domain;
                this.hideHistoryDropdown();
                this.handleSearch();
            });
        });
    },

    hideHistoryDropdown() {
        this.elements.historyDropdown.classList.add('hidden');
    },

    // Filtrar historial mientras se escribe
    filterHistory(query) {
        if (!query) {
            this.showHistoryDropdown();
            return;
        }
        
        const history = Storage.getHistory();
        const filtered = history.filter(item => 
            item.domain.toLowerCase().includes(query.toLowerCase())
        );
        
        if (filtered.length > 0) {
            this.elements.historyDropdown.innerHTML = filtered.slice(0, 5).map(item => `
                <div class="history-item" data-domain="${item.domain}">
                    <span>${item.domain}</span>
                    <span class="history-time">${Utils.formatRelativeTime(new Date(item.timestamp))}</span>
                </div>
            `).join('');
            
            this.elements.historyDropdown.classList.remove('hidden');
            
            // Re-vincular eventos
            this.elements.historyDropdown.querySelectorAll('.history-item').forEach(item => {
                item.addEventListener('click', () => {
                    this.elements.domainInput.value = item.dataset.domain;
                    this.hideHistoryDropdown();
                    this.handleSearch();
                });
            });
        } else {
            this.hideHistoryDropdown();
        }
    },

    // Toggle botón de limpiar
    toggleClearButton(value) {
        if (value) {
            this.elements.clearInput.classList.remove('hidden');
        } else {
            this.elements.clearInput.classList.add('hidden');
        }
    },

    // Mostrar/ocultar loader
    showLoader() {
        this.elements.loader.classList.remove('hidden');
        this.elements.progressBar.classList.remove('hidden');
        this.elements.lookupButton.disabled = true;
    },

    hideLoader() {
        this.elements.loader.classList.add('hidden');
        this.elements.progressBar.classList.add('hidden');
        this.elements.lookupButton.disabled = false;
        this.updateProgress(0, '');
    },

    // Actualizar barra de progreso
    updateProgress(percentage, text = '') {
        this.elements.progressFill.style.width = `${percentage}%`;
        this.elements.progressText.textContent = text;
    },

    // Actualizar progreso de búsqueda en lote
    updateBatchProgress(current, total, domain) {
        const percentage = Math.round((current / total) * 100);
        this.updateProgress(percentage, `Procesando ${current}/${total}: ${domain}`);
    },

    // Mostrar mensajes
    showError(message) {
        this.elements.errorMessage.textContent = message;
        this.elements.errorMessage.classList.remove('hidden');
        setTimeout(() => {
            this.elements.errorMessage.classList.add('hidden');
        }, 5000);
    },

    showSuccess(message) {
        this.elements.successMessage.textContent = message;
        this.elements.successMessage.classList.remove('hidden');
        setTimeout(() => {
            this.elements.successMessage.classList.add('hidden');
        }, 3000);
    },

    // Mostrar toast
    showToast(message, type = 'info') {
        this.elements.toastMessage.textContent = message;
        
        // Actualizar icono y color
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle'
        };
        
        this.elements.toastIcon.className = `fas ${icons[type]} mr-3`;
        this.elements.toast.className = `fixed bottom-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-xl z-50 transition-all toast-${type}`;
        
        // Mostrar toast
        this.elements.toast.classList.remove('hidden');
        
        // Ocultar después de 3 segundos
        setTimeout(() => {
            this.elements.toast.classList.add('hidden');
        }, 3000);
    },

    // Mostrar tooltip educativo
    showTooltip(target, type) {
        const info = CONFIG.DNS_INFO[type];
        if (!info) return;
        
        const rect = target.getBoundingClientRect();
        
        document.getElementById('tooltipTitle').textContent = info.title;
        document.getElementById('tooltipDescription').textContent = info.description;
        document.getElementById('tooltipExample').textContent = `Ejemplo: ${info.example}`;
        
        this.elements.dnsTooltip.style.top = `${rect.bottom + 5}px`;
        this.elements.dnsTooltip.style.left = `${rect.left}px`;
        this.elements.dnsTooltip.classList.remove('hidden');
        
        // Ocultar al salir
        target.addEventListener('mouseleave', () => {
            this.elements.dnsTooltip.classList.add('hidden');
        }, { once: true });
    },

    // Limpiar resultados
    clearResults() {
        this.elements.cardsView.innerHTML = '';
        document.getElementById('tableBody').innerHTML = '';
        this.elements.compactView.innerHTML = '';
        this.elements.resultsToolbar.classList.add('hidden');
    },

    // Filtrar resultados visibles
    filterResults(query) {
        if (!query) {
            // Mostrar todos
            document.querySelectorAll('.dns-card, .compact-item, #tableBody tr').forEach(el => {
                el.style.display = '';
            });
            return;
        }
        
        query = query.toLowerCase();
        
        // Filtrar tarjetas
        document.querySelectorAll('.dns-card').forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(query) ? '' : 'none';
        });
        
        // Filtrar tabla
        document.querySelectorAll('#tableBody tr').forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
        });
        
        // Filtrar vista compacta
        document.querySelectorAll('.compact-item').forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(query) ? '' : 'none';
        });
    },

    // Toggle tema
    toggleTheme() {
        const newTheme = Storage.toggleTheme();
        const icon = this.elements.themeToggle.querySelector('i');
        
        if (newTheme === 'light') {
            icon.classList.remove('fa-moon', 'text-yellow-400');
            icon.classList.add('fa-sun', 'text-orange-500');
        } else {
            icon.classList.remove('fa-sun', 'text-orange-500');
            icon.classList.add('fa-moon', 'text-yellow-400');
        }
        
        // Actualizar clases adicionales después del cambio
        this.updateThemeClasses(newTheme);
        
        this.showToast(`Tema ${newTheme === 'light' ? 'claro' : 'oscuro'} activado`, 'info');
    },
    
    // Actualizar clases específicas para el tema
    updateThemeClasses(theme) {
        // Actualizar clases de elementos específicos que no se actualizan automáticamente
        const elementsToUpdate = {
            '#toggleAdvanced': theme === 'light' ? 'text-blue-600 hover:text-blue-700' : 'text-blue-400 hover:text-blue-300',
            '.tab-btn': theme === 'light' ? 'text-gray-700' : 'text-gray-300',
            '.view-btn': theme === 'light' ? 'text-gray-700' : 'text-gray-300',
            '#progressText': theme === 'light' ? 'text-gray-600' : 'text-gray-400',
            '.history-time': theme === 'light' ? 'text-gray-500' : 'text-gray-400',
            '.fa-filter': theme === 'light' ? 'text-gray-400' : 'text-gray-500',
            '.text-sm.text-gray-400': theme === 'light' ? 'text-gray-600' : 'text-gray-400'
        };
        
        Object.entries(elementsToUpdate).forEach(([selector, classes]) => {
            document.querySelectorAll(selector).forEach(el => {
                // Limpiar clases anteriores
                el.className = el.className.replace(/text-\S+|hover:text-\S+/g, '');
                // Añadir nuevas clases
                classes.split(' ').forEach(cls => el.classList.add(cls));
            });
        });
    },

    // Cambiar idioma
    changeLanguage(language) {
        // Guardar el idioma seleccionado
        localStorage.setItem('language', language);
        
        // Actualizar la configuración
        const settings = Storage.getSettings();
        settings.language = language;
        Storage.saveSettings(settings);
        
        // Actualizar todos los textos de la interfaz
        this.updateUITranslations();
        
        // Mostrar notificación
        const langName = language === 'es' ? 'Español' : 'English';
        this.showToast(Utils.getMessage('languageChanged') || `Idioma cambiado a ${langName}`, 'success');
    },
    
    // Actualizar traducciones de la UI
    updateUITranslations() {
        // Actualizar placeholders
        if (this.elements.domainInput) {
            this.elements.domainInput.placeholder = Utils.getMessage('domainPlaceholder') || 'ejemplo.com o https://ejemplo.com';
        }
        
        // Actualizar botones principales
        const lookupButton = document.querySelector('#lookupButton span');
        if (lookupButton) {
            lookupButton.textContent = Utils.getMessage('searchButton') || 'Buscar DNS';
        }
        
        // Actualizar tabs
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            const mode = btn.dataset.mode;
            const text = btn.querySelector('i').nextSibling;
            if (text && mode) {
                if (mode === 'single') text.textContent = Utils.getMessage('singleSearch') || 'Búsqueda Simple';
                if (mode === 'batch') text.textContent = Utils.getMessage('batchSearch') || 'Búsqueda en Lote';
                if (mode === 'compare') text.textContent = Utils.getMessage('compareSearch') || 'Comparar DNS';
            }
        });
        
        // Actualizar elementos con atributo data-i18n
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = Utils.getMessage(key);
            if (translation && translation !== key) {
                element.textContent = translation;
            }
        });
        
        // Actualizar títulos y labels
        this.updateFormLabels();
    },
    
    // Actualizar labels de formularios
    updateFormLabels() {
        // Actualizar opciones avanzadas
        const advancedToggle = document.getElementById('toggleAdvanced');
        if (advancedToggle) {
            advancedToggle.innerHTML = `<i class="fas fa-chevron-down mr-1"></i>${Utils.getMessage('advancedOptions') || 'Opciones Avanzadas'}`;
        }
        
        // Actualizar labels de tipos de registro
        const recordLabels = document.querySelectorAll('.record-type-label');
        recordLabels.forEach(label => {
            const type = label.getAttribute('data-type');
            if (type && CONFIG.DNS_INFO[type]) {
                const lang = Utils.getCurrentLanguage();
                // Si hay traducción disponible, usarla
                if (lang === 'en' && CONFIG.DNS_INFO_EN && CONFIG.DNS_INFO_EN[type]) {
                    label.textContent = CONFIG.DNS_INFO_EN[type].title || label.textContent;
                }
            }
        });
    },
    
    // Inicializar idioma
    initLanguage() {
        const savedLanguage = Utils.getCurrentLanguage();
        
        // Establecer el valor del selector
        if (this.elements.languageSelector) {
            this.elements.languageSelector.value = savedLanguage;
        }
        
        // Aplicar traducciones
        this.updateUITranslations();
        
        // Actualizar el atributo lang del documento
        document.documentElement.lang = savedLanguage;
    },

    // Abrir configuración
    openSettings() {
        this.elements.settingsModal.classList.remove('hidden');
        this.state.settingsOpen = true;
        this.loadSettings();
    },

    // Cerrar configuración
    closeSettings() {
        this.elements.settingsModal.classList.add('hidden');
        this.state.settingsOpen = false;
        this.saveSettings();
    },

    // Cargar configuración
    loadSettings() {
        const settings = Storage.getSettings();
        
        const enableCacheEl = document.getElementById('enableCache');
        const cacheTTLEl = document.getElementById('cacheTTL');
        const autoSubdomainsEl = document.getElementById('autoSubdomains');
        const enableNotificationsEl = document.getElementById('enableNotifications');
        
        if (enableCacheEl) enableCacheEl.checked = settings.cacheEnabled;
        if (cacheTTLEl) cacheTTLEl.value = settings.cacheTTL;
        if (autoSubdomainsEl) autoSubdomainsEl.checked = settings.autoSubdomains;
        if (enableNotificationsEl) enableNotificationsEl.checked = settings.notifications;
    },

    // Guardar configuración
    saveSettings() {
        const enableCacheEl = document.getElementById('enableCache');
        const cacheTTLEl = document.getElementById('cacheTTL');
        const autoSubdomainsEl = document.getElementById('autoSubdomains');
        const enableNotificationsEl = document.getElementById('enableNotifications');
        
        const settings = {
            cacheEnabled: enableCacheEl ? enableCacheEl.checked : false,
            cacheTTL: cacheTTLEl ? parseInt(cacheTTLEl.value) : 5,
            autoSubdomains: autoSubdomainsEl ? autoSubdomainsEl.checked : false,
            notifications: enableNotificationsEl ? enableNotificationsEl.checked : false
        };
        
        Storage.saveSettings(settings);
    },

    // Limpiar caché
    clearCache() {
        Storage.clearCache();
        this.showToast('Caché limpiado exitosamente', 'success');
    },

    // Limpiar historial
    clearHistory() {
        Storage.clearHistory();
        this.updateHistory();
        this.showToast('Historial limpiado exitosamente', 'success');
    },

    // Actualizar lista de historial
    updateHistory() {
        const history = Storage.getHistory();
        // Actualizar UI del historial si es necesario
    },

    // Toggle panel de favoritos
    toggleFavorites() {
        this.state.favoritesOpen = !this.state.favoritesOpen;
        this.elements.favoritesPanel.classList.toggle('hidden');
    },

    // Cerrar panel de favoritos
    closeFavorites() {
        this.state.favoritesOpen = false;
        this.elements.favoritesPanel.classList.add('hidden');
    },

    // Actualizar lista de favoritos
    updateFavorites() {
        const favorites = Storage.getFavorites();
        
        if (favorites.length === 0) {
            this.elements.favoritesList.innerHTML = '<p class="text-gray-500 text-sm">No hay favoritos guardados</p>';
            return;
        }
        
        this.elements.favoritesList.innerHTML = favorites.map(fav => `
            <div class="favorite-item" data-domain="${fav.domain}">
                <span class="flex-1">${fav.name}</span>
                <button class="remove-favorite text-red-500" data-id="${fav.id}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
        
        // Vincular eventos
        this.elements.favoritesList.querySelectorAll('.favorite-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.remove-favorite')) {
                    this.elements.domainInput.value = item.dataset.domain;
                    this.closeFavorites();
                    this.handleSearch();
                }
            });
        });
        
        this.elements.favoritesList.querySelectorAll('.remove-favorite').forEach(btn => {
            btn.addEventListener('click', () => {
                Storage.removeFromFavorites(btn.dataset.id);
                this.updateFavorites();
                this.showToast('Eliminado de favoritos', 'info');
            });
        });
    },

    // Añadir dominio actual a favoritos
    addCurrentToFavorites() {
        const domain = DNSLookup.currentDomain;
        if (!domain) {
            this.showToast('No hay dominio activo para guardar', 'error');
            return;
        }
        
        Storage.addToFavorites(domain);
        this.updateFavorites();
        this.showToast('Añadido a favoritos', 'success');
    },

    // Manejar importación de archivo
    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const domains = content.split(/[\n,;]/).map(d => d.trim()).filter(d => d);
            this.elements.batchDomains.value = domains.join('\n');
            this.showToast(`${domains.length} dominios importados`, 'success');
        };
        reader.readAsText(file);
    },

    // Mostrar análisis de salud DNS
    showDNSAnalysis(analysis) {
        let html = '<div class="mt-4 p-4 bg-gray-800 rounded-lg">';
        html += '<h3 class="font-semibold mb-3">Análisis de Configuración DNS</h3>';
        
        if (analysis.good.length > 0) {
            html += '<div class="mb-2">';
            html += '<p class="text-green-500 font-medium mb-1">✓ Configuraciones Correctas:</p>';
            html += '<ul class="text-sm text-gray-400 ml-4">';
            analysis.good.forEach(item => {
                html += `<li>• ${item}</li>`;
            });
            html += '</ul></div>';
        }
        
        if (analysis.warnings.length > 0) {
            html += '<div class="mb-2">';
            html += '<p class="text-yellow-500 font-medium mb-1">⚠ Advertencias:</p>';
            html += '<ul class="text-sm text-gray-400 ml-4">';
            analysis.warnings.forEach(item => {
                html += `<li>• ${item}</li>`;
            });
            html += '</ul></div>';
        }
        
        if (analysis.issues.length > 0) {
            html += '<div>';
            html += '<p class="text-red-500 font-medium mb-1">✗ Problemas Detectados:</p>';
            html += '<ul class="text-sm text-gray-400 ml-4">';
            analysis.issues.forEach(item => {
                html += `<li>• ${item}</li>`;
            });
            html += '</ul></div>';
        }
        
        html += '</div>';
        
        // Insertar después de los resultados
        const analysisDiv = document.createElement('div');
        analysisDiv.innerHTML = html;
        this.elements.resultsContainer.appendChild(analysisDiv);
    },

    // Mostrar resultados de batch
    displayBatchResults(results) {
        const { results: domainResults, errors } = results;
        
        // Limpiar contenedor
        this.elements.cardsView.innerHTML = '';
        this.elements.resultsToolbar.classList.remove('hidden');
        
        // Mostrar cada dominio
        domainResults.forEach(result => {
            const section = document.createElement('div');
            section.className = 'mb-8';
            section.innerHTML = `
                <h3 class="text-xl font-semibold mb-4 text-blue-400">${result.domain}</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <!-- Resultados del dominio -->
                </div>
            `;
            
            const container = section.querySelector('.grid');
            const grouped = Utils.groupRecordsByType(result.records);
            
            Object.entries(grouped).forEach(([type, records]) => {
                const card = document.createElement('div');
                card.className = 'dns-card';
                card.innerHTML = `
                    <div class="flex items-center justify-between mb-3">
                        <span class="dns-type-badge badge-${type}">${type}</span>
                        <span class="text-sm text-gray-500">${records.length}</span>
                    </div>
                    <div class="space-y-1">
                        ${records.map(r => `
                            <div class="text-sm font-mono text-gray-300">${r.value}</div>
                        `).join('')}
                    </div>
                `;
                container.appendChild(card);
            });
            
            this.elements.cardsView.appendChild(section);
        });
        
        // Mostrar errores si hay
        if (errors.length > 0) {
            const errorSection = document.createElement('div');
            errorSection.className = 'mt-4 p-4 bg-red-900/20 border border-red-800 rounded-lg';
            errorSection.innerHTML = `
                <h4 class="font-semibold text-red-400 mb-2">Errores en algunos dominios:</h4>
                <ul class="text-sm text-gray-400">
                    ${errors.map(e => `<li>• ${e.domain}: ${e.error}</li>`).join('')}
                </ul>
            `;
            this.elements.cardsView.appendChild(errorSection);
        }
    },

    // Mostrar comparación
    displayComparison(domain1, domain2, comparison) {
        this.elements.cardsView.innerHTML = `
            <div class="col-span-full">
                <h3 class="text-2xl font-semibold mb-4">
                    Comparación: <span class="text-blue-400">${domain1}</span> vs <span class="text-purple-400">${domain2}</span>
                </h3>
            </div>
        `;
        
        // Diferencias
        if (comparison.differences.length > 0) {
            const diffCard = document.createElement('div');
            diffCard.className = 'col-span-full bg-yellow-900/20 border border-yellow-700 rounded-lg p-4';
            diffCard.innerHTML = '<h4 class="font-semibold text-yellow-400 mb-3">Diferencias Encontradas</h4>';
            
            comparison.differences.forEach(diff => {
                const item = document.createElement('div');
                item.className = 'mb-3';
                item.innerHTML = `
                    <p class="font-medium">${diff.type} - ${diff.message}</p>
                    <ul class="text-sm text-gray-400 ml-4">
                        ${diff.values.map(v => `<li>• ${v}</li>`).join('')}
                    </ul>
                `;
                diffCard.appendChild(item);
            });
            
            this.elements.cardsView.appendChild(diffCard);
        }
        
        // Similitudes
        if (comparison.similarities.length > 0) {
            const simCard = document.createElement('div');
            simCard.className = 'col-span-full bg-green-900/20 border border-green-700 rounded-lg p-4';
            simCard.innerHTML = '<h4 class="font-semibold text-green-400 mb-3">Registros Idénticos</h4>';
            
            comparison.similarities.forEach(sim => {
                const item = document.createElement('div');
                item.className = 'mb-3';
                item.innerHTML = `
                    <p class="font-medium">${sim.type}</p>
                    <ul class="text-sm text-gray-400 ml-4">
                        ${sim.values.map(v => `<li>• ${v}</li>`).join('')}
                    </ul>
                `;
                simCard.appendChild(item);
            });
            
            this.elements.cardsView.appendChild(simCard);
        }
        
        this.elements.resultsToolbar.classList.remove('hidden');
    },

    // Inicializar atajos de teclado
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K: Focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.elements.domainInput.focus();
                this.elements.domainInput.select();
            }
            
            // Escape: Clear results
            if (e.key === 'Escape') {
                if (this.state.settingsOpen) {
                    this.closeSettings();
                } else if (this.state.favoritesOpen) {
                    this.closeFavorites();
                } else {
                    this.clearResults();
                }
            }
            
            // Ctrl/Cmd + D: Toggle theme
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                this.toggleTheme();
            }
            
            // Ctrl/Cmd + E: Export
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                if (DNSLookup.currentResults.length > 0) {
                    this.exportResults('json');
                }
            }
        });
    },

    // Inicializar tooltips
    initTooltips() {
        // Los tooltips ya se manejan en showTooltip
    }
};

// Hacer UI disponible globalmente
window.UI = UI;
