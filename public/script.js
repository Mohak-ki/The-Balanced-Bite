// ----------------------
// 🌸 Hamburger Menu
// ----------------------
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('primaryNav');
if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
  });
}

// ----------------------
// 🍪 Product Filtering + Auto Filter
// ----------------------
document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll('.tab');
  const products = document.querySelectorAll('#productGrid .card');

  function filterProducts(category) {
    if (!products.length) return;
    tabs.forEach(tab => tab.classList.remove('active'));
    const activeTab = document.querySelector(`.tab[data-filter="${category}"]`);
    if (activeTab) activeTab.classList.add('active');

    products.forEach(p => {
      p.style.display = (category === 'all' || p.dataset.cat === category) ? 'flex' : 'none';
    });
  }

  // manual click
  if (tabs.length && products.length) {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const filter = tab.dataset.filter;
        filterProducts(filter);
      });
    });
  }

  // auto filter via URL
  const params = new URLSearchParams(window.location.search);
  const category = params.get('category');
  if (category) {
    setTimeout(() => {
      filterProducts(category);
      console.log(`Auto-filtered for: ${category}`);
    }, 300);
  }
});

// ----------------------
// 🛒 Shopping Cart (with Remove + Clear All)
// ----------------------
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function updateCart() {
  localStorage.setItem('cart', JSON.stringify(cart));

  const cartItemsDiv = document.getElementById('cartItems');
  const cartTotalPrice = document.getElementById('cartTotalPrice');
  const checkoutBtn = document.getElementById('checkoutBtn');

  if (cartItemsDiv && cartTotalPrice && checkoutBtn) {
    cartItemsDiv.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
      total += item.price * item.qty;
      const div = document.createElement('div');
      div.classList.add('cart-item');
      div.innerHTML = `
        <span>${item.name} x${item.qty}</span>
        <div>
          <span>₹${item.price * item.qty}</span>
          <button class="remove-item" data-index="${index}" style="background:none;border:none;color:#c00;font-size:1rem;cursor:pointer;margin-left:8px;">✖</button>
        </div>
      `;
      cartItemsDiv.appendChild(div);
    });

    cartTotalPrice.textContent = "₹" + total;

    let clearBtn = document.getElementById('clearCart');
    if (cart.length > 0) {
      if (!clearBtn) {
        clearBtn = document.createElement('button');
        clearBtn.id = 'clearCart';
        clearBtn.textContent = '🧹 Clear All';
        clearBtn.style.cssText = `
          background:#f8d7da;
          border:none;
          color:#c00;
          font-weight:600;
          padding:10px;
          margin:10px 16px;
          border-radius:8px;
          cursor:pointer;
          transition:0.2s;
        `;
        checkoutBtn.insertAdjacentElement('beforebegin', clearBtn);

        clearBtn.addEventListener('click', () => {
          if (confirm("Are you sure you want to clear your cart?")) {
            cart = [];
            updateCart();
          }
        });
      }
    } else {
      if (clearBtn) clearBtn.remove();
    }

    document.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', e => {
        const i = e.target.dataset.index;
        cart.splice(i, 1);
        updateCart();
      });
    });
  }
}

// Add to Cart buttons for Products
const cartButtons = document.querySelectorAll('.card .btn.cart');
cartButtons.forEach(btn => {
  btn.addEventListener('click', e => {
    const card = e.target.closest('.card');
    if (!card) return;
    const name = card.querySelector('.title')?.innerText || "Item";
    const priceText = card.querySelector('.now')?.innerText.replace("₹", "") || "0";
    const price = parseInt(priceText);

    const existing = cart.find(i => i.name === name);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ name, price, qty: 1 });
    }

    updateCart();
    alert(`🛍 ${name} added to your cart!`);
  });
});

// Add to Cart buttons for Combo Plans
const comboButtons = document.querySelectorAll('.plan .btn.cart');
comboButtons.forEach(btn => {
  btn.addEventListener('click', e => {
    const plan = e.target.closest('.plan');
    const name = plan.querySelector('h3')?.innerText || "Combo Plan";
    const priceText = plan.querySelector('b')?.innerText.replace("₹", "") || "0";
    const price = parseInt(priceText);

    const existing = cart.find(i => i.name === name);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ name, price, qty: 1 });
    }

    updateCart();
    alert(`🛍 ${name} added to your cart!`);
  });
});

// ----------------------
// 🧭 Cart Sidebar Controls
// ----------------------
const cartSidebar = document.getElementById('cartSidebar');
const closeCart = document.getElementById('closeCart');
const checkoutBtn = document.getElementById('checkoutBtn');
const cartIcon = document.getElementById('cartIcon');

function openCart() {
  if (cartSidebar) cartSidebar.classList.add('active');
}
function closeCartSidebar() {
  if (cartSidebar) cartSidebar.classList.remove('active');
}

