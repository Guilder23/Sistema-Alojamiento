// Modal Eliminar Habitación

let habitacionEliminar = null;

function eliminarHabitacion(habitacionId) {
    const h = habitacionesData.find(x => x.id === habitacionId);
    if (!h) {
        alert('Habitación no encontrada');
        return;
    }

    habitacionEliminar = h;
    document.getElementById('eliminar-numero').textContent = `Habitación ${h.numero}`;
    abrirModalHabitaciones('modal-eliminar-habitacion');
}

document.getElementById('btn-confirmar-eliminar-habitacion')?.addEventListener('click', async function() {
    if (!habitacionEliminar) return;

    try {
        const response = await fetch(`/habitaciones/api/eliminar/${habitacionEliminar.id}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            }
        });

        const data = await response.json();
        if (response.ok && data.success) {
            alert('Habitación eliminada exitosamente');
            cerrarModalHabitaciones('modal-eliminar-habitacion');
            habitacionEliminar = null;
            cargarHabitaciones();
        } else {
            alert(data.error || data.message || 'Error al eliminar la habitación');
        }
    } catch (e) {
        console.error(e);
        alert('Error al eliminar la habitación');
    }
});

document.getElementById('btn-cancelar-eliminar-habitacion')?.addEventListener('click', function() {
    cerrarModalHabitaciones('modal-eliminar-habitacion');
    habitacionEliminar = null;
});

document.getElementById('close-modal-eliminar-habitacion')?.addEventListener('click', function() {
    cerrarModalHabitaciones('modal-eliminar-habitacion');
    habitacionEliminar = null;
});

window.eliminarHabitacion = eliminarHabitacion;
