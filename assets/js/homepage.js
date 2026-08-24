// Homepage-only scroll effects, timeline comet, carousel, and reveal behavior.

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
  var timeline = document.querySelector('.timeline');
  var canvas = document.querySelector('.tl-comet');
  if (!timeline || !canvas) return;
  var ctx = canvas.getContext('2d');
  var items = timeline.querySelectorAll('.tl-item');
  var motionToggle = document.querySelector('.motion-toggle');
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobileQuery = window.matchMedia('(max-width: 768px)');

  var dpr = 1, cssW = 0, cssH = 0, timelineW = 0, timelineTop = 0;
  var head = { x: 0, y: 0 }, targetY = 0, prevY = 0, prevX = 0;
  var parts = [], running = false, inView = false, resizeQueued = false, lastLitY = -999, userPaused = false;
  var itemPositions = [];
  var t0 = performance.now();

  function resize() {
    resizeQueued = false;
    var vw = document.documentElement.clientWidth;
    if (!vw) return;
    if (mobileQuery.matches) {
      cssW = vw;
      cssH = 0;
      timelineW = 0;
      itemPositions = [];
      parts.length = 0;
      fragments.length = 0;
      canvas.width = 1;
      canvas.height = 1;
      return;
    }
    dpr = Math.max(1, Math.min(1.5, window.devicePixelRatio || 1));
    cssW = vw;
    cssH = timeline.offsetHeight;
    timelineW = timeline.offsetWidth;
    timelineTop = timeline.getBoundingClientRect().top + window.scrollY;
    itemPositions = Array.prototype.map.call(items, function (item) {
      var dot = item.querySelector('.tl-dot');
      return {
        item: item,
        center: item.offsetTop + (dot ? dot.offsetTop + dot.offsetHeight / 2 : 0),
        start: item.offsetTop - 10,
        end: item.offsetTop + item.offsetHeight + 10
      };
    });
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function queueResize() {
    if (!resizeQueued) {
      resizeQueued = true;
      requestAnimationFrame(resize);
    }
  }

  var SAFE = 60;
  function pathX(y, time) {
    var amplitude = Math.max(160, Math.min(cssW / 2 - SAFE, timelineW / 2 + 50));
    return cssW / 2 + Math.sin(y * 0.005 + time * 0.3) * amplitude;
  }

  function computeTarget() {
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    targetY = Math.max(0, Math.min(cssH, viewportHeight * 0.5 + window.scrollY - timelineTop));
  }

  function lightNodes(y) {
    if (Math.abs(y - lastLitY) < 4) return;
    lastLitY = y;
    itemPositions.forEach(function (position) {
      position.item.classList.toggle('lit', y >= position.center);
      position.item.classList.toggle('comet-near', y > position.start && y < position.end);
    });
  }

  function spawnOne(x, y, speed, horizontalVelocity) {
    if (parts.length > 500) return;
    var kind = Math.random();
    if (kind < 0.22) {
      parts.push({
        x: x + (Math.random() - 0.5) * 14,
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 0.5 - horizontalVelocity * 0.2,
        vy: -(0.25 + Math.random() * 0.5),
        drag: 0.985,
        life: 1,
        decay: 0.003 + Math.random() * 0.004,
        size: 4.5 + Math.random() * 5,
        hue: 'v'
      });
    } else if (kind < 0.75) {
      parts.push({
        x: x + (Math.random() - 0.5) * 5,
        y: y + (Math.random() - 0.5) * 5,
        vx: (Math.random() - 0.5) * 1 - horizontalVelocity * 0.35,
        vy: -(0.6 + Math.random() * 1.6) - speed * 0.08,
        drag: 0.965,
        life: 1,
        decay: 0.005 + Math.random() * 0.009,
        size: 1.5 + Math.random() * 2.6,
        hue: 'b'
      });
    } else {
      parts.push({
        x: x + (Math.random() - 0.5) * 4,
        y: y + (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * 1.6 - horizontalVelocity * 0.3,
        vy: -(0.9 + Math.random() * 1.8) - speed * 0.1,
        drag: 0.94,
        life: 1,
        decay: 0.018 + Math.random() * 0.02,
        size: 1.2 + Math.random() * 2,
        hue: 'w'
      });
    }
  }

  var fragments = [];
  function spawnFragment(x, y, horizontalVelocity) {
    if (fragments.length > 8) return;
    var side = Math.random() < 0.5 ? -1 : 1;
    fragments.push({
      x: x,
      y: y,
      vx: side * (0.7 + Math.random() * 1.6) - horizontalVelocity * 0.2,
      vy: -(0.9 + Math.random() * 1.6),
      life: 1,
      decay: 0.007 + Math.random() * 0.010,
      size: 2 + Math.random() * 2.6
    });
  }

  function layer(radius, centerColor, edgeColor) {
    var gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    gradient.addColorStop(0, centerColor);
    gradient.addColorStop(1, edgeColor);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function frame(now) {
    if (canvas.offsetParent === null) {
      running = false;
      return;
    }
    var time = (now - t0) / 1000;
    computeTarget();
    head.y += (targetY - head.y) * 0.12;
    var deltaY = head.y - prevY;
    var speed = Math.abs(deltaY);
    prevY = head.y;
    var directionY = deltaY >= 0 ? 1 : -1;
    head.x = pathX(head.y, time);
    var horizontalVelocity = head.x - prevX;
    prevX = head.x;
    lightNodes(head.y);

    var emit = Math.min(9, 4 + Math.floor((speed + Math.abs(horizontalVelocity))));
    for (var emitted = 0; emitted < emit; emitted++) {
      spawnOne(head.x, head.y, speed, horizontalVelocity);
    }
    if (Math.random() < 0.06 + Math.min(0.2, speed * 0.04)) {
      spawnFragment(head.x, head.y, horizontalVelocity);
    }

    ctx.clearRect(0, 0, cssW, cssH);

    for (var i = parts.length - 1; i >= 0; i--) {
      var particle = parts[i];
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= particle.drag;
      particle.vy *= particle.drag;
      particle.life -= particle.decay;
      if (particle.life <= 0) {
        parts.splice(i, 1);
        continue;
      }
      var velocityLength = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy) || 0.001;
      var radius = Math.max(0.7, particle.size * (0.5 + particle.life)) * 1.7;
      var stretch = 1 + Math.min(3, velocityLength * 1.7);
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(Math.atan2(particle.vy, particle.vx));
      ctx.scale(stretch, 1);
      var particleGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
      if (particle.hue === 'v') {
        particleGradient.addColorStop(0, 'rgba(120, 165, 250, ' + (particle.life * 0.16) + ')');
        particleGradient.addColorStop(0.6, 'rgba(105, 145, 240, ' + (particle.life * 0.09) + ')');
        particleGradient.addColorStop(1, 'rgba(100, 130, 230, 0)');
      } else if (particle.hue === 'w') {
        particleGradient.addColorStop(0, 'rgba(240, 250, 255, ' + (particle.life * 0.85) + ')');
        particleGradient.addColorStop(0.5, 'rgba(150, 220, 255, ' + (particle.life * 0.42) + ')');
        particleGradient.addColorStop(1, 'rgba(80, 180, 255, 0)');
      } else {
        particleGradient.addColorStop(0, 'rgba(165, 225, 255, ' + (particle.life * 0.55) + ')');
        particleGradient.addColorStop(0.55, 'rgba(95, 190, 255, ' + (particle.life * 0.28) + ')');
        particleGradient.addColorStop(1, 'rgba(70, 160, 250, 0)');
      }
      ctx.fillStyle = particleGradient;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    for (var fragmentIndex = fragments.length - 1; fragmentIndex >= 0; fragmentIndex--) {
      var fragment = fragments[fragmentIndex];
      fragment.x += fragment.vx;
      fragment.y += fragment.vy;
      fragment.vx *= 0.99;
      fragment.vy *= 0.988;
      fragment.life -= fragment.decay;
      if (fragment.life <= 0) {
        fragments.splice(fragmentIndex, 1);
        continue;
      }
      if (parts.length < 490) {
        parts.push({
          x: fragment.x,
          y: fragment.y,
          vx: -fragment.vx * 0.25 + (Math.random() - 0.5) * 0.3,
          vy: -0.35 - Math.random() * 0.3,
          drag: 0.95,
          life: 0.7 * fragment.life,
          decay: 0.02 + Math.random() * 0.02,
          size: 0.9 + Math.random() * 1.5,
          hue: Math.random() < 0.5 ? 'b' : 'v'
        });
      }
      var fragmentGradient = ctx.createRadialGradient(fragment.x, fragment.y, 0, fragment.x, fragment.y, fragment.size * 3.2);
      fragmentGradient.addColorStop(0, 'rgba(225, 242, 255, ' + (fragment.life * 0.9) + ')');
      fragmentGradient.addColorStop(0.45, 'rgba(130, 205, 255, ' + (fragment.life * 0.48) + ')');
      fragmentGradient.addColorStop(1, 'rgba(75, 165, 250, 0)');
      ctx.fillStyle = fragmentGradient;
      ctx.beginPath();
      ctx.arc(fragment.x, fragment.y, fragment.size * 3.2, 0, Math.PI * 2);
      ctx.fill();
    }

    var stretchFactor = 1 + Math.min(2.2, speed * 0.22 + Math.abs(horizontalVelocity) * 0.15);
    var flarePulse = 0.7 + 0.3 * Math.sin(time * 5.2);
    function backFlare(offsetX, width, height, alpha) {
      ctx.save();
      ctx.translate(head.x + offsetX, head.y - directionY * height * 0.55);
      ctx.scale(width / 40, (height * stretchFactor) / 40);
      var gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 40);
      gradient.addColorStop(0, 'rgba(140, 220, 255, ' + (alpha * flarePulse) + ')');
      gradient.addColorStop(0.55, 'rgba(90, 185, 255, ' + (alpha * 0.55 * flarePulse) + ')');
      gradient.addColorStop(1, 'rgba(70, 150, 245, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    backFlare(0, 46, 120, 0.15);
    backFlare(-26, 26, 80, 0.11);
    backFlare(26, 26, 80, 0.11);

    ctx.save();
    ctx.translate(head.x, head.y);
    ctx.scale(1, 1.7);
    layer(95, 'rgba(85, 165, 245, 0.06)', 'rgba(85, 165, 245, 0)');
    layer(80, 'rgba(70, 165, 228, 0.12)', 'rgba(70, 165, 228, 0)');
    layer(58, 'rgba(78, 174, 236, 0.46)', 'rgba(78, 174, 236, 0)');
    layer(44, 'rgba(100, 190, 244, 0.66)', 'rgba(95, 185, 240, 0)');
    layer(30, 'rgba(150, 218, 255, 0.85)', 'rgba(120, 205, 250, 0)');
    ctx.restore();

    var leadX = head.x + Math.sin(time * 9) * 2.5;
    var leadY = head.y + directionY * 16 + Math.sin(time * 7) * 2;
    var pulse = 0.9 + 0.1 * Math.sin(time * 4.5);
    var outerGradient = ctx.createRadialGradient(leadX, leadY, 0, leadX, leadY, 40);
    outerGradient.addColorStop(0, 'rgba(125, 195, 252, 0.52)');
    outerGradient.addColorStop(1, 'rgba(115, 165, 245, 0)');
    ctx.fillStyle = outerGradient;
    ctx.beginPath();
    ctx.arc(leadX, leadY, 40, 0, Math.PI * 2);
    ctx.fill();
    var middleGradient = ctx.createRadialGradient(leadX, leadY, 0, leadX, leadY, 26);
    middleGradient.addColorStop(0, 'rgba(185, 232, 255, ' + (0.8 * pulse) + ')');
    middleGradient.addColorStop(1, 'rgba(150, 210, 252, 0)');
    ctx.fillStyle = middleGradient;
    ctx.beginPath();
    ctx.arc(leadX, leadY, 26, 0, Math.PI * 2);
    ctx.fill();
    var coreGradient = ctx.createRadialGradient(leadX, leadY, 0, leadX, leadY, 13);
    coreGradient.addColorStop(0, 'rgba(250, 253, 255, ' + pulse + ')');
    coreGradient.addColorStop(1, 'rgba(200, 240, 255, 0)');
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(leadX, leadY, 13, 0, Math.PI * 2);
    ctx.fill();

    if (running) requestAnimationFrame(frame);
  }

  function start() {
    if (!running && !userPaused && !prefersReduced && !mobileQuery.matches) {
      running = true;
      requestAnimationFrame(frame);
    }
  }
  function stop() { running = false; }

  resize();
  window.addEventListener('resize', queueResize, { passive: true });
  window.addEventListener('load', queueResize, { once: true });
  if (window.ResizeObserver) new ResizeObserver(queueResize).observe(timeline);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(queueResize);
  window.__comet = function () {
    return { y: Math.round(head.y), target: Math.round(targetY), parts: parts.length, w: cssW, h: cssH, mobile: mobileQuery.matches };
  };

  if (prefersReduced) {
    canvas.style.display = 'none';
    if (motionToggle) motionToggle.hidden = true;
    if ('IntersectionObserver' in window) {
      var reducedObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          entry.target.classList.toggle('lit', entry.isIntersecting);
        });
      }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
      items.forEach(function (item) { reducedObserver.observe(item); });
    } else {
      items.forEach(function (item) { item.classList.add('lit'); });
    }
    return;
  }
  if (motionToggle) {
    motionToggle.addEventListener('click', function () {
      userPaused = !userPaused;
      motionToggle.setAttribute('aria-pressed', String(userPaused));
      motionToggle.textContent = userPaused ? 'Play comet' : 'Pause comet';
      if (userPaused) stop();
      else if (inView && !document.hidden) start();
    });
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        inView = entry.isIntersecting;
        if (inView && !document.hidden) start(); else stop();
      });
    }, { threshold: 0 }).observe(timeline);
  } else {
    inView = true;
    start();
  }
  document.addEventListener('visibilitychange', function () {
    if (inView && !document.hidden) start(); else stop();
  });
  function syncViewportMode() {
    stop();
    resize();
    if (!mobileQuery.matches && inView && !document.hidden) start();
  }
  if (mobileQuery.addEventListener) mobileQuery.addEventListener('change', syncViewportMode);
  else mobileQuery.addListener(syncViewportMode);
})();

(function () {
  var mediaQuery = window.matchMedia('(max-width: 768px)');
  var items = document.querySelectorAll('.tl-item');
  if (!items.length) return;
  var observer = null;

  function updateFocus(entries) {
    entries.forEach(function (entry) {
      entry.target.classList.toggle('is-focus', entry.isIntersecting);
    });
  }
  function enable() {
    if (observer) return;
    observer = new IntersectionObserver(updateFocus, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });
    items.forEach(function (item) { observer.observe(item); });
  }
  function disable() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    items.forEach(function (item) { item.classList.remove('is-focus'); });
  }
  function sync() { mediaQuery.matches ? enable() : disable(); }

  sync();
  if (mediaQuery.addEventListener) mediaQuery.addEventListener('change', sync);
  else mediaQuery.addListener(sync);
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
