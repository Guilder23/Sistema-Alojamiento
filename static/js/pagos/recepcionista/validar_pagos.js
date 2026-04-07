/**
 * Pagos Recepcionista - JavaScript
 * Validación de pagos de clientes
 */

// Obtener CSRF token
function getCookie(name) {
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

const csrftoken = getCookie('csrftoken');

let pagoActual = null;

/**
 * Mostrar comprobante en modal
 */
function mostrarComprobanteModal(imagenUrl, titulo) {
    const preview = document.getElementById('comprobantePreview');
    const btnDescarga = document.getElementById('btnDescargaComprobante');
    
    if (preview) {
        preview.src = imagenUrl;
    }
    if (btnDescarga) {
        btnDescarga.href = imagenUrl;
    }
}

/**
 * Corregir problemas de accesibilidad en modales
 */
function corregirAccesibilidadModales() {
    // Manejar foco en modales para evitar errores de aria-hidden
    const modales = ['modalAprobarPago', 'modalRechazarPago', 'modalVerComprobante'];
    
    modales.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.addEventListener('show.bs.modal', function() {
                // Guardar elemento que tenía foco
                window.lastFocusedElement = document.activeElement;
            });
            
            modal.addEventListener('shown.bs.modal', function() {
                // Enfocar el modal correctamente
                const modalDialog = modal.querySelector('.modal-dialog');
                if (modalDialog) {
                    modalDialog.focus();
                }
            });
            
            modal.addEventListener('hide.bs.modal', function() {
                // Remover foco de elementos dentro del modal antes de ocultarlo
                const focusedElements = modal.querySelectorAll('input:focus, textarea:focus, button:focus, select:focus');
                focusedElements.forEach(element => {
                    element.blur();
                });
            });
            
            modal.addEventListener('hidden.bs.modal', function() {
                // Restaurar foco al elemento anterior
                if (window.lastFocusedElement && window.lastFocusedElement.focus) {
                    setTimeout(() => {
                        window.lastFocusedElement.focus();
                    }, 100);
                }
            });
        }
    });
}

/**
 * Desactivar traducciones automáticas que causan errores
 */
function desactivarTraduccionesAutomaticas() {
    // Desactivar Google Translate si está presente
    if (window.google && window.google.translate) {
        try {
            // Prevenir banners de traducción
            window.google.translate.TranslateElement.prototype.showBanner = function() { return false; };
            window.google.translate.TranslateElement.prototype.isShown = function() { return false; };
        } catch (e) {
            // Ignorar errores
        }
    }

    // Bloquear llamadas a APIs de traducción que causan errores
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const url = args[0];
        if (typeof url === 'string' && url.includes('translate-pa.googleapis.com')) {
            console.log('Bloqueando llamada a Google Translate API');
            return Promise.reject(new Error('Traducción automática bloqueada'));
        }
        return originalFetch.apply(this, args);
    };

    // Prevenir errores de XMLHttpRequest a servicios de traducción
    const originalXMLHttpRequest = window.XMLHttpRequest;
    window.XMLHttpRequest = function() {
        const xhr = new originalXMLHttpRequest();
        const originalOpen = xhr.open;
        xhr.open = function(method, url) {
            if (typeof url === 'string' && url.includes('translate-pa.googleapis.com')) {
                console.log('Bloqueando XMLHttpRequest a Google Translate API');
                throw new Error('Traducción automática bloqueada');
            }
            return originalOpen.apply(this, arguments);
        };
        return xhr;
    };

    // Limpiar objetos de traducción que puedan causar errores
    window.addEventListener('load', function() {
        // Limpiar referencias a objetos de traducción
        if (window.qE) {
            try {
                delete window.qE;
            } catch (e) {
                window.qE = null;
            }
        }

        // Limpiar elementos de traducción de Google
        const translateElements = document.querySelectorAll('[id*="goog"], [class*="goog"], [id*="translate"]');
        translateElements.forEach(element => {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
    });
}

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    console.log('Validar Pagos inicializado');
    
    // Corregir problemas de accesibilidad
    corregirAccesibilidadModales();
    
    // Desactivar traducciones automáticas
    desactivarTraduccionesAutomaticas();
    
    // Búsqueda en tabla de pendientes
    const searchPagos = document.getElementById('search-pagos');
    if (searchPagos) {
        searchPagos.addEventListener('keyup', function() {
            filtrarTablaPendientes();
        });
    }
    
    // Filtro de habitación
    const filterHabitacion = document.getElementById('filter-habitacion');
    if (filterHabitacion) {
        filterHabitacion.addEventListener('change', function() {
            filtrarTablaPendientes();
        });
    }
    
    // Búsqueda en tabla de validados
    const searchValidados = document.getElementById('search-validados');
    if (searchValidados) {
        searchValidados.addEventListener('keyup', function() {
            filtrarTablaValidados();
        });
    }
    
    // Filtro de estado
    const filterEstado = document.getElementById('filter-estado-validacion');
    if (filterEstado) {
        filterEstado.addEventListener('change', function() {
            filtrarTablaValidados();
        });
    }
    
    // Event listeners para botones de aprobar/rechazar
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-aprobar-pago')) {
            const btn = e.target.closest('.btn-aprobar-pago');
            pagoActual = btn.getAttribute('data-pago-id');
            document.getElementById('pago-id-aprobar').value = pagoActual;
        }
        
        if (e.target.closest('.btn-rechazar-pago')) {
            const btn = e.target.closest('.btn-rechazar-pago');
            pagoActual = btn.getAttribute('data-pago-id');
            document.getElementById('pago-id-rechazar').value = pagoActual;
            // Limpiar formulario
            document.getElementById('form-rechazar-pago').reset();
        }
    });
    
    // Botón confirmar aprobación
    const btnConfirmarAprobacion = document.getElementById('btn-confirmar-aprobacion');
    if (btnConfirmarAprobacion) {
        btnConfirmarAprobacion.addEventListener('click', aprobarPago);
    }
    
    // Botón confirmar rechazo
    const btnConfirmarRechazo = document.getElementById('btn-confirmar-rechazo');
    if (btnConfirmarRechazo) {
        btnConfirmarRechazo.addEventListener('click', rechazarPago);
    }
});

