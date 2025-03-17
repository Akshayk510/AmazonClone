// Products JavaScript file for AmaClone

// Sample product data (in a real application, this would come from an API)
const products = [
    {
        id: 1,
        title: "Apple iPhone 13 Pro, 128GB, Graphite - Unlocked (Renewed Premium)",
        price: 899.99,
        originalPrice: 999.99,
        rating: 4.5,
        ratingCount: 12543,
        image: "images/products/iphone13.jpg",
        category: "electronics",
        isPrime: true,
        inStock: true,
        description: "This Renewed Premium product is shipped and sold by Amazon and has been certified by Amazon to work and look like new. With at least 90% battery life, the product comes in deluxe Amazon-branded packaging and with the original accessories and a 1-year warranty."
    },
    {
        id: 2,
        title: "Samsung 65-Inch Class QLED 4K UHD Q70A Series Quantum HDR Smart TV",
        price: 1097.99,
        originalPrice: 1399.99,
        rating: 4.7,
        ratingCount: 8765,
        image: "images/products/samsung-tv.jpg",
        category: "electronics",
        isPrime: true,
        inStock: true,
        description: "QUANTUM PROCESSOR 4K: Elevate your picture to 4K with machine based AI. MOTION XCELERATOR TURBO+: Exceptional motion enhancements up to 4K 120Hz. DUAL LED: Dedicated warm and cool LED backlights provide enhanced contrast."
    },
    {
        id: 3,
        title: "Sony WH-1000XM4 Wireless Noise Canceling Overhead Headphones",
        price: 278.00,
        originalPrice: 349.99,
        rating: 4.8,
        ratingCount: 34567,
        image: "images/products/sony-headphones.jpg",
        category: "electronics",
        isPrime: true,
        inStock: true,
        description: "Industry-leading noise canceling with Dual Noise Sensor technology. Next-level music with Edge-AI, co-developed with Sony Music Studios Tokyo. Up to 30-hour battery life with quick charging (10 min charge for 5 hours of playback)."
    },
    {
        id: 4,
        title: "Instant Pot Duo Plus 9-in-1 Electric Pressure Cooker",
        price: 119.95,
        originalPrice: 149.99,
        rating: 4.7,
        ratingCount: 123456,
        image: "images/products/instant-pot.jpg",
        category: "home",
        isPrime: true,
        inStock: true,
        description: "9-IN-1 FUNCTIONALITY: Pressure cook, slow cook, rice cooker, yogurt maker, steamer, sauté pan, yogurt maker, sterilizer and food warmer. IMPROVED STRESS-FREE VENTING: Intuitive and simple, our improved easy-release steam switch makes releasing steam easier than ever, and it automatically resets when the lid is closed."
    },
    
// Sample deals data
const deals = [
    {
        id: 101,
        title: "Fire TV Stick 4K streaming device",
        price: 29.99,
        originalPrice: 49.99,
        discount: 40,
        image: "images/products/fire-tv-stick.jpg",
        category: "electronics",
        endDate: "2023-12-31"
    },
    {
        id: 102,
        title: "Echo Dot (5th Gen) Smart speaker with Alexa",
        price: 27.99,
        originalPrice: 49.99,
        discount: 44,
        image: "images/products/echo-dot.jpg",
        category: "electronics",
        endDate: "2023-12-31"
    },
    {
        id: 103,
        title: "Keurig K-Mini Coffee Maker",
        price: 59.99,
        originalPrice: 99.99,
        discount: 40,
        image: "images/products/keurig.jpg",
        category: "home",
        endDate: "2023-12-31"
    },
    {
        id: 104,
        title: "Blink Video Doorbell",
        price: 34.99,
        originalPrice: 49.99,
        discount: 30,
        image: "images/products/blink-doorbell.jpg",
        category: "smart-home",
        endDate: "2023-12-31"
    },
    {
        id: 105,
        title: "Kindle Paperwhite Kids",
        price: 109.99,
        originalPrice: 159.99,
        discount: 31,
        image: "images/products/kindle-kids.jpg",
        category: "electronics",
        endDate: "2023-12-31"
    },
    {
        id: 106,
        title: "Apple iPad (9th Generation)",
        price: 249.00,
        originalPrice: 329.00,
        discount: 24,
        image: "images/products/ipad.jpg",
        category: "electronics",
        endDate: "2023-12-31"
    }
];

// Load featured products
function loadFeaturedProducts() {
    const featuredProductsContainer = document.getElementById('featured-products-container');
    if (!featuredProductsContainer) return;
    
    // Clear container
    featuredProductsContainer.innerHTML = '';
    
    // Add products to container
    products.forEach(product => {
        const productCard = createProductCard(product);
        featuredProductsContainer.appendChild(productCard);
    });
}

// Create product card element
function createProductCard(product) {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    
    // Calculate discount percentage if there's an original price
    let discountBadge = '';
    if (product.originalPrice > product.price) {
        const discountPercentage = calculateDiscountPercentage(product.originalPrice, product.price);
        discountBadge = `<span class="discount-badge">-${discountPercentage}%</span>`;
    }
    
    // Create prime badge if product is prime eligible
    const primeBadge = product.isPrime ? 
        `<div class="prime-badge">
            <img src="images/prime-logo.png" alt="Prime">
            <span>FREE One-Day</span>
        </div>` : '';
    
    // Create product HTML
    productCard.innerHTML = `
        <img src="${product.image}" alt="${product.title}" class="product-image">
        <div class="product-details">
            <h3 class="product-title">${product.title}</h3>
            <div class="product-rating">
                <div class="stars">${generateStarRating(product.rating)}</div>
                <span class="rating-count">${product.ratingCount.toLocaleString()}</span>
            </div>
            <div class="product-price">
                ${formatPrice(product.price)}
                ${product.originalPrice > product.price ? 
                    `<span class="original-price">${formatPrice(product.originalPrice)}</span>${discountBadge}` : ''}
            </div>
            ${primeBadge}
            <button class="add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>
        </div>
    `;
    
    // Add event listener to Add to Cart button
    setTimeout(() => {
        const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', function() {
                addToCart(product);
            });
        }
    }, 0);
    
    return productCard;
}

// Load deals
function loadDeals() {
    const dealsContainer = document.getElementById('deals-container');
    if (!dealsContainer) return;
    
    // Clear container
    dealsContainer.innerHTML = '';
    
    // Add deals to container
    deals.forEach(deal => {
        const dealCard = createDealCard(deal);
        dealsContainer.appendChild(dealCard);
    });
}

// Create deal card element
function createDealCard(deal) {
    const dealCard = document.createElement('div');
    dealCard.className = 'deal-card';
    
    // Create deal HTML
    dealCard.innerHTML = `
        <img src="${deal.image}" alt="${deal.title}" class="deal-image">
        <div class="deal-details">
            <span class="deal-discount">Up to ${deal.discount}% off</span>
            <h3 class="deal-title">${deal.title}</h3>
            <div class="deal-price">
                ${formatPrice(deal.price)}
                <span class="original-price">${formatPrice(deal.originalPrice)}</span>
            </div>
        </div>
    `;
    
    // Add event listener to deal card
    dealCard.addEventListener('click', function() {
        window.location.href = `product.html?id=${deal.id}`;
    });
    
    return dealCard;
}