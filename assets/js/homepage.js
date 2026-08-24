// Homepage-only section focus, hero-to-Experience comet, carousel, and reveals.

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
  var story = document.querySelector('.comet-story');
  var timeline = document.querySelector('.timeline');
  var canvas = document.querySelector('.tl-comet');
  if (!story || !timeline || !canvas) return;

  var ctx = canvas.getContext('2d');
  var items = timeline.querySelectorAll('.tl-item');
  var launchElement = story.querySelector('.comet-launch');
  var experience = story.querySelector('#experience');
  var motionToggle = document.querySelector('.motion-toggle');
  var reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mobileQuery = window.matchMedia('(max-width: 768px)');
  var prefersReduced = reducedQuery.matches;

  var dpr = 1, cssW = 0, cssH = 0, storyTop = 0, launchY = 0;
  var head = { x: 0, y: 0 }, targetY = 0, prevY = 0, prevX = 0;
  var parts = [], particlePool = [], fragments = [], fragmentPool = [];
  var running = false, inView = false, resizeQueued = false, initialized = false;
  var userPaused = false, lastLitY = -999;
  var itemPositions = [], pathPoints = [];
  var t0 = performance.now();

  try { userPaused = sessionStorage.getItem('cometPaused') === 'true'; } catch (error) { userPaused = false; }

  function createSprite(stops) {
    var sprite = document.createElement('canvas');
    var size = 96;
    sprite.width = size;
    sprite.height = size;
    var spriteContext = sprite.getContext('2d');
    var gradient = spriteContext.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    stops.forEach(function (stop) { gradient.addColorStop(stop[0], stop[1]); });
    spriteContext.fillStyle = gradient;
    spriteContext.fillRect(0, 0, size, size);
    return sprite;
  }

  var sprites = {
    v: createSprite([[0, 'rgba(120,165,250,0.16)'], [0.6, 'rgba(105,145,240,0.09)'], [1, 'rgba(100,130,230,0)']]),
    b: createSprite([[0, 'rgba(165,225,255,0.55)'], [0.55, 'rgba(95,190,255,0.28)'], [1, 'rgba(70,160,250,0)']]),
    w: createSprite([[0, 'rgba(240,250,255,0.85)'], [0.5, 'rgba(150,220,255,0.42)'], [1, 'rgba(80,180,255,0)']]),
    f: createSprite([[0, 'rgba(225,242,255,0.90)'], [0.45, 'rgba(130,205,255,0.48)'], [1, 'rgba(75,165,250,0)']])
  };

  function clamp(value, minimum, maximum) { return Math.max(minimum, Math.min(maximum, value)); }

  function addPathPoint(y, x) {
    pathPoints.push({ y: clamp(y, 0, cssH), x: clamp(x, 54, cssW - 54) });
  }

  function resize() {
    resizeQueued = false;
    var viewportWidth = document.documentElement.clientWidth;
    if (!viewportWidth) return;

    if (mobileQuery.matches) {
      cssW = viewportWidth;
      cssH = 0;
      canvas.width = 1;
      canvas.height = 1;
      clearParticles();
      itemPositions = [];
      pathPoints = [];
      initialized = false;
      return;
    }

    dpr = Math.max(1, Math.min(1.5, window.devicePixelRatio || 1));
    cssW = viewportWidth;
    cssH = story.offsetHeight;
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var storyRect = story.getBoundingClientRect();
    var canvasRect = canvas.getBoundingClientRect();
    storyTop = storyRect.top + window.scrollY;
    itemPositions = Array.prototype.map.call(items, function (item, index) {
      var itemRect = item.getBoundingClientRect();
      var dot = item.querySelector('.tl-dot');
      var dotRect = dot ? dot.getBoundingClientRect() : itemRect;
      return {
        item: item,
        x: dotRect.left + dotRect.width / 2 - canvasRect.left,
        center: dotRect.top + dotRect.height / 2 - storyRect.top,
        start: itemRect.top - storyRect.top - 10,
        end: itemRect.bottom - storyRect.top + 10,
        side: index % 2 === 0 ? 'left' : 'right'
      };
    });

    var launchRect = launchElement ? launchElement.getBoundingClientRect() : storyRect;
    launchY = launchRect.top + launchRect.height / 2 - storyRect.top;
    var launchX = launchRect.right - canvasRect.left + clamp(cssW * 0.035, 34, 58);
    launchX = clamp(launchX, cssW * 0.58, cssW - 70);

    pathPoints = [];
    addPathPoint(0, launchX + 42);
    addPathPoint(Math.max(0, launchY - 120), launchX + 22);
    addPathPoint(launchY, launchX);

    if (itemPositions.length) {
      var first = itemPositions[0];
      var experienceRect = experience ? experience.getBoundingClientRect() : storyRect;
      addPathPoint(experienceRect.top - storyRect.top + 12, first.x);
      itemPositions.forEach(function (position) {
        addPathPoint(position.start, position.x);
        addPathPoint(position.end, position.x);
      });
      addPathPoint(cssH, itemPositions[itemPositions.length - 1].x);
    } else {
      addPathPoint(cssH, cssW / 2);
    }

    pathPoints.sort(function (a, b) { return a.y - b.y; });
    if (!initialized) {
      head.y = Math.max(0, launchY - 90);
      head.x = pathX(head.y, 0);
      prevY = head.y;
      prevX = head.x;
      initialized = true;
    }

    if (prefersReduced && !mobileQuery.matches) drawStaticComet();
  }

  function queueResize() {
    if (!resizeQueued) {
      resizeQueued = true;
      requestAnimationFrame(resize);
    }
  }

  function pathX(y, time) {
    if (!pathPoints.length) return cssW / 2;
    if (y <= pathPoints[0].y) return pathPoints[0].x;
    var last = pathPoints[pathPoints.length - 1];
    if (y >= last.y) return last.x;

    for (var index = 0; index < pathPoints.length - 1; index++) {
      var current = pathPoints[index];
      var next = pathPoints[index + 1];
      if (y >= current.y && y <= next.y) {
        var distance = Math.max(1, next.y - current.y);
        var progress = clamp((y - current.y) / distance, 0, 1);
        var eased = progress * progress * (3 - 2 * progress);
        var base = current.x + (next.x - current.x) * eased;
        var movement = Math.sin(y * 0.009 + time * 0.32) * 14;
        return clamp(base + movement, 54, cssW - 54);
      }
    }
    return last.x;
  }

  function computeTarget() {
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    targetY = clamp(viewportHeight * 0.5 + window.scrollY - storyTop, 0, cssH);
  }

  function lightNodes(y) {
    if (Math.abs(y - lastLitY) < 4) return;
    lastLitY = y;
    itemPositions.forEach(function (position) {
      position.item.classList.toggle('lit', y >= position.center);
      position.item.classList.toggle('comet-near', y > position.start && y < position.end);
    });
  }

  function takeParticle() { return particlePool.pop() || {}; }

  function addParticle(properties) {
    var particle = takeParticle();
    Object.keys(properties).forEach(function (key) { particle[key] = properties[key]; });
    parts.push(particle);
    return particle;
  }

  function spawnOne(x, y, speed, horizontalVelocity) {
    if (parts.length > 500) return null;
    var kind = Math.random();
    if (kind < 0.22) {
      return addParticle({
        x: x + (Math.random() - 0.5) * 14, y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 0.5 - horizontalVelocity * 0.2,
        vy: -(0.25 + Math.random() * 0.5), drag: 0.985, life: 1,
        decay: 0.003 + Math.random() * 0.004, size: 4.5 + Math.random() * 5, hue: 'v'
      });
    }
    if (kind < 0.75) {
      return addParticle({
        x: x + (Math.random() - 0.5) * 5, y: y + (Math.random() - 0.5) * 5,
        vx: (Math.random() - 0.5) * 1 - horizontalVelocity * 0.35,
        vy: -(0.6 + Math.random() * 1.6) - speed * 0.08, drag: 0.965, life: 1,
        decay: 0.005 + Math.random() * 0.009, size: 1.5 + Math.random() * 2.6, hue: 'b'
      });
    }
    return addParticle({
      x: x + (Math.random() - 0.5) * 4, y: y + (Math.random() - 0.5) * 4,
      vx: (Math.random() - 0.5) * 1.6 - horizontalVelocity * 0.3,
      vy: -(0.9 + Math.random() * 1.8) - speed * 0.1, drag: 0.94, life: 1,
      decay: 0.018 + Math.random() * 0.02, size: 1.2 + Math.random() * 2, hue: 'w'
    });
  }

  function recycleParticle(index) {
    var particle = parts[index];
    var last = parts.pop();
    if (index < parts.length) parts[index] = last;
    particlePool.push(particle);
  }

  function spawnFragment(x, y, horizontalVelocity) {
    if (fragments.length > 8) return;
    var fragment = fragmentPool.pop() || {};
    var side = Math.random() < 0.5 ? -1 : 1;
    fragment.x = x;
    fragment.y = y;
    fragment.vx = side * (0.7 + Math.random() * 1.6) - horizontalVelocity * 0.2;
    fragment.vy = -(0.9 + Math.random() * 1.6);
    fragment.life = 1;
    fragment.decay = 0.007 + Math.random() * 0.010;
    fragment.size = 2 + Math.random() * 2.6;
    fragments.push(fragment);
  }

  function recycleFragment(index) {
    var fragment = fragments[index];
    var last = fragments.pop();
    if (index < fragments.length) fragments[index] = last;
    fragmentPool.push(fragment);
  }

  function updateParticles() {
    for (var index = parts.length - 1; index >= 0; index--) {
      var particle = parts[index];
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= particle.drag;
      particle.vy *= particle.drag;
      particle.life -= particle.decay;
      if (particle.life <= 0) recycleParticle(index);
    }
  }

  function updateFragments() {
    for (var index = fragments.length - 1; index >= 0; index--) {
      var fragment = fragments[index];
      fragment.x += fragment.vx;
      fragment.y += fragment.vy;
      fragment.vx *= 0.99;
      fragment.vy *= 0.988;
      fragment.life -= fragment.decay;
      if (fragment.life <= 0) {
        recycleFragment(index);
        continue;
      }
      if (parts.length < 490) {
        addParticle({
          x: fragment.x, y: fragment.y,
          vx: -fragment.vx * 0.25 + (Math.random() - 0.5) * 0.3,
          vy: -0.35 - Math.random() * 0.3, drag: 0.95,
          life: 0.7 * fragment.life, decay: 0.02 + Math.random() * 0.02,
          size: 0.9 + Math.random() * 1.5, hue: Math.random() < 0.5 ? 'b' : 'v'
        });
      }
    }
  }

  function drawParticles() {
    parts.forEach(function (particle) {
      var velocity = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy) || 0.001;
      var radius = Math.max(0.7, particle.size * (0.5 + particle.life)) * 1.7;
      var stretch = 1 + Math.min(3, velocity * 1.7);
      var width = radius * 2 * stretch;
      var height = radius * 2;
      ctx.save();
      ctx.globalAlpha = clamp(particle.life, 0, 1);
      ctx.translate(particle.x, particle.y);
      ctx.rotate(Math.atan2(particle.vy, particle.vx));
      ctx.drawImage(sprites[particle.hue], -width / 2, -height / 2, width, height);
      ctx.restore();
    });
  }

  function drawFragments() {
    fragments.forEach(function (fragment) {
      var diameter = fragment.size * 6.4;
      ctx.save();
      ctx.globalAlpha = clamp(fragment.life, 0, 1);
      ctx.drawImage(sprites.f, fragment.x - diameter / 2, fragment.y - diameter / 2, diameter, diameter);
      ctx.restore();
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

  function drawHead(time, speed, directionY) {
    var stretchFactor = 1 + Math.min(2.2, speed * 0.22 + Math.abs(head.x - prevX) * 0.15);
    var flarePulse = 0.7 + 0.3 * Math.sin(time * 5.2);

    function backFlare(offsetX, width, height, alpha) {
      ctx.save();
      ctx.translate(head.x + offsetX, head.y - directionY * height * 0.55);
      ctx.scale(width / 40, (height * stretchFactor) / 40);
      var gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 40);
      gradient.addColorStop(0, 'rgba(140,220,255,' + (alpha * flarePulse) + ')');
      gradient.addColorStop(0.55, 'rgba(90,185,255,' + (alpha * 0.55 * flarePulse) + ')');
      gradient.addColorStop(1, 'rgba(70,150,245,0)');
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
    layer(95, 'rgba(85,165,245,0.06)', 'rgba(85,165,245,0)');
    layer(80, 'rgba(70,165,228,0.12)', 'rgba(70,165,228,0)');
    layer(58, 'rgba(78,174,236,0.46)', 'rgba(78,174,236,0)');
    layer(44, 'rgba(100,190,244,0.66)', 'rgba(95,185,240,0)');
    layer(30, 'rgba(150,218,255,0.85)', 'rgba(120,205,250,0)');
    ctx.restore();

    var leadX = head.x + Math.sin(time * 9) * 2.5;
    var leadY = head.y + directionY * 16 + Math.sin(time * 7) * 2;
    var pulse = 0.9 + 0.1 * Math.sin(time * 4.5);
    var outerGradient = ctx.createRadialGradient(leadX, leadY, 0, leadX, leadY, 40);
    outerGradient.addColorStop(0, 'rgba(125,195,252,0.52)');
    outerGradient.addColorStop(1, 'rgba(115,165,245,0)');
    ctx.fillStyle = outerGradient;
    ctx.beginPath();
    ctx.arc(leadX, leadY, 40, 0, Math.PI * 2);
    ctx.fill();
    var middleGradient = ctx.createRadialGradient(leadX, leadY, 0, leadX, leadY, 26);
    middleGradient.addColorStop(0, 'rgba(185,232,255,' + (0.8 * pulse) + ')');
    middleGradient.addColorStop(1, 'rgba(150,210,252,0)');
    ctx.fillStyle = middleGradient;
    ctx.beginPath();
    ctx.arc(leadX, leadY, 26, 0, Math.PI * 2);
    ctx.fill();
    var coreGradient = ctx.createRadialGradient(leadX, leadY, 0, leadX, leadY, 13);
    coreGradient.addColorStop(0, 'rgba(250,253,255,' + pulse + ')');
    coreGradient.addColorStop(1, 'rgba(200,240,255,0)');
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(leadX, leadY, 13, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawScene(time, speed, directionY) {
    ctx.clearRect(0, 0, cssW, cssH);
    drawParticles();
    drawFragments();
    drawHead(time, speed, directionY);
  }

  function clearParticles() {
    while (parts.length) particlePool.push(parts.pop());
    while (fragments.length) fragmentPool.push(fragments.pop());
  }

  function drawStaticComet() {
    if (!cssW || !itemPositions.length || mobileQuery.matches) return;
    clearParticles();
    var endY = itemPositions[0].center;
    head.y = endY;
    head.x = pathX(endY, 0);
    prevX = head.x;
    prevY = head.y;
    for (var index = 0; index < 220; index++) {
      var progress = Math.pow(Math.random(), 0.72);
      var y = launchY + (endY - launchY) * progress;
      var x = pathX(y, 0);
      var particle = spawnOne(x, y, 0, 0);
      if (particle) {
        particle.x = x + (Math.random() - 0.5) * (10 + 18 * (1 - progress));
        particle.y = y + (Math.random() - 0.5) * 10;
        particle.vx = 0;
        particle.vy = 0;
        particle.life = 0.28 + 0.72 * progress;
      }
    }
    lightNodes(endY);
    drawScene(0, 0, 1);
  }

  function frame(now) {
    var time = (now - t0) / 1000;
    computeTarget();
    head.y += (targetY - head.y) * 0.12;
    var deltaY = head.y - prevY;
    var speed = Math.abs(deltaY);
    var directionY = deltaY >= 0 ? 1 : -1;
    prevY = head.y;
    head.x = pathX(head.y, time);
    var horizontalVelocity = head.x - prevX;
    lightNodes(head.y);

    var emit = Math.min(9, 4 + Math.floor(speed + Math.abs(horizontalVelocity)));
    for (var emitted = 0; emitted < emit; emitted++) spawnOne(head.x, head.y, speed, horizontalVelocity);
    if (Math.random() < 0.06 + Math.min(0.2, speed * 0.04)) spawnFragment(head.x, head.y, horizontalVelocity);

    updateParticles();
    updateFragments();
    drawScene(time, speed, directionY);
    prevX = head.x;
    if (running) requestAnimationFrame(frame);
  }

  function syncToggle() {
    if (!motionToggle) return;
    motionToggle.setAttribute('aria-pressed', String(userPaused));
    motionToggle.textContent = userPaused ? 'Play comet' : 'Pause comet';
  }

  function start() {
    if (!running && !userPaused && !prefersReduced && !mobileQuery.matches) {
      running = true;
      requestAnimationFrame(frame);
    }
  }

  function stop() { running = false; }

  resize();
  syncToggle();
  window.addEventListener('resize', queueResize, { passive: true });
  window.addEventListener('load', queueResize, { once: true });
  if (window.ResizeObserver) new ResizeObserver(queueResize).observe(story);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(queueResize);

  window.__comet = function () {
    return {
      y: Math.round(head.y), target: Math.round(targetY), parts: parts.length,
      pathPoints: pathPoints.length, width: cssW, height: cssH,
      mobile: mobileQuery.matches, reduced: prefersReduced, paused: userPaused
    };
  };

  if (prefersReduced) {
    if (motionToggle) motionToggle.hidden = true;
    if ('IntersectionObserver' in window) {
      var reducedObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) { entry.target.classList.toggle('lit', entry.isIntersecting); });
      }, { rootMargin: '-42% 0px -42% 0px', threshold: 0 });
      items.forEach(function (item) { reducedObserver.observe(item); });
    } else {
      items.forEach(function (item) { item.classList.add('lit'); });
    }
    return;
  }

  if (motionToggle) {
    motionToggle.addEventListener('click', function () {
      userPaused = !userPaused;
      try { sessionStorage.setItem('cometPaused', String(userPaused)); } catch (error) { /* storage is optional */ }
      syncToggle();
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
    }, { threshold: 0 }).observe(story);
  } else {
    inView = true;
    start();
  }

  document.addEventListener('visibilitychange', function () {
    if (inView && !document.hidden) start(); else stop();
  });

  function syncViewportMode() {
    queueResize();
    if (mobileQuery.matches) stop();
    else if (inView && !document.hidden) start();
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
    entries.forEach(function (entry) { entry.target.classList.toggle('is-focus', entry.isIntersecting); });
  }
  function enable() {
    if (observer) return;
    observer = new IntersectionObserver(updateFocus, { rootMargin: '-36% 0px -44% 0px', threshold: 0 });
    items.forEach(function (item) { observer.observe(item); });
  }
  function disable() {
    if (observer) { observer.disconnect(); observer = null; }
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
    arrow.addEventListener('click', function () { move(parseInt(arrow.getAttribute('data-dir'), 10)); });
  });
  var ticking = false;
  track.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(function () { refresh(); ticking = false; });
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
