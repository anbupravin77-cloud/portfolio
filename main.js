import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ContactHandshakeTransition } from './ContactHandshakeTransition.js';

gsap.registerPlugin(ScrollTrigger);

/* ============================================================
   DOM REFERENCES
   ============================================================ */
const siteHeader       = document.getElementById('site-header');
const hamburger        = document.getElementById('hamburger');
const mobileNav        = document.getElementById('mobile-nav');
const stickyViewport   = document.getElementById('sticky-viewport');
const robotCanvas      = document.getElementById('robot-canvas');
const robotCtx         = robotCanvas.getContext('2d');
const textOverlay      = document.getElementById('text-overlay');
const sectionQuote     = document.getElementById('section-quote');
const sectionIntro     = document.getElementById('section-intro');
const loader           = document.getElementById('loader');
const loaderBar        = document.getElementById('loader-bar');
const loaderPct        = document.getElementById('loader-percent');
const scrollHint       = document.getElementById('scroll-hint');
const navLinks         = document.querySelectorAll('.nav-link, .mobile-nav-link');


/* ============================================================
   NAVBAR & HAMBURGER
   ============================================================ */
let lastScrollY = 0;
let headerHidden = false;

function handleHeaderScroll() {
  const y = window.scrollY;
  if (y > lastScrollY && y > 100 && !headerHidden) {
    siteHeader.classList.add('header-hidden');
    headerHidden = true;
    if (mobileNav.classList.contains('open')) {
      mobileNav.classList.remove('open');
      hamburger.classList.remove('open');
    }
  } else if (y < lastScrollY && headerHidden) {
    siteHeader.classList.remove('header-hidden');
    headerHidden = false;
  }
  lastScrollY = y;
}
window.addEventListener('scroll', handleHeaderScroll, { passive: true });

hamburger.addEventListener('click', () => {
  const isOpen = mobileNav.classList.contains('open');
  mobileNav.classList.toggle('open', !isOpen);
  hamburger.classList.toggle('open', !isOpen);
});

mobileNav.querySelectorAll('.mobile-nav-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    hamburger.classList.remove('open');
  });
});

// Smooth anchor scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href');
    if (targetId === '#home') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (targetId === '#contact') {
      e.preventDefault();
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      e.preventDefault();
      const scrollContainer = document.getElementById('scroll-container');
      if (scrollContainer) {
        const targetScroll = scrollContainer.offsetTop + (scrollContainer.offsetHeight - window.innerHeight);
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      }
    }
  });
});

