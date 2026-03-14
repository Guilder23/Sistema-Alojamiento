/**
 * =============================================
 * SIDEBAR DESDE CERO
 * =============================================
 * Desktop: Botón colapsar dentro del sidebar
 * Móvil: Hamburguesa en navbar (manejado por navbar.js)
 */

document.addEventListener('DOMContentLoaded', function() {
    // ==========================================
    // ELEMENTOS DEL DOM
    // ==========================================
    
    const sidebar = document.getElementById('sidebar');
    const collapseBtn = document.getElementById('sidebarCollapseBtn');
    const mainContent = document.querySelector('.main-content');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    
    // Validación con logs detallados
    console.log('🔍 Sidebar element:', sidebar);
    console.log('🔍 Collapse button:', collapseBtn);
    console.log('🔍 Main content:', mainContent);
    console.log('🔍 Clases actuales del sidebar:', sidebar ? sidebar.className : 'N/A');
    console.log('🔍 localStorage sidebarCollapsed:', localStorage.getItem('sidebarCollapsed'));
    
    if (!sidebar) {
        console.error('❌ Sidebar no encontrado');
        return;
    }
    
    if (!collapseBtn) {
        console.error('❌ Botón colapsar no encontrado');
        console.log('🔍 Buscando botones en el DOM:', document.querySelectorAll('button'));
        return;
    }
    
    if (!mainContent) {
        console.warn('⚠️ Main content no encontrado - ajustes de margen no funcionarán');
    }
    
    console.log('✅ Sidebar inicializado correctamente');
    
    // ==========================================
    // FUNCIONES
    // ==========================================
    
    function isMobile() {
        return window.innerWidth <= 768;
    }
    
    function ajustarMainContent() {
        if (!mainContent || isMobile()) {
            if (mainContent) mainContent.style.marginLeft = '0';
            return;
        }
        
        // Desktop: ajustar margen según estado del sidebar
        if (sidebar.classList.contains('collapsed')) {
            mainContent.style.marginLeft = '70px';
        } else {
            mainContent.style.marginLeft = '250px';
        }
    }
    
    function cargarEstado() {
        console.log('📥 Cargando estado del sidebar...');
        console.log('📱 Es móvil:', isMobile());
        
        if (isMobile()) {
            // Móvil: siempre expandido y oculto
            console.log('📱 Modo móvil - removiendo collapsed');
            sidebar.classList.remove('collapsed');
            sidebar.classList.remove('mobile-open');
            if (mainContent) mainContent.style.marginLeft = '0';
            return;
        }
        
        // Desktop: cargar estado guardado
        const guardado = localStorage.getItem('sidebarCollapsed');
        console.log('💾 Valor en localStorage:', guardado);
        console.log('💾 Tipo:', typeof guardado);
        
        if (guardado === 'true') {
            console.log('➡️ Aplicando estado: COLAPSADO');
            sidebar.classList.add('collapsed');
        } else {
            console.log('➡️ Aplicando estado: EXPANDIDO');
            sidebar.classList.remove('collapsed');
        }
        
        console.log('📋 Clases finales del sidebar:', sidebar.className);
        ajustarMainContent();
    }
    
    function marcarEnlaceActivo() {
        const rutaActual = window.location.pathname;
        sidebarLinks.forEach(link => {
            if (link.getAttribute('href') === rutaActual) {
                link.classList.add('active');
            }
        });
    }
    
    // ==========================================
    // EVENTOS - BOTÓN COLAPSAR (DESKTOP)
    // ==========================================
    
    if (collapseBtn) {
        console.log('✅ Agregando event listener al botón colapsar');
        
        collapseBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🖱️ Click en botón colapsar detectado!');
            console.log('📱 Es móvil:', isMobile());
            console.log('📏 Ancho ventana:', window.innerWidth);
            
            // Solo funciona en desktop
            if (isMobile()) {
                console.log('⚠️ Ignorando click - está en modo móvil');
                return;
            }
            
            // Alternar clase collapsed
            const estabaColapsado = sidebar.classList.contains('collapsed');
            sidebar.classList.toggle('collapsed');
            
            console.log('🔄 Estado anterior:', estabaColapsado ? 'Colapsado' : 'Expandido');
            console.log('🔄 Estado nuevo:', sidebar.classList.contains('collapsed') ? 'Colapsado' : 'Expandido');
            console.log('📋 Clases del sidebar:', sidebar.className);
            
            // Ajustar contenido
            ajustarMainContent();
            
            // Guardar estado
            const estaColapsado = sidebar.classList.contains('collapsed');
            localStorage.setItem('sidebarCollapsed', estaColapsado);
            
            console.log('💾 Estado guardado en localStorage:', estaColapsado);
            console.log('🔄 Sidebar:', estaColapsado ? 'Colapsado (70px)' : 'Expandido (250px)');
        });
        
        console.log('✅ Event listener agregado correctamente');
    } else {
        console.error('❌ No se puede agregar event listener - botón no existe');
    }
    
    // ==========================================
    // EVENTOS - CERRAR EN MÓVIL AL HACER CLIC
    // ==========================================
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (!isMobile()) return;
            
            // Cerrar sidebar en móvil
            sidebar.classList.remove('mobile-open');
            
            // Ocultar overlay si existe
            const overlay = document.querySelector('.sidebar-overlay');
            if (overlay) {
                overlay.classList.remove('active');
            }
        });
    });
    
    // ==========================================
    // RESPONSIVE - WINDOW RESIZE
    // ==========================================
    
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            cargarEstado();
        }, 150);
    });
    
    // ==========================================
    // INICIALIZACIÓN
    // ==========================================
    
    cargarEstado();
    marcarEnlaceActivo();
    
    console.log('✅ Sidebar completamente cargado');
    console.log('📊 Estado final del sidebar:', {
        clases: sidebar.className,
        ancho: window.getComputedStyle(sidebar).width,
        collapsed: sidebar.classList.contains('collapsed'),
        localStorage: localStorage.getItem('sidebarCollapsed')
    });
    
    // Función global para debug - puede llamarse desde consola
    window.resetSidebar = function() {
        console.log('🔄 Reseteando sidebar...');
        localStorage.removeItem('sidebarCollapsed');
        sidebar.classList.remove('collapsed');
        ajustarMainContent();
        console.log('✅ Sidebar reseteado - recarga la página si es necesario');
    };
    
    window.toggleSidebarDebug = function() {
        console.log('🔄 Toggle manual del sidebar');
        sidebar.classList.toggle('collapsed');
        ajustarMainContent();
        console.log('Estado actual:', sidebar.classList.contains('collapsed') ? 'Colapsado' : 'Expandido');
    };
    
    console.log('💡 Comandos disponibles en consola:');
    console.log('   - resetSidebar() : Resetea el estado del sidebar');
    console.log('   - toggleSidebarDebug() : Alterna manualmente el estado');
});
