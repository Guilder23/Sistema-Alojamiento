// Modal Editar Usuario

let usuarioEditando = null;

async function editarUsuario(usuarioId) {
    try {
        const response = await fetch(`/usuarios/api/detalle/${usuarioId}/`);
        if (!response.ok) throw new Error('Error al cargar usuario');

        const data = await response.json();
        if (data.success) {
            usuarioEditando = data.usuario;
            cargarDatosEdicion(data.usuario);
            abrirModal('modal-editar-usuario');
        } else {
            mostrarError('No se pudo cargar la información del usuario');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al cargar los datos del usuario');
    }
}

function cargarDatosEdicion(usuario) {
    document.getElementById('editar-id').value = usuario.id;
    document.getElementById('editar-username').value = usuario.username;
    document.getElementById('editar-email').value = usuario.email;
    document.getElementById('editar-rol').value = usuario.rol;
    document.getElementById('editar-is-active').checked = usuario.is_active;
    
    // Limpiar campos de contraseña
    document.getElementById('editar-password').value = '';
    document.getElementById('editar-password-confirm').value = '';
    document.getElementById('cambiar-password').checked = false;
    togglePasswordFields(false);
}

// Toggle de campos de contraseña
document.getElementById('cambiar-password')?.addEventListener('change', function(e) {
    togglePasswordFields(e.target.checked);
});

function togglePasswordFields(mostrar) {
    const passwordFields = document.getElementById('password-fields-editar');
    if (passwordFields) {
        passwordFields.style.display = mostrar ? 'block' : 'none';
        
        // Limpiar campos si se ocultan
        if (!mostrar) {
            document.getElementById('editar-password').value = '';
            document.getElementById('editar-password-confirm').value = '';
        }
    }
}

// Manejar envío del formulario
document.getElementById('form-editar-usuario')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        id: parseInt(document.getElementById('editar-id').value),
        username: document.getElementById('editar-username').value.trim(),
        email: document.getElementById('editar-email').value.trim(),
        rol: document.getElementById('editar-rol').value,
        is_active: document.getElementById('editar-is-active').checked
    };

    // Si se va a cambiar la contraseña
    const cambiarPassword = document.getElementById('cambiar-password').checked;
    if (cambiarPassword) {
        const password = document.getElementById('editar-password').value;
        const passwordConfirm = document.getElementById('editar-password-confirm').value;

        if (password !== passwordConfirm) {
            mostrarErrorCampo('editar-password-confirm', 'Las contraseñas no coinciden');
            return;
        }

        if (password.length < 6) {
            mostrarErrorCampo('editar-password', 'La contraseña debe tener al menos 6 caracteres');
            return;
        }

        formData.password = password;
    }

    // Validar campos requeridos
    if (!validarFormularioEditar(formData)) {
        return;
    }

    await actualizarUsuario(formData);
});

async function actualizarUsuario(formData) {
    try {
        const response = await fetch(`/usuarios/api/actualizar/${formData.id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
            mostrarExito('Usuario actualizado exitosamente');
            cerrarModal('modal-editar-usuario');
            cargarUsuarios();
        } else {
            if (data.error) {
                mostrarError(data.error);
            } else if (data.errors) {
                mostrarErroresFormulario(data.errors, 'editar');
            }
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al actualizar el usuario');
    }
}

// Validación del formulario
function validarFormularioEditar(formData) {
    limpiarErrores();
    let isValid = true;

    if (!formData.username || formData.username.length < 3) {
        mostrarErrorCampo('editar-username', 'El nombre de usuario debe tener al menos 3 caracteres');
        isValid = false;
    }

    if (!formData.email || !validarEmail(formData.email)) {
        mostrarErrorCampo('editar-email', 'Ingrese un email válido');
        isValid = false;
    }

    if (!formData.rol) {
        mostrarErrorCampo('editar-rol', 'Debe seleccionar un rol');
        isValid = false;
    }

    return isValid;
}

// Cerrar modal
document.getElementById('close-modal-editar')?.addEventListener('click', function() {
    cerrarModal('modal-editar-usuario');
    limpiarFormularioEditar();
});

function limpiarFormularioEditar() {
    document.getElementById('form-editar-usuario')?.reset();
    limpiarErrores();
    usuarioEditando = null;
}

// Exponer función globalmente
window.editarUsuario = editarUsuario;
