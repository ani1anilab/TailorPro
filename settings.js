// Settings functionality module
const Settings = {
    currentTab: 'measurement',

    init() {
        this.loadSettings();
        this.bindEvents();
        this.loadCustomFields();
    },

    loadSettings() {
        const data = Storage.getAllData();
        
        // Load size format
        const sizeFormat = data.sizeFormat || 'inches';
        const sizeFormatElement = document.getElementById('sizeFormatSettings');
        if (sizeFormatElement) {
            sizeFormatElement.value = sizeFormat;
        }
        
        // Load date format
        const dateFormat = data.dateFormat || 'MM/DD/YYYY';
        const dateFormatElement = document.getElementById('dateFormatSettings');
        if (dateFormatElement) {
            dateFormatElement.value = dateFormat;
        }
        
        // Load theme
        const theme = data.theme || 'light';
        const themeElement = document.getElementById('themeSettings');
        if (themeElement) {
            themeElement.value = theme;
        }
        
        // Load language
        const language = data.language || 'en';
        const languageElement = document.getElementById('languageSettings');
        if (languageElement) {
            languageElement.value = language;
        }
    },

    bindEvents() {
        // Settings tab navigation
        document.querySelectorAll('.settings-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.getAttribute('data-tab');
                this.showSettingsTab(tab);
            });
        });

        // Size format change
        const sizeFormatElement = document.getElementById('sizeFormatSettings');
        if (sizeFormatElement) {
            sizeFormatElement.addEventListener('change', (e) => {
                const data = Storage.getAllData();
                data.sizeFormat = e.target.value;
                Storage.saveAllData(data);
                this.showNotification('Size format updated', 'success');
                
                // Refresh measurements if module is loaded
                if (typeof Measurements !== 'undefined') {
                    Measurements.loadMeasurements();
                }
            });
        }
        
        // Date format change
        const dateFormatElement = document.getElementById('dateFormatSettings');
        if (dateFormatElement) {
            dateFormatElement.addEventListener('change', (e) => {
                const data = Storage.getAllData();
                data.dateFormat = e.target.value;
                Storage.saveAllData(data);
                this.showNotification('Date format updated', 'success');
            });
        }
    },

    showSettingsTab(tabName) {
        this.currentTab = tabName;
        
        // Update active tab button
        document.querySelectorAll('.settings-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Show corresponding content
        const containers = document.querySelectorAll('.settings-container > div');
        containers.forEach(container => container.style.display = 'none');
        
        // Show the selected tab content
        if (tabName === 'measurement') {
            document.getElementById('measurementSettings').style.display = 'block';
        }
    },

    loadCustomFields() {
        const data = Storage.getAllData();
        const defaultFields = data.defaultMeasurementFields || [];
        const customFields = data.customMeasurementFields || [];
        
        // Render default fields
        const defaultContainer = document.getElementById('defaultFieldsSettings');
        if (defaultContainer) {
            defaultContainer.innerHTML = defaultFields.map(field => `
                <div class="field-item">
                    <span>${field.label}</span>
                    <span class="field-type">Default</span>
                </div>
            `).join('');
        }
        
        // Render custom fields
        const customContainer = document.getElementById('customFieldsSettings');
        if (customContainer) {
            customContainer.innerHTML = customFields.map(field => `
                <div class="field-item">
                    <span>${field.label}</span>
                    <div class="field-actions">
                        <button class="btn btn-sm btn-danger" onclick="Settings.removeCustomField('${field.key}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
    },

    addCustomField() {
        const input = document.getElementById('newFieldNameSettings');
        const fieldName = input.value.trim();
        
        if (!fieldName) {
            this.showNotification('Please enter a field name', 'warning');
            return;
        }
        
        const fieldKey = fieldName.toLowerCase().replace(/\s+/g, '_');
        
        // Check if field already exists
        const data = Storage.getAllData();
        const customFields = data.customMeasurementFields || [];
        
        if (customFields.find(f => f.key === fieldKey)) {
            this.showNotification('This field already exists', 'warning');
            return;
        }
        
        customFields.push({
            key: fieldKey,
            label: fieldName
        });
        
        data.customMeasurementFields = customFields;
        Storage.saveAllData(data);
        
        input.value = '';
        
        this.loadCustomFields();
        this.showNotification(`Field "${fieldName}" added`, 'success');
        
        // Refresh measurements if the module is loaded
        if (typeof Measurements !== 'undefined') {
            Measurements.customMeasurementFields = customFields;
        }
    },

    removeCustomField(fieldKey) {
        const field = this.getCustomFieldByKey(fieldKey);
        if (!field) return;
        
        CustomPopup.show({
            icon: 'fas fa-trash',
            title: 'Remove Custom Field',
            message: `Are you sure you want to remove "${field.label}"? This will not affect existing measurements.`,
            confirmText: 'Remove',
            confirmClass: 'btn-danger',
            onConfirm: () => {
                const data = Storage.getAllData();
                const customFields = data.customMeasurementFields || [];
                data.customMeasurementFields = customFields.filter(f => f.key !== fieldKey);
                Storage.saveAllData(data);
                
                this.loadCustomFields();
                this.showNotification(`Field "${field.label}" removed`, 'info');
                
                // Refresh measurements if the module is loaded
                if (typeof Measurements !== 'undefined') {
                    Measurements.customMeasurementFields = data.customMeasurementFields;
                }
            }
        });
    },

    getCustomFieldByKey(fieldKey) {
        const data = Storage.getAllData();
        const customFields = data.customMeasurementFields || [];
        return customFields.find(f => f.key === fieldKey);
    },

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--${type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'info'}-color);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 3000);
    },

    exportData() {
        const data = Storage.getAllData();
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tailor_data_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.showNotification('Data exported successfully', 'success');
    },

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    Storage.saveAllData(data);
                    this.loadSettings();
                    this.showNotification('Data imported successfully', 'success');
                    
                    // Refresh all modules
                    if (typeof Customers !== 'undefined') Customers.loadCustomers();
                    if (typeof Measurements !== 'undefined') Measurements.loadMeasurements();
                    if (typeof Orders !== 'undefined') Orders.loadOrders();
                    if (typeof Team !== 'undefined') Team.loadTeam();
                    if (typeof Dashboard !== 'undefined') Dashboard.updateStats();
                } catch (error) {
                    this.showNotification('Invalid data file', 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    },

    resetAllData() {
        CustomPopup.show({
            icon: 'fas fa-exclamation-triangle',
            title: 'Reset All Data',
            message: 'Are you absolutely sure? This will delete ALL customers, measurements, orders, and team members. This action cannot be undone.',
            confirmText: 'Reset Everything',
            confirmClass: 'btn-danger',
            onConfirm: () => {
                localStorage.removeItem('tailorData');
                Storage.init();
                this.loadSettings();
                this.showNotification('All data has been reset', 'info');
                
                // Refresh all modules
                if (typeof Customers !== 'undefined') Customers.loadCustomers();
                if (typeof Measurements !== 'undefined') Measurements.loadMeasurements();
                if (typeof Orders !== 'undefined') Orders.loadOrders();
                if (typeof Team !== 'undefined') Team.loadTeam();
                if (typeof Dashboard !== 'undefined') Dashboard.updateStats();
            }
        });
    }
};