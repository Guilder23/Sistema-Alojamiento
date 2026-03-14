document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.login-form');
    const inputField = document.querySelector('input[placeholder*="Usuario"]');
    
    if (inputField) {
        // Mostrar tooltip informativo
        inputField.addEventListener('focus', function() {
            this.title = 'Ingresa tu usuario o correo electrónico';
        });
    }
    
    // Validación del formulario
    if (form) {
        form.addEventListener('submit', function(e) {
            const username = document.getElementById('id_username').value;
            const password = document.getElementById('id_password').value;
            
            if (!username || !password) {
                e.preventDefault();
                alert('Por favor completa todos los campos');
            }
        });
    }
});
