// Modal Ver Venta

async function verVenta(ventaId) {
    try {
        const response = await fetch(`/productos/api/ventas/detalle/${ventaId}/`);
        if (!response.ok) throw new Error('Error al cargar venta');

        const data = await response.json();
        if (data.success) {
            const venta = data.venta;
            document.getElementById('ver-venta-cliente').textContent = venta.cliente;
            document.getElementById('ver-venta-metodo').textContent = venta.metodo_pago;
            document.getElementById('ver-venta-estado').textContent = venta.estado;
            document.getElementById('ver-venta-total').textContent = `$${venta.total}`;

            const detalles = document.getElementById('ver-venta-detalles');
            detalles.innerHTML = venta.detalles.map(item => `
                <div class="venta-detalle-item">
                    <span>${item.producto} x${item.cantidad}</span>
                    <strong>$${item.subtotal}</strong>
                </div>
            `).join('');

            abrirModal('modal-ver-venta');
        } else {
            alert('No se pudo cargar la venta');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar venta');
    }
}

document.getElementById('close-modal-ver-venta')?.addEventListener('click', function() {
    cerrarModal('modal-ver-venta');
});

window.verVenta = verVenta;
