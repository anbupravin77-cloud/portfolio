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
   PRELOADING (Progressive)
   ============================================================ */
function preloadRobotFrames() {
  return new Promise(resolve => {
    const INITIAL_BATCH = 15;
    let initialLoaded = 0;
    const targetInitial = Math.min(INITIAL_BATCH, totalRobotFrames);
    const loadQueue = [...robotFramePaths.entries()]; 
    const CONCURRENT = 6;
    let activeLoads = 0;

    function loadNext() {
      if (loadQueue.length === 0 || activeLoads >= CONCURRENT) return;
      
      const [i, src] = loadQueue.shift();
      activeLoads++;
      
      const img = new Image();
      img.src = src;
      img.onload = img.onerror = () => {
        robotImages[i] = img;
        robotLoadedCount++;
        activeLoads--;
        
        if (initialLoaded < targetInitial) {
          initialLoaded++;
          const pct = Math.round((initialLoaded / targetInitial) * 100);
          if (loaderBar) loaderBar.style.width = `${pct}%`;
          if (loaderPct) loaderPct.textContent = `${pct}%`;
          
          if (initialLoaded >= targetInitial) resolve();
        }
        loadNext();
      };
      loadNext();
    }
    
    for (let k = 0; k < CONCURRENT; k++) loadNext();
  });
}

/* ============================================================
   CANVAS SIZING & HIGH-DPI SHARPNESS
   ============================================================ */
function resizeCanvases() {
  // Cap at 1.5 to prevent massive memory usage on 2x/3x screens
  const isMobile = window.innerWidth <= 768;
  const maxDpr = isMobile ? 1 : 1.5;
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  const w = window.innerWidth;
  const h = window.innerHeight;

  robotCanvas.width = Math.round(w * dpr);
  robotCanvas.height = Math.round(h * dpr);
  robotCanvas.style.width = `${w}px`;
  robotCanvas.style.height = `${h}px`;
}

/**
 * Render Robot Frame with DPR awareness and Nearest-Neighbor Cache
 */
function getNearestLoadedFrame(targetIdx) {
  if (robotImages[targetIdx] && robotImages[targetIdx].complete && robotImages[targetIdx].naturalWidth > 0) {
    return { img: robotImages[targetIdx], idx: targetIdx };
  }
  const maxSearch = Math.min(10, totalRobotFrames); // Limit search radius
  for (let offset = 1; offset <= maxSearch; offset++) {
    const downIdx = targetIdx - offset;
    if (downIdx >= 0 && robotImages[downIdx] && robotImages[downIdx].complete && robotImages[downIdx].naturalWidth > 0) {
      return { img: robotImages[downIdx], idx: downIdx };
    }
    const upIdx = targetIdx + offset;
    if (upIdx < totalRobotFrames && robotImages[upIdx] && robotImages[upIdx].complete && robotImages[upIdx].naturalWidth > 0) {
      return { img: robotImages[upIdx], idx: upIdx };
    }
  }
  // Fallback to currently rendered if available
  if (animState.renderedRobotIndex >= 0 && robotImages[animState.renderedRobotIndex]) {
    return { img: robotImages[animState.renderedRobotIndex], idx: animState.renderedRobotIndex };
  }
  return null;
}

function drawRobotFrame(index) {
  const safeIdx = Math.max(0, Math.min(totalRobotFrames - 1, Math.round(index)));
  const nearest = getNearestLoadedFrame(safeIdx);
  if (!nearest) return;
  
  const { img, idx } = nearest;
  if (animState.renderedRobotIndex === idx) {
    animState.renderedRobotIndex = safeIdx; // Update logical index even if image is same
    return;
  }
  
  const cw = robotCanvas.width;
  const ch = robotCanvas.height;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;

  robotCtx.imageSmoothingEnabled = true;
  robotCtx.imageSmoothingQuality = 'medium';

  const scale = Math.max(cw / iw, ch / ih);
  const drawW = iw * scale;
  const drawH = ih * scale;

  const targetX = 0.60 * cw;
  const robotInImage = 0.50 * drawW;
  const offsetX = Math.max(cw - drawW, Math.min(0, targetX - robotInImage));
  const offsetY = (ch - drawH) / 2;

  robotCtx.clearRect(0, 0, cw, ch);
  robotCtx.drawImage(img, offsetX, offsetY, drawW, drawH);
  
  animState.renderedRobotIndex = safeIdx;
}

const animState = {
  renderedRobotIndex: -1,
  renderRaf: null,
};

function scheduleRobotRender(targetIdx) {
  const safeIdx = Math.max(0, Math.min(totalRobotFrames - 1, Math.round(targetIdx)));
  if (animState.renderedRobotIndex !== safeIdx && !animState.renderRaf) {
    animState.renderRaf = requestAnimationFrame(() => {
      drawRobotFrame(safeIdx);
      animState.renderRaf = null;
    });
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
  let lastQExit = -1;
  let lastIntro = -1;

  // 1. Robot Trigger (Instant 1:1 scrub for absolute sync)
  ScrollTrigger.create({
    trigger: '#scroll-container',
    start: 'top top',
    end: 'bottom bottom',
    scrub: true, // No delay! Direct sync to scrollbar
    onUpdate: (self) => {
      const p = self.progress;
      // Map exact float progress to frame index and schedule render
      const exactIndex = p * (totalRobotFrames - 1);
      scheduleRobotRender(exactIndex);
    },
  });

  // 2. UI/Text Trigger (Interpolated scrub for buttery typography)
  ScrollTrigger.create({
    trigger: '#scroll-container',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.35,
    onUpdate: (self) => {
      const p = self.progress;

      // Section 1: Quote text exit (0.18 -> 0.40)
      let currentQExit = p < 0.18 ? 0 : (p <= 0.40 ? (p - 0.18) / 0.22 : 1);
      if (Math.abs(currentQExit - lastQExit) > 0.005) {
        gsap.set(sectionQuote, { opacity: 1 - currentQExit, y: -28 * currentQExit });
        lastQExit = currentQExit;
      }

      // Section 2: Intro text entrance (0.48 -> 0.72)
      let currentIntro = p < 0.48 ? 0 : (p <= 0.72 ? (p - 0.48) / 0.24 : 1);
      if (Math.abs(currentIntro - lastIntro) > 0.005) {
        gsap.set(sectionIntro, { opacity: currentIntro, y: 30 * (1 - currentIntro) });
        lastIntro = currentIntro;
      }

      // Nav link state
      if (p < 0.48) {
        setActiveNavLink('home');
      } else {
        setActiveNavLink('about');
      }

      // Fade out initial scroll hint
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

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resizeCanvases();
      animState.renderedRobotIndex = -1; // force redraw
    }, 100);
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
