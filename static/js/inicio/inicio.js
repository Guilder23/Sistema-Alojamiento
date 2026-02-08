document.addEventListener('DOMContentLoaded', function() {
    // Agregar efectos a los botones del hero
    const heroButtons = document.querySelectorAll('.hero-btn');
    heroButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.opacity = '0.8';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.opacity = '1';
        });
    });

    // Animación de aparición para las feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeIn 0.6s ease forwards';
                observer.unobserve(entry.target);
            }
        });
    });

    featureCards.forEach(card => {
        observer.observe(card);
    });
});

// Agregamos la animación al CSS dinámicamente
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);
