document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard navbar cargado');
    
    const navbarMenuToggle = document.getElementById('navbarMenuToggle');
    const sidebar = document.getElementById('sidebar');
    
    // Si el botón del navbar y el sidebar existen, conectarlos
    if (navbarMenuToggle && sidebar) {
        navbarMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Toggle del sidebar en móvil
            sidebar.classList.toggle('mobile-open');
            
            // Buscar o crear overlay
            let overlay = document.querySelector('.sidebar-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'sidebar-overlay';
                overlay.style.cssText = 'display: none; position: fixed; top: 54px; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); z-index: 49;';
                document.body.appendChild(overlay);
                
                // Cerrar sidebar al hacer click en overlay
                overlay.addEventListener('click', function() {
                    sidebar.classList.remove('mobile-open');
                    overlay.style.display = 'none';
                });
            }
            
            // Mostrar/ocultar overlay
            if (sidebar.classList.contains('mobile-open')) {
                overlay.style.display = 'block';
            } else {
                overlay.style.display = 'none';
            }
            
            console.log('Sidebar toggled from navbar, mobile-open:', sidebar.classList.contains('mobile-open'));
        });
    }
});
