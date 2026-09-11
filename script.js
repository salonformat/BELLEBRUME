const root = document.querySelector('.cover');
const village = document.querySelector('.village');
const intro = document.querySelector('.intro');
const remembered = document.querySelector('.remembered');
const arrival = document.querySelector('.arrival');
const encounter = document.querySelector('.encounter');
const discovery = document.querySelector('.discovery');

const routes = [
  ['◇', 'Approcher la porte qui vient de s’ouvrir', 'la porte entrouverte'],
  ['↖', 'Suivre l’odeur de pain un peu brûlé', 'la boulangerie'],
  ['○', 'Parler à la personne qui attend au coin', 'le coin bleu'],
  ['↝', 'Prendre la ruelle qui n’est pas sur la carte', 'la ruelle'],
  ['□', 'Regarder derrière la fenêtre éclairée', 'la fenêtre'],
  ['×', 'Suivre les traces qui s’arrêtent soudain', 'les traces'],
  ['≈', 'Écouter le bruit d’eau sous les pavés', 'l’eau cachée']
];

const people = [
  ['Monsieur Auguste, le boulanger', 'Il te tend un pain qui est encore froid.', '« Je l’ai préparé pour toi demain matin. »'],
  ['Madame Mireille, la bouchère', 'Son tablier porte une poche recousue sept fois.', '« Ne demande jamais qui sonne la cloche. Compte seulement. »'],
  ['L’homme au coin', 'Il attend quelqu’un qui connaît quelqu’un qui te connaît.', '« Tu es arrivé plus tôt la dernière fois. »'],
  ['Madame Lenoir, l’ancienne institutrice', 'Elle garde les anciennes fautes de ses élèves dans une boîte.', '« L’école est fermée, mais une leçon t’attend encore. »'],
  ['Mademoiselle Violette, l’institutrice', 'Tous ses élèves dessinent aujourd’hui la même porte.', '« L’un de ces dessins est une vraie entrée. »'],
  ['Lucie, la factrice', 'Une enveloppe sans adresse dépasse de sa sacoche.', '« Cette lettre est revenue avant que je l’envoie. »'],
  ['Basile, le réparateur de parapluies', 'Il travaille même quand il ne pleut pas.', '« La pluie tombe parfois de bas en haut ici. »'],
  ['Les sœurs Brune et Brume', 'Chacune se souvient d’un village différent.', '« Elle ment », disent-elles exactement en même temps.'],
  ['Alma, la gardienne du verger', 'Elle reconnaît chaque pomme au bruit qu’elle fait.', '« Celle-ci a entendu ton secret. »'],
  ['Émile, l’horloger sans montre', 'Sa boutique ouvre pendant onze minutes seulement.', '« Tu as juste assez de temps pour te tromper. »']
];

const places = [
  ['l’ancienne piscine sous l’école', 'Les carreaux sont secs, mais tu entends quelqu’un nager derrière le mur.'],
  ['la gare où aucun train ne s’arrête', 'Sur le quai, un banc porte ton prénom fraîchement gravé.'],
  ['le cinéma aux fauteuils renversés', 'Le projecteur montre huit secondes d’un souvenir qui n’est pas encore arrivé.'],
  ['la serre avalée par les ronces', 'Une seule plante pousse dans un pot rempli de boutons.'],
  ['le grenier de l’ancienne école', 'Les cahiers sont classés selon des jours qui n’existent pas.'],
  ['le moulin immobile', 'À l’intérieur, les sacs de farine respirent très lentement.'],
  ['les bains abandonnés', 'Chaque cabine contient les vêtements de la même petite personne.'],
  ['l’atelier derrière la boucherie', 'Des centaines de clés sèchent sur une corde à linge.']
];

const objects = ['une clé en sucre', 'la moitié d’une photographie', 'un bouton encore chaud', 'un reçu daté de demain', 'une graine qui chuchote', 'une craie bleue mouillée', 'un ticket pour un train absent', 'une page arrachée à ton propre carnet'];
const responses = ['tu écoutes sans interrompre', 'tu montres seulement ce que tu as trouvé', 'tu gardes le détail le plus étrange pour toi', 'tu poses la question qui vient trop tard'];
const pick = list => list[crypto.getRandomValues(new Uint32Array(1))[0] % list.length];
const shuffled = list => [...list].sort(() => Math.random() - .5);

