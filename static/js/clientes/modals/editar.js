// Modal Editar Cliente

let clienteEditando = null;

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

function mostrarErroresFormulario(errors, prefix = 'editar') {
    for (const [field, messages] of Object.entries(errors)) {
        const fieldId = `${prefix}-${field}`;
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

async function editarCliente(clienteId) {
    try {
        const response = await fetch(`/clientes/api/detalle/${clienteId}/`);
        if (!response.ok) throw new Error('Error al cargar cliente');

        const data = await response.json();
        if (data.success) {
            clienteEditando = data.cliente;
            cargarDatosEdicionCliente(data.cliente);
            abrirModal('modal-editar-cliente');
        } else {
            mostrarError('No se pudo cargar la informacion del cliente');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al cargar los datos del cliente');
    }
}

function cargarDatosEdicionCliente(cliente) {
    document.getElementById('editar-id').value = cliente.id;
    document.getElementById('editar-nombre').value = cliente.nombre;
    document.getElementById('editar-apellido').value = cliente.apellido;
    document.getElementById('editar-tipo-documento').value = cliente.tipo_documento;
    document.getElementById('editar-numero-documento').value = cliente.numero_documento;
    document.getElementById('editar-telefono').value = cliente.telefono;
    document.getElementById('editar-email').value = cliente.email;
    document.getElementById('editar-pais').value = cliente.pais;
    document.getElementById('editar-ciudad').value = cliente.ciudad || '';
    document.getElementById('editar-direccion').value = cliente.direccion || '';
    document.getElementById('editar-activo').checked = !!cliente.activo;
}

document.getElementById('form-editar-cliente')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = {
        id: parseInt(document.getElementById('editar-id').value),
        nombre: document.getElementById('editar-nombre').value.trim(),
        apellido: document.getElementById('editar-apellido').value.trim(),
        tipo_documento: document.getElementById('editar-tipo-documento').value,
        numero_documento: document.getElementById('editar-numero-documento').value.trim(),
        telefono: document.getElementById('editar-telefono').value.trim(),
        email: document.getElementById('editar-email').value.trim(),
        pais: document.getElementById('editar-pais').value,
        ciudad: document.getElementById('editar-ciudad').value.trim(),
        direccion: document.getElementById('editar-direccion').value.trim(),
        activo: document.getElementById('editar-activo').checked
    };

    if (!validarFormularioEditarCliente(formData)) {
        return;
    }

    await actualizarCliente(formData);
});

async function actualizarCliente(formData) {
    try {
        const response = await fetch(`/clientes/api/actualizar/${formData.id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok && data.success) {
            mostrarExito('Cliente actualizado exitosamente');
            cerrarModal('modal-editar-cliente');
            cargarClientes();
        } else {
            if (data.error) {
                mostrarError(data.error);
            } else if (data.errors) {
                mostrarErroresFormulario(data.errors, 'editar');
            }
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al actualizar el cliente');
    }
}

function validarFormularioEditarCliente(formData) {
    limpiarErrores();
    let isValid = true;

    if (!formData.nombre) {
        mostrarErrorCampo('editar-nombre', 'El nombre es requerido');
        isValid = false;
    }

    if (!formData.apellido) {
        mostrarErrorCampo('editar-apellido', 'El apellido es requerido');
        isValid = false;
    }

    if (!formData.tipo_documento) {
        mostrarErrorCampo('editar-tipo-documento', 'Seleccione el tipo de documento');
        isValid = false;
    }

    if (!formData.numero_documento) {
        mostrarErrorCampo('editar-numero-documento', 'El numero de documento es requerido');
        isValid = false;
    }

    if (!formData.telefono) {
        mostrarErrorCampo('editar-telefono', 'El telefono es requerido');
        isValid = false;
    }

    if (!formData.email || !validarEmail(formData.email)) {
        mostrarErrorCampo('editar-email', 'Ingrese un email valido');
        isValid = false;
    }

    if (!formData.pais) {
        mostrarErrorCampo('editar-pais', 'Seleccione un pais');
        isValid = false;
    }

    return isValid;
}

document.getElementById('close-modal-editar')?.addEventListener('click', function() {
    cerrarModal('modal-editar-cliente');
    limpiarFormularioEditarCliente();
});

function limpiarFormularioEditarCliente() {
    document.getElementById('form-editar-cliente')?.reset();
    limpiarErrores();
    clienteEditando = null;
}

window.editarCliente = editarCliente;
