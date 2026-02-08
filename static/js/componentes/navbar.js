document.addEventListener('DOMContentLoaded', function() {
    const navbarToggle = document.getElementById('navbarToggle');
    const navbarMenu = document.getElementById('navbarMenu');
    const userDropdown = document.getElementById('userDropdown');
    const dropdownMenu = document.getElementById('userDropdownMenu');

    // Toggle Mobile Menu
    if (navbarToggle) {
        navbarToggle.addEventListener('click', function() {
            navbarToggle.classList.toggle('active');
            navbarMenu.classList.toggle('active');
        });
    }

    // Close menu when clicking a link
    document.querySelectorAll('.navbar-link').forEach(link => {
        if (!link.id) {
            link.addEventListener('click', function() {
                if (navbarToggle) {
                    navbarToggle.classList.remove('active');
                    navbarMenu.classList.remove('active');
                }
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
            if (navbarToggle) {
                navbarToggle.classList.remove('active');
                navbarMenu.classList.remove('active');
            }
        }
    });
});
