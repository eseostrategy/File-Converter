<?php
get_header(); ?>

    <!-- Hero Section with Interactive Visual -->
    <section class="hero hero-interactive">
        <div class="hero-bg-glow"></div>
        <div class="container hero-container">
            <div class="hero-text-content fade-in-stagger">
                <div class="hero-badge reveal-item">
                    <span class="pulse-dot"></span> Engineering-Grade SEO Architecture
                </div>
                <h1 class="reveal-item">Data-Driven SEO Solutions That <span>Rank & Convert</span></h1>
                <p class="lead reveal-item">Dominate search results with our high-authority SEO strategies built for high-competition niches like Casino, Betting, FinTech, and iGaming. We deliver real organic traffic, high-trust backlinks, and measurable ROI.</p>
                <div class="hero-btns reveal-item">
                    <a href="<?php echo esc_url(home_url('/contact')); ?>" class="btn btn-primary btn-hero">Get Free SEO Audit <i class="fas fa-arrow-right"></i></a>
                    <a href="<?php echo esc_url(home_url('/services')); ?>" class="btn btn-secondary btn-hero">View All Services</a>
                </div>
                <div class="hero-trust-badges reveal-item">
                    <span><i class="fas fa-shield-alt"></i> 100% White-Hat Methods</span>
                    <span><i class="fas fa-chart-line"></i> 500+ Active Campaigns</span>
                    <span><i class="fas fa-star"></i> 4.9/5 Rating</span>
                </div>
            </div>

            <!-- Hero Interactive Visual Container -->
            <div class="hero-visual-container fade-in">
                <div class="hero-visual-card glass-card parallax-target" data-speed="0.05">
                    <!-- Floating Search Simulation Widget -->
                    <div class="floating-widget search-widget">
                        <div class="search-bar-sim">
                            <i class="fas fa-search search-icon"></i>
                            <span class="typing-text" id="heroTypingText">best casino backlinks</span>
                            <span class="blinking-cursor">|</span>
                            <span class="search-badge">#1 Ranked</span>
                        </div>
                        <div class="search-result-preview">
                            <div class="result-title">ESEO Strategy — #1 Ranking SEO Campaign</div>
                            <div class="result-url">https://eseostrategy.com/service/monthly-seo</div>
                            <div class="result-snippet">Organic Traffic: +350% | Organic Keywords: 1,250 Top 3 Placements</div>
                        </div>
                    </div>

                    <!-- SVG Network & Analytics Visual -->
                    <svg class="hero-network-svg" viewBox="0 0 500 350" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="hero_line_grad" x1="0" y1="0" x2="500" y2="350" gradientUnits="userSpaceOnUse">
                                <stop stop-color="#3B82F6" stop-opacity="0.8" />
                                <stop offset="1" stop-color="#8B5CF6" stop-opacity="0.8" />
                            </linearGradient>
                            <linearGradient id="chart_fill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.4"/>
                                <stop offset="100%" stop-color="#3B82F6" stop-opacity="0"/>
                            </linearGradient>
                        </defs>
                        <!-- Grid lines -->
                        <path d="M50 250 H450 M50 200 H450 M50 150 H450 M50 100 H450" stroke="rgba(255,255,255,0.05)" stroke-dasharray="4 4" />
                        <!-- Growth Line Chart -->
                        <path class="chart-area" d="M50 250 C120 230 180 190 250 140 C320 90 380 80 450 40 L450 250 Z" fill="url(#chart_fill)"/>
                        <path class="chart-line-animated" d="M50 250 C120 230 180 190 250 140 C320 90 380 80 450 40" stroke="url(#hero_line_grad)" stroke-width="4" stroke-linecap="round"/>

                        <!-- Pulse Network Nodes -->
                        <g class="network-nodes">
                            <circle cx="50" cy="250" r="6" fill="#3B82F6" />
                            <circle cx="150" cy="210" r="7" fill="#3B82F6" />
                            <circle cx="250" cy="140" r="8" fill="#8B5CF6" />
                            <circle cx="350" cy="85" r="9" fill="#8B5CF6" />
                            <circle cx="450" cy="40" r="10" fill="#10B981" class="node-pulse" />
                        </g>
                    </svg>

                    <!-- Floating Analytics Card Widget -->
                    <div class="floating-widget analytics-widget">
                        <div class="widget-icon"><i class="fas fa-rocket"></i></div>
                        <div class="widget-info">
                            <span class="widget-val">+412%</span>
                            <span class="widget-lbl">Organic Visibility</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Trust Stats Bar -->
    <section class="stats-section reveal-section">
        <div class="container">
            <div class="stats-grid">
                <div class="stat-card glass-card">
                    <span class="stat-number" data-target="500">500+</span>
                    <p>Clients Ranked #1</p>
                </div>
                <div class="stat-card glass-card">
                    <span class="stat-number" data-target="98">98%</span>
                    <p>Client Retention</p>
                </div>
                <div class="stat-card glass-card">
                    <span class="stat-number" data-target="10">10M+</span>
                    <p>Organic Traffic Delivered</p>
                </div>
                <div class="stat-card glass-card">
                    <span class="stat-number">24/7</span>
                    <p>Dedicated Support</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Services Overview Section -->
    <section class="services-overview-section reveal-section">
        <div class="container">
            <div class="section-header text-center">
                <span class="section-badge"><i class="fas fa-cogs"></i> What We Offer</span>
                <h2>Our High-Impact <span>SEO Services</span></h2>
                <p>Tailored strategies built for competitive industries that require maximum link authority and technical excellence.</p>
            </div>

            <div class="services-grid">
                <a href="<?php echo esc_url(home_url('/service/monthly-seo')); ?>" class="glass-card service-card interactive-card">
                    <div class="card-icon-wrapper"><i class="fas fa-calendar-check service-icon"></i></div>
                    <h3>Monthly SEO Package</h3>
                    <p>Comprehensive hands-off monthly SEO campaigns. Technical fixes, content creation, and authority outreach built into one growth plan.</p>
                    <div class="card-cta-indicator">Explore Service <i class="fas fa-arrow-right"></i></div>
                </a>

                <a href="<?php echo esc_url(home_url('/service/pbn-backlinks')); ?>" class="glass-card service-card interactive-card">
                    <div class="card-icon-wrapper"><i class="fas fa-network-wired service-icon"></i></div>
                    <h3>PBN Backlinks</h3>
                    <p>High Trust Flow, zero-footprint network backlinks with clean metrics designed for immediate keyword movement.</p>
                    <div class="card-cta-indicator">Explore Service <i class="fas fa-arrow-right"></i></div>
                </a>

                <a href="<?php echo esc_url(home_url('/service/guest-post')); ?>" class="glass-card service-card interactive-card">
                    <div class="card-icon-wrapper"><i class="fas fa-pen-fancy service-icon"></i></div>
                    <h3>Guest Post Outreach</h3>
                    <p>Contextual editorial links inside original articles published on high-authority sites with real organic traffic.</p>
                    <div class="card-cta-indicator">Explore Service <i class="fas fa-arrow-right"></i></div>
                </a>

                <a href="<?php echo esc_url(home_url('/service/seo-backlinks')); ?>" class="glass-card service-card interactive-card">
                    <div class="card-icon-wrapper"><i class="fas fa-link service-icon"></i></div>
                    <h3>SEO Backlinks Packages</h3>
                    <p>Structured multi-tiered backlink packages engineered for safe anchor diversification and link authority building.</p>
                    <div class="card-cta-indicator">Explore Service <i class="fas fa-arrow-right"></i></div>
                </a>

                <a href="<?php echo esc_url(home_url('/service/edu-guest-post')); ?>" class="glass-card service-card interactive-card">
                    <div class="card-icon-wrapper"><i class="fas fa-graduation-cap service-icon"></i></div>
                    <h3>EDU Guest Post</h3>
                    <p>Exclusive guest posting on educational .edu domains, providing maximum authority and trust signals to Google.</p>
                    <div class="card-cta-indicator">Explore Service <i class="fas fa-arrow-right"></i></div>
                </a>
            </div>
        </div>
    </section>

    <!-- Scroll-Linked Storytelling Section -->
    <section class="storytelling-section" id="storytellingSection">
        <div class="container">
            <div class="section-header text-center">
                <span class="section-badge"><i class="fas fa-route"></i> The ESEO Growth Blueprint</span>
                <h2>How We Scale Your Organic Visibility</h2>
                <p>Scroll down to see our four-stage engineering approach to sustainable search engine dominance.</p>
            </div>

            <div class="storytelling-sticky-container">
                <!-- Left Visual Stage Canvas/SVG Display -->
                <div class="storytelling-visual-box glass-card">
                    <div class="stage-visual-layer active" data-stage="1">
                        <div class="stage-badge">Stage 1: Discover</div>
                        <div class="stage-illustration">
                            <i class="fas fa-search-location stage-icon"></i>
                            <div class="stage-dots">
                                <span>Keyword Research</span>
                                <span>Competitor Gaps</span>
                                <span>Technical Audit</span>
                            </div>
                        </div>
                    </div>

                    <div class="stage-visual-layer" data-stage="2">
                        <div class="stage-badge">Stage 2: Build</div>
                        <div class="stage-illustration">
                            <i class="fas fa-cubes stage-icon"></i>
                            <div class="stage-dots">
                                <span>Contextual Links</span>
                                <span>Publisher Outreach</span>
                                <span>Content Placement</span>
                            </div>
                        </div>
                    </div>

                    <div class="stage-visual-layer" data-stage="3">
                        <div class="stage-badge">Stage 3: Optimize</div>
                        <div class="stage-illustration">
                            <i class="fas fa-tachometer-alt stage-icon"></i>
                            <div class="stage-dots">
                                <span>Site Architecture</span>
                                <span>Core Web Vitals</span>
                                <span>On-Page Signals</span>
                            </div>
                        </div>
                    </div>

                    <div class="stage-visual-layer" data-stage="4">
                        <div class="stage-badge">Stage 4: Grow</div>
                        <div class="stage-illustration">
                            <i class="fas fa-chart-line stage-icon"></i>
                            <div class="stage-dots">
                                <span>Rank #1 Dominance</span>
                                <span>Traffic Expansion</span>
                                <span>Continuous ROI</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Scroll Steps -->
                <div class="storytelling-steps">
                    <div class="story-step" data-step="1">
                        <span class="step-num">01</span>
                        <h3>Discover</h3>
                        <p>We analyze your target keywords, benchmark competitor link profiles, uncover hidden technical bottlenecks, and map high-converting opportunities.</p>
                    </div>

                    <div class="story-step" data-step="2">
                        <span class="step-num">02</span>
                        <h3>Build</h3>
                        <p>We deploy authoritative contextual backlinks, high-TF PBN placements, and custom editorial outreach on real-traffic sites.</p>
                    </div>

                    <div class="story-step" data-step="3">
                        <span class="step-num">03</span>
                        <h3>Optimize</h3>
                        <p>We refine website architecture, speed up page loading performance, optimize schema markup, and maximize on-page keyword relevance.</p>
                    </div>

                    <div class="story-step" data-step="4">
                        <span class="step-num">04</span>
                        <h3>Grow</h3>
                        <p>We systematically expand your organic keyword footprint, driving steady compounding traffic growth and long-term organic revenue.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Why ESEO Strategy -->
    <section class="why-us-section reveal-section">
        <div class="container">
            <div class="section-header text-center">
                <span class="section-badge"><i class="fas fa-award"></i> The Advantage</span>
                <h2>Why Top Brands Trust <span>ESEO Strategy</span></h2>
            </div>

            <div class="services-grid">
                <div class="glass-card feature-card">
                    <i class="fas fa-bolt feature-icon"></i>
                    <h3>Speed & Execution</h3>
                    <p>We move fast. Campaigns are launched with minimal delay and monitored daily for optimal keyword indexing speed.</p>
                </div>
                <div class="glass-card feature-card">
                    <i class="fas fa-shield-alt feature-icon"></i>
                    <h3>Safety & Compliance</h3>
                    <p>We strictly adhere to zero-footprint, high-quality standards that safeguard your domain against search engine penalty risks.</p>
                </div>
                <div class="glass-card feature-card">
                    <i class="fas fa-bullseye feature-icon"></i>
                    <h3>Conversion Focused</h3>
                    <p>Rankings are useless without revenue. We target high-intent transactional keywords that bring real paying customers.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- FAQs Section -->
    <section class="faq-section reveal-section">
        <div class="container">
            <div class="section-header text-center">
                <span class="section-badge"><i class="fas fa-question-circle"></i> Got Questions?</span>
                <h2>Frequently Asked Questions</h2>
            </div>

            <div class="faq-accordion" style="max-width: 800px; margin: 0 auto;">
                <div class="glass-card faq-item">
                    <button class="faq-question">
                        <span>How quickly will my site rank after launching a campaign?</span>
                        <i class="fas fa-chevron-down faq-icon"></i>
                    </button>
                    <div class="faq-answer">
                        <p>Ranking timelines depend on initial site authority and competitor strength. Most clients observe steady movement in search positions within 30-60 days.</p>
                    </div>
                </div>

                <div class="glass-card faq-item">
                    <button class="faq-question">
                        <span>Do you specialize in high-competition niches?</span>
                        <i class="fas fa-chevron-down faq-icon"></i>
                    </button>
                    <div class="faq-answer">
                        <p>Yes. We have over 10 years of experience ranking websites in competitive niches including Casino, Betting, Crypto, Finance, and Affiliate sites.</p>
                    </div>
                </div>

                <div class="glass-card faq-item">
                    <button class="faq-question">
                        <span>Are the backlinks permanent?</span>
                        <i class="fas fa-chevron-down faq-icon"></i>
                    </button>
                    <div class="faq-answer">
                        <p>All our guest posts and PBN backlinks are permanent placements with do-follow status.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Final CTA Section -->
    <section class="final-cta-section reveal-section">
        <div class="container">
            <div class="glass-card cta-banner text-center">
                <h2>Ready to Outrank Your Competition?</h2>
                <p>Request a complimentary SEO audit and consultation with our lead technical strategist.</p>
                <div class="cta-btns" style="margin-top: 25px;">
                    <a href="<?php echo esc_url(home_url('/contact')); ?>" class="btn btn-primary btn-lg">Get Free SEO Audit <i class="fas fa-arrow-right"></i></a>
                    <a href="<?php echo esc_url(home_url('/pricing')); ?>" class="btn btn-secondary btn-lg">View Pricing Plans</a>
                </div>
            </div>
        </div>
    </section>

<?php get_footer(); ?>
