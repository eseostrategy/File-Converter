<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
    <!-- Header -->
    <header>
        <div class="container">
            <nav>
                <div class="logo">
                    <a href="<?php echo home_url(); ?>" style="display:flex; align-items:center; gap:10px; color:white;">
                        <i class="fas fa-chart-line"></i>
                        ESEO<span>STRATEGY</span>
                    </a>
                </div>
                <div class="nav-links">
                    <a href="<?php echo home_url(); ?>">Home</a>
                    <a href="<?php echo home_url('/services'); ?>">Services</a>
                    <a href="<?php echo home_url('/about-us'); ?>">About Us</a>
                    <a href="<?php echo home_url('/results'); ?>">Results</a>
                    <a href="<?php echo home_url('/pricing'); ?>">Pricing</a>
                    <a href="<?php echo home_url('/contact'); ?>">Contact</a>
                </div>
                <div class="mobile-toggle">
                    <i class="fas fa-bars"></i>
                </div>
            </nav>
        </div>
    </header>
