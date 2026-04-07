// Modal Editar Categoria

let categoriaEditando = null;

async function editarCategoria(categoriaId) {
    categoriaEditando = categoriasData.find(cat => cat.id === categoriaId);
    if (!categoriaEditando) {
        alert('Categoria no encontrada');
        return;
    }

    document.getElementById('editar-categoria-id').value = categoriaEditando.id;
    document.getElementById('editar-categoria-nombre').value = categoriaEditando.nombre;
    document.getElementById('editar-categoria-descripcion').value = categoriaEditando.descripcion || '';
    document.getElementById('editar-categoria-activo').checked = categoriaEditando.activo;

    abrirModal('modal-editar-categoria');
}

document.getElementById('form-editar-categoria')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = {
        nombre: document.getElementById('editar-categoria-nombre').value.trim(),
        descripcion: document.getElementById('editar-categoria-descripcion').value.trim(),
        activo: document.getElementById('editar-categoria-activo').checked
    };

    if (!formData.nombre) {
        alert('Nombre es requerido');
        return;
    }

    await actualizarCategoria(formData);
});

async function actualizarCategoria(formData) {
    try {
        const response = await fetch(`/productos/api/categorias/actualizar/${categoriaEditando.id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        if (response.ok && data.success) {
            alert('Categoria actualizada');
            cerrarModal('modal-editar-categoria');
            cargarCategorias();
        } else {
            alert(data.error || 'Error al actualizar categoria');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar categoria');
    }
}

document.getElementById('close-modal-editar-categoria')?.addEventListener('click', function() {
    cerrarModal('modal-editar-categoria');
});

window.editarCategoria = editarCategoria;
