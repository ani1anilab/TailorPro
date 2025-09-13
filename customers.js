// Customer management module
const Customers = {
    currentCustomers: [],

    init() {
        this.loadCustomers();
        this.bindEvents();
    },

    bindEvents() {
        // Navigation
        document.getElementById('addCustomerBtn').addEventListener('click', () => this.showCustomerModal());
        document.getElementById('customerForm').addEventListener('submit', (e) => this.handleCustomerSubmit(e));
        document.getElementById('cancelCustomer').addEventListener('click', () => this.hideCustomerModal());
        
        // Search
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
        
        tbody.innerHTML = customers.map(customer => `
            <tr>
                <td>${customer.name}</td>
                <td>${customer.phone}</td>
                <td>${customer.village}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="Customers.editCustomer(${customer.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-info" onclick="Customers.viewMeasurements(${customer.id})">
                        <i class="fas fa-tape"></i> Measurements
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="Customers.deleteCustomer(${customer.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
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
    },

    editCustomer(id) {
        const customer = this.currentCustomers.find(c => c.id === id);
        if (customer) {
            this.showCustomerModal(customer);
        }
    },

    deleteCustomer(id) {
        CustomPopup.show({
            icon: 'fas fa-trash',
            title: 'Delete Customer',
            message: 'Are you sure you want to delete this customer? This action cannot be undone.',
            confirmText: 'Delete',
            confirmClass: 'btn-danger',
            onConfirm: () => {
                Storage.deleteCustomer(id);
                this.loadCustomers();
                Dashboard.updateStats();
            }
        });
    },

    viewMeasurements(customerId) {
        // Navigate to measurements section
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-section="measurements"]').classList.add('active');
        
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById('measurements').classList.add('active');
        
        // Set the customer filter
        document.getElementById('measurementCustomerSelect').value = customerId;
        Measurements.filterByCustomer(customerId);
    }
};