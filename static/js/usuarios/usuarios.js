// Gestión de Usuarios - Script Principal

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

let usuariosData = [];
let usuariosFiltrados = [];
let paginaActual = 1;
const usuariosPorPagina = 10;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    cargarUsuarios();
    configurarFiltros();
    configurarModales();
});

// Cargar usuarios desde el backend
async function cargarUsuarios() {
    try {
        const tbody = document.querySelector('#tabla-usuarios tbody');
        tbody.innerHTML = '<tr class="loading-row"><td colspan="6"><i class="fas fa-spinner fa-spin"></i> Cargando usuarios...</td></tr>';

        const response = await fetch('/usuarios/api/lista/');
        if (!response.ok) throw new Error('Error al cargar usuarios');

        const data = await response.json();
        usuariosData = data.usuarios || [];
        usuariosFiltrados = [...usuariosData];
        
        renderizarTabla();
        actualizarPaginacion();
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al cargar los usuarios');
    }
}

// Renderizar tabla de usuarios
function renderizarTabla() {
    const tbody = document.querySelector('#tabla-usuarios tbody');
    const inicio = (paginaActual - 1) * usuariosPorPagina;
    const fin = inicio + usuariosPorPagina;
    const usuariosPagina = usuariosFiltrados.slice(inicio, fin);

    if (usuariosPagina.length === 0) {
        tbody.innerHTML = '<tr class="loading-row"><td colspan="6">No se encontraron usuarios</td></tr>';
        return;
    }

    tbody.innerHTML = usuariosPagina.map(usuario => `
        <tr data-usuario-id="${usuario.id}">
            <td>${usuario.id}</td>
            <td>${usuario.username}</td>
            <td>${usuario.email}</td>
            <td><span class="badge badge-${usuario.rol}">${formatearRol(usuario.rol)}</span></td>
            <td><span class="badge badge-${usuario.is_active ? 'activo' : 'inactivo'}">${usuario.is_active ? 'Activo' : 'Inactivo'}</span></td>
            <td class="actions-cell">
                <button class="btn btn-info btn-sm" onclick="abrirModalVer(${usuario.id})" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-warning btn-sm" onclick="abrirModalEditar(${usuario.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="abrirModalEliminar(${usuario.id})" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Configurar filtros
function configurarFiltros() {
    const searchInput = document.getElementById('search-usuarios');
    const rolFilter = document.getElementById('filter-rol');
    const estadoFilter = document.getElementById('filter-estado');

    searchInput.addEventListener('input', aplicarFiltros);
    rolFilter.addEventListener('change', aplicarFiltros);
    estadoFilter.addEventListener('change', aplicarFiltros);
}

// Aplicar filtros
function aplicarFiltros() {
    const searchTerm = document.getElementById('search-usuarios').value.toLowerCase();
    const rolFiltro = document.getElementById('filter-rol').value;
    const estadoFiltro = document.getElementById('filter-estado').value;

    usuariosFiltrados = usuariosData.filter(usuario => {
        const matchSearch = usuario.username.toLowerCase().includes(searchTerm) ||
                          usuario.email.toLowerCase().includes(searchTerm);
        const matchRol = rolFiltro === '' || usuario.rol === rolFiltro;
        const matchEstado = estadoFiltro === '' || 
                          (estadoFiltro === 'activo' && usuario.is_active) ||
                          (estadoFiltro === 'inactivo' && !usuario.is_active);

        return matchSearch && matchRol && matchEstado;
    });

    paginaActual = 1;
    renderizarTabla();
    actualizarPaginacion();
}

// Paginación
function actualizarPaginacion() {
    const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);
    const pageInfo = document.getElementById('page-info');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');

    pageInfo.textContent = `Página ${paginaActual} de ${totalPaginas || 1}`;
    prevBtn.disabled = paginaActual === 1;
    nextBtn.disabled = paginaActual >= totalPaginas;
}

function cambiarPagina(direccion) {
    const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);
    
    if (direccion === 'prev' && paginaActual > 1) {
        paginaActual--;
    } else if (direccion === 'next' && paginaActual < totalPaginas) {
        paginaActual++;
    }

    renderizarTabla();
    actualizarPaginacion();
}

// Configurar modales
function configurarModales() {
    // Cerrar modales con tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            cerrarTodosModales();
        }
    });

    // Cerrar modal al hacer click fuera
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                cerrarModal(overlay.nextElementSibling.id);
            }
        });
    });
}

// Funciones de modal
function abrirModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        const overlay = modal.previousElementSibling;
        if (overlay && overlay.classList.contains('modal-overlay')) {
            overlay.classList.add('active');
        }
        modal.style.display = 'block';
        document.body.classList.add('modal-open');
    }
}

function cerrarModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        const overlay = modal.previousElementSibling;
        if (overlay && overlay.classList.contains('modal-overlay')) {
            overlay.classList.remove('active');
        }
        modal.style.display = 'none';
        const algunModalAbierto = Array.from(document.querySelectorAll('.modal-content'))
            .some(m => m.style.display === 'block');
        if (!algunModalAbierto) {
            document.body.classList.remove('modal-open');
        }
    }
}

function cerrarTodosModales() {
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.classList.remove('active');
    });
    document.querySelectorAll('.modal-content').forEach(modal => {
        modal.style.display = 'none';
    });
    document.body.classList.remove('modal-open');
}

// Funciones para abrir modales específicos
function abrirModalCrear() {
    abrirModal('modal-crear-usuario');
}

function abrirModalVer(usuarioId) {
    window.verUsuario(usuarioId);
}

function abrirModalEditar(usuarioId) {
    window.editarUsuario(usuarioId);
}

function abrirModalEliminar(usuarioId) {
    window.eliminarUsuario(usuarioId);
}

// Utilidades
function formatearRol(rol) {
    const roles = {
        'administrador': 'Administrador',
        'recepcionista': 'Recepcionista',
        'gerente': 'Gerente',
        'empleado_limpieza': 'Empleado Limpieza',
        'cliente': 'Cliente'
    };
    return roles[rol] || rol;
}

function mostrarError(mensaje) {
    alert(mensaje);
}

function mostrarExito(mensaje) {
    alert(mensaje);
}
