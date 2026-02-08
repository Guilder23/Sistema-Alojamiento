document.addEventListener('DOMContentLoaded', function() {
    const changeForm = document.querySelector('.password-change-form');
    
    if (changeForm) {
        changeForm.addEventListener('submit', function(e) {
            const oldPassword = document.getElementById('id_old_password').value;
            const newPassword1 = document.getElementById('id_new_password1').value;
            const newPassword2 = document.getElementById('id_new_password2').value;
            
            if (!oldPassword) {
                e.preventDefault();
                showError('Debes ingresar tu contraseña actual');
                return;
            }
            
            if (!newPassword1) {
                e.preventDefault();
                showError('Debes ingresar una nueva contraseña');
                return;
            }
            
            if (newPassword1 !== newPassword2) {
                e.preventDefault();
                showError('Las nuevas contraseñas no coinciden');
                return;
            }
            
            if (oldPassword === newPassword1) {
                e.preventDefault();
                showError('La nueva contraseña debe ser diferente a la actual');
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
    
    const form = document.querySelector('.password-change-form');
    form.insertBefore(errorDiv, form.firstChild);
}
