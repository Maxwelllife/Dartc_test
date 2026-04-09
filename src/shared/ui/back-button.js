export function initBackButtons() {
    const buttons = document.querySelectorAll('[data-back-button]');
    const homePath = import.meta.env.BASE_URL;

    if (!buttons.length) {
        return;
    }

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            if (history.length > 1) {
                history.back();
                return;
            }

            location.href = homePath;
        });
    });
}
