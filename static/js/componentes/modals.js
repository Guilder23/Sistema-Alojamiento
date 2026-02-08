/* ============================================
   GESTIÓN DE MODALS - LOGIN Y REGISTRO
   ============================================ */

/**
 * Abre un modal específico
 * @param {string} modalId - ID del modal a abrir
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        // Enfocar el primer input
        const firstInput = modal.querySelector('input');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

/**
 * Cierra un modal específico
 * @param {string} modalId - ID del modal a cerrar
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

/**
 * Alterna entre dos modals
 * @param {string} closeModalId - ID del modal a cerrar
 * @param {string} openModalId - ID del modal a abrir
 */
function switchModal(closeModalId, openModalId) {
    closeModal(closeModalId);
    openModal(openModalId);
}

/**
 * Cierra todos los modals
 */
function closeAllModals() {
    document.querySelectorAll('.modal, .modal-backdrop').forEach(modal => {
        modal.classList.remove('active');
        modal.style.display = 'none';
    });
    document.body.style.overflow = 'auto';
}

// Event Listeners para cerrar modals
document.addEventListener('DOMContentLoaded', function() {
    // Cerrar modal al hacer click en X
    document.querySelectorAll('.modal-close, .btn-close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal, .modal-backdrop');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });

    // Cerrar modal al hacer click fuera del contenido
    document.querySelectorAll('.modal, .modal-backdrop').forEach(modal => {
        modal.addEventListener('click', function(e) {
            // Solo si el click fue en el fondo, no en el contenido
            if (e.target === this) {
                closeAllModals();
            }
        });
    });

    // Cerrar modal con tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });

    // Prevenir cierre al hacer click dentro del contenido
    document.querySelectorAll('.modal-content').forEach(content => {
        content.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
});

// Función para abrir login modal desde navbar
function openLoginModal() {
    const modal = document.getElementById('modalLogin');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeLoginModal() {
    const modal = document.getElementById('modalLogin');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Función para abrir registro modal desde navbar
function openRegistroModal() {
    const modal = document.getElementById('modalRegistro');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeRegistroModal() {
    const modal = document.getElementById('modalRegistro');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Cambiar entre login y registro
function switchToLoginModal() {
    closeRegistroModal();
    openLoginModal();
}

function switchToRegistroModal() {
    closeLoginModal();
    openRegistroModal();
}

// Aliases para compatibilidad
const abrirModal = openModal;
const cerrarModal = closeModal;

// Exportar funciones si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        openModal,
        closeModal,
        abrirModal,
        cerrarModal,
        switchModal,
        closeAllModals,
        openLoginModal,
        openRegistroModal
    };
}
