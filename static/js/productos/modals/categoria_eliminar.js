// Modal Eliminar Categoria

let categoriaEliminar = null;

function eliminarCategoria(categoriaId) {
    categoriaEliminar = categoriasData.find(cat => cat.id === categoriaId);
    if (!categoriaEliminar) {
        alert('Categoria no encontrada');
        return;
    }

    document.getElementById('eliminar-categoria-nombre').textContent = categoriaEliminar.nombre;
    abrirModal('modal-eliminar-categoria');
}

document.getElementById('btn-confirmar-eliminar-categoria')?.addEventListener('click', async function() {
    if (!categoriaEliminar) return;

    try {
        const response = await fetch(`/productos/api/categorias/eliminar/${categoriaEliminar.id}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            }
        });

        const data = await response.json();
        if (response.ok && data.success) {
            alert('Categoria desactivada');
            cerrarModal('modal-eliminar-categoria');
            categoriaEliminar = null;
            cargarCategorias();
        } else {
            alert(data.error || 'Error al desactivar categoria');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al desactivar categoria');
    }
});

document.getElementById('close-modal-eliminar-categoria')?.addEventListener('click', function() {
    cerrarModal('modal-eliminar-categoria');
    categoriaEliminar = null;
});

window.eliminarCategoria = eliminarCategoria;