/**
 * Filtrar tabla de pagos pendientes
 */
function filtrarTablaPendientes() {
    const searchInput = document.getElementById('search-pagos');
    const filterHabitacion = document.getElementById('filter-habitacion');
    const tabla = document.getElementById('tabla-pagos-pendientes');
    
    if (!tabla) return;
    
    const filas = tabla.querySelectorAll('tbody tr');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const habitacionFilter = filterHabitacion ? filterHabitacion.value : '';
    
    let filasVisibles = 0;
    
    filas.forEach(fila => {
        const cliente = fila.cells[0].textContent.toLowerCase();
        const email = fila.cells[1].textContent.toLowerCase();
        const habitacion = fila.cells[3].textContent.toLowerCase();
        
        const coincideSearch = !searchTerm || cliente.includes(searchTerm) || email.includes(searchTerm);
        const coincideHabitacion = !habitacionFilter || habitacion.includes(habitacionFilter);
        
        if (coincideSearch && coincideHabitacion) {
            fila.style.display = '';
            filasVisibles++;
        } else {
            fila.style.display = 'none';
        }
    });
    
    // Mostrar mensaje si no hay resultados
    if (filasVisibles === 0) {
        if (!tabla.querySelector('.no-resultados')) {
            const fila = document.createElement('tr');
            fila.className = 'no-resultados';
            fila.innerHTML = '<td colspan="8" style="text-align: center; padding: 40px; color: #999;">No se encontraron resultados</td>';
            tabla.querySelector('tbody').appendChild(fila);
        }
    } else {
        const filaNoResultados = tabla.querySelector('.no-resultados');
        if (filaNoResultados) filaNoResultados.remove();
    }
}

/**
 * Filtrar tabla de pagos validados
 */
function filtrarTablaValidados() {
    const searchInput = document.getElementById('search-validados');
    const filterEstado = document.getElementById('filter-estado-validacion');
    const tabla = document.getElementById('tabla-pagos-validados');
    
    if (!tabla) return;
    
    const filas = tabla.querySelectorAll('tbody tr');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const estadoFilter = filterEstado ? filterEstado.value : '';
    
    let filasVisibles = 0;
    
    filas.forEach(fila => {
        const cliente = fila.cells[0].textContent.toLowerCase();
        const estado = fila.cells[3].textContent.toLowerCase();
        
        const coincideSearch = !searchTerm || cliente.includes(searchTerm);
        const coincideEstado = !estadoFilter || estado.includes(estadoFilter);
        
        if (coincideSearch && coincideEstado) {
            fila.style.display = '';
            filasVisibles++;
        } else {
            fila.style.display = 'none';
        }
    });
    
    // Mostrar mensaje si no hay resultados
    if (filasVisibles === 0) {
        if (!tabla.querySelector('.no-resultados')) {
            const fila = document.createElement('tr');
            fila.className = 'no-resultados';
            fila.innerHTML = '<td colspan="6" style="text-align: center; padding: 40px; color: #999;">No se encontraron resultados</td>';
            tabla.querySelector('tbody').appendChild(fila);
        }
    } else {
        const filaNoResultados = tabla.querySelector('.no-resultados');
        if (filaNoResultados) filaNoResultados.remove();
    }
}

