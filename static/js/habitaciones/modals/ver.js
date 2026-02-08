// Modal Ver Habitación

async function verHabitacion(habitacionId) {
    try {
        const response = await fetch(`/habitaciones/api/detalle/${habitacionId}/`);
        if (!response.ok) throw new Error('Error al cargar habitación');

        const data = await response.json();
        if (data.success) {
            mostrarDetallesHabitacion(data.habitacion);
            abrirModalHabitaciones('modal-ver-habitacion');
        } else {
            alert('No se pudo cargar la información de la habitación');
        }
    } catch (e) {
        console.error(e);
        alert('Error al cargar los detalles de la habitación');
    }
}

function mostrarDetallesHabitacion(h) {
    // Información básica
    document.getElementById('ver-numero').textContent = h.numero || '-';
    document.getElementById('ver-nombre').textContent = h.nombre || '-';
    document.getElementById('ver-tipo').textContent = formatearTipoHabitacion(h.tipo) || '-';
    document.getElementById('ver-capacidad').textContent = h.capacidad ?? '-';
    document.getElementById('ver-piso').textContent = h.piso ?? '-';
    document.getElementById('ver-estado').textContent = formatearEstadoHabitacion(h.estado) || '-';
    
    // Precios
    document.getElementById('ver-precio').textContent = h.precio_noche ? `$${parseFloat(h.precio_noche).toFixed(2)}` : '-';
    document.getElementById('ver-precio-fin').textContent = h.precio_fin_semana ? `$${parseFloat(h.precio_fin_semana).toFixed(2)}` : 'No especificado';
    
    // Características
    document.getElementById('ver-tipo-bano').textContent = formatearTipoBano(h.tipo_bano) || '-';
    document.getElementById('ver-vista').textContent = formatearVista(h.vista) || '-';
    document.getElementById('ver-descripcion').textContent = h.descripcion || 'Sin descripción';

    // YouTube
    const youtubeGroup = document.getElementById('ver-youtube-group');
    const youtubeLink = document.getElementById('ver-youtube');
    if (youtubeGroup && youtubeLink && h.youtube_url) {
        youtubeLink.href = h.youtube_url;
        youtubeGroup.style.display = '';
    } else if (youtubeGroup) {
        youtubeGroup.style.display = 'none';
    }

    // Camas
    document.getElementById('ver-numero-camas').textContent = h.numero_camas ?? '-';
    document.getElementById('ver-tipo-cama').textContent = formatearTipoCama(h.tipo_cama) || '-';

    // Configuración de reservas
    document.getElementById('ver-min-noches').textContent = h.reserva_min_noches ? `${h.reserva_min_noches} noche(s)` : '-';
    document.getElementById('ver-max-noches').textContent = h.reserva_max_noches ? `${h.reserva_max_noches} noche(s)` : '-';
    document.getElementById('ver-mascotas').textContent = h.permite_mascotas ? 'Sí' : 'No';
    document.getElementById('ver-fumar').textContent = h.permite_fumar ? 'Sí' : 'No';

    // Amenidades - marcar las que tiene
    marcarAmenidad('ver-amenidad-bano', h.bano_privado);
    marcarAmenidad('ver-amenidad-tv', h.tv);
    marcarAmenidad('ver-amenidad-internet', h.internet);
    marcarAmenidad('ver-amenidad-youtube', h.acceso_youtube);
    marcarAmenidad('ver-amenidad-aire', h.aire_acondicionado);
    marcarAmenidad('ver-amenidad-calefaccion', h.calefaccion);
    marcarAmenidad('ver-amenidad-minibar', h.minibar);
    marcarAmenidad('ver-amenidad-caja', h.caja_fuerte);
    marcarAmenidad('ver-amenidad-escritorio', h.escritorio);
    marcarAmenidad('ver-amenidad-armario', h.armario);
    marcarAmenidad('ver-amenidad-agua', h.agua_caliente);
    marcarAmenidad('ver-amenidad-toallas', h.toallas);
    marcarAmenidad('ver-amenidad-papel', h.papel_higienico);
    marcarAmenidad('ver-amenidad-shampoo', h.shampoo);
    marcarAmenidad('ver-amenidad-secador', h.secador_cabello);

    // Foto principal
    const fotoGroup = document.getElementById('ver-foto-group');
    const foto = document.getElementById('ver-foto');
    if (h.foto && fotoGroup && foto) {
        foto.src = h.foto;
        fotoGroup.style.display = '';
    } else if (fotoGroup) {
        fotoGroup.style.display = 'none';
    }

    // Galería de fotos
    const fotosGroup = document.getElementById('ver-fotos-group');
    const fotosGrid = document.getElementById('ver-fotos');
    const fotos = Array.isArray(h.fotos) ? h.fotos : [];
    if (fotosGroup && fotosGrid && fotos.length) {
        fotosGrid.innerHTML = fotos.map(f => `<div class="foto-thumb"><img src="${f.url}" alt="foto"></div>`).join('');
        fotosGroup.style.display = '';
    } else if (fotosGroup) {
        fotosGroup.style.display = 'none';
    }
}

function marcarAmenidad(elementId, tiene) {
    const elem = document.getElementById(elementId);
    if (elem) {
        if (tiene) {
            elem.style.opacity = '1';
            elem.style.color = 'rgba(16, 185, 129, 0.95)';
            elem.style.fontWeight = '700';
        } else {
            elem.style.opacity = '0.3';
            elem.style.color = 'rgba(107, 114, 128, 0.6)';
            elem.style.fontWeight = '400';
        }
    }
}

function formatearTipoBano(tipo) {
    const map = {
        privado: 'Baño privado',
        compartido: 'Baño compartido',
        sin_bano: 'Sin baño'
    };
    return map[tipo] || tipo;
}

function formatearVista(vista) {
    const map = {
        mar: 'Mar',
        ciudad: 'Ciudad',
        jardin: 'Jardín',
        montana: 'Montaña',
        interior: 'Interior',
        sin_vista: 'Sin vista'
    };
    return map[vista] || vista || 'Sin vista';
}

function formatearTipoCama(tipo) {
    const map = {
        single: 'Single',
        queen: 'Queen',
        king: 'King',
        mixta: 'Mixta'
    };
    return map[tipo] || tipo;
}

function formatearTipoHabitacion(tipo) {
    const map = {
        simple: 'Habitación Simple',
        doble: 'Habitación Doble',
        triple: 'Habitación Triple',
        suite: 'Suite',
        deluxe: 'Deluxe',
        presidencial: 'Suite Presidencial'
    };
    return map[tipo] || tipo;
}

function formatearEstadoHabitacion(estado) {
    const map = {
        disponible: 'Disponible',
        ocupada: 'Ocupada',
        limpieza: 'En limpieza',
        mantenimiento: 'Mantenimiento',
        fuera_servicio: 'Fuera de servicio'
    };
    return map[estado] || estado;
}

document.getElementById('close-modal-ver-habitacion')?.addEventListener('click', function() {
    cerrarModalHabitaciones('modal-ver-habitacion');
});

window.verHabitacion = verHabitacion;
