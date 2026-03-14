// Modal Eliminar Usuario

let usuarioEliminar = null;

function eliminarUsuario(usuarioId) {
    // Buscar el usuario en los datos
    const usuario = usuariosData.find(u => u.id === usuarioId);
    
    if (!usuario) {
        mostrarError('Usuario no encontrado');
        return;
    }

    usuarioEliminar = usuario;
    
    // Mostrar información en el modal
    document.getElementById('eliminar-username').textContent = usuario.username;
    
    // Abrir modal
    abrirModal('modal-eliminar-usuario');
}

// Confirmar eliminación
document.getElementById('btn-confirmar-eliminar')?.addEventListener('click', async function() {
    if (!usuarioEliminar) return;

    try {
        const response = await fetch(`/usuarios/api/eliminar/${usuarioEliminar.id}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            }
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
            mostrarExito('Usuario eliminado exitosamente');
            cerrarModal('modal-eliminar-usuario');
            usuarioEliminar = null;
            cargarUsuarios();
        } else {
            mostrarError(data.error || data.message || 'Error al eliminar el usuario');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al eliminar el usuario');
    }
});

// Cancelar eliminación
document.getElementById('btn-cancelar-eliminar')?.addEventListener('click', function() {
    cerrarModal('modal-eliminar-usuario');
    usuarioEliminar = null;
});

// Cerrar modal
document.getElementById('close-modal-eliminar')?.addEventListener('click', function() {
    cerrarModal('modal-eliminar-usuario');
    usuarioEliminar = null;
});

// Exponer función globalmente
window.eliminarUsuario = eliminarUsuario;
