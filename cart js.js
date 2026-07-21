
const CART_KEY = 'mcd_cart';


function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(name, price, qty) {
  qty = qty || 1;
  const cart = getCart();
  if (cart[name]) {
    cart[name].qty += qty;
  } else {
    cart[name] = { price: price, qty: qty };
  }
  saveCart(cart);
}

function removeFromCart(name) {
  const cart = getCart();
  delete cart[name];
  saveCart(cart);
}

function setCartQty(name, qty) {
  const cart = getCart();
  if (!cart[name]) return;
  if (qty <= 0) {
    delete cart[name];
  } else {
    cart[name].qty = qty;
  }
  saveCart(cart);
}

function cartItemCount() {
  const cart = getCart();
  return Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
}


function updateCartBadge() {
  const badge = document.querySelector('.cart-count');
  if (badge) badge.textContent = cartItemCount();
}


function initProductCards() {
  const cards = document.querySelectorAll('.product-card[data-name]');

  cards.forEach(card => {
    const name = card.dataset.name;
    const price = parseFloat(card.dataset.price);
    const qtyValue = card.querySelector('.qty-value');
    const minusBtn = card.querySelector('.qty-minus');
    const plusBtn = card.querySelector('.qty-plus');
    const addBtn = card.querySelector('.add-to-cart-btn');

    if (!qtyValue || !minusBtn || !plusBtn || !addBtn) return;

    let qty = 1;
    qtyValue.textContent = qty;

    minusBtn.addEventListener('click', () => {
      qty = Math.max(1, qty - 1);
      qtyValue.textContent = qty;
    });

    plusBtn.addEventListener('click', () => {
      qty = Math.min(20, qty + 1);
      qtyValue.textContent = qty;
    });

    addBtn.addEventListener('click', () => {
      addToCart(name, price, qty);

      const originalText = addBtn.textContent;
      addBtn.textContent = 'Added!';
      addBtn.classList.add('added');
      setTimeout(() => {
        addBtn.textContent = originalText;
        addBtn.classList.remove('added');
      }, 900);

      qty = 1;
      qtyValue.textContent = qty;
    });
  });
}


function renderCartPage() {
  const container = document.querySelector('.cart-items');
  const emptyMsg = document.querySelector('.cart-empty');
  const totalEl = document.querySelector('.cart-total-value');
  if (!container) return; // not on the cart page

  const cart = getCart();
  const names = Object.keys(cart);

  container.innerHTML = '';

  if (names.length === 0) {
    if (emptyMsg) emptyMsg.style.display = 'block';
    if (totalEl) totalEl.textContent = '$0.00';
    return;
  }

  if (emptyMsg) emptyMsg.style.display = 'none';

  let total = 0;

  names.forEach(name => {
    const item = cart[name];
    const lineTotal = item.price * item.qty;
    total += lineTotal;

    const row = document.createElement('div');
    row.className = 'cart-row';
    row.innerHTML = `
      <p class="cart-row-name">${name}</p>
      <div class="cart-row-controls">
        <button class="qty-btn cart-qty-minus" type="button">-</button>
        <span class="qty-value">${item.qty}</span>
        <button class="qty-btn cart-qty-plus" type="button">+</button>
      </div>
      <p class="cart-row-price">$${lineTotal.toFixed(2)}</p>
      <button class="cart-remove-btn" type="button">Remove</button>
    `;

    row.querySelector('.cart-qty-minus').addEventListener('click', () => {
      setCartQty(name, item.qty - 1);
      renderCartPage();
    });
    row.querySelector('.cart-qty-plus').addEventListener('click', () => {
      setCartQty(name, item.qty + 1);
      renderCartPage();
    });
    row.querySelector('.cart-remove-btn').addEventListener('click', () => {
      removeFromCart(name);
      renderCartPage();
    });

    container.appendChild(row);
  });

  if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
}  

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  initProductCards();
  renderCartPage();
});