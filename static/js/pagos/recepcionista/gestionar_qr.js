// ========================================
// GESTIONAR CONFIGURACIONES QR
// ========================================

// Obtener el token CSRF
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

// Preview de imagen al crear
document.getElementById('imagen_qr_crear')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById('preview_img_crear').src = event.target.result;
            document.getElementById('preview_crear').style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        document.getElementById('preview_crear').style.display = 'none';
    }
});

// Preview de imagen al editar
document.getElementById('imagen_qr_editar')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById('preview_img_editar').src = event.target.result;
            document.getElementById('preview_editar').style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        document.getElementById('preview_editar').style.display = 'none';
    }
});

// Crear nueva configuración QR
document.getElementById('formCrearQR')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const submitBtn = this.querySelector('button[type="submit"]');
    const btnOriginalText = submitBtn.innerHTML;
    
    // Ajustar el estado según el checkbox
    const estadoCheckbox = document.getElementById('estado_crear');
    formData.set('estado', estadoCheckbox.checked ? 'activo' : 'inactivo');
    
    // Mostrar loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    
    try {
        const response = await fetch('/pagos/configurar-qr/crear/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: data.message,
                confirmButtonColor: '#28a745',
                timer: 2000,
                timerProgressBar: true
            }).then(() => {
                location.reload();
            });
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = btnOriginalText;
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.error || 'Ocurrió un error al crear la configuración',
                confirmButtonColor: '#dc3545'
            });
        }
    } catch (error) {
        console.error('Error:', error);
        submitBtn.disabled = false;
        submitBtn.innerHTML = btnOriginalText;
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al procesar la solicitud',
            confirmButtonColor: '#dc3545'
        });
    }
});

// Editar configuración QR
document.querySelectorAll('.btn-editar-qr').forEach(btn => {
    btn.addEventListener('click', function() {
        const qrId = this.getAttribute('data-qr-id');
        
        // Encontrar la tarjeta que contiene los datos
        const card = document.querySelector(`.qr-config-card[data-qr-id="${qrId}"]`);
        
        if (!card) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo cargar la información del QR'
            });
            return;
        }
        
        // Obtener datos de los data attributes
        const codigo = card.getAttribute('data-qr-codigo');
        const descripcion = card.getAttribute('data-qr-descripcion');
        const estado = card.getAttribute('data-qr-estado');
        const imagenUrl = card.getAttribute('data-qr-imagen');
        
        // Poblar el modal con los datos
        document.getElementById('qr_id_editar').value = qrId;
        document.getElementById('descripcion_editar').value = descripcion;
        document.getElementById('codigo_qr_editar').value = codigo;
        document.getElementById('estado_editar').checked = (estado === 'activo');
        
        // Mostrar imagen actual
        if (imagenUrl) {
            document.getElementById('qr_actual_img').src = imagenUrl;
            document.getElementById('imagen_actual_container').style.display = 'block';
        } else {
            document.getElementById('imagen_actual_container').style.display = 'none';
        }
        
        // Limpiar preview de nueva imagen
        document.getElementById('preview_editar').style.display = 'none';
        document.getElementById('imagen_qr_editar').value = '';
        document.getElementById('regenerar_qr').checked = false;
        
        // Mostrar el modal
        const modal = new bootstrap.Modal(document.getElementById('modalEditarQR'));
        modal.show();
    });
});

// Enviar formulario de edición
document.getElementById('formEditarQR')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const qrId = document.getElementById('qr_id_editar').value;
    
    if (!qrId) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo identificar el QR a editar',
            confirmButtonColor: '#dc3545'
        });
        return;
    }
    
    const formData = new FormData(this);
    const submitBtn = this.querySelector('button[type="submit"]');
    const btnOriginalText = submitBtn.innerHTML;
    
    // Ajustar el estado según el checkbox
    const estadoCheckbox = document.getElementById('estado_editar');
    formData.set('estado', estadoCheckbox.checked ? 'activo' : 'inactivo');
    
    // Mostrar loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Actualizando...';
    
    try {
        const response = await fetch(`/pagos/configurar-qr/editar/${qrId}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: '¡Actualizado!',
                text: data.message,
                confirmButtonColor: '#28a745',
                timer: 2000,
                timerProgressBar: true
            }).then(() => {
                location.reload();
            });
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = btnOriginalText;
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.error || 'Ocurrió un error al actualizar la configuración',
                confirmButtonColor: '#dc3545'
            });
        }
    } catch (error) {
        console.error('Error:', error);
        submitBtn.disabled = false;
        submitBtn.innerHTML = btnOriginalText;
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al procesar la solicitud',
            confirmButtonColor: '#dc3545'
        });
    }
});

// Activar configuración QR
document.querySelectorAll('.btn-activar-qr').forEach(btn => {
    btn.addEventListener('click', async function() {
        const qrId = this.getAttribute('data-qr-id');
        
        const result = await Swal.fire({
            title: '¿Activar esta configuración?',
            text: 'Se desactivarán las demás configuraciones QR',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#6c757d',
            confirmButtonText: '<i class="fas fa-check"></i> Sí, activar',
            cancelButtonText: '<i class="fas fa-times"></i> Cancelar'
        });
        
        if (result.isConfirmed) {
            // Mostrar loading
            Swal.fire({
                title: 'Activando...',
                html: 'Por favor espera',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
            try {
                const response = await fetch(`/pagos/configurar-qr/activar/${qrId}/`, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken')
                    }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Activado!',
                        text: data.message,
                        confirmButtonColor: '#28a745',
                        timer: 2000,
                        timerProgressBar: true
                    }).then(() => {
                        location.reload();
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.error,
                        confirmButtonColor: '#dc3545'
                    });
                }
            } catch (error) {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Ocurrió un error al activar la configuración',
                    confirmButtonColor: '#dc3545'
                });
            }
        }
    });
});

// Eliminar configuración QR
document.querySelectorAll('.btn-eliminar-qr').forEach(btn => {
    btn.addEventListener('click', async function() {
        const qrId = this.getAttribute('data-qr-id');
        
        const result = await Swal.fire({
            title: '¿Eliminar esta configuración?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: '<i class="fas fa-trash"></i> Sí, eliminar',
            cancelButtonText: '<i class="fas fa-times"></i> Cancelar'
        });
        
        if (result.isConfirmed) {
            // Mostrar loading
            Swal.fire({
                title: 'Eliminando...',
                html: 'Por favor espera',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
            try {
                const response = await fetch(`/pagos/configurar-qr/eliminar/${qrId}/`, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken')
                    }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Eliminado!',
                        text: data.message,
                        confirmButtonColor: '#28a745',
                        timer: 2000,
                        timerProgressBar: true
                    }).then(() => {
                        location.reload();
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.error,
                        confirmButtonColor: '#dc3545'
                    });
                }
            } catch (error) {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Ocurrió un error al eliminar la configuración',
                    confirmButtonColor: '#dc3545'
                });
            }
        }
    });
});
