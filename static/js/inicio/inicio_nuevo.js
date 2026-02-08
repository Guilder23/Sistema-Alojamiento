/* ============================================
   INICIO - JAVASCRIPT
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    // Scroll smooth para links internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Animar elementos cuando se hacen visibles
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card, .info-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Botones de modal
    const loginButtons = document.querySelectorAll('[onclick*="openLoginModal"]');
    const registroButtons = document.querySelectorAll('[onclick*="openRegistroModal"]');

    loginButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (e.target.tagName === 'BUTTON') {
                e.preventDefault();
            }
        });
    });

    registroButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (e.target.tagName === 'BUTTON') {
                e.preventDefault();
            }
        });
    });

    // Analytics o tracking (opcional)
    console.log('Página de inicio cargada');
});
