document.addEventListener('DOMContentLoaded', () => {

    // 1. Navbar Scroll Effect
    const header = document.querySelector('.header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Intersection Observer for Fade-in Animations
    const faders = document.querySelectorAll('.fade-in');

    const appearOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function (entries, appearOnScroll) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('appear');
                appearOnScroll.unobserve(entry.target);
            }
        });
    }, appearOptions);

    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });

    // 3. Shopping Cart Logic
    const cartOverlay = document.getElementById('cartOverlay');
    const cartSidebar = document.getElementById('cartSidebar');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const navCartBtn = document.querySelector('.nav-cart-btn');
    const cartCount = document.querySelector('.cart-count');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartSubtotalEl = document.getElementById('cartSubtotal');
    const cartDeliveryCostEl = document.getElementById('cartDeliveryCost');
    const cartTotalEl = document.getElementById('cartTotal');
    const cartSubtotalLine = document.getElementById('cartSubtotalLine');
    const cartDeliveryLine = document.getElementById('cartDeliveryLine');
    const cartDiscountLine = document.getElementById('cartDiscountLine');
    const cartDiscountValueEl = document.getElementById('cartDiscountValue');
    const discountSection = document.getElementById('discountSection');

    const showCheckoutBtn = document.getElementById('showCheckoutBtn');
    const checkoutForm = document.getElementById('checkoutForm');

    // Delivery Options
    const deliveryRadios = document.querySelectorAll('input[name="deliveryType"]');
    const addressField = document.getElementById('addressField');
    const custAddress = document.getElementById('custAddress');
    const deliveryWarning = document.getElementById('deliveryWarning');

    // Discount Options
    const discountCodeInput = document.getElementById('discountCodeInput');
    const applyDiscountBtn = document.getElementById('applyDiscountBtn');
    const discountMessage = document.getElementById('discountMessage');

    const whatsappNumber = "+34622415979";

    let cart = [];
    let discountApplied = false;
    let discountAmount = 0;
    let discountPercentage = 0;

    // Format money
    const formatMoney = (amount) => `${amount.toFixed(2)}€`;

    // Open / Close Cart
    const toggleCart = (show) => {
        if (show) {
            cartOverlay.classList.add('active');
            cartSidebar.classList.add('open');
        } else {
            cartOverlay.classList.remove('active');
            cartSidebar.classList.remove('open');
            checkoutForm.classList.add('hidden'); // Reset checkout state
            if (discountSection) discountSection.classList.add('hidden'); // Reset discount state
            showCheckoutBtn.style.display = 'block';
        }
    };

    navCartBtn.addEventListener('click', () => toggleCart(true));
    closeCartBtn.addEventListener('click', () => toggleCart(false));
    cartOverlay.addEventListener('click', () => toggleCart(false));

    // Handle Delivery Radios
    deliveryRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'delivery') {
                addressField.classList.remove('hidden');
                custAddress.setAttribute('required', 'true');
            } else {
                addressField.classList.add('hidden');
                custAddress.removeAttribute('required');
            }
            updateCartUI();
        });
    });

    // Check if delivery is allowed (Requires at least one M or L cake)
    const canDeliver = () => {
        return cart.some(item => item.size === 'M' || item.size === 'L');
    };

    // Apply Discount
    if (applyDiscountBtn) {
        applyDiscountBtn.addEventListener('click', () => {
            const code = discountCodeInput.value.trim().toUpperCase();

            if (code === 'QASTIZA10') {
                discountApplied = true;
                discountPercentage = 0.10;
                discountMessage.textContent = "Cupón QASTIZA10 aplicado (-10%).";
                discountMessage.style.color = "#25D366"; // Green success color
                discountMessage.classList.remove('hidden');
            } else if (code === '') {
                discountApplied = false;
                discountPercentage = 0;
                discountMessage.classList.add('hidden');
            } else {
                discountApplied = false;
                discountPercentage = 0;
                discountMessage.textContent = "Cupón no válido.";
                discountMessage.style.color = "#ff4d4d"; // Red error color
                discountMessage.classList.remove('hidden');
            }

            updateCartUI();
        });
    }

    // Update Cart UI
    const updateCartUI = () => {
        cartItemsContainer.innerHTML = '';
        let totalCount = 0;
        let subtotal = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Tu carrito está vacío.</p>';
            cartCount.textContent = '0';
            if (cartSubtotalLine) cartSubtotalLine.style.display = 'none';
            if (cartDeliveryLine) cartDeliveryLine.style.display = 'none';
            if (cartDiscountLine) cartDiscountLine.style.display = 'none';
            cartTotalEl.textContent = '0.00€';
            showCheckoutBtn.disabled = true;

            // Allow selecting delivery even if empty to clear warnings, will be validated anyway on add
            deliveryWarning.classList.add('hidden');
            deliveryRadios[1].disabled = false;
            return;
        }

        showCheckoutBtn.disabled = false;

        cart.forEach((item, index) => {
            totalCount += item.quantity;
            subtotal += (item.price * item.quantity);

            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';

            // Map size to readable format
            const sizeMap = { 'S': 'Pequeña (4 rac.)', 'M': 'Mediana (8 rac.)', 'L': 'Grande (12 rac.)' };

            itemEl.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-size">${sizeMap[item.size]}</div>
                    <div class="cart-item-price">${formatMoney(item.price)}</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="qt-btn decrease" data-index="${index}">-</button>
                    <span class="qt-val">${item.quantity}</span>
                    <button class="qt-btn increase" data-index="${index}">+</button>
                </div>
                <button class="remove-item-btn" data-index="${index}" aria-label="Eliminar" title="Eliminar">&times;</button>
            `;
            cartItemsContainer.appendChild(itemEl);
        });

        cartCount.textContent = totalCount;

        // Delivery validation
        const deliverySelected = document.querySelector('input[name="deliveryType"]:checked').value === 'delivery';
        let remainingAfterDiscount = subtotal;

        // Apply discount to subtotal
        if (discountApplied) {
            discountAmount = subtotal * discountPercentage;
            remainingAfterDiscount = subtotal - discountAmount;

            if (cartDiscountValueEl) cartDiscountValueEl.textContent = `-${formatMoney(discountAmount)}`;
            if (cartDiscountLine) cartDiscountLine.style.display = 'flex';
        } else {
            discountAmount = 0;
            if (cartDiscountLine) cartDiscountLine.style.display = 'none';
        }

        let finalTotal = remainingAfterDiscount;

        if (!canDeliver()) {
            deliveryWarning.classList.remove('hidden');
            // If they had delivery selected, but removed all M/L items, switch them back to pickup
            if (deliverySelected) {
                document.querySelector('input[value="pickup"]').checked = true;
                addressField.classList.add('hidden');
                custAddress.removeAttribute('required');
                finalTotal = remainingAfterDiscount; // No delivery fee
            }
            deliveryRadios[1].disabled = true; // Disable delivery option
        } else {
            deliveryWarning.classList.add('hidden');
            deliveryRadios[1].disabled = false;

            if (deliverySelected) {
                finalTotal += 3; // Add delivery fee
                if (cartDeliveryCostEl) cartDeliveryCostEl.textContent = '3.00€';
                if (cartDeliveryLine) cartDeliveryLine.style.display = 'flex';
            } else {
                if (cartDeliveryLine) cartDeliveryLine.style.display = 'none';
            }
        }

        // Always show subtotal if checkout is open, or if delivery/discount is applied
        if (discountApplied || deliverySelected || !checkoutForm.classList.contains('hidden')) {
            if (cartSubtotalEl) cartSubtotalEl.textContent = formatMoney(subtotal);
            if (cartSubtotalLine) cartSubtotalLine.style.display = 'flex';
        } else {
            if (cartSubtotalLine) cartSubtotalLine.style.display = 'none';
        }

        cartTotalEl.textContent = formatMoney(finalTotal);
    };

    // Add functionality to cart items (increase, decrease, remove)
    cartItemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('increase')) {
            const idx = parseInt(e.target.getAttribute('data-index'));
            cart[idx].quantity++;
            updateCartUI();
        } else if (e.target.classList.contains('decrease')) {
            const idx = parseInt(e.target.getAttribute('data-index'));
            if (cart[idx].quantity > 1) {
                cart[idx].quantity--;
            } else {
                cart.splice(idx, 1);
            }
            updateCartUI();
        } else if (e.target.classList.contains('remove-item-btn')) {
            const idx = parseInt(e.target.getAttribute('data-index'));
            cart.splice(idx, 1);
            updateCartUI();
        }
    });

    // Update Price display when Size changes
    const sizeSelects = document.querySelectorAll('.size-select');
    sizeSelects.forEach(select => {
        select.addEventListener('change', (e) => {
            const option = e.target.options[e.target.selectedIndex];
            const price = option.getAttribute('data-price');
            // Find the closest product card
            const card = e.target.closest('.product-info');
            // Update the display price
            card.querySelector('.price').textContent = `${price}€`;
            // Update the add button data-price attribute
            card.querySelector('.add-to-cart-btn').setAttribute('data-price', price);
        });
    });

    // Add to Cart Buttons
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const name = btn.getAttribute('data-name');
            const price = parseFloat(btn.getAttribute('data-price'));

            // Find the selected size from the closest select
            const selectEl = btn.closest('.product-info').querySelector('.size-select');
            const size = selectEl.value;

            // Create a unique ID based on product and size
            const baseId = btn.getAttribute('data-baseid') || btn.getAttribute('data-id');
            const cartItemId = `${baseId}-${size}`;

            // Check if already in cart
            const existingItem = cart.find(item => item.id === cartItemId);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({
                    id: cartItemId,
                    name: name,
                    price: price,
                    size: size,
                    quantity: 1
                });
            }

            updateCartUI();
            toggleCart(true); // Open cart to show visual confirmation
        });
    });

    // Checkout Form / WhatsApp Formatting
    showCheckoutBtn.addEventListener('click', () => {
        showCheckoutBtn.style.display = 'none';
        checkoutForm.classList.remove('hidden');
    });

    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Transform the form into a payment redirect message
        const btn = document.getElementById('confirmOrderBtn');
        if (btn) {
            btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16" style="margin-right:8px; vertical-align:middle; animation: spin 1s linear infinite;"><!--!Font Awesome Free 6.5.1 by @fontawesome--><path fill="currentColor" d="M304 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zm0 416a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM48 304a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm464-48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM142.9 437A48 48 0 1 0 75 369.1 48 48 0 1 0 142.9 437zm0-294.2A48 48 0 1 0 75 75a48 48 0 1 0 67.9 67.9zM369.1 437A48 48 0 1 0 437 369.1 48 48 0 1 0 369.1 437z"/></svg> Procesando...`;
            btn.disabled = true;
        }

        // Mock payment gateway delay
        setTimeout(() => {
            // Replace form contents with success message
            checkoutForm.innerHTML = `
                <div style="text-align: center; padding: 2rem 0;">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="48" height="48" style="color: var(--color-whatsapp); margin-bottom: 1rem;"><!--!Font Awesome Free 6.5.1 by @fontawesome--><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg>
                    <h3 style="color: var(--color-accent); font-size: 1.5rem; margin-bottom: 0.5rem;">¡Redirigiendo a Pasarela de Pagos!</h3>
                    <p style="color: var(--color-text-muted); font-size: 0.95rem;">En un entorno real, estarías introduciendo tus datos de tarjeta en un entorno seguro (Redsys, Stripe, etc).</p>
                    <p style="color: var(--color-text-main); font-weight: bold; margin-top: 1.5rem;">— Fin de la Demostración —</p>
                </div>
            `;
            if (discountSection) discountSection.classList.add('hidden');
            cartCount.textContent = '0'; // Empty cart visual
        }, 1500);
    });

    // Basic Contact Button
    const contactBtns = document.querySelectorAll('.btn-outline, #global-wa-btn');
    contactBtns.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const message = "¡Hola Qastiza! Me gustaría haceros una consulta general.";
            const encodedMessage = encodeURIComponent(message);
            const waUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
            window.open(waUrl, '_blank');
        });
    });

});
