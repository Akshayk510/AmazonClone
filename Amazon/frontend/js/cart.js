// Cart JavaScript file for AmaClone

// Add item to cart
function addToCart(product, quantity = 1) {
    // Get current cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product is already in cart
    const existingProductIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingProductIndex !== -1) {
        // Update quantity if product already exists
        cart[existingProductIndex].quantity += quantity;
    } else {
        // Add new product to cart
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
    }
    
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Show notification
    showNotification(`${product.title} added to cart!`);
}

// Remove item from cart
function removeFromCart(productId) {
    // Get current cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Find product in cart
    const productIndex = cart.findIndex(item => item.id === productId);
    
    if (productIndex !== -1) {
        // Get product title before removing
        const productTitle = cart[productIndex].title;
        
        // Remove product from cart
        cart.splice(productIndex, 1);
        
        // Save cart to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update cart count
        updateCartCount();
        
        // Show notification
        showNotification(`${productTitle} removed from cart!`, 'info');
        
        // Update cart page if we're on it
        if (window.location.pathname.includes('cart.html')) {
            loadCartItems();
            updateCartSummary();
        }
    }
}

// Update item quantity in cart
function updateCartItemQuantity(productId, quantity) {
    // Get current cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Find product in cart
    const productIndex = cart.findIndex(item => item.id === productId);
    
    if (productIndex !== -1) {
        // Update quantity
        cart[productIndex].quantity = quantity;
        
        // Remove item if quantity is 0
        if (quantity <= 0) {
            cart.splice(productIndex, 1);
        }
        
        // Save cart to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update cart count
        updateCartCount();
        
        // Update cart page if we're on it
        if (window.location.pathname.includes('cart.html')) {
            updateCartSummary();
        }
    }
}

// Clear cart
function clearCart() {
    // Clear cart in localStorage
    localStorage.removeItem('cart');
    
    // Update cart count
    updateCartCount();
    
    // Show notification
    showNotification('Cart cleared!', 'info');
    
    // Update cart page if we're on it
    if (window.location.pathname.includes('cart.html')) {
        loadCartItems();
        updateCartSummary();
    }
}

