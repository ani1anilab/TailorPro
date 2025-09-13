// Orders management module - Updated with team member assignment
const Orders = {
    currentOrders: [],

    init() {
        this.loadOrders();
        this.bindEvents();
    },

    bindEvents() {
        document.getElementById('addOrderBtn').addEventListener('click', () => this.showOrderModal());
        document.getElementById('orderForm').addEventListener('submit', (e) => this.handleOrderSubmit(e));
        document.getElementById('cancelOrder').addEventListener('click', () => this.hideOrderModal());

        // Modal close
        document.querySelector('#orderModal .close').addEventListener('click', () => this.hideOrderModal());
    },

    loadOrders() {
        this.currentOrders = Storage.getOrders();
        this.renderOrders();
    },

    renderOrders() {
        const container = document.getElementById('ordersList');
        
        if (this.currentOrders.length === 0) {
            container.innerHTML = '<p class="empty-state">No orders found. Add a new order to get started.</p>';
            return;
        }

        container.innerHTML = this.currentOrders.map(order => {
            const customer = Storage.getCustomers().find(c => c.id === order.customerId);
            const teamMember = Team.getTeamMemberById(order.teamMemberId);
            const statusClass = `status-${order.status}`;
            
            return `
                <div class="order-card">
                    <div class="order-header">
                        <h4>${customer ? customer.name : 'Unknown Customer'}</h4>
                        <span class="order-status ${statusClass}">${order.status}</span>
                    </div>
                    <p class="order-description">${order.description}</p>
                    ${teamMember ? `
                        <div style="margin-bottom: 1rem;">
                            <small style="color: var(--text-secondary);">
                                <i class="fas fa-user"></i> Assigned to: ${teamMember.name} (${teamMember.role})
                            </small>
                        </div>
                    ` : ''}
                    <div class="order-details">
                        <span class="order-price">₹${parseFloat(order.price).toFixed(2)}</span>
                        <span class="order-date">${Utils.formatDate(order.createdAt)}</span>
                    </div>
                    <div class="order-actions">
                        <button class="btn btn-sm btn-secondary" onclick="Orders.editOrder(${order.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="Orders.updateStatus(${order.id})">
                            <i class="fas fa-sync"></i> Update Status
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    showOrderModal(order = null) {
        const modal = document.getElementById('orderModal');
        const form = document.getElementById('orderForm');

        if (order) {
            document.getElementById('orderId').value = order.id;
            document.getElementById('orderCustomer').value = order.customerId;
            document.getElementById('orderTeamMember').value = order.teamMemberId || '';
            document.getElementById('orderDescription').value = order.description;
            document.getElementById('orderPrice').value = order.price;
            document.getElementById('orderStatus').value = order.status;
        } else {
            form.reset();
            document.getElementById('orderId').value = '';
        }

        modal.style.display = 'block';
    },

    hideOrderModal() {
        document.getElementById('orderModal').style.display = 'none';
    },

    handleOrderSubmit(e) {
        e.preventDefault();

        const orderData = {
            customerId: parseInt(document.getElementById('orderCustomer').value),
            teamMemberId: document.getElementById('orderTeamMember').value ? parseInt(document.getElementById('orderTeamMember').value) : null,
            description: document.getElementById('orderDescription').value,
            price: parseFloat(document.getElementById('orderPrice').value),
            status: document.getElementById('orderStatus').value
        };

        const orderId = document.getElementById('orderId').value;

        if (orderId) {
            Storage.updateOrder(parseInt(orderId), orderData);
        } else {
            Storage.addOrder(orderData);
        }

        this.loadOrders();
        this.hideOrderModal();
        Dashboard.updateStats();
    },

    editOrder(id) {
        const order = this.currentOrders.find(o => o.id === id);
        if (order) {
            this.showOrderModal(order);
        }
    },

    updateStatus(id) {
        const order = this.currentOrders.find(o => o.id === id);
        if (!order) return;

        const statuses = ['pending', 'working', 'delivered'];
        const currentIndex = statuses.indexOf(order.status);
        const nextStatus = statuses[(currentIndex + 1) % statuses.length];

        CustomPopup.show({
            icon: 'fas fa-sync',
            title: 'Update Order Status',
            message: `Update order status from "${order.status}" to "${nextStatus}"?`,
            confirmText: 'Update',
            onConfirm: () => {
                Storage.updateOrder(id, { status: nextStatus });
                this.loadOrders();
                Dashboard.updateStats();
            }
        });
    }
};