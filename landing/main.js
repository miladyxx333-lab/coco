// COCO Landing Page JavaScript
// Minimal interactions

document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Typing effect for terminal
    const terminalCode = document.querySelector('.terminal-body code');
    if (terminalCode) {
        // Terminal is already displayed, but we could add typing animation here
    }

    // Intersection Observer for fade-in animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all feature cards and sections
    document.querySelectorAll('.feature-card, .arch-layer, .essence-card, .tier').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });

    // Add visible class styles
    const style = document.createElement('style');
    style.textContent = `
    .visible {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `;
    document.head.appendChild(style);

    // Nav background on scroll
    const nav = document.querySelector('.nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.style.background = 'rgba(10, 10, 15, 0.95)';
        } else {
            nav.style.background = 'rgba(10, 10, 15, 0.8)';
        }
    });

    // Console easter egg
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ██████╗ ██████╗  ██████╗  ██████╗                          ║
║  ██╔════╝██╔═══██╗██╔════╝ ██╔═══██╗                         ║
║  ██║     ██║   ██║██║      ██║   ██║                         ║
║  ╚██████╗╚██████╔╝╚██████╗ ╚██████╔╝                         ║
║   ╚═════╝ ╚═════╝  ╚═════╝  ╚═════╝                          ║
║                                                               ║
║   Thanks for checking out the source! 🎨                     ║
║   Contribute: github.com/miladyxx333-lab/coco                   ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
});

// ============================================
// STRIPE DONATION INTEGRATION
// ============================================

const DONATIONS_API = 'http://localhost:5002';

/**
 * Create a Stripe checkout session and redirect
 */
async function donate(tier) {
    try {
        // Show loading state
        const buttons = document.querySelectorAll('.tier-btn, .one-time-btn');
        buttons.forEach(btn => btn.disabled = true);

        const response = await fetch(`${DONATIONS_API}/create-checkout-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tier })
        });

        const data = await response.json();

        if (data.url) {
            // Redirect to Stripe Checkout
            window.location.href = data.url;
        } else if (data.error) {
            alert('Error: ' + data.error);
            buttons.forEach(btn => btn.disabled = false);
        }
    } catch (error) {
        console.error('Donation error:', error);
        alert('Could not connect to payment server. Please try again later.');
        const buttons = document.querySelectorAll('.tier-btn, .one-time-btn');
        buttons.forEach(btn => btn.disabled = false);
    }
}

/**
 * Donate custom amount
 */
async function donateCustom() {
    const input = document.getElementById('customAmount');
    const amount = parseFloat(input.value);

    if (!amount || amount < 1) {
        alert('Please enter an amount of at least $1');
        return;
    }

    try {
        const buttons = document.querySelectorAll('.tier-btn, .one-time-btn');
        buttons.forEach(btn => btn.disabled = true);

        const response = await fetch(`${DONATIONS_API}/create-checkout-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tier: 'custom',
                amount: amount
            })
        });

        const data = await response.json();

        if (data.url) {
            window.location.href = data.url;
        } else if (data.error) {
            alert('Error: ' + data.error);
            buttons.forEach(btn => btn.disabled = false);
        }
    } catch (error) {
        console.error('Donation error:', error);
        alert('Could not connect to payment server. Please try again later.');
        const buttons = document.querySelectorAll('.tier-btn, .one-time-btn');
        buttons.forEach(btn => btn.disabled = false);
    }
}
