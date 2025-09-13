// Translation management module
const TranslationManager = {
    translations: {
        hi: {
            'Dashboard Overview': 'डैशबोर्ड अवलोकन',
            'Welcome to your tailor management system': 'आपके दर्जी प्रबंधन प्रणाली में आपका स्वागत है',
            'Total Customers': 'कुल ग्राहक',
            'Pending Orders': 'लंबित आदेश',
            'Completed Orders': 'पूरे हुए आदेश',
            'Total Revenue': 'कुल राजस्व',
            'Customer Management': 'ग्राहक प्रबंधन',
            'Add Customer': 'ग्राहक जोड़ें',
            'Name': 'नाम',
            'Phone': 'फोन',
            'Village': 'गांव',
            'Actions': 'क्रियाएं',
            'Measurements': 'माप',
            'Add Measurement': 'माप जोड़ें',
            'Orders': 'आदेश',
            'Add Order': 'आदेश जोड़ें',
            'Export Data': 'डेटा निर्यात करें',
            'Customers': 'ग्राहक',
            'Shirt': 'कमीज',
            'Pant': 'पैंट',
            'Suit': 'सूट',
            'Dress': 'ड्रेस'
        },
        gu: {
            'Dashboard Overview': 'ડેશબોર્ડ ઝલક',
            'Welcome to your tailor management system': 'તમારા દરજી વ્યવસ્થાપન પ્રણાલીમાં આપનું સ્વાગત છે',
            'Total Customers': 'કુલ ગ્રાહકો',
            'Pending Orders': 'પેન્ડિંગ ઓર્ડર',
            'Completed Orders': 'પૂર્ણ થયેલા ઓર્ડર',
            'Total Revenue': 'કુલ આવક',
            'Customer Management': 'ગ્રાહક વ્યવસ્થાપન',
            'Add Customer': 'ગ્રાહક ઉમેરો',
            'Name': 'નામ',
            'Phone': 'ફોન',
            'Village': 'ગામ',
            'Actions': 'ક્રિયાઓ',
            'Measurements': 'માપ',
            'Add Measurement': 'માપ ઉમેરો',
            'Orders': 'ઓર્ડર',
            'Add Order': 'ઓર્ડર ઉમેરો',
            'Export Data': 'ડેટા નિકાસ કરો',
            'Customers': 'ગ્રાહકો',
            'Shirt': 'શર્ટ',
            'Pant': 'પેન્ટ',
            'Suit': 'સૂટ',
            'Dress': 'ડ્રેસ'
        }
    },

    translatePage(targetLanguage) {
        if (targetLanguage === 'en') {
            // For English, just reload the page
            location.reload();
            return;
        }

        const elements = document.querySelectorAll('h1, h2, h3, h4, p, label, button, th, td, option, span');
        
        elements.forEach(element => {
            const text = element.textContent.trim();
            if (this.translations[targetLanguage] && this.translations[targetLanguage][text]) {
                element.textContent = this.translations[targetLanguage][text];
            }
        });

        // Handle placeholder text
        const placeholders = document.querySelectorAll('input[placeholder], textarea[placeholder]');
        placeholders.forEach(input => {
            const placeholder = input.getAttribute('placeholder');
            if (placeholder && this.translations[targetLanguage] && this.translations[targetLanguage][placeholder]) {
                input.setAttribute('placeholder', this.translations[targetLanguage][placeholder]);
            }
        });
    },

    async translateUsingAPI(text, targetLanguage) {
        // Using Google Translate free API directly
        const apiUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`;
        
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            if (data && data[0] && data[0][0]) {
                return data[0][0][0];
            }
            return text;
        } catch (error) {
            console.error('Translation API error:', error);
            return text;
        }
    }
};