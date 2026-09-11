const stage = document.querySelector('.stage');
const win = document.querySelector('.window');
const door = document.querySelector('.door-way');
const note = document.querySelector('.falling-note');
setTimeout(() => stage.classList.add('open'), 1300);
setTimeout(() => stage.classList.add('dropping'), 3700);
setTimeout(() => {
  stage.classList.add('gone', 'landed');
  document.querySelector('.whisper').textContent = 'Le papier a atterri devant toi. Approche ta main.';
}, 5450);
win.addEventListener('click', () => {
  stage.classList.add('open');
  setTimeout(() => {
    stage.classList.add('gone');
    document.querySelector('.whisper').textContent = 'Le papier a atterri devant toi. Approche ta main.';
  }, 1500);
});
note.addEventListener('click', () => {
  stage.classList.add('unfolded');
  document.querySelector('.whisper').textContent = 'La porte dessinée est celle de la boulangerie.';
});
door.addEventListener('click', () => {
  localStorage.setItem('bellebrume-window', 'seen');
  location.href = '../index.html?from=window';
});
