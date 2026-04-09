import Splide from '@splidejs/splide';

export function initHeroSlider() {
    const sliderRoot = document.querySelector('[data-product-slider]');

    if (!sliderRoot) {
        return;
    }

    const slider = new Splide(sliderRoot, {
        mediaQuery: 'min',
        type: 'loop',
        rewind: true,
        drag: true,
        snap: true,
        dragMinThreshold: {
            mouse: 4,
            touch: 12,
        },
        flickPower: 220,
        flickMaxPages: 1,
        waitForTransition: false,
        updateOnMove: true,
        autoWidth: true,
        pagination: false,
        arrows: false,
        perMove: 1,
        gap: '15px',
        padding: {right: '44px'},
        speed: 700,
        focus: 0,
        breakpoints: {
            768: {
                autoWidth: false,
                arrows: true,
                pagination: true,
                perPage: 1,
                gap: '18px',
                padding: {right: '0px'},
            },
            992: {
                autoWidth: false,
                perPage: 1,
                arrows: true,
                gap: '24px',
                padding: {right: '0px'},
            },
        },
    });

    slider.mount();
}
