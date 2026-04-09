export function initBurgerMenu() {
    const rootElement = document.querySelector('[data-menu-root]');

    if (!rootElement) {
        return;
    }

    const menuButton = rootElement.querySelector('[data-menu-button]');
    const menuPanel = rootElement.querySelector('[data-menu-panel]');
    const backdropElement = rootElement.querySelector('[data-menu-backdrop]');
    const toggleButtons = Array.from(rootElement.querySelectorAll('[data-nav-toggle]'));
    const menuLinks = rootElement.querySelectorAll('[data-menu-panel] a');

    if (!menuButton || !menuPanel) {
        return;
    }

    const closeMenu = () => {
        rootElement.classList.remove('is-open');
        menuButton.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
    };

    const setMenuState = (isOpen) => {
        rootElement.classList.toggle('is-open', isOpen);
        menuButton.setAttribute('aria-expanded', String(isOpen));
        document.body.classList.toggle('menu-open', isOpen);
    };

    const setDropdownState = (toggleButton, isOpen) => {
        const navItem = toggleButton.closest('.js--site-header__nav-item');

        if (!navItem) {
            return;
        }

        navItem.classList.toggle('is-open', isOpen);
        toggleButton.setAttribute('aria-expanded', String(isOpen));
    };

    const closeDropdowns = (currentToggleButton = null) => {
        toggleButtons.forEach((toggleButton) => {
            if (toggleButton === currentToggleButton) {
                return;
            }

            setDropdownState(toggleButton, false);
        });
    };

    menuButton.addEventListener('click', () => {
        const isOpen = !rootElement.classList.contains('is-open');
        setMenuState(isOpen);
    });

    backdropElement?.addEventListener('click', closeMenu);

    menuLinks.forEach((menuLink) => {
        menuLink.addEventListener('click', () => {
            closeMenu();
            closeDropdowns();
        });
    });

    toggleButtons.forEach((toggleButton) => {
        toggleButton.addEventListener('click', () => {
            const isOpen = toggleButton.getAttribute('aria-expanded') === 'true';
            closeDropdowns(toggleButton);
            setDropdownState(toggleButton, !isOpen);
        });
    });

    document.addEventListener('click', (event) => {
        const targetElement = event.target;

        if (!(targetElement instanceof Element)) {
            return;
        }

        if (menuPanel.contains(targetElement) || menuButton.contains(targetElement)) {
            return;
        }

        closeDropdowns();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') {
            return;
        }

        closeMenu();
        closeDropdowns();
    });

    addEventListener('resize', () => {
        if (innerWidth <= 767) {
            return;
        }

        closeMenu();
        closeDropdowns();
    });
}
