/**
 * Modal: Check-out
 */

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

const csrftoken_checkout = getCookie('csrftoken');
let _checkoutReservaId = null;

function abrirModalCheckout(reservaId, clienteTxt, habitacionTxt) {
    _checkoutReservaId = reservaId;
    document.getElementById('checkout-reserva').textContent = `#${reservaId}`;
    document.getElementById('checkout-cliente').textContent = clienteTxt || '';
    document.getElementById('checkout-habitacion').textContent = habitacionTxt || '';

    const err = document.getElementById('checkout-error');
    if (err) err.style.display = 'none';

    const modal = new bootstrap.Modal(document.getElementById('modalCheckout'));
    modal.show();
}

async function confirmarCheckout() {
    const err = document.getElementById('checkout-error');
    if (err) err.style.display = 'none';

    const estadoHabitacion = document.getElementById('checkout-estado-habitacion')?.value || 'limpieza';

    try {
        const body = new URLSearchParams();
        body.set('estado_habitacion', estadoHabitacion);

        const resp = await fetch(`/reservas/api/checkout/${_checkoutReservaId}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken_checkout,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body,
        });

        const data = await resp.json();
        if (!data.success) {
            if (err) {
                err.textContent = data.message || 'No se pudo realizar el check-out.';
                err.style.display = 'block';
            }
            return;
        }

        const modal = bootstrap.Modal.getInstance(document.getElementById('modalCheckout'));
        modal?.hide();
        location.reload();
    } catch (e) {
        console.error(e);
        if (err) {
            err.textContent = 'Error de red al realizar check-out.';
            err.style.display = 'block';
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('btn-checkout-confirmar')?.addEventListener('click', confirmarCheckout);
});