function setActiveNavLink(sectionName) {
  navLinks.forEach(link => {
    if (link.getAttribute('data-section') === sectionName) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}


/* ============================================================
   ROBOT FRAMES (HERO ANIMATION)
   ============================================================ */
const ROBOT_FRAME_COUNT = 192;
const ROBOT_FRAME_DIR   = '/1000074905_frames';
const ROBOT_MISSING     = new Set([184, 189]);

const robotFramePaths = [];
for (let i = 1; i <= ROBOT_FRAME_COUNT; i++) {
  if (!ROBOT_MISSING.has(i)) {
    robotFramePaths.push(`${ROBOT_FRAME_DIR}/frame_${String(i).padStart(3, '0')}.jpg`);
  }
}
const totalRobotFrames = robotFramePaths.length;
const robotImages = new Array(totalRobotFrames);
let robotLoadedCount = 0;


/* ============================================================
   PRELOADING
   ============================================================ */
function preloadRobotFrames() {
  return new Promise(resolve => {
    robotFramePaths.forEach((src, i) => {
      const img = new Image();
      img.src = src;
      img.onload = img.onerror = () => {
        robotImages[i] = img;
        robotLoadedCount++;
        const pct = Math.round((robotLoadedCount / totalRobotFrames) * 100);
        loaderBar.style.width = `${pct}%`;
        loaderPct.textContent = `${pct}%`;
        if (robotLoadedCount >= totalRobotFrames) resolve();
      };
    });
  });
}


/* ============================================================
   CANVAS SIZING & HIGH-DPI SHARPNESS
   ============================================================ */
function resizeCanvases() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight;

  robotCanvas.width = Math.round(w * dpr);
  robotCanvas.height = Math.round(h * dpr);
  robotCanvas.style.width = `${w}px`;
  robotCanvas.style.height = `${h}px`;
}

/**
 * Render Robot Frame with DPR awareness
 */
function drawRobotFrame(index) {
  const safeIdx = Math.max(0, Math.min(totalRobotFrames - 1, Math.round(index)));
  const img = robotImages[safeIdx];
  if (!img || !img.complete || img.naturalWidth === 0) return;

  const cw = robotCanvas.width;
  const ch = robotCanvas.height;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;

  robotCtx.imageSmoothingEnabled = true;
  robotCtx.imageSmoothingQuality = 'high';

  const scale = Math.max(cw / iw, ch / ih);
  const drawW = iw * scale;
  const drawH = ih * scale;

  // Position robot at ~60% of viewport width
  const targetX = 0.60 * cw;
  const robotInImage = 0.50 * drawW;
  const offsetX = Math.max(cw - drawW, Math.min(0, targetX - robotInImage));
  const offsetY = (ch - drawH) / 2;

  robotCtx.clearRect(0, 0, cw, ch);
  robotCtx.drawImage(img, offsetX, offsetY, drawW, drawH);
}

const animState = {
  robotIndex: 0,
};


/* ============================================================
   ENTRANCE ANIMATION
   ============================================================ */
function playEntrance() {
  const tl = gsap.timeline({ delay: 0.15 });

  tl.to(siteHeader, {
    opacity: 1,
    duration: 0.6,
    ease: 'power2.out',
    onStart: () => siteHeader.classList.add('visible'),
  });

  tl.fromTo('#section-quote', { opacity: 0, y: 20 }, {
    opacity: 1, y: 0,
    duration: 0.7,
    ease: 'power2.out',
  }, 0.25);

  tl.fromTo('.quote-decoration', { opacity: 0 }, {
    opacity: 0.25,
    duration: 0.5,
    ease: 'power2.out',
  }, 0.35);

  tl.fromTo('.quote-underline', { opacity: 0, scaleX: 0 }, {
    opacity: 0.35, scaleX: 1,
    duration: 0.5,
    ease: 'power2.out',
    transformOrigin: 'left center',
  }, 0.55);

  tl.add(() => scrollHint.classList.add('visible'), 1.0);
}


/* ============================================================
   MASTER SCROLL CHOREOGRAPHY
   ============================================================ */
function setupScrollAnimation() {
  ScrollTrigger.create({
    trigger: '#scroll-container',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.35,
    onUpdate: (self) => {
      const p = self.progress;

      // Scrub robot frames smoothly across scroll (0 to 189)
      animState.robotIndex = Math.min(totalRobotFrames - 1, p * (totalRobotFrames - 1));
      drawRobotFrame(animState.robotIndex);

      // Section 1: Quote text exit (0.18 -> 0.40)
      if (p < 0.18) {
        gsap.set(sectionQuote, { opacity: 1, y: 0 });
      } else if (p <= 0.40) {
        const qExitProg = (p - 0.18) / 0.22;
        gsap.set(sectionQuote, { opacity: 1 - qExitProg, y: -28 * qExitProg });
      } else {
        gsap.set(sectionQuote, { opacity: 0 });
      }

      // Section 2: Intro text entrance (0.48 -> 0.72)
      if (p < 0.48) {
        gsap.set(sectionIntro, { opacity: 0, y: 30 });
      } else if (p <= 0.72) {
        const introProg = (p - 0.48) / 0.24;
        gsap.set(sectionIntro, { opacity: introProg, y: 30 * (1 - introProg) });
      } else {
        gsap.set(sectionIntro, { opacity: 1, y: 0 });
      }

      // Nav link state
      if (p < 0.48) {
        setActiveNavLink('home');
      } else {
        setActiveNavLink('about');
      }

      // Fade out initial scroll hint on any scroll
      if (p > 0.03) {
        scrollHint.classList.add('fade-out');
        scrollHint.classList.remove('visible');
      } else {
        scrollHint.classList.remove('fade-out');
        scrollHint.classList.add('visible');
      }
    },
  });
}


/* ============================================================
   INITIALIZATION
   ============================================================ */
async function init() {
  resizeCanvases();

  window.addEventListener('resize', () => {
    resizeCanvases();
    drawRobotFrame(animState.robotIndex);
  });

  // Preload robot frames first for instant startup
  await preloadRobotFrames();

  // Draw initial frame
  drawRobotFrame(0);

  // Hide loading screen
  loader.classList.add('hidden');

  // Trigger entrance animation for quote
  playEntrance();

  // Setup scroll animation
  setupScrollAnimation();

  // Initialize Contact Handshake Transition component
  const contactTransition = new ContactHandshakeTransition();

  // Projects Stacking Animation
  const projectCards = gsap.utils.toArray('.project-card');
  if (projectCards.length > 1 && window.innerWidth > 768) {
    ScrollTrigger.create({
      trigger: projectCards[1],
      start: 'top 120px',
      end: 'top top',
      scrub: true,
      animation: gsap.to(projectCards[0], { scale: 0.96, filter: 'brightness(0.5)', ease: 'none' })
    });
  }
  if (projectCards.length > 2 && window.innerWidth > 768) {
    ScrollTrigger.create({
      trigger: projectCards[2],
      start: 'top 120px',
      end: 'top top',
      scrub: true,
      animation: gsap.to([projectCards[0], projectCards[1]], { scale: 0.92, filter: 'brightness(0.3)', ease: 'none' })
    });
  }

  // Unified Header Theme and Nav Observer for Dark Sections (Projects & Contact)
  const darkSections = document.querySelectorAll('.projects-scene, .contact-scene');
  if (darkSections.length > 0 && 'IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Apply dark theme when over any dark section
            siteHeader.classList.add('dark-theme');
            
            // Update active nav link
            if (entry.target.id === 'work') {
              setActiveNavLink('work');
            } else if (entry.target.id === 'contact') {
              setActiveNavLink('contact');
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
              siteHeader.classList.remove('dark-theme');
            }
          }
        });
      },
      { threshold: 0.15 }
    );
    darkSections.forEach(sec => sectionObserver.observe(sec));
  }
}

init();
