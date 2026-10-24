<?php
/* Template Name: Pricing */
get_header(); ?>

    <!-- Page Hero -->
    <section class="page-hero fade-in">
        <div class="container">
            <h1>Transparent Pricing</h1>
            <p>Choose the plan that fits your growth goals. No hidden fees, just results.</p>
        </div>
    </section>

    <!-- Pricing Tables -->
    <section class="pricing-section">
        <div class="container">
            <div class="services-grid">
                <!-- Starter Plan -->
                <div class="glass-card pricing-card fade-in">
                    <h3>Starter</h3>
                    <p class="text-muted">For small businesses</p>
                    <div class="price">$999<span>/mo</span></div>
                    <ul class="features-list">
                        <li><i class="fas fa-check"></i> Technical SEO Audit</li>
                        <li><i class="fas fa-check"></i> 10 Target Keywords</li>
                        <li><i class="fas fa-check"></i> 2 Quality Backlinks/mo</li>
                        <li><i class="fas fa-check"></i> Monthly Reporting</li>
                        <li><i class="fas fa-check"></i> Email Support</li>
                    </ul>
                    <a href="<?php echo home_url('/contact?plan=starter'); ?>" class="btn btn-secondary">Get Started</a>
                </div>

                <!-- Growth Plan -->
                <div class="glass-card pricing-card popular fade-in">
                    <div class="popular-badge">POPULAR</div>
                    <h3>Growth</h3>
                    <p class="text-muted">For expanding sites</p>
                    <div class="price">$2,499<span>/mo</span></div>
                    <ul class="features-list">
                        <li><i class="fas fa-check"></i> Advanced Audit & Fixes</li>
                        <li><i class="fas fa-check"></i> 30 Target Keywords</li>
                        <li><i class="fas fa-check"></i> 5 High DA Backlinks/mo</li>
                        <li><i class="fas fa-check"></i> 4 Content Articles/mo</li>
                        <li><i class="fas fa-check"></i> Bi-weekly Strategy Calls</li>
                    </ul>
                    <a href="<?php echo home_url('/contact?plan=growth'); ?>" class="btn btn-primary">Get Started</a>
                </div>

                <!-- Enterprise Plan -->
                <div class="glass-card pricing-card fade-in">
                    <h3>Enterprise</h3>
                    <p class="text-muted">For market leaders</p>
                    <div class="price">$4,999+<span>/mo</span></div>
                    <ul class="features-list">
                        <li><i class="fas fa-check"></i> Custom Strategy</li>
                        <li><i class="fas fa-check"></i> Unlimited Keywords</li>
                        <li><i class="fas fa-check"></i> Custom Link Building</li>
                        <li><i class="fas fa-check"></i> Priority Support 24/7</li>
                        <li><i class="fas fa-check"></i> Dedicated Account Manager</li>
                    </ul>
                    <a href="<?php echo home_url('/contact?plan=enterprise'); ?>" class="btn btn-secondary">Contact Sales</a>
                </div>
            </div>

            <div style="text-align: center; margin-top: 60px; max-width: 800px; margin-left: auto; margin-right: auto;" class="fade-in">
                <p>Not sure which plan is right for you? We also offer custom packages tailored to your specific needs and budget.</p>
                <a href="<?php echo home_url('/contact'); ?>" class="btn btn-secondary">Request Custom Quote</a>
            </div>
        </div>
    </section>

<?php get_footer(); ?>
