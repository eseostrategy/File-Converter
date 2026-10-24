<?php
get_header(); ?>

<div class="container">
    <section class="page-hero fade-in">
        <?php
        if ( have_posts() ) :
            while ( have_posts() ) :
                the_post();
                ?>
                <h1><?php the_title(); ?></h1>
                <div class="content">
                    <?php the_content(); ?>
                </div>
                <?php
            endwhile;
        else :
            ?>
            <h1>Not Found</h1>
            <p>The page you are looking for does not exist.</p>
            <?php
        endif;
        ?>
    </section>
</div>

<?php get_footer(); ?>
