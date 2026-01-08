document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close mobile nav when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Sticky Header
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        }
    });

    // Contact Form Submission
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            formStatus.textContent = 'Sending...';
            formStatus.className = 'form-status';

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            // Determine endpoint based on if 'service' field is populated
            const endpoint = data.service ? '/api/enquiry' : '/api/contact';

            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    formStatus.textContent = result.message || 'Message sent successfully!';
                    formStatus.classList.add('success');
                    contactForm.reset();
                    // Clear service prefill
                    document.getElementById('service-select-group').style.display = 'none';
                    document.getElementById('service').value = '';
                } else {
                    throw new Error(result.error || 'Something went wrong');
                }
            } catch (error) {
                formStatus.textContent = error.message;
                formStatus.classList.add('error');
            }
        });
    }
});

// Helper to prefill service in contact form
function prefillService(serviceName) {
    const serviceInput = document.getElementById('service');
    const serviceGroup = document.getElementById('service-select-group');

    if (serviceInput && serviceGroup) {
        serviceInput.value = serviceName;
        serviceGroup.style.display = 'block';

        // Scroll to contact form
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    }
}
