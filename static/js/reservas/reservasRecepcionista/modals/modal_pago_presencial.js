/**
 * Modal: Pago presencial
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

const csrftoken_pago = getCookie('csrftoken');
let _pagoReservaId = null;

function abrirModalPagoPresencial(reservaId, clienteTxt, totalTxt) {
    _pagoReservaId = reservaId;

    document.getElementById('pago-reserva').textContent = `#${reservaId}`;
    document.getElementById('pago-cliente').textContent = clienteTxt || '';
    document.getElementById('pago-total').textContent = totalTxt || '';

    document.getElementById('pago-referencia').value = '';
    document.getElementById('pago-comentario').value = '';

    const err = document.getElementById('pago-error');
    const ok = document.getElementById('pago-ok');
    if (err) err.style.display = 'none';
    if (ok) ok.style.display = 'none';

    const modal = new bootstrap.Modal(document.getElementById('modalPagoPresencial'));
    modal.show();
}

async function confirmarPagoPresencial() {
    const err = document.getElementById('pago-error');
    const ok = document.getElementById('pago-ok');
    if (err) err.style.display = 'none';
    if (ok) ok.style.display = 'none';

    const payload = {
        tipo_pago: document.getElementById('pago-tipo')?.value || 'efectivo',
        referencia: document.getElementById('pago-referencia')?.value || '',
        comentario_pago: document.getElementById('pago-comentario')?.value || '',
    };

    try {
        const resp = await fetch(`/reservas/api/pago-presencial/${_pagoReservaId}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken_pago,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await resp.json();
        if (!data.success) {
            if (err) {
                err.textContent = data.message || 'No se pudo registrar el pago.';
                err.style.display = 'block';
            }
            return;
        }

        if (ok) {
            ok.textContent = data.message || 'Pago registrado.';
            ok.style.display = 'block';
        }

        setTimeout(() => location.reload(), 700);
    } catch (e) {
        console.error(e);
        if (err) {
            err.textContent = 'Error de red al registrar el pago.';
            err.style.display = 'block';
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('btn-pago-confirmar')?.addEventListener('click', confirmarPagoPresencial);
});
