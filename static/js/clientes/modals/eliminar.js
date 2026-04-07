// Modal Eliminar Cliente

let clienteEliminar = null;

function eliminarCliente(clienteId) {
    const cliente = clientesData.find(c => c.id === clienteId);

    if (!cliente) {
        mostrarError('Cliente no encontrado');
        return;
    }

    clienteEliminar = cliente;
    document.getElementById('eliminar-nombre').textContent = cliente.nombre_completo || `${cliente.nombre} ${cliente.apellido}`;
    abrirModal('modal-eliminar-cliente');
}

document.getElementById('btn-confirmar-eliminar')?.addEventListener('click', async function() {
    if (!clienteEliminar) return;

    try {
        const response = await fetch(`/clientes/api/eliminar/${clienteEliminar.id}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            mostrarExito('Cliente eliminado exitosamente');
            cerrarModal('modal-eliminar-cliente');
            clienteEliminar = null;
            cargarClientes();
        } else {
            mostrarError(data.error || data.message || 'Error al eliminar el cliente');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al eliminar el cliente');
    }
});

document.getElementById('btn-cancelar-eliminar')?.addEventListener('click', function() {
    cerrarModal('modal-eliminar-cliente');
    clienteEliminar = null;
});

document.getElementById('close-modal-eliminar')?.addEventListener('click', function() {
    cerrarModal('modal-eliminar-cliente');
    clienteEliminar = null;
});

window.eliminarCliente = eliminarCliente;
