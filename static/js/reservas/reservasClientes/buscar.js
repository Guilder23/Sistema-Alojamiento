// Buscar Habitaciones - JavaScript

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

// Variables globales
let habitacionActual = null;

// Filtros
document.getElementById('btn-aplicar-filtros')?.addEventListener('click', aplicarFiltros);
document.getElementById('btn-limpiar-filtros')?.addEventListener('click', limpiarFiltros);

function aplicarFiltros() {
    const tipo = document.getElementById('filtro-tipo').value;
    const capacidad = document.getElementById('filtro-capacidad').value;
    const precioMax = document.getElementById('filtro-precio-max').value;
    const filtroWifi = document.getElementById('filtro-wifi').checked;
    const filtroTV = document.getElementById('filtro-tv').checked;
    const filtroAire = document.getElementById('filtro-aire').checked;

    const cards = document.querySelectorAll('.habitacion-card');
    let visibles = 0;

    cards.forEach(card => {
        let mostrar = true;

        // Filtro por tipo
        if (tipo && card.dataset.tipo !== tipo) {
            mostrar = false;
        }

        // Filtro por capacidad
        if (capacidad) {
            const cap = parseInt(card.dataset.capacidad);
            const filtCap = parseInt(capacidad);
            if (filtCap === 4) {
                if (cap < 4) mostrar = false;
            } else {
                if (cap !== filtCap) mostrar = false;
            }
        }

        // Filtro por precio
        if (precioMax) {
            const precio = parseFloat(card.dataset.precio);
            if (precio > parseFloat(precioMax)) {
                mostrar = false;
            }
        }

        // Filtro por amenidades
        if (filtroWifi && card.dataset.wifi !== '1') mostrar = false;
        if (filtroTV && card.dataset.tv !== '1') mostrar = false;
        if (filtroAire && card.dataset.aire !== '1') mostrar = false;

        card.style.display = mostrar ? '' : 'none';
        if (mostrar) visibles++;
    });

    actualizarContador(visibles);
}

function limpiarFiltros() {
    document.getElementById('filtro-tipo').value = '';
    document.getElementById('filtro-capacidad').value = '';
    document.getElementById('filtro-precio-max').value = '';
    document.getElementById('filtro-wifi').checked = false;
    document.getElementById('filtro-tv').checked = false;
    document.getElementById('filtro-aire').checked = false;

    const cards = document.querySelectorAll('.habitacion-card');
    cards.forEach(card => card.style.display = '');
    
    actualizarContador(cards.length);
}

function actualizarContador(cantidad) {
    document.getElementById('contador-habitaciones').textContent = cantidad;
}

