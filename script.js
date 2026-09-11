const root = document.querySelector('.cover');
const village = document.querySelector('.village');
const enter = document.querySelector('.enter');
const remembered = document.querySelector('.remembered');
const sound = document.querySelector('.sound');

root.addEventListener('pointermove', (event) => {
  const x = (event.clientX / innerWidth - 0.5) * -8;
  const y = (event.clientY / innerHeight - 0.5) * -5;
  village.style.setProperty('--x', `${x}px`);
  village.style.setProperty('--y', `${y}px`);
});

enter.addEventListener('click', () => {
  remembered.classList.add('show');
  localStorage.setItem('bellebrume-visited', 'yes');
});

remembered.querySelector('button').addEventListener('click', () => {
  remembered.classList.remove('show');
});

sound.addEventListener('click', () => {
  const active = sound.getAttribute('aria-pressed') !== 'true';
  sound.setAttribute('aria-pressed', String(active));
  sound.textContent = active ? 'le village écoute' : 'écouter le village';
});

if (localStorage.getItem('bellebrume-visited')) {
  document.querySelector('.invitation').textContent = 'Le village vous reconnaît. Certaines choses ont bougé.';
  enter.querySelector('span').textContent = 'Revenir autrement';
}
