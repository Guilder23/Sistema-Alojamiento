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
 * Filtros compactos (tiempo real)
 */
function aplicarFiltros() {
    const q = (document.getElementById('search-reservas')?.value || '').trim().toLowerCase();
    const estadoFiltro = (document.getElementById('filter-estado')?.value || '').trim().toLowerCase();
    const pagoFiltro = (document.getElementById('filter-pago')?.value || '').trim().toLowerCase();
    const checkinFiltro = (document.getElementById('filter-checkin')?.value || '').trim();
    const checkoutFiltro = (document.getElementById('filter-checkout')?.value || '').trim();

    const filas = document.querySelectorAll('#tabla-reservas tr[data-reserva-id]');
    let visibles = 0;

    filas.forEach(fila => {
        const estado = (fila.getAttribute('data-estado') || '').toLowerCase();
        const habitacion = (fila.getAttribute('data-habitacion') || '').toLowerCase();
        const cliente = (fila.getAttribute('data-cliente') || '').toLowerCase();
        const checkin = fila.getAttribute('data-checkin') || '';
        const checkout = fila.getAttribute('data-checkout') || '';
        const pagoEstado = (fila.getAttribute('data-pago') || 'sin').toLowerCase();
        const pagoValidacion = (fila.getAttribute('data-pago-validacion') || '').toLowerCase();

        let mostrar = true;

        // Búsqueda general (cliente u habitación)
        if (q) {
            const hayMatch = cliente.includes(q) || habitacion.includes(q);
            if (!hayMatch) mostrar = false;
        }

        // Estado
        if (mostrar && estadoFiltro && estado !== estadoFiltro) {
            mostrar = false;
        }

        // Pago
        if (mostrar && pagoFiltro) {
            if (pagoFiltro === 'sin') {
                if (pagoEstado !== 'sin') mostrar = false;
            } else if (pagoFiltro === 'rechazado') {
                if (pagoValidacion !== 'rechazado') mostrar = false;
            } else {
                // validado/enviado/pendiente
                if (pagoEstado !== pagoFiltro) mostrar = false;
            }
        }

        // Check-in
        if (mostrar && (checkinFiltro === '0' || checkinFiltro === '1')) {
            if (checkin !== checkinFiltro) mostrar = false;
        }

        // Check-out
        if (mostrar && (checkoutFiltro === '0' || checkoutFiltro === '1')) {
            if (checkout !== checkoutFiltro) mostrar = false;
        }

        fila.style.display = mostrar ? '' : 'none';
        if (mostrar) visibles++;
    });

    console.log(`Filtros aplicados: ${visibles} reservas visibles`);
}

/**
 * Ver detalles de una reserva
 */
