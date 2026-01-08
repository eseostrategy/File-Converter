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
        if (price) {
            const priceEl = document.getElementById('order-price');
            priceEl.value = price;
            // Store immutable unit price
            priceEl.setAttribute('data-unit-price', price);
        }

        // --- Quantity & Price Logic ---
        const quantityInput = document.getElementById('order-quantity');
        const priceInput = document.getElementById('order-price');
        const discountInput = document.getElementById('discount-code');
        const applyBtn = document.getElementById('apply-discount');
        const discountMsg = document.getElementById('discount-message');

        // COUPON CONFIGURATION
        // Add new coupons here. Format: "CODE": Discount_Percentage (0.10 = 10%)
        const COUPON_CODES = {
            "PRO10": 0.10,
            "SEO2026": 0.10,
            "TEST": 0.99
        };

        let appliedDiscountRate = 0; // Stores the active discount (e.g., 0.10)

        const updateTotalPrice = () => {
            const unitPrice = parseFloat(priceInput.getAttribute('data-unit-price')) || 0;
            const quantity = parseInt(quantityInput.value) || 1;

            let total = unitPrice * quantity;

            if (appliedDiscountRate > 0) {
                total = total * (1 - appliedDiscountRate); // Apply discount
            }

            priceInput.value = total.toFixed(2);
        };

        if (quantityInput) {
            quantityInput.addEventListener('input', updateTotalPrice);
            quantityInput.addEventListener('change', updateTotalPrice);
        }

        if (applyBtn && discountInput) {
            applyBtn.addEventListener('click', () => {
                const code = discountInput.value.trim().toUpperCase();

                if (appliedDiscountRate > 0) {
                     discountMsg.textContent = "Discount already applied!";
                     discountMsg.style.color = 'orange';
                     return;
                }

                // Check if code exists in our configuration
                if (COUPON_CODES.hasOwnProperty(code)) {
                    appliedDiscountRate = COUPON_CODES[code];
                    updateTotalPrice();

                    const percent = appliedDiscountRate * 100;
                    discountMsg.textContent = `Success! ${percent}% discount applied.`;
                    discountMsg.style.color = 'var(--accent-color)';
                    applyBtn.disabled = true;
                    applyBtn.textContent = 'Applied';
                } else {
                    discountMsg.textContent = "Invalid discount code.";
                    discountMsg.style.color = 'red';
                }
            });
        }

        // --- Payment Method Change Logic ---
        const paymentSelect = document.getElementById('payment-method');
        const detailsDisplay = document.getElementById('payment-details-display');
        const walletAddressCode = document.getElementById('wallet-address');

        if (paymentSelect) {
            paymentSelect.addEventListener('change', (e) => {
                const method = e.target.value;

                if (method.includes('USDT')) {
                    detailsDisplay.style.display = 'block';
                    walletAddressCode.textContent = 'TAtJ84g1XdFFf7zRnxmjXAmCf47D7jJxpB';
                } else if (method.includes('BTC')) {
                    detailsDisplay.style.display = 'block';
                    walletAddressCode.textContent = '0x1920ada87423da425afb1a52fcac1fd2696974a2';
                } else {
                    detailsDisplay.style.display = 'none';
                }
            });
        }

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
