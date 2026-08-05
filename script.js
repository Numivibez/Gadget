/* =========================================
   Numi Gadget - Shared JavaScript
   Handles cart, mobile menu, animations,
   countdown, testimonials, etc.
========================================= */

/* ---------- Cart State ---------- */
let cart = JSON.parse(localStorage.getItem('numiCart')) || [];

/* ---------- Utility: Format Naira ---------- */
function formatNaira(amount) {
    return '₦' + Number(amount).toLocaleString('en-NG');
}

/* ---------- Toast Notification ---------- */
let toastTimer;
function showToast(message, icon = 'fa-circle-check') {
    const toast = document.getElementById('toast');
    const msg = document.getElementById('toastMsg');
    if (!toast) return;
    msg.textContent = message;
    toast.querySelector('i').className = 'fa-solid ' + icon;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ---------- Mobile Hamburger Menu ---------- */
function navClick(selector) {
    const navBtn = document.querySelector(selector);
    const navMenu = document.querySelector('.nav-menu');
    if (!navBtn || !navMenu) return;

    navBtn.classList.toggle('is-open');
    navMenu.classList.toggle('active');
}

// Close mobile menu when clicking outside
document.addEventListener('click', function (e) {
    const navMenu = document.querySelector('.nav-menu');
    const navBtn = document.querySelector('.navBtn4');
    if (!navMenu || !navBtn) return;
    if (!navBtn.contains(e.target) && !navMenu.contains(e.target)) {
        navBtn.classList.remove('is-open');
        navMenu.classList.remove('active');
    }
});

// Close mobile menu on nav link click (all pages)
document.addEventListener('click', function (e) {
    if (e.target.closest('.nav-menu a')) {
        const navMenu = document.querySelector('.nav-menu');
        const navBtn = document.querySelector('.navBtn4');
        if (navMenu && navBtn) {
            navMenu.classList.remove('active');
            navBtn.classList.remove('is-open');
        }
    }
});

/* ---------- Smooth Scroll ---------- */
function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    else window.location.href = 'index.html#' + id;
}

/* ---------- Cart Functions ---------- */
function saveCart() {
    localStorage.setItem('numiCart', JSON.stringify(cart));
    updateCartBadge();
    renderCart();
}

function updateCartBadge() {
    const badge = document.getElementById('cartCount');
    if (badge) {
        const total = cart.reduce((sum, item) => sum + item.qty, 0);
        badge.textContent = total;
        badge.style.display = total > 0 ? 'flex' : 'none';
    }
}

function addToCart(name, price, category) {
    const existing = cart.find(item => item.name === name);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ name, price, category, qty: 1 });
    }
    saveCart();
    showToast(name + ' added to cart! 🛒');
    // Open the cart drawer so the user sees their item
    openCart();
}

function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    saveCart();
    showToast('Item removed from cart', 'fa-trash');
}

function changeQty(name, delta) {
    const item = cart.find(i => i.name === name);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
        cart = cart.filter(i => i.name !== name);
    }
    saveCart();
}

function clearCart() {
    cart = [];
    saveCart();
}

function cartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

/* ---------- Cart Drawer ---------- */
function toggleCart(event) {
    if (event) event.preventDefault();
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.querySelector('.cart-overlay');
    if (!drawer) return;

    const isOpen = drawer.classList.contains('open');
    if (isOpen) {
        drawer.classList.remove('open');
        overlay.classList.remove('show');
        document.body.style.overflow = '';
    } else {
        drawer.classList.add('open');
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    renderCart();
}

function openCart() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.querySelector('.cart-overlay');
    if (!drawer) return;
    drawer.classList.add('open');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
    renderCart();
}

function renderCart() {
    const container = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotalPrice');
    const totalItemsEl = document.getElementById('cartTotalItems');
    if (!container) return;

    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    if (totalItemsEl) totalItemsEl.textContent = totalItems;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <i class="fa-solid fa-cart-plus"></i>
                <p>Your cart is empty</p>
                <a href="#featured" onclick="toggleCart(event)">Start Shopping</a>
            </div>`;
    } else {
        container.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <span class="cart-item-price">${formatNaira(item.price)}</span>
                </div>
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="changeQty('${item.name}', -1)">−</button>
                    <span class="qty">${item.qty}</span>
                    <button class="qty-btn" onclick="changeQty('${item.name}', 1)">+</button>
                </div>
                <button class="remove-btn" onclick="removeFromCart('${item.name}')" aria-label="Remove"><i class="fa-solid fa-trash"></i></button>
            </div>
        `).join('');
    }

    if (totalEl) totalEl.textContent = formatNaira(cartTotal());
    updateCartBadge();
}

function checkout() {
    if (cart.length === 0) {
        showToast('Your cart is empty!', 'fa-circle-exclamation');
        return;
    }
    const total = cartTotal();
    showToast('Order placed! Total: ' + formatNaira(total) + ' 🎉', 'fa-circle-check');
    clearCart();
    setTimeout(() => toggleCart(), 500);
}

