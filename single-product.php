<?php
/**
 * Single Product Template Override
 */
get_header();

while ( have_posts() ) :
    the_post();
    global $product;
    if (!is_a($product, 'WC_Product')) {
        $product = wc_get_product(get_the_ID());
    }
?>

<div class="woocommerce-product-page-wrapper">
    <section class="page-hero single-product-hero">
        <div class="container">
            <span class="service-badge-pill"><i class="fas fa-box"></i> WooCommerce Product</span>
            <h1><?php the_title(); ?></h1>
            <?php if ($product) : ?>
                <div class="product-price-hero"><?php echo $product->get_price_html(); ?></div>
            <?php endif; ?>
        </div>
    </section>

    <section class="single-product-main">
        <div class="container">
            <?php if (function_exists('wc_print_notices')) wc_print_notices(); ?>

            <div class="overview-grid single-product-grid">
                <div class="glass-card product-gallery-card fade-in">
                    <?php
                    if (has_post_thumbnail()) {
                        the_post_thumbnail('large', array('class' => 'product-featured-img'));
                    } else {
                        echo '<div class="product-placeholder-img"><i class="fas fa-cube" style="font-size: 5rem; color: var(--primary-blue);"></i></div>';
                    }
                    ?>
                </div>

                <div class="glass-card product-details-card fade-in">
                    <h2><?php the_title(); ?></h2>

                    <?php if ($product) : ?>
                        <div class="product-price-large"><?php echo $product->get_price_html(); ?></div>

                        <div class="product-short-description" style="margin: 20px 0;">
                            <?php echo apply_filters('woocommerce_short_description', $post->post_excerpt); ?>
                        </div>

                        <div class="product-add-to-cart-wrapper" style="margin-top: 30px;">
                            <?php
                            if ($product->is_type('variable')) {
                                woocommerce_variable_add_to_cart();
                            } elseif ($product->is_type('simple')) {
                                woocommerce_simple_add_to_cart();
                            } else {
                                woocommerce_template_single_add_to_cart();
                            }
                            ?>
                        </div>
                    <?php else : ?>
                        <div class="product-description" style="margin: 20px 0;">
                            <?php the_content(); ?>
                        </div>
                        <a href="<?php echo esc_url(home_url('/contact?product=' . get_the_ID())); ?>" class="btn btn-primary">Inquire About Product</a>
                    <?php endif; ?>
                </div>
            </div>

            <!-- Full Description Tab/Card -->
            <div class="glass-card product-full-description fade-in" style="margin-top: 40px;">
                <h3>Product Details</h3>
                <div class="content-body" style="margin-top: 15px;">
                    <?php the_content(); ?>
                </div>
            </div>

            <!-- Related Products -->
            <?php
            if (function_exists('woocommerce_related_products') && $product) {
                echo '<div class="related-products-wrapper fade-in" style="margin-top: 60px;">';
                echo '<h3>Related Products</h3>';
                woocommerce_related_products(array('posts_per_page' => 3, 'columns' => 3));
                echo '</div>';
            }
            ?>
        </div>
    </section>
</div>

<?php
endwhile;
get_footer();
?>
