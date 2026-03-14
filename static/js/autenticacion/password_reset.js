document.addEventListener('DOMContentLoaded', function() {
    const resetForm = document.querySelector('.password-reset-form');
    
    if (resetForm) {
        resetForm.addEventListener('submit', function(e) {
            const emailInput = document.getElementById('id_email');
            
            if (!emailInput) return;
            
            const email = emailInput.value.trim();
            
            if (!email) {
                e.preventDefault();
                showError('Por favor ingresa tu correo electrónico');
                return;
            }
            
            if (!validateEmail(email)) {
                e.preventDefault();
                showError('Por favor ingresa un correo válido');
                return;
            }
        });
    }
});

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showError(message) {
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = 'background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;';
    errorDiv.textContent = message;
    
    const form = document.querySelector('.password-reset-form');
    form.insertBefore(errorDiv, form.firstChild);
}
