document.addEventListener('DOMContentLoaded', function() {
    const navbarToggle = document.getElementById('navbarToggle');
    const navbarMenu = document.getElementById('navbarMenu');
    const userDropdown = document.getElementById('userDropdown');
    const dropdownMenu = document.getElementById('userDropdownMenu');

    // Toggle Mobile Menu
    if (navbarToggle && navbarMenu) {
        navbarToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const open = navbarMenu.classList.toggle('active');
            navbarToggle.classList.toggle('active', open);
            navbarToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            navbarToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
        });
    }

    function closeMobileMenu() {
        if (navbarToggle && navbarMenu) {
            navbarToggle.classList.remove('active');
            navbarMenu.classList.remove('active');
            navbarToggle.setAttribute('aria-expanded', 'false');
            navbarToggle.setAttribute('aria-label', 'Abrir menú');
        }
    }

    // Close menu when clicking a link
    document.querySelectorAll('.navbar-link').forEach(link => {
        if (!link.id) {
            link.addEventListener('click', function() {
                closeMobileMenu();
            });
        }
    });

    // Handle dropdown in mobile
    if (userDropdown) {
        userDropdown.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const parent = this.closest('.navbar-item');
                parent.classList.toggle('active');
            }
        });
    }

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.navbar')) {
            closeMobileMenu();
        }
    });
});
