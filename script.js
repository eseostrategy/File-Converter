document.addEventListener('DOMContentLoaded', () => {
    // Update year in footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');

    const handleScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll);

    // Initial check
    handleScroll();

    // Mobile menu toggle (simple implementation)
    const toggleButton = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            // In a real implementation, you would probably toggle a class to show/hide the menu
            // Since the CSS provided hides .nav-links on mobile by default and shows it on md up
            // we'd need to add a class to override the display property for mobile.
            // For now, let's just log it or add a simple inline style toggle for demonstration if needed,
            // but the prompt didn't strictly require mobile menu implementation beyond layout.
            // Let's add a 'mobile-open' class to nav-links

            if (navLinks.style.display === 'flex') {
                navLinks.style.display = 'none';
                navLinks.style.position = '';
                navLinks.style.top = '';
                navLinks.style.left = '';
                navLinks.style.width = '';
                navLinks.style.height = '';
                navLinks.style.backgroundColor = '';
                navLinks.style.flexDirection = '';
                navLinks.style.padding = '';
            } else {
                navLinks.style.display = 'flex';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '100%';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.height = '100vh';
                navLinks.style.backgroundColor = 'rgba(0,0,0,0.95)';
                navLinks.style.flexDirection = 'column';
                navLinks.style.padding = '2rem';
            }
        });
    }
});
