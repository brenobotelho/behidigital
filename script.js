const root = document.documentElement;
const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('#mobile-menu');
const motionButton = document.querySelector('.motion-toggle');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const heroArt = document.querySelector('.hero-art');
const pointStory = document.querySelector('.point-story');
const contactSection = document.querySelector('.contact-section');
const header = document.querySelector('.site-header');
const projectItems = [...document.querySelectorAll('.project-item')];
const projectCurrent = document.querySelector('#project-current');
const projectDots = [...document.querySelectorAll('.project-counter-dots i')];
const reveals = [...document.querySelectorAll('.reveal')];
let motionPaused = false;
try { motionPaused = localStorage.getItem('behi-motion') === 'paused'; } catch { /* Optional preference. */ }
let motionActive = false;
let framePending = false;
let pointerX = 0;
let pointerY = 0;
let pointerChanged = false;

function closeMenu({ returnFocus = false } = {}) {
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Abrir menu');
  menu.hidden = true;
  if (returnFocus) toggle.focus();
}
toggle.addEventListener('click', () => {
  const opening = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(opening));
  toggle.setAttribute('aria-label', opening ? 'Fechar menu' : 'Abrir menu');
  menu.hidden = !opening;
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !menu.hidden) closeMenu({ returnFocus: true });
});
document.addEventListener('click', event => {
  if (!menu.hidden && !menu.contains(event.target) && !toggle.contains(event.target)) closeMenu();
});
menu.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
matchMedia('(min-width: 521px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

// Content is visible without JavaScript; motion is a progressive enhancement.
let revealObserver;
if ('IntersectionObserver' in window) {
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: .06, rootMargin: '0px 0px -25px 0px' });
  reveals.forEach((element, index) => {
    element.style.setProperty('--reveal-delay', `${index % 3 * .045}s`);
    revealObserver.observe(element);
  });
}
function applyMotionPreference() {
  motionActive = !reducedMotion.matches && !motionPaused;
  root.classList.toggle('motion-enabled', motionActive);
  root.classList.toggle('motion-paused', !motionActive);
  motionButton.hidden = reducedMotion.matches;
  motionButton.setAttribute('aria-pressed', String(motionPaused));
  const label = motionPaused ? 'Ativar movimentos' : 'Pausar movimentos';
  motionButton.setAttribute('aria-label', label);
  motionButton.title = label;
  if (!motionActive || !revealObserver) reveals.forEach(element => element.classList.add('is-visible'));
  if (!motionActive) {
    if (heroArt) ['--mx', '--my', '--scroll-lift'].forEach(key => heroArt.style.setProperty(key, '0px'));
    document.querySelectorAll('.button, .header-contact').forEach(button => {
      button.style.setProperty('--btn-x', '0px');
      button.style.setProperty('--btn-y', '0px');
    });
  }
  scheduleFrame();
}
motionButton.addEventListener('click', () => {
  motionPaused = !motionPaused;
  try { localStorage.setItem('behi-motion', motionPaused ? 'paused' : 'active'); } catch { /* Optional preference. */ }
  applyMotionPreference();
});
reducedMotion.addEventListener('change', applyMotionPreference);
function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function updateFrame() {
  framePending = false;
  const y = scrollY;
  const viewportHeight = innerHeight;
  const scrollRange = root.scrollHeight - viewportHeight;
  root.style.setProperty('--scroll-progress', scrollRange > 0 ? clamp(y / scrollRange, 0, 1) : 0);
  header.classList.toggle('is-scrolled', y > 30);
  let nearestProject = 0;
  let nearestDistance = Infinity;
  projectItems.forEach((item, index) => {
    const rect = item.getBoundingClientRect();
    const distance = Math.abs(rect.top + Math.min(rect.height, viewportHeight) / 2 - viewportHeight / 2);
    if (distance < nearestDistance) { nearestDistance = distance; nearestProject = index; }
    if (motionActive && rect.top < viewportHeight && rect.bottom > 0) item.style.setProperty('--image-shift', `${clamp((rect.top / viewportHeight - .3) * 20, -12, 12).toFixed(2)}px`);
  });
  if (projectCurrent) projectCurrent.textContent = String(nearestProject + 1).padStart(2, '0');
  projectDots.forEach((dot, index) => dot.classList.toggle('is-active', index === nearestProject));
  if (!motionActive) return;
  root.style.setProperty('--grid-y', `${-(y * .025 % 72).toFixed(2)}px`);
  root.style.setProperty('--page-turn', `${(y * .09).toFixed(2)}deg`);
  root.style.setProperty('--orbit-turn', `${(y * .13).toFixed(2)}deg`);
  const heroRect = heroArt?.getBoundingClientRect();
  if (heroRect?.bottom > 0) heroArt.style.setProperty('--scroll-lift', `${-clamp(y * .075, 0, 65).toFixed(2)}px`);
  const storyRect = pointStory?.getBoundingClientRect();
  if (storyRect && storyRect.top < viewportHeight && storyRect.bottom > 0) {
    const progress = clamp((viewportHeight - storyRect.top) / (viewportHeight + storyRect.height), 0, 1);
    pointStory.style.setProperty('--point-scale', (.75 + progress * .65).toFixed(3));
  }
  const contactRect = contactSection?.getBoundingClientRect();
  if (contactRect && contactRect.top < viewportHeight) contactSection.style.setProperty('--contact-scale', clamp(1.15 - contactRect.top / viewportHeight * .45, .7, 1.15).toFixed(3));
  if (pointerChanged) {
    root.style.setProperty('--cursor-x', `${pointerX}px`);
    root.style.setProperty('--cursor-y', `${pointerY}px`);
    if (heroRect && heroRect.bottom > 0 && heroRect.top < viewportHeight) {
      heroArt.style.setProperty('--mx', `${clamp((pointerX - heroRect.left - heroRect.width / 2) * .025, -17, 17).toFixed(2)}px`);
      heroArt.style.setProperty('--my', `${clamp((pointerY - heroRect.top - heroRect.height / 2) * .025, -17, 17).toFixed(2)}px`);
    }
    pointerChanged = false;
  }
}
function scheduleFrame() {
  if (framePending) return;
  framePending = true;
  requestAnimationFrame(updateFrame);
}
addEventListener('scroll', scheduleFrame, { passive: true });
addEventListener('resize', scheduleFrame, { passive: true });
addEventListener('load', scheduleFrame, { once: true });
document.addEventListener('pointermove', event => {
  if (!motionActive || !finePointer.matches) return;
  pointerX = event.clientX; pointerY = event.clientY; pointerChanged = true;
  root.classList.add('pointer-seen'); scheduleFrame();
}, { passive: true });
document.addEventListener('pointerover', event => root.classList.toggle('cursor-active', Boolean(event.target.closest('a, button'))), { passive: true });
document.addEventListener('pointerout', event => { if (!event.relatedTarget) root.classList.remove('pointer-seen'); });
document.querySelectorAll('.button, .header-contact').forEach(button => {
  button.addEventListener('pointermove', event => {
    if (!motionActive || !finePointer.matches) return;
    const rect = button.getBoundingClientRect();
    button.style.setProperty('--btn-x', `${((event.clientX - rect.left - rect.width / 2) * .08).toFixed(2)}px`);
    button.style.setProperty('--btn-y', `${((event.clientY - rect.top - rect.height / 2) * .12).toFixed(2)}px`);
  }, { passive: true });
  button.addEventListener('pointerleave', () => {
    button.style.setProperty('--btn-x', '0px'); button.style.setProperty('--btn-y', '0px');
  });
});
document.querySelectorAll('.project-media').forEach(media => {
  media.addEventListener('pointermove', event => {
    if (!motionActive || !finePointer.matches) return;
    const rect = media.getBoundingClientRect();
    media.style.setProperty('--hover-x', `${clamp(event.clientX - rect.left, 70, rect.width - 70)}px`);
    media.style.setProperty('--hover-y', `${clamp(event.clientY - rect.top, 30, rect.height - 30)}px`);
  }, { passive: true });
});
applyMotionPreference();
document.querySelectorAll('[data-current-year]').forEach(element => { element.textContent = new Date().getFullYear(); });
