import { PremiumEducation } from './PremiumEducation.js';
import { AboutCanvas } from './AboutCanvas.js';
import { TechStackDrawer } from './TechStackDrawer.js';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ContactHandshakeTransition } from './ContactHandshakeTransition.js';
import VanillaTilt from 'vanilla-tilt';
import Lenis from '@studio-freight/lenis';

gsap.registerPlugin(ScrollTrigger);

// Force scroll to top on page reload
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);
/* ============================================================
   DOM REFERENCES
   ============================================================ */
const siteHeader       = document.getElementById('site-header');
const hamburger        = document.getElementById('hamburger');
const mobileNav        = document.getElementById('mobile-nav');
const loader           = document.getElementById('loader');
const navLinks         = document.querySelectorAll('.nav-link, .mobile-nav-link');
const threeCanvas = document.getElementById('three-canvas');

import * as THREE from 'three';

/* ============================================================
   PREMIUM 3D PARTICLE WAVE (Three.js)
   ============================================================ */
class FloatingPrimitives {
  constructor() {
    if (!threeCanvas) return;
    this.canvas = threeCanvas;
    
    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 20;
    
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetX = 0;
    this.targetY = 0;
    
    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;
    
    this.group = new THREE.Group();
    this.scene.add(this.group);
    
    this.initPrimitives();
    
    window.addEventListener('resize', this.onWindowResize.bind(this));
    document.addEventListener('mousemove', this.onPointerMove.bind(this));
    
    this.clock = new THREE.Clock();
    this.animate();
  }
  
  initPrimitives() {
    const geometries = [
      new THREE.TorusGeometry(1.5, 0.4, 16, 100),
      new THREE.TetrahedronGeometry(2),
      new THREE.OctahedronGeometry(1.5),
      new THREE.IcosahedronGeometry(1.8)
    ];
    
    // Wireframe material for an elegant, abstract look
    const material = new THREE.MeshBasicMaterial({
      color: 0x4a4a4a,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });
    
    this.meshes = [];
    
    for (let i = 0; i < 15; i++) {
      const geometry = geometries[Math.floor(Math.random() * geometries.length)];
      const mesh = new THREE.Mesh(geometry, material);
      
      // Spread them around, mostly towards edges to avoid text collision
      mesh.position.x = (Math.random() - 0.5) * 40;
      mesh.position.y = (Math.random() - 0.5) * 20;
      mesh.position.z = (Math.random() - 0.5) * 15 - 10;
      
      // If too close to center, push outwards
      if (Math.abs(mesh.position.x) < 5 && Math.abs(mesh.position.y) < 5) {
        mesh.position.x += (mesh.position.x > 0 ? 8 : -8);
      }
      
      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;
      mesh.rotation.z = Math.random() * Math.PI;
      
      const scale = Math.random() * 0.8 + 0.4;
      mesh.scale.set(scale, scale, scale);
      
      this.group.add(mesh);
      
      this.meshes.push({
        mesh: mesh,
        rx: (Math.random() - 0.5) * 0.5,
        ry: (Math.random() - 0.5) * 0.5,
        rz: (Math.random() - 0.5) * 0.5,
        yOffset: Math.random() * Math.PI * 2,
        ySpeed: Math.random() * 0.5 + 0.1
      });
    }
  }
  
  onWindowResize() {
    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;
    
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  onPointerMove(event) {
    this.mouseX = (event.clientX - this.windowHalfX);
    this.mouseY = (event.clientY - this.windowHalfY);
  }
  
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    
    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();
    
    this.targetX = this.mouseX * 0.005;
    this.targetY = this.mouseY * 0.005;
    
    this.group.rotation.y += 0.05 * (this.targetX - this.group.rotation.y);
    this.group.rotation.x += 0.05 * (this.targetY - this.group.rotation.x);
    
    this.meshes.forEach(data => {
      data.mesh.rotation.x += data.rx * delta;
      data.mesh.rotation.y += data.ry * delta;
      data.mesh.rotation.z += data.rz * delta;
      
      data.mesh.position.y += Math.sin(time * data.ySpeed + data.yOffset) * 0.01;
    });
    
    this.renderer.render(this.scene, this.camera);
  }
}




