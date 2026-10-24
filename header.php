<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
    <!-- Header -->
    <header class="site-header">
        <div class="container">
            <nav class="navbar">
                <div class="logo">
                    <a href="<?php echo esc_url(home_url('/')); ?>" class="logo-link">
                        <span class="logo-icon"><i class="fas fa-chart-line"></i></span>
                        <span class="logo-text">ESEO<span class="logo-accent">STRATEGY</span></span>
                    </a>
                </div>

                <ul class="nav-links">
                    <li class="<?php echo is_front_page() ? 'active' : ''; ?>">
                        <a href="<?php echo esc_url(home_url('/')); ?>">Home</a>
                    </li>
                    <li class="nav-dropdown <?php echo (is_page('services') || is_page_template('page-service-detail.php') || (function_exists('is_woocommerce') && is_woocommerce())) ? 'active' : ''; ?>">
                        <a href="<?php echo esc_url(home_url('/services')); ?>" class="dropdown-trigger">
                            Services <i class="fas fa-chevron-down dropdown-icon"></i>
                        </a>
                        <ul class="dropdown-menu">
                            <li>
                                <a href="<?php echo esc_url(home_url('/service/monthly-seo')); ?>">
                                    <i class="fas fa-calendar-check menu-icon"></i>
                                    <div>
                                        <strong>Monthly SEO Package</strong>
                                        <small>All-in-one growth campaign</small>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a href="<?php echo esc_url(home_url('/service/pbn-backlinks')); ?>">
                                    <i class="fas fa-network-wired menu-icon"></i>
                                    <div>
                                        <strong>PBN Backlinks</strong>
                                        <small>High authority domain network</small>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a href="<?php echo esc_url(home_url('/service/guest-post')); ?>">
                                    <i class="fas fa-pen-fancy menu-icon"></i>
                                    <div>
                                        <strong>Guest Post</strong>
                                        <small>Contextual real-traffic outreach</small>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a href="<?php echo esc_url(home_url('/service/seo-backlinks')); ?>">
                                    <i class="fas fa-link menu-icon"></i>
                                    <div>
                                        <strong>SEO Backlinks</strong>
                                        <small>Multi-tiered backlink packages</small>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a href="<?php echo esc_url(home_url('/service/edu-guest-post')); ?>">
                                    <i class="fas fa-graduation-cap menu-icon"></i>
                                    <div>
                                        <strong>Edu Guest Post</strong>
                                        <small>Top-tier authority .edu links</small>
                                    </div>
                                </a>
                            </li>
                            <li class="dropdown-divider">
                                <a href="<?php echo esc_url(home_url('/services')); ?>" class="view-all-link">
                                    <strong>View All Services & Catalog <i class="fas fa-arrow-right"></i></strong>
                                </a>
                            </li>
                        </ul>
                    </li>
                    <li class="<?php echo is_page('about-us') ? 'active' : ''; ?>">
                        <a href="<?php echo esc_url(home_url('/about-us')); ?>">About Us</a>
                    </li>
                    <li class="<?php echo is_page('results') ? 'active' : ''; ?>">
                        <a href="<?php echo esc_url(home_url('/results')); ?>">Results</a>
                    </li>
                    <li class="<?php echo is_page('pricing') ? 'active' : ''; ?>">
                        <a href="<?php echo esc_url(home_url('/pricing')); ?>">Pricing</a>
                    </li>
                    <li class="<?php echo is_page('contact') ? 'active' : ''; ?>">
                        <a href="<?php echo esc_url(home_url('/contact')); ?>">Contact</a>
                    </li>
                </ul>

                <div class="nav-actions">
                    <a href="<?php echo esc_url(home_url('/contact')); ?>" class="btn btn-primary btn-sm header-cta">Free Audit</a>
                    <button class="mobile-toggle" aria-label="Toggle navigation menu">
                        <i class="fas fa-bars"></i>
                    </button>
                </div>
            </nav>
        </div>
    </header>
    <?php eseo_breadcrumbs(); ?>
