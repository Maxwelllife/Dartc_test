import {initBackButtons} from '../shared/ui/back-button.js';
import {initBurgerMenu} from '../widgets/site-header/burger-menu.js';
import {initDesktopDock} from '../widgets/desktop-dock/desktop-dock.js';
import {initHeroSlider} from '../widgets/hero-products/hero-slider.js';
import {initContactForm} from '../features/contact-form/form-validation.js';

export function initApp() {
    initBurgerMenu();
    initDesktopDock();
    initHeroSlider();
    initContactForm();
    initBackButtons();
}
