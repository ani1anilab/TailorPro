// Measurements management module - Main controller
const Measurements = {
    currentMeasurements: [],
    customMeasurementFields: [],
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
        this.loadMeasurements();
        this.loadCustomFields();
        this.bindEvents();
        this.populateCustomerSelects();
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
    },

    getMeasurementTemplateWithCustomFields(clothingType) {
        const baseTemplate = { ...this.measurementTemplates[clothingType] || this.measurementTemplates['shirt'] };
        
        // Add custom fields to the template
        this.customMeasurementFields.forEach(field => {
            baseTemplate[field.key] = field.label;
        });
        
        return baseTemplate;
    },

    updateMeasurementFields(clothingType) {
        const container = document.getElementById('measurementFields');
        const template = this.getMeasurementTemplateWithCustomFields(clothingType);

        if (!template) {
            container.innerHTML = '';
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
            document.getElementById('customTypeContainer').style.display = 'none';
            this.updateMeasurementFields('shirt');
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
        const template = this.measurementTemplates[clothingType];
        Object.keys(template).forEach(key => {
            const input = document.getElementById(`measurement_${key}`);
            if (input) measurements[key] = parseFloat(input.value);
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
                Storage.saveAllData(Storage.getAllData());
            }
        } else {
            // Add new measurement
            Storage.addMeasurement(measurementData);
        }

        this.loadMeasurements();
        this.hideMeasurementModal();
    },

    renderMeasurements(filteredMeasurements = null) {
        const measurements = filteredMeasurements || this.currentMeasurements;
        const container = document.getElementById('measurementsList');
        const sizeUnit = this.getSizeUnit();
        
        if (measurements.length === 0) {
            container.innerHTML = '<p class="empty-state">No measurements found. Add a new measurement to get started.</p>';
            return;
        }

        container.innerHTML = measurements.map(measurement => {
            const customer = Storage.getCustomers().find(c => c.id === measurement.customerId);
            const template = this.measurementTemplates[measurement.clothingType] || this.measurementTemplates['shirt'];
            const displayType = measurement.clothingType === 'other' && measurement.customType 
                ? measurement.customType 
                : measurement.clothingType;
            
            return `
                <div class="measurement-card">
                    <div class="measurement-header">
                        <div>
                            <h4>${customer ? customer.name : 'Unknown Customer'}</h4>
                            <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">
                                ${customer ? `${customer.phone} • ${customer.village}` : ''}
                            </p>
                        </div>
                        <span class="clothing-type">${displayType}</span>
                    </div>
                    <div class="measurement-values">
                        ${Object.entries(measurement.measurements).map(([key, value]) => `
                            <div class="measurement-item">
                                <span class="measurement-label">${template[key] || key}:</span>
                                <span class="measurement-value">${value}${sizeUnit}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="measurement-actions">
                        <button class="btn btn-sm btn-secondary" onclick="Measurements.editMeasurement(${measurement.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    filterByCustomer(customerId) {
        if (!customerId) {
            this.renderMeasurements();
            return;
        }

        const filtered = this.currentMeasurements.filter(m => m.customerId === parseInt(customerId));
        this.renderMeasurements(filtered);
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