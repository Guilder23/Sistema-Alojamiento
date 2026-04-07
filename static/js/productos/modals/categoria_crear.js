// Modal Crear Categoria

async function crearCategoria(formData) {
    try {
        const response = await fetch('/productos/api/categorias/crear/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        if (response.ok && data.success) {
            alert('Categoria creada');
            cerrarModal('modal-crear-categoria');
            limpiarFormularioCrearCategoria();
            cargarCategorias();
        } else {
            alert(data.error || 'Error al crear categoria');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al crear categoria');
    }
}

document.getElementById('form-crear-categoria')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = {
        nombre: document.getElementById('crear-categoria-nombre').value.trim(),
        descripcion: document.getElementById('crear-categoria-descripcion').value.trim(),
        activo: document.getElementById('crear-categoria-activo').checked
    };

    if (!formData.nombre) {
        alert('Nombre es requerido');
        return;
    }

    await crearCategoria(formData);
});

function limpiarFormularioCrearCategoria() {
    document.getElementById('form-crear-categoria')?.reset();
}

document.getElementById('close-modal-crear-categoria')?.addEventListener('click', function() {
    cerrarModal('modal-crear-categoria');
    limpiarFormularioCrearCategoria();
});
