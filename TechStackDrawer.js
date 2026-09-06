/**
 * TechStackDrawer.js
 * Manages the interactive detail drawer for the Tech Stacks section.
 * Allows visitors to click or activate any tech stack tile to inspect focus areas,
 * key libraries, architectural synergy, and practical production experience.
 */

export const TECH_DATA = {
  react: {
    name: 'React',
    category: 'Component & UI Runtime',
    glow: 'rgba(97, 218, 251, 0.5)',
    icon: '/tech-icons/react.svg',
    level: 'Core Competency',
    focus: [
      'Modular Component Hierarchies & Clean Architecture',
      'Custom Hooks & State Management Patterns',
      'Single-Page App Smooth Scrolling & Navigation',
      'PWA Integration & High-Performance Rendering'
    ],
    libraries: ['React Router', 'Lucide React', 'Framer Motion', 'Tailwind'],
    experience: 'Core technology powering key production projects including Samathuva Kalvi (inclusive E-Learning platform), Storify (Smart Inventory Management PWA), and EduSense AI. Building accessible components, single-page architectures, and responsive micro-interactions.',
    synergy: 'JavaScript, Python, PWA, Tailwind CSS, Figma'
  },
  javascript: {
    name: 'JavaScript',
    category: 'Core Language & Web APIs',
    glow: 'rgba(247, 223, 30, 0.45)',
    icon: '/tech-icons/javascript.svg',
    level: 'Core Competency',
    focus: [
      'Modern ES6+ Specifications & Async/Await Patterns',
      'DOM Manipulation & Event Delegation Architecture',
      'Service Worker Lifecycle & Offline Caching API',
      'Client-Side State Storage & JSON Data Parsing'
    ],
    libraries: ['Web APIs', 'Fetch API', 'IndexedDB', 'Service Workers'],
    experience: 'Deep expertise in modern JavaScript powering interactive user interfaces, asynchronous API integrations, real-time client state handling, and progressive web application services.',
    synergy: 'React, HTML5, CSS3, Python'
  },
  python: {
    name: 'Python',
    category: 'Data Analytics & AI Automation',
    glow: 'rgba(255, 212, 59, 0.45)',
    icon: '/tech-icons/python.svg',
    level: 'Certified & Advanced',
    focus: [
      'IoT Sensor Data Processing & Real-Time Alerting',
      'Predictive Analytics & Metric Forecasting',
      'AI/ML Integration & Multilingual NLP Workflows',
      'Automated Scripting & Core Programming Concepts'
    ],
    libraries: ['FastAPI', 'NumPy', 'Pandas', 'Requests'],
    experience: 'Engineered backend analytics for IoT Water Quality Monitoring System with automated stakeholder alerts; integrated multilingual AI agents for EduSense AI. Certified via Google Crash Course in Python (Coursera).',
    synergy: 'Docker, React, Git, IoT Sensors'
  },
  pwa: {
    name: 'Progressive Web Apps',
    category: 'Offline-First & Mobile Web',
    glow: 'rgba(90, 15, 200, 0.5)',
    icon: '/tech-icons/pwa.svg',
    level: 'Core Competency',
    focus: [
      'Service Worker Lifecycle & Offline Caching Strategies',
      'Web App Manifest & Cross-Platform Installability',
      'Background Sync & Offline State Reconciliation',
      'Low-Bandwidth Mobile Device Optimization'
    ],
    libraries: ['Cache Storage', 'IndexedDB', 'Web App Manifest', 'Service Workers'],
    experience: 'Engineered Storify as an offline-capable Progressive Web App for departmental stores to track stock without network dependency. Built Samathuva Kalvi as a PWA to ensure equitable access for students across Tamil Nadu.',
    synergy: 'React, JavaScript, Tailwind CSS, HTML5'
  },
  c: {
    name: 'C Programming',
    category: 'Systems & Algorithmic Fundamentals',
    glow: 'rgba(0, 89, 156, 0.5)',
    icon: '/tech-icons/c.svg',
    level: 'Academic Core',
    focus: [
      'Data Structures & Algorithmic Problem Solving',
      'Low-Level Memory Management & Pointer Arithmetic',
      'Computational Complexity & Time-Space Optimization',
      'Computer Science Engineering Fundamentals @ TCE'
    ],
    libraries: ['Standard C Library', 'GCC', 'Make', 'GDB'],
    experience: 'Deep foundational study in Computer Science Engineering at Thiagarajar College of Engineering, Madurai. Implementing classical data structures, sorting algorithms, and rigorous problem-solving heuristics.',
    synergy: 'Python, Algorithms, Problem Solving'
  },
  html5: {
    name: 'HTML5',
    category: 'Semantic Web & Accessibility',
    glow: 'rgba(228, 77, 38, 0.5)',
    icon: '/tech-icons/html5.svg',
    level: 'Core Competency',
    focus: [
      'Semantic Landmark Outline Architecture',
      'WCAG 2.1 AA Accessibility Standards (ARIA)',
      'Inclusive UX for Diverse Student Demographics',
      'Responsive Meta Viewport & SEO Optimization'
    ],
    libraries: ['Semantic Elements', 'ARIA Landmarks', 'DOM API'],
    experience: 'Constructing accessible, semantic web layouts that guarantee high usability across screen readers and diverse mobile form factors, exemplified in the inclusive Samathuva Kalvi platform.',
    synergy: 'CSS3, JavaScript, React, Figma'
  },
  css3: {
    name: 'CSS3',
    category: 'Modern Layouts & Animations',
    glow: 'rgba(21, 114, 182, 0.5)',
    icon: '/tech-icons/css3.svg',
    level: 'Core Competency',
    focus: [
      'CSS Flexbox & CSS Grid Alignment Systems',
      'Fluid Typography Clamps & Media Queries',
      'Hardware-Accelerated Transitions & Animations',
      'Custom CSS Variables & Theme Systems'
    ],
    libraries: ['Modern CSS', 'CSS Grid', 'Flexbox', 'PostCSS'],
    experience: 'Crafting responsive, visually balanced web layouts with fluid typographic scales, smooth CSS transitions, and flawless multi-screen adaptation.',
    synergy: 'Tailwind CSS, HTML5, React'
  },
  tailwindcss: {
    name: 'Tailwind CSS',
    category: 'Utility-First Styling System',
    glow: 'rgba(56, 189, 248, 0.5)',
    icon: '/tech-icons/tailwindcss.svg',
    level: 'Core Competency',
    focus: [
      'Rapid Responsive Mobile-First Development',
      'Custom Design Token Scales & Color Palettes',
      'Component Encapsulation & Consistent Spacing',
      'High-Performance Zero-Runtime Production CSS'
    ],
    libraries: ['Tailwind CSS', 'PostCSS', 'Autoprefixer'],
    experience: 'Developing sleek, modern responsive user interfaces with rapid iteration speed. Applied across portfolio systems, Storify inventory screens, and educational dashboards.',
    synergy: 'React, HTML5, Figma, JavaScript'
  },
  figma: {
    name: 'Figma',
    category: 'UI/UX Design & Wireframing',
    glow: 'rgba(242, 78, 30, 0.5)',
    icon: '/tech-icons/figma.svg',
    level: 'Core Competency',
    focus: [
      'Wireframing & High-Fidelity UI Prototyping',
      'Design Systems & Component Style Guides',
      'User-Centric Experience (UX) Architecture',
      'Inclusive & Accessible Student Interface Design'
    ],
    libraries: ['Auto Layout', 'Component Sets', 'Interactive Prototypes'],
    experience: 'Translating product concepts into polished interactive prototypes. Designed intuitive, accessible interfaces for Samathuva Kalvi and Storify to optimize clarity for learners and business operators.',
    synergy: 'HTML5, CSS3, React, Tailwind CSS'
  },
  git: {
    name: 'Git & GitHub',
    category: 'Version Control & Collaboration',
    glow: 'rgba(240, 80, 50, 0.5)',
    icon: '/tech-icons/git.svg',
    level: 'Core Competency',
    focus: [
      'Branching Strategies & Pull Request Reviews',
      'Open Source Collaboration & Issue Tracking',
      'Atomic Commit Discipline & Semantic Logs',
      'Continuous Deployment with Vercel & Cloud Platforms'
    ],
    libraries: ['Git CLI', 'GitHub', 'GitHub Actions'],
    experience: 'Managing version control across all projects under github.com/anbupravin-glitch and github.com/AnbuPravin7. Practicing clean commit histories and collaborative development.',
    synergy: 'VS Code, Cursor, Docker, React'
  },
  docker: {
    name: 'Docker',
    category: 'Containerization & Deployment',
    glow: 'rgba(36, 150, 237, 0.5)',
    icon: '/tech-icons/docker.svg',
    level: 'Practical Application',
    focus: [
      'Multi-Stage Containerized Builds',
      'Consistent Cross-Environment Execution',
      'Full-Stack Service Orchestration',
      'Scalable EdTech Application Packaging'
    ],
    libraries: ['Docker Engine', 'Dockerfile', 'Docker Compose'],
    experience: 'Containerized the full-stack EduSense AI multilingual educational platform for consistent cross-environment deployment, isolation, and seamless scalability.',
    synergy: 'Python, React, Git'
  },
  typescript: {
    name: 'TypeScript',
    category: 'Type-Safe Architecture',
    glow: 'rgba(49, 120, 198, 0.5)',
    icon: '/tech-icons/typescript.svg',
    level: 'Advanced',
    focus: [
      'Static Typing & Interface Contracts',
      'Compile-Time Error Prevention',
      'Typed React Props & Hook Generics',
      'Scalable Web Application Development'
    ],
    libraries: ['TypeScript Compiler', 'Type Definitions'],
    experience: 'Utilizing strong typing to eliminate runtime exceptions, establish reliable data contracts, and enhance developer tooling across modern web applications.',
    synergy: 'React, JavaScript, Node.js'
  }
};