// Ver detalles de habitación
async function verDetallesHabitacion(id) {
    try {
        const response = await fetch(`/habitaciones/api/detalle-publico/${id}/`);
        const data = await response.json();

        if (data.success) {
            mostrarModalDetalles(data.habitacion);
        } else {
            alert('Error al cargar los detalles');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los detalles');
    }
}

function mostrarModalDetalles(habitacion) {
    const modal = document.getElementById('modal-detalles');
    const overlay = document.getElementById('modal-detalles-overlay');
    const body = document.getElementById('modal-detalles-body');

    // Construir galería de fotos
    let galeriaHTML = '';
    if (habitacion.fotos && habitacion.fotos.length > 0) {
        galeriaHTML = `
            <div class="detalles-galeria">
                ${habitacion.fotos.map(foto => `
                    <img src="${foto.url}" alt="${habitacion.nombre}" class="detalle-foto">
                `).join('')}
            </div>
        `;
    } else if (habitacion.foto) {
        galeriaHTML = `
            <div class="detalles-galeria">
                <img src="${habitacion.foto}" alt="${habitacion.nombre}" class="detalle-foto">
            </div>
        `;
    }

    // Construir lista de amenidades
    const amenidades = [];
    if (habitacion.internet) amenidades.push('<i class="fas fa-wifi"></i> Internet');
    if (habitacion.tv) amenidades.push('<i class="fas fa-tv"></i> TV');
    if (habitacion.aire_acondicionado) amenidades.push('<i class="fas fa-snowflake"></i> Aire Acondicionado');
    if (habitacion.calefaccion) amenidades.push('<i class="fas fa-fire"></i> Calefacción');
    if (habitacion.minibar) amenidades.push('<i class="fas fa-glass-martini"></i> Minibar');
    if (habitacion.caja_fuerte) amenidades.push('<i class="fas fa-lock"></i> Caja Fuerte');
    if (habitacion.escritorio) amenidades.push('<i class="fas fa-desk"></i> Escritorio');
    if (habitacion.armario) amenidades.push('<i class="fas fa-door-closed"></i> Armario');
    if (habitacion.agua_caliente) amenidades.push('<i class="fas fa-shower"></i> Agua Caliente');
    if (habitacion.toallas) amenidades.push('<i class="fas fa-towel"></i> Toallas');
    if (habitacion.papel_higienico) amenidades.push('<i class="fas fa-toilet-paper"></i> Papel Higiénico');
    if (habitacion.shampoo) amenidades.push('<i class="fas fa-pump-soap"></i> Shampoo');
    if (habitacion.secador_cabello) amenidades.push('<i class="fas fa-wind"></i> Secador');

    body.innerHTML = `
        ${galeriaHTML}
        <div class="detalles-info">
            <h4>${habitacion.nombre}</h4>
            <p class="detalle-numero">Habitación #${habitacion.numero}</p>
            
            ${habitacion.descripcion ? `<p class="descripcion">${habitacion.descripcion}</p>` : ''}
            
            <div class="detalles-grid">
                <div class="detalle-seccion">
                    <h5><i class="fas fa-info-circle"></i> Información General</h5>
                    <ul>
                        <li><strong>Tipo:</strong> ${formatearTipo(habitacion.tipo)}</li>
                        <li><strong>Capacidad:</strong> ${habitacion.capacidad} persona(s)</li>
                        <li><strong>Piso:</strong> ${habitacion.piso}</li>
                        <li><strong>Camas:</strong> ${habitacion.numero_camas} cama(s) ${formatearTipoCama(habitacion.tipo_cama)}</li>
                        <li><strong>Baño:</strong> ${habitacion.bano_privado ? 'Privado' : 'Compartido'}</li>
                        ${habitacion.vista ? `<li><strong>Vista:</strong> ${formatearVista(habitacion.vista)}</li>` : ''}
                    </ul>
                </div>

                <div class="detalle-seccion">
                    <h5><i class="fas fa-dollar-sign"></i> Precios</h5>
                    <ul>
                        <li><strong>Precio por noche:</strong> $${habitacion.precio_noche}</li>
                        ${habitacion.precio_fin_semana ? `<li><strong>Fin de semana:</strong> $${habitacion.precio_fin_semana}</li>` : ''}
                    </ul>
                </div>

                <div class="detalle-seccion">
                    <h5><i class="fas fa-calendar"></i> Políticas de Reserva</h5>
                    <ul>
                        <li><strong>Mínimo de noches:</strong> ${habitacion.reserva_min_noches}</li>
                        <li><strong>Máximo de noches:</strong> ${habitacion.reserva_max_noches}</li>
                        <li><strong>Mascotas:</strong> ${habitacion.permite_mascotas ? 'Permitidas' : 'No permitidas'}</li>
                        <li><strong>Fumar:</strong> ${habitacion.permite_fumar ? 'Permitido' : 'No permitido'}</li>
                    </ul>
                </div>

                ${amenidades.length > 0 ? `
                <div class="detalle-seccion full-width">
                    <h5><i class="fas fa-check-circle"></i> Amenidades</h5>
                    <div class="amenidades-lista">
                        ${amenidades.map(a => `<span class="amenidad-item">${a}</span>`).join('')}
                    </div>
                </div>
                ` : ''}
            </div>

            <div class="detalle-acciones">
                <button type="button" class="btn btn-secondary" onclick="cerrarModalDetalles()">Cerrar</button>
                <button type="button" class="btn btn-primary" onclick="cerrarModalDetalles(); iniciarReserva(${habitacion.id});">
                    <i class="fas fa-calendar-check"></i> Reservar Ahora
                </button>
            </div>
        </div>
    `;

    modal.style.display = 'block';
    overlay.classList.add('active');
}

function cerrarModalDetalles() {
    const modal = document.getElementById('modal-detalles');
    const overlay = document.getElementById('modal-detalles-overlay');
    modal.style.display = 'none';
    overlay.classList.remove('active');
}

// Iniciar reserva
async function iniciarReserva(id) {
    try {
        const response = await fetch(`/habitaciones/api/detalle-publico/${id}/`);
        const data = await response.json();

        if (data.success) {
            habitacionActual = data.habitacion;
            mostrarModalReserva(data.habitacion);
        } else {
            alert('Error al cargar la información de la habitación');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar la información');
    }
}

function mostrarModalReserva(habitacion) {
    const modal = document.getElementById('modal-reserva');
    const overlay = document.getElementById('modal-reserva-overlay');
    const infoDiv = document.getElementById('habitacion-reserva-info');

    document.getElementById('reserva-habitacion-id').value = habitacion.id;
    document.getElementById('reserva-num-personas').max = habitacion.capacidad;
    document.getElementById('reserva-num-personas').value = 1;

    // Establecer fechas mínimas
    const hoy = new Date().toISOString().split('T')[0];
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    const mananaStr = manana.toISOString().split('T')[0];

    document.getElementById('reserva-fecha-inicio').min = hoy;
    document.getElementById('reserva-fecha-inicio').value = hoy;
    document.getElementById('reserva-fecha-fin').min = mananaStr;
    document.getElementById('reserva-fecha-fin').value = mananaStr;

    infoDiv.innerHTML = `
        <h4>${habitacion.nombre}</h4>
        <p><strong>Habitación #${habitacion.numero}</strong></p>
        <p>Capacidad: ${habitacion.capacidad} persona(s) | Precio: $${habitacion.precio_noche}/noche</p>
        <p class="text-muted">Estadía mínima: ${habitacion.reserva_min_noches} noche(s) | Máxima: ${habitacion.reserva_max_noches} noche(s)</p>
    `;

    modal.style.display = 'block';
    overlay.classList.add('active');
}

function cerrarModalReserva() {
    const modal = document.getElementById('modal-reserva');
    const overlay = document.getElementById('modal-reserva-overlay');
    modal.style.display = 'none';
    overlay.classList.remove('active');
    document.getElementById('form-reserva').reset();
    document.getElementById('resumen-reserva').style.display = 'none';
    habitacionActual = null;
}

// Calcular resumen de reserva
document.getElementById('reserva-fecha-inicio')?.addEventListener('change', calcularResumen);
document.getElementById('reserva-fecha-fin')?.addEventListener('change', calcularResumen);

function calcularResumen() {
    const fechaInicio = document.getElementById('reserva-fecha-inicio').value;
    const fechaFin = document.getElementById('reserva-fecha-fin').value;

    if (!fechaInicio || !fechaFin || !habitacionActual) return;

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diff = fin - inicio;
    const noches = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (noches <= 0) {
        document.getElementById('resumen-reserva').style.display = 'none';
        return;
    }

    // Validar mínimo y máximo de noches
    if (noches < habitacionActual.reserva_min_noches) {
        alert(`La estadía mínima es de ${habitacionActual.reserva_min_noches} noche(s)`);
        return;
    }

    if (noches > habitacionActual.reserva_max_noches) {
        alert(`La estadía máxima es de ${habitacionActual.reserva_max_noches} noche(s)`);
        return;
    }

    const precioNoche = parseFloat(habitacionActual.precio_noche);
    const total = noches * precioNoche;

    document.getElementById('resumen-noches').textContent = `${noches} noche(s)`;
    document.getElementById('resumen-precio-noche').textContent = `$${precioNoche.toFixed(2)}`;
    document.getElementById('resumen-total').textContent = `$${total.toFixed(2)}`;
    document.getElementById('resumen-reserva').style.display = 'block';
}

// Enviar reserva
document.getElementById('form-reserva')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const habitacionId = document.getElementById('reserva-habitacion-id').value;
    const fechaInicio = document.getElementById('reserva-fecha-inicio').value;
    const fechaFin = document.getElementById('reserva-fecha-fin').value;
    const numPersonas = parseInt(document.getElementById('reserva-num-personas').value);
    const observaciones = document.getElementById('reserva-observaciones').value.trim();

    // Validaciones
    if (!fechaInicio || !fechaFin) {
        alert('Por favor ingresa las fechas de la reserva');
        return;
    }

    if (numPersonas < 1 || numPersonas > habitacionActual.capacidad) {
        alert(`El número de personas debe estar entre 1 y ${habitacionActual.capacidad}`);
        return;
    }

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    if (fin <= inicio) {
        alert('La fecha de salida debe ser posterior a la fecha de entrada');
        return;
    }

    const dataReserva = {
        habitacion_id: habitacionId,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        num_personas: numPersonas,
        observaciones: observaciones
    };

    try {
        // Crear FormData para enviar al backend
        const formData = new FormData();
        formData.append('habitacion_id', habitacionId);
        formData.append('fecha_inicio', fechaInicio);
        formData.append('fecha_fin', fechaFin);
        formData.append('num_personas', numPersonas);
        formData.append('observaciones', observaciones);
        
        const response = await fetch('/reservas/api/crear/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken
            },
            body: formData
        });

        const data = await response.json();
        
        if (data.success) {
            alert('¡Reserva creada exitosamente! Total: $' + data.data.precio_total.toFixed(2));
            cerrarModalReserva();
            // Redirigir a mis reservas
            window.location.href = '/reservas/mis-reservas/';
        } else {
            alert(data.message || 'Error al crear la reserva');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al procesar la reserva');
    }
});