/**
 * Cambiar página pendientes (placeholder - puedes implementar paginación real)
 */
function cambiarPaginaPendientes(direccion) {
    console.log('Cambiar página:', direccion);
    // Implementación de paginación si es necesaria
}

/**
 * Cambiar página validados (placeholder - puedes implementar paginación real)
 */
function cambiarPaginaValidados(direccion) {
    console.log('Cambiar página:', direccion);
    // Implementación de paginación si es necesaria
}

/**
 * Aprobar un pago
 */
async function aprobarPago() {
    const form = document.getElementById('form-aprobar-pago');
    const pagoId = document.getElementById('pago-id-aprobar').value;
    
    if (!pagoId) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo identificar el pago'
        });
        return;
    }
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const referencia = document.getElementById('referencia-transaccion').value;
    const comentario = document.getElementById('comentario-aprobacion').value;
    
    const btn = document.getElementById('btn-confirmar-aprobacion');
    const btnOriginalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Procesando...';
    
    try {
        const response = await fetch(`/pagos/aprobar/${pagoId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': csrftoken
            },
            body: new URLSearchParams({
                'referencia': referencia,
                'comentario': comentario
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Cerrar el modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalAprobarPago'));
            if (modal) modal.hide();
            
            // Mostrar mensaje de éxito
            Swal.fire({
                icon: 'success',
                title: '¡Pago Aprobado!',
                text: data.message,
                confirmButtonColor: '#059669',
                timer: 2000,
                timerProgressBar: true
            }).then(() => {
                location.reload();
            });
        } else {
            throw new Error(data.error || 'Error al aprobar el pago');
        }
    } catch (error) {
        console.error('Error:', error);
        btn.disabled = false;
        btn.innerHTML = btnOriginalHTML;
        
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'No se pudo aprobar el pago',
            confirmButtonColor: '#dc3545'
        });
    }
}

/**
 * Rechazar un pago
 */
async function rechazarPago() {
    const form = document.getElementById('form-rechazar-pago');
    const pagoId = document.getElementById('pago-id-rechazar').value;
    
    if (!pagoId) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo identificar el pago'
        });
        return;
    }
    
    const motivoRadio = document.querySelector('input[name="motivo"]:checked');
    if (!motivoRadio) {
        Swal.fire({
            icon: 'warning',
            title: 'Atención',
            text: 'Por favor selecciona un motivo de rechazo'
        });
        return;
    }
    
    let motivo = motivoRadio.value;
    
    // Si es "Otro", usar el texto del textarea
    if (motivo === 'Otro') {
        const detalle = document.getElementById('motivo-detalle').value.trim();
        if (!detalle) {
            Swal.fire({
                icon: 'warning',
                title: 'Atención',
                text: 'Por favor especifica el motivo del rechazo'
            });
            return;
        }
        motivo = detalle;
    }
    
    const btn = document.getElementById('btn-confirmar-rechazo');
    const btnOriginalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Procesando...';
    
    try {
        const response = await fetch(`/pagos/rechazar/${pagoId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': csrftoken
            },
            body: new URLSearchParams({
                'motivo': motivo
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Cerrar el modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalRechazarPago'));
            if (modal) modal.hide();
            
            // Mostrar mensaje de confirmación
            Swal.fire({
                icon: 'warning',
                title: 'Pago Rechazado',
                text: data.message,
                confirmButtonColor: '#d97706',
                timer: 2000,
                timerProgressBar: true
            }).then(() => {
                location.reload();
            });
        } else {
            throw new Error(data.error || 'Error al rechazar el pago');
        }
    } catch (error) {
        console.error('Error:', error);
        btn.disabled = false;
        btn.innerHTML = btnOriginalHTML;
        
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'No se pudo rechazar el pago',
            confirmButtonColor: '#dc3545'
        });
    }
}