export class TechStackDrawer {
  constructor() {
    this.drawer = document.getElementById('tech-stack-drawer');
    this.backdrop = document.getElementById('tech-drawer-backdrop');
    this.closeBtn = document.getElementById('tech-drawer-close');
    this.content = document.getElementById('tech-drawer-content');
    this.shelfItems = document.querySelectorAll('.shelf-item');

    if (!this.drawer || !this.shelfItems.length) return;

    this.bindEvents();
  }

  bindEvents() {
    // Click and keyboard on skill tiles
    this.shelfItems.forEach(item => {
      const techKey = item.getAttribute('data-tech');
      if (!techKey || !TECH_DATA[techKey]) return;

      // Make accessible
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.setAttribute('aria-haspopup', 'dialog');
      item.setAttribute('aria-label', `View details for ${TECH_DATA[techKey].name}`);

      // Click handler
      item.addEventListener('click', (e) => {
        e.preventDefault();
        this.open(techKey);
      });

      // Keyboard handler (Enter / Space)
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.open(techKey);
        }
      });
    });

    // Close button
    this.closeBtn?.addEventListener('click', () => this.close());
    this.backdrop?.addEventListener('click', () => this.close());

    // ESC key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });
  }

  isOpen() {
    return this.drawer?.classList?.contains('open');
  }

  open(techKey) {
    const data = TECH_DATA[techKey];
    if (!data) return;

    this.renderContent(data);

    this.drawer?.classList?.add('open');
    this.backdrop?.classList?.add('open');
    document.body.style.overflow = 'hidden';

    // Focus close button for accessibility
    setTimeout(() => {
      this.closeBtn?.focus();
    }, 100);
  }

  close() {
    this.drawer?.classList?.remove('open');
    this.backdrop?.classList?.remove('open');
    document.body.style.overflow = '';
  }

  renderContent(data) {
    if (!this.content) return;

    const focusChips = data.focus.map(f => `
      <li class="drawer-focus-item">
        <span class="focus-bullet" style="background: ${data.glow}"></span>
        <span>${f}</span>
      </li>
    `).join('');

    const libBadges = data.libraries.map(lib => `
      <span class="drawer-badge">${lib}</span>
    `).join('');

    this.content.innerHTML = `
      <div class="drawer-header" style="--card-glow: ${data.glow}">
        <div class="drawer-icon-wrap" style="box-shadow: 0 0 30px ${data.glow}">
          <img src="${data.icon}" alt="${data.name} logo" class="drawer-tech-icon" width="48" height="48" />
        </div>
        <div class="drawer-titles">
          <span class="drawer-category">${data.category}</span>
          <h3 class="drawer-title">${data.name}</h3>
          <span class="drawer-level-tag">${data.level}</span>
        </div>
      </div>

      <div class="drawer-section">
        <h4 class="drawer-section-heading">ARCHITECTURAL FOCUS</h4>
        <ul class="drawer-focus-list">
          ${focusChips}
        </ul>
      </div>

      <div class="drawer-section">
        <h4 class="drawer-section-heading">KEY ECOSYSTEM & LIBRARIES</h4>
        <div class="drawer-badges-wrap">
          ${libBadges}
        </div>
      </div>

      <div class="drawer-section">
        <h4 class="drawer-section-heading">PRODUCTION EXPERIENCE</h4>
        <p class="drawer-desc">${data.experience}</p>
      </div>

      <div class="drawer-section drawer-synergy">
        <h4 class="drawer-section-heading">STACK SYNERGY</h4>
        <p class="drawer-synergy-text">${data.synergy}</p>
      </div>
    `;
  }
}
