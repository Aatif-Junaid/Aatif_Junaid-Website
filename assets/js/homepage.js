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
    trail.length = 0;
    dirtyBounds = null;
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

  var glowSprites = {
    dust: makeGlowSprite([[0, 'rgba(115, 165, 248, 0.32)'], [0.55, 'rgba(90, 145, 238, 0.13)'], [1, 'rgba(75, 125, 225, 0)']]),
    ion: makeGlowSprite([[0, 'rgba(195, 238, 255, 0.92)'], [0.42, 'rgba(105, 203, 255, 0.52)'], [1, 'rgba(65, 160, 248, 0)']]),
    spark: makeGlowSprite([[0, 'rgba(255, 255, 255, 1)'], [0.34, 'rgba(185, 235, 255, 0.82)'], [1, 'rgba(90, 185, 255, 0)']])
  };

  function spawnOne(x, y, speed) {
    if (parts.length >= 560) return;
    var kindRoll = Math.random();
    var kind = kindRoll < 0.3 ? 'dust' : (kindRoll < 0.82 ? 'ion' : 'spark');
    var perpendicularX = -travel.y;
    var perpendicularY = travel.x;
    var spread = kind === 'dust' ? 20 : (kind === 'ion' ? 8 : 5);
    var side = (Math.random() - 0.5) * spread;
    var back = 4 + Math.random() * (kind === 'dust' ? 18 : 10);
    var drift = kind === 'dust' ? 0.25 + Math.random() * 0.55 : (kind === 'ion' ? 0.9 + Math.random() * 1.7 : 1.8 + Math.random() * 2.8);
    var turbulence = (Math.random() - 0.5) * (kind === 'dust' ? 0.22 : 0.55);
    parts.push({
      x: x - travel.x * back + perpendicularX * side,
      y: y - travel.y * back + perpendicularY * side,
      vx: -travel.x * drift + perpendicularX * turbulence,
      vy: -travel.y * drift + perpendicularY * turbulence,
      drag: kind === 'dust' ? 0.987 : (kind === 'ion' ? 0.972 : 0.95),
      life: 1,
      decay: kind === 'dust' ? 0.006 + Math.random() * 0.005 : (kind === 'ion' ? 0.011 + Math.random() * 0.01 : 0.025 + Math.random() * 0.02),
      size: kind === 'dust' ? 5 + Math.random() * 7 : (kind === 'ion' ? 1.8 + Math.random() * 3.2 : 1.2 + Math.random() * 2.2),
      kind: kind,
      speedBoost: Math.min(1.7, speed * 0.025)
    });
  }

  var fragments = [];
  function spawnFragment(x, y) {
    if (fragments.length >= 10) return;
    var side = Math.random() < 0.5 ? -1 : 1;
    var perpendicularX = -travel.y;
    var perpendicularY = travel.x;
    var outward = side * (0.7 + Math.random() * 1.5);
    var backward = 0.9 + Math.random() * 1.8;
    fragments.push({
      x: x,
      y: y,
      vx: perpendicularX * outward - travel.x * backward,
      vy: perpendicularY * outward - travel.y * backward,
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

  function drawTrail() {
    if (trail.length < 3) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    var layers = [
      { width: 46, alpha: 0.05, color: '105, 155, 245' },
      { width: 18, alpha: 0.15, color: '85, 185, 252' },
      { width: 5, alpha: 0.42, color: '175, 230, 255' }
    ];
    layers.forEach(function (tailLayer) {
      for (var pointIndex = 1; pointIndex < trail.length; pointIndex++) {
        var age = pointIndex / (trail.length - 1);
        var previous = trail[pointIndex - 1];
        var current = trail[pointIndex];
        ctx.strokeStyle = 'rgba(' + tailLayer.color + ', ' + (tailLayer.alpha * age * age) + ')';
        ctx.lineWidth = Math.max(0.5, tailLayer.width * age);
        ctx.beginPath();
        ctx.moveTo(previous.x, previous.y);
        ctx.lineTo(current.x, current.y);
        ctx.stroke();
      }
    });
    ctx.restore();
  }

  function updateDirtyBounds() {
    var minX = head.x - 260;
    var maxX = head.x + 260;
    var minY = head.y - 260;
    var maxY = head.y + 260;
    parts.forEach(function (particle) {
      minX = Math.min(minX, particle.x - 80);
      maxX = Math.max(maxX, particle.x + 80);
      minY = Math.min(minY, particle.y - 80);
      maxY = Math.max(maxY, particle.y + 80);
    });
    fragments.forEach(function (fragment) {
      minX = Math.min(minX, fragment.x - 40);
      maxX = Math.max(maxX, fragment.x + 40);
      minY = Math.min(minY, fragment.y - 40);
      maxY = Math.max(maxY, fragment.y + 40);
    });
    trail.forEach(function (point) {
      minX = Math.min(minX, point.x - 55);
      maxX = Math.max(maxX, point.x + 55);
      minY = Math.min(minY, point.y - 55);
      maxY = Math.max(maxY, point.y + 55);
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
    var time = (now - t0) / 1000;
    computeTarget();
    var follow = 1 - Math.exp(-7.5 * deltaSeconds);
    var yStep = (targetY - head.y) * follow;
    var maxStep = 38 * frameScale;
    head.y += Math.max(-maxStep, Math.min(maxStep, yStep));
    var deltaY = head.y - prevY;
    var speed = Math.abs(deltaY) / frameScale;
    if (Math.abs(deltaY) > 0.08) travelSign = deltaY > 0 ? 1 : -1;
    prevY = head.y;
    head.x = pathX(head.y, time);
    var horizontalVelocity = head.x - prevX;
    prevX = head.x;
    var tangentProbe = 12 * travelSign;
    var tangentX = pathX(head.y + tangentProbe, time) - head.x;
    var tangentLength = Math.hypot(tangentX, tangentProbe) || 1;
    var targetTravelX = tangentX / tangentLength;
    var targetTravelY = tangentProbe / tangentLength;
    var directionBlend = 1 - Math.exp(-9 * deltaSeconds);
    travel.x += (targetTravelX - travel.x) * directionBlend;
    travel.y += (targetTravelY - travel.y) * directionBlend;
    var travelLength = Math.hypot(travel.x, travel.y) || 1;
    travel.x /= travelLength;
    travel.y /= travelLength;
    lightNodes(head.y);
    recordTrail();

    var emissionRate = 245 + Math.min(235, speed * 13 + Math.abs(horizontalVelocity) * 9);
    emissionCarry += emissionRate * deltaSeconds;
    var emit = Math.min(13, Math.floor(emissionCarry));
    emissionCarry -= emit;
    for (var emitted = 0; emitted < emit; emitted++) {
      spawnOne(head.x, head.y, speed);
    }
    if (Math.random() < (0.045 + Math.min(0.16, speed * 0.018)) * frameScale) {
      spawnFragment(head.x, head.y);
    }

    if (dirtyBounds) ctx.clearRect(dirtyBounds.x, dirtyBounds.y, dirtyBounds.width, dirtyBounds.height);
    drawTrail();

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
      var velocityLength = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy) || 0.001;
      var radius = Math.max(0.8, particle.size * (0.48 + particle.life));
      var stretch = 1 + Math.min(particle.kind === 'dust' ? 1.1 : 3.2, velocityLength * (particle.kind === 'dust' ? 0.55 : 1.15) + particle.speedBoost);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = particle.life * (particle.kind === 'dust' ? 0.72 : 0.94);
      ctx.translate(particle.x, particle.y);
      ctx.rotate(Math.atan2(particle.vy, particle.vx));
      ctx.scale(stretch, 1);
      ctx.drawImage(glowSprites[particle.kind], -radius, -radius, radius * 2, radius * 2);
      ctx.restore();
    }

    for (var fragmentIndex = fragments.length - 1; fragmentIndex >= 0; fragmentIndex--) {
      var fragment = fragments[fragmentIndex];
      fragment.x += fragment.vx * frameScale;
      fragment.y += fragment.vy * frameScale;
      fragment.vx *= Math.pow(0.99, frameScale);
      fragment.vy *= Math.pow(0.988, frameScale);
      fragment.life -= fragment.decay * frameScale;
      if (fragment.life <= 0) {
        fragments[fragmentIndex] = fragments[fragments.length - 1];
        fragments.pop();
        continue;
      }
      if (parts.length < 550 && Math.random() < 0.55 * Math.min(1, frameScale)) {
        parts.push({
          x: fragment.x,
          y: fragment.y,
          vx: -travel.x * (0.7 + Math.random()) + (Math.random() - 0.5) * 0.3,
          vy: -travel.y * (0.7 + Math.random()) + (Math.random() - 0.5) * 0.3,
          drag: 0.95,
          life: 0.7 * fragment.life,
          decay: 0.02 + Math.random() * 0.02,
          size: 0.9 + Math.random() * 1.5,
          kind: Math.random() < 0.72 ? 'ion' : 'spark',
          speedBoost: 0.4
        });
      }
      var fragmentRadius = fragment.size * 3.2;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = fragment.life;
      ctx.translate(fragment.x, fragment.y);
      ctx.rotate(Math.atan2(fragment.vy, fragment.vx));
      ctx.scale(2.2, 1);
      ctx.drawImage(glowSprites.spark, -fragmentRadius, -fragmentRadius, fragmentRadius * 2, fragmentRadius * 2);
      ctx.restore();
    }

    var travelAngle = Math.atan2(travel.y, travel.x);
    var perpendicularX = -travel.y;
    var perpendicularY = travel.x;
    var pulse = 0.94 + 0.06 * Math.sin(time * 3.6);
    var lengthBoost = 1 + Math.min(0.72, speed * 0.026);

    function orientedGlow(distance, crossOffset, length, width, alpha, innerColor, middleColor) {
      var centerX = head.x - travel.x * distance + perpendicularX * crossOffset;
      var centerY = head.y - travel.y * distance + perpendicularY * crossOffset;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.translate(centerX, centerY);
      ctx.rotate(travelAngle);
      ctx.scale((length * lengthBoost) / 40, width / 40);
      var gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 40);
      gradient.addColorStop(0, 'rgba(' + innerColor + ', ' + (alpha * pulse) + ')');
      gradient.addColorStop(0.52, 'rgba(' + middleColor + ', ' + (alpha * 0.5 * pulse) + ')');
      gradient.addColorStop(1, 'rgba(70, 150, 245, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    orientedGlow(54, 0, 118, 48, 0.23, '135, 220, 255', '80, 178, 250');
    orientedGlow(43, -22, 82, 28, 0.13, '115, 205, 255', '85, 165, 245');
    orientedGlow(43, 22, 82, 28, 0.13, '115, 205, 255', '85, 165, 245');
    orientedGlow(7, 0, 92, 72, 0.13, '105, 185, 250', '80, 145, 235');
    orientedGlow(2, 0, 61, 47, 0.48, '115, 210, 255', '75, 175, 245');
    orientedGlow(-4, 0, 38, 29, 0.92, '195, 238, 255', '105, 205, 255');

    var leadX = head.x + travel.x * 13;
    var leadY = head.y + travel.y * 13;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = pulse;
    ctx.translate(leadX, leadY);
    ctx.rotate(travelAngle);
    ctx.scale(1.2, 1);
    ctx.drawImage(glowSprites.ion, -26, -26, 52, 52);
    ctx.drawImage(glowSprites.spark, -12, -12, 24, 24);
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(leadX + travel.x * 7, leadY + travel.y * 7);
    ctx.rotate(travelAngle);
    ctx.scale(1.3, 1);
    layer(7, 'rgba(255, 255, 255, ' + pulse + ')', 'rgba(195, 238, 255, 0)');
    ctx.restore();

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
    return { y: Math.round(head.y), target: Math.round(targetY), parts: parts.length, trail: trail.length, w: cssW, h: cssH, mobile: mobileQuery.matches };
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
