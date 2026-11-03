// Control mínimo del "pasar página". El efecto visual vive en styles.css.
(function () {
  const leaves = Array.from(document.querySelectorAll('.leaf'));
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  const label = document.getElementById('pageLabel');
  const bar = document.querySelector('.bar i');
  let cur = 0;

  // Retraso escalonado para que el contenido de cada hoja aparezca en cascada
  leaves.forEach(function (leaf) {
    leaf.querySelectorAll('.copy > *, .text-page > *, .cover .text > *').forEach(function (el, i) {
      el.style.setProperty('--i', i);
    });
  });

  function render() {
    leaves.forEach(function (leaf, i) {
      leaf.classList.toggle('flipped', i < cur);
      leaf.classList.toggle('active', i === cur);
      // Las hojas ya pasadas quedan "encima" para que la última en girar se vea al frente
      leaf.style.zIndex = i < cur ? i : leaves.length - i;
      leaf.setAttribute('aria-hidden', i === cur ? 'false' : 'true');
    });
    prev.disabled = cur === 0;
    next.disabled = cur === leaves.length - 1;
    label.textContent = String(cur + 1).padStart(2, '0') + ' / ' + String(leaves.length).padStart(2, '0');
    bar.style.width = ((cur + 1) / leaves.length * 100) + '%';
    var page = leaves[cur].querySelector('.page, .cover');
    if (page) page.scrollTop = 0;
    history.replaceState(null, '', '#p' + (cur + 1));
  }

  function go(n) {
    cur = Math.max(0, Math.min(leaves.length - 1, n));
    render();
  }

  prev.addEventListener('click', function () { go(cur - 1); });
  next.addEventListener('click', function () { go(cur + 1); });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') go(cur + 1);
    if (e.key === 'ArrowLeft') go(cur - 1);
  });

  // Botones del índice
  document.querySelectorAll('[data-goto]').forEach(function (b) {
    b.addEventListener('click', function () { go(parseInt(b.dataset.goto, 10)); });
  });

  // Deslizar con el dedo (solo gestos claramente horizontales)
  var sx = 0, sy = 0;
  document.querySelector('.book').addEventListener('touchstart', function (e) {
    sx = e.touches[0].clientX; sy = e.touches[0].clientY;
  }, { passive: true });
  document.querySelector('.book').addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - sx;
    var dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 60 && Math.abs(dy) < 40) go(dx < 0 ? cur + 1 : cur - 1);
  }, { passive: true });

  var m = location.hash.match(/^#p(\d+)$/);
  cur = m ? Math.max(0, Math.min(leaves.length - 1, parseInt(m[1], 10) - 1)) : 0;
  render();
})();