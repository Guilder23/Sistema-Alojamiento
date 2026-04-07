/**
 * Modal: Crear Reserva Presencial (Recepcionista)
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

const csrftoken_presencial = getCookie('csrftoken');

function _showPresencialError(msg) {
    const el = document.getElementById('presencial-error');
    const ok = document.getElementById('presencial-ok');
    if (ok) ok.style.display = 'none';
    if (el) {
        el.textContent = msg;
        el.style.display = 'block';
    }
}

function _showPresencialOk(msg) {
    const el = document.getElementById('presencial-ok');
    const err = document.getElementById('presencial-error');
    if (err) err.style.display = 'none';
    if (el) {
        el.textContent = msg;
        el.style.display = 'block';
    }
}

async function cargarClientesPresencial() {
    const select = document.getElementById('presencial-cliente');
    if (!select) return;

    select.innerHTML = '<option value="">Cargando...</option>';

    try {
        const resp = await fetch('/clientes/api/lista/');
        const data = await resp.json();

        if (!data.success) {
            select.innerHTML = '<option value="">No se pudieron cargar clientes</option>';
            return;
        }

        const clientes = data.clientes || [];
        if (clientes.length === 0) {
            select.innerHTML = '<option value="">No hay clientes registrados</option>';
            return;
        }

        select.innerHTML = '<option value="">Seleccione un cliente</option>';
        for (const c of clientes) {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = `${c.nombre_completo} - ${c.tipo_documento_label}: ${c.numero_documento}`;
            select.appendChild(opt);
        }
    } catch (e) {
        console.error(e);
        select.innerHTML = '<option value="">Error cargando clientes</option>';
    }
}

async function buscarHabitacionesPresencial() {
    const fechaInicio = document.getElementById('presencial-fecha-inicio')?.value;
    const fechaFin = document.getElementById('presencial-fecha-fin')?.value;
    const numPersonas = document.getElementById('presencial-num-personas')?.value;
    const select = document.getElementById('presencial-habitacion');

    if (!fechaInicio || !fechaFin || !numPersonas) {
        _showPresencialError('Completa fechas y huéspedes antes de buscar habitaciones.');
        return;
    }

    if (!select) return;
    select.innerHTML = '<option value="">Buscando...</option>';

    try {
        const url = `/reservas/api/habitaciones-disponibles/?fecha_inicio=${encodeURIComponent(fechaInicio)}&fecha_fin=${encodeURIComponent(fechaFin)}&num_personas=${encodeURIComponent(numPersonas)}`;
        const resp = await fetch(url);
        const data = await resp.json();

        if (!data.success) {
            select.innerHTML = '<option value="">Sin resultados</option>';
            _showPresencialError(data.message || 'No se pudieron obtener habitaciones.');
            return;
        }

        const habitaciones = data.habitaciones || [];
        if (habitaciones.length === 0) {
            select.innerHTML = '<option value="">No hay habitaciones disponibles</option>';
            return;
        }

        select.innerHTML = '<option value="">Seleccione una habitación</option>';
        for (const h of habitaciones) {
            const opt = document.createElement('option');
            opt.value = h.id;
            opt.textContent = `${h.numero} - ${h.tipo_label} (cap: ${h.capacidad}) - $${h.precio_noche}/noche`;
            select.appendChild(opt);
        }
    } catch (e) {
        console.error(e);
        select.innerHTML = '<option value="">Error al buscar</option>';
        _showPresencialError('Error al buscar habitaciones disponibles.');
    }
}

function _renderAcompananteRow(idx) {
    return `
        <div class="acompanante-row" data-index="${idx}">
            <div class="row g-2">
                <div class="col-md-4">
                    <label class="form-label">Nombre</label>
                    <input type="text" class="form-control" data-field="nombre" placeholder="Nombre">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Apellido</label>
                    <input type="text" class="form-control" data-field="apellido" placeholder="Apellido">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Teléfono</label>
                    <input type="text" class="form-control" data-field="telefono" placeholder="Teléfono">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Tipo doc.</label>
                    <select class="form-select" data-field="tipo_documento">
                        <option value="ci">Cédula</option>
                        <option value="pasaporte">Pasaporte</option>
                        <option value="otro">Otro</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Nro documento</label>
                    <input type="text" class="form-control" data-field="numero_documento" placeholder="Documento">
                </div>
                <div class="col-md-2 d-flex align-items-end">
                    <button class="btn btn-outline-danger w-100 btn-remove" type="button" data-action="remove-acompanante">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function agregarAcompanantePresencial() {
    const cont = document.getElementById('presencial-acompanantes');
    if (!cont) return;
    const idx = cont.querySelectorAll('.acompanante-row').length + 1;
    cont.insertAdjacentHTML('beforeend', _renderAcompananteRow(idx));
}

function obtenerAcompanantesPresencial() {
    const cont = document.getElementById('presencial-acompanantes');
    if (!cont) return [];

    const rows = Array.from(cont.querySelectorAll('.acompanante-row'));
    const result = [];

    for (const row of rows) {
        const getVal = (field) => (row.querySelector(`[data-field="${field}"]`)?.value || '').trim();
        const nombre = getVal('nombre');
        if (!nombre) continue;

        result.push({
            nombre,
            apellido: getVal('apellido'),
            telefono: getVal('telefono'),
            tipo_documento: (row.querySelector('[data-field="tipo_documento"]')?.value || 'ci'),
            numero_documento: getVal('numero_documento'),
        });
    }

    return result;
}

async function crearReservaPresencial() {
    const clienteId = document.getElementById('presencial-cliente')?.value;
    const fechaInicio = document.getElementById('presencial-fecha-inicio')?.value;
    const fechaFin = document.getElementById('presencial-fecha-fin')?.value;
    const numPersonas = document.getElementById('presencial-num-personas')?.value;
    const habitacionId = document.getElementById('presencial-habitacion')?.value;
    const observaciones = document.getElementById('presencial-observaciones')?.value || '';
    const checkinInmediato = document.getElementById('presencial-checkin')?.checked === true;

    const registrarPago = document.getElementById('presencial-registrar-pago')?.checked === true;
    const tipoPago = document.getElementById('presencial-tipo-pago')?.value || 'efectivo';
    const referencia = document.getElementById('presencial-referencia')?.value || '';
    const comentarioPago = document.getElementById('presencial-comentario-pago')?.value || '';

    if (!clienteId || !fechaInicio || !fechaFin || !numPersonas || !habitacionId) {
        _showPresencialError('Completa cliente, fechas, huéspedes y habitación.');
        return;
    }

    const payload = {
        cliente_id: parseInt(clienteId),
        habitacion_id: parseInt(habitacionId),
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        num_personas: parseInt(numPersonas),
        observaciones: observaciones,
        acompanantes: obtenerAcompanantesPresencial(),
        checkin_inmediato: checkinInmediato,
        registrar_pago: registrarPago,
        tipo_pago: tipoPago,
        referencia: referencia,
        comentario_pago: comentarioPago,
    };

    try {
        const resp = await fetch('/reservas/api/crear-presencial/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken_presencial,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        const data = await resp.json();

        if (!data.success) {
            _showPresencialError(data.message || 'No se pudo crear la reserva.');
            return;
        }

        _showPresencialOk(data.message || 'Reserva creada.');
        setTimeout(() => location.reload(), 700);
    } catch (e) {
        console.error(e);
        _showPresencialError('Error de red al crear la reserva.');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('modalCrearPresencial');
    if (modal) {
        modal.addEventListener('shown.bs.modal', function () {
            cargarClientesPresencial();
        });
    }

    document.getElementById('btn-buscar-habitaciones')?.addEventListener('click', buscarHabitacionesPresencial);
    document.getElementById('btn-agregar-acompanante')?.addEventListener('click', agregarAcompanantePresencial);

    document.getElementById('presencial-acompanantes')?.addEventListener('click', function (e) {
        const btn = e.target.closest('[data-action="remove-acompanante"]');
        if (btn) {
            const row = btn.closest('.acompanante-row');
            row?.remove();
        }
    });

    document.getElementById('presencial-registrar-pago')?.addEventListener('change', function (e) {
        const fields = document.getElementById('presencial-pago-fields');
        if (fields) fields.style.display = e.target.checked ? '' : 'none';
    });

    document.getElementById('btn-crear-presencial')?.addEventListener('click', crearReservaPresencial);
});