/* ============================================================
   PERFORMANT AMBIENT MESH GRADIENT
   ============================================================ */
class AmbientMesh {
  constructor() {
    this.canvas = document.getElementById('mesh-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    // Ultra-low resolution for max performance. 
    // CSS `image-rendering: auto` will perfectly blur/upscale it.
    this.width = 64; 
    this.height = 64;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    this.time = 0;
    
    this.palettes = {
      light: [
        { r: 244, g: 239, b: 230 }, // Base #f4efe6 (var(--bg-primary))
        { r: 227, g: 219, b: 205 }, // Blob 1 (warm beige)
        { r: 209, g: 215, b: 214 }, // Blob 2 (cool grey/blue)
        { r: 230, g: 202, b: 202 }  // Blob 3 (soft rose)
      ],
      dark: [
        { r: 12, g: 12, b: 12 },    // Base #0c0c0c
        { r: 26, g: 18, b: 21 },    // Blob 1
        { r: 16, g: 22, b: 26 },    // Blob 2
        { r: 22, g: 26, b: 18 }     // Blob 3
      ]
    };
    
    this.currentPalette = JSON.parse(JSON.stringify(this.palettes.light));
    this.targetPalette = this.palettes.light;
    
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }
  
  setTheme(mode) {
    this.targetPalette = this.palettes[mode] || this.palettes.light;
  }
  
  lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
  }
  
  animate() {
    this.time += 0.004; // Slow ambient drift
    
    // Lerp colors for buttery smooth theme transitions (increased speed to prevent perceived lag)
    for (let i = 0; i < 4; i++) {
      this.currentPalette[i].r = this.lerp(this.currentPalette[i].r, this.targetPalette[i].r, 0.08);
      this.currentPalette[i].g = this.lerp(this.currentPalette[i].g, this.targetPalette[i].g, 0.08);
      this.currentPalette[i].b = this.lerp(this.currentPalette[i].b, this.targetPalette[i].b, 0.08);
    }
    
    const p = this.currentPalette;
    
    // Fill Base
    this.ctx.fillStyle = `rgb(${p[0].r}, ${p[0].g}, ${p[0].b})`;
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw Blobs with screen blending for luminous overlap
    this.ctx.globalCompositeOperation = 'screen';
    
    this.drawBlob(
      this.width * (0.5 + Math.sin(this.time * 0.8) * 0.3),
      this.height * (0.5 + Math.cos(this.time * 1.1) * 0.3),
      this.width * 0.6,
      p[1]
    );
    this.drawBlob(
      this.width * (0.5 + Math.sin(this.time * 1.3) * 0.4),
      this.height * (0.5 + Math.cos(this.time * 0.7) * 0.4),
      this.width * 0.5,
      p[2]
    );
    this.drawBlob(
      this.width * (0.5 + Math.sin(this.time * 0.9) * 0.35),
      this.height * (0.5 + Math.cos(this.time * 1.5) * 0.35),
      this.width * 0.55,
      p[3]
    );
    
    this.ctx.globalCompositeOperation = 'source-over';
    
    requestAnimationFrame(this.animate);
  }
  
