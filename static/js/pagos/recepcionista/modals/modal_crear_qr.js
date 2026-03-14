/**
 * Modal Crear QR - JavaScript
 */

// Preview de imagen al crear
document.getElementById('imagen_qr_crear')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById('preview_img_crear').src = event.target.result;
            document.getElementById('preview_crear').style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        document.getElementById('preview_crear').style.display = 'none';
    }
});
