/* JavaScript para Modal Crear Usuario */

function guardarUsuario(e) {
    e.preventDefault();
    
    const form = document.getElementById('crearUsuarioForm');
    const formData = new FormData(form);
    
    // Validar contraseñas coincidan
    if (formData.get('password') !== formData.get('password2')) {
        mostrarErrorForm('crearErrors', 'Las contraseñas no coinciden');
        return;
    }
    
    // Validar longitud de contraseña
    if (formData.get('password').length < 8) {
        mostrarErrorForm('crearErrors', 'La contraseña debe tener al menos 8 caracteres');
        return;
    }
    
    const datos = {
        username: formData.get('username'),
        email: formData.get('email'),
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        password: formData.get('password'),
        rol: formData.get('rol'),
        is_active: formData.get('is_active') ? true : false
    };
    
    fetch('/usuarios/api/crear/', {
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
            cerrarModal('modalCrearUsuario');
            form.reset();
            cargarUsuarios();
            mostrarExito('Usuario creado exitosamente');
        } else {
            mostrarErrorForm('crearErrors', data.error || 'Error al crear usuario');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarErrorForm('crearErrors', 'Error al crear usuario');
    });
}

// Setup de validación en tiempo real
document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('crearPassword');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const strength = calcularFortalezaContraseña(this.value);
            mostrarFortalezaContraseña(strength);
        });
    }
    
    const passwordConfirm = document.getElementById('crearPassword2');
    if (passwordConfirm) {
        passwordConfirm.addEventListener('change', function() {
            const password = document.getElementById('crearPassword').value;
            if (password !== this.value && this.value) {
                mostrarErrorForm('crearErrors', 'Las contraseñas no coinciden');
            }
        });
    }
});

function calcularFortalezaContraseña(password) {
    let fortaleza = 0;
    if (password.length >= 8) fortaleza++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) fortaleza++;
    if (password.match(/[0-9]/)) fortaleza++;
    if (password.match(/[^a-zA-Z0-9]/)) fortaleza++;
    return fortaleza;
}

function mostrarFortalezaContraseña(fortaleza) {
    const labels = ['Muy débil', 'Débil', 'Media', 'Fuerte', 'Muy fuerte'];
    console.log('Fortaleza de contraseña:', labels[fortaleza - 1] || 'Invalid');
}
