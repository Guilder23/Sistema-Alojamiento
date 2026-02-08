/* JavaScript para gestión de usuarios con modals modulares */

let usuariosData = [];
let usuariosActuales = [];
let usuarioSeleccionado = null;

document.addEventListener('DOMContentLoaded', function() {
    cargarUsuarios();
});

// ==================== CARGAR Y FILTRAR USUARIOS ====================

function cargarUsuarios() {
    fetch('/usuarios/api/')
        .then(response => response.json())
        .then(data => {
            usuariosData = data.usuarios || [];
            filtrarUsuarios();
        })
        .catch(error => {
            console.error('Error cargando usuarios:', error);
            mostrarError('Error al cargar usuarios');
        });
}

function filtrarUsuarios() {
    const busqueda = document.getElementById('busquedaInput').value.toLowerCase();
    const rolFiltro = document.getElementById('filtroRol').value;
    
    usuariosActuales = usuariosData.filter(usuario => {
        const coincideBusqueda = !busqueda || 
            usuario.username.toLowerCase().includes(busqueda) ||
            usuario.email.toLowerCase().includes(busqueda) ||
            `${usuario.first_name} ${usuario.last_name}`.toLowerCase().includes(busqueda);
        
        const coincideRol = !rolFiltro || usuario.rol === rolFiltro;
        
        return coincideBusqueda && coincideRol;
    });
    
    renderizarTabla();
}

function limpiarFiltros() {
    document.getElementById('busquedaInput').value = '';
    document.getElementById('filtroRol').value = '';
    filtrarUsuarios();
}

function renderizarTabla() {
    const tbody = document.getElementById('usuariosBody');
    const sinUsuarios = document.getElementById('sinUsuarios');
    
    if (usuariosActuales.length === 0) {
        tbody.innerHTML = '';
        sinUsuarios.style.display = 'block';
        return;
    }
    
    sinUsuarios.style.display = 'none';
    tbody.innerHTML = usuariosActuales.map(usuario => `
        <tr class="usuario-row" data-usuario-id="${usuario.id}">
            <td class="usuario-username">
                <strong>${usuario.username}</strong>
            </td>
            <td>${usuario.email}</td>
            <td>${usuario.first_name} ${usuario.last_name}</td>
            <td>
                <span class="badge badge-rol">${usuario.rol || 'Sin asignar'}</span>
            </td>
            <td>
                ${usuario.is_active ? 
                    '<span class="badge badge-success">Activo</span>' : 
                    '<span class="badge badge-danger">Inactivo</span>'}
            </td>
            <td class="acciones">
                <button class="btn btn-sm btn-info" onclick="verUsuario(${usuario.id})" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-warning" onclick="editarUsuario(${usuario.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                ${usuario.id !== getCurrentUserId() ? `
                    <button class="btn btn-sm btn-danger" onclick="confirmarEliminar(${usuario.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

// ==================== FUNCIONES MODALS ====================

function abrirModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function cerrarModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Cerrar modal al hacer click afuera
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-backdrop')) {
        cerrarModal(e.target.id);
    }
});

// ==================== UTILIDADES ====================

function getCsrfToken() {
    const name = 'csrftoken';
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

function getCurrentUserId() {
    // Obtener del HTML si está disponible
    const userIdElement = document.querySelector('[data-user-id]');
    return userIdElement ? parseInt(userIdElement.dataset.userId) : null;
}

function mostrarError(mensaje) {
    const alerta = document.createElement('div');
    alerta.className = 'alert alert-danger';
    alerta.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${mensaje}`;
    
    const container = document.querySelector('.usuarios-container');
    if (container) {
        container.insertBefore(alerta, container.firstChild);
        setTimeout(() => alerta.remove(), 5000);
    }
}

function mostrarExito(mensaje) {
    const alerta = document.createElement('div');
    alerta.className = 'alert alert-success';
    alerta.innerHTML = `<i class="fas fa-check-circle"></i> ${mensaje}`;
    
    const container = document.querySelector('.usuarios-container');
    if (container) {
        container.insertBefore(alerta, container.firstChild);
        setTimeout(() => alerta.remove(), 5000);
    }
}

function mostrarErrorForm(elementId, mensaje) {
    const errorDiv = document.getElementById(elementId);
    if (errorDiv) {
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${mensaje}`;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}
    
    const form = document.getElementById('crearUsuarioForm');
    const formData = new FormData(form);
    
    // Validar contraseñas coincidan
    if (formData.get('password') !== formData.get('password2')) {
        mostrarErrorForm('crearErrors', 'Las contraseñas no coinciden');
        return;
    }
    
    // Validar longitud de contraseña
    if (formData.get('password').length < 8) {
        mostrarErrorForm('crearErrors', 'La contraseña debe tener al menos 8 caracteres');
        return;
    }
    
    const datos = {
        username: formData.get('username'),
        email: formData.get('email'),
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        password: formData.get('password'),
        rol: formData.get('rol'),
        is_active: formData.get('is_active') ? true : false
    };
    
    fetch('/usuarios/api/crear/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify(datos)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            cerrarModal('modalCrearUsuario');
            form.reset();
            cargarUsuarios();
            mostrarExito('Usuario creado exitosamente');
        } else {
            mostrarErrorForm('crearErrors', data.error || 'Error al crear usuario');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarErrorForm('crearErrors', 'Error al crear usuario');
    });


