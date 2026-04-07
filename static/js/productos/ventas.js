// Gestion de Ventas - Script principal

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

let ventasData = [];
let ventasFiltradas = [];
let productosVentaData = [];
let clientesVentaData = [];
let productosVentaPromise = null;
let clientesVentaPromise = null;
let paginaActual = 1;
const ventasPorPagina = 10;

// Inicializacion
document.addEventListener('DOMContentLoaded', function() {
    cargarVentas();
    cargarProductosVenta();
    cargarClientesVenta();
    configurarFiltros();
    configurarModales();
});

async function cargarVentas() {
    try {
        const tbody = document.querySelector('#tabla-ventas tbody');
        tbody.innerHTML = '<tr class="loading-row"><td colspan="7"><i class="fas fa-spinner fa-spin"></i> Cargando ventas...</td></tr>';

        const response = await fetch('/productos/api/ventas/lista/');
        if (!response.ok) throw new Error('Error al cargar ventas');
        const data = await response.json();
        ventasData = data.ventas || [];
        ventasFiltradas = [...ventasData];
        renderizarTabla();
        actualizarPaginacion();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar ventas');
    }
}

async function cargarProductosVenta() {
    if (productosVentaPromise) return productosVentaPromise;

    productosVentaPromise = (async () => {
        try {
            const response = await fetch('/productos/api/productos/lista/');
            if (!response.ok) throw new Error('Error al cargar productos');
            const data = await response.json();
            productosVentaData = data.productos || [];
            window.productosVentaData = productosVentaData;
            return productosVentaData;
        } catch (error) {
            console.error('Error:', error);
            productosVentaData = [];
            window.productosVentaData = productosVentaData;
            return productosVentaData;
        }
    })();

    return productosVentaPromise;
}

async function cargarClientesVenta() {
    if (clientesVentaPromise) return clientesVentaPromise;

    clientesVentaPromise = (async () => {
        try {
            const response = await fetch('/clientes/api/lista/');
            if (!response.ok) throw new Error('Error al cargar clientes');
            const data = await response.json();
            clientesVentaData = data.clientes || [];
            window.clientesVentaData = clientesVentaData;

            // Si el modal ya esta abierto, refrescar el select.
            if (typeof cargarClientesSelect === 'function') {
                cargarClientesSelect();
            }

            return clientesVentaData;
        } catch (error) {
            console.error('Error:', error);
            clientesVentaData = [];
            window.clientesVentaData = clientesVentaData;
            return clientesVentaData;
        }
    })();

    return clientesVentaPromise;
}

function renderizarTabla() {
    const tbody = document.querySelector('#tabla-ventas tbody');
    const inicio = (paginaActual - 1) * ventasPorPagina;
    const fin = inicio + ventasPorPagina;
    const ventasPagina = ventasFiltradas.slice(inicio, fin);

    if (ventasPagina.length === 0) {
        tbody.innerHTML = '<tr class="loading-row"><td colspan="7">No se encontraron ventas</td></tr>';
        return;
    }

    tbody.innerHTML = ventasPagina.map(venta => `
        <tr data-venta-id="${venta.id}">
            <td>${venta.id}</td>
            <td>${venta.cliente}</td>
            <td>$${venta.total}</td>
            <td>${venta.metodo_pago}</td>
            <td><span class="badge-estado badge-${venta.estado}">${venta.estado}</span></td>
            <td>${formatearFecha(venta.creado)}</td>
            <td class="actions-cell">
                <button class="btn btn-info btn-sm" onclick="abrirModalVerVenta(${venta.id})" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="abrirModalCancelarVenta(${venta.id})" title="Cancelar">
                    <i class="fas fa-ban"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function configurarFiltros() {
    const searchInput = document.getElementById('search-ventas');
    const estadoFilter = document.getElementById('filter-estado');

    searchInput.addEventListener('input', aplicarFiltros);
    estadoFilter.addEventListener('change', aplicarFiltros);
}

function aplicarFiltros() {
    const searchTerm = document.getElementById('search-ventas').value.toLowerCase();
    const estadoFiltro = document.getElementById('filter-estado').value;

    ventasFiltradas = ventasData.filter(venta => {
        const matchSearch = String(venta.id).includes(searchTerm) || venta.cliente.toLowerCase().includes(searchTerm);
        const matchEstado = estadoFiltro === '' || venta.estado === estadoFiltro;
        return matchSearch && matchEstado;
    });

    paginaActual = 1;
    renderizarTabla();
    actualizarPaginacion();
}

function actualizarPaginacion() {
    const totalPaginas = Math.ceil(ventasFiltradas.length / ventasPorPagina);
    const pageInfo = document.getElementById('page-info');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');

    pageInfo.textContent = `Pagina ${paginaActual} de ${totalPaginas || 1}`;
    prevBtn.disabled = paginaActual === 1;
    nextBtn.disabled = paginaActual >= totalPaginas;
}

function cambiarPaginaVentas(direccion) {
    const totalPaginas = Math.ceil(ventasFiltradas.length / ventasPorPagina);

    if (direccion === 'prev' && paginaActual > 1) {
        paginaActual--;
    } else if (direccion === 'next' && paginaActual < totalPaginas) {
        paginaActual++;
    }

    renderizarTabla();
    actualizarPaginacion();
}

function configurarModales() {
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

function formatearFecha(fechaStr) {
    if (!fechaStr) return '-';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

async function abrirModalCrearVenta() {
    // Asegura que clientes y productos existan antes de abrir el modal.
    await Promise.all([
        cargarClientesVenta(),
        cargarProductosVenta(),
    ]);

    window.crearVentaModal();
}

function abrirModalVerVenta(ventaId) {
    window.verVenta(ventaId);
}

function abrirModalCancelarVenta(ventaId) {
    window.cancelarVenta(ventaId);
}

window.ventasData = ventasData;
