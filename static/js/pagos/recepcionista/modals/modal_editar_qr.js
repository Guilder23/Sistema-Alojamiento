/**
 * Modal Editar QR - JavaScript
 */

// Preview de imagen al editar
document.getElementById('imagen_qr_editar')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById('preview_img_editar').src = event.target.result;
            document.getElementById('preview_editar').style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        document.getElementById('preview_editar').style.display = 'none';
    }
});