  drawBlob(x, y, radius, color) {
    const grad = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, 1)`);
    grad.addColorStop(1, `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, 0)`);
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }
}

const ambientMesh = new AmbientMesh();
window.ambientMesh = ambientMesh;

/* ============================================================
   NAVBAR & HAMBURGER
   ============================================================ */
let lastScrollY = 0;
let headerHidden = false;

function handleHeaderScroll() {
  const y = window.scrollY;
  if (y > lastScrollY && y > 100 && !headerHidden) {
    siteHeader?.classList?.add('header-hidden');
    headerHidden = true;
    if (mobileNav?.classList?.contains('open')) {
      mobileNav?.classList?.remove('open');
      hamburger?.classList?.remove('open');
    }
  } else if (y < lastScrollY && headerHidden) {
    siteHeader?.classList?.remove('header-hidden');
    headerHidden = false;
  }
  lastScrollY = y;
}
window.addEventListener('scroll', handleHeaderScroll, { passive: true });


  // --- 4. Individual 3D Tilt for Skills ---
  const skillItems = document.querySelectorAll('.shelf-item');

  skillItems.forEach(item => {
    const tile = item.querySelector('.tech-glass-tile');
    if (!tile) return;

    let rafId = null;
    const onMouseMove = (e) => {
      const rect = item.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Normalized coordinates from -1 to 1 based on item bounds
      const normX = Math.max(-1, Math.min(1, (x / rect.width) * 2 - 1));
      const normY = Math.max(-1, Math.min(1, (y / rect.height) * 2 - 1));

      // Dynamic tilt angles (max ~18 deg for responsive feel)
      const maxTilt = 18;
      const rotateX = (-normY * maxTilt).toFixed(2);
      const rotateY = (normX * maxTilt).toFixed(2);

      // Light reflection center (%)
      const lightX = ((normX * 0.5 + 0.5) * 100).toFixed(1);
      const lightY = ((normY * 0.5 + 0.5) * 100).toFixed(1);

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        tile.style.transition = 'transform 0.08s ease-out, box-shadow 0.25s ease';
        tile.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px) scale3d(1.08, 1.08, 1.08)`;
        tile.style.setProperty('--mouse-x', `${lightX}%`);
        tile.style.setProperty('--mouse-y', `${lightY}%`);
      });
    };

    const onMouseLeave = () => {
      if (rafId) cancelAnimationFrame(rafId);
      tile.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s ease';
      tile.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1)';
      tile.style.setProperty('--mouse-x', '50%');
      tile.style.setProperty('--mouse-y', '50%');
    };

    item.addEventListener('mousemove', onMouseMove);
    item.addEventListener('mouseleave', onMouseLeave);
  });

hamburger.addEventListener('click', () => {
  const isOpen = mobileNav?.classList?.contains('open');
  mobileNav?.classList?.toggle('open', !isOpen);
  hamburger?.classList?.toggle('open', !isOpen);
});

mobileNav.querySelectorAll('.mobile-nav-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileNav?.classList?.remove('open');
    hamburger?.classList?.remove('open');
  });
});

// Smooth anchor scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = anchor.getAttribute('href');
    if (!targetId || targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      // Calculate dynamic offset (header height + margin)
      const header = document.querySelector('.site-header');
      const offset = header ? -(header.offsetHeight + 40) : -100;
      
      if (typeof lenis !== 'undefined') {
        lenis.scrollTo(targetElement, { offset: offset, duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
      } else {
        // Fallback
        const top = targetElement.getBoundingClientRect().top + window.scrollY + offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  });
});

function setActiveNavLink(sectionName) {
  navLinks.forEach(link => {
    if (link.getAttribute('data-section') === sectionName) {
      link?.classList?.add('active');
    } else {
      link?.classList?.remove('active');
    }
  });

  // Dynamically update document title based on section
  const baseTitle = "Anbu Pravin | Portfolio";
  let sectionTitle = "";
  switch(sectionName) {
    case 'home': sectionTitle = "Home"; break;
    case 'about': sectionTitle = "About"; break;
    case 'skills': sectionTitle = "Tech Stacks"; break;
    case 'education': sectionTitle = "Education Journey"; break;
    case 'work': sectionTitle = "Projects"; break;
    case 'honors': sectionTitle = "Honors & Certifications"; break;
    case 'services': sectionTitle = "Services & Opportunities"; break;
    case 'contact': sectionTitle = "Contact"; break;
  }
  
  if (sectionTitle) {
    document.title = `${sectionTitle} — ${baseTitle}`;
  } else {
    document.title = baseTitle;
  }
}


/* ============================================================
   ENTRANCE ANIMATION
   ============================================================ */
