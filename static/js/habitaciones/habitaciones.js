// Gestión de Habitaciones - Script Principal

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

let habitacionesData = [];
let habitacionesFiltradas = [];
let paginaActualHabitaciones = 1;
const habitacionesPorPagina = 10;

document.addEventListener('DOMContentLoaded', function() {
    cargarHabitaciones();
    configurarFiltrosHabitaciones();
    configurarModalesHabitaciones();
});

async function cargarHabitaciones() {
    try {
        const tbody = document.querySelector('#tabla-habitaciones tbody');
        tbody.innerHTML = '<tr class="loading-row"><td colspan="7"><i class="fas fa-spinner fa-spin"></i> Cargando habitaciones...</td></tr>';

        const response = await fetch('/habitaciones/api/lista/');
        if (!response.ok) throw new Error('Error al cargar habitaciones');

        const data = await response.json();
        habitacionesData = data.habitaciones || [];
        habitacionesFiltradas = [...habitacionesData];

        renderizarTablaHabitaciones();
        actualizarPaginacionHabitaciones();
    } catch (e) {
        console.error(e);
        alert('Error al cargar las habitaciones');
    }
}

function renderizarTablaHabitaciones() {
    const tbody = document.querySelector('#tabla-habitaciones tbody');
    const inicio = (paginaActualHabitaciones - 1) * habitacionesPorPagina;
    const fin = inicio + habitacionesPorPagina;
    const habitacionesPagina = habitacionesFiltradas.slice(inicio, fin);

    if (habitacionesPagina.length === 0) {
        tbody.innerHTML = '<tr class="loading-row"><td colspan="7">No se encontraron habitaciones</td></tr>';
        return;
    }

    tbody.innerHTML = habitacionesPagina.map(h => `
        <tr data-habitacion-id="${h.id}">
            <td>${h.numero}</td>
            <td><span class="badge badge-${h.tipo}">${formatearTipoHabitacion(h.tipo)}</span></td>
            <td>${h.capacidad}</td>
            <td>$${parseFloat(h.precio_noche).toFixed(2)}</td>
            <td><span class="badge badge-${h.estado}">${formatearEstadoHabitacion(h.estado)}</span></td>
            <td>${h.piso}</td>
            <td class="actions-cell">
                <button class="btn btn-info btn-sm" onclick="abrirModalVerHabitacion(${h.id})" title="Ver">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-warning btn-sm" onclick="abrirModalEditarHabitacion(${h.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="abrirModalEliminarHabitacion(${h.id})" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function configurarFiltrosHabitaciones() {
    const searchInput = document.getElementById('search-habitaciones');
    const tipoFilter = document.getElementById('filter-tipo');
    const banoFilter = document.getElementById('filter-bano');
    const estadoFilter = document.getElementById('filter-estado');
    const pisoFilter = document.getElementById('filter-piso');

    searchInput?.addEventListener('input', aplicarFiltrosHabitaciones);
    tipoFilter?.addEventListener('change', aplicarFiltrosHabitaciones);
    banoFilter?.addEventListener('change', aplicarFiltrosHabitaciones);
    estadoFilter?.addEventListener('change', aplicarFiltrosHabitaciones);
    pisoFilter?.addEventListener('change', aplicarFiltrosHabitaciones);
}

function aplicarFiltrosHabitaciones() {
    const searchTerm = (document.getElementById('search-habitaciones')?.value || '').toLowerCase();
    const tipoFiltro = document.getElementById('filter-tipo')?.value || '';
    const banoFiltro = document.getElementById('filter-bano')?.value || '';
    const estadoFiltro = document.getElementById('filter-estado')?.value || '';
    const pisoFiltro = document.getElementById('filter-piso')?.value || '';

    habitacionesFiltradas = habitacionesData.filter(h => {
        const matchSearch = (h.numero || '').toLowerCase().includes(searchTerm) || (h.descripcion || '').toLowerCase().includes(searchTerm);
        const matchTipo = tipoFiltro === '' || h.tipo === tipoFiltro;
        const matchBano = banoFiltro === '' || h.tipo_bano === banoFiltro;
        const matchEstado = estadoFiltro === '' || h.estado === estadoFiltro;
        const matchPiso = pisoFiltro === '' || String(h.piso) === String(pisoFiltro);
        return matchSearch && matchTipo && matchBano && matchEstado && matchPiso;
    });

    paginaActualHabitaciones = 1;
    renderizarTablaHabitaciones();
    actualizarPaginacionHabitaciones();
}

function actualizarPaginacionHabitaciones() {
    const totalPaginas = Math.ceil(habitacionesFiltradas.length / habitacionesPorPagina);
    const pageInfo = document.getElementById('page-info');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');

    if (pageInfo) pageInfo.textContent = `Página ${paginaActualHabitaciones} de ${totalPaginas || 1}`;
    if (prevBtn) prevBtn.disabled = paginaActualHabitaciones === 1;
    if (nextBtn) nextBtn.disabled = paginaActualHabitaciones >= totalPaginas;
}

function cambiarPaginaHabitaciones(direccion) {
    const totalPaginas = Math.ceil(habitacionesFiltradas.length / habitacionesPorPagina);
    if (direccion === 'prev' && paginaActualHabitaciones > 1) paginaActualHabitaciones--;
    if (direccion === 'next' && paginaActualHabitaciones < totalPaginas) paginaActualHabitaciones++;
    renderizarTablaHabitaciones();
    actualizarPaginacionHabitaciones();
}

function configurarModalesHabitaciones() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') cerrarTodosModalesHabitaciones();
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                const modal = overlay.nextElementSibling;
                if (modal && modal.classList.contains('modal-content')) {
                    cerrarModalHabitaciones(modal.id);
                }
            }
        });
    });
}

function abrirModalHabitaciones(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    const overlay = modal.previousElementSibling;
    if (overlay && overlay.classList.contains('modal-overlay')) overlay.classList.add('active');
    modal.style.display = 'block';
    document.body.classList.add('modal-open');
}

function cerrarModalHabitaciones(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    const overlay = modal.previousElementSibling;
    if (overlay && overlay.classList.contains('modal-overlay')) overlay.classList.remove('active');
    modal.style.display = 'none';

    const algunModalAbierto = Array.from(document.querySelectorAll('.modal-content')).some(m => m.style.display === 'block');
    if (!algunModalAbierto) document.body.classList.remove('modal-open');
}

function cerrarTodosModalesHabitaciones() {
    document.querySelectorAll('.modal-overlay').forEach(o => o.classList.remove('active'));
    document.querySelectorAll('.modal-content').forEach(m => m.style.display = 'none');
    document.body.classList.remove('modal-open');
}

function abrirModalCrearHabitacion() {
    abrirModalHabitaciones('modal-crear-habitacion');
}

function abrirModalVerHabitacion(habitacionId) {
    window.verHabitacion(habitacionId);
}

function abrirModalEditarHabitacion(habitacionId) {
    window.editarHabitacion(habitacionId);
}

function abrirModalEliminarHabitacion(habitacionId) {
    window.eliminarHabitacion(habitacionId);
}

function formatearTipoHabitacion(tipo) {
    const tipos = {
        simple: 'Simple',
        doble: 'Doble',
        suite: 'Suite',
        deluxe: 'Deluxe',
        presidencial: 'Presidencial'
    };
    return tipos[tipo] || tipo;
}

function formatearEstadoHabitacion(estado) {
    const estados = {
        disponible: 'Disponible',
        ocupada: 'Ocupada',
        limpieza: 'Limpieza',
        fuera_servicio: 'Fuera de servicio'
    };
    return estados[estado] || estado;
}
