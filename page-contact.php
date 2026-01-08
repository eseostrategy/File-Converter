<?php
/* Template Name: Contact */
get_header(); ?>

    <!-- Page Hero -->
    <section class="page-hero fade-in">
        <div class="container">
            <h1>Get In Touch</h1>
            <p>Ready to dominate your niche? Let's discuss your strategy.</p>
        </div>
    </section>

    <!-- Contact Section -->
    <section class="contact-section">
        <div class="container">
            <div class="glass-card contact-form fade-in">
                <form id="contactForm">
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input type="text" id="name" class="form-control" placeholder="Your Name" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" class="form-control" placeholder="your@email.com" required>
                    </div>
                    <div class="form-group">
                        <label for="website">Website URL</label>
                        <input type="url" id="website" class="form-control" placeholder="https://yourwebsite.com">
                    </div>
                    <div class="form-group">
                        <label for="service">Interested In</label>
                        <select id="service" class="form-control">
                            <option value="general">General Inquiry</option>
                            <option value="monthly-seo">Monthly SEO Package</option>
                            <option value="pbn">PBN Backlinks</option>
                            <option value="tf-pbn">TF PBN Backlinks</option>
                            <option value="guest-post">Guest Post</option>
                            <option value="seo-backlinks">SEO Backlinks</option>
                            <option value="da-follow">DA Follow Backlink</option>
                            <option value="increase-da">Increase DA 50</option>
                            <option value="edu-post">EDU Guest Post</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="message">Message</label>
                        <textarea id="message" class="form-control" placeholder="Tell us about your goals..."></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Send Message</button>
                </form>
            </div>

            <div class="stats-grid fade-in" style="margin-top: 80px; max-width: 800px; margin-left: auto; margin-right: auto;">
                <div class="stat-card">
                    <i class="fas fa-envelope" style="font-size: 2rem; color: var(--primary-blue); margin-bottom: 15px;"></i>
                    <p><a href="mailto:support@eseostrategy.com">support@eseostrategy.com</a></p>
                </div>
                <div class="stat-card">
                    <i class="fas fa-phone" style="font-size: 2rem; color: var(--primary-blue); margin-bottom: 15px;"></i>
                    <p><a href="tel:+923113793342">+92 3113793342</a></p>
                </div>
                <div class="stat-card">
                    <i class="fas fa-map-marker-alt" style="font-size: 2rem; color: var(--primary-blue); margin-bottom: 15px;"></i>
                    <p>Office# 39, Reshmeen Center, Latifabad# 7, Hyderabad, Pakistan</p>
                </div>
                <div class="stat-card">
                    <i class="fab fa-skype" style="font-size: 2rem; color: var(--primary-blue); margin-bottom: 15px;"></i>
                    <p><a href="https://join.skype.com/invite/vnB22p2eSrCb">@eseostrategy</a></p>
                </div>
                <div class="stat-card">
                    <i class="fab fa-telegram" style="font-size: 2rem; color: var(--primary-blue); margin-bottom: 15px;"></i>
                    <p><a href="https://t.me/eseostrategy">@eseostrategy</a></p>
                </div>
            </div>
        </div>
    </section>

    <script>
        // Simple URL parameter handling to pre-select service or plan
        const urlParams = new URLSearchParams(window.location.search);
        const plan = urlParams.get('plan');
        if (plan) {
            const messageBox = document.getElementById('message');
            if (messageBox) {
                messageBox.value = `I'm interested in the ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan.`;
            }
        }
    </script>

<?php get_footer(); ?>
