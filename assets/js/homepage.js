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
  var parts = [], trail = [], running = false, inView = false, resizeQueued = false, lastLitY = -999, userPaused = false;
  var travel = { x: 0, y: 1 }, travelSign = 1, lastFrameTime = 0, emissionCarry = 0, dirtyBounds = null;
  var itemPositions = [];
  var SAFE = 60, pathAmplitude = 160, pathOriginY = 0, pathStartPhase = -Math.PI / 2;
  var motionElapsed = 0, headInitialized = false;

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
      trail.length = 0;
      dirtyBounds = null;
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
        dot: dot,
        center: item.offsetTop + (dot ? dot.offsetTop + dot.offsetHeight / 2 : 0),
        start: item.offsetTop - 10,
        end: item.offsetTop + item.offsetHeight + 10
      };
    });
    if (itemPositions.length) {
      var firstPosition = itemPositions[0];
      var firstDotRect = firstPosition.dot ? firstPosition.dot.getBoundingClientRect() : null;
      var firstDotX = firstDotRect ? firstDotRect.left + firstDotRect.width / 2 : SAFE;
      pathOriginY = firstPosition.center;
      pathAmplitude = Math.max(160, Math.min(cssW / 2 - SAFE, timelineW / 2 + 50));
      var startRatio = Math.max(-1, Math.min(1, (firstDotX - 28 - cssW / 2) / pathAmplitude));
      pathStartPhase = Math.asin(startRatio);
      if (!headInitialized) {
        head.y = pathOriginY;
        targetY = pathOriginY;
        prevY = pathOriginY;
        head.x = pathX(head.y, 0);
        prevX = head.x;
        headInitialized = true;
      }
    }
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    trail.length = 0;
    dirtyBounds = null;
  }

  function queueResize() {
    if (!resizeQueued) {
      resizeQueued = true;
      requestAnimationFrame(resize);
    }
  }

  function pathX(y, time) {
    return cssW / 2 + Math.sin((y - pathOriginY) * 0.005 + time * 0.05 + pathStartPhase) * pathAmplitude;
  }

  function computeTarget() {
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    var firstMarkerY = itemPositions.length ? itemPositions[0].center : 0;
    targetY = Math.max(firstMarkerY, Math.min(cssH, viewportHeight * 0.5 + window.scrollY - timelineTop));
  }

  function lightNodes(y) {
    if (Math.abs(y - lastLitY) < 4) return;
    lastLitY = y;
    itemPositions.forEach(function (position) {
      position.item.classList.toggle('lit', y >= position.center);
      position.item.classList.toggle('comet-near', y > position.start && y < position.end);
    });
  }

  function makeGlowSprite(stops) {
    var sprite = document.createElement('canvas');
    sprite.width = 96;
    sprite.height = 96;
    var spriteContext = sprite.getContext('2d');
    var gradient = spriteContext.createRadialGradient(48, 48, 0, 48, 48, 46);
    stops.forEach(function (stop) { gradient.addColorStop(stop[0], stop[1]); });
    spriteContext.fillStyle = gradient;
    spriteContext.fillRect(0, 0, 96, 96);
    return sprite;
  }

  var mistSprite = makeGlowSprite([
    [0, 'rgba(151, 211, 226, 0.28)'],
    [0.36, 'rgba(82, 169, 204, 0.11)'],
    [1, 'rgba(47, 127, 179, 0)']
  ]);

  function spawnOne(x, y, speed) {
    if (parts.length >= 180) return;
    var perpendicularX = -travel.y;
    var perpendicularY = travel.x;
    var back = 10 + Math.random() * 54;
    var spread = 5 + back * 0.24;
    var side = (Math.random() - 0.5) * spread;
    var drift = 0.24 + Math.random() * 0.5;
    var turbulence = (Math.random() - 0.5) * 0.18;
    parts.push({
      x: x - travel.x * back + perpendicularX * side,
      y: y - travel.y * back + perpendicularY * side,
      vx: -travel.x * drift + perpendicularX * turbulence,
      vy: -travel.y * drift + perpendicularY * turbulence,
      drag: 0.986,
      life: 1,
      decay: 0.007 + Math.random() * 0.006,
      size: 2.4 + Math.random() * 3.8,
      warm: Math.random() < 0.2,
      speedBoost: Math.min(0.35, speed * 0.012)
    });
  }

  function recordTrail() {
    var lastPoint = trail[trail.length - 1];
    if (!lastPoint || Math.hypot(head.x - lastPoint.x, head.y - lastPoint.y) > 1.2) {
      trail.push({ x: head.x, y: head.y });
      if (trail.length > 76) trail.shift();
    } else {
      lastPoint.x = head.x;
      lastPoint.y = head.y;
    }
  }

  function drawDustTail(time) {
    if (trail.length < 3) return;
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    var layers = [
      { farWidth: 48, nearWidth: 17, alpha: 0.026, color: '73, 138, 173' },
      { farWidth: 28, nearWidth: 11, alpha: 0.047, color: '75, 165, 198' },
      { farWidth: 12, nearWidth: 6, alpha: 0.075, color: '136, 201, 218' }
    ];
    layers.forEach(function (tailLayer) {
      for (var pointIndex = 1; pointIndex < trail.length; pointIndex++) {
        var proximity = pointIndex / (trail.length - 1);
        var distance = 1 - proximity;
        var breathe = 0.88 + 0.12 * Math.sin(pointIndex * 0.7 + time * 0.5);
        var previous = trail[pointIndex - 1];
        var current = trail[pointIndex];
        var alpha = tailLayer.alpha * Math.pow(proximity, 1.8) * breathe;
        ctx.strokeStyle = 'rgba(' + tailLayer.color + ', ' + alpha + ')';
        ctx.lineWidth = tailLayer.nearWidth + (tailLayer.farWidth - tailLayer.nearWidth) * distance;
        ctx.beginPath();
        ctx.moveTo(previous.x, previous.y);
        ctx.lineTo(current.x, current.y);
        ctx.stroke();
      }
    });
    ctx.restore();
  }

  function drawIonTail(speed, time) {
    var angle = Math.atan2(travel.y, travel.x);
    var length = 138 + Math.min(28, speed * 1.4);
    var breathe = 0.96 + 0.04 * Math.sin(time * 0.8);
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.translate(head.x, head.y);
    ctx.rotate(angle);

    var streamGradient = ctx.createLinearGradient(-length, 0, 8, 0);
    streamGradient.addColorStop(0, 'rgba(70, 143, 181, 0)');
    streamGradient.addColorStop(0.58, 'rgba(71, 158, 194, ' + (0.035 * breathe) + ')');
    streamGradient.addColorStop(1, 'rgba(128, 199, 217, ' + (0.16 * breathe) + ')');
    ctx.fillStyle = streamGradient;
    ctx.beginPath();
    ctx.moveTo(8, -8);
    ctx.quadraticCurveTo(-length * 0.42, -5, -length, -1);
    ctx.lineTo(-length, 1);
    ctx.quadraticCurveTo(-length * 0.42, 5, 8, 8);
    ctx.closePath();
    ctx.fill();

    ctx.scale(1.28, 0.88);
    var coma = ctx.createRadialGradient(4, 0, 0, -3, 0, 25);
    coma.addColorStop(0, 'rgba(154, 214, 227, ' + (0.24 * breathe) + ')');
    coma.addColorStop(0.34, 'rgba(97, 184, 211, ' + (0.15 * breathe) + ')');
    coma.addColorStop(0.72, 'rgba(59, 148, 192, ' + (0.055 * breathe) + ')');
    coma.addColorStop(1, 'rgba(47, 127, 179, 0)');
    ctx.fillStyle = coma;
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function updateDirtyBounds() {
    var minX = head.x - 220;
    var maxX = head.x + 220;
    var minY = head.y - 220;
    var maxY = head.y + 220;
    parts.forEach(function (particle) {
      minX = Math.min(minX, particle.x - 80);
      maxX = Math.max(maxX, particle.x + 80);
      minY = Math.min(minY, particle.y - 80);
      maxY = Math.max(maxY, particle.y + 80);
    });
    trail.forEach(function (point) {
      minX = Math.min(minX, point.x - 80);
      maxX = Math.max(maxX, point.x + 80);
      minY = Math.min(minY, point.y - 80);
      maxY = Math.max(maxY, point.y + 80);
    });
    dirtyBounds = {
      x: Math.max(0, Math.floor(minX)),
      y: Math.max(0, Math.floor(minY)),
      width: Math.min(cssW, Math.ceil(maxX)) - Math.max(0, Math.floor(minX)),
      height: Math.min(cssH, Math.ceil(maxY)) - Math.max(0, Math.floor(minY))
    };
  }

  function frame(now) {
    if (canvas.offsetParent === null) {
      running = false;
      return;
    }
    var deltaSeconds = lastFrameTime ? Math.min(0.05, Math.max(0.001, (now - lastFrameTime) / 1000)) : 1 / 60;
    var frameScale = deltaSeconds * 60;
    lastFrameTime = now;
    motionElapsed += deltaSeconds;
    var time = motionElapsed;
    computeTarget();
    var follow = 1 - Math.exp(-2 * deltaSeconds);
    var yStep = (targetY - head.y) * follow;
    var maxStep = 10 * frameScale;
    head.y += Math.max(-maxStep, Math.min(maxStep, yStep));
    var deltaY = head.y - prevY;
    var speed = Math.abs(deltaY) / frameScale;
    if (Math.abs(deltaY) > 0.08) {
      var nextTravelSign = deltaY > 0 ? 1 : -1;
      if (nextTravelSign !== travelSign) trail.length = 0;
      travelSign = nextTravelSign;
    }
    prevY = head.y;
    head.x = pathX(head.y, time);
    var horizontalVelocity = head.x - prevX;
    prevX = head.x;
    var tangentProbe = 12 * travelSign;
    var tangentX = pathX(head.y + tangentProbe, time) - head.x;
    var tangentLength = Math.hypot(tangentX, tangentProbe) || 1;
    var targetTravelX = tangentX / tangentLength;
    var targetTravelY = tangentProbe / tangentLength;
    var directionBlend = 1 - Math.exp(-5 * deltaSeconds);
    travel.x += (targetTravelX - travel.x) * directionBlend;
    travel.y += (targetTravelY - travel.y) * directionBlend;
    var travelLength = Math.hypot(travel.x, travel.y) || 1;
    travel.x /= travelLength;
    travel.y /= travelLength;
    lightNodes(head.y);
    recordTrail();

    var emissionRate = 72 + Math.min(38, speed * 2.5 + Math.abs(horizontalVelocity) * 1.5);
    emissionCarry += emissionRate * deltaSeconds;
    var emit = Math.min(3, Math.floor(emissionCarry));
    emissionCarry -= emit;
    for (var emitted = 0; emitted < emit; emitted++) {
      spawnOne(head.x, head.y, speed);
    }
    if (dirtyBounds) ctx.clearRect(dirtyBounds.x, dirtyBounds.y, dirtyBounds.width, dirtyBounds.height);
    drawDustTail(time);

    for (var i = parts.length - 1; i >= 0; i--) {
      var particle = parts[i];
      particle.x += particle.vx * frameScale;
      particle.y += particle.vy * frameScale;
      particle.vx *= Math.pow(particle.drag, frameScale);
      particle.vy *= Math.pow(particle.drag, frameScale);
      particle.life -= particle.decay * frameScale;
      if (particle.life <= 0) {
        parts[i] = parts[parts.length - 1];
        parts.pop();
        continue;
      }
      var radius = Math.max(0.8, particle.size * (0.48 + particle.life));
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = Math.pow(particle.life, 1.7) * 0.18;
      ctx.translate(particle.x, particle.y);
      ctx.rotate(Math.atan2(particle.vy, particle.vx));
      ctx.scale(1 + particle.speedBoost, 0.82);
      if (particle.warm) ctx.globalAlpha *= 0.55;
      ctx.drawImage(mistSprite, -radius, -radius, radius * 2, radius * 2);
      ctx.restore();
    }

    drawIonTail(speed, time);

    updateDirtyBounds();
    if (running) requestAnimationFrame(frame);
  }

  function start() {
    if (!running && !userPaused && !prefersReduced && !mobileQuery.matches) {
      running = true;
      lastFrameTime = 0;
      requestAnimationFrame(frame);
    }
  }
  function stop() {
    running = false;
    lastFrameTime = 0;
  }

  window.__comet = function () {
    return { x: Math.round(head.x), y: Math.round(head.y), target: Math.round(targetY), startY: Math.round(pathOriginY), parts: parts.length, trail: trail.length, w: cssW, h: cssH, mobile: mobileQuery.matches };
  };
  resize();
  window.addEventListener('resize', queueResize, { passive: true });
  window.addEventListener('load', queueResize, { once: true });
  if (window.ResizeObserver) new ResizeObserver(queueResize).observe(timeline);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(queueResize);
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
