const scene = document.querySelector('.opening');
const doorSensor = document.querySelector('.door-sensor');
let doorReady = false;

const later = (delay, className) => window.setTimeout(() => scene.classList.add(className), delay);

later(3200, 'first-window-dark');
later(4100, 'shadow-arrives');
later(5550, 'shadow-leaves');
window.setTimeout(() => {
  scene.classList.add('door-ready');
  doorReady = true;
}, 6500);

function approach(clientX, clientY) {
  if (!doorReady || scene.classList.contains('door-open')) return;
  const rect = doorSensor.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const distance = Math.hypot(clientX - centerX, clientY - centerY);
  if (distance < Math.max(90, rect.width * 2.8)) scene.classList.add('door-open');
}

scene.addEventListener('pointermove', event => approach(event.clientX, event.clientY));
doorSensor.addEventListener('pointerdown', () => scene.classList.add('door-open'));
doorSensor.addEventListener('focus', () => scene.classList.add('door-open'));
doorSensor.addEventListener('click', () => {
  if (!doorReady) return;
  scene.classList.add('door-open');
  window.setTimeout(() => {
    window.location.href = '../experience-v1/?scene=2';
  }, 620);
});

const canvas = document.querySelector('.wind-particles');
const context = canvas.getContext('2d');
const particles = Array.from({length: 58}, (_, index) => ({
  offset: (index * .618033) % 1,
  baseY: .31 + ((index * .271) % .61),
  size: .8 + (index % 6) * .31,
  speed: .72 + (index % 7) * .035,
  phase: index * 1.37,
}));
let windStart = 0;
let windHasPlayed = false;

function resizeWind() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function drawWind(now) {
  const rect = canvas.getBoundingClientRect();
  context.clearRect(0, 0, rect.width, rect.height);
  const progress = Math.min(1, (now - windStart) / 4600);
  const gather = Math.sin(Math.PI * progress) ** 2;
  particles.forEach((particle, index) => {
    const nx = 1.12 + particle.offset * .34 - progress * 1.48 * particle.speed;
    const flockY = .56 + Math.sin(nx * 8.2 + index * .23) * (.035 + (index % 5) * .005);
    const freeY = particle.baseY + Math.sin(now * .00055 + particle.phase) * .022;
    const ny = freeY * (1 - gather) + flockY * gather;
    const x = nx * rect.width;
    const y = ny * rect.height;
    const pulse = .35 + .65 * Math.sin(now * .002 + particle.phase) ** 2;
    context.save();
    context.translate(x, y);
    context.rotate(now * .00022 + particle.phase);
    context.globalAlpha = .34 + pulse * .62;
    context.fillStyle = index % 5 === 0 ? '#fff8dc' : '#d8f0f6';
    context.shadowColor = index % 5 === 0 ? '#ffe7a0' : '#c5eafa';
    context.shadowBlur = 5 + particle.size * 2;
    if (index % 7 === 0) {
      const radius = particle.size * 2.4;
      context.beginPath();
      context.moveTo(0, -radius);
      context.quadraticCurveTo(radius * .18, -radius * .18, radius, 0);
      context.quadraticCurveTo(radius * .18, radius * .18, 0, radius);
      context.quadraticCurveTo(-radius * .18, radius * .18, -radius, 0);
      context.quadraticCurveTo(-radius * .18, -radius * .18, 0, -radius);
      context.fill();
    } else {
      context.beginPath();
      context.arc(0, 0, particle.size, 0, Math.PI * 2);
      context.fill();
    }
    context.restore();
  });
  if (progress < 1) requestAnimationFrame(drawWind);
  else context.clearRect(0, 0, rect.width, rect.height);
}

resizeWind();
window.addEventListener('resize', resizeWind);
function startWind() {
  if (windHasPlayed) return;
  windHasPlayed = true;
  windStart = performance.now();
  requestAnimationFrame(drawWind);
}
scene.addEventListener('pointermove', startWind, {once:true});
scene.addEventListener('pointerdown', startWind, {once:true});
