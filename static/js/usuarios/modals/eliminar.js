/* JavaScript para Modal Eliminar Usuario */

function confirmarEliminar(usuarioId) {
    const usuario = usuariosData.find(u => u.id === usuarioId);
    if (!usuario) return;
    
    usuarioSeleccionado = usuario;
    
    document.getElementById('eliminarUsuarioId').value = usuario.id;
    document.getElementById('eliminarUsuarioNombre').textContent = usuario.username;
    
    abrirModal('modalEliminarUsuario');
}

function eliminarUsuario(e) {
    e.preventDefault();
    
    const usuarioId = document.getElementById('eliminarUsuarioId').value;
    const usuarioNombre = document.getElementById('eliminarUsuarioNombre').textContent;
    
    // Confirmación adicional
    if (!confirm(`¿Estás completamente seguro de que deseas eliminar a ${usuarioNombre}? Esta acción no se puede deshacer.`)) {
        return;
    }
    
    // Cambiar texto del botón
    const btnEliminar = document.querySelector('#modalEliminarUsuario .btn-danger');
    if (btnEliminar) {
        btnEliminar.disabled = true;
        btnEliminar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Eliminando...';
    }
    
    fetch(`/usuarios/api/${usuarioId}/eliminar/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCsrfToken()
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            cerrarModal('modalEliminarUsuario');
            cargarUsuarios();
            mostrarExito('Usuario eliminado exitosamente');
        } else {
            mostrarError(data.error || 'Error al eliminar usuario');
            if (btnEliminar) {
                btnEliminar.disabled = false;
                btnEliminar.innerHTML = '<i class="fas fa-trash"></i> Eliminar Usuario';
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarError('Error al eliminar usuario');
        if (btnEliminar) {
            btnEliminar.disabled = false;
            btnEliminar.innerHTML = '<i class="fas fa-trash"></i> Eliminar Usuario';
        }
    });
}

// Prevenir eliminación accidental con Escape
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('keydown', function(e) {
        const modal = document.getElementById('modalEliminarUsuario');
        if (e.key === 'Escape' && modal && modal.style.display !== 'none') {
            // No cerrar con Escape en el modal de eliminar
            e.preventDefault();
        }
    });
});
