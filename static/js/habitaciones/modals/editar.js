// Modal Editar Habitación

let habitacionEditando = null;

async function editarHabitacion(habitacionId) {
    try {
        const response = await fetch(`/habitaciones/api/detalle/${habitacionId}/`);
        if (!response.ok) throw new Error('Error al cargar habitación');

        const data = await response.json();
        if (data.success) {
            habitacionEditando = data.habitacion;
            cargarDatosEdicionHabitacion(data.habitacion);
            abrirModalHabitaciones('modal-editar-habitacion');
        } else {
            alert('No se pudo cargar la información de la habitación');
        }
    } catch (e) {
        console.error(e);
        alert('Error al cargar los datos de la habitación');
    }
}

function cargarDatosEdicionHabitacion(h) {
    document.getElementById('editar-id').value = h.id;
    document.getElementById('editar-numero').value = h.numero || '';
    document.getElementById('editar-nombre').value = h.nombre || '';
    document.getElementById('editar-tipo').value = h.tipo || 'doble';
    document.getElementById('editar-capacidad').value = h.capacidad ?? 2;
    document.getElementById('editar-piso').value = h.piso ?? 1;
    document.getElementById('editar-precio').value = h.precio_noche ?? '';
    document.getElementById('editar-precio-fin').value = h.precio_fin_semana ?? '';
    document.getElementById('editar-estado').value = h.estado || 'disponible';
    document.getElementById('editar-descripcion').value = h.descripcion || '';

    document.getElementById('editar-tipo-bano').value = h.tipo_bano || 'privado';
    document.getElementById('editar-vista').value = h.vista || '';
    document.getElementById('editar-youtube').value = h.youtube_url || '';

    document.getElementById('editar-numero-camas').value = h.numero_camas ?? 1;
    document.getElementById('editar-tipo-cama').value = h.tipo_cama || 'single';
    document.getElementById('editar-min-noches').value = h.reserva_min_noches ?? 1;
    document.getElementById('editar-max-noches').value = h.reserva_max_noches ?? 30;

    document.getElementById('editar-bano-privado').checked = !!h.bano_privado;
    document.getElementById('editar-tv').checked = !!h.tv;
    document.getElementById('editar-internet').checked = !!h.internet;
    document.getElementById('editar-acceso-youtube').checked = !!h.acceso_youtube;
    document.getElementById('editar-aire').checked = !!h.aire_acondicionado;
    document.getElementById('editar-calefaccion').checked = !!h.calefaccion;
    document.getElementById('editar-minibar').checked = !!h.minibar;
    document.getElementById('editar-caja').checked = !!h.caja_fuerte;
    document.getElementById('editar-escritorio').checked = !!h.escritorio;
    document.getElementById('editar-armario').checked = !!h.armario;
    document.getElementById('editar-agua').checked = !!h.agua_caliente;
    document.getElementById('editar-toallas').checked = !!h.toallas;
    document.getElementById('editar-papel').checked = !!h.papel_higienico;
    document.getElementById('editar-shampoo').checked = !!h.shampoo;
    document.getElementById('editar-secador').checked = !!h.secador_cabello;
    document.getElementById('editar-mascotas').checked = !!h.permite_mascotas;
    document.getElementById('editar-fumar').checked = !!h.permite_fumar;

    // Cargar galería existente
    editarGaleriaFiles = [];
    const fotos = Array.isArray(h.fotos) ? h.fotos : [];
    fotos.forEach(f => {
        editarGaleriaFiles.push({ url: f.url, id: f.id });
    });
    actualizarEditarGaleriaPreview();

    const input = document.getElementById('editar-fotos');
    if (input) input.value = '';
}

