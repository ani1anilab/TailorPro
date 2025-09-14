// Google Translate integration module
const TranslationManager = {
    cache: new Map(),
    originalTexts: new Map(),
    isTranslating: false,
    googleTranslateEndpoint: 'https://translate.googleapis.com/translate_a/single',
    
    init() {
        this.storeOriginalTexts();
        this.setupLanguageSelector();
        this.loadSavedLanguage();
    },

    storeOriginalTexts() {
        // Store original text content for all translatable elements
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            this.originalTexts.set(key, element.textContent);
        });

        // Store original placeholders for form inputs
        document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(input => {
            if (input.placeholder && !input.hasAttribute('data-no-translate')) {
                const key = `placeholder_${input.id || input.name}`;
                input.setAttribute('data-translate-placeholder', key);
                this.originalTexts.set(key, input.placeholder);
            }
        });

        // Store original button text content
        document.querySelectorAll('button').forEach(button => {
            if (button.textContent && !button.hasAttribute('data-no-translate')) {
                const key = `button_${button.id || Array.from(document.querySelectorAll('button')).indexOf(button)}`;
                button.setAttribute('data-translate', key);
                this.originalTexts.set(key, button.textContent);
            }
        });
    },

    setupLanguageSelector() {
        const languageSelect = document.getElementById('languageSelect');
        if (!languageSelect) return;

        languageSelect.addEventListener('change', (e) => {
            const selectedLanguage = e.target.value;
            this.changeLanguage(selectedLanguage);
        });
    },

    loadSavedLanguage() {
        const savedLanguage = localStorage.getItem('selectedLanguage');
        if (savedLanguage && savedLanguage !== 'en') {
            const languageSelect = document.getElementById('languageSelect');
            if (languageSelect) {
                languageSelect.value = savedLanguage;
                this.changeLanguage(savedLanguage);
            }
        }
    },

    async changeLanguage(language) {
        if (this.isTranslating) return;
        
        if (language === 'en') {
            this.restoreOriginalTexts();
            document.documentElement.setAttribute('lang', 'en');
            localStorage.setItem('selectedLanguage', 'en');
            return;
        }

        this.isTranslating = true;
        this.showLoadingIndicator();

        try {
            // Collect all text segments that need translation
            const textsToTranslate = Array.from(this.originalTexts.entries())
                .filter(([key, text]) => text && text.trim())
                .map(([key, text]) => ({ key, text }));

            if (textsToTranslate.length === 0) {
                this.isTranslating = false;
                this.hideLoadingIndicator();
                return;
            }

            // Check cache first
            const translations = {};
            const textsToFetch = [];

            textsToTranslate.forEach(({ key, text }) => {
                const cacheKey = `${language}_${text}`;
                if (this.cache.has(cacheKey)) {
                    translations[key] = this.cache.get(cacheKey);
                } else {
                    textsToFetch.push({ key, text });
                }
            });

            // Fetch translations for uncached texts
            if (textsToFetch.length > 0) {
                const fetchedTranslations = await this.fetchTranslations(
                    textsToFetch.map(item => item.text),
                    language
                );

                // Map translations back to keys and cache them
                textsToFetch.forEach(({ key, text }, index) => {
                    if (fetchedTranslations[index]) {
                        translations[key] = fetchedTranslations[index];
                        const cacheKey = `${language}_${text}`;
                        this.cache.set(cacheKey, fetchedTranslations[index]);
                    }
                });
            }

            // Apply translations to DOM
            this.applyTranslations(translations);
            document.documentElement.setAttribute('lang', language);
            localStorage.setItem('selectedLanguage', language);

        } catch (error) {
            console.error('Translation error:', error);
            this.showTranslationError();
        } finally {
            this.isTranslating = false;
            this.hideLoadingIndicator();
        }
    },

    async fetchTranslations(texts, targetLanguage) {
        // Google Translate public endpoint parameters
        const params = new URLSearchParams({
            client: 'gtx',
            sl: 'auto',
            tl: targetLanguage,
            dt: 't',
            q: texts.join('\n')
        });

        const url = `${this.googleTranslateEndpoint}?${params}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            
            // Extract translated texts from Google response
            const translations = data[0].map(item => item[0]);
            return translations;
        } catch (error) {
            throw new Error(`Translation API error: ${error.message}`);
        }
    },

    applyTranslations(translations) {
        // Apply to elements with data-translate
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (translations[key]) {
                element.textContent = translations[key];
            }
        });

        // Apply to placeholders
        document.querySelectorAll('[data-translate-placeholder]').forEach(input => {
            const key = input.getAttribute('data-translate-placeholder');
            if (translations[key]) {
                input.placeholder = translations[key];
            }
        });

        // Update mobile header title if needed
        const mobileHeaderTitle = document.getElementById('mobileHeaderTitle');
        if (mobileHeaderTitle && mobileHeaderTitle.hasAttribute('data-translate')) {
            const key = mobileHeaderTitle.getAttribute('data-translate');
            if (translations[key]) {
                mobileHeaderTitle.textContent = translations[key];
            }
        }
    },

    restoreOriginalTexts() {
        // Restore original texts
        this.originalTexts.forEach((originalText, key) => {
            const element = document.querySelector(`[data-translate="${key}"]`);
            if (element) {
                element.textContent = originalText;
            }

            const input = document.querySelector(`[data-translate-placeholder="${key}"]`);
            if (input) {
                input.placeholder = originalText;
            }
        });

        // Update mobile header title
        const mobileHeaderTitle = document.getElementById('mobileHeaderTitle');
        if (mobileHeaderTitle && mobileHeaderTitle.hasAttribute('data-translate')) {
            const key = mobileHeaderTitle.getAttribute('data-translate');
            if (this.originalTexts.has(key)) {
                mobileHeaderTitle.textContent = this.originalTexts.get(key);
            }
        }
    },

    showLoadingIndicator() {
        // Create loading indicator if it doesn't exist
        let indicator = document.getElementById('translationLoading');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'translationLoading';
            indicator.className = 'translation-loading';
            indicator.innerHTML = `
                <div class="translation-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Translating...</span>
                </div>
            `;
            indicator.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--secondary-color);
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                font-weight: 500;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                gap: 0.75rem;
            `;
            document.body.appendChild(indicator);
        }
        indicator.style.display = 'flex';
    },

    hideLoadingIndicator() {
        const indicator = document.getElementById('translationLoading');
        if (indicator) {
            indicator.style.display = 'none';
        }
    },

    showTranslationError() {
        const notification = document.createElement('div');
        notification.className = 'translation-error';
        notification.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>Translation failed. Please try again.</span>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--danger-color);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 0.75rem;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 5000);
    },

    // Translate dynamically added content
    translateDynamicContent(element) {
        if (!element || !element.querySelectorAll) return;
        
        const textsToTranslate = [];
        const elementsList = [];
        
        // 1) Elements explicitly using data-translate (keep existing behavior)
        element.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            let originalText = this.originalTexts.has(key) ? this.originalTexts.get(key) : (el.textContent && el.textContent.trim() ? el.textContent.trim() : null);
            if (originalText) {
                textsToTranslate.push(originalText);
                elementsList.push({ el, originalText });
            }
        });
        
        // 2) Elements created dynamically that request translation via data-auto-translate="true"
        element.querySelectorAll('[data-auto-translate="true"]').forEach(el => {
            const text = el.textContent && el.textContent.trim() ? el.textContent.trim() : null;
            if (text) {
                textsToTranslate.push(text);
                elementsList.push({ el, originalText: text });
            }
        });
    
        if (textsToTranslate.length === 0) return;
    
        const currentLanguage = localStorage.getItem('selectedLanguage') || 'en';
        if (currentLanguage === 'en') return;
    
        this.fetchTranslations(textsToTranslate, currentLanguage).then(translations => {
            translations.forEach((translatedText, index) => {
                const target = elementsList[index];
                if (target && translatedText) {
                    target.el.textContent = translatedText;
                }
            });
        });
    }
};

// Initialize translation manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    TranslationManager.init();
});