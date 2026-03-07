// Mapa de Habitaciones - Vista Edificio

// Estado global
let habitaciones = [];

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    cargarHabitaciones();
});

// Cargar habitaciones desde la API
async function cargarHabitaciones() {
    try {
        const response = await fetch('/habitaciones/api/lista/');
        
        if (!response.ok) {
            throw new Error('Error al cargar habitaciones');
        }

        const data = await response.json();
        habitaciones = data.habitaciones || [];
        
        renderizarEdificio();
    } catch (error) {
        console.error('Error:', error);
        mostrarError('No se pudieron cargar las habitaciones');
    }
}

// Renderizar edificio completo
function renderizarEdificio() {
    const container = document.getElementById('edificio-container');
    
    if (habitaciones.length === 0) {
        container.innerHTML = `
            <div class="sin-habitaciones">
                <i class="fas fa-building"></i>
                <h3>No hay habitaciones registradas</h3>
                <p>Agrega habitaciones para visualizarlas en el mapa</p>
            </div>
        `;
        return;
    }

    // Agrupar habitaciones por piso
    const habitacionesPorPiso = agruparPorPiso(habitaciones);
    
    // Ordenar pisos de mayor a menor (edificio invertido)
    const pisosOrdenados = Object.keys(habitacionesPorPiso)
        .map(Number)
        .sort((a, b) => b - a);

    // Generar HTML
    let html = '';
    pisosOrdenados.forEach(numeroPiso => {
        const habitacionesPiso = habitacionesPorPiso[numeroPiso];
        html += generarHTMLPiso(numeroPiso, habitacionesPiso);
    });

    container.innerHTML = html;
    
    // Aplicar animación de entrada
    setTimeout(() => {
        const pisos = container.querySelectorAll('.piso');
        pisos.forEach((piso, index) => {
            setTimeout(() => {
                piso.style.animation = 'fadeInUp 0.5s ease forwards';
            }, index * 100);
        });
    }, 50);
}

// Agrupar habitaciones por piso (primer dígito del número)
function agruparPorPiso(habitaciones) {
    const pisos = {};
    
    habitaciones.forEach(habitacion => {
        // Extraer el piso del número de habitación
        const numero = habitacion.numero.toString();
        let piso = 1; // Por defecto piso 1
        
        if (numero.length >= 2) {
            piso = parseInt(numero.charAt(0));
        }
        
        if (!pisos[piso]) {
            pisos[piso] = [];
        }
        
        pisos[piso].push(habitacion);
    });
    
    return pisos;
}

// Generar HTML para un piso
function generarHTMLPiso(numeroPiso, habitaciones) {
    // Calcular estadísticas del piso
    const stats = calcularEstadisticasPiso(habitaciones);
    
    return `
        <div class="piso">
            <div class="piso-header">
                <div class="piso-titulo">
                    <div class="piso-numero">
                        ${numeroPiso}
                    </div>
                    <div class="piso-info">
                        <h3>Piso ${numeroPiso}</h3>
                        <p>${habitaciones.length} habitación${habitaciones.length !== 1 ? 'es' : ''}</p>
                    </div>
                </div>
                <div class="piso-stats">
                    <div class="piso-stat">
                        <i class="fas fa-check-circle"></i>
                        <span>${stats.disponibles} disponible${stats.disponibles !== 1 ? 's' : ''}</span>
                    </div>
                    <div class="piso-stat">
                        <i class="fas fa-user"></i>
                        <span>${stats.ocupadas} ocupada${stats.ocupadas !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            </div>
            <div class="habitaciones-grid">
                ${habitaciones.map(h => generarHTMLHabitacion(h)).join('')}
            </div>
        </div>
    `;
}

// Calcular estadísticas de un piso
function calcularEstadisticasPiso(habitaciones) {
    return {
        disponibles: habitaciones.filter(h => h.estado === 'disponible').length,
        ocupadas: habitaciones.filter(h => h.estado === 'ocupada').length,
        limpieza: habitaciones.filter(h => h.estado === 'limpieza').length,
        mantenimiento: habitaciones.filter(h => h.estado === 'mantenimiento').length,
        fuera_servicio: habitaciones.filter(h => h.estado === 'fuera_servicio').length
    };
}

// Generar HTML para una habitación
function generarHTMLHabitacion(habitacion) {
    const estadoTexto = obtenerTextoEstado(habitacion.estado);
    const tipoTexto = obtenerTextoTipo(habitacion.tipo);
    
    return `
        <div class="habitacion-card ${habitacion.estado}" onclick="verDetalleHabitacion(${habitacion.id})">
            <div class="habitacion-numero">
                <i class="fas fa-door-closed"></i>
                ${habitacion.numero}
            </div>
            <div class="habitacion-tipo">
                ${tipoTexto}
            </div>
            <div class="habitacion-estado ${habitacion.estado}">
                <i class="fas ${obtenerIconoEstado(habitacion.estado)}"></i>
                ${estadoTexto}
            </div>
            <div class="habitacion-info">
                <div class="habitacion-info-item">
                    <i class="fas fa-users"></i>
                    <span>${habitacion.capacidad} persona${habitacion.capacidad !== 1 ? 's' : ''}</span>
                </div>
                ${habitacion.bano ? `
                    <div class="habitacion-info-item">
                        <i class="fas fa-bath"></i>
                        <span>${obtenerTextoBano(habitacion.bano)}</span>
                    </div>
                ` : ''}
            </div>
            ${habitacion.precio_noche ? `
                <div class="habitacion-precio">
                    $${parseFloat(habitacion.precio_noche).toFixed(2)}
                </div>
            ` : ''}
        </div>
    `;
}

// Obtener texto del estado
function obtenerTextoEstado(estado) {
    const textos = {
        'disponible': 'Disponible',
        'ocupada': 'Ocupada',
        'limpieza': 'Limpieza',
        'mantenimiento': 'Mantenimiento',
        'fuera_servicio': 'Fuera de Servicio'
    };
    return textos[estado] || estado;
}

// Obtener icono del estado
function obtenerIconoEstado(estado) {
    const iconos = {
        'disponible': 'fa-check-circle',
        'ocupada': 'fa-user',
        'limpieza': 'fa-broom',
        'mantenimiento': 'fa-wrench',
        'fuera_servicio': 'fa-ban'
    };
    return iconos[estado] || 'fa-circle';
}

// Obtener texto del tipo
function obtenerTextoTipo(tipo) {
    const textos = {
        'simple': 'Simple',
        'doble': 'Doble',
        'triple': 'Triple',
        'suite': 'Suite',
        'deluxe': 'Deluxe',
        'presidencial': 'Presidencial'
    };
    return textos[tipo] || tipo;
}

// Obtener texto del baño
function obtenerTextoBano(bano) {
    const textos = {
        'privado': 'Baño privado',
        'compartido': 'Baño compartido',
        'sin_bano': 'Sin baño'
    };
    return textos[bano] || bano;
}

// Ver detalle de habitación (abrir modal o redirigir)
function verDetalleHabitacion(habitacionId) {
    // Por ahora redirigir a la vista de tabla
    window.location.href = '/habitaciones/';
}

// Mostrar mensaje de error
function mostrarError(mensaje) {
    const container = document.getElementById('edificio-container');
    container.innerHTML = `
        <div class="sin-habitaciones">
            <i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i>
            <h3>Error</h3>
            <p>${mensaje}</p>
        </div>
    `;
}
