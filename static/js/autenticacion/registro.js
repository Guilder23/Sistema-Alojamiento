/* ============================================
   REGISTRO PAGE - VALIDACIÓN Y MANEJO DE FORMULARIO
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    const registroForm = document.querySelector('form');
    
    if (registroForm) {
        registroForm.addEventListener('submit', function(e) {
            // Validación básica - Django hará la validación final
            const email = document.getElementById('id_email');
            const password1 = document.getElementById('id_password1');
            const password2 = document.getElementById('id_password2');
            const terminos = document.getElementById('terminos');
            
            // Validar email
            if (email && !isValidEmail(email.value)) {
                e.preventDefault();
                email.focus();
                return false;
            }
            
            // Validar que las contraseñas coincidan
            if (password1 && password2 && password1.value !== password2.value) {
                e.preventDefault();
                alert('Las contraseñas no coinciden');
                password2.focus();
                return false;
            }
            
            // Validar que se aceptan los términos
            if (terminos && !terminos.checked) {
                e.preventDefault();
                alert('Debes aceptar los términos y condiciones');
                terminos.focus();
                return false;
            }
        });

        // Validar email en tiempo real
        const emailInput = document.getElementById('id_email');
        if (emailInput) {
            emailInput.addEventListener('blur', function() {
                if (this.value && !isValidEmail(this.value)) {
                    this.style.borderColor = '#dc3545';
                } else {
                    this.style.borderColor = '#e8e8e8';
                }
            });
        }

        // Validar coincidencia de contraseñas en tiempo real
        const password2Input = document.getElementById('id_password2');
        if (password2Input) {
            password2Input.addEventListener('blur', function() {
                const password1 = document.getElementById('id_password1');
                if (this.value && password1.value !== this.value) {
                    this.style.borderColor = '#dc3545';
                } else {
                    this.style.borderColor = '#e8e8e8';
                }
            });
        }
    }
});

/**
 * Validar formato de email
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
