// Modal Ver Producto

async function verProducto(productoId) {
    try {
        const response = await fetch(`/productos/api/productos/detalle/${productoId}/`);
        if (!response.ok) throw new Error('Error al cargar producto');

        const data = await response.json();
        if (data.success) {
            const producto = data.producto;
            document.getElementById('ver-nombre').textContent = producto.nombre;
            document.getElementById('ver-categoria').textContent = producto.categoria_nombre;
            document.getElementById('ver-tipo').textContent = producto.tipo;
            document.getElementById('ver-precio').textContent = `$${producto.precio_venta}`;
            document.getElementById('ver-stock').textContent = producto.maneja_stock ? producto.stock_actual : '-';
            document.getElementById('ver-estado').textContent = producto.activo ? 'Activo' : 'Inactivo';
            document.getElementById('ver-descripcion').textContent = producto.descripcion || '-';
            abrirModal('modal-ver-producto');
        } else {
            mostrarError('No se pudo cargar el producto');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al cargar el producto');
    }
}

document.getElementById('close-modal-ver-producto')?.addEventListener('click', function() {
    cerrarModal('modal-ver-producto');
});

window.verProducto = verProducto;
