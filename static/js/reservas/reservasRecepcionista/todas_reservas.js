/**
 * TODAS RESERVAS - JAVASCRIPT RECEPCIONISTA
 * Gestión de todas las reservas del sistema
 */

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

/**
 * Aplicar filtros a la tabla
 */
function aplicarFiltros() {
    const estadoFiltro = document.getElementById('filtro-estado').value.toLowerCase();
    const habitacionFiltro = document.getElementById('filtro-habitacion').value.toLowerCase();
    const clienteFiltro = document.getElementById('filtro-cliente').value.toLowerCase();
    
    const filas = document.querySelectorAll('#tabla-reservas tr[data-reserva-id]');
    let visibles = 0;
    
    filas.forEach(fila => {
        const estado = fila.getAttribute('data-estado');
        const habitacion = fila.getAttribute('data-habitacion').toLowerCase();
        const cliente = fila.getAttribute('data-cliente').toLowerCase();
        
        let mostrar = true;
        
        // Filtrar por estado
        if (estadoFiltro && estado !== estadoFiltro) {
            mostrar = false;
        }
        
        // Filtrar por habitación
        if (habitacionFiltro && !habitacion.includes(habitacionFiltro)) {
            mostrar = false;
        }
        
        // Filtrar por cliente
        if (clienteFiltro && !cliente.includes(clienteFiltro)) {
            mostrar = false;
        }
        
        fila.style.display = mostrar ? '' : 'none';
        if (mostrar) visibles++;
    });
    
    console.log(`Filtros aplicados: ${visibles} reservas visibles`);
}

/**
 * Limpiar filtros
 */
function limpiarFiltros() {
    document.getElementById('filtro-estado').value = '';
    document.getElementById('filtro-habitacion').value = '';
    document.getElementById('filtro-cliente').value = '';
    
    const filas = document.querySelectorAll('#tabla-reservas tr[data-reserva-id]');
    filas.forEach(fila => {
        fila.style.display = '';
    });
    
    console.log('Filtros limpiados');
}

/**
 * Ver detalles de una reserva
 */
function verDetalles(reservaId) {
    const fila = document.querySelector(`tr[data-reserva-id="${reservaId}"]`);
    
    if (!fila) {
        alert('No se pudo encontrar la información de la reserva');
        return;
    }
    
    // Obtener datos de la fila
    const cliente = fila.querySelector('.cliente-info strong').textContent.trim();
    const email = fila.querySelector('.cliente-info small').textContent.trim();
    const habitacion = fila.querySelector('.habitacion-info strong').textContent.trim();
    const tipo = fila.querySelector('.habitacion-info small').textContent.trim();
    const fechaEntrada = fila.cells[3].textContent.trim();
    const fechaSalida = fila.cells[4].textContent.trim();
    const huespedes = fila.cells[5].textContent.trim();
    const total = fila.cells[6].textContent.trim();
    const estadoBadge = fila.querySelector('.badge');
    const estado = estadoBadge.textContent.trim();
    const notas = fila.getAttribute('data-notas') || '';
    
    // Llenar el modal con los datos
    document.getElementById('modal-reserva-numero').textContent = `#${reservaId}`;
    document.getElementById('modal-cliente-nombre').textContent = cliente;
    document.getElementById('modal-cliente-email').textContent = email;
    document.getElementById('modal-habitacion-numero').textContent = habitacion;
    document.getElementById('modal-habitacion-tipo').textContent = tipo;
    document.getElementById('modal-fecha-entrada').textContent = fechaEntrada;
    document.getElementById('modal-fecha-salida').textContent = fechaSalida;
    document.getElementById('modal-huespedes').textContent = huespedes;
    document.getElementById('modal-precio-total').textContent = total;
    
    // Crear badge para el estado
    const estadoSpan = document.getElementById('modal-estado-reserva');
    estadoSpan.innerHTML = `<span class="badge ${estadoBadge.className}">${estado}</span>`;
    
    // Mostrar/ocultar notas
    const notasSection = document.getElementById('modal-notas-section');
    if (notas && notas.trim() !== '') {
        document.getElementById('modal-notas-contenido').textContent = notas;
        notasSection.style.display = 'block';
    } else {
        notasSection.style.display = 'none';
    }
    
    // Mostrar el modal
    const modal = new bootstrap.Modal(document.getElementById('modalDetalles'));
    modal.show();
}

/**
 * Confirmar una reserva (abre modal)
 */
