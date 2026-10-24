<?php
/* Template Name: Services */
get_header(); ?>

    <!-- Page Hero -->
    <section class="page-hero fade-in">
        <div class="container">
            <h1>Our Premium SEO Services</h1>
            <p>Comprehensive, data-driven SEO solutions tailored for high-growth businesses and high-competition niches.</p>
        </div>
    </section>

    <!-- Services Grid -->
    <section class="services-list">
        <div class="container">
            <div class="services-grid">
                <!-- Card 1 -->
                <a href="<?php echo esc_url(home_url('/service/monthly-seo')); ?>" class="glass-card service-card fade-in">
                    <div class="card-badge">Full Management</div>
                    <i class="fas fa-calendar-check service-icon"></i>
                    <h3>Monthly SEO Package</h3>
                    <p>Maximize your online potential with our comprehensive monthly SEO packages, tailored to meet your unique target keywords and growth goals.</p>
                    <span class="card-link-text">Explore Package <i class="fas fa-arrow-right"></i></span>
                </a>

                <!-- Card 2 -->
                <a href="<?php echo esc_url(home_url('/service/pbn-backlinks')); ?>" class="glass-card service-card fade-in">
                    <div class="card-badge">High Authority</div>
                    <i class="fas fa-network-wired service-icon"></i>
                    <h3>PBN Backlinks</h3>
                    <p>Boost your website's authority with our high-quality, diverse PBN backlinks from clean, authoritative metrics domains.</p>
                    <span class="card-link-text">Explore Package <i class="fas fa-arrow-right"></i></span>
                </a>

                <!-- Card 3 -->
                <a href="<?php echo esc_url(home_url('/service/guest-post')); ?>" class="glass-card service-card fade-in">
                    <i class="fas fa-pen-fancy service-icon"></i>
                    <h3>Guest Post Outreach</h3>
                    <p>Improve your website's search visibility with contextual, high-quality guest posts on real-traffic niche sites.</p>
                    <span class="card-link-text">Explore Package <i class="fas fa-arrow-right"></i></span>
                </a>

                <!-- Card 4 -->
                <a href="<?php echo esc_url(home_url('/service/seo-backlinks')); ?>" class="glass-card service-card fade-in">
                    <i class="fas fa-link service-icon"></i>
                    <h3>SEO Backlinks</h3>
                    <p>Drive rankings higher with our structured, multi-tiered SEO backlink packages built for safe, long-term link velocity.</p>
                    <span class="card-link-text">Explore Package <i class="fas fa-arrow-right"></i></span>
                </a>

                <!-- Card 5 -->
                <a href="<?php echo esc_url(home_url('/service/edu-guest-post')); ?>" class="glass-card service-card fade-in">
                    <div class="card-badge">Exclusive</div>
                    <i class="fas fa-graduation-cap service-icon"></i>
                    <h3>EDU Guest Post</h3>
                    <p>Exclusive guest placement on high-trust .edu domains, providing maximum link juice and authority signals to Google.</p>
                    <span class="card-link-text">Explore Package <i class="fas fa-arrow-right"></i></span>
                </a>
            </div>

            <div style="text-align: center; margin-top: 60px;">
                <a href="<?php echo esc_url(home_url('/pricing')); ?>" class="btn btn-primary">Compare All Pricing Plans</a>
            </div>
        </div>
    </section>

<?php get_footer(); ?>
