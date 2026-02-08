/* ============================================
   LOGIN PAGE - VALIDACIÓN Y MANEJO DE FORMULARIO
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            // Validación básica - Django hará la validación final
            const username = document.getElementById('id_username');
            const password = document.getElementById('id_password');
            
            if (!username.value.trim()) {
                e.preventDefault();
                username.focus();
                return false;
            }
            
            if (!password.value) {
                e.preventDefault();
                password.focus();
                return false;
            }
        });

        // Limpiar espacios en blanco del username
        const usernameInput = document.getElementById('id_username');
        if (usernameInput) {
            usernameInput.addEventListener('blur', function() {
                this.value = this.value.trim();
            });
        }
    }
});
