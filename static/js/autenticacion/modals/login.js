/**
 * Script para el Modal de Login
 * Gestiona validación, apertura y cierre del modal
 */

// Función para abrir el Modal de Login
function openLoginModal() {
    const modal = document.getElementById('modalLogin');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('shown');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        // Focus en el primer input
        setTimeout(() => {
            document.getElementById('modal_username')?.focus();
        }, 100);
    }
}

// Función para cerrar el Modal de Login
function closeLoginModal() {
    const modal = document.getElementById('modalLogin');
    if (modal) {
        modal.classList.remove('shown');
        modal.classList.add('hidden');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Función para cambiar a Modal de Registro
function switchToRegistroModal() {
    const loginModal = document.getElementById('modalLogin');
    const registroModal = document.getElementById('modalRegistro');
    
    if (loginModal) {
        loginModal.classList.remove('shown');
        loginModal.classList.add('hidden');
        loginModal.style.display = 'none';
    }
    
    if (registroModal) {
        registroModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            document.getElementById('reg_username')?.focus();
        }, 100);
    }
}

// Cerrar modal haciendo click en el overlay
document.addEventListener('click', function(e) {
    // Cerrar login modal al hacer click en overlay
    if (e.target.id === 'modalLogin' || (e.target.classList && e.target.classList.contains('auth-modal-overlay'))) {
        if (e.target.closest('#modalLogin')) {
            closeLoginModal();
        }
    }
    
    // Cerrar registro modal al hacer click en overlay
    if (e.target.id === 'modalRegistro' || (e.target.classList && e.target.classList.contains('auth-modal-overlay'))) {
        if (e.target.closest('#modalRegistro')) {
            closeRegistroModal();
        }
    }
});

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('modal_username');
    const passwordInput = document.getElementById('modal_password');
    
    if (loginForm && usernameInput && passwordInput) {
        // Validación al enviar el formulario
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = usernameInput.value.trim();
            const password = passwordInput.value;
            
            // Limpiar errores previos
            clearAllLoginErrors();
            
            // Validación de usuario
            if (!username) {
                showLoginFieldError('modal_username', 'El usuario o correo es requerido');
                return;
            }
            
            // Validación de contraseña
            if (!password) {
                showLoginFieldError('modal_password', 'La contraseña es requerida');
                return;
            }
            
            if (password.length < 6) {
                showLoginFieldError('modal_password', 'Mínimo 6 caracteres');
                return;
            }
            
            // Si pasó todas las validaciones, permitir el envío
            loginForm.submit();
        });
        
        // Limpiar errores al escribir
        usernameInput.addEventListener('input', function() {
            clearLoginFieldError('modal_username');
        });
        
        passwordInput.addEventListener('input', function() {
            clearLoginFieldError('modal_password');
        });

        // Manejar Enter en los inputs
        usernameInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                passwordInput.focus();
            }
        });

        passwordInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                loginForm.dispatchEvent(new Event('submit'));
            }
        });
    }
});

// Mostrar error en campo específico
function showLoginFieldError(fieldId, message) {
    const input = document.getElementById(fieldId);
    if (!input) return;
    
    // Agregar clase de error al input
    input.classList.add('input-error');
    
    // Buscar o crear el elemento de error
    const errorId = fieldId + '-error';
    let errorElement = document.getElementById(errorId);
    
    if (!errorElement) {
        const formGroup = input.closest('.auth-form-group');
        if (formGroup) {
            errorElement = document.createElement('div');
            errorElement.className = 'auth-error-message';
            errorElement.id = errorId;
            formGroup.appendChild(errorElement);
        }
    }
    
    if (errorElement) {
        errorElement.textContent = message;
    }
}

// Limpiar error de campo específico
function clearLoginFieldError(fieldId) {
    const input = document.getElementById(fieldId);
    if (input) {
        input.classList.remove('input-error');
        const errorId = fieldId + '-error';
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.textContent = '';
        }
    }
}

// Limpiar todos los errores del login
function clearAllLoginErrors() {
    const fields = ['modal_username', 'modal_password'];
    fields.forEach(fieldId => clearLoginFieldError(fieldId));
}

// Mostrar error en el modal de login (función heredada, no usar)
function showLoginError(message) {
    let errorEl = document.getElementById('loginErrorMsg');
    if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.id = 'loginErrorMsg';
        errorEl.className = 'auth-error-message';
        const form = document.getElementById('loginForm');
        if (form) {
            form.parentNode.insertBefore(errorEl, form);
        }
    }
    errorEl.textContent = message;
    errorEl.style.display = 'block';
}

// Limpiar error en el modal de login (función heredada, no usar)
function clearLoginError() {
    const errorEl = document.getElementById('loginErrorMsg');
    if (errorEl) {
        errorEl.style.display = 'none';
    }
}

// Cerrar modal con tecla ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeLoginModal();
        closeRegistroModal();    }
});