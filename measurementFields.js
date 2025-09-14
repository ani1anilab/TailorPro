// Measurement fields management module
const MeasurementFields = {
    showCustomFieldsModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>Measurement Fields Manager</h3>
                
                <div style="margin-bottom: 2rem;">
                    <h4>Size Format Settings</h4>
                    <div class="form-group">
                        <label for="sizeFormat">Measurement Unit</label>
                        <select id="sizeFormat" class="minimal-select">
                            <option value="inches">Inches (")</option>
                            <option value="centimeters">Centimeters (cm)</option>
                            <option value="millimeters">Millimeters (mm)</option>
                        </select>
                    </div>
                </div>

                <div style="margin-bottom: 2rem;">
                    <h4>Default Fields</h4>
                    <div id="defaultFieldsList" style="margin: 1rem 0;">
                        ${this.renderDefaultFieldsList()}
                    </div>
                </div>

                <div style="margin-bottom: 2rem;">
                    <h4>Custom Fields</h4>
                    <div id="customFieldsList" style="margin: 1rem 0;">
                        ${this.renderCustomFieldsList()}
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="newFieldName">Add New Field</label>
                    <input type="text" id="newFieldName" placeholder="Enter field name (e.g., Neck, Wrist)">
                </div>
                <div class="form-actions">
                    <button class="btn btn-primary" onclick="MeasurementFields.addCustomField()">Add Custom Field</button>
                    <button class="btn btn-secondary" onclick="this.closest('.modal').style.display='none'">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        
        // Load saved size format
        const savedFormat = Measurements.getSizeFormat();
        document.getElementById('sizeFormat').value = savedFormat;
        document.getElementById('sizeFormat').addEventListener('change', (e) => Measurements.saveSizeFormat(e.target.value));
        
        modal.querySelector('.close').addEventListener('click', () => {
            modal.style.display = 'none';
            modal.remove();
        });
    },

    renderDefaultFieldsList() {
        let html = '';
        Object.entries(Measurements.measurementTemplates).forEach(([type, fields]) => {
            html += `<div style="margin-bottom: 1rem;"><h5 style="text-transform: capitalize; color: var(--text-secondary);" data-translate="clothing_type_${type}">${type}:</h5>`;
            Object.entries(fields).forEach(([key, label]) => {
                html += `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 5px; margin-bottom: 0.25rem;">
                        <span data-translate="measurement_${key}">${label}</span>
                        <span style="color: var(--text-secondary); font-size: 0.8rem;" data-translate="default">Default</span>
                    </div>
                `;
            });
            html += '</div>';
        });
        return html;
    },

    renderCustomFieldsList() {
        const data = Storage.getAllData();
        const customFields = data.customMeasurementFields || [];
        
        if (customFields.length === 0) {
            return '<p style="color: var(--text-secondary); text-align: center; padding: 1rem;" data-translate="no_custom_fields">No custom fields added yet.</p>';
        }
        
        return customFields.map(field => `
            <div class="field-item">
                <span data-translate="custom_field_${field.key}">${field.label}</span>
                <div class="field-actions">
                    <button class="btn btn-sm btn-danger" onclick="MeasurementFields.removeCustomField('${field.key}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },

    addCustomField() {
        const input = document.getElementById('newFieldName');
        const fieldName = input.value.trim();
        
        if (!fieldName) {
            alert('Please enter a field name');
            return;
        }
        
        const fieldKey = fieldName.toLowerCase().replace(/\s+/g, '_');
        
        // Check if field already exists
        const data = Storage.getAllData();
        const customFields = data.customMeasurementFields || [];
        
        if (customFields.find(f => f.key === fieldKey)) {
            alert('This field already exists');
            return;
        }
        
        customFields.push({
            key: fieldKey,
            label: fieldName
        });
        
        data.customMeasurementFields = customFields;
        Storage.saveAllData(data);
        
        input.value = '';
        
        // Refresh the lists
        document.getElementById('customFieldsList').innerHTML = this.renderCustomFieldsList();
        
        // Refresh measurements if the module is loaded
        if (typeof Measurements !== 'undefined') {
            Measurements.customMeasurementFields = customFields;
            Measurements.loadMeasurements();
        }
    },

    removeCustomField(fieldKey) {
        CustomPopup.show({
            icon: 'fas fa-trash',
            title: 'Remove Custom Field',
            message: 'Are you sure you want to remove this custom field? This will not affect existing measurements.',
            confirmText: 'Remove',
            confirmClass: 'btn-danger',
            onConfirm: () => {
                const data = Storage.getAllData();
                const customFields = data.customMeasurementFields || [];
                data.customMeasurementFields = customFields.filter(f => f.key !== fieldKey);
                Storage.saveAllData(data);
                
                // Refresh the lists
                document.getElementById('customFieldsList').innerHTML = this.renderCustomFieldsList();
                
                // Refresh measurements if the module is loaded
                if (typeof Measurements !== 'undefined') {
                    Measurements.customMeasurementFields = data.customMeasurementFields;
                    Measurements.loadMeasurements();
                }
            }
        });
    }
};