if (cartIcon) cartIcon.addEventListener('click', openCart);
if (closeCart) closeCart.addEventListener('click', closeCartSidebar);

// ----------------------
// 💳 Stripe Payment Gateway Integration + Login Check
// ----------------------
if (checkoutBtn) {
  checkoutBtn.addEventListener("click", async () => {
    if (cart.length === 0) {
      alert("🛒 Your cart is empty!");
      return;
    }

    // 🚨 Check login before checkout
    const token = localStorage.getItem('userToken');
    if (!token) {
      // 🌸 Styled popup instead of plain alert
      const popup = document.createElement('div');
      popup.innerHTML = `
        <div style="
          position: fixed; inset: 0; display: flex; justify-content: center; align-items: center;
          background: rgba(0,0,0,0.6); backdrop-filter: blur(3px); z-index: 9999;">
          <div style="
            background: linear-gradient(135deg, #8B4513, #D2691E);
            color: #fff; padding: 40px 30px; border-radius: 18px;
            text-align: center; font-family: 'Poppins', sans-serif;
            box-shadow: 0 15px 40px rgba(0,0,0,0.35);
            animation: popupIn 0.4s ease;">
            <i class="fa-solid fa-cookie-bite" style="font-size:2.5rem;margin-bottom:10px;"></i>
            <h3 style="font-size:1.4rem;margin-bottom:10px;">Login Required 🍪</h3>
            <p style="font-size:1rem;line-height:1.5;margin-bottom:20px;">
              You must be logged in to proceed to checkout.
            </p>
            <button id="goLoginBtn" style="
              background: #fff; color: #8B4513; border: none;
              padding: 10px 24px; border-radius: 8px; font-weight: 600;
              cursor: pointer; transition: 0.2s;">
              Go to Sign In
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(popup);

      document.getElementById('goLoginBtn').addEventListener('click', () => {
        window.location.href = "signin.html";
      });
      return;
    }

    // ✅ Logged in → continue with Stripe
    try {
      const response = await fetch("http://localhost:5000/api/payment/create-checkout-session",  {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            name: item.name,
            qty: item.qty,
            price: item.price
          }))
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url; // redirect to Stripe Checkout
      } else {
        alert("⚠️ Error creating checkout session.");
      }
    } catch (error) {
      console.error("Stripe error:", error);
      alert("❌ Payment failed: " + error.message);
    }
  });
}

// ----------------------
// ✨ Page Transition Effect
// ----------------------
document.body.style.opacity = 0;
document.body.style.transition = "opacity 0.6s ease";
window.addEventListener('load', () => {
  document.body.style.opacity = 1;
});

document.querySelectorAll('a.link').forEach(link => {
  link.addEventListener('click', e => {
    const targetUrl = link.getAttribute('href');
    if (targetUrl && !targetUrl.startsWith('#')) {
      e.preventDefault();
      document.body.style.opacity = 0;
      setTimeout(() => (window.location.href = targetUrl), 300);
    }
  });
});

// ----------------------
// 📦 Bulk & Newsletter Forms
// ----------------------
const bulkForm = document.querySelector('.bulk-form form');
if (bulkForm) {
  bulkForm.addEventListener('submit', e => {
    e.preventDefault();
    alert("📦 Your bulk order inquiry has been sent successfully!");
    bulkForm.reset();
  });
}

const newsletterForm = document.querySelector('.newsletter form');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', e => {
    e.preventDefault();
    alert("💌 Thanks for subscribing to our newsletter!");
    newsletterForm.reset();
  });
}

const quoteForm = document.getElementById('quoteForm');
if (quoteForm) {
  quoteForm.addEventListener('submit', e => {
    e.preventDefault();
    alert("📨 Thank you! We'll get back to you within 24 hours.");
    quoteForm.reset();
  });
}

// ----------------------
// 🎁 Subscription Modal Logic
// ----------------------
const modal = document.getElementById('subscriptionModal');
const closeModal = document.getElementById('closeModal');
const subForm = document.getElementById('subscriptionForm');
const planInput = document.getElementById('selectedPlan');
const priceInput = document.getElementById('selectedPrice');

document.querySelectorAll('.plan .btn.primary').forEach(btn => {
  btn.addEventListener('click', e => {
    const planCard = e.target.closest('.plan');
    const planName = planCard.querySelector('h3')?.innerText || 'Subscription';
    const price = planCard.querySelector('b')?.innerText || '₹0';
    if (planInput && priceInput && modal) {
      planInput.value = planName;
      priceInput.value = price;
      modal.style.display = 'flex';
    }
  });
});

if (closeModal) closeModal.addEventListener('click', () => (modal.style.display = 'none'));
window.addEventListener('click', e => {
  if (e.target === modal) modal.style.display = 'none';
});

if (subForm) {
  subForm.addEventListener('submit', e => {
    e.preventDefault();
    modal.style.display = 'none';
    alert("🎉 Subscription confirmed!");
  });
}