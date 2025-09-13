// Utility functions and shared helpers
const Utils = {
    // Format currency in Indian Rupees
    formatCurrency(amount) {
        return `₹${parseFloat(amount).toFixed(2)}`;
    },

    // Format date according to user preference
    formatDate(dateString, format = null) {
        const date = new Date(dateString);
        const userFormat = format || this.getUserDateFormat();
        
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthName = monthNames[date.getMonth()];
        
        switch(userFormat) {
            case 'MM/DD/YYYY':
                return `${month}/${day}/${year}`;
            case 'DD/MM/YYYY':
                return `${day}/${month}/${year}`;
            case 'YYYY-MM-DD':
                return `${year}-${month}-${day}`;
            case 'DD-MM-YYYY':
                return `${day}-${month}-${year}`;
            case 'MMM DD, YYYY':
                return `${monthName} ${parseInt(day)}, ${year}`;
            case 'DD MMM YYYY':
                return `${parseInt(day)} ${monthName} ${year}`;
            default:
                return date.toLocaleDateString();
        }
    },

    // Get user's preferred date format
    getUserDateFormat() {
        if (typeof Storage !== 'undefined') {
            const data = Storage.getAllData();
            return data.dateFormat || 'MM/DD/YYYY';
        }
        return 'MM/DD/YYYY';
    },

    // Generate unique ID
    generateId() {
        return Date.now() + Math.floor(Math.random() * 1000);
    },

    // Debounce function for search inputs
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Deep clone object
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    // Validate phone number (Indian format)
    validatePhone(phone) {
        return /^[6-9]\d{9}$/.test(phone);
    },

    // Validate email
    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
};