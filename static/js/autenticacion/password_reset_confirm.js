document.addEventListener('DOMContentLoaded', function() {
    const confirmForm = document.querySelector('.password-reset-confirm-form');
    
    if (confirmForm) {
        confirmForm.addEventListener('submit', function(e) {
            const password1 = document.getElementById('id_new_password1').value;
            const password2 = document.getElementById('id_new_password2').value;
            
            if (!password1) {
                e.preventDefault();
                showError('La contraseña es requerida');
                return;
            }
            
            if (password1.length < 8) {
                e.preventDefault();
                showError('La contraseña debe tener al menos 8 caracteres');
                return;
            }
            
            if (password1 !== password2) {
                e.preventDefault();
                showError('Las contraseñas no coinciden');
                return;
            }
        });
    }
});

function showError(message) {
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = 'background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;';
    errorDiv.textContent = message;
    
    const form = document.querySelector('.password-reset-confirm-form');
    form.insertBefore(errorDiv, form.firstChild);
}