// Funciones auxiliares de formateo
function formatearTipo(tipo) {
    const tipos = {
        'simple': 'Habitación Simple',
        'doble': 'Habitación Doble',
        'triple': 'Habitación Triple',
        'suite': 'Suite',
        'deluxe': 'Deluxe',
        'presidencial': 'Suite Presidencial'
    };
    return tipos[tipo] || tipo;
}

function formatearTipoCama(tipo) {
    const tipos = {
        'single': 'Single',
        'queen': 'Queen',
        'king': 'King',
        'mixta': 'Mixta'
    };
    return tipos[tipo] || tipo;
}

function formatearVista(vista) {
    const vistas = {
        'mar': 'al Mar',
        'ciudad': 'a la Ciudad',
        'jardin': 'al Jardín',
        'montana': 'a la Montaña',
        'interior': 'Interior',
        'sin_vista': 'Sin Vista'
    };
    return vistas[vista] || vista;
}

// Cerrar modales al hacer clic en overlay
document.getElementById('modal-detalles-overlay')?.addEventListener('click', cerrarModalDetalles);
document.getElementById('modal-reserva-overlay')?.addEventListener('click', cerrarModalReserva);

// Delegación de eventos para botones de habitaciones
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('click', function(e) {
        // Botón Ver Galería
        if (e.target.closest('.btn-ver-galeria')) {
            const btn = e.target.closest('.btn-ver-galeria');
            const habitacionId = btn.getAttribute('data-habitacion-id');
            if (habitacionId) {
                verGaleria(parseInt(habitacionId));
            }
        }
        
        // Botón Ver Detalles
        if (e.target.closest('.btn-ver-detalles')) {
            const btn = e.target.closest('.btn-ver-detalles');
            const habitacionId = btn.getAttribute('data-habitacion-id');
            if (habitacionId) {
                verDetallesHabitacion(parseInt(habitacionId));
            }
        }
        
        // Botón Reservar
        if (e.target.closest('.btn-reservar')) {
            const btn = e.target.closest('.btn-reservar');
            const habitacionId = btn.getAttribute('data-habitacion-id');
            if (habitacionId) {
                iniciarReserva(parseInt(habitacionId));
            }
        }
    });
});
