// commande.js - Order Form Validation and Handling
document.addEventListener('DOMContentLoaded', function() {
    const orderForm = document.getElementById('orderForm');
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');

    // Form elements
    const fullNameInput = document.getElementById('fullName');
    const wilayaSelect = document.getElementById('wilaya');
    const phoneInput = document.getElementById('phoneNumber');
    const addressInput = document.getElementById('address');
    const notesInput = document.getElementById('notes');

    // Error elements
    const fullNameError = document.getElementById('fullNameError');
    const wilayaError = document.getElementById('wilayaError');
    const phoneError = document.getElementById('phoneError');

    // Algerian phone number validation
    function validatePhoneNumber(phone) {
        const phoneRegex = /^(05|06|07)[0-9]{8}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    // Name validation
    function validateName(name) {
        return name.trim().length >= 2 && name.trim().split(' ').length >= 2;
    }

    // Show error function
    function showError(input, errorElement, message) {
        input.classList.add('error');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    // Hide error function
    function hideError(input, errorElement) {
        input.classList.remove('error');
        errorElement.classList.remove('show');
    }

    // Real-time validation
    fullNameInput.addEventListener('input', function() {
        if (validateName(this.value)) {
            hideError(this, fullNameError);
        }
    });

    wilayaSelect.addEventListener('change', function() {
        if (this.value) {
            hideError(this, wilayaError);
        }
    });

    phoneInput.addEventListener('input', function() {
        if (validatePhoneNumber(this.value)) {
            hideError(this, phoneError);
        }
    });

    // Format phone number as user types
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            if (value.length <= 2) {
                value = value;
            } else if (value.length <= 4) {
                value = value.slice(0, 2) + ' ' + value.slice(2);
            } else if (value.length <= 6) {
                value = value.slice(0, 2) + ' ' + value.slice(2, 4) + ' ' + value.slice(4);
            } else if (value.length <= 8) {
                value = value.slice(0, 2) + ' ' + value.slice(2, 4) + ' ' + value.slice(4, 6) + ' ' + value.slice(6);
            } else {
                value = value.slice(0, 2) + ' ' + value.slice(2, 4) + ' ' + value.slice(4, 6) + ' ' + value.slice(6, 8) + ' ' + value.slice(8, 10);
            }
        }
        e.target.value = value;
    });

    // Form submission
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isValid = true;

        // Validate full name
        if (!validateName(fullNameInput.value)) {
            showError(fullNameInput, fullNameError, 'Veuillez entrer votre nom complet (prénom et nom)');
            isValid = false;
        }

        // Validate wilaya
        if (!wilayaSelect.value) {
            showError(wilayaSelect, wilayaError, 'Veuillez sélectionner votre wilaya');
            isValid = false;
        }

        // Validate phone number
        const phoneValue = phoneInput.value.replace(/\s/g, '');
        if (!validatePhoneNumber(phoneValue)) {
            showError(phoneInput, phoneError, 'Veuillez entrer un numéro de téléphone valide (05, 06, ou 07 suivi de 8 chiffres)');
            isValid = false;
        }

        if (isValid) {
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Traitement...';
            orderForm.classList.add('loading');

            // Simulate form submission (replace with actual API call)
            setTimeout(() => {
                // Prepare order data
                const orderData = {
                    fullName: fullNameInput.value.trim(),
                    wilaya: wilayaSelect.value,
                    phoneNumber: phoneValue,
                    address: addressInput.value.trim(),
                    notes: notesInput.value.trim(),
                    product: 'Pyjama Élégant - Collection Printemps',
                    price: '4,500 D.A',
                    timestamp: new Date().toISOString()
                };

                // Here you would typically send the data to your server
                console.log('Order submitted:', orderData);
                
                // Show success message
                successMessage.classList.add('show');
                orderForm.reset();
                orderForm.style.display = 'none';
                
                // Reset button state
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Confirmer la Commande';
                orderForm.classList.remove('loading');

                // Scroll to success message
                successMessage.scrollIntoView({ behavior: 'smooth' });

            }, 2000);
        }
    });

    // Add some interactive features
    wilayaSelect.addEventListener('focus', function() {
        this.style.borderColor = '#e2e8f0';
    });

    // Auto-save form data to localStorage (in case of page refresh)
    function autoSaveForm() {
        const formData = {
            fullName: fullNameInput.value,
            wilaya: wilayaSelect.value,
            phoneNumber: phoneInput.value,
            address: addressInput.value,
            notes: notesInput.value
        };
        localStorage.setItem('pinkyWomanOrderForm', JSON.stringify(formData));
    }

    // Load saved form data
    function loadSavedForm() {
        const savedData = localStorage.getItem('pinkyWomanOrderForm');
        if (savedData) {
            const formData = JSON.parse(savedData);
            fullNameInput.value = formData.fullName || '';
            wilayaSelect.value = formData.wilaya || '';
            phoneInput.value = formData.phoneNumber || '';
            addressInput.value = formData.address || '';
            notesInput.value = formData.notes || '';
        }
    }

    // Auto-save when inputs change
    [fullNameInput, wilayaSelect, phoneInput, addressInput, notesInput].forEach(input => {
        input.addEventListener('input', autoSaveForm);
        input.addEventListener('change', autoSaveForm);
    });

    // Load saved data on page load
    loadSavedForm();

    // Clear saved data on successful submission
    window.addEventListener('beforeunload', function() {
        if (successMessage.classList.contains('show')) {
            localStorage.removeItem('pinkyWomanOrderForm');
        }
    });
});