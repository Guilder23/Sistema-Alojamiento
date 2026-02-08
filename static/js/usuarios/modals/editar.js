/* JavaScript para Modal Editar Usuario */

function editarUsuario(usuarioId) {
    const usuario = usuariosData.find(u => u.id === usuarioId);
    if (!usuario) return;
    
    usuarioSeleccionado = usuario;
    
    document.getElementById('editarUsuarioId').value = usuario.id;
    document.getElementById('editarUsername').value = usuario.username;
    document.getElementById('editarUsername').disabled = true;
    document.getElementById('editarEmail').value = usuario.email;
    document.getElementById('editarNombre').value = usuario.first_name;
    document.getElementById('editarApellido').value = usuario.last_name;
    document.getElementById('editarRol').value = usuario.rol || '';
    document.getElementById('editarActivo').checked = usuario.is_active;
    
    abrirModal('modalEditarUsuario');
}

function actualizarUsuario(e) {
    e.preventDefault();
    
    const form = document.getElementById('editarUsuarioForm');
    const formData = new FormData(form);
    const usuarioId = formData.get('usuario_id');
    
    const datos = {
        email: formData.get('email'),
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        rol: formData.get('rol'),
        is_active: formData.get('is_active') ? true : false
    };
    
    fetch(`/usuarios/api/${usuarioId}/actualizar/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify(datos)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            cerrarModal('modalEditarUsuario');
            cargarUsuarios();
            mostrarExito('Usuario actualizado exitosamente');
        } else {
            mostrarErrorForm('editarErrors', data.error || 'Error al actualizar usuario');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarErrorForm('editarErrors', 'Error al actualizar usuario');
    });
}

// Validación en tiempo real
document.addEventListener('DOMContentLoaded', function() {
    const emailInput = document.getElementById('editarEmail');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            if (this.value && !validarEmail(this.value)) {
                mostrarErrorForm('editarErrors', 'El correo no es válido');
            }
        });
    }
});

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}
