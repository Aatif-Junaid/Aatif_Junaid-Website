// Homepage-only scroll effects, timeline rail, carousel, and reveal behavior.

(function () {
  var labels = document.querySelectorAll('.eyebrow');
  if (!labels.length) return;
  if (!('IntersectionObserver' in window)) {
    labels.forEach(function (label) { label.classList.add('eyebrow--active'); });
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      entry.target.classList.toggle('eyebrow--active', entry.isIntersecting);
    });
  }, { rootMargin: '-5% 0px -50% 0px', threshold: 0 });
  labels.forEach(function (label) { observer.observe(label); });
})();

(function () {
  // Timeline rail: a glowing runner that leads the viewport midpoint down the
  // rail, lighting each role's dot as it passes. Replaces the canvas comet.
  var timeline = document.querySelector('.timeline');
  var runner = document.querySelector('.tl-runner');
  if (!timeline || !runner) return;
  var items = Array.prototype.slice.call(timeline.querySelectorAll('.tl-item'));
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobileQuery = window.matchMedia('(max-width: 768px)');
  var LEAD = 160; // px ahead of the viewport midpoint, so the head reads as leading the scroll
  var positions = [], railTop = 0, railHeight = 0, lastY = -1, ticking = false;

  function measure() {
    var scrollY = window.scrollY || window.pageYOffset;
    railTop = timeline.getBoundingClientRect().top + scrollY;
    railHeight = timeline.offsetHeight;
    positions = items.map(function (item) {
      var dot = item.querySelector('.tl-dot') || item;
      var d = dot.getBoundingClientRect(), r = item.getBoundingClientRect();
      return {
        item: item,
        center: d.top + scrollY + d.height / 2 - railTop,
        start: r.top + scrollY - railTop,
        end: r.bottom + scrollY - railTop
      };
    });
  }
  function update() {
    ticking = false;
    if (mobileQuery.matches || !positions.length) return;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var scrollY = window.scrollY || window.pageYOffset;
    var y = vh * 0.5 + scrollY - railTop + LEAD;
    y = Math.max(positions[0].center, Math.min(railHeight - 30, y));
    if (Math.abs(y - lastY) < 1) return;
    lastY = y;
    runner.style.top = y + 'px';
    positions.forEach(function (p) {
      p.item.classList.toggle('lit', y >= p.center);
      p.item.classList.toggle('comet-near', y > p.start && y < p.end);
    });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function onResize() { measure(); lastY = -1; update(); }

  if (prefersReduced) {
    runner.hidden = true;
    if ('IntersectionObserver' in window) {
      var reducedObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) { entry.target.classList.toggle('lit', entry.isIntersecting); });
      }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
      items.forEach(function (item) { reducedObserver.observe(item); });
    } else {
      items.forEach(function (item) { item.classList.add('lit'); });
    }
    return;
  }
  onResize();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('load', onResize, { once: true });
  if (window.ResizeObserver) new ResizeObserver(onResize).observe(timeline);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);
})();

(function () {
  var carousel = document.querySelector('.dp-carousel');
  if (!carousel) return;
  var track = carousel.querySelector('.dp-track');
  var arrows = carousel.querySelectorAll('.dp-arrow');
  if (!track) return;

  function atStart() { return track.scrollLeft <= 2; }
  function atEnd() { return track.scrollLeft >= track.scrollWidth - track.clientWidth - 2; }
  function refresh() {
    if (arrows[0]) arrows[0].disabled = atStart();
    if (arrows[1]) arrows[1].disabled = atEnd();
  }
  function move(direction) {
    if (direction > 0 && atEnd()) track.scrollTo({ left: 0, behavior: 'smooth' });
    else if (direction < 0 && atStart()) track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' });
    else track.scrollBy({ left: direction * track.clientWidth, behavior: 'smooth' });
  }

  arrows.forEach(function (arrow) {
    arrow.addEventListener('click', function () {
      move(parseInt(arrow.getAttribute('data-dir'), 10));
    });
  });
  var ticking = false;
  track.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(function () {
        refresh();
        ticking = false;
      });
    }
  }, { passive: true });
  refresh();

})();

(function () {
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealElements = document.querySelectorAll('.reveal');
  if (prefersReduced || !('IntersectionObserver' in window)) {
    revealElements.forEach(function (element) { element.classList.add('is-visible'); });
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px 15% 0px' });
  revealElements.forEach(function (element) { observer.observe(element); });
})();
