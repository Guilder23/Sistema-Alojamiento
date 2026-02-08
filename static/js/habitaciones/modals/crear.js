// Modal Crear Habitación

async function crearHabitacion(formData) {
    try {
        const body = new FormData();
        Object.entries(formData).forEach(([k, v]) => {
            if (v !== undefined && v !== null) body.append(k, String(v));
        });

        // Agregar imágenes de la galería
        crearGaleriaFiles.forEach(item => {
            if (item.file) {
                body.append('fotos', item.file);
            }
        });

        const principalInput = document.getElementById('crear-foto-principal');
        if (principalInput?.files?.[0]) {
            body.append('foto', principalInput.files[0]);
        }

        const response = await fetch('/habitaciones/api/crear/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken
            },
            body
        });

        const data = await response.json();
        if (response.ok && data.success) {
            alert('Habitación creada exitosamente');
            cerrarModalHabitaciones('modal-crear-habitacion');
            document.getElementById('form-crear-habitacion')?.reset();
            limpiarPreviewCrearFoto();
            cargarHabitaciones();
        } else {
            console.error('Error del servidor:', data);
            if (data.traceback) {
                console.error('Traceback:', data.traceback);
            }
            alert(data.error || 'Error al crear la habitación');
        }
    } catch (e) {
        console.error('Error en crearHabitacion:', e);
        alert('Error al crear la habitación: ' + e.message);
    }
}

document.getElementById('form-crear-habitacion')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = {
        numero: document.getElementById('crear-numero').value.trim(),
        nombre: document.getElementById('crear-nombre').value.trim(),
        tipo: document.getElementById('crear-tipo').value,
        capacidad: parseInt(document.getElementById('crear-capacidad').value, 10),
        piso: parseInt(document.getElementById('crear-piso').value, 10),
        precio_noche: parseFloat(document.getElementById('crear-precio').value),
        precio_fin_semana: document.getElementById('crear-precio-fin').value.trim(),
        estado: document.getElementById('crear-estado').value,
        tipo_bano: document.getElementById('crear-tipo-bano').value,
        bano_privado: document.getElementById('crear-bano-privado').checked,
        vista: document.getElementById('crear-vista').value,
        youtube_url: document.getElementById('crear-youtube').value.trim(),
        descripcion: document.getElementById('crear-descripcion').value.trim(),

        numero_camas: parseInt(document.getElementById('crear-numero-camas').value, 10),
        tipo_cama: document.getElementById('crear-tipo-cama').value,

        reserva_min_noches: parseInt(document.getElementById('crear-min-noches').value, 10),
        reserva_max_noches: parseInt(document.getElementById('crear-max-noches').value, 10),
        permite_mascotas: document.getElementById('crear-mascotas').checked,
        permite_fumar: document.getElementById('crear-fumar').checked,

        tv: document.getElementById('crear-tv').checked,
        internet: document.getElementById('crear-internet').checked,
        acceso_youtube: document.getElementById('crear-acceso-youtube').checked,
        aire_acondicionado: document.getElementById('crear-aire').checked,
        calefaccion: document.getElementById('crear-calefaccion').checked,
        minibar: document.getElementById('crear-minibar').checked,
        caja_fuerte: document.getElementById('crear-caja').checked,
        escritorio: document.getElementById('crear-escritorio').checked,
        armario: document.getElementById('crear-armario').checked,
        agua_caliente: document.getElementById('crear-agua').checked,
        toallas: document.getElementById('crear-toallas').checked,
        papel_higienico: document.getElementById('crear-papel').checked,
        shampoo: document.getElementById('crear-shampoo').checked,
        secador_cabello: document.getElementById('crear-secador').checked,
    };

    // Validación básica
    if (!formData.numero) {
        alert('El número de habitación es requerido');
        return;
    }
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

    await crearHabitacion(formData);
});

document.getElementById('close-modal-crear-habitacion')?.addEventListener('click', function() {
    cerrarModalHabitaciones('modal-crear-habitacion');
    document.getElementById('form-crear-habitacion')?.reset();
    limpiarPreviewCrearFoto();
});

// Inicializar galería vacía al cargar
document.addEventListener('DOMContentLoaded', function() {
    actualizarCrearGaleriaPreview();
});

function limpiarPreviewCrearFoto() {
    // Limpiar galería
    crearGaleriaFiles = [];
    actualizarCrearGaleriaPreview();
    
    const input = document.getElementById('crear-fotos');
    if (input) input.value = '';

    // Limpiar foto principal
    const principalPreview = document.getElementById('crear-foto-principal-preview');
    const principalImg = document.getElementById('crear-foto-principal-preview-img');
    if (principalPreview) principalPreview.style.display = 'none';
    if (principalImg) principalImg.src = '';
    const principalInput = document.getElementById('crear-foto-principal');
    if (principalInput) principalInput.value = '';
}

document.getElementById('crear-foto-principal')?.addEventListener('change', function(e) {
    const file = e.target.files?.[0];
    const container = document.getElementById('crear-foto-principal-preview');
    const img = document.getElementById('crear-foto-principal-preview-img');
    if (!container || !img) return;
    if (!file) {
        container.style.display = 'none';
        img.src = '';
        return;
    }
    img.src = URL.createObjectURL(file);
    container.style.display = '';
});

// Sistema de galería de imágenes para crear
let crearGaleriaFiles = [];

function actualizarCrearGaleriaPreview() {
    const container = document.getElementById('crear-fotos-preview');
    const contador = document.getElementById('crear-contador-fotos');
    const btnAgregar = document.getElementById('btn-agregar-crear-foto');
    
    if (!container) return;
    
    if (crearGaleriaFiles.length === 0) {
        container.innerHTML = '<div class="galeria-vacia"><i class="fas fa-images"></i><p>Sin imágenes</p></div>';
    } else {
        container.innerHTML = crearGaleriaFiles.map((f, index) => {
            const url = f.url || URL.createObjectURL(f.file);
            return `
                <div class="foto-thumb" data-index="${index}">
                    <img src="${url}" alt="${f.file ? f.file.name : 'Imagen'}">
                    <button type="button" class="btn-eliminar-foto" onclick="eliminarCrearGaleriaFoto(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        }).join('');
    }
    
    if (contador) contador.textContent = crearGaleriaFiles.length;
    if (btnAgregar) btnAgregar.style.display = crearGaleriaFiles.length >= 6 ? 'none' : 'block';
}

function eliminarCrearGaleriaFoto(index) {
    crearGaleriaFiles.splice(index, 1);
    actualizarCrearGaleriaPreview();
}

document.getElementById('crear-fotos')?.addEventListener('change', function(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    const espacioDisponible = 6 - crearGaleriaFiles.length;
    if (files.length > espacioDisponible) {
        alert(`Solo puedes agregar ${espacioDisponible} imagen(es) más. Límite: 6 imágenes`);
        e.target.value = '';
        return;
    }
    
    files.forEach(file => {
        if (crearGaleriaFiles.length < 6) {
            crearGaleriaFiles.push({ file: file });
        }
    });
    
    actualizarCrearGaleriaPreview();
    e.target.value = '';
});

window.eliminarCrearGaleriaFoto = eliminarCrearGaleriaFoto;
