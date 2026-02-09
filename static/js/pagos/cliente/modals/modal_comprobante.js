/**
 * Modal Comprobante - JavaScript
 */

let comprobanteFile = null;

/**
 * Preview del comprobante
 */
function previewComprobante(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor selecciona una imagen'
        });
        return;
    }

    comprobanteFile = file;

    const reader = new FileReader();
    reader.onload = function(event) {
        const preview = document.getElementById('preview-comprobante');
        preview.src = event.target.result;
        document.getElementById('preview-container').style.display = 'block';
        document.getElementById('upload-area').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

/**
 * Cambiar comprobante
 */
function cambiarComprobante() {
    document.getElementById('comprobante-input').value = '';
    document.getElementById('preview-container').style.display = 'none';
    document.getElementById('upload-area').style.display = 'block';
    comprobanteFile = null;
}

// Drag and Drop
const uploadArea = document.getElementById('upload-area');

if (uploadArea) {
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const input = document.getElementById('comprobante-input');
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            input.files = dataTransfer.files;
            
            previewComprobante({ target: input });
        }
    });
}