function playEntrance() {
  const tl = gsap.timeline({ delay: 0.15 });

  tl.to(siteHeader, {
    opacity: 1,
    duration: 0.6,
    ease: 'power2.out',
    onStart: () => siteHeader?.classList?.add('visible'),
  });

  tl.fromTo('.gs-reveal-hero', 
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 1.2, stagger: 0.09, ease: 'power3.out' }, 
    "-=0.4"
  );
}


/* ============================================================
   INITIALIZATION
   ============================================================ */

/* ============================================================
   LENIS SMOOTH SCROLLING
   ============================================================ */
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

/* ============================================================
   TEXT SCRAMBLE EFFECT
   ============================================================ */
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
    this.originalText = this.el.getAttribute('data-text') || this.el.textContent?.trim() || this.el.innerText || '';
    this.update = this.update.bind(this);
  }
  
  setText(newText) {
    if (!newText) return Promise.resolve();
    const oldText = this.originalText || newText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => this.resolve = resolve);
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end, char: '' });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }
  
  update() {
    let output = '';
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span class="scramble-char">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
  
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

function initScrambleEffects() {
  const scrambleElements = document.querySelectorAll('.scramble-text');
  scrambleElements.forEach(el => {
    // We only scramble text nodes, not elements with children, so check if it has inner elements
    if (el.children.length > 0 && !el?.classList?.contains('modal-close-text')) return;
    
    // Store original text safely
    const originalText = el.getAttribute('data-text') || el.textContent?.trim() || el.innerText;
    if (!originalText) return;
    el.setAttribute('data-text', originalText);
    
    const scrambler = new TextScramble(el);
    scrambler.originalText = originalText;
    
    // Initial scramble
    setTimeout(() => {
      scrambler.setText(originalText);
    }, 500 + Math.random() * 1000);
    
    // Hover scramble
    el.addEventListener('mouseenter', () => {
      scrambler.setText(originalText);
    });
  });
}

/* ============================================================
   LAZY LOAD IMAGES
   ============================================================ */
function initLazyLoading() {
  const lazyImages = document.querySelectorAll('.lazy-image');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.getAttribute('data-src');
        if (src) {
          // Preload high-res image
          const tempImg = new Image();
          tempImg.src = src;
          tempImg.onload = () => {
            img.src = src;
            img?.classList?.add('loaded');
          };
        }
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.1
  });

  lazyImages.forEach(img => {
    imageObserver.observe(img);
  });
}

/* ============================================================
   PROJECT MODAL LOGIC
   ============================================================ */
const projectData = {
  'project-0': {
    title: 'Samathuva Kalvi E-Learning Platform',
    category: 'E-Learning & AI Integration',
    year: '2024',
    desc: 'An inclusive e-learning platform specifically designed for Tamil Nadu students, focusing on accessibility, seamless single-page navigation, and comprehensive curriculum coverage (Commerce & Social Science). Integrated a personalized AI chatbot providing educational guidance, motivation, and interactive doubt clarification.',
    stack: ['React', 'AI Chatbot', 'PWA', 'Tailwind CSS', 'Responsive UX'],
    link: 'https://samathuva-kalvi.vercel.app',
    github: 'https://github.com/AnbuPravin7/Samathuva_Kalvi',
    images: [
      '/project_imgs/samathuvakalvi_main_img.png',
      '/project_imgs/samathuvakalvi_side_img.png',
      '/project_imgs/samathuvakalvi_side_img_2.png'
    ]
  },
  'project-1': {
    title: 'Storify - Smart Inventory Management',
    category: 'PWA & Business Intelligence',
    year: '2024',
    desc: 'A comprehensive Progressive Web App built for departmental stores to streamline retail inventory operations. Implemented real-time stock tracking, sales monitoring, expense management, and an AI-powered profit analytics engine providing actionable optimization insights. Architected as an offline-first PWA for small business reliability.',
    stack: ['PWA', 'React', 'AI Analytics', 'Offline Caching', 'Tailwind CSS'],
    link: 'https://storify-smartinventory.lovable.app',
    github: 'https://github.com/anbupravin-glitch/storify-smartinventory',
    images: [
      '/project_imgs/storify_main_img.png',
      '/project_imgs/storify_side_img.png',
      '/project_imgs/storify_side_img2.png'
    ]
  },
  'project-2': {
    title: 'Water Quality Monitoring System',
    category: 'IoT & Data Analytics',
    year: '2024',
    desc: 'An IoT-based intelligent water monitoring solution leveraging hardware sensors to measure water quality parameters in real-time. Features automated alert dispatching when safety thresholds are breached, dynamic telemetry dashboards for historical trend tracking, and predictive analytics forecasting future water quality hazards.',
    stack: ['IoT Sensors', 'Python', 'Data Analytics', 'Alert Automation', 'Dashboards'],
    link: 'https://github.com/anbupravin-glitch',
    github: 'https://github.com/anbupravin-glitch',
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1600',
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800'
    ]
  },
  'project-3': {
    title: 'EduSense AI - Multilingual EdTech',
    category: 'AI/ML & Regional Education',
    year: '2024 — 2025',
    desc: 'An AI-powered multilingual educational platform designed for primary school students, enabling personalized curriculum delivery in regional Indian languages. Features adaptive AI agents for real-time doubt resolution, automated lesson planning for educators, and Docker containerization for reliable cross-environment scalability.',
    stack: ['React', 'Python', 'AI/ML', 'Docker', 'Multilingual NLP'],
    link: 'https://github.com/anbupravin-glitch',
    github: 'https://github.com/anbupravin-glitch',
    images: [
      'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=1600',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&q=80&w=800'
    ]
  }
};