function actualizarUsuario(e) {
    e.preventDefault();
    
    const form = document.getElementById('editarUsuarioForm');
    const formData = new FormData(form);
    const usuarioId = formData.get('usuario_id');
    
    const datos = {
        email: formData.get('email'),
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        rol: formData.get('rol'),
        is_active: formData.get('is_active') ? true : false
    };
    
    fetch(`/usuarios/api/${usuarioId}/actualizar/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify(datos)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            cerrarModal('modalEditarUsuario');
            cargarUsuarios();
            mostrarExito('Usuario actualizado exitosamente');
        } else {
            mostrarErrorForm('editarErrors', data.error || 'Error al actualizar usuario');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarErrorForm('editarErrors', 'Error al actualizar usuario');
    });
}

function eliminarUsuario(e) {
    e.preventDefault();
    
    const usuarioId = document.getElementById('eliminarUsuarioId').value;
    
    fetch(`/usuarios/api/${usuarioId}/eliminar/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCsrfToken()
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            cerrarModal('modalEliminarUsuario');
            cargarUsuarios();
            mostrarExito('Usuario eliminado exitosamente');
        } else {
            mostrarError(data.error || 'Error al eliminar usuario');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarError('Error al eliminar usuario');
    });
}

// ==================== MANEJO DE MODALS ====================

function verUsuario(usuarioId) {
    const usuario = usuariosData.find(u => u.id === usuarioId);
    if (!usuario) return;
    
    usuarioSeleccionado = usuario;
    
    const contenido = document.getElementById('verUsuarioContenido');
    contenido.innerHTML = `
        <div class="usuario-info-card">
            <div class="info-item">
                <label>Usuario:</label>
                <p>${usuario.username}</p>
            </div>
            <div class="info-item">
                <label>Correo:</label>
                <p>${usuario.email}</p>
            </div>
            <div class="info-item">
                <label>Nombre Completo:</label>
                <p>${usuario.first_name} ${usuario.last_name}</p>
            </div>
            <div class="info-item">
                <label>Rol:</label>
                <p><span class="badge badge-rol">${usuario.rol || 'Sin asignar'}</span></p>
            </div>
            <div class="info-item">
                <label>Estado:</label>
                <p>${usuario.is_active ? 
                    '<span class="badge badge-success">Activo</span>' : 
                    '<span class="badge badge-danger">Inactivo</span>'}</p>
            </div>
            <div class="info-item">
                <label>Correo Verificado:</label>
                <p>${usuario.email_verified ? 'Sí' : 'No'}</p>
            </div>
        </div>
    `;
    
    abrirModal('modalVerUsuario');
}

function editarUsuario(usuarioId) {
    const usuario = usuariosData.find(u => u.id === usuarioId);
    if (!usuario) return;
    
    usuarioSeleccionado = usuario;
    
    document.getElementById('editarUsuarioId').value = usuario.id;
    document.getElementById('editarUsername').value = usuario.username;
    document.getElementById('editarUsername').disabled = true;
    document.getElementById('editarEmail').value = usuario.email;
    document.getElementById('editarNombre').value = usuario.first_name;
    document.getElementById('editarApellido').value = usuario.last_name;
    document.getElementById('editarRol').value = usuario.rol || '';
    document.getElementById('editarActivo').checked = usuario.is_active;
    
    abrirModal('modalEditarUsuario');
}

function confirmarEliminar(usuarioId) {
    const usuario = usuariosData.find(u => u.id === usuarioId);
    if (!usuario) return;
    
    usuarioSeleccionado = usuario;
    
    document.getElementById('eliminarUsuarioId').value = usuario.id;
    document.getElementById('eliminarUsuarioNombre').textContent = usuario.username;
    
    abrirModal('modalEliminarUsuario');
}

function abrirEditarUsuario() {
    if (usuarioSeleccionado) {
        cerrarModal('modalVerUsuario');
        editarUsuario(usuarioSeleccionado.id);
    }
}

// ==================== FUNCIONES MODALS ====================

function abrirModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function cerrarModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Cerrar modal al hacer click afuera
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-backdrop')) {
        cerrarModal(e.target.id);
    }
});

// ==================== VALIDACIÓN DE FORMULARIOS ====================

function setupFormValidation() {
    const passwordInput = document.getElementById('crearPassword');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const strength = calcularFortalezaContraseña(this.value);
            mostrarFortalezaContraseña(strength);
        });
    }
}

function calcularFortalezaContraseña(password) {
    let fortaleza = 0;
    if (password.length >= 8) fortaleza++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) fortaleza++;
    if (password.match(/[0-9]/)) fortaleza++;
    if (password.match(/[^a-zA-Z0-9]/)) fortaleza++;
    return fortaleza;
}

function mostrarFortalezaContraseña(fortaleza) {
    // Opcional: mostrar barra de fortaleza
    console.log('Fortaleza:', fortaleza);
}

// ==================== UTILIDADES ====================

function getCsrfToken() {
    const name = 'csrftoken';
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

function getCurrentUserId() {
    // Obtener del HTML si está disponible
    const userIdElement = document.querySelector('[data-user-id]');
    return userIdElement ? parseInt(userIdElement.dataset.userId) : null;
}

function mostrarError(mensaje) {
    const alerta = document.createElement('div');
    alerta.className = 'alert alert-danger';
    alerta.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${mensaje}`;
    
    const container = document.querySelector('.usuarios-container');
    container.insertBefore(alerta, container.firstChild);
    
    setTimeout(() => alerta.remove(), 5000);
}

function mostrarExito(mensaje) {
    const alerta = document.createElement('div');
    alerta.className = 'alert alert-success';
    alerta.innerHTML = `<i class="fas fa-check-circle"></i> ${mensaje}`;
    
    const container = document.querySelector('.usuarios-container');
    container.insertBefore(alerta, container.firstChild);
    
    setTimeout(() => alerta.remove(), 5000);
}

function mostrarErrorForm(elementId, mensaje) {
    const errorDiv = document.getElementById(elementId);
    if (errorDiv) {
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${mensaje}`;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}
