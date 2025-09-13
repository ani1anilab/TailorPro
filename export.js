// Data export functionality
const Export = {
    init() {
        this.bindEvents();
        // Remove the duplicate table view setup
        // this.setupTableView(); // This was causing the duplicate
    },

    setupTableView() {
        // Add table view functionality
        const exportSection = document.getElementById('export');
        
        // Create table view container
        const tableViewContainer = document.createElement('div');
        tableViewContainer.className = 'table-view-container';
        tableViewContainer.innerHTML = `
            <div class="section-header" style="margin-top: 2rem;">
                <h3>View Data Tables</h3>
                <div class="table-type-selector">
                    <button class="btn btn-secondary table-type-btn active" data-type="customers">
                        <i class="fas fa-users"></i> Customers
                    </button>
                    <button class="btn btn-secondary table-type-btn" data-type="measurements">
                        <i class="fas fa-tape"></i> Measurements
                    </button>
                    <button class="btn btn-secondary table-type-btn" data-type="orders">
                        <i class="fas fa-shopping-bag"></i> Orders
                    </button>
                </div>
            </div>
            <div id="tableViewContent" class="table-view-content">
                <!-- Dynamic content will be loaded here -->
            </div>
        `;
        
        exportSection.appendChild(tableViewContainer);
        
        // Bind table type selector events
        document.querySelectorAll('.table-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.table-type-btn').forEach(b => b.classList.remove('active'));
                e.target.closest('.table-type-btn').classList.add('active');
                this.loadTableView(e.target.closest('.table-type-btn').dataset.type);
            });
        });
        
        // Load initial table view
        this.loadTableView('customers');
    },

    loadTableView(type) {
        const container = document.getElementById('tableViewContent');
        
        switch(type) {
            case 'customers':
                container.innerHTML = this.renderCustomersTable();
                break;
            case 'measurements':
                container.innerHTML = this.renderMeasurementsTable();
                break;
            case 'orders':
                container.innerHTML = this.renderOrdersTable();
                break;
        }
    },

    renderCustomersTable() {
        const customers = Storage.getCustomers();
        
        if (customers.length === 0) {
            return '<p class="empty-state">No customers found.</p>';
        }
        
        return `
            <div class="table-container" style="background: var(--card-bg); border-radius: 10px; overflow: hidden; box-shadow: var(--shadow);">
                <table class="data-table" style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="padding: 1rem; text-align: left; background: var(--hover-bg); font-weight: 600; color: var(--primary-color); border-bottom: 1px solid var(--border-color);">ID</th>
                            <th style="padding: 1rem; text-align: left; background: var(--hover-bg); font-weight: 600; color: var(--primary-color); border-bottom: 1px solid var(--border-color);">Name</th>
                            <th style="padding: 1rem; text-align: left; background: var(--hover-bg); font-weight: 600; color: var(--primary-color); border-bottom: 1px solid var(--border-color);">Phone</th>
                            <th style="padding: 1rem; text-align: left; background: var(--hover-bg); font-weight: 600; color: var(--primary-color); border-bottom: 1px solid var(--border-color);">Village</th>
                            <th style="padding: 1rem; text-align: left; background: var(--hover-bg); font-weight: 600; color: var(--primary-color); border-bottom: 1px solid var(--border-color);">Created Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${customers.map(customer => `
                            <tr style="border-bottom: 1px solid var(--border-color);">
                                <td style="padding: 1rem; color: var(--text-primary);">${customer.id}</td>
                                <td style="padding: 1rem; color: var(--text-primary);">${customer.name}</td>
                                <td style="padding: 1rem; color: var(--text-primary);">${customer.phone}</td>
                                <td style="padding: 1rem; color: var(--text-primary);">${customer.village}</td>
                                <td style="padding: 1rem; color: var(--text-secondary);">${Utils.formatDate(customer.createdAt)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderMeasurementsTable() {
        const measurements = Storage.getMeasurements();
        const customers = Storage.getCustomers();
        
        if (measurements.length === 0) {
            return '<p class="empty-state">No measurements found.</p>';
        }
        
        return `
            <div class="table-container" style="background: var(--card-bg); border-radius: 10px; overflow: hidden; box-shadow: var(--shadow);">
                <table class="data-table" style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="padding: 1rem; text-align: left; background: var(--hover-bg); font-weight: 600; color: var(--primary-color); border-bottom: 1px solid var(--border-color);">ID</th>
                            <th style="padding: 1rem; text-align: left; background: var(--hover-bg); font-weight: 600; color: var(--primary-color); border-bottom: 1px solid var(--border-color);">Customer</th>
                            <th style="padding: 1rem; text-align: left; background: var(--hover-bg); font-weight: 600; color: var(--primary-color); border-bottom: 1px solid var(--border-color);">Clothing Type</th>
                            <th style="padding: 1rem; text-align: left; background: var(--hover-bg); font-weight: 600; color: var(--primary-color); border-bottom: 1px solid var(--border-color);">Measurements</th>
                            <th style="padding: 1rem; text-align: left; background: var(--hover-bg); font-weight: 600; color: var(--primary-color); border-bottom: 1px solid var(--border-color);">Created Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${measurements.map(measurement => {
                            const customer = customers.find(c => c.id === measurement.customerId);
                            const customerName = customer ? customer.name : 'Unknown';
                            const measurementsText = Object.entries(measurement.measurements)
                                .map(([key, value]) => `${key}: ${value}"`)
                                .join(', ');
                            
                            return `
                                <tr style="border-bottom: 1px solid var(--border-color);">
                                    <td style="padding: 1rem; color: var(--text-primary);">${measurement.id}</td>
                                    <td style="padding: 1rem; color: var(--text-primary);">${customerName}</td>
                                    <td style="padding: 1rem; color: var(--text-primary); text-transform: capitalize;">${measurement.clothingType}</td>
                                    <td style="padding: 1rem; color: var(--text-secondary); font-size: 0.9rem;" title="${measurementsText}">${measurementsText.substring(0, 50)}${measurementsText.length > 50 ? '...' : ''}</td>
                                    <td style="padding: 1rem; color: var(--text-secondary);">${Utils.formatDate(measurement.createdAt)}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderOrdersTable() {
        const orders = Storage.getOrders();
        const customers = Storage.getCustomers();
        
        if (orders.length === 0) {
            return '<p class="empty-state">No orders found.</p>';
        }
        
        return `
            <div class="table-container" style="background: var(--card-bg); border-radius: 10px; overflow: hidden; box-shadow: var(--shadow);">
                <table class="data-table" style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="padding: 1rem; text-align: left; background: var(--hover-bg); font-weight: 600; color: var(--primary-color); border-bottom: 1px solid var(--border-color);">ID</th>
                            <th style="padding: 1rem; text-align: left; background: var(--hover-bg); font-weight: 600; color: var(--primary-color); border-bottom: 1px solid var(--border-color);">Customer</th>
                            <th style="padding: 1rem; text-align: left; background: var(--hover-bg); font-weight: 600; color: var(--primary-color); border-bottom: 1px solid var(--border-color);">Description</th>
                            <th style="padding: 1rem; text-align: left; background: var(--hover-bg); font-weight: 600; color: var(--primary-color); border-bottom: 1px solid var(--border-color);">Price</th>
                            <th style="padding: 1rem; text-align: left; background: var(--hover-bg); font-weight: 600; color: var(--primary-color); border-bottom: 1px solid var(--border-color);">Status</th>
                            <th style="padding: 1rem; text-align: left; background: var(--hover-bg); font-weight: 600; color: var(--primary-color); border-bottom: 1px solid var(--border-color);">Created Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.map(order => {
                            const customer = customers.find(c => c.id === order.customerId);
                            const customerName = customer ? customer.name : 'Unknown';
                            
                            return `
                                <tr style="border-bottom: 1px solid var(--border-color);">
                                    <td style="padding: 1rem; color: var(--text-primary);">${order.id}</td>
                                    <td style="padding: 1rem; color: var(--text-primary);">${customerName}</td>
                                    <td style="padding: 1rem; color: var(--text-secondary); font-size: 0.9rem;" title="${order.description}">${order.description.substring(0, 30)}${order.description.length > 30 ? '...' : ''}</td>
                                    <td style="padding: 1rem; color: var(--success-color); font-weight: 600;">₹${parseFloat(order.price).toFixed(2)}</td>
                                    <td style="padding: 1rem;"><span class="order-status status-${order.status}" style="padding: 0.25rem 0.75rem; border-radius: 15px; font-size: 0.8rem; font-weight: 500; text-transform: capitalize;">${order.status}</span></td>
                                    <td style="padding: 1rem; color: var(--text-secondary);">${Utils.formatDate(order.createdAt)}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    bindEvents() {
        document.getElementById('exportCustomers').addEventListener('click', () => this.exportCustomers());
        document.getElementById('exportMeasurements').addEventListener('click', () => this.exportMeasurements());
        document.getElementById('exportOrders').addEventListener('click', () => this.exportOrders());
    },

    exportToCSV(data, filename) {
        const csv = this.convertToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    },

    convertToCSV(data) {
        if (!data || data.length === 0) return '';

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    let value = row[header];
                    if (typeof value === 'object') {
                        value = JSON.stringify(value);
                    }
                    return `"${String(value).replace(/"/g, '""')}"`;
                }).join(',')
            )
        ].join('\n');

        return csvContent;
    },

    exportCustomers() {
        const customers = Storage.getCustomers();
        if (customers.length === 0) {
            alert('No customers to export');
            return;
        }

        const exportData = customers.map(customer => ({
            ID: customer.id,
            Name: customer.name,
            Phone: `"${customer.phone}"`,
            Village: customer.village,
            Created: Utils.formatDate(customer.createdAt)
        }));

        this.exportToCSV(exportData, `customers_${new Date().toISOString().split('T')[0]}.csv`);
    },

    exportMeasurements() {
        const measurements = Storage.getMeasurements();
        const customers = Storage.getCustomers();
        
        if (measurements.length === 0) {
            alert('No measurements to export');
            return;
        }

        const exportData = measurements.map(measurement => {
            const customer = customers.find(c => c.id === measurement.customerId);
            const customerName = customer ? customer.name : 'Unknown';
            
            return {
                ID: measurement.id,
                Customer: customerName,
                Type: measurement.clothingType,
                ...measurement.measurements,
                Created: Utils.formatDate(measurement.createdAt)
            };
        });

        this.exportToCSV(exportData, `measurements_${new Date().toISOString().split('T')[0]}.csv`);
    },

    exportOrders() {
        const orders = Storage.getOrders();
        const customers = Storage.getCustomers();
        
        if (orders.length === 0) {
            alert('No orders to export');
            return;
        }

        const exportData = orders.map(order => {
            const customer = customers.find(c => c.id === order.customerId);
            const customerName = customer ? customer.name : 'Unknown';
            
            return {
                ID: order.id,
                Customer: customerName,
                Description: order.description,
                Price: order.price,
                Status: order.status,
                Created: Utils.formatDate(order.createdAt)
            };
        });

        this.exportToCSV(exportData, `orders_${new Date().toISOString().split('T')[0]}.csv`);
    }
};

// Initialize table view when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    Export.setupTableView();
});