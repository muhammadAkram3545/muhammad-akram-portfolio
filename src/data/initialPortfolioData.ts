import { PortfolioData } from '../types/portfolio';

// Local high-fidelity generated assets
const avatarImg = '/assets/images/akram_hero_cutout_portrait_1791557626698.jpg';
const heroWorkspaceImg = '/assets/images/cinematic_hero_workspace_backdrop_1791557662832.jpg';
const webSaasImg = '/assets/images/showcase_web_saas_1791008421310.jpg';
const brand3dImg = '/assets/images/showcase_brand_3d_1791008437908.jpg';
const videoMotionImg = '/assets/images/showcase_video_motion_1791008451403.jpg';

export const initialPortfolioData: PortfolioData = {
  schemaVersion: 3,
  version: 1,
  lastUpdated: new Date().toISOString(),

  personal: {
    fullName: 'Muhammad Akram',
    firstName: 'Muhammad',
    lastName: 'Akram',
    roles: [
      'Junior Web Developer',
      'WordPress & Shopify Developer',
      'Front-End Web Developer'
    ],
    headline: 'Junior Web Developer | WordPress & Shopify Developer',
    tagline: 'Creating functional, user-friendly websites & digital experiences',
    shortBio: "I'm Muhammad Akram, a junior web developer focused on creating functional, user-friendly websites and digital experiences. I work with WordPress, Shopify, HTML, CSS, JavaScript, Bootstrap, and modern website-building tools.",
    detailedBio: [
      "I'm Muhammad Akram, a junior web developer focused on creating functional, user-friendly websites and digital experiences. I work with WordPress, Shopify, HTML, CSS, JavaScript, Bootstrap, and modern website-building tools.",
      "Through practical projects, I have developed experience in website design, e-commerce websites, responsive layouts, website customization, and front-end development. I am continuously improving my skills through structured learning and hands-on projects.",
      "My goal is to help businesses establish a professional online presence through clean design, practical functionality, and user-focused digital solutions."
    ],
    location: 'North Nazimabad, Karachi · Available Globally & Remote',
    email: 'muhammadakramkhan3545@gmail.com',
    phonePlaceholder: '03347365583',
    isAvailableForWork: true,
    availabilityNote: 'Available for Junior Web Developer Roles & Projects',
    avatarUrl: avatarImg,
    heroBackgroundImageUrl: heroWorkspaceImg,
    aboutImageUrl: avatarImg,
    aboutSectionTitle: 'Building practical, user-focused digital experiences.',
    aboutQuote: 'My goal is to help businesses establish a professional online presence through clean design, practical functionality, and user-focused digital solutions.',
    aboutQuoteAuthor: 'Muhammad Akram',
    primaryButtonText: 'Explore Selected Projects',
    primaryButtonLink: '#projects',
    secondaryButtonText: 'Contact Me',
    secondaryButtonLink: '#contact',
    socials: [
      { id: 'whatsapp', name: 'WhatsApp', url: 'https://wa.me/923347365583', icon: 'MessageSquare', isPrimary: true },
      { id: 'phone', name: 'Phone: 03347365583', url: 'tel:03347365583', icon: 'Phone', isPrimary: true },
      { id: 'mail', name: 'Direct Email', url: 'mailto:muhammadakramkhan3545@gmail.com', icon: 'Mail', isPrimary: true },
      { id: 'linkedin', name: 'LinkedIn', url: 'https://www.linkedin.com/in/muhammad-akram-a54324406/', icon: 'Linkedin', isPrimary: true },
      { id: 'fiverr', name: 'Fiverr', url: 'https://www.fiverr.com/akramtech3545', icon: 'Briefcase', isPrimary: true }
    ]
  },

  intro: {
    mode: 'first_visit',
    greetingText: 'Digital Portfolio Experience',
    brandMonogram: 'MA',
    durationSeconds: 2.8,
    showSkipButton: true,
    enableSoundFx: false,
    animationStyle: 'cinematic'
  },

  theme: {
    preset: 'obsidian',
    accentColor: '#38bdf8',
    borderRadius: 'md',
    animationsEnabled: true,
    gridBackground: true,
    headingFont: 'Syne',
    bodyFont: 'Plus Jakarta Sans',
    monoFont: 'JetBrains Mono',
    maxWidth: '1440px'
  },

  navigation: [
    { id: 'nav-home', label: 'Home', href: '#home', isVisible: true, order: 1 },
    { id: 'nav-about', label: 'About', href: '#about', isVisible: true, order: 2 },
    { id: 'nav-education', label: 'Education', href: '#education', isVisible: true, order: 3 },
    { id: 'nav-skills', label: 'Skills', href: '#skills', isVisible: true, order: 4 },
    { id: 'nav-services', label: 'Services', href: '#services', isVisible: true, order: 5 },
    { id: 'nav-projects', label: 'Projects', href: '#projects', isVisible: true, order: 6 },
    { id: 'nav-experience', label: 'Experience', href: '#experience', isVisible: true, order: 7 },
    { id: 'nav-contact', label: 'Contact', href: '#contact', isVisible: true, order: 8 }
  ],

  sections: [
    {
      id: 'sec-hero',
      type: 'hero',
      title: 'Hero / Home',
      internalId: 'home',
      isVisible: true,
      order: 1,
      paddingTop: 'md',
      paddingBottom: 'md'
    },
    {
      id: 'sec-about',
      type: 'about',
      title: 'About the Creator',
      internalId: 'about',
      isVisible: true,
      order: 2,
      paddingTop: 'lg',
      paddingBottom: 'lg'
    },
    {
      id: 'sec-education',
      type: 'education',
      title: 'Academic Education',
      internalId: 'education',
      isVisible: true,
      order: 3,
      paddingTop: 'lg',
      paddingBottom: 'lg'
    },
    {
      id: 'sec-skills',
      type: 'skills',
      title: 'Skills & Proficiencies',
      internalId: 'skills',
      isVisible: true,
      order: 4,
      paddingTop: 'lg',
      paddingBottom: 'lg'
    },
    {
      id: 'sec-services',
      type: 'services',
      title: 'Offered Services',
      internalId: 'services',
      isVisible: true,
      order: 5,
      paddingTop: 'lg',
      paddingBottom: 'lg'
    },
    {
      id: 'sec-projects',
      type: 'projects',
      title: 'Selected Projects',
      internalId: 'projects',
      isVisible: true,
      order: 6,
      paddingTop: 'lg',
      paddingBottom: 'lg'
    },
    {
      id: 'sec-experience',
      type: 'experience',
      title: 'Career Milestones',
      internalId: 'experience',
      isVisible: true,
      order: 7,
      paddingTop: 'lg',
      paddingBottom: 'lg'
    },
    {
      id: 'sec-contact',
      type: 'contact',
      title: 'Contact & Hiring',
      internalId: 'contact',
      isVisible: true,
      order: 8,
      paddingTop: 'lg',
      paddingBottom: 'lg'
    }
  ],

  skills: [
    {
      id: 'skill-html-css',
      name: 'HTML5 & Modern CSS3',
      category: 'Web Development',
      proficiencyPercentage: 95,
      description: 'Semantic markup, accessible structures, CSS Grid, Flexbox, custom design tokens and Tailwind CSS.',
      iconName: 'Code',
      badgeText: 'Core Foundation',
      isVisible: true,
      order: 1,
      visualStyle: 'bar'
    },
    {
      id: 'skill-javascript',
      name: 'JavaScript (ES6+) & TypeScript',
      category: 'Web Development',
      proficiencyPercentage: 90,
      description: 'Modern asynchronous programming, type-safe architectures, DOM engineering, and component patterns.',
      iconName: 'FileCode',
      badgeText: 'Advanced',
      isVisible: true,
      order: 2,
      visualStyle: 'bar'
    },
    {
      id: 'skill-bootstrap-jquery',
      name: 'Bootstrap & jQuery Frameworks',
      category: 'Web Development',
      proficiencyPercentage: 92,
      description: 'Rapid responsive prototyping, grid systems, legacy codebase modernization, and plugin integration.',
      iconName: 'LayoutGrid',
      badgeText: 'Proficient',
      isVisible: true,
      order: 3,
      visualStyle: 'bar'
    },
    {
      id: 'skill-wordpress',
      name: 'WordPress CMS Architecture',
      category: 'CMS & Platforms',
      proficiencyPercentage: 94,
      description: 'Custom theme creation, Gutenberg blocks, database optimization, plugin configuration, and speed tuning.',
      iconName: 'Globe',
      badgeText: 'Expertise',
      isVisible: true,
      order: 4,
      visualStyle: 'bar'
    },
    {
      id: 'skill-shopify',
      name: 'Shopify Storefronts & Liquid',
      category: 'CMS & Platforms',
      proficiencyPercentage: 88,
      description: 'E-commerce theme tailoring, checkout customization, app configuration, conversion rate optimization.',
      iconName: 'ShoppingBag',
      badgeText: 'E-Commerce',
      isVisible: true,
      order: 5,
      visualStyle: 'bar'
    },
    {
      id: 'skill-page-builders',
      name: 'Elementor Pro & WPBakery',
      category: 'CMS & Platforms',
      proficiencyPercentage: 95,
      description: 'Pixel-perfect drag-and-drop page assembly, dynamic templating, responsive breakpoints, zero bloat practices.',
      iconName: 'Layers',
      badgeText: 'Mastery',
      isVisible: true,
      order: 6,
      visualStyle: 'bar'
    },
    {
      id: 'skill-uiux',
      name: 'UI/UX Interface & Interaction Design',
      category: 'UI/UX & Design',
      proficiencyPercentage: 90,
      description: 'Wireframing, user journeys, interactive Figma prototypes, design systems, ergonomic design mathematics.',
      iconName: 'Figma',
      badgeText: 'Product Design',
      isVisible: true,
      order: 7,
      visualStyle: 'bar'
    },
    {
      id: 'skill-graphic-logo',
      name: 'Graphic & Minimalist Logo Design',
      category: 'UI/UX & Design',
      proficiencyPercentage: 92,
      description: 'Vector identity creation, brand guideline books, visual balance, color theory, typography hierarchy.',
      iconName: 'PenTool',
      badgeText: 'Brand Identity',
      isVisible: true,
      order: 8,
      visualStyle: 'bar'
    },
    {
      id: 'skill-3d-design',
      name: '3D Modeling & Spatial Design',
      category: 'UI/UX & Design',
      proficiencyPercentage: 84,
      description: 'Geometric product rendering, abstract brand emblems, spatial lighting, and photorealistic asset setup.',
      iconName: 'Box',
      badgeText: 'Spatial Craft',
      isVisible: true,
      order: 9,
      visualStyle: 'bar'
    },
    {
      id: 'skill-video-editing',
      name: 'Cinematic Video Editing & Grading',
      category: 'Media & Motion',
      proficiencyPercentage: 88,
      description: 'Narrative pacing, dynamic keyframing, LUT color grading, audio synchronization, commercial reels.',
      iconName: 'Film',
      badgeText: 'Post-Production',
      isVisible: true,
      order: 10,
      visualStyle: 'bar'
    },
    {
      id: 'skill-ai-solutions',
      name: 'AI Solution Development & Workflows',
      category: 'AI & SEO',
      proficiencyPercentage: 86,
      description: 'LLM prompt engineering, automated content pipelines, API integrations, multimodal task automation.',
      iconName: 'Cpu',
      badgeText: 'Emerging Tech',
      isVisible: true,
      order: 11,
      visualStyle: 'bar'
    },
    {
      id: 'skill-seo',
      name: 'Technical & On-Page SEO Optimization',
      category: 'AI & SEO',
      proficiencyPercentage: 89,
      description: 'Core Web Vitals audit, schema structured data, semantic hierarchy, search intent alignment, keyword strategy.',
      iconName: 'TrendingUp',
      badgeText: 'Organic Growth',
      isVisible: true,
      order: 12,
      visualStyle: 'bar'
    }
  ],

  services: [
    {
      id: 'srv-web-dev',
      editorialNumber: '01',
      title: 'Full-Stack Web Development',
      category: 'Engineering',
      description: 'Tailored responsive websites, dynamic web applications, and high-performance landing pages built with clean code and modern standards.',
      iconName: 'Code',
      features: [
        'Accessible, semantic HTML5, CSS3, modern JavaScript',
        'Mobile-first responsive architecture across all breakpoints',
        'Performance optimization & sub-second Core Web Vitals',
        'Clean modular code ready for scaling and maintenance'
      ],
      ctaLabel: 'Discuss Web Project',
      isVisible: true,
      order: 1
    },
    {
      id: 'srv-cms-ecommerce',
      editorialNumber: '02',
      title: 'CMS & E-Commerce Engineering',
      category: 'Platforms',
      description: 'Comprehensive WordPress and Shopify solutions crafted for business reliability, conversion efficiency, and effortless client management.',
      iconName: 'ShoppingBag',
      features: [
        'Custom WordPress theme tailoring & Gutenberg block systems',
        'High-converting Shopify storefronts & product catalog setup',
        'Precision page construction with Elementor & WPBakery',
        'Security hardening, speed optimization, and SEO foundation'
      ],
      ctaLabel: 'Discuss Store / CMS',
      isVisible: true,
      order: 2
    },
    {
      id: 'srv-uiux-product',
      editorialNumber: '03',
      title: 'UI/UX & Digital Product Design',
      category: 'Design',
      description: 'Intentional, human-centered interfaces that balance visual sophistication with intuitive user flow and zero cognitive friction.',
      iconName: 'Layout',
      features: [
        'User research, information architecture, and wireframes',
        'High-fidelity interactive prototypes in Figma',
        'Scalable design systems and component libraries',
        'Accessibility compliance & usability testing'
      ],
      ctaLabel: 'Discuss Product Design',
      isVisible: true,
      order: 3
    },
    {
      id: 'srv-3d-branding',
      editorialNumber: '04',
      title: 'Logo Identity & 3D Spatial Design',
      category: 'Brand Visuals',
      description: 'Memorable brand marks, comprehensive visual identity systems, and photorealistic 3D assets that distinguish your brand in crowded markets.',
      iconName: 'Box',
      features: [
        'Minimalist, memorable vector logo design and iconography',
        'Complete brand identity manuals (typography, palettes, rules)',
        '3D emblem rendering, product mockups, and spatial assets',
        'Print-ready and multi-channel digital asset delivery'
      ],
      ctaLabel: 'Discuss Brand Identity',
      isVisible: true,
      order: 4
    },
    {
      id: 'srv-video-editing',
      editorialNumber: '05',
      title: 'Video Editing & Motion Graphics',
      category: 'Media',
      description: 'High-retention cinematic video post-production for brand showreels, social campaigns, corporate presentations, and product announcements.',
      iconName: 'Film',
      features: [
        'Story-driven visual editing, rhythm, and narrative pacing',
        'Dynamic typography animations and motion graphics',
        'Professional cinematic color correction and audio mastering',
        'Optimized exports for YouTube, TikTok, and web delivery'
      ],
      ctaLabel: 'Discuss Video Project',
      isVisible: true,
      order: 5
    },
    {
      id: 'srv-ai-seo',
      editorialNumber: '06',
      title: 'AI Solutions & Technical SEO',
      category: 'Intelligence & Growth',
      description: 'Practical artificial intelligence integration to streamline workflows combined with rigorous organic search ranking strategies.',
      iconName: 'Sparkles',
      features: [
        'Custom AI tool integrations & automated content pipelines',
        'Technical SEO audit, schema markup, and speed tuning',
        'Search engine visibility strategy and keyword architecture',
        'Continuous performance monitoring and analytical tracking'
      ],
      ctaLabel: 'Discuss AI & SEO',
      isVisible: true,
      order: 6
    }
  ],

  projects: [
    {
      id: 'proj-dxb-shoes',
      title: 'DXB Shoes',
      category: 'Web Applications',
      shortDescription: 'Modern footwear e-commerce storefront and dynamic product catalog featuring responsive shopping UI, product filters, and rapid navigation.',
      fullDescription: 'Production footwear showcase and online storefront engineered for DXB Shoes. Built with mobile-first responsive architecture, categorized product grids, intuitive shopping interfaces, and high-performance asset loading.',
      technologies: ['E-Commerce', 'Web Development', 'HTML5', 'CSS3', 'JavaScript', 'Responsive UI'],
      imageUrl: '/assets/images/ecommerce_fullpage_scroll_preview_1791556521959.jpg',
      fullWebsitePreviewUrl: '/assets/images/ecommerce_fullpage_scroll_preview_1791556521959.jpg',
      hasFullPagePreview: true,
      liveUrl: 'https://dxbshoes.site.je/',
      caseStudyUrl: '#',
      isFeatured: true,
      isPopular: true,
      isVisible: true,
      previewEmbedAllowed: false,
      order: 1,
      metricsOrHighlight: 'Footwear E-Commerce Store',
      projectStatus: 'Live Production',
      projectScope: 'E-commerce',
      developmentMethod: 'Custom Code'
    },
    {
      id: 'proj-wajid-shoes',
      title: 'Wajid Shoes',
      category: 'Web Applications',
      shortDescription: 'Contemporary footwear retail catalog and digital showroom displaying curated shoe collections with custom interaction design.',
      fullDescription: 'Custom online catalog and brand portal for Wajid Shoes. Features cross-device responsive layouts, high-resolution product galleries, tailored typography, and local retail brand presence.',
      technologies: ['E-Commerce', 'Web Design', 'Responsive UI', 'HTML5', 'CSS3', 'JavaScript'],
      imageUrl: '/assets/images/ecommerce_fullpage_scroll_preview_1791556521959.jpg',
      fullWebsitePreviewUrl: '/assets/images/ecommerce_fullpage_scroll_preview_1791556521959.jpg',
      hasFullPagePreview: true,
      liveUrl: 'https://wajidhoes.site.je/',
      caseStudyUrl: '#',
      isFeatured: true,
      isPopular: false,
      isVisible: true,
      previewEmbedAllowed: false,
      order: 2,
      metricsOrHighlight: 'Retail Footwear Catalog',
      projectStatus: 'Live Production',
      projectScope: 'E-commerce',
      developmentMethod: 'Custom Code'
    },
    {
      id: 'proj-faran-traders',
      title: 'Faran Traders',
      category: 'Web Applications',
      shortDescription: 'Commercial wholesale and retail portal for premium spices from Karachi, featuring product catalogs and distributor inquiries.',
      fullDescription: 'Official digital platform for Faran Traders showcasing authentic, high-grade spice blends from Karachi. Engineered for homes, restaurants, and wholesale buyers seeking pure taste and reliable bulk supply.',
      technologies: ['Web Architecture', 'SEO Optimization', 'Responsive Design', 'Brand Identity', 'Product Catalogs'],
      imageUrl: '/assets/images/faran_traders_fullpage.jpg',
      fullWebsitePreviewUrl: '/assets/images/faran_traders_fullpage.jpg',
      hasFullPagePreview: true,
      liveUrl: 'https://farantraders.com/',
      caseStudyUrl: '#',
      isFeatured: true,
      isPopular: true,
      isVisible: true,
      previewEmbedAllowed: false,
      order: 3,
      metricsOrHighlight: 'Spices & Wholesale Trading',
      projectStatus: 'Live Production',
      projectScope: 'Full Stack',
      developmentMethod: 'Custom Code'
    },
    {
      id: 'proj-pdf-aura-cloud',
      title: 'PDF Aura Cloud',
      category: 'Web Applications',
      shortDescription: 'High-speed browser-based PDF and image utility suite for instant compression, conversion, page merging, and extraction.',
      fullDescription: 'Comprehensive privacy-focused digital document suite offering client-side and cloud utilities including target-size PDF compression, multi-file merging, format conversions, splitting, and image transformations.',
      technologies: ['Web Applications', 'JavaScript', 'Cloud Tools', 'PDF Processing', 'Tailwind CSS'],
      imageUrl: '/assets/images/showcase_web_saas_1791008421310.jpg',
      fullWebsitePreviewUrl: '/assets/images/web_fullpage_scroll_preview_1791556475267.jpg',
      hasFullPagePreview: true,
      liveUrl: 'https://www.pdfora.cloud/',
      caseStudyUrl: '#',
      isFeatured: true,
      isPopular: true,
      isVisible: true,
      previewEmbedAllowed: true,
      order: 4,
      metricsOrHighlight: 'Cloud PDF Utility Suite',
      projectStatus: 'Live Production',
      projectScope: 'Full Stack',
      developmentMethod: 'Custom Code'
    },
    {
      id: 'proj-bakers-bite',
      title: 'Bakers Bite',
      category: 'Web Applications',
      shortDescription: 'Vibrant bakery and cafe showcase featuring interactive menu presentations, artisan merchandise, and direct customer ordering.',
      fullDescription: 'Delightful artisanal bakery and patisserie landing page crafted for Bakerz Bites. Features rich visual merchandising, dynamic menu cards, responsive layouts, and interactive brand storytelling.',
      technologies: ['Frontend Engineering', 'Interactive UI', 'HTML5', 'Modern CSS', 'JavaScript'],
      imageUrl: '/assets/images/bakers_bite_fullpage.jpg',
      fullWebsitePreviewUrl: '/assets/images/bakers_bite_fullpage.jpg',
      hasFullPagePreview: true,
      liveUrl: 'https://bakersbites.netlify.app/',
      caseStudyUrl: '#',
      isFeatured: true,
      isPopular: false,
      isVisible: true,
      previewEmbedAllowed: true,
      order: 5,
      metricsOrHighlight: 'Artisanal Bakery & Cafe',
      projectStatus: 'Live Production',
      projectScope: 'Frontend',
      developmentMethod: 'Custom Code'
    },
    {
      id: 'proj-techsamaj-pk',
      title: 'TechSamaj PK',
      category: 'Technology Blog',
      shortDescription: 'Dedicated Pakistani technology publication featuring software tutorials, digital tool guides, emerging web trends, and tech insights.',
      fullDescription: 'TechSamaj PK is an active technology publication built on Blogger. Features informative technical guides, mobile and PC software updates, website development tips, and digital literacy resources tailored for Pakistani readers and enthusiasts.',
      technologies: ['Blogger', 'CMS Platform', 'Technical Writing', 'SEO Optimization', 'Responsive Layout', 'HTML/CSS'],
      imageUrl: '/assets/images/techsamaj_fullpage.jpg',
      fullWebsitePreviewUrl: '/assets/images/techsamaj_fullpage.jpg',
      hasFullPagePreview: true,
      liveUrl: 'https://techsamajhpk.blogspot.com/',
      caseStudyUrl: '#',
      isFeatured: true,
      isPopular: true,
      isVisible: true,
      previewEmbedAllowed: true,
      order: 6,
      metricsOrHighlight: 'Blogger Technology Publication',
      projectStatus: 'Live Production',
      projectScope: 'Content Platform',
      developmentMethod: 'Blogger CMS'
    }
  ],

  education: {
    institute: 'Aptech Learning, North Nazimabad',
    location: 'North Nazimabad, Karachi',
    program: 'Information Systems Management',
    currentStatus: 'In Progress',
    progressNote: 'The one-year course is not yet completed. Approximately six to seven months have been completed.',
    semesters: [
      {
        id: 'sem-1',
        shortName: 'CPISM',
        name: 'Certificate of Proficiency in Information Systems Management',
        status: 'Completed',
        completionNote: 'Completed & Certified',
        modules: [
          'Effective Productivity through Office Automation',
          'Progressive Website Development',
          'Bootstrap and jQuery for Responsive Web',
          'Distributed Version Control',
          'Optimize Web for Search Engines',
          'Modern Web with XML',
          'CPISM eProject'
        ]
      },
      {
        id: 'sem-2',
        shortName: 'DISM',
        name: 'Diploma in Information Systems Management',
        status: 'In Progress',
        completionNote: 'Currently Active (Finalizing Coursework & Projects)',
        modules: [
          'Dynamic Website Development (WordPress & Core PHP)',
          'Modern Web with Next JS',
          'Developing Mobile Apps (Flutter)',
          'UI and UX Design with Figma',
          'DISM eProject'
        ]
      }
    ]
  },

  experience: [
    {
      id: 'exp-junior-web-dev',
      role: 'Junior Web & CMS Developer',
      type: 'Hands-on Projects & Freelance Practice',
      period: '2024 – Present',
      description: 'Developing functional, user-friendly websites with WordPress, Shopify, HTML, CSS, JavaScript, and Bootstrap. Focused on clean responsive design and practical business solutions.',
      highlights: [
        'Built and published complete e-commerce storefronts and business websites including DXB Shoes, Wajid Shoes, and Faran Traders',
        'Implemented mobile-first responsive layouts, product filtering systems, and speed optimization',
        'Maintained structured version-controlled project workflows with Git'
      ],
      technologies: ['WordPress', 'Shopify', 'HTML5', 'CSS3', 'JavaScript', 'Bootstrap'],
      location: 'Karachi · Remote & Onsite',
      isVisible: true,
      order: 1
    },
    {
      id: 'exp-aptech-student',
      role: 'Student — Information Systems Management',
      type: 'Aptech Learning, North Nazimabad',
      period: '2024 – Present',
      description: 'Structured academic curriculum covering progressive front-end development, responsive frameworks, dynamic PHP, Next.js, and mobile applications.',
      highlights: [
        'Completed Semester 1 (CPISM) with comprehensive responsive web development eProject',
        'Active in Semester 2 (DISM) dynamic web, WordPress & Core PHP, Flutter, and Figma UI/UX'
      ],
      technologies: ['Progressive Web Development', 'Bootstrap & jQuery', 'Git', 'SEO', 'WordPress & PHP'],
      location: 'North Nazimabad, Karachi',
      isVisible: true,
      order: 2
    }
  ],

  contact: {
    sectionTitle: "Get In Touch",
    sectionSubtitle: 'Have a project in mind, want to discuss website development, or looking to hire a dedicated junior web developer?',
    availableForWork: true,
    availableBadgeText: 'Available for Opportunities',
    hiringCtaTitle: "Let's connect and discuss your website needs.",
    hiringCtaDescription: 'Direct inquiries receive a prompt response within 24 hours. Reach out via phone, WhatsApp, email, or social profiles.',
    email: 'muhammadakramkhan3545@gmail.com',
    whatsappUrl: 'https://wa.me/923347365583',
    responseTime: 'Typically responds within 24 hours',
    showContactForm: true,
    formServices: [
      'WordPress Website Development',
      'Shopify Store Setup & Customization',
      'Front-End Web Development (HTML/CSS/JS)',
      'Responsive Website Redesign',
      'Website Maintenance & Updates'
    ]
  },

  footer: {
    brandStatement: 'Muhammad Akram — Junior Web Developer | WordPress & Shopify Developer creating clean, functional, and user-focused digital experiences.',
    copyrightText: '© 2026 Muhammad Akram. All rights reserved.',
    showBackToTop: true
  },

  seo: {
    pageTitle: 'Muhammad Akram | Web Developer, UI/UX, 3D & AI Solutions',
    metaDescription: 'Official portfolio of Muhammad Akram — Web Developer, Graphic Designer, Video Editor, Logo & 3D Designer, AI Solution Developer, and SEO Specialist.',
    keywords: [
      'Muhammad Akram',
      'Web Developer',
      'UI/UX Designer',
      '3D Designer',
      'Video Editor',
      'WordPress Developer',
      'Shopify Specialist',
      'AI Solutions Developer',
      'SEO Specialist'
    ],
    ogImage: webSaasImg
  },

  media: [
    {
      id: 'media-web-fullpage-preview',
      filename: 'web_fullpage_scroll_preview.jpg',
      originalFilename: 'web_fullpage_scroll_preview_1791556475267.jpg',
      name: 'Full-Page SaaS Website Screenshot Preview',
      url: '/assets/images/web_fullpage_scroll_preview_1791556475267.jpg',
      alt: 'Full-Page SaaS Web Application Screenshot',
      altText: 'High-resolution full-page website screenshot featuring complete layout from header to footer',
      caption: 'Full-page vertical screenshot for interactive project card scroll preview',
      description: 'Long vertical webpage screenshot asset for desktop hover scroll animation',
      mediaType: 'image',
      mimeType: 'image/jpeg',
      fileSize: '580 KB',
      fileSizeBytes: 593920,
      dimensions: '1080x1920',
      width: 1080,
      height: 1920,
      usedIn: ['Projects: Sleek Analytics Full-Page Scroll Preview'],
      source: 'local-asset',
      createdAt: '2026-10-09T10:00:00.000Z',
      updatedAt: '2026-10-09T10:00:00.000Z'
    },
    {
      id: 'media-ecommerce-fullpage-preview',
      filename: 'ecommerce_fullpage_scroll_preview.jpg',
      originalFilename: 'ecommerce_fullpage_scroll_preview_1791556521959.jpg',
      name: 'Full-Page Luxury E-Commerce Storefront Screenshot',
      url: '/assets/images/ecommerce_fullpage_scroll_preview_1791556521959.jpg',
      alt: 'Full-Page E-Commerce Audio Headphones Storefront Screenshot',
      altText: 'Full vertical webpage layout of luxury audio storefront with catalog and specifications',
      caption: 'Full-page vertical screenshot for e-commerce project scroll preview',
      description: 'Long vertical e-commerce webpage screenshot for interactive card preview',
      mediaType: 'image',
      mimeType: 'image/jpeg',
      fileSize: '620 KB',
      fileSizeBytes: 634880,
      dimensions: '1080x1920',
      width: 1080,
      height: 1920,
      usedIn: ['Media Library: E-Commerce Storefront'],
      source: 'local-asset',
      createdAt: '2026-10-09T10:00:00.000Z',
      updatedAt: '2026-10-09T10:00:00.000Z'
    },
    {
      id: 'media-hero-bg',
      filename: 'hero_dev_workspace.jpg',
      originalFilename: 'hero_dev_workspace_1791469073044.jpg',
      name: 'Developer Workspace & Design Studio Banner',
      url: heroWorkspaceImg,
      alt: 'Minimalist Engineering Workspace and Creative Studio Visual Banner',
      altText: 'Atmospheric creative technology workspace with high resolution displays and ambient lighting',
      caption: 'Full-screen visual banner background for portfolio landing section',
      description: 'Editable high-resolution visual banner background image for hero section',
      mediaType: 'image',
      mimeType: 'image/jpeg',
      fileSize: '714 KB',
      fileSizeBytes: 731611,
      dimensions: '1920x1080',
      width: 1920,
      height: 1080,
      usedIn: ['Hero Background Banner'],
      source: 'local-asset',
      createdAt: '2026-10-02T10:00:00.000Z',
      updatedAt: '2026-10-02T10:00:00.000Z'
    },
    {
      id: 'media-avatar',
      filename: 'hero_portrait_akram.jpg',
      originalFilename: 'hero_portrait_akram.jpg',
      name: 'Muhammad Akram Headshot Portrait',
      url: avatarImg,
      alt: 'Muhammad Akram - Studio Headshot Portrait',
      altText: 'Studio portrait photograph of Muhammad Akram in minimal creative lighting',
      caption: 'Professional portrait and creative identity headshot',
      description: 'High-resolution monochrome studio portrait for portfolio hero section',
      mediaType: 'image',
      mimeType: 'image/jpeg',
      fileSize: '184 KB',
      fileSizeBytes: 188416,
      dimensions: '1024x1024',
      width: 1024,
      height: 1024,
      usedIn: ['Hero Profile Image', 'About Section'],
      source: 'local-asset',
      createdAt: '2026-10-02T10:00:00.000Z',
      updatedAt: '2026-10-02T10:00:00.000Z'
    },
    {
      id: 'media-saas-showcase',
      filename: 'showcase_web_saas.jpg',
      originalFilename: 'showcase_web_saas.jpg',
      name: 'Analytics SaaS Interface Desktop Mockup',
      url: webSaasImg,
      alt: 'Sleek Analytics and Web Application Dashboard Interface',
      altText: 'Desktop monitor displaying real-time SaaS cloud analytics web application interface',
      caption: 'Production cloud analytics dashboard engineering project',
      description: 'Full-stack responsive web application with metric cards, telemetry, and clean data visualizations',
      mediaType: 'image',
      mimeType: 'image/jpeg',
      fileSize: '342 KB',
      fileSizeBytes: 350208,
      dimensions: '1920x1080',
      width: 1920,
      height: 1080,
      usedIn: ['Projects: Sleek Analytics & Web App Interface'],
      source: 'local-asset',
      createdAt: '2026-10-02T10:00:00.000Z',
      updatedAt: '2026-10-02T10:00:00.000Z'
    },
    {
      id: 'media-brand-3d',
      filename: 'showcase_brand_3d.jpg',
      originalFilename: 'showcase_brand_3d.jpg',
      name: '3D Geometric Brand Mark & Mockup',
      url: brand3dImg,
      alt: 'Geometric 3D Brand Mark and Stationery Mockup',
      altText: 'Minimalist 3D geometric corporate identity stationery mockup on dark textured surface',
      caption: 'Architectural spatial brand identity exploration',
      description: 'Precision 3D brand logo identity and premium print tactile mockup',
      mediaType: 'image',
      mimeType: 'image/jpeg',
      fileSize: '298 KB',
      fileSizeBytes: 305152,
      dimensions: '1440x1080',
      width: 1440,
      height: 1080,
      usedIn: ['Projects: Geometric 3D Brand Mark'],
      source: 'local-asset',
      createdAt: '2026-10-02T10:00:00.000Z',
      updatedAt: '2026-10-02T10:00:00.000Z'
    },
    {
      id: 'media-video-timeline',
      filename: 'showcase_video_motion.jpg',
      originalFilename: 'showcase_video_motion.jpg',
      name: 'Cinematic Post-Production Workstation',
      url: videoMotionImg,
      alt: 'Cinematic Video Post-Production and Color Suite',
      altText: 'Video editing suite with multi-track timeline, color grading curves, and high dynamic range display',
      caption: 'Commercial broadcast post-production and motion reel',
      description: 'Professional color science and multi-track audio engineering setup',
      mediaType: 'image',
      mimeType: 'image/jpeg',
      fileSize: '380 KB',
      fileSizeBytes: 389120,
      dimensions: '1920x1080',
      width: 1920,
      height: 1080,
      usedIn: ['Projects: Cinematic Reel Post-Production'],
      source: 'local-asset',
      createdAt: '2026-10-02T10:00:00.000Z',
      updatedAt: '2026-10-02T10:00:00.000Z'
    }
  ]
};
