document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('.login-form');
    const usernameInput = document.getElementById('id_username');
    const passwordInput = document.getElementById('id_password');
    
    if (loginForm) {
        // Validación al enviar el formulario
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!usernameInput.value.trim()) {
                showError('El usuario o correo es requerido');
                usernameInput.focus();
                return;
            }
            
            if (!passwordInput.value) {
                showError('La contraseña es requerida');
                passwordInput.focus();
                return;
            }
            
            if (passwordInput.value.length < 6) {
                showError('La contraseña debe tener al menos 6 caracteres');
                return;
            }
            
            // Todo bien, enviar el formulario
            enviarLogin();
        });
        
        // Limpiar mensaje de error al escribir
        usernameInput.addEventListener('input', clearError);
        passwordInput.addEventListener('input', clearError);
    }
});

function enviarLogin() {
    const username = document.getElementById('id_username').value;
    const password = document.getElementById('id_password').value;
    
    // Crear un formulario temporal para enviar como POST tradicional
    const tempForm = document.createElement('form');
    tempForm.method = 'POST';
    tempForm.action = '/autenticacion/login/';
    tempForm.style.display = 'none';
    tempForm.innerHTML = `
        <input type="hidden" name="username" value="${username}">
        <input type="hidden" name="password" value="${password}">
        <input type="hidden" name="csrfmiddlewaretoken" value="${getCsrfToken()}">
    `;
    document.body.appendChild(tempForm);
    
    // Mostrar estado de carga
    const submitBtn = document.querySelector('.login-form button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Autenticando...';
    
    // Enviar en 500ms para mostrar el spinner
    setTimeout(() => {
        tempForm.submit();
    }, 500);
}

function getCsrfToken() {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function showError(message) {
    const errorDiv = document.getElementById('loginErrors');
    if (errorDiv) {
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        errorDiv.style.display = 'block';
    }
}

function clearError() {
    const errorDiv = document.getElementById('loginErrors');
    if (errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.innerHTML = '';
    }
}