function initProjectModal() {
  const modal = document.getElementById('project-modal');
  const closeBtn = modal?.querySelector('.modal-close');
  const projectItems = document.querySelectorAll('.avant-item');
  
  if (!modal || projectItems.length === 0) return;
  
  // Modal Elements
  const mTitle = document.getElementById('modal-title');
  const mCat = document.getElementById('modal-category');
  const mYear = document.getElementById('modal-year');
  const mDesc = document.getElementById('modal-description');
  const mStack = document.getElementById('modal-stack');
  const mImages = modal.querySelectorAll('.lazy-image');
  const liveLinkEl = modal.querySelector('.modal-live-link');
  
  function openModal(id) {
    const data = projectData[id];
    if (!data) return;
    
    // Populate Data
    if (mTitle) mTitle.innerText = data.title;
    if (mCat) mCat.innerText = data.category;
    if (mYear) mYear.innerText = data.year;
    if (mDesc) mDesc.innerText = data.desc;
    
    if (mStack) {
      mStack.innerHTML = '';
      data.stack.forEach(tech => {
        mStack.innerHTML += `<li>${tech}</li>`;
      });
    }

    if (liveLinkEl) {
      if (data.link && data.link !== '#' && !data.link.includes('github.com')) {
        liveLinkEl.href = data.link;
        liveLinkEl.target = '_blank';
        liveLinkEl.rel = 'noopener noreferrer';
        liveLinkEl.style.display = 'inline-flex';
        liveLinkEl.textContent = 'Live Demo ↗';
      } else {
        liveLinkEl.style.display = 'none';
      }
    }

    let githubBtn = modal.querySelector('.modal-github-link');
    if (!githubBtn && liveLinkEl?.parentNode) {
      githubBtn = document.createElement('a');
      githubBtn.className = 'modal-github-link primary-btn';
      githubBtn.style.marginTop = '0.5rem';
      githubBtn.style.background = 'rgba(255, 255, 255, 0.1)';
      githubBtn.style.color = '#fff';
      liveLinkEl.parentNode.appendChild(githubBtn);
    }
    if (githubBtn) {
      if (data.github) {
        githubBtn.href = data.github;
        githubBtn.target = '_blank';
        githubBtn.rel = 'noopener noreferrer';
        githubBtn.style.display = 'inline-flex';
        githubBtn.textContent = 'View on GitHub ↗';
      } else {
        githubBtn.style.display = 'none';
      }
    }
    
    // Reset images for lazy load
    mImages.forEach((img, idx) => {
      if (data.images[idx]) {
        img?.classList?.remove('loaded');
        const isUnsplash = data.images[idx].includes('unsplash.com');
        const blurSrc = isUnsplash
          ? data.images[idx].replace('q=80', 'q=10').replace('w=1600', 'w=400').replace('w=800', 'w=200') + '&blur=20'
          : data.images[idx];
        img.src = blurSrc;
        img.setAttribute('data-src', data.images[idx]);
      }
    });
    
    // Pause Lenis
    if (window.lenis) lenis.stop();
    
    modal?.classList?.add('active');
    
    // Trigger lazy load inside modal
    initLazyLoading();
    
    // Trigger scramble on modal title
    if (mTitle) {
      const scrambler = new TextScramble(mTitle);
      scrambler.setText(data.title);
    }
  }
  
  function closeModal() {
    modal?.classList?.remove('active');
    if (window.lenis) lenis.start();
  }
  
  projectItems.forEach(item => {
    item.addEventListener('click', () => {
      const projectId = item.getAttribute('data-project-id');
      if (projectId) openModal(projectId);
    });
  });
  
  closeBtn?.addEventListener('click', closeModal);
  modal.querySelector('.modal-backdrop')?.addEventListener('click', closeModal);
}


