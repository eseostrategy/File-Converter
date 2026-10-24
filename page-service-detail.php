<?php
/* Template Name: Service Detail */
get_header();

$service_slug = get_query_var('eseo_service');
if (!$service_slug) {
    // Fallback based on request path
    $uri = $_SERVER['REQUEST_URI'] ?? '';
    if (strpos($uri, 'monthly-seo') !== false) $service_slug = 'monthly-seo';
    elseif (strpos($uri, 'pbn-backlinks') !== false) $service_slug = 'pbn-backlinks';
    elseif (strpos($uri, 'guest-post') !== false) $service_slug = 'guest-post';
    elseif (strpos($uri, 'seo-backlinks') !== false) $service_slug = 'seo-backlinks';
    elseif (strpos($uri, 'edu-guest-post') !== false) $service_slug = 'edu-guest-post';
    else $service_slug = 'monthly-seo';
}

$services_data = array(
    'monthly-seo' => array(
        'title' => 'Monthly SEO Package',
        'badge' => 'All-in-One Solution',
        'tagline' => 'Complete hands-off SEO campaign management designed to dominate competitive rankings.',
        'icon' => 'fas fa-calendar-check',
        'overview' => 'Our Monthly SEO Package is a fully managed, end-to-end SEO service designed for brands, e-commerce, and high-competition niches like iGaming and Casino. We handle technical audits, keyword mapping, content optimization, authority link building, and monthly performance tracking.',
        'features' => array(
            'In-depth technical SEO audit & resolution',
            'Competitor gap analysis & keyword research',
            'On-page content optimization & schema markup',
            'High-authority link building & outreach',
            'Monthly ROI & Google Search Console reporting',
            'Dedicated account manager & continuous support'
        ),
        'packages' => array(
            array(
                'name' => 'Starter Monthly',
                'price' => '$999',
                'period' => '/month',
                'items' => array('Up to 15 Target Keywords', '2 Premium Guest Posts/mo', 'Technical Audit & Fixes', 'Monthly Progress Report')
            ),
            array(
                'name' => 'Growth Monthly',
                'price' => '$2,499',
                'period' => '/month',
                'popular' => true,
                'items' => array('Up to 40 Target Keywords', '5 High DA Backlinks/mo', '4 Optimized Articles/mo', 'Bi-weekly Strategy Calls')
            ),
            array(
                'name' => 'Enterprise Scale',
                'price' => '$4,999',
                'period' => '/month',
                'items' => array('Unlimited Keywords', 'Custom High-Authority Link Building', 'Dedicated SEO Engineer', '24/7 Priority Support')
            )
        ),
        'faqs' => array(
            array('q' => 'How long does it take to see results?', 'a' => 'Most campaigns show noticeable movement in impressions and keyword rankings within 60 to 90 days, with exponential growth over 6-12 months.'),
            array('q' => 'Are there any long-term contracts?', 'a' => 'No long-term lock-in contracts. Our services run on a flexible month-to-month basis because our results keep clients with us.')
        )
    ),
    'pbn-backlinks' => array(
        'title' => 'High Authority PBN Backlinks',
        'badge' => 'Pure Ranking Power',
        'tagline' => 'High domain authority, zero-footprint private blog network links engineered for ranking impact.',
        'icon' => 'fas fa-network-wired',
        'overview' => 'Supercharge your link profile with curated PBN backlinks from clean, aged domains with established trust metrics (TF 20+, DA 30+). Built with unique IPs, distinct hosting environments, and natural link placements.',
        'features' => array(
            'Aged, clean domains with high TF/CF & DA',
            'Strict zero-footprint network isolation',
            '100% Do-Follow contextual links inside 500+ word content',
            'Drip-fed indexing for natural velocity',
            'Complete secrecy and site privacy protection'
        ),
        'packages' => array(
            array(
                'name' => 'PBN Starter',
                'price' => '$299',
                'period' => 'one-time',
                'items' => array('10 High TF PBN Links', 'Unique Class-C IPs', '100% Do-Follow', 'Report Included')
            ),
            array(
                'name' => 'PBN Pro',
                'price' => '$699',
                'period' => 'one-time',
                'popular' => true,
                'items' => array('25 High TF PBN Links', 'Max DA 40+ Domains', 'Custom Anchor Text', 'Drip-Fed 14 Days')
            ),
            array(
                'name' => 'PBN Dominator',
                'price' => '$1,299',
                'period' => 'one-time',
                'items' => array('50 High TF PBN Links', 'Top Tier Domains', 'Priority Drip Indexing', 'Full Anonymity')
            )
        ),
        'faqs' => array(
            array('q' => 'What metrics do your PBN domains have?', 'a' => 'Our domains have minimum Majestic Trust Flow (TF) 15+ and Moz Domain Authority (DA) 25+ with clean backlink histories.'),
            array('q' => 'Is drip feeding included?', 'a' => 'Yes, all links are drip-fed over 10-20 days to ensure a natural link velocity profile.')
        )
    ),
    'guest-post' => array(
        'title' => 'Contextual Guest Post Outreach',
        'badge' => 'Real Organic Traffic',
        'tagline' => 'White-hat editorial placements on active blogs with verified organic search traffic.',
        'icon' => 'fas fa-pen-fancy',
        'overview' => 'Acquire high-quality contextual backlinks placed within well-written articles on real, ranking websites in your industry. Every publisher site is manually vetted for genuine organic traffic, clean spam scores, and strong domain authority.',
        'features' => array(
            '100% genuine blogger outreach',
            'Sites verified for real organic traffic (Ahrefs / SEMrush)',
            'Professionally written 800+ word niche articles',
            'Permanent do-follow links embedded contextually',
            'Transparent placement reports'
        ),
        'packages' => array(
            array(
                'name' => 'DA 30+ Placement',
                'price' => '$149',
                'period' => '/post',
                'items' => array('DA 30+ Verified Site', '1k+ Organic Traffic', '800 Word Article', 'Permanent Do-Follow')
            ),
            array(
                'name' => 'DA 50+ Placement',
                'price' => '$299',
                'period' => '/post',
                'popular' => true,
                'items' => array('DA 50+ Premium Site', '5k+ Organic Traffic', '1,000 Word Article', 'Contextual Anchor')
            ),
            array(
                'name' => 'DA 70+ Authority',
                'price' => '$599',
                'period' => '/post',
                'items' => array('DA 70+ Authority Magazine', '20k+ Organic Traffic', '1,200 Word Article', 'Editorial Placement')
            )
        ),
        'faqs' => array(
            array('q' => 'Can I approve the content before publication?', 'a' => 'Yes, we provide draft preview options upon request prior to publishing on client blogs.'),
            array('q' => 'Are these links permanent?', 'a' => 'Yes, all our guest post placements are permanent do-follow backlinks.')
        )
    ),
    'seo-backlinks' => array(
        'title' => 'Multi-Tiered SEO Backlinks',
        'badge' => 'High Diversity',
        'tagline' => 'Balanced, multi-channel link building campaigns for safe profile diversification.',
        'icon' => 'fas fa-link',
        'overview' => 'Build a natural, authoritative backlink profile using our multi-tiered backlink strategies. Combining web 2.0s, high DA profile links, contextual shares, and social signals to pass maximum authority safely.',
        'features' => array(
            'Diversified backlink anchor mix',
            'Tier 1 & Tier 2 link structure',
            'High DA profile & contextual backlinks',
            'Safe link velocity management',
            'Detailed submission & URL report'
        ),
        'packages' => array(
            array(
                'name' => 'Diversity Tier 1',
                'price' => '$199',
                'period' => 'one-time',
                'items' => array('100 High DA Backlinks', 'Profile & Web 2.0 Mix', 'Anchor Diversification', 'Full Excel Report')
            ),
            array(
                'name' => 'Authority Tier 2',
                'price' => '$499',
                'period' => 'one-time',
                'popular' => true,
                'items' => array('300 Multi-Tiered Links', 'Tier 2 PBN Boosting', 'Indexification Included', 'Faster Ranking Response')
            ),
            array(
                'name' => 'Niche Dominator',
                'price' => '$899',
                'period' => 'one-time',
                'items' => array('700+ Blended Backlinks', 'Social Signals + Web 2.0', 'Tier 1 & Tier 2 Stack', 'Maximum Link Juice')
            )
        ),
        'faqs' => array(
            array('q' => 'Is this safe for new websites?', 'a' => 'Yes! We use natural anchor text ratios and safe tiering to ensure complete safety for new and existing domains.')
        )
    ),
    'edu-guest-post' => array(
        'title' => 'EDU Guest Post & Authority Links',
        'badge' => 'Top Level Trust',
        'tagline' => 'High trust signals from university and educational .edu domain placements.',
        'icon' => 'fas fa-graduation-cap',
        'overview' => 'Educational .edu links carry unmatched trust in search engine algorithms. Get contextual placements on real university blogs and departmental portals to signal supreme legitimacy to search engines.',
        'features' => array(
            'Rare, high-trust .edu domains',
            'Clean domain authority & high trust flow',
            'Contextual do-follow link integration',
            '100% white-hat placement methods',
            'Guaranteed indexing'
        ),
        'packages' => array(
            array(
                'name' => 'Single EDU Post',
                'price' => '$249',
                'period' => '/post',
                'items' => array('1 Contextual .edu Link', 'High Trust Flow Site', '800 Word Niche Content', 'Guaranteed Indexing')
            ),
            array(
                'name' => '3x EDU Power Pack',
                'price' => '$649',
                'period' => 'one-time',
                'popular' => true,
                'items' => array('3 Contextual .edu Links', 'Distinct University Portals', 'Custom Anchor Allocation', 'Maximum Authority Signal')
            ),
            array(
                'name' => '5x EDU Dominator',
                'price' => '$999',
                'period' => 'one-time',
                'items' => array('5 Premium .edu Links', 'Top Rank Impact', 'Complete Index Report', 'Priority Support')
            )
        ),
        'faqs' => array(
            array('q' => 'Why are .edu links so powerful?', 'a' => 'Google accords massive trust metrics to educational institutions because they are difficult to obtain and rarely spam.')
        )
    )
);

