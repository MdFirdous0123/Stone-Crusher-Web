/* ============================================
   NAGALAND STONE CRUSHER — MAIN JAVASCRIPT
   ============================================ */

// ---- Navbar Scroll Effect ----
const navbar = document.querySelector('.navbar');
const scrollTopBtn = document.querySelector('.scroll-top');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Scroll to top button
  if (scrollTopBtn) {
    if (window.scrollY > 400) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  }
});

// ---- Mobile Nav Toggle ----
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    navToggle.classList.toggle('active');
  });

  // Close nav when a link is clicked
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('active');
    });
  });
}

// ---- Scroll to Top ----
if (scrollTopBtn) {
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ---- Product Data ----
const products = [
  {
    id: 'chaana-gitti-20mm',
    nameHi: 'Chaana Gitti (20mm)',
    nameEn: 'Crushed Stone Aggregate — 20mm',
    category: 'crusher',
    price: 25,
    minOrder: 50,
    unit: 'cft',
    badge: 'Popular'
  },
  {
    id: 'gitti-10mm',
    nameHi: '3/4 Gitti (10mm)',
    nameEn: 'Crushed Stone Aggregate — 10mm (¾ inch)',
    category: 'crusher',
    price: 45,
    minOrder: 50,
    unit: 'cft',
    badge: 'Premium'
  },
  {
    id: 'stone-dust',
    nameHi: 'Stone Dust',
    nameEn: 'Stone Dust / Crusher Dust',
    category: 'crusher',
    price: 10,
    minOrder: 50,
    unit: 'cft',
    badge: 'Best Value'
  },
  {
    id: 'daupani-balu',
    nameHi: 'Deopani Balu',
    nameEn: 'River Sand (Deopani)',
    category: 'sand',
    price: 50,
    minOrder: 50,
    unit: 'cft',
    badge: 'Premium'
  },
  {
    id: 'local-balu',
    nameHi: 'Local Balu',
    nameEn: 'Local Sand',
    category: 'sand',
    price: 20,
    minOrder: 50,
    unit: 'cft',
    badge: 'Affordable'
  }
];

// ---- Payment Page: Order Calculator ----
const productSelect = document.getElementById('product-select');
const quantityInput = document.getElementById('quantity');
const summaryProduct = document.getElementById('summary-product');
const summaryPrice = document.getElementById('summary-price');
const summaryQuantity = document.getElementById('summary-quantity');
const summaryMinOrder = document.getElementById('summary-min-order');
const summaryTotal = document.getElementById('summary-total');

function updateOrderSummary() {
  if (!productSelect || !quantityInput) return;

  const selectedId = productSelect.value;
  const product = products.find(p => p.id === selectedId);
  const qty = parseInt(quantityInput.value) || 0;

  if (product) {
    summaryProduct.textContent = `${product.nameHi} / ${product.nameEn}`;
    summaryPrice.textContent = `₹${product.price} per ${product.unit}`;
    summaryMinOrder.textContent = `${product.minOrder} ${product.unit}`;
    summaryQuantity.textContent = qty > 0 ? `${qty} ${product.unit}` : '—';

    // Calculate total based on ACTUAL quantity entered
    const total = qty > 0 ? product.price * qty : 0;
    summaryTotal.textContent = total > 0 ? `₹${total.toLocaleString('en-IN')}` : '₹0';

    // Show warning if below minimum order
    let minWarn = document.getElementById('min-order-warning');
    if (!minWarn) {
      minWarn = document.createElement('div');
      minWarn.id = 'min-order-warning';
      minWarn.style.cssText = 'color:#f97316;font-size:0.82rem;margin-top:8px;padding:8px 12px;background:rgba(249,115,22,0.08);border:1px solid rgba(249,115,22,0.2);border-radius:8px;display:none;';
      summaryTotal.parentElement.appendChild(minWarn);
    }
    if (product.minOrder && qty > 0 && qty < product.minOrder) {
      minWarn.innerHTML = `⚠️ Minimum order is <strong>${product.minOrder} cft</strong>. Please enter at least ${product.minOrder} cft to place your order.`;
      minWarn.style.display = 'block';
    } else {
      minWarn.style.display = 'none';
    }

    // Update quantity min attribute
    quantityInput.setAttribute('min', product.minOrder);
    quantityInput.setAttribute('placeholder', `Minimum ${product.minOrder} cft`);
  } else {
    summaryProduct.textContent = '—';
    summaryPrice.textContent = '—';
    summaryQuantity.textContent = '—';
    summaryMinOrder.textContent = '—';
    summaryTotal.textContent = '₹0';
  }
}

if (productSelect) {
  productSelect.addEventListener('change', updateOrderSummary);
}
if (quantityInput) {
  quantityInput.addEventListener('input', updateOrderSummary);
}

// ---- Order Form Submission ----
const orderForm = document.getElementById('order-form');
if (orderForm) {
  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const selectedId = productSelect.value;
    const product = products.find(p => p.id === selectedId);
    const qty = parseInt(quantityInput.value) || 0;
    const name = document.getElementById('customer-name').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    const address = document.getElementById('customer-address').value.trim();

    if (!selectedId) {
      showNotification('Please select a product!', 'error');
      return;
    }
    if (!name) {
      showNotification('Please enter your name!', 'error');
      return;
    }
    if (!phone || phone.length < 10) {
      showNotification('Please enter a valid phone number!', 'error');
      return;
    }
    if (product.minOrder && qty < product.minOrder) {
      showNotification(`Minimum order for ${product.nameHi} is ${product.minOrder} cft!`, 'error');
      return;
    }
    if (qty <= 0) {
      showNotification('Please enter a valid quantity!', 'error');
      return;
    }

    const total = product.price * qty;

    // Build WhatsApp message
    const message = `🪨 *New Order — Nagaland Stone Crusher*\n\n` +
      `*Product:* ${product.nameHi} (${product.nameEn})\n` +
      `*Quantity:* ${qty} cft\n` +
      `*Price:* ₹${product.price}/cft\n` +
      `*Total:* ₹${total.toLocaleString('en-IN')}\n\n` +
      `*Customer:* ${name}\n` +
      `*Phone:* ${phone}\n` +
      `*Address:* ${address || 'Not provided'}\n\n` +
      `Please confirm this order. Thank you! 🙏`;

    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/91${SITE_CONFIG.phone}?text=${encoded}`;

    showNotification('Redirecting to WhatsApp to confirm your order...', 'success');

    // Save order to history if logged in
    if (typeof AUTH !== 'undefined' && AUTH.isLoggedIn()) {
      AUTH.addOrder({
        product: `${product.nameHi} (${product.nameEn})`,
        quantity: qty,
        price: product.price,
        total: total,
        customerName: name,
        customerPhone: phone,
        address: address || 'Not provided'
      });
    }

    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
    }, 1500);
  });
}

// ---- Contact Form ----
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('contact-name').value.trim();
    const phone = document.getElementById('contact-phone').value.trim();
    const msg = document.getElementById('contact-message').value.trim();

    if (!name || !phone || !msg) {
      showNotification('Please fill in all fields!', 'error');
      return;
    }

    const message = `👋 *Message from Website — Nagaland Stone Crusher*\n\n` +
      `*Name:* ${name}\n` +
      `*Phone:* ${phone}\n` +
      `*Message:* ${msg}`;

    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/91${SITE_CONFIG.phone}?text=${encoded}`;

    showNotification('Opening WhatsApp...', 'success');

    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
    }, 1000);
  });
}

// ---- Notification Toast ----
function showNotification(message, type = 'info') {
  // Remove existing notification
  const existing = document.querySelector('.notification-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `notification-toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
    <span>${message}</span>
  `;

  // Style the toast
  Object.assign(toast.style, {
    position: 'fixed',
    top: '90px',
    right: '24px',
    background: type === 'success' ? '#166534' : type === 'error' ? '#991b1b' : '#1e3a5f',
    color: '#fff',
    padding: '16px 24px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.95rem',
    fontFamily: "'Inter', sans-serif",
    zIndex: '9999',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    animation: 'fadeInUp 0.4s ease',
    maxWidth: '400px'
  });

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ---- Intersection Observer for Animations ----
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.product-card, .feature-card, .form-card, .contact-info-card, .order-summary').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    observer.observe(el);
  });
});

// Add CSS class for animated elements
const style = document.createElement('style');
style.textContent = `
  .animate-in {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }
`;
document.head.appendChild(style);
