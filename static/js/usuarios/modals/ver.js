// Modal Ver Usuario

async function verUsuario(usuarioId) {
    try {
        const response = await fetch(`/usuarios/api/detalle/${usuarioId}/`);
        if (!response.ok) throw new Error('Error al cargar usuario');

        const data = await response.json();
        if (data.success) {
            mostrarDetallesUsuario(data.usuario);
            abrirModal('modal-ver-usuario');
        } else {
            mostrarError('No se pudo cargar la información del usuario');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al cargar los detalles del usuario');
    }
}

function mostrarDetallesUsuario(usuario) {
    document.getElementById('ver-id').textContent = usuario.id || '-';
    document.getElementById('ver-username').textContent = usuario.username || '-';
    document.getElementById('ver-email').textContent = usuario.email || '-';
    document.getElementById('ver-rol').innerHTML = `<span class="badge badge-${usuario.rol}">${formatearRol(usuario.rol)}</span>`;
    document.getElementById('ver-estado').innerHTML = `<span class="badge badge-${usuario.is_active ? 'activo' : 'inactivo'}">${usuario.is_active ? 'Activo' : 'Inactivo'}</span>`;
    document.getElementById('ver-fecha-registro').textContent = formatearFecha(usuario.date_joined) || '-';
    document.getElementById('ver-ultimo-acceso').textContent = usuario.last_login ? formatearFecha(usuario.last_login) : 'Nunca';
}

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

// Cerrar modal
document.getElementById('close-modal-ver')?.addEventListener('click', function() {
    cerrarModal('modal-ver-usuario');
});

// Exponer función globalmente
window.verUsuario = verUsuario;
