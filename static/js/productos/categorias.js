// Gestion de Categorias - Script principal

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

let categoriasData = [];
let categoriasFiltradas = [];
let paginaActual = 1;
const categoriasPorPagina = 10;

// Inicializacion
document.addEventListener('DOMContentLoaded', function() {
    cargarCategorias();
    configurarFiltros();
    configurarModales();
});

async function cargarCategorias() {
    try {
        const tbody = document.querySelector('#tabla-categorias tbody');
        tbody.innerHTML = '<tr class="loading-row"><td colspan="5"><i class="fas fa-spinner fa-spin"></i> Cargando categorias...</td></tr>';

        const response = await fetch('/productos/api/categorias/lista/');
        if (!response.ok) throw new Error('Error al cargar categorias');
        const data = await response.json();
        categoriasData = data.categorias || [];
        categoriasFiltradas = [...categoriasData];
        renderizarTabla();
        actualizarPaginacion();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar categorias');
    }
}

function renderizarTabla() {
    const tbody = document.querySelector('#tabla-categorias tbody');
    const inicio = (paginaActual - 1) * categoriasPorPagina;
    const fin = inicio + categoriasPorPagina;
    const categoriasPagina = categoriasFiltradas.slice(inicio, fin);

    if (categoriasPagina.length === 0) {
        tbody.innerHTML = '<tr class="loading-row"><td colspan="5">No se encontraron categorias</td></tr>';
        return;
    }

    tbody.innerHTML = categoriasPagina.map(categoria => `
        <tr data-categoria-id="${categoria.id}">
            <td>${categoria.id}</td>
            <td>${categoria.nombre}</td>
            <td>${categoria.descripcion || '-'}</td>
            <td><span class="badge badge-${categoria.activo ? 'activo' : 'inactivo'}">${categoria.activo ? 'Activo' : 'Inactivo'}</span></td>
            <td class="actions-cell">
                <button class="btn btn-warning btn-sm" onclick="abrirModalEditarCategoria(${categoria.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="abrirModalEliminarCategoria(${categoria.id})" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function configurarFiltros() {
    const searchInput = document.getElementById('search-categorias');
    const estadoFilter = document.getElementById('filter-estado');

    searchInput.addEventListener('input', aplicarFiltros);
    estadoFilter.addEventListener('change', aplicarFiltros);
}

function aplicarFiltros() {
    const searchTerm = document.getElementById('search-categorias').value.toLowerCase();
    const estadoFiltro = document.getElementById('filter-estado').value;

    categoriasFiltradas = categoriasData.filter(categoria => {
        const matchSearch = categoria.nombre.toLowerCase().includes(searchTerm);
        const matchEstado = estadoFiltro === '' ||
            (estadoFiltro === 'activo' && categoria.activo) ||
            (estadoFiltro === 'inactivo' && !categoria.activo);
        return matchSearch && matchEstado;
    });

    paginaActual = 1;
    renderizarTabla();
    actualizarPaginacion();
}

function actualizarPaginacion() {
    const totalPaginas = Math.ceil(categoriasFiltradas.length / categoriasPorPagina);
    const pageInfo = document.getElementById('page-info');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');

    pageInfo.textContent = `Pagina ${paginaActual} de ${totalPaginas || 1}`;
    prevBtn.disabled = paginaActual === 1;
    nextBtn.disabled = paginaActual >= totalPaginas;
}

function cambiarPaginaCategorias(direccion) {
    const totalPaginas = Math.ceil(categoriasFiltradas.length / categoriasPorPagina);

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

function abrirModalCrearCategoria() {
    abrirModal('modal-crear-categoria');
}

function abrirModalEditarCategoria(categoriaId) {
    window.editarCategoria(categoriaId);
}

function abrirModalEliminarCategoria(categoriaId) {
    window.eliminarCategoria(categoriaId);
}
