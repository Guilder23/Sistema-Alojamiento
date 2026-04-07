// Modal Crear Cliente

function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

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

function mostrarErroresFormulario(errors) {
    for (const [field, messages] of Object.entries(errors)) {
        const fieldId = `crear-${field}`;
        const mensaje = Array.isArray(messages) ? messages[0] : messages;
        mostrarErrorCampo(fieldId, mensaje);
    }
}

function limpiarErrores() {
    document.querySelectorAll('.form-control.error').forEach(field => {
        field.classList.remove('error');
    });
    document.querySelectorAll('.form-error.active').forEach(error => {
        error.classList.remove('active');
    });
}

async function crearCliente(formData) {
    try {
        const response = await fetch('/clientes/api/crear/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok && data.success) {
            mostrarExito('Cliente creado exitosamente');
            cerrarModal('modal-crear-cliente');
            limpiarFormularioCrearCliente();
            cargarClientes();
        } else {
            if (data.error) {
                mostrarError(data.error);
            } else if (data.errors) {
                mostrarErroresFormulario(data.errors);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al crear el cliente');
    }
}

document.getElementById('form-crear-cliente')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = {
        nombre: document.getElementById('crear-nombre').value.trim(),
        apellido: document.getElementById('crear-apellido').value.trim(),
        username: document.getElementById('crear-username').value.trim(),
        email: document.getElementById('crear-email').value.trim(),
        password: document.getElementById('crear-password').value,
        password_confirm: document.getElementById('crear-password-confirm').value,
        tipo_documento: document.getElementById('crear-tipo-documento').value,
        numero_documento: document.getElementById('crear-numero-documento').value.trim(),
        telefono: document.getElementById('crear-telefono').value.trim(),
        pais: document.getElementById('crear-pais').value,
        ciudad: document.getElementById('crear-ciudad').value.trim(),
        direccion: document.getElementById('crear-direccion').value.trim(),
        activo: document.getElementById('crear-activo').checked
    };

    if (formData.password !== formData.password_confirm) {
        mostrarErrorCampo('crear-password-confirm', 'Las contrasenas no coinciden');
        return;
    }

    if (!validarFormularioCrearCliente(formData)) {
        return;
    }

    await crearCliente(formData);
});

function validarFormularioCrearCliente(formData) {
    limpiarErrores();
    let isValid = true;

    if (!formData.nombre) {
        mostrarErrorCampo('crear-nombre', 'El nombre es requerido');
        isValid = false;
    }

    if (!formData.apellido) {
        mostrarErrorCampo('crear-apellido', 'El apellido es requerido');
        isValid = false;
    }

    if (!formData.username || formData.username.length < 3) {
        mostrarErrorCampo('crear-username', 'El usuario debe tener al menos 3 caracteres');
        isValid = false;
    }

    if (!formData.email || !validarEmail(formData.email)) {
        mostrarErrorCampo('crear-email', 'Ingrese un email valido');
        isValid = false;
    }

    if (!formData.password || formData.password.length < 6) {
        mostrarErrorCampo('crear-password', 'La contrasena debe tener al menos 6 caracteres');
        isValid = false;
    }

    if (!formData.tipo_documento) {
        mostrarErrorCampo('crear-tipo-documento', 'Seleccione el tipo de documento');
        isValid = false;
    }

    if (!formData.numero_documento) {
        mostrarErrorCampo('crear-numero-documento', 'El numero de documento es requerido');
        isValid = false;
    }

    if (!formData.telefono) {
        mostrarErrorCampo('crear-telefono', 'El telefono es requerido');
        isValid = false;
    }

    if (!formData.pais) {
        mostrarErrorCampo('crear-pais', 'Seleccione un pais');
        isValid = false;
    }

    return isValid;
}

function limpiarFormularioCrearCliente() {
    document.getElementById('form-crear-cliente')?.reset();
    document.getElementById('crear-activo').checked = true;
    limpiarErrores();
}

document.getElementById('close-modal-crear')?.addEventListener('click', function() {
    cerrarModal('modal-crear-cliente');
    limpiarFormularioCrearCliente();
});
