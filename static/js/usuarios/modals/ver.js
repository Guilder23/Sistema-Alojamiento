/* JavaScript para Modal Ver Usuario */

function verUsuario(usuarioId) {
    const usuario = usuariosData.find(u => u.id === usuarioId);
    if (!usuario) return;
    
    usuarioSeleccionado = usuario;
    
    const contenido = document.getElementById('verUsuarioContenido');
    contenido.innerHTML = `
        <div class="usuario-info-card">
            <div class="info-item">
                <label><i class="fas fa-user"></i> Usuario</label>
                <p>${usuario.username}</p>
            </div>
            <div class="info-item">
                <label><i class="fas fa-envelope"></i> Correo</label>
                <p>${usuario.email}</p>
            </div>
            <div class="info-item">
                <label><i class="fas fa-address-card"></i> Nombre</label>
                <p>${usuario.first_name}</p>
            </div>
            <div class="info-item">
                <label><i class="fas fa-address-card"></i> Apellido</label>
                <p>${usuario.last_name}</p>
            </div>
            <div class="info-item">
                <label><i class="fas fa-briefcase"></i> Rol</label>
                <p><span class="badge badge-rol">${usuario.rol || 'Sin asignar'}</span></p>
            </div>
            <div class="info-item">
                <label><i class="fas fa-toggle-on"></i> Estado</label>
                <p>${usuario.is_active ? 
                    '<span class="badge badge-success">Activo</span>' : 
                    '<span class="badge badge-danger">Inactivo</span>'}</p>
            </div>
            <div class="info-item">
                <label><i class="fas fa-check-double"></i> Correo Verificado</label>
                <p>${usuario.email_verified ? 'Sí' : 'No'}</p>
            </div>
            <div class="info-item">
                <label><i class="fas fa-calendar"></i> Fecha de Registro</label>
                <p>${new Date(usuario.date_joined).toLocaleDateString('es-ES')}</p>
            </div>
        </div>
    `;
    
    abrirModal('modalVerUsuario');
}

function abrirEditarUsuario() {
    if (usuarioSeleccionado) {
        cerrarModal('modalVerUsuario');
        editarUsuario(usuarioSeleccionado.id);
    }
}

// Animaciones de entrada
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('modalVerUsuario');
    if (modal) {
        modal.addEventListener('show.bs.modal', function() {
            const infoItems = document.querySelectorAll('.info-item');
            infoItems.forEach((item, index) => {
                item.style.animationDelay = `${index * 0.05}s`;
            });
        });
    }
});