/* ============================================================
   CUSTOM CURSOR
   ============================================================ */
function initCustomCursor() {
  const trail = document.getElementById('cursor-trail');
  if (!trail) return;

  // Slower following duration creates the trail effect
  const xToTrail = gsap.quickTo(trail, "left", { duration: 0.8, ease: "power3" });
  const yToTrail = gsap.quickTo(trail, "top", { duration: 0.8, ease: "power3" });

  window.addEventListener("mousemove", (e) => {
    xToTrail(e.clientX);
    yToTrail(e.clientY);
  });

  window.addEventListener('mousedown', () => trail?.classList?.add('clicking'));
  window.addEventListener('mouseup', () => trail?.classList?.remove('clicking'));
}

/* ============================================================
   GENERATIVE AMBIENT AUDIO ENGINE (Web Audio API)
   ============================================================ */
class AmbientEngine {
  constructor() {
    this.audio = new Audio('https://storage.googleapis.com/producer-app-public/clips/ed9b085a-a285-4068-9c14-e22ba54e8b44.m4a');
    this.audio.loop = true;
    this.audio.volume = 0;
    this.audio.crossOrigin = "anonymous";
    this.isPlaying = false;
  }
  
  toggle() {
    if (this.isPlaying) {
      gsap.to(this.audio, { 
        volume: 0, 
        duration: 2, 
        onComplete: () => {
          this.audio.pause();
        }
      });
      this.isPlaying = false;
    } else {
      this.audio.play().catch(e => console.error("Audio play failed:", e));
      gsap.to(this.audio, { volume: 0.6, duration: 3 });
      this.isPlaying = true;
    }
    return this.isPlaying;
  }
}

function initAudioController() {
  const toggleBtn = document.getElementById('audio-toggle');
  if (!toggleBtn) return;
  
  const engine = new AmbientEngine();
  
  toggleBtn.addEventListener('click', () => {
    const isPlaying = engine.toggle();
    if (isPlaying) {
      toggleBtn.classList.add('playing');
      toggleBtn.setAttribute('aria-pressed', 'true');
      toggleBtn.setAttribute('title', 'Mute ambient sound');
      toggleBtn.setAttribute('aria-label', 'Mute ambient sound');
    } else {
      toggleBtn.classList.remove('playing');
      toggleBtn.setAttribute('aria-pressed', 'false');
      toggleBtn.setAttribute('title', 'Play ambient sound');
      toggleBtn.setAttribute('aria-label', 'Play ambient sound');
    }
  });
}

