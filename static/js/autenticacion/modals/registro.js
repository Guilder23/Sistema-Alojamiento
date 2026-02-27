/**
 * Modal Registro - JavaScript
 * Gestiona apertura, cierre y validación del modal
 */

// ============================================
// Funciones Principales
// ============================================

function openRegistroModal() {
    const modal = document.getElementById('modalRegistro');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            document.getElementById('reg_username')?.focus();
        }, 100);
    }
}

function closeRegistroModal() {
    const modal = document.getElementById('modalRegistro');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function switchToLoginModal() {
    closeRegistroModal();
    
    // Abrir modal login
    const loginModal = document.getElementById('modalLogin');
    if (loginModal) {
        loginModal.classList.add('shown');
        loginModal.classList.remove('hidden');
        loginModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            document.getElementById('modal_username')?.focus();
        }, 100);
    }
}

// ============================================
// Event Listeners
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Obtener elementos
    const modal = document.getElementById('modalRegistro');
    const form = document.getElementById('registroForm');
    const password1 = document.getElementById('reg_password1');
    const password2 = document.getElementById('reg_password2');

    if (!modal || !form) return;

    // Cerrar modal con overlay
    const overlay = modal.querySelector('.modal-overlay');
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                closeRegistroModal();
            }
        });
    }

    // Cerrar con tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (modal.classList.contains('active')) {
                closeRegistroModal();
            }
        }
    });

    // Validación del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const username = document.getElementById('reg_username').value.trim();
        const email = document.getElementById('reg_email').value.trim();
        const pass1 = password1.value;
        const pass2 = password2.value;

        // Limpiar errores previos
        clearAllErrors();

        // Validaciones
        if (!username) {
            showError('reg_username', 'El usuario es requerido');
            return;
        }

        if (!email) {
            showError('reg_email', 'El correo es requerido');
            return;
        }

        if (!isValidEmail(email)) {
            showError('reg_email', 'Correo inválido');
            return;
        }

        if (!pass1) {
            showError('reg_password1', 'La contraseña es requerida');
            return;
        }

        if (pass1.length < 8) {
            showError('reg_password1', 'Mínimo 8 caracteres');
            return;
        }

        if (!pass2) {
            showError('reg_password2', 'Confirma la contraseña');
            return;
        }

        if (pass1 !== pass2) {
            showError('reg_password2', 'Las contraseñas no coinciden');
            return;
        }

        // Si todo es válido, enviar
        form.submit();
    });

    // Limpiar errores al escribir
    [
        document.getElementById('reg_username'),
        document.getElementById('reg_email'),
        password1,
        password2
    ].forEach(input => {
        if (input) {
            input.addEventListener('input', function() {
                clearError(this.id);
            });
        }
    });

    // Manejar Enter en los inputs
    const usernameInput = document.getElementById('reg_username');
    const emailInput = document.getElementById('reg_email');

    if (usernameInput) {
        usernameInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                emailInput?.focus();
            }
        });
    }

    if (emailInput) {
        emailInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                password1?.focus();
            }
        });
    }

    if (password1) {
        password1.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                password2?.focus();
            }
        });
    }

    if (password2) {
        password2.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                form.dispatchEvent(new Event('submit'));
            }
        });
    }
});

// ============================================
// Funciones de Validación
// ============================================

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email) && email.length <= 254;
}

function showError(inputId, message) {
    const input = document.getElementById(inputId);
    if (!input) return;

    // Agregar clase de error al input
    input.classList.add('input-error');
    
    // Encontrar el elemento de error correspondiente
    // Los IDs de error siguen el patrón: inputId-error
    const errorId = inputId + '-error';
    let errorElement = document.getElementById(errorId);
    
    // Si no existe, crear el elemento de error
    if (!errorElement) {
        const formGroup = input.closest('.form-group');
        if (formGroup) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.id = errorId;
            formGroup.appendChild(errorElement);
        }
    }
    
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearError(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.classList.remove('input-error');
        
        // Buscar el elemento de error por ID
        const errorId = inputId + '-error';
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.textContent = '';
        }
    }
}

function clearAllErrors() {
    const inputs = [
        'reg_username',
        'reg_email',
        'reg_password1',
        'reg_password2'
    ];

    inputs.forEach(id => clearError(id));
}
