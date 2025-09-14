// Dashboard functionality module
const Dashboard = {
    init() {
        this.updateStats();
        this.setupNavigation();
        this.setupThemeSupport();
    },

    updateStats() {
        const customers = Storage.getCustomers();
        const orders = Storage.getOrders();
        
        document.getElementById('totalCustomers').textContent = customers.length;
        document.getElementById('pendingOrders').textContent = orders.filter(o => o.status === 'pending').length;
        document.getElementById('completedOrders').textContent = orders.filter(o => o.status === 'delivered').length;
        
        // Handle revenue display with blur toggle
        const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.price), 0);
        const revenueElement = document.getElementById('totalRevenue');
        const revenueContainer = revenueElement.parentElement;
        
        // Create or get the toggle button
        let toggleBtn = revenueContainer.querySelector('.revenue-toggle-btn');
        if (!toggleBtn) {
            toggleBtn = document.createElement('button');
            toggleBtn.className = 'revenue-toggle-btn';
            toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
            toggleBtn.title = 'Toggle revenue visibility';
            revenueContainer.style.position = 'relative';
            revenueContainer.appendChild(toggleBtn);
            
            // Add toggle functionality
            toggleBtn.addEventListener('click', () => {
                const isBlurred = revenueElement.classList.contains('revenue-blurred');
                if (isBlurred) {
                    revenueElement.classList.remove('revenue-blurred');
                    revenueElement.classList.add('revenue-visible');
                    toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
                    toggleBtn.classList.add('active');
                } else {
                    revenueElement.classList.add('revenue-blurred');
                    revenueElement.classList.remove('revenue-visible');
                    toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
                    toggleBtn.classList.remove('active');
                }
            });
        }
        
        // Set initial state to blurred
        revenueElement.classList.add('revenue-blurred');
        revenueElement.textContent = Utils.formatCurrency(totalRevenue);
    },

    setupNavigation() {
        // Navigation button handlers
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.currentTarget.getAttribute('data-section');
                this.showSection(section);
                
                // Update active nav
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });
    },

    setupThemeSupport() {
        const themeToggle = document.getElementById('themeToggle');
        const savedTheme = localStorage.getItem('selectedTheme') || 'light';
        
        // Apply saved theme
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);

        // Handle theme toggle
        themeToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('selectedTheme', newTheme);
            this.updateThemeIcon(newTheme);
        });
    },

    updateThemeIcon(theme) {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    },

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show selected section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
        }
    }
};