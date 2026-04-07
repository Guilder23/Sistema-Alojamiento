// Modal Eliminar Producto

let productoEliminar = null;

function eliminarProducto(productoId) {
    const producto = productosData.find(p => p.id === productoId);
    if (!producto) {
        mostrarError('Producto no encontrado');
        return;
    }

    productoEliminar = producto;
    document.getElementById('eliminar-nombre').textContent = producto.nombre;
    abrirModal('modal-eliminar-producto');
}

async function confirmarEliminarProducto() {
    if (!productoEliminar) return;

    try {
        const response = await fetch(`/productos/api/productos/eliminar/${productoEliminar.id}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            }
        });

        const data = await response.json();
        if (response.ok && data.success) {
            mostrarExito('Producto desactivado');
            cerrarModal('modal-eliminar-producto');
            productoEliminar = null;
            cargarProductos();
        } else {
            mostrarError(data.error || 'Error al desactivar producto');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al desactivar producto');
    }
}

document.getElementById('btn-confirmar-eliminar-producto')?.addEventListener('click', confirmarEliminarProducto);

document.getElementById('close-modal-eliminar-producto')?.addEventListener('click', function() {
    cerrarModal('modal-eliminar-producto');
    productoEliminar = null;
});

window.eliminarProducto = eliminarProducto;