function verDetalles(reservaId) {
    // Pintar placeholders
    document.getElementById('modal-reserva-numero').textContent = `#${reservaId}`;
    const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    setText('modal-cliente-nombre', 'Cargando...');
    setText('modal-cliente-email', 'Cargando...');
    setText('modal-cliente-telefono', 'Cargando...');
    setText('modal-cliente-documento', 'Cargando...');

    setText('modal-habitacion-numero', 'Cargando...');
    setText('modal-habitacion-tipo', 'Cargando...');
    setText('modal-huespedes', 'Cargando...');

    setText('modal-fecha-entrada', 'Cargando...');
    setText('modal-fecha-salida', 'Cargando...');
    setText('modal-precio-total', 'Cargando...');
    setText('modal-checkin', 'Cargando...');
    setText('modal-checkout', 'Cargando...');
    setText('modal-origen', 'Cargando...');
    setText('modal-pago', 'Cargando...');
    setText('modal-creador-nombre', 'Cargando...');
    setText('modal-creador-rol', 'Cargando...');

    const estadoSpan = document.getElementById('modal-estado-reserva');
    if (estadoSpan) estadoSpan.textContent = 'Cargando...';

    const acompSection = document.getElementById('modal-acompanantes-section');
    const acompList = document.getElementById('modal-acompanantes-list');
    if (acompSection) acompSection.style.display = 'none';
    if (acompList) acompList.innerHTML = '';

    const notasSection = document.getElementById('modal-notas-section');
    if (notasSection) notasSection.style.display = 'none';

    // Mostrar el modal
    const modal = new bootstrap.Modal(document.getElementById('modalDetalles'));
    modal.show();

    // Cargar detalle completo
    fetch(`/reservas/api/detalle/${reservaId}/`)
        .then(r => r.json())
        .then(data => {
            if (!data.success) return;

            // Cliente
            setText('modal-cliente-nombre', data.cliente?.nombre || 'N/A');
            setText('modal-cliente-email', data.cliente?.email || 'N/A');
            setText('modal-cliente-telefono', data.cliente?.telefono || 'N/A');
            setText('modal-cliente-documento', data.cliente?.documento || 'N/A');

            // Habitación
            setText('modal-habitacion-numero', data.habitacion?.numero != null ? String(data.habitacion.numero) : 'N/A');
            setText('modal-habitacion-tipo', data.habitacion?.tipo || 'N/A');
            setText('modal-huespedes', data.reserva?.num_huespedes != null ? String(data.reserva.num_huespedes) : 'N/A');

            // Reserva
            setText('modal-fecha-entrada', data.reserva?.fecha_entrada || 'N/A');
            setText('modal-fecha-salida', data.reserva?.fecha_salida || 'N/A');

            const total = (data.reserva?.precio_total != null) ? `$${Number(data.reserva.precio_total).toFixed(2)}` : 'N/A';
            setText('modal-precio-total', total);

            const estado = data.reserva?.estado || '';
            const estadoDisplay = data.reserva?.estado_display || 'N/A';
            if (estadoSpan) {
                estadoSpan.innerHTML = estado ? `<span class="badge badge-${estado}">${estadoDisplay}</span>` : estadoDisplay;
            }

            // Origen
            const origen = data.reserva?.origen || 'online';
            const origenDisplay = data.reserva?.origen_display || (origen === 'presencial' ? 'Presencial' : 'En línea');
            const origenEl = document.getElementById('modal-origen');
            if (origenEl) {
                if (origen === 'presencial') {
                    origenEl.innerHTML = '<span class="badge badge-origen-presencial">PRESENCIAL</span>';
                } else {
                    origenEl.innerHTML = '<span class="badge badge-origen-online">EN LÍNEA</span>';
                }
            } else {
                setText('modal-origen', origenDisplay);
            }

            // Check-in/out
            setText('modal-checkin', data.reserva?.fecha_checkin || (data.reserva?.checkin_realizado ? 'Sí' : 'No'));
            setText('modal-checkout', data.reserva?.fecha_checkout || (data.reserva?.checkout_realizado ? 'Sí' : 'No'));

            // Pago
            const pago = data.pago || {};
            const pagoEl = document.getElementById('modal-pago');
            if (pagoEl) {
                if (!pago.existe) {
                    pagoEl.innerHTML = '<span class="badge badge-origen-online">NO REGISTRADO</span>';
                } else if (pago.pagado) {
                    pagoEl.innerHTML = '<span class="badge badge-pago-validado">PAGADO</span>';
                } else {
                    const est = (pago.estado || 'pendiente').toUpperCase();
                    pagoEl.innerHTML = `<span class="badge badge-pago-${(pago.estado || 'pendiente')}">${est}</span>`;
                }
            }

            // Creador + rol
            const creador = data.creador || {};
            setText('modal-creador-nombre', creador.nombre || 'N/A');
            setText('modal-creador-rol', creador.rol_display || creador.rol || 'N/A');

            // Notas
            if (notasSection) {
                const notas = data.reserva?.notas || '';
                if (notas.trim()) {
                    const notasContenido = document.getElementById('modal-notas-contenido');
                    if (notasContenido) notasContenido.textContent = notas;
                    notasSection.style.display = 'block';
                }
            }

            // Acompañantes
            const acomp = data.acompanantes || [];
            if (acompList && acompSection) {
                if (acomp.length > 0) {
                    acompList.innerHTML = acomp.map(a => {
                        const doc = a.numero_documento ? ` - ${String(a.tipo_documento || '').toUpperCase()}: ${a.numero_documento}` : '';
                        return `<li>${a.nombre} ${a.apellido || ''}${doc}</li>`;
                    }).join('');
                    acompSection.style.display = 'block';
                }
            }
        })
        .catch(err => console.error('Error detalle reserva:', err));
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
    document.getElementById('search-reservas')?.addEventListener('input', aplicarFiltros);
    document.getElementById('filter-estado')?.addEventListener('change', aplicarFiltros);
    document.getElementById('filter-pago')?.addEventListener('change', aplicarFiltros);
    document.getElementById('filter-checkin')?.addEventListener('change', aplicarFiltros);
    document.getElementById('filter-checkout')?.addEventListener('change', aplicarFiltros);
    
    // Botón nueva reserva presencial
    document.getElementById('btn-abrir-reserva-presencial')?.addEventListener('click', function () {
        const modal = new bootstrap.Modal(document.getElementById('modalCrearPresencial'));
        modal.show();
    });

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

        // Botón Check-in
        if (e.target.closest('.btn-checkin-reserva')) {
            const btn = e.target.closest('.btn-checkin-reserva');
            const reservaId = btn.getAttribute('data-reserva-id');
            if (reservaId) {
                const fila = document.querySelector(`tr[data-reserva-id="${reservaId}"]`);
                const cliente = fila?.querySelector('.cliente-info strong')?.textContent?.trim() || '';
                const hab = fila?.querySelector('.habitacion-info strong')?.textContent?.trim() || '';
                const tipo = fila?.querySelector('.habitacion-info small')?.textContent?.trim() || '';
                if (typeof abrirModalCheckin === 'function') {
                    abrirModalCheckin(parseInt(reservaId), cliente, `${hab} - ${tipo}`);
                }
            }
        }

        // Botón Check-out
        if (e.target.closest('.btn-checkout-reserva')) {
            const btn = e.target.closest('.btn-checkout-reserva');
            const reservaId = btn.getAttribute('data-reserva-id');
            if (reservaId) {
                const fila = document.querySelector(`tr[data-reserva-id="${reservaId}"]`);
                const cliente = fila?.querySelector('.cliente-info strong')?.textContent?.trim() || '';
                const hab = fila?.querySelector('.habitacion-info strong')?.textContent?.trim() || '';
                const tipo = fila?.querySelector('.habitacion-info small')?.textContent?.trim() || '';
                if (typeof abrirModalCheckout === 'function') {
                    abrirModalCheckout(parseInt(reservaId), cliente, `${hab} - ${tipo}`);
                }
            }
        }

        // Botón Pago presencial
        if (e.target.closest('.btn-pago-presencial')) {
            const btn = e.target.closest('.btn-pago-presencial');
            const reservaId = btn.getAttribute('data-reserva-id');
            if (reservaId) {
                const fila = document.querySelector(`tr[data-reserva-id="${reservaId}"]`);
                const cliente = fila?.querySelector('.cliente-info strong')?.textContent?.trim() || '';
                const total = fila?.cells?.[6]?.textContent?.trim() || '';
                if (typeof abrirModalPagoPresencial === 'function') {
                    abrirModalPagoPresencial(parseInt(reservaId), cliente, total);
                }
            }
        }
    });
});
