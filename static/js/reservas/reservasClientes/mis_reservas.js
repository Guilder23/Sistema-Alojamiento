/**
 * MIS RESERVAS - JAVASCRIPT
 * Gestión de reservas del cliente
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
 * Ver detalles de una reserva
 */
function verDetalles(reservaId) {
    // Obtener la fila de la tabla de reserva
    const reservaRow = document.querySelector(`tr[data-reserva-id="${reservaId}"]`);
    
    if (!reservaRow) {
        alert('No se pudo encontrar la información de la reserva');
        return;
    }
    
    // Obtener datos de la fila de tabla
    const cells = reservaRow.querySelectorAll('td');
    const numero = cells[0].textContent.trim(); // #ID
    const estadoBadge = reservaRow.querySelector('.badge');
    const estado = estadoBadge.textContent.trim();
    const habitacion = reservaRow.querySelector('.habitacion-numero').textContent.trim();
    const tipo = reservaRow.querySelector('.habitacion-tipo').textContent.trim();
    const huespedesIcon = cells[3].textContent.trim(); // Huéspedes con icono
    const huespedes = huespedesIcon.replace(/\s+/g, ' ').trim();
    const fechaLines = reservaRow.querySelectorAll('.fecha-line');
    const fechaEntrada = fechaLines[0].textContent.replace(/.*\s/, '').trim(); // Eliminar icono
    const fechaSalida = fechaLines[1].textContent.replace(/.*\s/, '').trim(); // Eliminar icono
    const precio = reservaRow.querySelector('.precio-valor').textContent.trim();
    
    // No hay notas en la tabla, establecer como null
    const notas = null;
    
    // Llenar el modal con los datos
    document.getElementById('modal-reserva-numero').textContent = numero;
    document.getElementById('modal-habitacion-numero').textContent = habitacion;
    document.getElementById('modal-habitacion-tipo').textContent = tipo;
    document.getElementById('modal-huespedes').textContent = huespedes;
    document.getElementById('modal-fecha-entrada').textContent = fechaEntrada;
    document.getElementById('modal-fecha-salida').textContent = fechaSalida;
    document.getElementById('modal-precio-total').textContent = precio;
    
    // Crear badge para el estado
    const estadoSpan = document.getElementById('modal-estado-reserva');
    estadoSpan.innerHTML = `<span class="badge ${estadoBadge.className}">${estado}</span>`;
    
    // Mostrar/ocultar notas
    const notasSection = document.getElementById('modal-notas-section');
    if (notas) {
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
 * Cancelar una reserva (abre modal)
 */
function cancelarReserva(reservaId) {
    // Obtener la fila de la tabla de reserva
    const reservaRow = document.querySelector(`tr[data-reserva-id="${reservaId}"]`);
    
    if (!reservaRow) {
        alert('No se pudo encontrar la información de la reserva');
        return;
    }
    
    // Obtener datos de la fila de tabla
    const cells = reservaRow.querySelectorAll('td');
    const numero = cells[0].textContent.trim(); // #ID
    const habitacion = reservaRow.querySelector('.habitacion-numero').textContent.trim();
    const tipo = reservaRow.querySelector('.habitacion-tipo').textContent.trim();
    const fechaLines = reservaRow.querySelectorAll('.fecha-line');
    const fechaEntrada = fechaLines[0].textContent.replace(/.*\s/, '').trim(); // Eliminar icono
    const fechaSalida = fechaLines[1].textContent.replace(/.*\s/, '').trim(); // Eliminar icono
    const precio = reservaRow.querySelector('.precio-valor').textContent.trim();
    
    // Llenar datos en el modal
    document.getElementById('cancelar-numero').textContent = numero;
    document.getElementById('cancelar-habitacion').textContent = `${habitacion} - ${tipo}`;
    document.getElementById('cancelar-fechas').textContent = `${fechaEntrada} al ${fechaSalida}`;
    document.getElementById('cancelar-total').textContent = precio;
    
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
            
            // Actualizar la interfaz
            const reservaRow = document.querySelector(`tr[data-reserva-id="${reservaId}"]`);
            if (reservaRow) {
                // Actualizar badge de estado
                const badge = reservaRow.querySelector('.badge');
                badge.className = 'badge badge-cancelada';
                badge.textContent = 'CANCELADA';
                
                // Actualizar el data-estado
                reservaRow.setAttribute('data-estado', 'cancelada');
                
                // Remover botones de acción
                const actionsCell = reservaRow.querySelector('.actions-cell');
                if (actionsCell) {
                    actionsCell.innerHTML = `
                        <button class="btn btn-info btn-sm btn-ver-detalles" data-reserva-id="${reservaId}" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                    `;
                }
            }
            
            // Actualizar estadísticas
            actualizarEstadisticas();
        } else {
            alert(`Error: ${data.message}`);
        }
        
    } catch (error) {
        console.error('Error al cancelar reserva:', error);
        alert('Error al cancelar la reserva. Por favor, intenta nuevamente.');
    }
}

/**
 * Calcular estadísticas al cargar la página
 */
function actualizarEstadisticas() {
    const rows = document.querySelectorAll('tr[data-reserva-id]');
    
    let totalReservas = rows.length;
    let confirmadas = 0;
    let activas = 0;
    let canceladas = 0;
    let pendientes = 0;
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    rows.forEach(row => {
        const estado = row.getAttribute('data-estado');
        
        // Contar por estado
        if (estado === 'confirmada') confirmadas++;
        if (estado === 'cancelada') canceladas++;
        if (estado === 'pendiente') pendientes++;
        
        // Verificar si está activa (fecha_entrada <= hoy <= fecha_salida)
        const fechaLines = row.querySelectorAll('.fecha-line');
        if (fechaLines.length >= 2) {
            const fechaEntradaText = fechaLines[0].textContent.replace(/.*\s/, '').trim(); // Eliminar icono
            const fechaSalidaText = fechaLines[1].textContent.replace(/.*\s/, '').trim(); // Eliminar icono
            
            // Parsear fechas DD/MM/YYYY
            const [diaE, mesE, anioE] = fechaEntradaText.split('/');
            const [diaS, mesS, anioS] = fechaSalidaText.split('/');
            
            const fechaEntrada = new Date(anioE, mesE - 1, diaE);
            const fechaSalida = new Date(anioS, mesS - 1, diaS);
            
            if (fechaEntrada <= hoy && hoy <= fechaSalida && (estado === 'confirmada' || estado === 'pendiente')) {
                activas++;
            }
        }
    });
    
    // Actualizar los contadores en la interfaz (ahora son stat-number en lugar de stat-card h3)
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length >= 4) {
        statNumbers[0].textContent = totalReservas; // Total
        statNumbers[1].textContent = confirmadas; // Confirmadas
        statNumbers[2].textContent = activas; // Activas
        statNumbers[3].textContent = canceladas; // Canceladas
    }
}

// Inicializacióntr[data-reserva-id]
document.addEventListener('DOMContentLoaded', function() {
    // Actualizar estadísticas
    if (document.querySelectorAll('.reserva-card').length > 0) {
        actualizarEstadisticas();
    }
    
    console.log('Mis Reservas cargado correctamente');
    
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
