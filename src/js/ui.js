import { throttle } from './utils.js';

// Navbar scroll logic
const navbar = document.getElementById('navbar');
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-links a');

const onScroll = throttle(() => {
    const scrollY = window.scrollY;
    
    // Navbar Background
    if (scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');

    // Hero Parallax
    const heroH1 = document.querySelector('#hero h1');
    const heroDesc = document.querySelector('.hero-desc');
    if (heroH1) heroH1.style.transform = `translateY(${scrollY * 0.3}px)`;
    if (heroDesc) heroDesc.style.transform = `translateY(${scrollY * 0.2}px)`;

    // Active Nav Link
    let current = "";
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (scrollY >= sectionTop - 150) current = section.getAttribute('id');
    });
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(current)) link.classList.add('active');
    });
});

window.addEventListener('scroll', onScroll);

// Mobile Nav
const hamburger = document.getElementById('hamburgerBtn');
const navOverlay = document.getElementById('navOverlay');
if (hamburger && navOverlay) {
    hamburger.addEventListener('click', () => {
        navOverlay.classList.toggle('open');
        hamburger.classList.toggle('active');
    });
    navOverlay.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navOverlay.classList.remove('open');
            hamburger.classList.remove('active');
        });
    });
}

// Custom Cursor Interaction
const cursorDot = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');

document.addEventListener('mousemove', (e) => {
    if (cursorDot && cursorRing) {
        cursorDot.style.left = e.clientX + 'px';
        cursorDot.style.top = e.clientY + 'px';
        
        cursorRing.animate({
            left: e.clientX + 'px',
            top: e.clientY + 'px'
        }, { duration: 500, fill: "forwards" });
    }
});

document.querySelectorAll('.hover-target').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// Intersection Observer for reveals
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            revealObserver.unobserve(entry.target);
            
            if (entry.target.querySelector('.stats-row')) {
                animateNumbers(entry.target);
            }
        }
    });
}, { threshold: 0.25 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

function animateNumbers(parent) {
    const stats = parent.querySelectorAll('.stat-item span');
    stats.forEach(stat => {
        const text = stat.innerText;
        const target = parseInt(text);
        if (isNaN(target)) return;

        let count = 0;
        const duration = 2000;
        const startTime = performance.now();

        function update(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const current = Math.floor(progress * target);
            stat.innerText = current + (text.includes('+') ? '+' : (text.includes('★') ? '★' : ''));
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    });
}

// Menu Filtering
window.filterMenu = function(category) {
    const cards = document.querySelectorAll('.menu-card');
    const btns = document.querySelectorAll('.tab-btn');
    
    btns.forEach(btn => btn.classList.remove('active'));
    if (window.event && window.event.target) {
        window.event.target.classList.add('active');
    }

    cards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = 'block';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
            }, 50);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.96)';
            setTimeout(() => card.style.display = 'none', 400);
        }
    });
}

// Reservation Form
window.handleReserve = function(e) {
    e.preventDefault();
    const form = e.target;
    const toast = document.getElementById('toast');
    if (toast) {
        toast.innerText = "✓ Table request received! We'll call you shortly.";
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            form.reset();
        }, 4000);
    }
}
