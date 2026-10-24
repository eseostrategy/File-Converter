document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Navigation & Dropdown Toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    const dropdownTriggers = document.querySelectorAll('.dropdown-trigger');

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    dropdownTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            if (window.innerWidth <= 992) {
                e.preventDefault();
                const parent = trigger.closest('.nav-dropdown');
                if (parent) {
                    parent.classList.toggle('dropdown-open');
                }
            }
        });
    });

    // 2. Header Background & Scroll State
    const header = document.querySelector('.site-header') || document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 40) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // 3. Hero Typing Simulation
    const typingElement = document.getElementById('heroTypingText');
    if (typingElement) {
        const phrases = [
            'best casino backlinks',
            'high DA guest posts',
            'pbn link building',
            'monthly seo strategy'
        ];
        let phraseIdx = 0;
        let charIdx = 0;
        let isDeleting = false;
        let typeSpeed = 100;

        function typeLoop() {
            const currentPhrase = phrases[phraseIdx];
            if (isDeleting) {
                typingElement.textContent = currentPhrase.substring(0, charIdx - 1);
                charIdx--;
                typeSpeed = 50;
            } else {
                typingElement.textContent = currentPhrase.substring(0, charIdx + 1);
                charIdx++;
                typeSpeed = 100;
            }

            if (!isDeleting && charIdx === currentPhrase.length) {
                typeSpeed = 2000; // Pause at full word
                isDeleting = true;
            } else if (isDeleting && charIdx === 0) {
                isDeleting = false;
                phraseIdx = (phraseIdx + 1) % phrases.length;
                typeSpeed = 500;
            }

            setTimeout(typeLoop, typeSpeed);
        }

        setTimeout(typeLoop, 1000);
    }

    // 4. Parallax Effect for Hero Visual
    const parallaxCard = document.querySelector('.parallax-target');
    if (parallaxCard && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.addEventListener('mousemove', (e) => {
            const x = (window.innerWidth / 2 - e.clientX) * 0.015;
            const y = (window.innerHeight / 2 - e.clientY) * 0.015;
            parallaxCard.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg) translateY(${y * 0.5}px)`;
        });
    }

    // 5. Scroll-Linked Storytelling Section
    const storytellingSection = document.getElementById('storytellingSection');
    if (storytellingSection) {
        const visualLayers = storytellingSection.querySelectorAll('.stage-visual-layer');
        const storySteps = storytellingSection.querySelectorAll('.story-step');

        const stepObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const stepNum = entry.target.getAttribute('data-step');

                    // Activate corresponding visual layer
                    visualLayers.forEach(layer => {
                        if (layer.getAttribute('data-stage') === stepNum) {
                            layer.classList.add('active');
                        } else {
                            layer.classList.remove('active');
                        }
                    });

                    // Activate corresponding step card
                    storySteps.forEach(step => {
                        if (step.getAttribute('data-step') === stepNum) {
                            step.classList.add('active-step');
                        } else {
                            step.classList.remove('active-step');
                        }
                    });
                }
            });
        }, {
            threshold: 0.5,
            rootMargin: '-10% 0px -10% 0px'
        });

        storySteps.forEach(step => stepObserver.observe(step));
    }

    // 6. Intersection Observer for Entrance Reveal Animations
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-section, .fade-in, .interactive-card, .glass-card').forEach(el => {
        revealObserver.observe(el);
    });

    // 7. FAQ Accordion Toggles
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(btn => {
        btn.addEventListener('click', () => {
            const faqItem = btn.closest('.faq-item');
            if (faqItem) {
                const isOpen = faqItem.classList.contains('open');

                // Close all sibling items
                document.querySelectorAll('.faq-item').forEach(item => item.classList.remove('open'));

                if (!isOpen) {
                    faqItem.classList.add('open');
                }
            }
        });
    });

    // 8. Stat Number Counter Animation
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    if (statNumbers.length > 0) {
        const statsObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const targetEl = entry.target;
                    const targetVal = parseInt(targetEl.getAttribute('data-target'), 10);
                    let currentVal = 0;
                    const duration = 1500;
                    const stepTime = Math.max(Math.floor(duration / targetVal), 20);

                    const timer = setInterval(() => {
                        currentVal += Math.ceil(targetVal / 50);
                        if (currentVal >= targetVal) {
                            currentVal = targetVal;
                            clearInterval(timer);
                        }
                        const suffix = targetEl.textContent.replace(/[0-9]/g, '');
                        targetEl.textContent = currentVal + suffix;
                    }, stepTime);

                    observer.unobserve(targetEl);
                }
            });
        }, { threshold: 0.5 });

        statNumbers.forEach(num => statsObserver.observe(num));
    }
});
