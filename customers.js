// Customers management module
const Customers = {
    currentCustomers: [],

    init() {
        this.loadCustomers();
        this.bindEvents();
    },

    bindEvents() {
        document.getElementById('addCustomerBtn').addEventListener('click', () => this.showCustomerModal());
        document.getElementById('customerForm').addEventListener('submit', (e) => this.handleCustomerSubmit(e));
        document.getElementById('cancelCustomer').addEventListener('click', () => this.hideCustomerModal());
        document.getElementById('customerSearch').addEventListener('input', (e) => this.searchCustomers(e.target.value));

        // Modal close
        document.querySelector('#customerModal .close').addEventListener('click', () => this.hideCustomerModal());
    },

    loadCustomers() {
        this.currentCustomers = Storage.getCustomers();
        this.renderCustomers();
    },

    renderCustomers(filteredCustomers = null) {
        const customers = filteredCustomers || this.currentCustomers;
        const tbody = document.getElementById('customersTableBody');
        
        if (customers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No customers found.</td></tr>';
            return;
        }

        tbody.innerHTML = customers.map(customer => `
            <tr>
                <td onclick="Customers.viewMeasurements(${customer.id})" style="cursor: pointer;">${customer.name}</td>
                <td onclick="Customers.viewMeasurements(${customer.id})" style="cursor: pointer;">${customer.phone}</td>
                <td onclick="Customers.viewMeasurements(${customer.id})" style="cursor: pointer;">${customer.village}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="Customers.editCustomer(${customer.id})">
                        <i class="fas fa-edit"></i> <span>Edit</span>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="Customers.deleteCustomer(${customer.id})">
                        <i class="fas fa-trash"></i> <span>Delete</span>
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="Customers.viewMeasurements(${customer.id})">
                        <i class="fas fa-tape"></i> <span class="action-text">Measurements</span>
                    </button>
                </td>
            </tr>
        `).join('');

        // Translate any dynamic action text if translation manager exists
        if (typeof TranslationManager !== 'undefined') {
            TranslationManager.translateDynamicContent(tbody);
        }
    },

    showCustomerModal(customer = null) {
        const modal = document.getElementById('customerModal');
        const form = document.getElementById('customerForm');

        if (customer) {
            document.getElementById('customerId').value = customer.id;
            document.getElementById('customerName').value = customer.name;
            document.getElementById('customerPhone').value = customer.phone;
            document.getElementById('customerVillage').value = customer.village;
        } else {
            form.reset();
            document.getElementById('customerId').value = '';
        }

        modal.style.display = 'block';
    },

    hideCustomerModal() {
        document.getElementById('customerModal').style.display = 'none';
    },

    handleCustomerSubmit(e) {
        e.preventDefault();

        const customerData = {
            name: document.getElementById('customerName').value,
            phone: document.getElementById('customerPhone').value,
            village: document.getElementById('customerVillage').value
        };

        const customerId = document.getElementById('customerId').value;

        if (customerId) {
            Storage.updateCustomer(parseInt(customerId), customerData);
        } else {
            Storage.addCustomer(customerData);
        }

        this.loadCustomers();
        this.hideCustomerModal();
        Dashboard.updateStats();
        
        // Refresh measurements customer selects
        if (typeof Measurements !== 'undefined') {
            Measurements.populateCustomerSelects();
        }
    },

    editCustomer(id) {
        const customer = this.currentCustomers.find(c => c.id === id);
        if (customer) {
            this.showCustomerModal(customer);
        }
    },

    deleteCustomer(id) {
        const customer = this.currentCustomers.find(c => c.id === id);
        if (!customer) return;
        
        CustomPopup.show({
            icon: 'fas fa-trash',
            title: 'Delete Customer',
            message: `Are you sure you want to delete "${customer.name}"? This action cannot be undone.`,
            confirmText: 'Delete',
            confirmClass: 'btn-danger',
            onConfirm: () => {
                Storage.deleteCustomer(id);
                this.loadCustomers();
                Dashboard.updateStats();
            }
        });
    },

    searchCustomers(query) {
        if (!query.trim()) {
            this.renderCustomers();
            return;
        }

        const filtered = this.currentCustomers.filter(customer => 
            customer.name.toLowerCase().includes(query.toLowerCase()) ||
            customer.phone.includes(query) ||
            customer.village.toLowerCase().includes(query.toLowerCase())
        );

        this.renderCustomers(filtered);
    },

    viewMeasurements(customerId) {
        // Navigate to measurements section
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        const measurementsNav = document.querySelector('.nav-btn[data-section="measurements"]');
        if (measurementsNav) measurementsNav.classList.add('active');

        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        const measurementsSection = document.getElementById('measurements');
        if (measurementsSection) measurementsSection.classList.add('active');

        // Set mobile header title if present
        const mobileHeaderTitle = document.getElementById('mobileHeaderTitle');
        if (mobileHeaderTitle) mobileHeaderTitle.textContent = 'Measurements';

        // Ensure Measurements module exists and sync filter
        if (typeof Measurements !== 'undefined') {
            // populate selects (in case customers changed) and set filter select value
            Measurements.populateCustomerSelects();

            const filterSelect = document.getElementById('measurementCustomerSelect');
            if (filterSelect) {
                filterSelect.value = customerId;
                
                // Update the searchable select input to show the customer's name
                const wrapper = filterSelect.closest('.searchable-select-wrapper');
                if (wrapper) {
                    const searchInput = wrapper.querySelector('.select-search-input');
                    const selectedOption = filterSelect.options[filterSelect.selectedIndex];
                    if (searchInput && selectedOption) {
                        searchInput.value = selectedOption.textContent;
                    }
                }
                
                // dispatch change so Measurements.filterByCustomer runs (handles parsing and UI sync)
                filterSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
    }
};