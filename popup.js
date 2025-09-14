// Custom popup functionality - Updated with translation support
const CustomPopup = {
    show: function(options) {
        const modal = document.getElementById('customPopup');
        const icon = document.getElementById('popupIcon');
        const title = document.getElementById('popupTitle');
        const message = document.getElementById('popupMessage');
        const confirmBtn = document.getElementById('popupConfirm');
        const cancelBtn = document.getElementById('popupCancel');
        
        // Set content
        icon.className = options.icon || 'fas fa-exclamation-triangle';
        title.textContent = options.title || 'Confirm Action';
        title.setAttribute('data-translate', 'popup_title');
        message.textContent = options.message || 'Are you sure you want to perform this action?';
        message.setAttribute('data-translate', 'popup_message');
        confirmBtn.textContent = options.confirmText || 'Confirm';
        confirmBtn.setAttribute('data-translate', 'popup_confirm');
        cancelBtn.textContent = options.cancelText || 'Cancel';
        cancelBtn.setAttribute('data-translate', 'popup_cancel');
        
        // Set button visibility
        confirmBtn.style.display = options.showConfirm !== false ? 'inline-flex' : 'none';
        cancelBtn.style.display = options.showCancel !== false ? 'inline-flex' : 'none';
        
        // Set button types
        confirmBtn.className = `btn ${options.confirmClass || 'btn-primary'}`;
        cancelBtn.className = `btn ${options.cancelClass || 'btn-secondary'}`;
        
        // Clear previous event listeners
        confirmBtn.replaceWith(confirmBtn.cloneNode(true));
        cancelBtn.replaceWith(cancelBtn.cloneNode(true));
        
        // Get fresh references after cloning
        const newConfirmBtn = document.getElementById('popupConfirm');
        const newCancelBtn = document.getElementById('popupCancel');
        
        // Set new event listeners
        newConfirmBtn.addEventListener('click', () => {
            this.hide();
            if (options.onConfirm) options.onConfirm();
        });
        
        newCancelBtn.addEventListener('click', () => {
            this.hide();
            if (options.onCancel) options.onCancel();
        });
        
        // Close button
        document.querySelector('#customPopup .close').addEventListener('click', () => {
            this.hide();
            if (options.onCancel) options.onCancel();
        });
        
        // Show modal
        modal.style.display = 'flex';

        // Translate the popup content
        if (typeof TranslationManager !== 'undefined') {
            TranslationManager.translateDynamicContent(modal);
        }
    },
    
    hide: function() {
        document.getElementById('customPopup').style.display = 'none';
    }
};