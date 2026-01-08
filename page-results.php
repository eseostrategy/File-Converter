<?php
/* Template Name: Results */
get_header(); ?>

    <!-- Page Hero -->
    <section class="page-hero fade-in">
        <div class="container">
            <h1>Proven Results</h1>
            <p>See how we've helped businesses like yours dominate their markets.</p>
        </div>
    </section>

    <!-- Case Studies List -->
    <section class="case-studies-list">
        <div class="container">
            <div class="services-grid">
                <!-- Case Study 1 -->
                <div class="glass-card fade-in">
                    <div style="height: 200px; background: linear-gradient(45deg, #1e3a8a, #3b82f6); border-radius: 8px; margin-bottom: 20px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-chart-pie" style="font-size: 4rem; color: rgba(255,255,255,0.2);"></i>
                    </div>
                    <h3>Crypto Casino Operator</h3>
                    <p class="text-muted">Niche: iGaming / Crypto</p>
                    <ul class="features-list">
                        <li><i class="fas fa-arrow-up"></i> 350% Traffic Increase</li>
                        <li><i class="fas fa-arrow-up"></i> 150 Top 3 Keywords</li>
                        <li><i class="fas fa-check"></i> 6 Month Campaign</li>
                    </ul>
                    <a href="#" class="btn btn-secondary" style="width: 100%;">Read Case Study</a>
                </div>

                <!-- Case Study 2 -->
                <div class="glass-card fade-in">
                    <div style="height: 200px; background: linear-gradient(45deg, #4c1d95, #8b5cf6); border-radius: 8px; margin-bottom: 20px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-chart-line" style="font-size: 4rem; color: rgba(255,255,255,0.2);"></i>
                    </div>
                    <h3>Sports Betting Affiliate</h3>
                    <p class="text-muted">Niche: Sports Betting</p>
                    <ul class="features-list">
                        <li><i class="fas fa-arrow-up"></i> 500% Revenue Growth</li>
                        <li><i class="fas fa-arrow-up"></i> 20k Monthly Visitors</li>
                        <li><i class="fas fa-check"></i> 12 Month Campaign</li>
                    </ul>
                    <a href="#" class="btn btn-secondary" style="width: 100%;">Read Case Study</a>
                </div>

                <!-- Case Study 3 -->
                <div class="glass-card fade-in">
                    <div style="height: 200px; background: linear-gradient(45deg, #064e3b, #10b981); border-radius: 8px; margin-bottom: 20px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-globe" style="font-size: 4rem; color: rgba(255,255,255,0.2);"></i>
                    </div>
                    <h3>Fintech Startup</h3>
                    <p class="text-muted">Niche: Finance / Tech</p>
                    <ul class="features-list">
                        <li><i class="fas fa-arrow-up"></i> 0 to 50k Traffic</li>
                        <li><i class="fas fa-arrow-up"></i> Featured Snippets</li>
                        <li><i class="fas fa-check"></i> 8 Month Campaign</li>
                    </ul>
                    <a href="#" class="btn btn-secondary" style="width: 100%;">Read Case Study</a>
                </div>
            </div>

            <div style="text-align: center; margin-top: 80px;" class="fade-in">
                <h2>Ready to be our next success story?</h2>
                <a href="<?php echo home_url('/contact'); ?>" class="btn btn-primary" style="margin-top: 20px;">Start Your Journey</a>
            </div>
        </div>
    </section>

<?php get_footer(); ?>
