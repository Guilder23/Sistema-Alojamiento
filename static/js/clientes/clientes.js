// Gestion de Clientes - Script Principal

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

let clientesData = [];
let clientesFiltrados = [];
let paginaActualClientes = 1;
const clientesPorPagina = 10;

// Inicializacion
document.addEventListener('DOMContentLoaded', function() {
    cargarClientes();
    configurarFiltrosClientes();
    configurarModalesClientes();
});

async function cargarClientes() {
    try {
        const tbody = document.querySelector('#tabla-clientes tbody');
        tbody.innerHTML = '<tr class="loading-row"><td colspan="8"><i class="fas fa-spinner fa-spin"></i> Cargando clientes...</td></tr>';

        const response = await fetch('/clientes/api/lista/');
        if (!response.ok) throw new Error('Error al cargar clientes');

        const data = await response.json();
        clientesData = data.clientes || [];
        clientesFiltrados = [...clientesData];

        renderizarTablaClientes();
        actualizarPaginacionClientes();
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al cargar los clientes');
    }
}

function renderizarTablaClientes() {
    const tbody = document.querySelector('#tabla-clientes tbody');
    const inicio = (paginaActualClientes - 1) * clientesPorPagina;
    const fin = inicio + clientesPorPagina;
    const clientesPagina = clientesFiltrados.slice(inicio, fin);

    if (clientesPagina.length === 0) {
        tbody.innerHTML = '<tr class="loading-row"><td colspan="8">No se encontraron clientes</td></tr>';
        return;
    }

    tbody.innerHTML = clientesPagina.map(cliente => `
        <tr data-cliente-id="${cliente.id}">
            <td>${cliente.id}</td>
            <td>${cliente.nombre_completo || `${cliente.nombre} ${cliente.apellido}`}</td>
            <td>${cliente.tipo_documento_label} ${cliente.numero_documento}</td>
            <td>${cliente.telefono}</td>
            <td>${cliente.email}</td>
            <td>${cliente.pais_label}</td>
            <td><span class="badge badge-${cliente.activo ? 'activo' : 'inactivo'}">${cliente.activo ? 'Activo' : 'Inactivo'}</span></td>
            <td class="actions-cell">
                <button class="btn btn-info btn-sm" onclick="abrirModalVerCliente(${cliente.id})" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-warning btn-sm" onclick="abrirModalEditarCliente(${cliente.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="abrirModalEliminarCliente(${cliente.id})" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function configurarFiltrosClientes() {
    const searchInput = document.getElementById('search-clientes');
    const paisFilter = document.getElementById('filter-pais');
    const estadoFilter = document.getElementById('filter-estado');

    searchInput.addEventListener('input', aplicarFiltrosClientes);
    paisFilter.addEventListener('change', aplicarFiltrosClientes);
    estadoFilter.addEventListener('change', aplicarFiltrosClientes);
}

function aplicarFiltrosClientes() {
    const searchTerm = document.getElementById('search-clientes').value.toLowerCase();
    const paisFiltro = document.getElementById('filter-pais').value;
    const estadoFiltro = document.getElementById('filter-estado').value;

    clientesFiltrados = clientesData.filter(cliente => {
        const matchSearch = (
            `${cliente.nombre} ${cliente.apellido}`.toLowerCase().includes(searchTerm) ||
            (cliente.email || '').toLowerCase().includes(searchTerm) ||
            (cliente.numero_documento || '').toLowerCase().includes(searchTerm) ||
            (cliente.telefono || '').toLowerCase().includes(searchTerm)
        );
        const matchPais = paisFiltro === '' || cliente.pais === paisFiltro;
        const matchEstado = estadoFiltro === '' ||
            (estadoFiltro === 'activo' && cliente.activo) ||
            (estadoFiltro === 'inactivo' && !cliente.activo);

        return matchSearch && matchPais && matchEstado;
    });

    paginaActualClientes = 1;
    renderizarTablaClientes();
    actualizarPaginacionClientes();
}

function actualizarPaginacionClientes() {
    const totalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina);
    const pageInfo = document.getElementById('page-info');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');

    pageInfo.textContent = `Pagina ${paginaActualClientes} de ${totalPaginas || 1}`;
    prevBtn.disabled = paginaActualClientes === 1;
    nextBtn.disabled = paginaActualClientes >= totalPaginas;
}

function cambiarPaginaClientes(direccion) {
    const totalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina);

    if (direccion === 'prev' && paginaActualClientes > 1) {
        paginaActualClientes--;
    } else if (direccion === 'next' && paginaActualClientes < totalPaginas) {
        paginaActualClientes++;
    }

    renderizarTablaClientes();
    actualizarPaginacionClientes();
}

function configurarModalesClientes() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            cerrarTodosModales();
        }
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                cerrarModal(overlay.nextElementSibling.id);
            }
        });
    });
}

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

function abrirModalCrearCliente() {
    abrirModal('modal-crear-cliente');
}

function abrirModalVerCliente(clienteId) {
    window.verCliente(clienteId);
}

function abrirModalEditarCliente(clienteId) {
    window.editarCliente(clienteId);
}

function abrirModalEliminarCliente(clienteId) {
    window.eliminarCliente(clienteId);
}

function mostrarError(mensaje) {
    alert(mensaje);
}

function mostrarExito(mensaje) {
    alert(mensaje);
}
