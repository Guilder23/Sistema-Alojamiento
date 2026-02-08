// Modal Crear Usuario

async function crearUsuario(formData) {
    try {
        const response = await fetch('/usuarios/api/crear/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
            mostrarExito('Usuario creado exitosamente');
            cerrarModal('modal-crear-usuario');
            limpiarFormularioCrear();
            cargarUsuarios();
        } else {
            if (data.error) {
                mostrarError(data.error);
            } else if (data.errors) {
                mostrarErroresFormulario(data.errors);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al crear el usuario');
    }
}

// Manejar envío del formulario
document.getElementById('form-crear-usuario')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        username: document.getElementById('crear-username').value.trim(),
        email: document.getElementById('crear-email').value.trim(),
        password: document.getElementById('crear-password').value,
        password_confirm: document.getElementById('crear-password-confirm').value,
        rol: document.getElementById('crear-rol').value
    };

    // Validar contraseñas
    if (formData.password !== formData.password_confirm) {
        mostrarErrorCampo('crear-password-confirm', 'Las contraseñas no coinciden');
        return;
    }

    // Validar campos requeridos
    if (!validarFormularioCrear(formData)) {
        return;
    }

    await crearUsuario(formData);
});

// Validación del formulario
function validarFormularioCrear(formData) {
    limpiarErrores();
    let isValid = true;

    if (!formData.username || formData.username.length < 3) {
        mostrarErrorCampo('crear-username', 'El nombre de usuario debe tener al menos 3 caracteres');
        isValid = false;
    }

    if (!formData.email || !validarEmail(formData.email)) {
        mostrarErrorCampo('crear-email', 'Ingrese un email válido');
        isValid = false;
    }

    if (!formData.password || formData.password.length < 6) {
        mostrarErrorCampo('crear-password', 'La contraseña debe tener al menos 6 caracteres');
        isValid = false;
    }

    if (!formData.rol) {
        mostrarErrorCampo('crear-rol', 'Debe seleccionar un rol');
        isValid = false;
    }

    return isValid;
}

// Validar email
function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Mostrar error en campo específico
function mostrarErrorCampo(fieldId, mensaje) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.add('error');
        const errorDiv = field.parentElement.querySelector('.form-error');
        if (errorDiv) {
            errorDiv.textContent = mensaje;
            errorDiv.classList.add('active');
        }
    }
}

// Mostrar errores del servidor
function mostrarErroresFormulario(errors) {
    for (const [field, messages] of Object.entries(errors)) {
        const fieldId = `crear-${field}`;
        mostrarErrorCampo(fieldId, messages[0]);
    }
}

// Limpiar errores
function limpiarErrores() {
    document.querySelectorAll('.form-control.error').forEach(field => {
        field.classList.remove('error');
    });
    document.querySelectorAll('.form-error.active').forEach(error => {
        error.classList.remove('active');
    });
}

// Limpiar formulario
function limpiarFormularioCrear() {
    document.getElementById('form-crear-usuario')?.reset();
    limpiarErrores();
}

// Cerrar modal
document.getElementById('close-modal-crear')?.addEventListener('click', function() {
    cerrarModal('modal-crear-usuario');
    limpiarFormularioCrear();
});
