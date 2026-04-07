/**
 * Modal: Check-in
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

const csrftoken_checkin = getCookie('csrftoken');
let _checkinReservaId = null;

function abrirModalCheckin(reservaId, clienteTxt, habitacionTxt) {
    _checkinReservaId = reservaId;
    document.getElementById('checkin-reserva').textContent = `#${reservaId}`;
    document.getElementById('checkin-cliente').textContent = clienteTxt || '';
    document.getElementById('checkin-habitacion').textContent = habitacionTxt || '';

    const err = document.getElementById('checkin-error');
    if (err) err.style.display = 'none';

    const modal = new bootstrap.Modal(document.getElementById('modalCheckin'));
    modal.show();
}

async function confirmarCheckin() {
    const err = document.getElementById('checkin-error');
    if (err) err.style.display = 'none';

    try {
        const resp = await fetch(`/reservas/api/checkin/${_checkinReservaId}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken_checkin,
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });

        const data = await resp.json();
        if (!data.success) {
            if (err) {
                err.textContent = data.message || 'No se pudo realizar el check-in.';
                err.style.display = 'block';
            }
            return;
        }

        const modal = bootstrap.Modal.getInstance(document.getElementById('modalCheckin'));
        modal?.hide();
        location.reload();
    } catch (e) {
        console.error(e);
        if (err) {
            err.textContent = 'Error de red al realizar check-in.';
            err.style.display = 'block';
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('btn-checkin-confirmar')?.addEventListener('click', confirmarCheckin);
});
