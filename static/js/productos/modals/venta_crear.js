// Modal Crear Venta

let itemsVenta = [];

function crearVentaModal() {
    cargarClientesSelect();
    limpiarItemsVenta();
    agregarItemVenta();
    actualizarTotalVenta();
    abrirModal('modal-crear-venta');
}

function cargarClientesSelect() {
    const select = document.getElementById('venta-cliente');
    if (!select) return;

    const opciones = (window.clientesVentaData || []).map(cliente =>
        `<option value="${cliente.id}">${cliente.nombre_completo} (${cliente.numero_documento})</option>`
    ).join('');

    select.innerHTML = '<option value="">Seleccionar cliente</option>' + opciones;
}

function agregarItemVenta() {
    const container = document.getElementById('items-venta');
    if (!container) return;

    const index = itemsVenta.length;
    const productos = (window.productosVentaData || []).map(producto =>
        `<option value="${producto.id}" data-precio="${producto.precio_venta}">${producto.nombre}</option>`
    ).join('');

    const row = document.createElement('div');
    row.className = 'item-row';
    row.dataset.index = index;
    row.innerHTML = `
        <select class="form-control item-producto">
            <option value="">Seleccionar producto</option>
            ${productos}
        </select>
        <input type="number" class="form-control item-cantidad" min="1" value="1">
        <button type="button" class="btn btn-danger btn-sm item-remove">
            <i class="fas fa-times"></i>
        </button>
    `;

    row.querySelector('.item-producto').addEventListener('change', actualizarTotalVenta);
    row.querySelector('.item-cantidad').addEventListener('input', actualizarTotalVenta);
    row.querySelector('.item-remove').addEventListener('click', function() {
        row.remove();
        actualizarTotalVenta();
    });

    container.appendChild(row);
    itemsVenta.push({});
}

function limpiarItemsVenta() {
    const container = document.getElementById('items-venta');
    if (container) {
        container.innerHTML = '';
    }
    itemsVenta = [];
}

function actualizarTotalVenta() {
    const rows = document.querySelectorAll('#items-venta .item-row');
    let total = 0;

    rows.forEach(row => {
        const select = row.querySelector('.item-producto');
        const cantidad = parseInt(row.querySelector('.item-cantidad').value || 0, 10);
        const precio = parseFloat(select.options[select.selectedIndex]?.dataset?.precio || 0);
        total += (precio * cantidad);
    });

    document.getElementById('venta-total').textContent = total.toFixed(2);
}

async function registrarVenta(formData) {
    try {
        const response = await fetch('/productos/api/ventas/crear/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        if (response.ok && data.success) {
            alert('Venta registrada');
            cerrarModal('modal-crear-venta');
            cargarVentas();
        } else {
            alert(data.error || 'Error al registrar venta');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al registrar venta');
    }
}

document.getElementById('btn-agregar-item')?.addEventListener('click', agregarItemVenta);

document.getElementById('form-crear-venta')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const clienteId = document.getElementById('venta-cliente').value;
    const metodo = document.getElementById('venta-metodo').value;

    const items = Array.from(document.querySelectorAll('#items-venta .item-row'))
        .map(row => {
            return {
                producto_id: row.querySelector('.item-producto').value,
                cantidad: row.querySelector('.item-cantidad').value
            };
        })
        .filter(item => item.producto_id && Number(item.cantidad) > 0);

    if (!clienteId) {
        alert('Seleccione un cliente');
        return;
    }
    if (items.length === 0) {
        alert('Agregue al menos un producto');
        return;
    }

    await registrarVenta({
        cliente_id: clienteId,
        metodo_pago: metodo,
        items: items
    });
});

document.getElementById('close-modal-crear-venta')?.addEventListener('click', function() {
    cerrarModal('modal-crear-venta');
});

window.crearVentaModal = crearVentaModal;
