// Storage management module
const Storage = {
    // Initialize localStorage with default data structure
    init() {
        if (!localStorage.getItem('tailorData')) {
            const defaultData = {
                customers: [],
                measurements: [],
                orders: [],
                teamMembers: [],
                nextCustomerId: 1,
                nextMeasurementId: 1,
                nextOrderId: 1
            };
            localStorage.setItem('tailorData', JSON.stringify(defaultData));
        }
    },

    // Get all data
    getAllData() {
        return JSON.parse(localStorage.getItem('tailorData'));
    },

    // Save all data
    saveAllData(data) {
        localStorage.setItem('tailorData', JSON.stringify(data));
    },

    // Get customers
    getCustomers() {
        const data = this.getAllData();
        return data.customers;
    },

    // Add customer
    addCustomer(customer) {
        const data = this.getAllData();
        customer.id = data.nextCustomerId++;
        customer.createdAt = new Date().toISOString();
        data.customers.push(customer);
        this.saveAllData(data);
        return customer;
    },

    // Update customer
    updateCustomer(id, updates) {
        const data = this.getAllData();
        const index = data.customers.findIndex(c => c.id === id);
        if (index !== -1) {
            data.customers[index] = { ...data.customers[index], ...updates };
            this.saveAllData(data);
            return data.customers[index];
        }
        return null;
    },

    // Delete customer
    deleteCustomer(id) {
        const data = this.getAllData();
        data.customers = data.customers.filter(c => c.id !== id);
        this.saveAllData(data);
    },

    // Get measurements
    getMeasurements() {
        const data = this.getAllData();
        return data.measurements;
    },

    // Add measurement
    addMeasurement(measurement) {
        const data = this.getAllData();
        measurement.id = data.nextMeasurementId++;
        measurement.createdAt = new Date().toISOString();
        data.measurements.push(measurement);
        this.saveAllData(data);
        return measurement;
    },

    // Get orders
    getOrders() {
        const data = this.getAllData();
        return data.orders;
    },

    // Add order
    addOrder(order) {
        const data = this.getAllData();
        order.id = data.nextOrderId++;
        order.createdAt = new Date().toISOString();
        data.orders.push(order);
        this.saveAllData(data);
        return order;
    },

    // Update order
    updateOrder(id, updates) {
        const data = this.getAllData();
        const index = data.orders.findIndex(o => o.id === id);
        if (index !== -1) {
            data.orders[index] = { ...data.orders[index], ...updates };
            this.saveAllData(data);
            return data.orders[index];
        }
        return null;
    }
};

// Initialize storage
Storage.init();