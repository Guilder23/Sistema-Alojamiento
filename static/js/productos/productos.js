// Gestion de Productos - Script principal

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

let productosData = [];
let productosFiltrados = [];
let categoriasData = [];
let paginaActual = 1;
const productosPorPagina = 10;

// Inicializacion
document.addEventListener('DOMContentLoaded', function() {
    cargarCategorias();
    cargarProductos();
    configurarFiltros();
    configurarModales();
});

async function cargarCategorias() {
    try {
        const response = await fetch('/productos/api/categorias/lista/');
        if (!response.ok) throw new Error('Error al cargar categorias');
        const data = await response.json();
        categoriasData = data.categorias || [];
        renderizarSelectsCategorias();
    } catch (error) {
        console.error('Error:', error);
    }
}

function renderizarSelectsCategorias() {
    const filter = document.getElementById('filter-categoria');
    const crear = document.getElementById('crear-categoria');
    const editar = document.getElementById('editar-categoria');

    const opciones = categoriasData
        .filter(cat => cat.activo)
        .map(cat => `<option value="${cat.id}">${cat.nombre}</option>`)
        .join('');

    if (filter) {
        filter.innerHTML = '<option value="">Filtrar por Categoria</option>' + opciones;
    }
    if (crear) {
        crear.innerHTML = '<option value="">Seleccionar categoria</option>' + opciones;
    }
    if (editar) {
        editar.innerHTML = '<option value="">Seleccionar categoria</option>' + opciones;
    }
}

async function cargarProductos() {
    try {
        const tbody = document.querySelector('#tabla-productos tbody');
        tbody.innerHTML = '<tr class="loading-row"><td colspan="8"><i class="fas fa-spinner fa-spin"></i> Cargando productos...</td></tr>';

        const response = await fetch('/productos/api/productos/lista/');
        if (!response.ok) throw new Error('Error al cargar productos');
        const data = await response.json();
        productosData = data.productos || [];
        productosFiltrados = [...productosData];
        renderizarTabla();
        actualizarPaginacion();
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al cargar productos');
    }
}

function renderizarTabla() {
    const tbody = document.querySelector('#tabla-productos tbody');
    const inicio = (paginaActual - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    const productosPagina = productosFiltrados.slice(inicio, fin);

    if (productosPagina.length === 0) {
        tbody.innerHTML = '<tr class="loading-row"><td colspan="8">No se encontraron productos</td></tr>';
        return;
    }

    tbody.innerHTML = productosPagina.map(producto => `
        <tr data-producto-id="${producto.id}">
            <td>${producto.id}</td>
            <td>${producto.nombre}</td>
            <td>${producto.categoria_nombre}</td>
            <td>${producto.tipo}</td>
            <td>$${producto.precio_venta}</td>
            <td>${renderStockCell(producto)}</td>
            <td><span class="badge badge-${producto.activo ? 'activo' : 'inactivo'}">${producto.activo ? 'Activo' : 'Inactivo'}</span></td>
            <td class="actions-cell">
                <button class="btn btn-info btn-sm" onclick="abrirModalVerProducto(${producto.id})" title="Ver">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-warning btn-sm" onclick="abrirModalEditarProducto(${producto.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="abrirModalEliminarProducto(${producto.id})" title="Desactivar">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function renderStockCell(producto) {
    if (!producto || !producto.maneja_stock) {
        return '-';
    }

    const stockActual = Number(producto.stock_actual ?? 0);
    const stockMinimo = Number(producto.stock_minimo ?? 0);

    let clase = 'badge-stock-ok';
    let titulo = 'Stock OK';

    if (stockMinimo > 0) {
        if (stockActual <= stockMinimo) {
            clase = 'badge-stock-danger';
            titulo = 'Stock bajo (critico)';
        } else if (stockActual <= stockMinimo * 2) {
            clase = 'badge-stock-warning';
            titulo = 'Stock bajo (alerta)';
        }
    } else {
        // Si no hay minimo configurado, marcar rojo solo si es 0.
        if (stockActual <= 0) {
            clase = 'badge-stock-danger';
            titulo = 'Sin stock';
        }
    }

    return `<span class="badge ${clase}" title="${titulo}">${stockActual}</span>`;
}

function configurarFiltros() {
    const searchInput = document.getElementById('search-productos');
    const categoriaFilter = document.getElementById('filter-categoria');
    const tipoFilter = document.getElementById('filter-tipo');
    const estadoFilter = document.getElementById('filter-estado');

    searchInput.addEventListener('input', aplicarFiltros);
    categoriaFilter.addEventListener('change', aplicarFiltros);
    tipoFilter.addEventListener('change', aplicarFiltros);
    estadoFilter.addEventListener('change', aplicarFiltros);
}

function aplicarFiltros() {
    const searchTerm = document.getElementById('search-productos').value.toLowerCase();
    const categoriaFiltro = document.getElementById('filter-categoria').value;
    const tipoFiltro = document.getElementById('filter-tipo').value;
    const estadoFiltro = document.getElementById('filter-estado').value;

    productosFiltrados = productosData.filter(producto => {
        const matchSearch = producto.nombre.toLowerCase().includes(searchTerm) ||
            (producto.codigo_sku || '').toLowerCase().includes(searchTerm);
        const matchCategoria = categoriaFiltro === '' || String(producto.categoria_id) === categoriaFiltro;
        const matchTipo = tipoFiltro === '' || producto.tipo === tipoFiltro;
        const matchEstado = estadoFiltro === '' ||
            (estadoFiltro === 'activo' && producto.activo) ||
            (estadoFiltro === 'inactivo' && !producto.activo);

        return matchSearch && matchCategoria && matchTipo && matchEstado;
    });

    paginaActual = 1;
    renderizarTabla();
    actualizarPaginacion();
}

function actualizarPaginacion() {
    const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
    const pageInfo = document.getElementById('page-info');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');

    pageInfo.textContent = `Pagina ${paginaActual} de ${totalPaginas || 1}`;
    prevBtn.disabled = paginaActual === 1;
    nextBtn.disabled = paginaActual >= totalPaginas;
}

function cambiarPaginaProductos(direccion) {
    const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);

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

function abrirModalCrearProducto() {
    abrirModal('modal-crear-producto');
}

function abrirModalVerProducto(productoId) {
    window.verProducto(productoId);
}

function abrirModalEditarProducto(productoId) {
    window.editarProducto(productoId);
}

function abrirModalEliminarProducto(productoId) {
    window.eliminarProducto(productoId);
}

function mostrarError(mensaje) {
    alert(mensaje);
}

function mostrarExito(mensaje) {
    alert(mensaje);
}
