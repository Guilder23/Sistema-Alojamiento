/**
 * Modal Comprobante - Validación de preview
 * Las funciones principales se encuentran en mis_pagos.js
 */

document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('comprobante-input');
    
    // Conectar evento change del input
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            previewComprobante(e);
        });
    }
});

/**
 * Validar y previsualizar comprobante
 */
function previewComprobante(event) {
    const file = event.target.files[0];
    const previewContainer = document.getElementById('preview-container');
    const previewImage = document.getElementById('preview-image');
    const btnEnviar = document.getElementById('btn-enviar-comprobante');
    
    if (!file) {
        if (previewContainer) previewContainer.style.display = 'none';
        if (btnEnviar) btnEnviar.disabled = true;
        return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
        Swal.fire({
            icon: 'error',
            title: 'Formato no válido',
            text: 'Por favor selecciona una imagen válida (JPG, PNG, GIF)'
        });
        event.target.value = '';
        if (previewContainer) previewContainer.style.display = 'none';
        if (btnEnviar) btnEnviar.disabled = true;
        return;
    }

    // Validar tamaño
    if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
            icon: 'error',
            title: 'Archivo muy grande',
            text: 'El archivo no debe superar 5MB'
        });
        event.target.value = '';
        if (previewContainer) previewContainer.style.display = 'none';
        if (btnEnviar) btnEnviar.disabled = true;
        return;
    }

    // Mostrar preview
    const reader = new FileReader();
    reader.onload = function(e) {
        if (previewImage) previewImage.src = e.target.result;
        if (previewContainer) previewContainer.style.display = 'block';
        if (btnEnviar) btnEnviar.disabled = false;
    };
    reader.readAsDataURL(file);
}
