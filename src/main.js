import './styles.scss';

const button = document.querySelector('.hero__button');
console.log('test')
if (button) {
  button.addEventListener('click', () => {
    button.classList.toggle('is-active');
    button.textContent = button.classList.contains('is-active')
      ? 'Interaction works'
      : 'Check interaction';
  });
}