// Load cart items on cart page
function loadCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    if (!cartItemsContainer) return;
    
    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Clear container
    cartItemsContainer.innerHTML = '';
    
    // Check if cart is empty
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h2>Your Amazon Cart is empty</h2>
                <p>Your shopping cart is waiting. Give it purpose – fill it with groceries, clothing, household supplies, electronics, and more.</p>
                <a href="index.html" class="continue-shopping">Continue shopping</a>
            </div>
        `;
        return;
    }
    
    // Add items to container
    cart.forEach(item => {
        const cartItemElement = createCartItemElement(item);
        cartItemsContainer.appendChild(cartItemElement);
    });
    
    // Add event listeners to quantity inputs and remove buttons
    addCartEventListeners();
}

// Create cart item element
function createCartItemElement(item) {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.dataset.productId = item.id;
    
    // Calculate item total
    const itemTotal = item.price * item.quantity;
    
    // Create cart item HTML
    cartItem.innerHTML = `
        <div class="cart-item-image">
            <img src="${item.image}" alt="${item.title}">
        </div>
        <div class="cart-item-details">
            <h3 class="cart-item-title">${item.title}</h3>
            <p class="cart-item-price">${formatPrice(item.price)}</p>
            <p class="cart-item-stock">In Stock</p>
            <div class="cart-item-actions">
                <div class="quantity-control">
                    <label for="quantity-${item.id}">Qty:</label>
                    <select id="quantity-${item.id}" class="quantity-select" data-product-id="${item.id}">
                        ${generateQuantityOptions(item.quantity)}
                    </select>
                </div>
                <span class="action-divider">|</span>
                <button class="delete-btn" data-product-id="${item.id}">Delete</button>
                <span class="action-divider">|</span>
                <button class="save-for-later-btn" data-product-id="${item.id}">Save for later</button>
            </div>
        </div>
        <div class="cart-item-price-total">
            ${formatPrice(itemTotal)}
        </div>
    `;
    
    return cartItem;
}

// Generate quantity options for select dropdown
function generateQuantityOptions(selectedQuantity) {
    let options = '';
    for (let i = 1; i <= 10; i++) {
        options += `<option value="${i}" ${i === selectedQuantity ? 'selected' : ''}>${i}</option>`;
    }
    return options;
}

// Add event listeners to cart elements
function addCartEventListeners() {
    // Quantity select event listeners
    const quantitySelects = document.querySelectorAll('.quantity-select');
    quantitySelects.forEach(select => {
        select.addEventListener('change', function() {
            const productId = parseInt(this.dataset.productId);
            const quantity = parseInt(this.value);
            updateCartItemQuantity(productId, quantity);
            
            // Update item total price
            const cartItem = this.closest('.cart-item');
            const itemPrice = parseFloat(cartItem.querySelector('.cart-item-price').textContent.replace('$', ''));
            const itemTotal = itemPrice * quantity;
            cartItem.querySelector('.cart-item-price-total').textContent = formatPrice(itemTotal);
        });
    });
    
    // Delete button event listeners
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.dataset.productId);
            removeFromCart(productId);
        });
    });
    
    // Save for later button event listeners
    const saveForLaterButtons = document.querySelectorAll('.save-for-later-btn');
    saveForLaterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.dataset.productId);
            saveForLater(productId);
        });
    });
}

// Save item for later
function saveForLater(productId) {
    // Get current cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Find product in cart
    const productIndex = cart.findIndex(item => item.id === productId);
    
    if (productIndex !== -1) {
        // Get product from cart
        const product = cart[productIndex];
        
        // Get saved for later items
        let savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];
        
        // Add product to saved items
        savedItems.push(product);
        
        // Save to localStorage
        localStorage.setItem('savedItems', JSON.stringify(savedItems));
        
        // Remove from cart
        cart.splice(productIndex, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update cart count
        updateCartCount();
        
        // Show notification
        showNotification(`${product.title} saved for later!`, 'info');
        
        // Update cart page if we're on it
        if (window.location.pathname.includes('cart.html')) {
            loadCartItems();
            loadSavedItems();
            updateCartSummary();
        }
    }
}

// Load saved items on cart page
function loadSavedItems() {
    const savedItemsContainer = document.getElementById('saved-for-later');
    if (!savedItemsContainer) return;
    
    // Get saved items from localStorage
    const savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];
    
    // Clear container
    savedItemsContainer.innerHTML = '';
    
    // Check if there are saved items
    if (savedItems.length === 0) {
        savedItemsContainer.style.display = 'none';
        return;
    }
    
    // Show saved items section
    savedItemsContainer.style.display = 'block';
    
    // Add header
    const savedItemsHeader = document.createElement('div');
    savedItemsHeader.className = 'saved-items-header';
    savedItemsHeader.innerHTML = `
        <h2>Saved for later (${savedItems.length} ${savedItems.length === 1 ? 'item' : 'items'})</h2>
    `;
    savedItemsContainer.appendChild(savedItemsHeader);
    
    // Add items container
    const savedItemsList = document.createElement('div');
    savedItemsList.className = 'saved-items-list';
    savedItemsContainer.appendChild(savedItemsList);
    
    // Add items to container
    savedItems.forEach(item => {
        const savedItemElement = createSavedItemElement(item);
        savedItemsList.appendChild(savedItemElement);
    });
    
    // Add event listeners to saved items
    addSavedItemsEventListeners();
}

// Create saved item element
function createSavedItemElement(item) {
    const savedItem = document.createElement('div');
    savedItem.className = 'saved-item';
    savedItem.dataset.productId = item.id;
    
    // Create saved item HTML
    savedItem.innerHTML = `
        <div class="saved-item-image">
            <img src="${item.image}" alt="${item.title}">
        </div>
        <div class="saved-item-details">
            <h3 class="saved-item-title">${item.title}</h3>
            <p class="saved-item-price">${formatPrice(item.price)}</p>
            <p class="saved-item-stock">In Stock</p>
            <div class="saved-item-actions">
                <button class="move-to-cart-btn" data-product-id="${item.id}">Move to cart</button>
                <span class="action-divider">|</span>
                <button class="delete-saved-btn" data-product-id="${item.id}">Delete</button>
            </div>
        </div>
    `;
    
    return savedItem;
}

// Add event listeners to saved items
function addSavedItemsEventListeners() {
    // Move to cart button event listeners
    const moveToCartButtons = document.querySelectorAll('.move-to-cart-btn');
    moveToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.dataset.productId);
            moveToCart(productId);
        });
    });
    
    // Delete button event listeners
    const deleteButtons = document.querySelectorAll('.delete-saved-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.dataset.productId);
            removeSavedItem(productId);
        });
    });
}

// Move saved item to cart
function moveToCart(productId) {
    // Get saved items from localStorage
    let savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];
    
    // Find product in saved items
    const productIndex = savedItems.findIndex(item => item.id === productId);
    
    if (productIndex !== -1) {
        // Get product from saved items
        const product = savedItems[productIndex];
        
        // Add to cart
        addToCart(product);
        
        // Remove from saved items
        savedItems.splice(productIndex, 1);
        localStorage.setItem('savedItems', JSON.stringify(savedItems));
        
        // Update cart page if we're on it
        if (window.location.pathname.includes('cart.html')) {
            loadCartItems();
            loadSavedItems();
            updateCartSummary();
        }
    }
}

// Remove saved item
function removeSavedItem(productId) {
    // Get saved items from localStorage
    let savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];
    
    // Find product in saved items
    const productIndex = savedItems.findIndex(item => item.id === productId);
    
    if (productIndex !== -1) {
        // Get product title before removing
        const productTitle = savedItems[productIndex].title;
        
        // Remove from saved items
        savedItems.splice(productIndex, 1);
        localStorage.setItem('savedItems', JSON.stringify(savedItems));
        
        // Show notification
        showNotification(`${productTitle} removed from saved items!`, 'info');
        
        // Update cart page if we're on it
        if (window.location.pathname.includes('cart.html')) {
            loadSavedItems();
        }
    }
}

// Update cart summary
function updateCartSummary() {
    const subtotalElement = document.getElementById('cart-subtotal');
    const itemCountElement = document.getElementById('item-count');
    const checkoutButton = document.getElementById('checkout-button');
    
    if (!subtotalElement || !itemCountElement || !checkoutButton) return;
    
    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Calculate subtotal and item count
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Update elements
    subtotalElement.textContent = formatPrice(subtotal);
    itemCountElement.textContent = `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`;
    
    // Enable/disable checkout button
    if (cart.length === 0) {
        checkoutButton.disabled = true;
        checkoutButton.classList.add('disabled');
    } else {
        checkoutButton.disabled = false;
        checkoutButton.classList.remove('disabled');
    }
}

// Apply discount code
function applyDiscount(code) {
    // Sample discount codes
    const discountCodes = {
        'WELCOME10': 0.1,
        'SAVE20': 0.2,
        'FREESHIP': 0.05
    };
    
    // Check if code is valid
    if (discountCodes[code]) {
        // Get discount percentage
        const discountPercentage = discountCodes[code];
        
        // Save to localStorage
        localStorage.setItem('discountCode', code);
        localStorage.setItem('discountPercentage', discountPercentage);
        
        // Show notification
        showNotification(`Discount code ${code} applied! You saved ${discountPercentage * 100}%`, 'success');
        
        // Update cart page if we're on it
        if (window.location.pathname.includes('cart.html')) {
            updateCartSummary();
            updateDiscountDisplay();
        }
        
        return true;
    } else {
        // Show notification
        showNotification('Invalid discount code!', 'error');
        return false;
    }
}

// Update discount display on cart page
function updateDiscountDisplay() {
    const discountElement = document.getElementById('discount-amount');
    const totalElement = document.getElementById('cart-total');
    const discountRowElement = document.getElementById('discount-row');
    
    if (!discountElement || !totalElement || !discountRowElement) return;
    
    // Get cart and discount from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const discountCode = localStorage.getItem('discountCode');
    const discountPercentage = parseFloat(localStorage.getItem('discountPercentage') || 0);
    
    // Calculate subtotal
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // If there's a discount code
    if (discountCode && discountPercentage > 0) {
        // Show discount row
        discountRowElement.style.display = 'flex';
        
        // Calculate discount amount
        const discountAmount = subtotal * discountPercentage;
        
        // Update discount element
        discountElement.textContent = `-${formatPrice(discountAmount)}`;
        
        // Calculate total
        const total = subtotal - discountAmount;
        
        // Update total element
        totalElement.textContent = formatPrice(total);
    } else {
        // Hide discount row
        discountRowElement.style.display = 'none';
        
        // Update total element
        totalElement.textContent = formatPrice(subtotal);
    }
}

// Initialize cart page
function initCartPage() {
    // Load cart items
    loadCartItems();
    
    // Load saved items
    loadSavedItems();
    
    // Update cart summary
    updateCartSummary();
    
    // Update discount display
    updateDiscountDisplay();
    
    // Add event listener to discount form
    const discountForm = document.getElementById('discount-form');
    if (discountForm) {
        discountForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const discountInput = document.getElementById('discount-code');
            if (discountInput) {
                const code = discountInput.value.trim().toUpperCase();
                if (code) {
                    applyDiscount(code);
                }
            }
        });
    }
    
    // Add event listener to checkout button
    const checkoutButton = document.getElementById('checkout-button');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', function() {
            if (!this.disabled) {
                window.location.href = 'checkout.html';
            }
        });
    }
}

// Check if we're on the cart page and initialize if needed
if (window.location.pathname.includes('cart.html')) {
    document.addEventListener('DOMContentLoaded', initCartPage);
}