$curr_service = $services_data[$service_slug] ?? $services_data['monthly-seo'];
?>

<div class="service-detail-wrapper">
    <!-- Hero Header -->
    <section class="page-hero service-hero">
        <div class="container">
            <span class="service-badge-pill"><i class="<?php echo esc_attr($curr_service['icon']); ?>"></i> <?php echo esc_html($curr_service['badge']); ?></span>
            <h1><?php echo esc_html($curr_service['title']); ?></h1>
            <p class="hero-tagline"><?php echo esc_html($curr_service['tagline']); ?></p>
            <div class="hero-actions" style="margin-top: 2rem;">
                <a href="#packages" class="btn btn-primary">View Packages & Pricing</a>
                <a href="<?php echo esc_url(home_url('/contact?service=' . urlencode($service_slug))); ?>" class="btn btn-secondary">Request Custom Consultation</a>
            </div>
        </div>
    </section>

    <!-- Overview Section -->
    <section class="service-overview-section">
        <div class="container">
            <div class="overview-grid">
                <div class="glass-card overview-content fade-in">
                    <h2>Overview</h2>
                    <p class="lead-text"><?php echo esc_html($curr_service['overview']); ?></p>

                    <h3 style="margin-top: 2rem; color: white;">Key Campaign Highlights</h3>
                    <ul class="check-list">
                        <?php foreach ($curr_service['features'] as $feature) : ?>
                            <li><i class="fas fa-check-circle check-icon"></i> <span><?php echo esc_html($feature); ?></span></li>
                        <?php endforeach; ?>
                    </ul>
                </div>

                <div class="glass-card overview-visual fade-in">
                    <div class="visual-graphic-container">
                        <svg class="service-graphic-svg" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="400" height="300" rx="16" fill="url(#bg_grad)" />
                            <circle cx="200" cy="150" r="80" stroke="#3B82F6" stroke-width="2" stroke-dasharray="4 4" class="rotating-ring" />
                            <circle cx="200" cy="150" r="50" fill="rgba(59, 130, 246, 0.2)" stroke="#8B5CF6" stroke-width="2" />
                            <path d="M170 150L190 170L230 130" stroke="#10B981" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                            <text x="200" y="260" text-anchor="middle" fill="#94A3B8" font-family="sans-serif" font-size="14">ESEO Strategy Engineered System</text>
                            <defs>
                                <linearGradient id="bg_grad" x1="0" y1="0" x2="400" y2="300" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#0F172A" />
                                    <stop offset="1" stop-color="#1E1B4B" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Packages Section -->
    <section id="packages" class="service-packages-section">
        <div class="container">
            <h2 class="section-heading fade-in">Choose Your <span>Package</span></h2>
            <p class="section-subheading fade-in">Transparent pricing with no hidden fees or contracts.</p>

            <div class="services-grid package-cards-grid">
                <?php foreach ($curr_service['packages'] as $pkg) : ?>
                    <div class="glass-card pricing-card fade-in <?php echo !empty($pkg['popular']) ? 'popular' : ''; ?>">
                        <?php if (!empty($pkg['popular'])) : ?>
                            <div class="popular-badge">RECOMMENDED</div>
                        <?php endif; ?>
                        <h3><?php echo esc_html($pkg['name']); ?></h3>
                        <div class="price"><?php echo esc_html($pkg['price']); ?><span><?php echo esc_html($pkg['period']); ?></span></div>
                        <ul class="features-list">
                            <?php foreach ($pkg['items'] as $item) : ?>
                                <li><i class="fas fa-check"></i> <?php echo esc_html($item); ?></li>
                            <?php endforeach; ?>
                        </ul>
                        <a href="<?php echo esc_url(home_url('/contact?service=' . urlencode($service_slug) . '&plan=' . urlencode($pkg['name']))); ?>" class="btn <?php echo !empty($pkg['popular']) ? 'btn-primary' : 'btn-secondary'; ?>" style="width: 100%;">Order Now</a>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

    <!-- FAQ Section -->
    <?php if (!empty($curr_service['faqs'])) : ?>
    <section class="service-faq-section">
        <div class="container">
            <h2 class="section-heading fade-in">Frequently Asked Questions</h2>
            <div class="faq-list" style="max-width: 800px; margin: 0 auto;">
                <?php foreach ($curr_service['faqs'] as $faq) : ?>
                    <div class="glass-card faq-card fade-in" style="margin-bottom: 20px;">
                        <h3><i class="fas fa-question-circle" style="color: var(--primary-blue); margin-right: 10px;"></i> <?php echo esc_html($faq['q']); ?></h3>
                        <p style="margin-top: 10px; margin-bottom: 0;"><?php echo esc_html($faq['a']); ?></p>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>
    <?php endif; ?>

    <!-- Related Services -->
    <section class="related-services-section">
        <div class="container">
            <h2 class="section-heading fade-in">Related Services</h2>
            <div class="services-grid" style="margin-top: 30px;">
                <?php
                foreach ($services_data as $s_key => $s_val) :
                    if ($s_key === $service_slug) continue;
                ?>
                    <a href="<?php echo esc_url(home_url('/service/' . $s_key)); ?>" class="glass-card service-card fade-in">
                        <i class="<?php echo esc_attr($s_val['icon']); ?> service-icon"></i>
                        <h3><?php echo esc_html($s_val['title']); ?></h3>
                        <p><?php echo esc_html(wp_trim_words($s_val['overview'], 15)); ?></p>
                        <span class="card-link-text">Learn More <i class="fas fa-arrow-right"></i></span>
                    </a>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

    <!-- Bottom CTA -->
    <section class="final-cta-section">
        <div class="container">
            <div class="glass-card cta-box fade-in" style="text-align: center; padding: 60px 30px;">
                <h2>Ready to elevate your organic search strategy?</h2>
                <p>Speak directly with our senior SEO architects and build a campaign that converts.</p>
                <a href="<?php echo esc_url(home_url('/contact?service=' . urlencode($service_slug))); ?>" class="btn btn-primary btn-lg" style="margin-top: 20px;">Get Started Today</a>
            </div>
        </div>
    </section>
</div>

<?php get_footer(); ?>
