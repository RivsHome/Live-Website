// ======================
// 1) Menu toggle
// ======================
function toggleMenu() {
  document.body.classList.toggle('menu-open');
  document.getElementById('mobileMenu').classList.toggle('show');
}

// ======================
// 2) IntersectionObserver animations
// ======================
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add("animate-in");
  });
});

[
 '.title-box h2',         // section titles
 '.hero-subtitle',        // hero subtitle
 '.about-overlay',        // about us box
 '.services-section',     // services container
 '.section-description',  // services intro text
 '.services .service',    // each desktop‐grid card
 '.mobile-carousel .service-card', // each mobile card
 '.social-title-box',     // social header
 '.tiktok-frame',         // individual embeds
].forEach(sel => {
   document.querySelectorAll(sel).forEach(el => observer.observe(el));
});

// ======================
// “Areas We Serve” Mobile Carousel
// ======================
window.addEventListener('load', () => {
  document.querySelectorAll('.mobile-towns-carousel-wrapper').forEach(wrapper => {
    const carousel = wrapper.querySelector('.mobile-towns-carousel');
    const dots     = wrapper.querySelectorAll('.carousel-nav-dots.towns-dots .dot');
    const slides   = wrapper.querySelectorAll('.town-slide');
    if (!carousel || !slides.length || !dots.length) return;

    // How many slides?
    const count = slides.length;
    // Each slide width (total scrollWidth / count)
    const slideWidth = carousel.scrollWidth / count;

    // Center on slide #2 at load
    carousel.scrollLeft = slideWidth;

    // On every swipe/scroll, highlight the nearest dot
    carousel.addEventListener('scroll', () => {
      const index = Math.round(carousel.scrollLeft / slideWidth);
      dots.forEach((d, i) => d.classList.toggle('active', i === index));
    });
  });
});

// ======================
// 4) Chat widget logic
// ======================
const API_URL = '/api/chat';

function toggleChat() {
  const chatbox = document.getElementById('chatbox');
  chatbox.style.display = chatbox.style.display === 'flex' ? 'none' : 'flex';
}

function addMessage(text, sender) {
  const container = document.getElementById('chatbox-messages');
  const msg = document.createElement('div');
  msg.className = 'message ' + sender;
  msg.innerText = text;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById('user-input');
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, 'user');
  input.value = '';
  addMessage('Assistant is typing...', 'bot');

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || 'Oops, something went wrong.';
    const bots = document.getElementsByClassName('bot');
    bots[bots.length-1].innerText = reply;
  } catch (err) {
    const bots = document.getElementsByClassName('bot');
    bots[bots.length-1].innerText = 'Connection error.';
  }
}

function handleKeyPress(e) {
  if (e.key === 'Enter') sendMessage();
}

// hook up chat controls once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('chat-button')?.addEventListener('click', toggleChat);
  document.getElementById('chatbox-close')?.addEventListener('click', toggleChat);
  document.getElementById('chat-send')?.addEventListener('click', sendMessage);
  document.getElementById('user-input')?.addEventListener('keypress', handleKeyPress);
});

// burger menu

window.addEventListener('DOMContentLoaded', () => {
  const burger = document.querySelector('.hamburger');
  const closeBtn = document.querySelector('.mobile-menu-close');
  if (burger)   burger.addEventListener('click', toggleMenu);
  if (closeBtn) closeBtn.addEventListener('click', toggleMenu);
});

window.addEventListener('DOMContentLoaded', () => {
  // Mobile “Our Services” carousel
  const svcWrapper = document.querySelector('.mobile-carousel-wrapper');
  if (svcWrapper) {
    const carousel = svcWrapper.querySelector('.mobile-carousel');
    const cards    = svcWrapper.querySelectorAll('.service-card');
    const dots     = svcWrapper.querySelectorAll('#carousel-nav-dots .dot');
    const count    = cards.length;
    if (carousel && count && dots.length === count) {
      // Each “page” width
      const slideWidth = carousel.scrollWidth / count;
      // Start on first card (you can change to slideWidth to start on #2)
      carousel.scrollLeft = 0;
      // Sync dots on swipe/scroll
      carousel.addEventListener('scroll', () => {
        const idx = Math.round(carousel.scrollLeft / slideWidth);
        dots.forEach((d,i) => d.classList.toggle('active', i === idx));
      });
    }
  }
});

document.querySelectorAll('.mobile-menu-links a').forEach(link => {
    link.addEventListener('click', () => {
      if (document.body.classList.contains('menu-open')) {
        toggleMenu();
      }
    });
  });

  // AUTO-SCROLL WHEN CAROUSEL ENTERS VIEW
// INTERRUPTIBLE BY USER TOUCH/DRAG
document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.querySelector('.mobile-carousel');
  const cards    = Array.from(carousel?.querySelectorAll('.service-card') || []);
  const dots     = Array.from(document.querySelectorAll('#carousel-nav-dots .dot'));
  if (!carousel || cards.length === 0) return;

  const cardWidth = cards[0].getBoundingClientRect().width;
  const delay     = 2000; // ms between slides
  let started     = false;
  let interrupted = false;
  let timeouts    = [];

  // watch for the carousel to hit ~50% in the viewport
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !started) {
        started = true;
        startAutoScroll();
        obs.disconnect();
      }
    });
  }, { threshold: 0.5 });

  observer.observe(carousel);

  function startAutoScroll() {
    if (interrupted) return;
    // slide forward through each card…
    cards.forEach((_, i) => {
      const t = setTimeout(() => {
        if (interrupted) return;
        carousel.scrollTo({ left: i * cardWidth, behavior: 'smooth' });
        updateDots(i);
      }, delay * i);
      timeouts.push(t);
    });
    // …then snap back to the first
    const t = setTimeout(() => {
      if (interrupted) return;
      carousel.scrollTo({ left: 0, behavior: 'smooth' });
      updateDots(0);
    }, delay * cards.length);
    timeouts.push(t);
  }

  function updateDots(activeIndex) {
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === activeIndex);
    });
  }

  function interruptAutoScroll() {
    interrupted = true;
    timeouts.forEach(clearTimeout);
    timeouts = [];
  }

  // Listen for user interaction to interrupt auto-scroll
  ['touchstart', 'mousedown', 'wheel'].forEach(evt => {
    carousel.addEventListener(evt, interruptAutoScroll, { once: true });
  });
});

// --- Discount Popup Logic ---
const popupKey = 'discountPopupShown';
window.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    if (!localStorage.getItem(popupKey)) {
      var popup = document.getElementById('discount-popup');
      if (popup) popup.style.display = 'flex';
      localStorage.setItem(popupKey, 'true');
    }
  }, 2000);

  var closePopupBtn = document.getElementById('close-popup');
  if (closePopupBtn) {
    closePopupBtn.addEventListener('click', function() {
      var popup = document.getElementById('discount-popup');
      if (popup) popup.style.display = 'none';
    });
  }
});


