// Modal Editar Producto

let productoEditando = null;

async function editarProducto(productoId) {
    try {
        const response = await fetch(`/productos/api/productos/detalle/${productoId}/`);
        if (!response.ok) throw new Error('Error al cargar producto');

        const data = await response.json();
        if (data.success) {
            productoEditando = data.producto;
            cargarDatosProducto(productoEditando);
            abrirModal('modal-editar-producto');
        } else {
            mostrarError('No se pudo cargar el producto');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al cargar el producto');
    }
}

function cargarDatosProducto(producto) {
    document.getElementById('editar-id').value = producto.id;
    document.getElementById('editar-nombre').value = producto.nombre;
    document.getElementById('editar-categoria').value = producto.categoria_id;
    document.getElementById('editar-tipo').value = producto.tipo;
    document.getElementById('editar-precio').value = producto.precio_venta;
    document.getElementById('editar-codigo').value = producto.codigo_sku || '';
    document.getElementById('editar-descripcion').value = producto.descripcion || '';
    document.getElementById('editar-stock').value = producto.stock_actual;
    document.getElementById('editar-stock-minimo').value = producto.stock_minimo;
    document.getElementById('editar-activo').checked = producto.activo;

    toggleStockFieldsEditar(producto.tipo);
}

function toggleStockFieldsEditar(tipo) {
    const stock = document.getElementById('editar-stock');
    const stockMinimo = document.getElementById('editar-stock-minimo');
    if (tipo === 'servicio') {
        stock.value = 0;
        stockMinimo.value = 0;
        stock.disabled = true;
        stockMinimo.disabled = true;
    } else {
        stock.disabled = false;
        stockMinimo.disabled = false;
    }
}

document.getElementById('editar-tipo')?.addEventListener('change', function(e) {
    toggleStockFieldsEditar(e.target.value);
});

document.getElementById('form-editar-producto')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    limpiarErrores();

    const formData = {
        id: parseInt(document.getElementById('editar-id').value),
        nombre: document.getElementById('editar-nombre').value.trim(),
        categoria_id: document.getElementById('editar-categoria').value,
        tipo: document.getElementById('editar-tipo').value,
        precio_venta: document.getElementById('editar-precio').value,
        codigo_sku: document.getElementById('editar-codigo').value.trim(),
        descripcion: document.getElementById('editar-descripcion').value.trim(),
        stock_actual: document.getElementById('editar-stock').value,
        stock_minimo: document.getElementById('editar-stock-minimo').value,
        activo: document.getElementById('editar-activo').checked
    };

    if (!formData.nombre) {
        mostrarErrorCampo('editar-nombre', 'Nombre es requerido');
        return;
    }
    if (!formData.categoria_id) {
        mostrarErrorCampo('editar-categoria', 'Categoria es requerida');
        return;
    }
    if (!formData.precio_venta || Number(formData.precio_venta) < 0) {
        mostrarErrorCampo('editar-precio', 'Precio invalido');
        return;
    }

    if (formData.tipo === 'servicio') {
        formData.stock_actual = 0;
        formData.stock_minimo = 0;
    }

    await actualizarProducto(formData);
});

async function actualizarProducto(formData) {
    try {
        const response = await fetch(`/productos/api/productos/actualizar/${formData.id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        if (response.ok && data.success) {
            mostrarExito('Producto actualizado');
            cerrarModal('modal-editar-producto');
            cargarProductos();
        } else {
            mostrarError(data.error || 'Error al actualizar producto');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al actualizar producto');
    }
}

document.getElementById('close-modal-editar-producto')?.addEventListener('click', function() {
    cerrarModal('modal-editar-producto');
    productoEditando = null;
});

window.editarProducto = editarProducto;
