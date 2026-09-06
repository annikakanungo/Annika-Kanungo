// Shared across all pages: reveal ".reveal" elements once they enter
// the viewport, then stop watching them so the animation plays once.
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      entry.target.classList.add('in-view');
      entry.target.querySelectorAll('.bar i').forEach(bar => { bar.style.width = bar.dataset.width; });
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
revealEls.forEach(el => observer.observe(el));

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// =========================================================
// SCROLL PROGRESS BAR — a thin bar at the top of the page that
// fills as you scroll. Site-wide, present on every page.
// =========================================================
const scrollProgress = document.getElementById('scroll-progress');
if (scrollProgress){
  try {
    function updateScrollProgress(){
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      scrollProgress.style.width = pct + '%';
    }
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();
  } catch (err) { console.error('Scroll progress bar failed to initialize:', err); }
}

// =========================================================
// CUSTOM CURSOR — only enabled on devices with a mouse
// (pointer: fine). Grows and fills when hovering anything
// clickable. Left entirely hidden on touch devices.
// =========================================================
const customCursor = document.getElementById('custom-cursor');
if (customCursor && window.matchMedia('(pointer: fine)').matches){
  try {
    customCursor.hidden = false;
    document.body.classList.add('custom-cursor-on');
    document.addEventListener('mousemove', (e) => {
      customCursor.style.left = e.clientX + 'px';
      customCursor.style.top = e.clientY + 'px';
    });
    document.querySelectorAll('a, button, .card, .article-card').forEach(el => {
      el.addEventListener('mouseenter', () => customCursor.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => customCursor.classList.remove('cursor-hover'));
    });
  } catch (err) { console.error('Custom cursor failed to initialize:', err); }
}

// =========================================================
// MAGNETIC BUTTONS — primary buttons shift subtly toward the
// cursor when it's over them, then spring back on mouseleave
// (reusing the site's existing spring-transition CSS rule).
// =========================================================
if (!prefersReducedMotion){
  try {
    document.querySelectorAll('.form-submit, .cta-btn').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  } catch (err) { console.error('Magnetic buttons failed to initialize:', err); }
}

// =========================================================
// HEADING SCRAMBLE/DECODE — headings resolve from random
// characters into real text as they scroll into view, once
// each. Skipped inside .hero since the hero code block already
// has its own typing effect. All headings on this site are
// plain text (verified — no nested tags), so replacing
// textContent during the animation is safe.
// =========================================================
if (!prefersReducedMotion){
  try {
    const scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ01{}[]<>/*#';
    function scrambleReveal(el){
      const original = el.textContent;
      let iteration = 0;
      const interval = setInterval(() => {
        el.textContent = original.split('').map((char, index) => {
