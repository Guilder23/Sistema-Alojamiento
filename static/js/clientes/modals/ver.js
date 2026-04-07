// Modal Ver Cliente

function formatearFecha(fechaStr) {
    if (!fechaStr) return '-';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

async function verCliente(clienteId) {
    try {
        const response = await fetch(`/clientes/api/detalle/${clienteId}/`);
        if (!response.ok) throw new Error('Error al cargar cliente');

        const data = await response.json();
        if (data.success) {
            mostrarDetallesCliente(data.cliente);
            abrirModal('modal-ver-cliente');
        } else {
            mostrarError('No se pudo cargar la informacion del cliente');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al cargar los detalles del cliente');
    }
}

function mostrarDetallesCliente(cliente) {
    document.getElementById('ver-id').textContent = cliente.id || '-';
    document.getElementById('ver-nombre-completo').textContent = cliente.nombre_completo || '-';
    document.getElementById('ver-documento').textContent = `${cliente.tipo_documento_label} ${cliente.numero_documento}`;
    document.getElementById('ver-telefono').textContent = cliente.telefono || '-';
    document.getElementById('ver-email').textContent = cliente.email || '-';
    document.getElementById('ver-pais').textContent = cliente.pais_label || '-';
    document.getElementById('ver-ciudad').textContent = cliente.ciudad || '-';
    document.getElementById('ver-direccion').textContent = cliente.direccion || '-';
    document.getElementById('ver-estado').innerHTML = `<span class="badge badge-${cliente.activo ? 'activo' : 'inactivo'}">${cliente.activo ? 'Activo' : 'Inactivo'}</span>`;
    document.getElementById('ver-fecha-registro').textContent = formatearFecha(cliente.creado) || '-';
    document.getElementById('ver-actualizado').textContent = formatearFecha(cliente.actualizado) || '-';
}

document.getElementById('close-modal-ver')?.addEventListener('click', function() {
    cerrarModal('modal-ver-cliente');
});

window.verCliente = verCliente;