/* ---------- Wishlist ---------- */
function toggleWishlist(btn) {
    const heart = btn.querySelector('i');
    const isActive = heart.classList.contains('fa-solid');
    if (isActive) {
        heart.classList.remove('fa-solid');
        heart.classList.add('fa-regular');
        btn.style.color = '#999';
        showToast('Removed from wishlist', 'fa-heart-crack');
    } else {
        heart.classList.remove('fa-regular');
        heart.classList.add('fa-solid');
        btn.style.color = '#ff4d6d';
        showToast('Added to wishlist ❤️', 'fa-heart');
    }
}

/* ---------- Newsletter ---------- */
function subscribeNewsletter(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.querySelector('input[type="email"]').value;
    if (email) {
        form.reset();
        showToast('Subscribed! Welcome to the Numi family 🎉');
    }
}

/* ---------- Live Search / Filter ---------- */
function initSearch() {
    const searchInput = document.getElementById('siteSearch');
    if (!searchInput) return;

    searchInput.addEventListener('input', function () {
        const query = this.value.toLowerCase().trim();
        const products = document.querySelectorAll('.product-card');

        products.forEach(card => {
            const name = card.querySelector('h3').textContent.toLowerCase();
            const desc = card.querySelector('.product-desc').textContent.toLowerCase();
            const matches = name.includes(query) || desc.includes(query);
            card.style.display = matches ? '' : 'none';
        });
    });

    // Prevent form from reloading page
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const query = this.querySelector('input').value.trim();
            if (query && window.location.search !== '?query=' + encodeURIComponent(query)) {
                const featured = document.getElementById('featured');
                if (featured) featured.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
}

/* ---------- Scroll Reveal on Intersection ---------- */
function initScrollReveal() {
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length === 0) return;

    if (!('IntersectionObserver' in window)) {
        revealEls.forEach(el => el.classList.add('visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => observer.observe(el));
}

/* ---------- Animated Counters ---------- */
function initCounters() {
    const counters = document.querySelectorAll('.stat-num');
    if (counters.length === 0) return;

    const animateCounter = (counter) => {
        const target = +counter.dataset.target;
        const duration = 2000;
        const step = target / (duration / 16); // ~60fps

        const animate = () => {
            const current = +counter.textContent.replace(/,/g, '') + step;
            if (current < target) {
                counter.textContent = Math.floor(current).toLocaleString('en-US');
                requestAnimationFrame(animate);
            } else {
                counter.textContent = target.toLocaleString('en-US');
            }
        };
        animate();
    };

    // Only animate when counters scroll into view (About page stats are below the fold)
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.querySelectorAll('.stat-num').forEach(animateCounter);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        // Observe each parent container of a .stat-num
        counters.forEach(counter => {
            const parent = counter.closest('.hero-stats, .stats-body, .stats-section') || counter.parentElement;
            observer.observe(parent);
        });
    } else {
        counters.forEach(animateCounter);
    }
}

/* ---------- Countdown Timer ---------- */
function initCountdown() {
    const cdDays = document.getElementById('cdDays');
    const cdHours = document.getElementById('cdHours');
    const cdMins = document.getElementById('cdMins');
    const cdSecs = document.getElementById('cdSecs');
    if (!cdDays) return;

    // Set countdown to 3 days from now (refreshed when page reloads)
    const now = new Date();
    const target = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));

    function pad(n) { return String(n).padStart(2, '0'); }

    function update() {
        const diff = target - new Date();
        if (diff <= 0) {
            cdDays.textContent = '00';
            cdHours.textContent = '00';
            cdMins.textContent = '00';
            cdSecs.textContent = '00';
            return;
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        cdDays.textContent = pad(days);
        cdHours.textContent = pad(hours);
        cdMins.textContent = pad(mins);
        cdSecs.textContent = pad(secs);
    }

    update();
    setInterval(update, 1000);
}

/* ---------- Back to Top ---------- */
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            btn.classList.add('show');
        } else {
            btn.classList.remove('show');
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ---------- FAQ Accordion (used on About/Service pages) ---------- */
function initFaq() {
    document.querySelectorAll('.faq-question').forEach(q => {
        q.addEventListener('click', function () {
            const item = this.parentElement;
            const answer = this.nextElementSibling;
            const isOpen = item.classList.contains('open');

            // Close all
            document.querySelectorAll('.faq-item').forEach(i => {
                i.classList.remove('open');
                i.querySelector('.faq-answer').style.maxHeight = null;
            });

            if (!isOpen) {
                item.classList.add('open');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });
}

/* ---------- Navbar scroll effect ---------- */
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

/* ---------- Set current year in footer ---------- */
function setYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ---------- Contact form (used on About/other pages) ---------- */
function handleContactForm(event) {
    event.preventDefault();
    const form = event.target;
    if (form.checkValidity()) {
        form.reset();
        showToast('Message sent! We\'ll get back to you soon 💬');
    }
}

/* ---------- Init on DOM ready ---------- */
document.addEventListener('DOMContentLoaded', function () {
    setYear();
    renderCart();
    initSearch();
    initScrollReveal();
    initCounters();
    initCountdown();
    initBackToTop();
    initFaq();
    initNavbarScroll();

    // Multi-page: set active nav link based on filename
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-menu a').forEach(a => {
        const href = a.getAttribute('href').split('#')[0];
        if (href === path || (path === '' && href === 'index.html')) {
            a.classList.add('active');
        }
    });
});