async function actualizarHabitacion(formData) {
    try {
        const body = new FormData();
        Object.entries(formData).forEach(([k, v]) => {
            if (v !== undefined && v !== null) body.append(k, String(v));
        });

        // Agregar solo imágenes nuevas (que tienen file)
        editarGaleriaFiles.forEach(item => {
            if (item.file) {
                body.append('fotos', item.file);
            }
        });

        const response = await fetch(`/habitaciones/api/actualizar/${formData.id}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken
            },
            body
        });

        const data = await response.json();
        if (response.ok && data.success) {
            alert('Habitación actualizada exitosamente');
            cerrarModalHabitaciones('modal-editar-habitacion');
            cargarHabitaciones();
        } else {
            alert(data.error || 'Error al actualizar la habitación');
        }
    } catch (e) {
        console.error(e);
        alert('Error al actualizar la habitación');
    }
}

document.getElementById('form-editar-habitacion')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = {
        id: parseInt(document.getElementById('editar-id').value, 10),
        // numero no se envía porque es readonly y no se puede modificar
        nombre: document.getElementById('editar-nombre').value.trim(),
        tipo: document.getElementById('editar-tipo').value,
        capacidad: parseInt(document.getElementById('editar-capacidad').value, 10),
        piso: parseInt(document.getElementById('editar-piso').value, 10),
        precio_noche: parseFloat(document.getElementById('editar-precio').value),
        precio_fin_semana: document.getElementById('editar-precio-fin').value.trim(),
        estado: document.getElementById('editar-estado').value,
        descripcion: document.getElementById('editar-descripcion').value.trim(),
        tipo_bano: document.getElementById('editar-tipo-bano').value,
        vista: document.getElementById('editar-vista').value,
        youtube_url: document.getElementById('editar-youtube').value.trim(),

        numero_camas: parseInt(document.getElementById('editar-numero-camas').value, 10),
        tipo_cama: document.getElementById('editar-tipo-cama').value,
        reserva_min_noches: parseInt(document.getElementById('editar-min-noches').value, 10),
        reserva_max_noches: parseInt(document.getElementById('editar-max-noches').value, 10),
        permite_mascotas: document.getElementById('editar-mascotas').checked,
        permite_fumar: document.getElementById('editar-fumar').checked,

        bano_privado: document.getElementById('editar-bano-privado').checked,
        tv: document.getElementById('editar-tv').checked,
        internet: document.getElementById('editar-internet').checked,
        acceso_youtube: document.getElementById('editar-acceso-youtube').checked,
        aire_acondicionado: document.getElementById('editar-aire').checked,
        calefaccion: document.getElementById('editar-calefaccion').checked,
        minibar: document.getElementById('editar-minibar').checked,
        caja_fuerte: document.getElementById('editar-caja').checked,
        escritorio: document.getElementById('editar-escritorio').checked,
        armario: document.getElementById('editar-armario').checked,
        agua_caliente: document.getElementById('editar-agua').checked,
        toallas: document.getElementById('editar-toallas').checked,
        papel_higienico: document.getElementById('editar-papel').checked,
        shampoo: document.getElementById('editar-shampoo').checked,
        secador_cabello: document.getElementById('editar-secador').checked,
    };

    // Validación básica
    if (!formData.nombre) {
        alert('El nombre de habitación es requerido');
        return;
    }
    if (!formData.tipo) {
        alert('El tipo de habitación es requerido');
        return;
    }
    if (isNaN(formData.capacidad) || formData.capacidad < 1) {
        alert('La capacidad debe ser al menos 1');
        return;
    }
    if (isNaN(formData.piso) || formData.piso < 1) {
        alert('El piso debe ser al menos 1');
        return;
    }
    if (isNaN(formData.precio_noche) || formData.precio_noche < 0) {
        alert('El precio por noche debe ser un número válido');
        return;
    }

    await actualizarHabitacion(formData);
});

document.getElementById('close-modal-editar-habitacion')?.addEventListener('click', function() {
    cerrarModalHabitaciones('modal-editar-habitacion');
    habitacionEditando = null;
    document.getElementById('form-editar-habitacion')?.reset();
    limpiarPreviewEditarFoto();
});

function limpiarPreviewEditarFoto() {
    editarGaleriaFiles = [];
    actualizarEditarGaleriaPreview();
    
    const input = document.getElementById('editar-fotos');
    if (input) input.value = '';
}

// Sistema de galería de imágenes para editar
let editarGaleriaFiles = [];

function actualizarEditarGaleriaPreview() {
    const container = document.getElementById('editar-fotos-preview');
    const contador = document.getElementById('editar-contador-fotos');
    const btnAgregar = document.getElementById('btn-agregar-editar-foto');
    
    if (!container) return;
    
    if (editarGaleriaFiles.length === 0) {
        container.innerHTML = '<div class="galeria-vacia"><i class="fas fa-images"></i><p>Sin imágenes</p></div>';
    } else {
        container.innerHTML = editarGaleriaFiles.map((f, index) => {
            const url = f.url || URL.createObjectURL(f.file);
            return `
                <div class="foto-thumb" data-index="${index}">
                    <img src="${url}" alt="${f.file ? f.file.name : 'Imagen'}">
                    <button type="button" class="btn-eliminar-foto" onclick="eliminarEditarGaleriaFoto(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        }).join('');
    }
    
    if (contador) contador.textContent = editarGaleriaFiles.length;
    if (btnAgregar) btnAgregar.style.display = editarGaleriaFiles.length >= 6 ? 'none' : 'block';
}

function eliminarEditarGaleriaFoto(index) {
    editarGaleriaFiles.splice(index, 1);
    actualizarEditarGaleriaPreview();
}

document.getElementById('editar-fotos')?.addEventListener('change', function(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    const espacioDisponible = 6 - editarGaleriaFiles.length;
    if (files.length > espacioDisponible) {
        alert(`Solo puedes agregar ${espacioDisponible} imagen(es) más. Límite: 6 imágenes`);
        e.target.value = '';
        return;
    }
    
    files.forEach(file => {
        if (editarGaleriaFiles.length < 6) {
            editarGaleriaFiles.push({ file: file });
        }
    });
    
    actualizarEditarGaleriaPreview();
    e.target.value = '';
});

window.eliminarEditarGaleriaFoto = eliminarEditarGaleriaFoto;

window.editarHabitacion = editarHabitacion;

// Inicializar galería vacía al cargar
document.addEventListener('DOMContentLoaded', function() {
    actualizarEditarGaleriaPreview();
});
