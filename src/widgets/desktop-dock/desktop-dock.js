const STORAGE_KEY = 'storefront-state';

export function initDesktopDock() {
    const productCardElements = Array.from(document.querySelectorAll('[data-product-id]'));
    const panelElement = document.querySelector('[data-shop-panel]');
    const mobileDockElement = document.querySelector('.mobile-dock');
    const desktopDockElement = document.querySelector('.desktop-dock');

    if (!productCardElements.length || !panelElement) {
        return;
    }

    const panelTitleElement = panelElement.querySelector('[data-shop-panel-title]');
    const panelListElement = panelElement.querySelector('[data-shop-panel-list]');
    const panelEmptyElement = panelElement.querySelector('[data-shop-panel-empty]');
    const panelFooterElement = panelElement.querySelector('[data-shop-panel-footer]');
    const panelTotalElement = panelElement.querySelector('[data-shop-panel-total]');
    const panelCloseButton = panelElement.querySelector('[data-shop-panel-close]');
    const panelBackdropElement = document.querySelector('[data-shop-panel-backdrop]');
    const panelToggleButtons = [
        ...(mobileDockElement ? Array.from(mobileDockElement.querySelectorAll('[data-panel-open]')) : []),
        ...(desktopDockElement ? Array.from(desktopDockElement.querySelectorAll('[data-panel-open]')) : []),
    ];
    const favoriteBadgeElements = [
        ...(mobileDockElement ? Array.from(mobileDockElement.querySelectorAll('[data-favorites-count]')) : []),
        ...(desktopDockElement ? Array.from(desktopDockElement.querySelectorAll('[data-favorites-count]')) : []),
    ];
    const cartBadgeElements = [
        ...(mobileDockElement ? Array.from(mobileDockElement.querySelectorAll('[data-cart-count]')) : []),
        ...(desktopDockElement ? Array.from(desktopDockElement.querySelectorAll('[data-cart-count]')) : []),
    ];

    if (!panelTitleElement || !panelListElement || !panelEmptyElement || !panelFooterElement || !panelTotalElement) {
        return;
    }

    const productCards = productCardElements
        .map((cardElement) => {
            const productId = cardElement.dataset.productId;

            if (!productId) {
                return null;
            }

            const favoriteButton = cardElement.querySelector('[data-favorite-toggle]');
            const cartButton = cardElement.querySelector('[data-cart-add]');
            const cartLabel = cardElement.querySelector('[data-cart-label]');

            return {
                cardElement,
                productId,
                product: {
                    id: productId,
                    name: cardElement.dataset.productName ?? 'Product',
                    price: Number(cardElement.dataset.productPrice ?? 0),
                    image: cardElement.dataset.productImage ?? '',
                },
                favoriteButton,
                cartButton,
                cartLabel,
            };
        })
        .filter(Boolean);

    if (!productCards.length) {
        return;
    }

    const productsById = new Map(productCards.map(({productId, product}) => [productId, product]));
    const state = loadState(productsById);
    let activePanelType = null;

    const saveState = () => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                favorites: Array.from(state.favorites),
                cart: state.cart,
            }),
        );
    };

    const getCartCount = () => {
        return Object.values(state.cart).reduce((totalCount, quantity) => totalCount + quantity, 0);
    };

    const getCartTotal = () => {
        return Object.entries(state.cart).reduce((totalPrice, [productId, quantity]) => {
            const product = productsById.get(productId);
            return totalPrice + (product?.price ?? 0) * quantity;
        }, 0);
    };

    const formatPrice = (value) => `$${value.toLocaleString('en-US')}`;

    const setCartQuantity = (productId, nextQuantity) => {
        if (nextQuantity <= 0) {
            delete state.cart[productId];
            return;
        }

        state.cart[productId] = nextQuantity;
    };

    const updateBadges = () => {
        const favoritesCount = state.favorites.size;
        const cartCount = getCartCount();

        favoriteBadgeElements.forEach((badgeElement) => {
            badgeElement.textContent = String(favoritesCount);
            badgeElement.hidden = favoritesCount === 0;
        });

        cartBadgeElements.forEach((badgeElement) => {
            badgeElement.textContent = String(cartCount);
            badgeElement.hidden = cartCount === 0;
        });
    };

    const updateProductCards = () => {
        productCards.forEach(({productId, favoriteButton, cartButton, cartLabel}) => {
            const isFavorite = state.favorites.has(productId);
            const quantity = state.cart[productId] ?? 0;

            if (favoriteButton) {
                favoriteButton.classList.toggle('is-active', isFavorite);
                favoriteButton.setAttribute('aria-pressed', String(isFavorite));
            }

            if (!cartButton || !cartLabel) {
                return;
            }

            const defaultLabel = cartLabel.dataset.defaultLabel ?? cartLabel.textContent?.trim() ?? 'Add';

            cartLabel.dataset.defaultLabel = defaultLabel;
            cartButton.classList.toggle('is-added', quantity > 0);
            cartLabel.textContent = quantity > 0 ? `In cart: ${quantity}` : defaultLabel;
        });
    };

    const getPanelItems = () => {
        if (activePanelType === 'cart') {
            return Object.entries(state.cart)
                .filter(([, quantity]) => quantity > 0)
                .map(([productId, quantity]) => ({
                    product: productsById.get(productId),
                    quantity,
                }))
                .filter(({product}) => Boolean(product));
        }

        return Array.from(state.favorites)
            .map((productId) => ({
                product: productsById.get(productId),
                quantity: state.cart[productId] ?? 0,
            }))
            .filter(({product}) => Boolean(product));
    };

    const renderPanelItem = ({product, quantity}, isCartPanel) => {
        const controlsMarkup = isCartPanel
            ? `
                <div class="shop-panel__controls">
                    <button class="shop-panel__stepper" type="button" data-panel-action="decrease" data-product-id="${product.id}">-</button>
                    <span class="shop-panel__qty">${quantity}</span>
                    <button class="shop-panel__stepper" type="button" data-panel-action="increase" data-product-id="${product.id}">+</button>
                </div>
            `
            : `
                <div class="shop-panel__controls">
                    <button class="shop-panel__stepper" type="button" data-panel-action="add-to-cart" data-product-id="${product.id}">Add to cart</button>
                </div>
            `;

        const removeButtonClass = isCartPanel ? 'shop-panel__remove shop-panel__remove--cart' : 'shop-panel__remove';

        return `
            <article class="shop-panel__item">
                <div class="shop-panel__thumb">
                    <img class="shop-panel__thumb-image" src="${product.image}" alt="${product.name}" loading="lazy" decoding="async" />
                </div>
                <div>
                    <p class="shop-panel__item-title">${product.name}</p>
                    <p class="shop-panel__item-price">${formatPrice(product.price)}</p>
                    ${controlsMarkup}
                </div>
                <button class="${removeButtonClass}" type="button" aria-label="Remove ${product.name}" data-panel-action="remove" data-product-id="${product.id}"></button>
            </article>
        `;
    };

    const renderPanel = () => {
        if (!activePanelType) {
            return;
        }

        const isCartPanel = activePanelType === 'cart';
        const panelItems = getPanelItems();

        panelTitleElement.textContent = isCartPanel ? 'Cart' : 'Favorites';
        panelEmptyElement.textContent = isCartPanel ? 'Your cart is empty.' : 'Your favorites list is empty.';
        panelEmptyElement.hidden = panelItems.length > 0;
        panelListElement.innerHTML = panelItems.map((item) => renderPanelItem(item, isCartPanel)).join('');
        panelFooterElement.hidden = !isCartPanel || panelItems.length === 0;
        panelTotalElement.textContent = formatPrice(getCartTotal());
    };

    const render = () => {
        updateBadges();
        updateProductCards();
        renderPanel();
        saveState();
    };

    const closePanel = () => {
        activePanelType = null;
        panelElement.classList.remove('is-open');
        panelBackdropElement?.classList.remove('is-visible');
        panelElement.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('shop-panel-open');

        setTimeout(() => {
            if (panelElement.getAttribute('aria-hidden') !== 'true') {
                return;
            }

            panelElement.hidden = true;

            if (panelBackdropElement) {
                panelBackdropElement.hidden = true;
            }
        }, 300);
    };

    const openPanel = (panelType) => {
        activePanelType = panelType;
        renderPanel();
        panelElement.hidden = false;

        if (panelBackdropElement) {
            panelBackdropElement.hidden = false;
        }

        requestAnimationFrame(() => {
            panelElement.classList.add('is-open');
            panelBackdropElement?.classList.add('is-visible');
        });

        panelElement.setAttribute('aria-hidden', 'false');
        document.body.classList.add('shop-panel-open');
    };

    productCards.forEach(({productId, favoriteButton, cartButton}) => {
        favoriteButton?.addEventListener('click', () => {
            if (state.favorites.has(productId)) {
                state.favorites.delete(productId);
            } else {
                state.favorites.add(productId);
            }

            render();
        });

        cartButton?.addEventListener('click', () => {
            const nextQuantity = (state.cart[productId] ?? 0) + 1;
            setCartQuantity(productId, nextQuantity);
            render();
        });
    });

    panelToggleButtons.forEach((panelToggleButton) => {
        panelToggleButton.addEventListener('click', () => {
            const panelType = panelToggleButton.dataset.panelOpen;

            if (!panelType) {
                return;
            }

            if (activePanelType === panelType) {
                closePanel();
                return;
            }

            openPanel(panelType);
        });
    });

    panelListElement.addEventListener('click', (event) => {
        const targetElement = event.target;

        if (!(targetElement instanceof Element)) {
            return;
        }

        const actionButton = targetElement.closest('[data-panel-action]');

        if (!actionButton) {
            return;
        }

        const productId = actionButton.dataset.productId;
        const action = actionButton.dataset.panelAction;

        if (!productId || !action) {
            return;
        }

        if (action === 'increase' || action === 'add-to-cart') {
            setCartQuantity(productId, (state.cart[productId] ?? 0) + 1);
            render();
            return;
        }

        if (action === 'decrease') {
            setCartQuantity(productId, (state.cart[productId] ?? 0) - 1);
            render();
            return;
        }

        if (action !== 'remove') {
            return;
        }

        if (activePanelType === 'cart') {
            delete state.cart[productId];
        } else {
            state.favorites.delete(productId);
        }

        render();
    });

    panelBackdropElement?.addEventListener('click', closePanel);
    panelCloseButton?.addEventListener('click', closePanel);

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || !activePanelType) {
            return;
        }

        closePanel();
    });

    render();
}

function loadState(productsById) {
    try {
        const savedState = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');

        return {
            favorites: new Set(
                (Array.isArray(savedState.favorites) ? savedState.favorites : []).filter((productId) =>
                    productsById.has(productId),
                ),
            ),
            cart: isObject(savedState.cart) ? sanitizeCart(savedState.cart, productsById) : {},
        };
    } catch {
        return {
            favorites: new Set(),
            cart: {},
        };
    }
}

function sanitizeCart(cart, productsById) {
    return Object.fromEntries(
        Object.entries(cart).filter(
            ([productId, quantity]) => productsById.has(productId) && Number.isInteger(quantity) && quantity > 0,
        ),
    );
}

function isObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