function buildArrival() {
  const previous = JSON.parse(localStorage.getItem('bellebrume-routes') || '[]');
  const windowSeen = localStorage.getItem('bellebrume-window') === 'seen';
  const available = routes.filter(route => !previous.includes(route[1]) && (windowSeen || route[2] !== 'la porte entrouverte'));
  let options = shuffled(available).slice(0, 3);
  if (windowSeen && !options.includes(routes[0])) options[0] = routes[0];
  if (options.length < 3) options = shuffled(routes).slice(0, 3);
  document.querySelector('.choices').innerHTML = options.map((route, index) => `
    <button class="choice" type="button" data-route="${routes.indexOf(route)}" aria-label="${route[1]}">
      <span class="choice-mark" aria-hidden="true">${route[0]}</span><span class="choice-text">${route[1]}</span>
    </button>`).join('');
  document.querySelectorAll('.choice').forEach(button => button.addEventListener('click', () => showEncounter(routes[Number(button.dataset.route)])));
}

function showEncounter(route) {
  const person = route[2] === 'la porte entrouverte' ? pick([people[3], people[4], people[5]]) : pick(people);
  const history = JSON.parse(localStorage.getItem('bellebrume-routes') || '[]');
  localStorage.setItem('bellebrume-routes', JSON.stringify([...history, route[1]].slice(-4)));
  encounter.querySelector('.story-kicker').textContent = `Tu choisis ${route[2]}. Quelqu’un t’arrête.`;
  encounter.querySelector('h2').textContent = person[0];
  encounter.querySelector('blockquote').textContent = person[2];
  encounter.querySelector('.story-question').textContent = `${person[1]} Tu t’approches. Il suffit maintenant d’écouter.`;
  encounter.querySelector('.character-shape span').textContent = person[0].charAt(0);
  const touch = encounter.querySelector('.encounter-touch');
  touch.onclick = () => showDiscovery(person, pick(responses));
  arrival.setAttribute('aria-hidden', 'true'); encounter.setAttribute('aria-hidden', 'false');
  root.classList.remove('arrived'); root.classList.add('met-someone');
}

function showDiscovery(person, response) {
  const place = pick(places); const object = pick(objects);
  discovery.querySelector('.story-kicker').textContent = `${person[0].split(',')[0]} indique un passage.`;
  discovery.querySelector('h2').textContent = `Tu entres dans ${place[0]}.`;
  discovery.querySelector('.discovery-text').textContent = place[1];
  discovery.querySelector('.found-object strong').textContent = object;
  discovery.querySelector('.place-shape span').textContent = '⌂';
  localStorage.setItem('bellebrume-object', object); localStorage.setItem('bellebrume-response', response.trim());
  encounter.setAttribute('aria-hidden', 'true'); discovery.setAttribute('aria-hidden', 'false');
  root.classList.remove('met-someone'); root.classList.add('found-something');
}

root.addEventListener('pointermove', event => {
  const nx = event.clientX / innerWidth - .5; const ny = event.clientY / innerHeight - .5;
  root.style.setProperty('--scene-x', `${nx * 5}deg`); root.style.setProperty('--scene-y', `${ny * -4}deg`);
  root.style.setProperty('--near-x', `${nx * 24}px`); root.style.setProperty('--near-y', `${ny * 13}px`);
  root.style.setProperty('--far-x', `${nx * -14}px`); root.style.setProperty('--far-y', `${ny * -8}px`);
  root.style.setProperty('--mid-x', `${nx * 10}px`); root.style.setProperty('--mid-y', `${ny * 6}px`);
  village.style.setProperty('--x', `${nx * -16}px`); village.style.setProperty('--y', `${ny * -9}px`);
  village.style.setProperty('--near-x', `${nx * 22}px`); village.style.setProperty('--near-y', `${ny * 12}px`);
  village.style.setProperty('--mid-x', `${nx * 11}px`); village.style.setProperty('--mid-y', `${ny * 6}px`);
  village.style.setProperty('--rx', `${ny * 1.2}deg`); village.style.setProperty('--ry', `${nx * -1.4}deg`);
  intro.style.setProperty('--tx', `${nx * 5}px`); intro.style.setProperty('--ty', `${ny * 4}px`);
});

document.querySelector('.enter').addEventListener('click', () => { remembered.classList.add('show'); localStorage.setItem('bellebrume-visited', 'yes'); });
remembered.querySelector('button').addEventListener('click', () => {
  remembered.classList.remove('show');
  setTimeout(() => {
    root.classList.add('arrived');
    arrival.setAttribute('aria-hidden', 'false');
  }, 720);
});
document.querySelectorAll('.restart').forEach(button => button.addEventListener('click', () => location.reload()));
discovery.querySelector('.keep-object').addEventListener('click', () => location.reload());
document.querySelector('.sound').addEventListener('click', event => { const active = event.currentTarget.getAttribute('aria-pressed') !== 'true'; event.currentTarget.setAttribute('aria-pressed', active); event.currentTarget.textContent = active ? 'le village écoute' : 'écouter le village'; });

if (localStorage.getItem('bellebrume-visited')) {
  document.querySelector('.invitation').textContent = 'Le village vous reconnaît. Certaines choses ont bougé.';
  document.querySelector('.enter span').textContent = 'Revenir autrement';
}
buildArrival();
