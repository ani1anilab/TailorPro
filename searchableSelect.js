// Searchable dropdown functionality
const SearchableSelect = {
    init() {
        this.createDropdowns();
        this.bindEvents();
    },

    createDropdowns() {
        document.querySelectorAll('.searchable-select').forEach(select => {
            this.createSearchableDropdown(select);
        });
    },

    createSearchableDropdown(select) {
        if (select.dataset.searchable !== 'true') return;

        // Avoid creating a wrapper twice if already initialized
        if (select.closest('.searchable-select-wrapper')) return;

        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'searchable-select-wrapper';
        wrapper.style.position = 'relative';
        wrapper.style.width = '100%';

        // Create search input
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'select-search-input';
        searchInput.placeholder = 'Search customers...';
        searchInput.style.cssText = `
            width: 100%;
            padding: 0.75rem;
            border: 2px solid var(--input-border);
            border-radius: 5px;
            font-size: 1rem;
            background: var(--input-bg);
            color: var(--text-primary);
            cursor: pointer;
            transition: border-color 0.3s ease;
        `;

        // Create dropdown container
        const dropdown = document.createElement('div');
        dropdown.className = 'select-dropdown';
        dropdown.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 5px;
            max-height: 250px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
            box-shadow: var(--shadow-hover);
        `;

        // Wrap select and add elements
        select.parentNode.insertBefore(wrapper, select);
        wrapper.appendChild(searchInput);
        wrapper.appendChild(select);
        wrapper.appendChild(dropdown);

        // Hide original select
        select.style.display = 'none';

        // Set initial value
        this.updateDisplay(select, searchInput);

        // Create dropdown options
        this.populateDropdown(select, dropdown, searchInput);
    },

    populateDropdown(select, dropdown, searchInput) {
        dropdown.innerHTML = '';
        
        Array.from(select.options).forEach((option, index) => {
            const item = document.createElement('div');
            item.className = 'select-option';
            item.textContent = option.textContent;
            item.style.cssText = `
                padding: 0.75rem;
                cursor: pointer;
                border-bottom: 1px solid var(--border-color);
                transition: background-color 0.2s ease;
            `;
            
            item.addEventListener('click', () => {
                select.selectedIndex = index;
                this.updateDisplay(select, searchInput);
                dropdown.style.display = 'none';
                // Trigger native change event so any listeners (filters) update
                select.dispatchEvent(new Event('change', { bubbles: true }));
            });

            item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = 'var(--hover-bg)';
            });

            item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = 'transparent';
            });

            dropdown.appendChild(item);
        });
    },

    updateDisplay(select, searchInput) {
        const selectedOption = select.options[select.selectedIndex];
        searchInput.value = selectedOption ? selectedOption.textContent : '';
    },

    bindEvents() {
        // Toggle dropdown on click
        document.addEventListener('click', (e) => {
            const wrapper = e.target.closest('.searchable-select-wrapper');
            
            if (wrapper) {
                const searchInput = wrapper.querySelector('.select-search-input');
                const dropdown = wrapper.querySelector('.select-dropdown');
                const isClickInside = wrapper.contains(e.target);

                if (isClickInside && (e.target === searchInput || e.target.closest('.select-option'))) {
                    if (dropdown.style.display === 'none') {
                        dropdown.style.display = 'block';
                        if (e.target === searchInput) {
                            searchInput.select();
                        }
                    }
                } else {
                    dropdown.style.display = 'none';
                }
            } else {
                // Close all dropdowns when clicking outside
                document.querySelectorAll('.select-dropdown').forEach(dropdown => {
                    dropdown.style.display = 'none';
                });
            }
        });

        // Search functionality
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('select-search-input')) {
                const wrapper = e.target.closest('.searchable-select-wrapper');
                const select = wrapper.querySelector('select');
                const dropdown = wrapper.querySelector('.select-dropdown');
                const searchTerm = e.target.value.toLowerCase();

                this.filterOptions(select, dropdown, searchTerm);
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.target.classList.contains('select-search-input')) {
                const wrapper = e.target.closest('.searchable-select-wrapper');
                const dropdown = wrapper.querySelector('.select-dropdown');
                const options = dropdown.querySelectorAll('.select-option');
                
                if (dropdown.style.display === 'block') {
                    if (e.key === 'Escape') {
                        dropdown.style.display = 'none';
                    } else if (e.key === 'Enter') {
                        e.preventDefault();
                        const visibleOptions = Array.from(options).filter(opt => opt.style.display !== 'none');
                        if (visibleOptions.length > 0) {
                            visibleOptions[0].click();
                        }
                    }
                }
            }
        });
    },

    filterOptions(select, dropdown, searchTerm) {
        const options = dropdown.querySelectorAll('.select-option');
        const selectOptions = Array.from(select.options);

        options.forEach((optionEl, index) => {
            const optionText = selectOptions[index].textContent.toLowerCase();
            if (optionText.includes(searchTerm)) {
                optionEl.style.display = 'block';
            } else {
                optionEl.style.display = 'none';
            }
        });

        // Show/hide dropdown based on results
        const visibleOptions = Array.from(options).filter(opt => opt.style.display !== 'none');
        dropdown.style.display = visibleOptions.length > 0 ? 'block' : 'none';
    },

    // Update options when customers change
    refreshDropdown(selectElement) {
        const wrapper = selectElement.closest('.searchable-select-wrapper');
        if (!wrapper) return;

        const searchInput = wrapper.querySelector('.select-search-input');
        const dropdown = wrapper.querySelector('.select-dropdown');

        // Reset UI state
        if (searchInput) {
            searchInput.value = '';
        }
        if (dropdown) {
            dropdown.style.display = 'none';
        }

        // Rebuild options and update displayed value
        this.populateDropdown(selectElement, dropdown, searchInput);
        this.updateDisplay(selectElement, searchInput);
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    SearchableSelect.init();
});