function confirmarReserva(reservaId) {
    const fila = document.querySelector(`tr[data-reserva-id="${reservaId}"]`);
    
    if (!fila) {
        alert('No se pudo encontrar la información de la reserva');
        return;
    }
    
    // Obtener datos de la fila
    const cliente = fila.querySelector('.cliente-info strong').textContent.trim();
    const habitacion = fila.querySelector('.habitacion-info strong').textContent.trim();
    const tipo = fila.querySelector('.habitacion-info small').textContent.trim();
    const fechaEntrada = fila.cells[3].textContent.trim();
    const fechaSalida = fila.cells[4].textContent.trim();
    const total = fila.cells[6].textContent.trim();
    
    // Llenar datos en el modal
    document.getElementById('confirmar-habitacion').textContent = `${habitacion} - ${tipo}`;
    document.getElementById('confirmar-cliente').textContent = cliente;
    document.getElementById('confirmar-fechas').textContent = `${fechaEntrada} al ${fechaSalida}`;
    document.getElementById('confirmar-total').textContent = total;
    
    // Configurar el botón de confirmación
    const btnConfirmar = document.getElementById('btn-confirmar-final');
    btnConfirmar.onclick = async function() {
        await ejecutarConfirmacion(reservaId);
    };
    
    // Mostrar el modal
    const modal = new bootstrap.Modal(document.getElementById('modalConfirmar'));
    modal.show();
}

/**
 * Ejecutar la confirmación de reserva
 */
async function ejecutarConfirmacion(reservaId) {
    try {
        const response = await fetch(`/reservas/api/confirmar/${reservaId}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken,
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalConfirmar'));
            modal.hide();
            
            // Mostrar mensaje
            alert(data.message);
            
            // Recargar página
            location.reload();
        } else {
            alert(`Error: ${data.message}`);
        }
        
    } catch (error) {
        console.error('Error al confirmar reserva:', error);
        alert('Error al confirmar la reserva. Endpoint no implementado aún.');
    }
}

/**
 * Cancelar una reserva (abre modal)
 */
function cancelarReserva(reservaId) {
    const fila = document.querySelector(`tr[data-reserva-id="${reservaId}"]`);
    
    if (!fila) {
        alert('No se pudo encontrar la información de la reserva');
        return;
    }
    
    // Obtener datos de la fila
    const cliente = fila.querySelector('.cliente-info strong').textContent.trim();
    const habitacion = fila.querySelector('.habitacion-info strong').textContent.trim();
    const tipo = fila.querySelector('.habitacion-info small').textContent.trim();
    const fechaEntrada = fila.cells[3].textContent.trim();
    const fechaSalida = fila.cells[4].textContent.trim();
    const total = fila.cells[6].textContent.trim();
    
    // Llenar datos en el modal
    document.getElementById('cancelar-habitacion').textContent = `${habitacion} - ${tipo}`;
    document.getElementById('cancelar-cliente').textContent = cliente;
    document.getElementById('cancelar-fechas').textContent = `${fechaEntrada} al ${fechaSalida}`;
    document.getElementById('cancelar-total').textContent = total;
    
    // Configurar el botón de cancelación
    const btnCancelar = document.getElementById('btn-cancelar-final');
    btnCancelar.onclick = async function() {
        await ejecutarCancelacion(reservaId);
    };
    
    // Mostrar el modal
    const modal = new bootstrap.Modal(document.getElementById('modalCancelar'));
    modal.show();
}

/**
 * Ejecutar la cancelación de reserva
 */
async function ejecutarCancelacion(reservaId) {
    try {
        const response = await fetch(`/reservas/api/cancelar/${reservaId}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken,
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalCancelar'));
            modal.hide();
            
            // Mostrar mensaje
            alert(data.message);
            
            // Recargar página
            location.reload();
        } else {
            alert(`Error: ${data.message}`);
        }
        
    } catch (error) {
        console.error('Error al cancelar reserva:', error);
        alert('Error al cancelar la reserva. Por favor, intenta nuevamente.');
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('Gestión de reservas cargada correctamente');
    
    // Event listeners para filtros en tiempo real
    document.getElementById('filtro-estado')?.addEventListener('change', aplicarFiltros);
    document.getElementById('filtro-habitacion')?.addEventListener('input', aplicarFiltros);
    document.getElementById('filtro-cliente')?.addEventListener('input', aplicarFiltros);
    
    // Delegación de eventos para botones de acción
    document.addEventListener('click', function(e) {
        // Botón Ver Detalles
        if (e.target.closest('.btn-ver-detalles')) {
            const btn = e.target.closest('.btn-ver-detalles');
            const reservaId = btn.getAttribute('data-reserva-id');
            if (reservaId) {
                verDetalles(parseInt(reservaId));
            }
        }
        
        // Botón Confirmar Reserva
        if (e.target.closest('.btn-confirmar-reserva')) {
            const btn = e.target.closest('.btn-confirmar-reserva');
            const reservaId = btn.getAttribute('data-reserva-id');
            if (reservaId) {
                confirmarReserva(parseInt(reservaId));
            }
        }
        
        // Botón Cancelar Reserva
        if (e.target.closest('.btn-cancelar-reserva')) {
            const btn = e.target.closest('.btn-cancelar-reserva');
            const reservaId = btn.getAttribute('data-reserva-id');
            if (reservaId) {
                cancelarReserva(parseInt(reservaId));
            }
        }
    });
});
