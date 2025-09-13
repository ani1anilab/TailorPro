// Settings management module - Updated with team tab
const Settings = {
    measurementTemplates: {
        shirt: {
            chest: 'Chest',
            waist: 'Waist',
            hips: 'Hips',
            shoulder: 'Shoulder',
            sleeve: 'Sleeve Length',
            length: 'Length'
        },
        pant: {
            waist: 'Waist',
            hips: 'Hips',
            thigh: 'Thigh',
            knee: 'Knee',
            ankle: 'Ankle',
            length: 'Length'
        },
        suit: {
            chest: 'Chest',
            waist: 'Waist',
            hips: 'Hips',
            shoulder: 'Shoulder',
            sleeve: 'Sleeve Length',
            length: 'Length'
        },
        dress: {
            bust: 'Bust',
            waist: 'Waist',
            hips: 'Hips',
            shoulder: 'Shoulder',
            sleeve: 'Sleeve Length',
            length: 'Length'
        }
    },

    init() {
        this.loadSettings();
        this.bindEvents();
        this.showSettingsTab('measurement'); // Show measurement tab by default
    },

    showSettingsTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.settings-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Hide all settings cards
        document.querySelectorAll('.settings-card').forEach(card => {
            card.style.display = 'none';
        });
        
        // Show selected tab content
        let cardIndex;
        switch(tabName) {
            case 'measurement':
                cardIndex = 1;
                break;
            case 'team':
                cardIndex = 6;
                break;
        }
        
        const targetCard = document.querySelector(`.settings-card:nth-child(${cardIndex})`);
        if (targetCard) {
            targetCard.style.display = 'block';
        }
    },

    bindEvents() {
        // Settings tab navigation
        document.querySelectorAll('.settings-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.currentTarget.getAttribute('data-tab');
                this.showSettingsTab(tabName);
                
                // Update active tab button
                document.querySelectorAll('.settings-tab-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });

        // Size format settings
        document.getElementById('sizeFormatSettings').addEventListener('change', (e) => {
            this.saveSizeFormat(e.target.value);
        });

        // Date format settings
        document.getElementById('dateFormatSettings').addEventListener('change', (e) => {
            this.saveDateFormat(e.target.value);
        });

        // Theme settings
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const theme = e.currentTarget.getAttribute('data-theme');
                this.setTheme(theme);
            });
        });

        // Language settings
        document.getElementById('languageSettings').addEventListener('click', (e) => {
            this.setLanguage(e.target.value);
        });
    },

    loadSettings() {
        this.loadSizeFormat();
        this.loadDateFormat();
        this.loadDefaultFields();
        this.loadCustomFields();
        this.loadTheme();
        this.loadLanguage();
        this.loadTeamSettings();
    },

    loadTeamSettings() {
        // Initialize team module if available
        if (typeof Team !== 'undefined') {
            Team.init();
        }
    },

    loadSizeFormat() {
        const format = this.getSizeFormat();
        document.getElementById('sizeFormatSettings').value = format;
    },

    loadDateFormat() {
        const format = this.getDateFormat();
        document.getElementById('dateFormatSettings').value = format;
    },

    loadDefaultFields() {
        const container = document.getElementById('defaultFieldsSettings');
        let html = '';
        
        Object.entries(this.measurementTemplates).forEach(([type, fields]) => {
            html += `<div style="margin-bottom: 1rem;"><h5 style="text-transform: capitalize; color: var(--text-secondary);">${type}:</h5>`;
            Object.entries(fields).forEach(([key, label]) => {
                html += `
                    <div class="field-item">
                        <span>${label}</span>
                        <span class="field-type">Default</span>
                    </div>
                `;
            });
            html += '</div>';
        });
        
        container.innerHTML = html;
    },

    loadCustomFields() {
        const data = Storage.getAllData();
        const customFields = data.customMeasurementFields || [];
        const container = document.getElementById('customFieldsSettings');
        
        if (customFields.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 1rem;">No custom fields added yet.</p>';
            return;
        }
        
        container.innerHTML = customFields.map(field => `
            <div class="field-item">
                <span>${field.label}</span>
                <div class="field-actions">
                    <button class="btn btn-sm btn-danger" onclick="Settings.removeCustomField('${field.key}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },

    loadTheme() {
        const savedTheme = localStorage.getItem('selectedTheme') || 'light';
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.theme === savedTheme) {
                btn.classList.add('active');
            }
        });
    },

    loadLanguage() {
        const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
        document.getElementById('languageSettings').value = savedLanguage;
    },

    saveSizeFormat(format) {
        const data = Storage.getAllData();
        data.sizeFormat = format;
        Storage.saveAllData(data);
        
        // Refresh measurements if the module is loaded
        if (typeof Measurements !== 'undefined') {
            if (typeof Measurements.loadMeasurements === 'function') {
                Measurements.loadMeasurements();
            }
            // Also update the current modal if open
            const modal = document.getElementById('measurementModal');
            if (modal && modal.style.display === 'block') {
                const clothingType = document.getElementById('clothingType').value;
                if (clothingType) {
                    Measurements.updateMeasurementFields(clothingType);
                }
            }
        }
    },

    saveDateFormat(format) {
        const data = Storage.getAllData();
        data.dateFormat = format;
        Storage.saveAllData(data);
        
        // Refresh all date displays
        this.refreshAllDateDisplays();
    },

    getSizeFormat() {
        const data = Storage.getAllData();
        return data.sizeFormat || 'inches';
    },

    getDateFormat() {
        const data = Storage.getAllData();
        return data.dateFormat || 'MM/DD/YYYY';
    },

    refreshAllDateDisplays() {
        // Refresh dashboard stats
        if (typeof Dashboard !== 'undefined') {
            Dashboard.updateStats();
        }
        
        // Refresh measurements
        if (typeof Measurements !== 'undefined') {
            Measurements.loadMeasurements();
        }
        
        // Refresh orders
        if (typeof Orders !== 'undefined') {
            Orders.loadOrders();
        }
        
        // Refresh team members
        if (typeof Team !== 'undefined') {
            Team.loadTeam();
        }
        
        // Refresh export tables
        if (typeof Export !== 'undefined') {
            const activeTable = document.querySelector('.table-type-btn.active');
            if (activeTable) {
                Export.loadTableView(activeTable.dataset.type);
            }
        }
    },

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('selectedTheme', theme);
        
        // Update theme button states
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.theme === theme) {
                btn.classList.add('active');
            }
        });
        
        // Update main theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    },

    setLanguage(language) {
        localStorage.setItem('selectedLanguage', language);
        
        if (language !== 'en') {
            TranslationManager.translatePage(language);
        } else {
            location.reload();
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
        
        // Show success notification
        this.showNotification(`Field "${fieldName}" added successfully!`, 'success');
        
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
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        // Set background color based on type
        const colors = {
            success: '#27ae60',
            warning: '#f39c12',
            info: '#3498db'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    },

    exportData() {
        const data = Storage.getAllData();
        const exportData = JSON.stringify(data, null, 2);
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tailor_data_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
    },

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    Storage.saveAllData(data);
                    alert('Data imported successfully!');
                    location.reload();
                } catch (error) {
                    alert('Error importing data. Please check the file format.');
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
            message: 'Are you sure you want to reset all data? This will delete all customers, measurements, and orders. This action cannot be undone.',
            confirmText: 'Reset All Data',
            confirmClass: 'btn-danger',
            onConfirm: () => {
                const defaultData = {
                    customers: [],
                    measurements: [],
                    orders: [],
                    teamMembers: [],
                    nextCustomerId: 1,
                    nextMeasurementId: 1,
                    nextOrderId: 1,
                    sizeFormat: 'inches',
                    customMeasurementFields: []
                };
                Storage.saveAllData(defaultData);
                alert('All data has been reset!');
                location.reload();
            }
        });
    }
};

// Initialize settings when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Settings module
    if (typeof Settings !== 'undefined') {
        Settings.init();
    }
});