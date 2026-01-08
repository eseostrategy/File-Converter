    <!-- Footer -->
    <footer>
        <div class="container">
            <div class="footer-grid">
                <div class="footer-col">
                    <div class="logo">
                        <i class="fas fa-chart-line"></i>
                        ESEO<span>STRATEGY</span>
                    </div>
                    <p style="margin-top: 1rem;">Maximizing online visibility through data-driven SEO strategies.</p>
                    <div class="social-links">
                        <?php if ( get_theme_mod( 'eseo_social_twitter', 'https://twitter.com/Mobeen_DMN' ) ) : ?>
                            <a href="<?php echo esc_url( get_theme_mod( 'eseo_social_twitter', 'https://twitter.com/Mobeen_DMN' ) ); ?>" target="_blank" class="social-link"><i class="fab fa-twitter"></i></a>
                        <?php endif; ?>

                        <?php if ( get_theme_mod( 'eseo_social_facebook', 'https://www.facebook.com/eseostrategy/' ) ) : ?>
                            <a href="<?php echo esc_url( get_theme_mod( 'eseo_social_facebook', 'https://www.facebook.com/eseostrategy/' ) ); ?>" target="_blank" class="social-link"><i class="fab fa-facebook-f"></i></a>
                        <?php endif; ?>

                        <?php if ( get_theme_mod( 'eseo_social_telegram', 'https://t.me/eseostrategy' ) ) : ?>
                            <a href="<?php echo esc_url( get_theme_mod( 'eseo_social_telegram', 'https://t.me/eseostrategy' ) ); ?>" target="_blank" class="social-link"><i class="fab fa-telegram"></i></a>
                        <?php endif; ?>

                        <?php if ( get_theme_mod( 'eseo_social_skype', 'https://join.skype.com/invite/vnB22p2eSrCb' ) ) : ?>
                            <a href="<?php echo esc_url( get_theme_mod( 'eseo_social_skype', 'https://join.skype.com/invite/vnB22p2eSrCb' ) ); ?>" target="_blank" class="social-link"><i class="fab fa-skype"></i></a>
                        <?php endif; ?>
                    </div>
                </div>
                <div class="footer-col">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><a href="<?php echo home_url(); ?>">Home</a></li>
                        <li><a href="<?php echo home_url('/services'); ?>">Services</a></li>
                        <li><a href="<?php echo home_url('/about-us'); ?>">About Us</a></li>
                        <li><a href="<?php echo home_url('/contact'); ?>">Contact</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h3>Services</h3>
                    <ul>
                        <li><a href="<?php echo home_url('/services'); ?>">Monthly SEO Package</a></li>
                        <li><a href="<?php echo home_url('/services'); ?>">PBN Backlinks</a></li>
                        <li><a href="<?php echo home_url('/services'); ?>">Guest Post</a></li>
                        <li><a href="<?php echo home_url('/services'); ?>">SEO Backlinks</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h3>Contact Info</h3>
                    <ul>
                        <li><i class="fas fa-envelope"></i> <?php echo esc_html( get_theme_mod( 'eseo_email', 'support@eseostrategy.com' ) ); ?></li>
                        <li><i class="fas fa-phone"></i> <?php echo esc_html( get_theme_mod( 'eseo_phone', '+92 3113793342' ) ); ?></li>
                        <li><i class="fas fa-map-marker-alt"></i> <?php echo esc_html( get_theme_mod( 'eseo_address', 'Office# 39, Reshmeen Center, Latifabad# 7, Hyderabad, Pakistan' ) ); ?></li>
                    </ul>
                </div>
            </div>
            <div class="copyright">
                <p>&copy; 2023 ESEO Strategy. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <?php wp_footer(); ?>
</body>
</html>
