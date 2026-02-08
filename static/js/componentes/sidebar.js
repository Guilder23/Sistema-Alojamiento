document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebarToggle');
    
    if (!sidebar || !toggleBtn) return;
    
    // Cargar estado del sidebar desde localStorage
    const sidebarState = localStorage.getItem('sidebarCollapsed');
    if (sidebarState === 'true') {
        sidebar.classList.add('collapsed');
    }
    
    // Toggle sidebar
    toggleBtn.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        
        // Guardar estado en localStorage
        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    });

    // Marcar enlace activo basado en URL actual
    const currentPath = window.location.pathname;
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    
    sidebarLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
});
