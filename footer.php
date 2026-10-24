    <!-- Footer -->
    <footer class="site-footer">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-col brand-col">
                    <div class="logo">
                        <a href="<?php echo esc_url(home_url('/')); ?>" class="logo-link">
                            <span class="logo-icon"><i class="fas fa-chart-line"></i></span>
                            <span class="logo-text">ESEO<span class="logo-accent">STRATEGY</span></span>
                        </a>
                    </div>
                    <p class="footer-tagline">Maximizing online visibility and organic growth through engineering-grade SEO strategies and data-driven execution.</p>
                    <div class="social-links">
                        <?php if ( get_theme_mod( 'eseo_social_twitter', 'https://twitter.com/Mobeen_DMN' ) ) : ?>
                            <a href="<?php echo esc_url( get_theme_mod( 'eseo_social_twitter', 'https://twitter.com/Mobeen_DMN' ) ); ?>" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                        <?php endif; ?>

                        <?php if ( get_theme_mod( 'eseo_social_facebook', 'https://www.facebook.com/eseostrategy/' ) ) : ?>
                            <a href="<?php echo esc_url( get_theme_mod( 'eseo_social_facebook', 'https://www.facebook.com/eseostrategy/' ) ); ?>" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
                        <?php endif; ?>

                        <?php if ( get_theme_mod( 'eseo_social_telegram', 'https://t.me/eseostrategy' ) ) : ?>
                            <a href="<?php echo esc_url( get_theme_mod( 'eseo_social_telegram', 'https://t.me/eseostrategy' ) ); ?>" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Telegram"><i class="fab fa-telegram"></i></a>
                        <?php endif; ?>

                        <?php if ( get_theme_mod( 'eseo_social_skype', 'https://join.skype.com/invite/vnB22p2eSrCb' ) ) : ?>
                            <a href="<?php echo esc_url( get_theme_mod( 'eseo_social_skype', 'https://join.skype.com/invite/vnB22p2eSrCb' ) ); ?>" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Skype"><i class="fab fa-skype"></i></a>
                        <?php endif; ?>
                    </div>
                </div>

                <div class="footer-col">
                    <h3>Quick Links</h3>
                    <ul class="footer-links">
                        <li><a href="<?php echo esc_url(home_url('/')); ?>">Home</a></li>
                        <li><a href="<?php echo esc_url(home_url('/services')); ?>">Services & Catalog</a></li>
                        <li><a href="<?php echo esc_url(home_url('/about-us')); ?>">About Us</a></li>
                        <li><a href="<?php echo esc_url(home_url('/results')); ?>">Case Studies & Results</a></li>
                        <li><a href="<?php echo esc_url(home_url('/pricing')); ?>">Pricing Plans</a></li>
                        <li><a href="<?php echo esc_url(home_url('/contact')); ?>">Contact Us</a></li>
                    </ul>
                </div>

                <div class="footer-col">
                    <h3>Popular Services</h3>
                    <ul class="footer-links">
                        <li><a href="<?php echo esc_url(home_url('/service/monthly-seo')); ?>">Monthly SEO Package</a></li>
                        <li><a href="<?php echo esc_url(home_url('/service/pbn-backlinks')); ?>">PBN Backlinks</a></li>
                        <li><a href="<?php echo esc_url(home_url('/service/guest-post')); ?>">Guest Post Outreach</a></li>
                        <li><a href="<?php echo esc_url(home_url('/service/seo-backlinks')); ?>">SEO Backlinks Packages</a></li>
                        <li><a href="<?php echo esc_url(home_url('/service/edu-guest-post')); ?>">EDU Guest Post</a></li>
                    </ul>
                </div>

                <div class="footer-col contact-col">
                    <h3>Contact Information</h3>
                    <ul class="footer-contact">
                        <li><i class="fas fa-envelope"></i> <a href="mailto:<?php echo esc_attr( get_theme_mod( 'eseo_email', 'support@eseostrategy.com' ) ); ?>"><?php echo esc_html( get_theme_mod( 'eseo_email', 'support@eseostrategy.com' ) ); ?></a></li>
                        <li><i class="fas fa-phone"></i> <a href="tel:<?php echo esc_attr( preg_replace( '/[^0-9+]/', '', get_theme_mod( 'eseo_phone', '+92 3113793342' ) ) ); ?>"><?php echo esc_html( get_theme_mod( 'eseo_phone', '+92 3113793342' ) ); ?></a></li>
                        <li><i class="fas fa-map-marker-alt"></i> <span><?php echo esc_html( get_theme_mod( 'eseo_address', 'Office# 39, Reshmeen Center, Latifabad# 7, Hyderabad, Pakistan' ) ); ?></span></li>
                    </ul>
                </div>
            </div>

            <div class="footer-bottom">
                <div class="copyright">
                    <p>&copy; <?php echo date('Y'); ?> ESEO Strategy. All rights reserved.</p>
                </div>
            </div>
        </div>
    </footer>

    <?php wp_footer(); ?>
</body>
</html>
