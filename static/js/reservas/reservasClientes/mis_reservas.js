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
    // Obtener la tarjeta de reserva
    const reservaCard = document.querySelector(`[data-reserva-id="${reservaId}"]`);
    
    if (!reservaCard) {
        alert('No se pudo encontrar la información de la reserva');
        return;
    }
    
    // Obtener datos de la tarjeta
    const numero = reservaCard.querySelector('.reserva-numero').textContent.trim();
    const estadoBadge = reservaCard.querySelector('.badge');
    const estado = estadoBadge.textContent.trim();
    const habitacion = reservaCard.querySelector('.habitacion-numero').textContent.trim();
    const tipo = reservaCard.querySelector('.habitacion-tipo').textContent.trim();
    const huespedes = reservaCard.querySelector('.text-muted.small').textContent.trim();
    const fechaEntrada = reservaCard.querySelector('.fecha-item:nth-child(1) .fecha-valor').textContent.trim();
    const fechaSalida = reservaCard.querySelector('.fecha-item:nth-child(2) .fecha-valor').textContent.trim();
    const precio = reservaCard.querySelector('.precio-total').textContent.trim();
    
    // Obtener notas si existen
    const notasElement = reservaCard.querySelector('.reserva-notas p');
    const notas = notasElement ? notasElement.textContent.trim() : null;
    
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
    // Obtener la tarjeta de reserva
    const reservaCard = document.querySelector(`[data-reserva-id="${reservaId}"]`);
    
    if (!reservaCard) {
        alert('No se pudo encontrar la información de la reserva');
        return;
    }
    
    // Obtener datos de la tarjeta
    const numero = reservaCard.querySelector('.reserva-numero').textContent.trim();
    const habitacion = reservaCard.querySelector('.habitacion-numero').textContent.trim();
    const tipo = reservaCard.querySelector('.habitacion-tipo').textContent.trim();
    const fechaEntrada = reservaCard.querySelector('.fecha-item:nth-child(1) .fecha-valor').textContent.trim();
    const fechaSalida = reservaCard.querySelector('.fecha-item:nth-child(2) .fecha-valor').textContent.trim();
    const precio = reservaCard.querySelector('.precio-total').textContent.trim();
    
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
            const reservaCard = document.querySelector(`[data-reserva-id="${reservaId}"]`);
            if (reservaCard) {
                // Actualizar badge de estado
                const badge = reservaCard.querySelector('.badge');
                badge.className = 'badge badge-cancelada';
                badge.textContent = 'CANCELADA';
                
                // Actualizar el data-estado
                reservaCard.setAttribute('data-estado', 'cancelada');
                
                // Remover botones de acción
                const actionsDiv = reservaCard.querySelector('.reserva-actions');
                if (actionsDiv) {
                    actionsDiv.innerHTML = `
                        <button class="btn btn-sm btn-outline-primary" onclick="verDetalles(${reservaId})">
                            <i class="fas fa-eye"></i> Ver Detalles
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
    const cards = document.querySelectorAll('.reserva-card');
    
    let totalReservas = cards.length;
    let confirmadas = 0;
    let activas = 0;
    let canceladas = 0;
    let pendientes = 0;
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    cards.forEach(card => {
        const estado = card.getAttribute('data-estado');
        
        // Contar por estado
        if (estado === 'confirmada') confirmadas++;
        if (estado === 'cancelada') canceladas++;
        if (estado === 'pendiente') pendientes++;
        
        // Verificar si está activa (fecha_entrada <= hoy <= fecha_salida)
        const fechaEntradaText = card.querySelector('.fecha-item:nth-child(1) .fecha-valor').textContent.trim();
        const fechaSalidaText = card.querySelector('.fecha-item:nth-child(2) .fecha-valor').textContent.trim();
        
        // Parsear fechas DD/MM/YYYY
        const [diaE, mesE, anioE] = fechaEntradaText.split('/');
        const [diaS, mesS, anioS] = fechaSalidaText.split('/');
        
        const fechaEntrada = new Date(anioE, mesE - 1, diaE);
        const fechaSalida = new Date(anioS, mesS - 1, diaS);
        
        if (fechaEntrada <= hoy && hoy <= fechaSalida && (estado === 'confirmada' || estado === 'pendiente')) {
            activas++;
        }
    });
    
    // Actualizar los contadores en la interfaz
    const statCards = document.querySelectorAll('.stat-card h3');
    if (statCards.length >= 4) {
        statCards[0].textContent = totalReservas; // Total
        statCards[1].textContent = confirmadas; // Confirmadas
        statCards[2].textContent = activas; // Activas
        statCards[3].textContent = canceladas; // Canceladas
    }
}

// Inicialización
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
