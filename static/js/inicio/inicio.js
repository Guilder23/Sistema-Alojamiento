document.addEventListener('DOMContentLoaded', function() {
    const root = document.querySelector('.inicio-wrapper');
    if (!root) return;

    // Botones (solo landing; no afectar modales u otros .btn del sitio)
    root.querySelectorAll('.btn').forEach(function(button) {
        button.addEventListener('mouseenter', function() {
            this.style.opacity = '0.92';
        });
        button.addEventListener('mouseleave', function() {
            this.style.opacity = '1';
        });
    });

    const animatedElements = root.querySelectorAll(
        '.feature-card, .benefit-card, .stat-card, .pricing-card, .inicio-gallery__item, .inicio-photo-card'
    );
    const observer = new IntersectionObserver(
        function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'inicio-fade-in-up 0.55s ease forwards';
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12 }
    );
    animatedElements.forEach(function(el) {
        observer.observe(el);
    });

    const faqItems = root.querySelectorAll('.faq-item');

    function setFaqExpanded(item, expanded) {
        const q = item.querySelector('.faq-question');
        if (q) q.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    }

    faqItems.forEach(function(item, index) {
        const question = item.querySelector('.faq-question');
        if (!question) return;

        if (index === 0) {
            item.classList.add('active');
            setFaqExpanded(item, true);
        } else {
            setFaqExpanded(item, false);
        }

        question.addEventListener('click', function(e) {
            e.preventDefault();
            const willOpen = !item.classList.contains('active');
            faqItems.forEach(function(other) {
                if (other !== item) {
                    other.classList.remove('active');
                    setFaqExpanded(other, false);
                }
            });
            item.classList.toggle('active', willOpen);
            setFaqExpanded(item, willOpen);
        });

        question.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                question.click();
            }
        });
    });
});