async function init() {
  // Initialize premium Three.js background
  new FloatingPrimitives();

  // Hide loading screen
  const loader = document.getElementById('loader');
  if (loader) {
    loader?.classList?.add('hidden');
  }

  // Trigger entrance animation for quote
  playEntrance();
  initScrambleEffects();
  initLazyLoading();
  initProjectModal();

  initCustomCursor();
  initAudioController();




  // Enhanced Premium GSAP Reveal for Each Section
  
  // Animate dividers on scroll
  gsap.utils.toArray('.gs-divider').forEach((divider) => {
    gsap.to(divider, {
      scrollTrigger: {
        trigger: divider,
        start: 'top 85%',
        toggleClass: 'is-visible',
        once: true
      }
    });
  });

  gsap.utils.toArray('.hero-scene, .about-scene, .avant-work-scene, .services-scene, .contact-scene').forEach((section) => {
    // Determine elements to animate in the section
    const elementsToReveal = section.querySelectorAll('.gs-reveal, .gs-reveal-hero, .about-eyebrow, .about-heading, .bento-card, .avant-item, .services-eyebrow, .services-heading, .services-sub, .service-card, .workflow-step, .services-cta-banner, .contact-heading, .contact-sub, .social-link');
    
    if (elementsToReveal.length > 0) {
      if (section?.classList?.contains('hero-scene')) {
         return; // Hero elements handled by playEntrance()
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none none',
          once: true
        }
      });
      
      // Animate elements within this section cascadingly
      tl.fromTo(elementsToReveal, 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out' }
      );
    }
  });

  // Initialize About Bento Interactive Canvas
  const aboutCanvas = new AboutCanvas('about-interactive-canvas');

  // Initialize Tech Stack Detail Drawer
  const techDrawer = new TechStackDrawer();
  
  // Initialize Education 3D Journey
  const premiumEdu = new PremiumEducation();

  // Initialize Contact Handshake Transition component
  const contactTransition = new ContactHandshakeTransition();

  // Unified Header Theme and Nav Observer for Dark Sections (Projects & Contact)
  const darkSections = document.querySelectorAll('.skills-shelf-scene, .education-scene, .premium-edu-section, .avant-work-scene, .contact-scene');
  const lightSections = document.querySelectorAll('.hero-scene, .about-scene, .services-scene, .testimonials-scene, .honors-scene');
  
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const isDark = entry.target?.classList?.contains('contact-scene') || 
                           entry.target?.classList?.contains('avant-work-scene') ||
                           entry.target?.classList?.contains('education-scene') ||
                           entry.target?.classList?.contains('premium-edu-section') ||
                           entry.target?.classList?.contains('skills-shelf-scene');
            
            // Apply dark theme when over any dark section
            if (isDark) {
              siteHeader?.classList?.add('dark-theme');
              if (window.ambientMesh) window.ambientMesh.setTheme('dark');
            } else {
              // Only switch to light if no dark section is dominant in viewport
              const anyDarkDominant = Array.from(darkSections).some(sec => {
                const rect = sec.getBoundingClientRect();
                return rect.top < window.innerHeight * 0.4 && rect.bottom > window.innerHeight * 0.4;
              });
              if (!anyDarkDominant) {
                siteHeader?.classList?.remove('dark-theme');
                if (window.ambientMesh) window.ambientMesh.setTheme('light');
              }
            }
            
            // Update active nav link
            const validSections = ['home', 'about', 'skills', 'education', 'work', 'honors', 'services', 'contact'];
            if (validSections.includes(entry.target.id)) {
              setActiveNavLink(entry.target.id);
            }
            if (entry.target.id === 'contact') {
              // Lazy-load hand animation frames when near contact section
              contactTransition.preloadFrames();
            }
          } else {
            // Check if we are still intersecting another dark section
            const anyDarkIntersecting = Array.from(darkSections).some(
              section => {
                const rect = section.getBoundingClientRect();
                return rect.top < window.innerHeight && rect.bottom > 0;
              }
            );
            if (!anyDarkIntersecting) {
              siteHeader?.classList?.remove('dark-theme');
              if (window.ambientMesh) window.ambientMesh.setTheme('light');
            }
          }
        });
      },
      { threshold: 0.3 }
    );
    darkSections.forEach(sec => sectionObserver.observe(sec));
    lightSections.forEach(sec => sectionObserver.observe(sec));
  }
}

init();


