document.addEventListener('DOMContentLoaded', function() {
    const registroForm = document.querySelector('.registro-form');
    
    if (registroForm) {
        registroForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('id_username').value;
            const email = document.getElementById('id_email').value;
            const first_name = document.getElementById('id_first_name').value;
            const last_name = document.getElementById('id_last_name').value;
            const password1 = document.getElementById('id_password1').value;
            const password2 = document.getElementById('id_password2').value;
            
            if (!username.trim()) {
                showError('El usuario es requerido');
                return;
            }
            
            if (!email.trim()) {
                showError('El correo es requerido');
                return;
            }
            
            if (!validateEmail(email)) {
                showError('El correo debe ser válido');
                return;
            }
            
            if (!first_name.trim()) {
                showError('El nombre es requerido');
                return;
            }
            
            if (!last_name.trim()) {
                showError('El apellido es requerido');
                return;
            }
            
            if (!password1) {
                showError('La contraseña es requerida');
                return;
            }
            
            if (password1.length < 8) {
                showError('La contraseña debe tener al menos 8 caracteres');
                return;
            }
            
            if (password1 !== password2) {
                showError('Las contraseñas no coinciden');
                return;
            }
            
            // Todo bien, enviar el formulario
            enviarRegistro();
        });
    }
});

function enviarRegistro() {
    const username = document.getElementById('id_username').value;
    const email = document.getElementById('id_email').value;
    const first_name = document.getElementById('id_first_name').value;
    const last_name = document.getElementById('id_last_name').value;
    const password1 = document.getElementById('id_password1').value;
    
    // Crear un formulario temporal para enviar como POST tradicional
    const tempForm = document.createElement('form');
    tempForm.method = 'POST';
    tempForm.action = '/autenticacion/registro/';
    tempForm.style.display = 'none';
    tempForm.innerHTML = `
        <input type="hidden" name="username" value="${username}">
        <input type="hidden" name="email" value="${email}">
        <input type="hidden" name="first_name" value="${first_name}">
        <input type="hidden" name="last_name" value="${last_name}">
        <input type="hidden" name="password" value="${password1}">
        <input type="hidden" name="password_confirm" value="${password1}">
        <input type="hidden" name="csrfmiddlewaretoken" value="${getCsrfToken()}">
    `;
    document.body.appendChild(tempForm);
    
    // Mostrar estado de carga
    const submitBtn = document.querySelector('.registro-form button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando cuenta...';
    
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

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showError(message) {
    const errorDiv = document.getElementById('registroErrors');
    if (errorDiv) {
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        errorDiv.style.display = 'block';
    }
}
