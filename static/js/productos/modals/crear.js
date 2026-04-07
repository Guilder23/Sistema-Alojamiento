// Modal Crear Producto

function toggleStockFields(tipo) {
    const stock = document.getElementById('crear-stock');
    const stockMinimo = document.getElementById('crear-stock-minimo');
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

document.getElementById('crear-tipo')?.addEventListener('change', function(e) {
    toggleStockFields(e.target.value);
});

async function crearProducto(formData) {
    try {
        const response = await fetch('/productos/api/productos/crear/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        if (response.ok && data.success) {
            mostrarExito('Producto creado');
            cerrarModal('modal-crear-producto');
            limpiarFormularioCrearProducto();
            cargarProductos();
        } else {
            mostrarError(data.error || 'Error al crear producto');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al crear producto');
    }
}

document.getElementById('form-crear-producto')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    limpiarErrores();

    const formData = {
        nombre: document.getElementById('crear-nombre').value.trim(),
        categoria_id: document.getElementById('crear-categoria').value,
        tipo: document.getElementById('crear-tipo').value,
        precio_venta: document.getElementById('crear-precio').value,
        codigo_sku: document.getElementById('crear-codigo').value.trim(),
        descripcion: document.getElementById('crear-descripcion').value.trim(),
        stock_actual: document.getElementById('crear-stock').value,
        stock_minimo: document.getElementById('crear-stock-minimo').value,
        activo: document.getElementById('crear-activo').checked
    };

    if (!formData.nombre) {
        mostrarErrorCampo('crear-nombre', 'Nombre es requerido');
        return;
    }
    if (!formData.categoria_id) {
        mostrarErrorCampo('crear-categoria', 'Categoria es requerida');
        return;
    }
    if (!formData.precio_venta || Number(formData.precio_venta) < 0) {
        mostrarErrorCampo('crear-precio', 'Precio invalido');
        return;
    }

    if (formData.tipo === 'servicio') {
        formData.stock_actual = 0;
        formData.stock_minimo = 0;
    }

    await crearProducto(formData);
});

function limpiarFormularioCrearProducto() {
    document.getElementById('form-crear-producto')?.reset();
    toggleStockFields('producto');
}

document.getElementById('close-modal-crear-producto')?.addEventListener('click', function() {
    cerrarModal('modal-crear-producto');
    limpiarFormularioCrearProducto();
});