/* ============================================================
   NEW FEATURES: Testimonials, Scroll Progress, Easter Egg
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- 1. Premium Testimonial Carousel ---
  const slides = document.querySelectorAll('.test-slide');
  const nextBtn = document.querySelector('.next-btn');
  const prevBtn = document.querySelector('.prev-btn');
  let currentSlide = 0;
  let testimonialInterval;

  function goToSlide(index) {
    slides[currentSlide]?.classList?.remove('active');
    currentSlide = index;
    slides[currentSlide]?.classList?.add('active');
  }

  function nextSlide() {
    let next = (currentSlide + 1) % slides.length;
    goToSlide(next);
  }
  
  function prevSlide() {
    let prev = (currentSlide - 1 + slides.length) % slides.length;
    goToSlide(prev);
  }

  if (slides.length > 0) {
    nextBtn?.addEventListener('click', () => {
       clearInterval(testimonialInterval);
       nextSlide();
       testimonialInterval = setInterval(nextSlide, 6000);
    });
    prevBtn?.addEventListener('click', () => {
       clearInterval(testimonialInterval);
       prevSlide();
       testimonialInterval = setInterval(nextSlide, 6000);
    });
    testimonialInterval = setInterval(nextSlide, 6000);
  }

  // --- 2. Scroll Progress Bar ---
  const scrollThumb = document.querySelector('.scroll-progress-thumb');
  const progressDots = document.querySelectorAll('.progress-dot');
  const sections = document.querySelectorAll('section, header'); // Include header for home

  function updateScrollProgress() {
    if (!scrollThumb) return;
    
    // Update thumb position
    const scrollPos = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? scrollPos / docHeight : 0;
    
    // The track is 120px tall, thumb is 30px tall, max translate is 90px
    const maxTranslate = 120 - 30;
    scrollThumb.style.transform = `translateY(${scrollPercent * maxTranslate}px)`;
  }

  // Observer for active dots
  const observerOptions = {
    root: null,
    rootMargin: '-50% 0px -50% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        let targetId = entry.target.id;
        if (targetId === 'site-header') targetId = 'home';
        
        progressDots.forEach(dot => {
          if (dot.getAttribute('data-target') === targetId) {
            dot?.classList?.add('active');
          } else {
            dot?.classList?.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(sec => {
    if (sec.id) {
      sectionObserver.observe(sec);
    }
  });
  
  if (scrollThumb) {
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();
  }

  // --- 3. Easter Egg: Header Glitch ---
  const brandEl = document.getElementById('brand');
  let clickCount = 0;
  let clickTimer;

  if (brandEl) {
    brandEl.addEventListener('click', (e) => {
      e.preventDefault();
      clickCount++;
      
      clearTimeout(clickTimer);
      
      if (clickCount >= 5) {
        triggerEasterEgg();
        clickCount = 0;
      } else {
        clickTimer = setTimeout(() => {
          clickCount = 0;
        }, 1000);
      }
    });
  }

  function triggerEasterEgg() {
    const allText = document.querySelectorAll('h1, h2, p, .brand-name, .nav-link');
    
    allText.forEach(el => {
      el?.classList?.add('glitch-active');
    });

    // Create some fast floating particles globally
    for(let i=0; i<20; i++) {
      const p = document.createElement('div');
      p.style.position = 'fixed';
      p.style.width = Math.random() * 50 + 10 + 'px';
      p.style.height = '2px';
      p.style.background = 'var(--accent)';
      p.style.left = Math.random() * window.innerWidth + 'px';
      p.style.top = Math.random() * window.innerHeight + 'px';
      p.style.zIndex = '9999';
      p.style.pointerEvents = 'none';
      p.style.transition = 'all 0.5s ease-out';
      document.body.appendChild(p);
      
      setTimeout(() => {
        p.style.transform = `translateX(${Math.random() * 500 - 250}px) scaleX(0)`;
        p.style.opacity = '0';
      }, 50);
      
      setTimeout(() => p.remove(), 600);
    }

    setTimeout(() => {
      allText.forEach(el => {
        el?.classList?.remove('glitch-active');
      });
    }, 800);
  }

});

