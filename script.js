var observer = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      if (entry.target.classList.contains('counter')) {
        animateCounter(entry.target);
      }
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.reveal').forEach(function (el) { observer.observe(el); });

function animateCounter(el) {
  var target = parseInt(el.getAttribute('data-target') || '0', 10);
  var start = 0;
  var duration = 1500;
  var startTime = performance.now();
  function tick(now) {
    var p = Math.min(1, (now - startTime) / duration);
    var ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
    var val = Math.floor(start + (target - start) * ease);
    el.textContent = val;
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  }
  requestAnimationFrame(tick);
}

function setDynamicCounters() {
  var projectsCount = Array.prototype.slice.call(document.querySelectorAll('.project-card')).length;
  var clientSet = new Set();
  Array.prototype.slice.call(document.querySelectorAll('.project-card .details')).forEach(function (details) {
    var divs = Array.prototype.slice.call(details.querySelectorAll('div'));
    divs.forEach(function (d) {
      var s = d.querySelector('strong');
      if (s && s.textContent.trim() === 'Client') {
        var text = d.textContent.split(':').slice(1).join(':').trim();
        if (text) clientSet.add(text);
      }
    });
  });
  var clientsCount = clientSet.size;
  var awardsAttr = document.getElementById('about')?.getAttribute('data-awards');
  var awardsCount = parseInt(awardsAttr || '0', 10) || 0;

  var counters = Array.prototype.slice.call(document.querySelectorAll('.counter'));
  counters.forEach(function (c) {
    var metric = c.getAttribute('data-metric');
    var val = 0;
    if (metric === 'projects') val = projectsCount;
    else if (metric === 'clients') val = clientsCount;
    else if (metric === 'awards') val = awardsCount;
    c.setAttribute('data-target', String(val));
    c.textContent = '0';
  });
}

setDynamicCounters();

function applyStagger(containerSelector, itemSelector, startDelayMs, stepMs) {
  var container = document.querySelector(containerSelector);
  if (!container) return;
  var items = Array.prototype.slice.call(container.querySelectorAll(itemSelector));
  items.forEach(function (el, i) {
    var delay = (startDelayMs + i * stepMs) / 1000;
    el.style.transitionDelay = delay + 's';
  });
}

applyStagger('.timeline', '.timeline-item', 0, 120);
applyStagger('.skills-box', '.skills-category', 0, 120);
applyStagger('.projects .carousel-track', '.project-card', 0, 90);
applyStagger('.achievements', 'li', 0, 120);
applyStagger('.counters', '.counter', 0, 90);

document.querySelectorAll('.skill-card[data-tilt]').forEach(function (card) {
  card.addEventListener('mousemove', function (e) {
    var r = card.getBoundingClientRect();
    var x = e.clientX - r.left;
    var y = e.clientY - r.top;
    var rx = ((y / r.height) - 0.5) * -10;
    var ry = ((x / r.width) - 0.5) * 10;
    card.style.transform = 'translateY(0) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
  });
  card.addEventListener('mouseleave', function () {
    card.style.transform = '';
  });
});

var track = document.querySelector('.carousel-track');
var viewport = document.querySelector('.carousel-viewport');
var items = Array.prototype.slice.call(document.querySelectorAll('.project-card'));
var index = 0;

function cardWidth() {
  if (items.length === 0) return 0;
  var r = items[0].getBoundingClientRect();
  var gap = 18;
  return r.width + gap;
}

function updateCarousel() {
  var w = cardWidth();
  var x = index * w;
  track.style.transform = 'translateX(' + (-x) + 'px)';
}

document.querySelector('.carousel-btn.next')?.addEventListener('click', function () {
  if (index < items.length - 1) { index++; updateCarousel(); }
});
document.querySelector('.carousel-btn.prev')?.addEventListener('click', function () {
  if (index > 0) { index--; updateCarousel(); }
});

window.addEventListener('resize', updateCarousel);
updateCarousel();

var modal = document.getElementById('modal');
var modalTitle = document.querySelector('.modal-title');
var modalBody = document.querySelector('.modal-body');
var modalClose = document.querySelector('.modal-close');

items.forEach(function (card) {
  card.addEventListener('click', function () {
    var title = card.querySelector('h3')?.textContent || 'Project';
    var detailsEl = card.querySelector('.details');
    var body = detailsEl ? detailsEl.innerHTML : (card.querySelector('p')?.textContent || '');
    modalTitle.textContent = title;
    modalBody.innerHTML = body;
    modal.classList.remove('hidden');
  });
});

modalClose.addEventListener('click', function () { modal.classList.add('hidden'); });
modal.addEventListener('click', function (e) { if (e.target === modal) modal.classList.add('hidden'); });

var quotes = Array.prototype.slice.call(document.querySelectorAll('.quotes .quote'));
if (quotes.length > 0) {
  var q = 0;
  function rotateQuotes() {
    quotes[q].classList.remove('active');
    q = (q + 1) % quotes.length;
    quotes[q].classList.add('active');
  }
  setInterval(rotateQuotes, 4000);
}

var bg3d = document.getElementById('bg3d');
var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
renderer.setSize(window.innerWidth, window.innerHeight);
bg3d.appendChild(renderer.domElement);

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 6);

var ambient = new THREE.AmbientLight(0x8899ff, 0.7);
scene.add(ambient);
var dir = new THREE.DirectionalLight(0x6cf7ff, 1.2);
dir.position.set(5, 5, 5);
scene.add(dir);

var geo = new THREE.TorusKnotGeometry(1.2, 0.35, 220, 16);
var mat = new THREE.MeshStandardMaterial({ color: 0x9d61ff, metalness: 0.65, roughness: 0.25, emissive: 0x221144, emissiveIntensity: 0.6 });
var knot = new THREE.Mesh(geo, mat);
scene.add(knot);

var wireGeo = new THREE.IcosahedronGeometry(3.2, 2);
var wireMat = new THREE.MeshBasicMaterial({ color: 0x6cf7ff, wireframe: true, transparent: true, opacity: 0.18 });
var wire = new THREE.Mesh(wireGeo, wireMat);
scene.add(wire);

function animate() {
  knot.rotation.x += 0.003;
  knot.rotation.y += 0.005;
  wire.rotation.y -= 0.0015;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

window.addEventListener('resize', function () {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
