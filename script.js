document.addEventListener('DOMContentLoaded', () => {
    // Dynamic Year
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Hamburger Menu
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // Mobile Dropdown Toggle
    const dropdown = document.querySelector('.dropdown');
    const dropdownToggle = document.querySelector('.dropdown-toggle');

    if (dropdown && dropdownToggle && window.innerWidth <= 768) {
        dropdownToggle.addEventListener('click', (e) => {
            e.preventDefault();
            dropdown.classList.toggle('active');
        });
    }

    // Sticky Navbar (Optional visual effect)
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.boxShadow = "0 4px 10px rgba(0,0,0,0.1)";
        } else {
            header.style.boxShadow = "var(--shadow)";
        }
    });

    // --- Order Page Logic ---
    const orderForm = document.getElementById('order-form');
    if (orderForm) {
        // 1. Populate Form from URL Params
        const urlParams = new URLSearchParams(window.location.search);
        const service = urlParams.get('service');
        const plan = urlParams.get('plan');
        const price = urlParams.get('price');

        if (service) document.getElementById('order-service').value = service;
        if (plan) document.getElementById('order-plan').value = plan;
        if (price) document.getElementById('order-price').value = price;

        // 2. Handle Form Submission
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Visual Loading State
            const btn = orderForm.querySelector('button[type="submit"]');
            const btnText = btn.querySelector('.btn-text');
            const spinner = btn.querySelector('.fa-spinner');

            btn.disabled = true;
            btnText.style.display = 'none';
            spinner.style.display = 'inline-block';

            // Collect Data (for simulated backend)
            const formData = new FormData(orderForm);
            const data = Object.fromEntries(formData);

            // Simulate API Call (2 seconds)
            setTimeout(() => {
                // Success!
                // Generate Random Order ID
                const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);

                // Hide Form, Show Success
                orderForm.style.display = 'none';

                const successDiv = document.getElementById('order-success');
                document.getElementById('success-name').textContent = data.name;
                document.getElementById('success-email').textContent = data.email;
                document.getElementById('order-id').textContent = '#' + orderId;

                successDiv.style.display = 'block';
                successDiv.scrollIntoView({ behavior: 'smooth' });

                // In a real app, you would send 'data' to your server here
                console.log('Order Data:', data);

            }, 2000);
        });
    }
});
