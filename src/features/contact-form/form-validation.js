const ERROR_MESSAGES = {
    name: 'Please enter at least 2 characters.',
    email: 'Please enter a valid email address.',
    message: 'Message must contain at least 10 characters.',
};

const SUCCESS_MESSAGES = {
    name: 'Name looks good.',
    email: 'Email looks good.',
    message: 'Message looks good.',
};

function isFieldValid(field) {
    const trimmedValue = field.value.trim();

    switch (field.name) {
        case 'name':
            return trimmedValue.length >= 2;
        case 'email':
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue);
        case 'message':
            return trimmedValue.length >= 10;
        default:
            return true;
    }
}

function updateFieldState(field, fieldRoot, messageElement) {
    if (!fieldRoot || !messageElement) {
        return true;
    }

    const trimmedValue = field.value.trim();

    if (!trimmedValue) {
        fieldRoot.classList.remove('is-error', 'is-success');
        messageElement.textContent = '';
        return false;
    }

    const isValid = isFieldValid(field);

    fieldRoot.classList.toggle('is-error', !isValid);
    fieldRoot.classList.toggle('is-success', isValid);
    messageElement.textContent = isValid ? SUCCESS_MESSAGES[field.name] : ERROR_MESSAGES[field.name];

    return isValid;
}

function resetFieldState(fieldElement, fieldRoot, messageElement) {
    fieldElement.value = '';

    if (!fieldRoot || !messageElement) {
        return;
    }

    fieldRoot.classList.remove('is-error', 'is-success');
    messageElement.textContent = '';
}

function submitFormPayload(payload) {
    console.log('Contact form payload:', payload);

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                ok: true,
                status: 200,
            });
        }, 400);
    });
}

export function initContactForm() {
    const formElement = document.querySelector('[data-contact-form]');

    if (!formElement) {
        return;
    }

    const fieldElements = Array.from(formElement.querySelectorAll('[data-validate-field]'));
    const statusElement = formElement.querySelector('[data-form-status]');

    if (!fieldElements.length) {
        return;
    }

    const submitButton = formElement.querySelector('[type="submit"]');

    const fieldStates = fieldElements.map((fieldElement) => ({
        fieldElement,
        fieldRoot: fieldElement.closest('[data-form-field]'),
        messageElement: fieldElement.closest('[data-form-field]')?.querySelector('[data-field-message]') ?? null,
    }));

    fieldStates.forEach(({ fieldElement, fieldRoot, messageElement }) => {
        const validateField = () => {
            updateFieldState(fieldElement, fieldRoot, messageElement);
        };

        fieldElement.addEventListener('input', () => {
            validateField();
        });

        fieldElement.addEventListener('blur', () => {
            validateField();
        });
    });

    formElement.addEventListener('submit', (event) => {
        event.preventDefault();

        const isFormValid = fieldStates.every(({ fieldElement, fieldRoot, messageElement }) =>
            updateFieldState(fieldElement, fieldRoot, messageElement),
        );

        if (!isFormValid) {
            if (statusElement) {
                statusElement.textContent = 'Please correct the highlighted fields before submitting.';
                statusElement.classList.add('is-error');
                statusElement.classList.remove('is-success');
                statusElement.classList.remove('is-pending');
            }

            return;
        }

        if (statusElement) {
            statusElement.textContent = 'Sending message...';
            statusElement.classList.add('is-pending');
            statusElement.classList.remove('is-error', 'is-success');
        }

        if (submitButton instanceof HTMLButtonElement) {
            submitButton.disabled = true;
        }

        const formData = Object.fromEntries(new FormData(formElement).entries());

        submitFormPayload(formData)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Request failed');
                }

                fieldStates.forEach(({ fieldElement, fieldRoot, messageElement }) => {
                    resetFieldState(fieldElement, fieldRoot, messageElement);
                });

                if (statusElement) {
                    statusElement.textContent = 'Message sent successfully.';
                    statusElement.classList.add('is-success');
                    statusElement.classList.remove('is-error', 'is-pending');
                }
            })
            .catch(() => {
                if (!statusElement) {
                    return;
                }

                statusElement.textContent = 'Could not send the form. Please try again later.';
                statusElement.classList.add('is-error');
                statusElement.classList.remove('is-success', 'is-pending');
            })
            .finally(() => {
                if (!(submitButton instanceof HTMLButtonElement)) {
                    return;
                }

                submitButton.disabled = false;
            });
    });
}
