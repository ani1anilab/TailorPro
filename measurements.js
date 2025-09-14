// Measurements management module - Main controller
const Measurements = {
    currentMeasurements: [],
    customMeasurementFields: [],
    measurementTemplates: {
        // Remove all default templates - only custom fields will be used
        other: {} // Empty template for custom clothing type
    },

    init() {
        this.loadMeasurements();
        this.loadCustomFields();
        this.bindEvents();
        this.populateCustomerSelects();
        // Set default to 'other' and hide the clothing type selector
        this.setDefaultClothingType();
    },

    setDefaultClothingType() {
        // Hide the clothing type dropdown container
        const clothingTypeGroup = document.getElementById('clothingType').closest('.form-group');
        if (clothingTypeGroup) {
            clothingTypeGroup.style.display = 'none';
        }
        
        // Set clothing type to 'other' and show custom type container
        document.getElementById('clothingType').value = 'other';
        document.getElementById('customTypeContainer').style.display = 'block';
        
        // Update measurement fields for 'other' type (which will now be empty)
        this.updateMeasurementFields('other');
    },

    bindEvents() {
        document.getElementById('addMeasurementBtn').addEventListener('click', () => this.showMeasurementModal());
        document.getElementById('measurementForm').addEventListener('submit', (e) => this.handleMeasurementSubmit(e));
        document.getElementById('cancelMeasurement').addEventListener('click', () => this.hideMeasurementModal());
        document.getElementById('clothingType').addEventListener('change', (e) => this.handleClothingTypeChange(e));
        
        // Update manage fields button to navigate to settings
        const manageFieldsBtn = document.getElementById('manageFieldsBtn');
        if (manageFieldsBtn) {
            manageFieldsBtn.addEventListener('click', () => {
                // Navigate to settings section
                document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
                document.querySelector('[data-section="settings"]').classList.add('active');
                
                document.querySelectorAll('.content-section').forEach(section => {
                    section.classList.remove('active');
                });
                document.getElementById('settings').classList.add('active');
                
                // Show measurement settings tab
                if (typeof Settings !== 'undefined') {
                    Settings.showSettingsTab('measurement');
                }
            });
        }
        
        // Only add customer select event if element exists
        const customerSelect = document.getElementById('measurementCustomerSelect');
        if (customerSelect) {
            customerSelect.addEventListener('change', (e) => this.filterByCustomer(e.target.value));
        }
        
        // Add search functionality
        const searchInput = document.getElementById('measurementSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.searchMeasurements(e.target.value));
        }

        // Modal close
        const closeBtn = document.querySelector('#measurementModal .close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideMeasurementModal());
        }
    },

    handleClothingTypeChange(e) {
        const clothingType = e.target.value;
        const customTypeContainer = document.getElementById('customTypeContainer');
        
        if (clothingType === 'other') {
            customTypeContainer.style.display = 'block';
            document.getElementById('customClothingType').focus();
        } else {
            customTypeContainer.style.display = 'none';
        }
        
        // Always update fields regardless of type
        this.updateMeasurementFields(clothingType);
    },

    loadMeasurements() {
        this.currentMeasurements = Storage.getMeasurements();
        this.renderMeasurements();
    },

    loadCustomFields() {
        const data = Storage.getAllData();
        this.customMeasurementFields = data.customMeasurementFields || [];
    },

    populateCustomerSelects() {
        const customers = Storage.getCustomers();
        const selects = [
            document.getElementById('measurementCustomer'),
            document.getElementById('measurementCustomerSelect'),
            document.getElementById('orderCustomer')
        ];

        selects.forEach(select => {
            const currentValue = select.value;
            const isFilterSelect = select.id === 'measurementCustomerSelect';
            
            select.innerHTML = isFilterSelect ? '<option value="">All Customers</option>' : '<option value="">Select Customer</option>';
            
            customers.forEach(customer => {
                const option = document.createElement('option');
                option.value = customer.id;
                option.textContent = `${customer.name} (${customer.phone})`;
                select.appendChild(option);
            });

            select.value = currentValue;
        });

        // Refresh searchable dropdowns
        if (typeof SearchableSelect !== 'undefined') {
            selects.forEach(select => {
                SearchableSelect.refreshDropdown(select);
            });
        }
    },

    getMeasurementTemplateWithCustomFields(clothingType) {
        // Only return custom fields - no default templates
        const customFieldsOnly = {};
        
        // Add custom fields to the template
        this.customMeasurementFields.forEach(field => {
            customFieldsOnly[field.key] = field.label;
        });
        
        return customFieldsOnly;
    },

    updateMeasurementFields(clothingType) {
        const container = document.getElementById('measurementFields');
        const template = this.getMeasurementTemplateWithCustomFields(clothingType);

        if (!template || Object.keys(template).length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;" data-translate="no_custom_fields">No custom measurement fields added yet. Please add custom fields in Settings > Measurements.</p>';
            return;
        }

        container.innerHTML = Object.entries(template).map(([key, label]) => `
            <div class="form-group">
                <label for="measurement_${key}">${label} (${this.getSizeFormat()})</label>
                <input type="number" id="measurement_${key}" name="${key}" step="0.1" required>
            </div>
        `).join('');
    },

    showMeasurementModal(measurement = null) {
        const modal = document.getElementById('measurementModal');
        const form = document.getElementById('measurementForm');

        if (measurement) {
            document.getElementById('measurementId').value = measurement.id;
            document.getElementById('measurementCustomer').value = measurement.customerId;
            document.getElementById('clothingType').value = measurement.clothingType;
            
            if (measurement.clothingType === 'other') {
                document.getElementById('customClothingType').value = measurement.customType || '';
                document.getElementById('customTypeContainer').style.display = 'block';
            }
            
            // Update fields before setting values
            this.updateMeasurementFields(measurement.clothingType);
            
            // Fill measurement values
            Object.entries(measurement.measurements).forEach(([key, value]) => {
                const input = document.getElementById(`measurement_${key}`);
                if (input) input.value = value;
            });
        } else {
            form.reset();
            document.getElementById('measurementId').value = '';
            // Keep the default behavior for new measurements
            this.setDefaultClothingType();
        }

        // Update modal title
        const modalTitle = modal.querySelector('h3');
        if (modalTitle) {
            modalTitle.setAttribute('data-translate', measurement ? 'edit_measurement' : 'add_measurement');
        }

        modal.style.display = 'block';
    },

    hideMeasurementModal() {
        document.getElementById('measurementModal').style.display = 'none';
        document.getElementById('customTypeContainer').style.display = 'none';
    },

    handleMeasurementSubmit(e) {
        e.preventDefault();

        const customerId = parseInt(document.getElementById('measurementCustomer').value);
        const clothingType = document.getElementById('clothingType').value;
        const measurementId = document.getElementById('measurementId').value;
        
        let customType = '';
        if (clothingType === 'other') {
            customType = document.getElementById('customClothingType').value.trim();
            if (!customType) {
                alert('Please enter a custom clothing type');
                return;
            }
        }

        // Collect measurement values
        const measurements = {};
        // Use the correct template that includes custom fields
        const template = this.getMeasurementTemplateWithCustomFields(clothingType);
        Object.keys(template).forEach(key => {
            const input = document.getElementById(`measurement_${key}`);
            if (input && input.value) measurements[key] = parseFloat(input.value);
        });

        const measurementData = {
            customerId,
            clothingType,
            customType: customType || undefined,
            measurements,
            createdAt: new Date().toISOString()
        };

        if (measurementId) {
            // Update existing measurement
            const existing = this.currentMeasurements.find(m => m.id === parseInt(measurementId));
            if (existing) {
                Object.assign(existing, measurementData);
                const data = Storage.getAllData();
                const measurementIndex = data.measurements.findIndex(m => m.id === parseInt(measurementId));
                if (measurementIndex !== -1) {
                    data.measurements[measurementIndex] = existing;
                    Storage.saveAllData(data);
                }
            }
        } else {
            // Add new measurement
            Storage.addMeasurement(measurementData);
        }

        this.loadMeasurements();
        this.hideMeasurementModal();
        
        // Translate any new dynamic content
        if (typeof TranslationManager !== 'undefined') {
            TranslationManager.translateDynamicContent(document.getElementById('measurementsList'));
        }
    },

    renderMeasurements(filteredMeasurements = null) {
        const measurements = filteredMeasurements || this.currentMeasurements;
        const container = document.getElementById('measurementsList');
        const sizeUnit = this.getSizeUnit();
        
        if (measurements.length === 0) {
            container.innerHTML = '<p class="empty-state" data-translate="no_measurements">No measurements found. Add a new measurement to get started.</p>';
            return;
        }

        container.innerHTML = measurements.map(measurement => {
            const customer = Storage.getCustomers().find(c => c.id === measurement.customerId);
            
            // Get all measurement fields (custom + default) to look up labels by key
            const data = Storage.getAllData();
            const customFields = data.customMeasurementFields || [];

            const displayType = measurement.clothingType === 'other' && measurement.customType 
                ? measurement.customType 
                : measurement.clothingType;
            
            return `
                <div class="measurement-card">
                    <div class="measurement-header">
                        <div>
                            <h4 data-auto-translate="true">${customer ? customer.name : 'Unknown Customer'}</h4>
                            <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;" data-auto-translate="true">
                                ${customer ? `${customer.phone} • ${customer.village}` : ''}
                            </p>
                        </div>
                        <span class="clothing-type" data-auto-translate="true">${displayType}</span>
                    </div>
                    <div class="measurement-values">
                        ${Object.entries(measurement.measurements).map(([key, value]) => {
                            const field = customFields.find(f => f.key === key);
                            const label = field ? field.label : key;
                            return `
                            <div class="measurement-item">
                                <span class="measurement-label" data-auto-translate="true">${label}:</span>
                                <span class="measurement-value">${value}${sizeUnit}</span>
                            </div>
                        `}).join('')}
                    </div>
                    <div class="measurement-actions">
                        <button class="btn btn-sm btn-secondary" onclick="Measurements.editMeasurement(${measurement.id})">
                            <i class="fas fa-edit"></i> <span class="action-text">Edit</span>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="Measurements.deleteMeasurement(${measurement.id})">
                            <i class="fas fa-trash"></i> <span class="action-text">Delete</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Translate any dynamic content just rendered
        if (typeof TranslationManager !== 'undefined') {
            TranslationManager.translateDynamicContent(container);
        }
    },

    filterByCustomer(customerId) {
        if (!customerId) {
            this.renderMeasurements();
            return;
        }

        const filtered = this.currentMeasurements.filter(m => m.customerId === parseInt(customerId));
        this.renderMeasurements(filtered);
        
        // Update the customer select dropdown to show the selected customer
        const filterSelect = document.getElementById('measurementCustomerSelect');
        if (filterSelect) {
            filterSelect.value = customerId;
        }

        // Clear search input in searchable select
        const wrapper = filterSelect?.closest('.searchable-select-wrapper');
        if (wrapper) {
            const searchInput = wrapper.querySelector('.select-search-input');
            if (searchInput) {
                // Find the selected option text and set it
                const selectedOption = filterSelect.options[filterSelect.selectedIndex];
                if (selectedOption) {
                    searchInput.value = selectedOption.textContent;
                }
            }
        }
    },

    searchMeasurements(query) {
        if (!query.trim()) {
            this.renderMeasurements();
            return;
        }

        const customers = Storage.getCustomers();
        const filtered = this.currentMeasurements.filter(measurement => {
            const customer = customers.find(c => c.id === measurement.customerId);
            const customerName = customer ? customer.name.toLowerCase() : '';
            const clothingType = measurement.clothingType.toLowerCase();
            const customType = measurement.customType ? measurement.customType.toLowerCase() : '';
            const searchLower = query.toLowerCase();

            // Search by customer name
            if (customerName.includes(searchLower)) return true;
            
            // Search by clothing type (including custom type)
            if (clothingType.includes(searchLower) || customType.includes(searchLower)) return true;
            
            // Search in measurement values
            const measurementValues = Object.values(measurement.measurements).map(v => String(v));
            return measurementValues.some(value => value.includes(searchLower));
        });

        this.renderMeasurements(filtered);
    },

    editMeasurement(id) {
        const measurement = this.currentMeasurements.find(m => m.id === id);
        if (measurement) {
            this.showMeasurementModal(measurement);
        }
    },

    deleteMeasurement(id) {
        const measurement = this.currentMeasurements.find(m => m.id === id);
        if (!measurement) return;
        
        const customer = Storage.getCustomers().find(c => c.id === measurement.customerId);
        const customerName = customer ? customer.name : 'Unknown Customer';
        
        CustomPopup.show({
            icon: 'fas fa-trash',
            title: 'Delete Measurement',
            message: `Are you sure you want to delete this measurement for ${customerName}? This action cannot be undone.`,
            confirmText: 'Delete',
            confirmClass: 'btn-danger',
            onConfirm: () => {
                const data = Storage.getAllData();
                data.measurements = data.measurements.filter(m => m.id !== id);
                Storage.saveAllData(data);
                this.loadMeasurements();
                
                // Translate any updated content
                if (typeof TranslationManager !== 'undefined') {
                    const container = document.getElementById('measurementsList');
                    TranslationManager.translateDynamicContent(container);
                }
            }
        });
    },

    showCustomFieldsModal() {
        // removed - moved to measurementFields.js
        if (typeof MeasurementFields !== 'undefined') {
            MeasurementFields.showCustomFieldsModal();
        }
    },

    getSizeFormat() {
        const data = Storage.getAllData();
        return data.sizeFormat || 'inches';
    },

    saveSizeFormat(format) {
        const data = Storage.getAllData();
        data.sizeFormat = format;
        Storage.saveAllData(data);
        this.loadMeasurements(); // Refresh to apply new format
    },

    getSizeUnit() {
        const format = this.getSizeFormat();
        switch(format) {
            case 'centimeters': return 'cm';
            case 'millimeters': return 'mm';
            default: return '"';
        }
    }
};