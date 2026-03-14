document.addEventListener('DOMContentLoaded', function() {
    // ==================== BOTONES DEL HERO ====================
    const heroButtons = document.querySelectorAll('.hero-btn, .btn');
    heroButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.opacity = '0.9';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.opacity = '1';
        });
    });

    // ==================== ANIMACIÓN DE SCROLL ====================
    const animatedElements = document.querySelectorAll(
        '.feature-card, .feature-card, .benefit-card, .stat-card, .pricing-card'
    );
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
                entry.target.style.animationDelay = '0.1s';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    animatedElements.forEach(element => {
        observer.observe(element);
    });

    // ==================== FAQ INTERACTIVO ====================
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach((item, index) => {
        const question = item.querySelector('.faq-question');
        
        // Abrir primer item por defecto
        if (index === 0) {
            item.classList.add('active');
        }
        
        question.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Cerrar todos los demás items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Alternar el estado del item actual
            item.classList.toggle('active');
        });
        
        // Permitir navegación con teclado
        question.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                question.click();
            }
        });
    });

    // ==================== SMOOTH SCROLL ====================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                const target = document.querySelector(href);
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});

// ==================== INYECTAR ESTILOS DE ANIMACIÓN ====================
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideInLeft {
        from {
            opacity: 0;
            transform: translateX(-30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    /* Scroll Smooth */
    html {
        scroll-behavior: smooth;
    }
`;
document.head.appendChild(style);
