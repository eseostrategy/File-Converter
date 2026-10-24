<?php
/**
 * WooCommerce Product Catalog Archive
 */
get_header();
?>

<div class="woocommerce-archive-wrapper">
    <section class="page-hero">
        <div class="container">
            <h1>Products & Package Catalog</h1>
            <p>Explore our premium SEO packages, backlinks products, and digital growth services.</p>
        </div>
    </section>

    <section class="catalog-section">
        <div class="container">
            <?php if (function_exists('wc_print_notices')) wc_print_notices(); ?>

            <?php if (have_posts()) : ?>
                <div class="services-grid product-catalog-grid">
                    <?php while (have_posts()) : the_post(); global $product; ?>
                        <div class="glass-card product-card fade-in">
                            <a href="<?php the_permalink(); ?>" class="product-card-link">
                                <div class="product-thumb-box">
                                    <?php
                                    if (has_post_thumbnail()) {
                                        the_post_thumbnail('medium');
                                    } else {
                                        echo '<i class="fas fa-box product-placeholder-icon"></i>';
                                    }
                                    ?>
                                </div>
                                <h3><?php the_title(); ?></h3>
                                <?php if ($product) : ?>
                                    <div class="price"><?php echo $product->get_price_html(); ?></div>
                                <?php endif; ?>
                            </a>
                            <div class="product-actions" style="margin-top: 15px;">
                                <a href="<?php the_permalink(); ?>" class="btn btn-secondary btn-sm" style="width: 100%;">View Product Details</a>
                            </div>
                        </div>
                    <?php endwhile; ?>
                </div>

                <div class="pagination-wrapper" style="margin-top: 40px; text-align: center;">
                    <?php the_posts_pagination(); ?>
                </div>
            <?php else : ?>
                <div class="glass-card fade-in" style="text-align: center; padding: 60px 20px;">
                    <h2>No Products Found</h2>
                    <p>Our online catalog is currently updating. Check out our service packages or contact us for a custom package quote.</p>
                    <a href="<?php echo esc_url(home_url('/services')); ?>" class="btn btn-primary" style="margin-top: 20px;">View Services</a>
                </div>
            <?php endif; ?>
        </div>
    </section>
</div>

<?php
get_footer();
?>
