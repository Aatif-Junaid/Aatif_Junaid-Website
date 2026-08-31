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
  var trailDistance = 0, TRAIL_WAVE = 3.6;
  var MAX_TRAIL_POINTS = 66, MAX_TRAIL_DISTANCE = 340;
  var itemPositions = [];
  var SAFE = 60, pathAmplitude = 160, pathOriginY = 0, pathStartX = SAFE, pathStartPhase = -Math.PI / 2;
  var motionElapsed = 0, headInitialized = false;
  var COMET_SPEED_MULTIPLIER = 1.10;

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
      trailDistance = 0;
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
      pathStartX = firstDotX - 4;
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
    trailDistance = 0;
    dirtyBounds = null;
  }

  function queueResize() {
    if (!resizeQueued) {
      resizeQueued = true;
      requestAnimationFrame(resize);
    }
  }

  function pathX(y, time) {
    var relativeY = y - pathOriginY;
    var flowingX = cssW / 2 + Math.sin(relativeY * 0.005 + time * 0.035 + pathStartPhase) * pathAmplitude;
    var openingProgress = Math.max(0, Math.min(1, relativeY / 170));
    if (openingProgress >= 1) return flowingX;
    var easedProgress = openingProgress * openingProgress * (3 - 2 * openingProgress);
    var openingAnchor = pathStartX + Math.sin(time * 0.035) * 3;
    var leftHook = -46 * Math.pow(Math.sin(Math.PI * openingProgress), 2);
    return openingAnchor + (flowingX - openingAnchor) * easedProgress + leftHook;
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
  var sparkSprite = makeGlowSprite([
    [0, 'rgba(222, 249, 252, 0.96)'],
    [0.2, 'rgba(128, 220, 237, 0.72)'],
    [0.55, 'rgba(48, 164, 207, 0.2)'],
    [1, 'rgba(34, 123, 182, 0)']
  ]);
  var emberSprite = makeGlowSprite([
    [0, 'rgba(255, 244, 207, 0.9)'],
    [0.24, 'rgba(239, 194, 112, 0.58)'],
    [0.6, 'rgba(194, 129, 55, 0.14)'],
    [1, 'rgba(166, 98, 40, 0)']
  ]);

  function spawnOne(x, y, speed) {
    if (parts.length >= 300) return;
    var spark = Math.random() < 0.18;
    var perpendicularX = -travel.y;
    var perpendicularY = travel.x;
    var back = spark ? 5 + Math.random() * 34 : 10 + Math.random() * 54;
    var spread = spark ? 4 + back * 0.16 : 5 + back * 0.24;
    var side = (Math.random() - 0.5) * spread;
    var drift = spark ? 0.7 + Math.random() * 1.4 : 0.24 + Math.random() * 0.5;
    var turbulence = (Math.random() - 0.5) * (spark ? 0.5 : 0.18);
    parts.push({
      x: x - travel.x * back + perpendicularX * side,
      y: y - travel.y * back + perpendicularY * side,
      vx: -travel.x * drift + perpendicularX * turbulence,
      vy: -travel.y * drift + perpendicularY * turbulence,
      drag: spark ? 0.97 : 0.986,
      life: 1,
      decay: spark ? 0.014 + Math.random() * 0.016 : 0.009 + Math.random() * 0.007,
      size: spark ? 1.5 + Math.random() * 2 : 2.4 + Math.random() * 3.8,
      spark: spark,
      warm: spark && Math.random() < 0.24,
      speedBoost: Math.min(0.35, speed * 0.012)
    });
  }

  function recordTrail() {
    var lastPoint = trail[trail.length - 1];
    var step = lastPoint ? Math.hypot(head.x - lastPoint.x, head.y - lastPoint.y) : 0;
    trailDistance += step;
    if (!lastPoint || step > 1.2) {
      trail.push({ x: head.x, y: head.y, phase: trailDistance });
    } else {
      lastPoint.x = head.x;
      lastPoint.y = head.y;
      lastPoint.phase = trailDistance;
    }
    while (trail.length > MAX_TRAIL_POINTS || (trail.length > 1 && trailDistance - trail[0].phase > MAX_TRAIL_DISTANCE)) {
      trail.shift();
    }
  }

  function drawDustTail(time, visualTrail) {
    if (visualTrail.length < 3) return;
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    var layers = [
      { farWidth: 42, nearWidth: 30, alpha: 0.024, color: '73, 138, 173' },
      { farWidth: 27, nearWidth: 19, alpha: 0.052, color: '75, 165, 198' },
      { farWidth: 14, nearWidth: 11, alpha: 0.11, color: '136, 201, 218' }
    ];
    layers.forEach(function (tailLayer) {
      for (var pointIndex = 1; pointIndex < visualTrail.length; pointIndex++) {
        var proximity = pointIndex / (visualTrail.length - 1);
        var distance = 1 - proximity;
        var breathe = 0.88 + 0.12 * Math.sin(pointIndex * 0.7 + time * 0.5);
        var alpha = tailLayer.alpha * Math.pow(proximity, 2.05) * breathe;
        ctx.strokeStyle = 'rgba(' + tailLayer.color + ', ' + alpha + ')';
        ctx.lineWidth = tailLayer.nearWidth + (tailLayer.farWidth - tailLayer.nearWidth) * distance;
        strokeSmoothTrailSegment(visualTrail, pointIndex);
      }
    });
    ctx.restore();
  }

  function wavedTrailPoint(pointIndex, time) {
    var point = trail[pointIndex];
    var before = trail[Math.max(0, pointIndex - 1)];
    var after = trail[Math.min(trail.length - 1, pointIndex + 1)];
    var tangentX = after.x - before.x;
    var tangentY = after.y - before.y;
    var tangentLength = Math.hypot(tangentX, tangentY) || 1;
    var proximity = pointIndex / Math.max(1, trail.length - 1);
    var envelope = Math.sin(Math.PI * proximity);
    var wave = Math.sin((point.phase || 0) * 0.045 + time * 0.35) * TRAIL_WAVE * envelope;
    return {
      x: point.x - tangentY / tangentLength * wave,
      y: point.y + tangentX / tangentLength * wave
    };
  }

  function buildVisualTrail(time) {
    var wavedTrail = trail.map(function (_, pointIndex) { return wavedTrailPoint(pointIndex, time); });
    if (wavedTrail.length < 5) return wavedTrail;
    return wavedTrail.map(function (point, pointIndex) {
      if (pointIndex < 2 || pointIndex > wavedTrail.length - 3) return point;
      return {
        x: wavedTrail[pointIndex - 2].x * 0.1 + wavedTrail[pointIndex - 1].x * 0.2 + point.x * 0.4 + wavedTrail[pointIndex + 1].x * 0.2 + wavedTrail[pointIndex + 2].x * 0.1,
        y: wavedTrail[pointIndex - 2].y * 0.1 + wavedTrail[pointIndex - 1].y * 0.2 + point.y * 0.4 + wavedTrail[pointIndex + 1].y * 0.2 + wavedTrail[pointIndex + 2].y * 0.1
      };
    });
  }

  function strokeSmoothTrailSegment(points, pointIndex) {
    var previous = points[pointIndex - 1];
    var current = points[pointIndex];
    var next = points[Math.min(points.length - 1, pointIndex + 1)];
    var startX = pointIndex === 1 ? previous.x : (previous.x + current.x) / 2;
    var startY = pointIndex === 1 ? previous.y : (previous.y + current.y) / 2;
    var endX = pointIndex === points.length - 1 ? current.x : (current.x + next.x) / 2;
    var endY = pointIndex === points.length - 1 ? current.y : (current.y + next.y) / 2;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(current.x, current.y, endX, endY);
    ctx.stroke();
  }

  function drawCurvedIonTrail(time, visualTrail) {
    if (visualTrail.length < 3) return;
    var breathe = 0.96 + 0.04 * Math.sin(time * 0.8);
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (var pointIndex = 1; pointIndex < visualTrail.length; pointIndex++) {
      var proximity = pointIndex / (visualTrail.length - 1);
      ctx.strokeStyle = 'rgba(100, 204, 229, ' + (0.17 * Math.pow(proximity, 1.8) * breathe) + ')';
      ctx.lineWidth = 1.8 + 7.5 * proximity;
      strokeSmoothTrailSegment(visualTrail, pointIndex);
      ctx.strokeStyle = 'rgba(194, 239, 244, ' + (0.44 * Math.pow(proximity, 2.4) * breathe) + ')';
      ctx.lineWidth = 0.7 + 2.5 * proximity;
      strokeSmoothTrailSegment(visualTrail, pointIndex);
    }
    ctx.restore();
  }

  function drawHead(time, visualTrail) {
    var directionX = travel.x;
    var directionY = travel.y;
    if (visualTrail.length >= 4) {
      var headBase = visualTrail[Math.max(0, visualTrail.length - 4)];
      directionX = head.x - headBase.x;
      directionY = head.y - headBase.y;
      var directionLength = Math.hypot(directionX, directionY) || 1;
      directionX /= directionLength;
      directionY /= directionLength;
    }
    var angle = Math.atan2(directionY, directionX);
    var breathe = 0.96 + 0.04 * Math.sin(time * 0.8);
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.translate(head.x, head.y);
    ctx.rotate(angle);

    ctx.scale(1.22, 0.96);
    var coma = ctx.createRadialGradient(5, 0, 0, -3, 0, 30);
    coma.addColorStop(0, 'rgba(164, 226, 235, ' + (0.42 * breathe) + ')');
    coma.addColorStop(0.34, 'rgba(93, 192, 215, ' + (0.24 * breathe) + ')');
    coma.addColorStop(0.72, 'rgba(48, 151, 194, ' + (0.08 * breathe) + ')');
    coma.addColorStop(1, 'rgba(47, 127, 179, 0)');
    ctx.fillStyle = coma;
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.fill();

    var softCore = ctx.createRadialGradient(5, 0, 0, 0, 0, 17);
    softCore.addColorStop(0, 'rgba(194, 239, 244, ' + (0.78 * breathe) + ')');
    softCore.addColorStop(0.34, 'rgba(116, 211, 226, ' + (0.52 * breathe) + ')');
    softCore.addColorStop(0.72, 'rgba(50, 165, 205, ' + (0.2 * breathe) + ')');
    softCore.addColorStop(1, 'rgba(47, 127, 179, 0)');
    ctx.fillStyle = softCore;
    ctx.beginPath();
    ctx.arc(0, 0, 17, 0, Math.PI * 2);
    ctx.fill();

    var hotCore = ctx.createRadialGradient(4, -1, 0, 1, 0, 10.5);
    hotCore.addColorStop(0, 'rgba(218, 248, 248, ' + (0.98 * breathe) + ')');
    hotCore.addColorStop(0.32, 'rgba(156, 230, 238, ' + (0.78 * breathe) + ')');
    hotCore.addColorStop(0.72, 'rgba(65, 184, 215, ' + (0.28 * breathe) + ')');
    hotCore.addColorStop(1, 'rgba(42, 144, 193, 0)');
    ctx.fillStyle = hotCore;
    ctx.beginPath();
    ctx.arc(0, 0, 10.5, 0, Math.PI * 2);
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
    var follow = 1 - Math.exp(-(1.65 * COMET_SPEED_MULTIPLIER) * deltaSeconds);
    var yStep = (targetY - head.y) * follow;
    var maxStep = 8.2 * COMET_SPEED_MULTIPLIER * frameScale;
    head.y += Math.max(-maxStep, Math.min(maxStep, yStep));
    var deltaY = head.y - prevY;
    var speed = Math.abs(deltaY) / frameScale;
    if (Math.abs(deltaY) > 0.08) {
      var nextTravelSign = deltaY > 0 ? 1 : -1;
      if (nextTravelSign !== travelSign) {
        trail.length = 0;
        trailDistance = 0;
        parts.forEach(function (particle) { particle.life = Math.min(particle.life, 0.24); });
      }
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
    var directionBlend = 1 - Math.exp(-12 * deltaSeconds);
    travel.x += (targetTravelX - travel.x) * directionBlend;
    travel.y += (targetTravelY - travel.y) * directionBlend;
    var travelLength = Math.hypot(travel.x, travel.y) || 1;
    travel.x /= travelLength;
    travel.y /= travelLength;
    lightNodes(head.y);
    recordTrail();

    var emissionRate = 145 + Math.min(75, speed * 4 + Math.abs(horizontalVelocity) * 2.5);
    emissionCarry += emissionRate * deltaSeconds;
    var emit = Math.min(6, Math.floor(emissionCarry));
    emissionCarry -= emit;
    for (var emitted = 0; emitted < emit; emitted++) {
      spawnOne(head.x, head.y, speed);
    }
    if (dirtyBounds) ctx.clearRect(dirtyBounds.x, dirtyBounds.y, dirtyBounds.width, dirtyBounds.height);
    var visualTrail = buildVisualTrail(time);
    drawDustTail(time, visualTrail);
    drawCurvedIonTrail(time, visualTrail);

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
      ctx.globalAlpha = Math.pow(particle.life, particle.spark ? 1.25 : 1.7) * (particle.spark ? 0.82 : 0.25);
      ctx.translate(particle.x, particle.y);
      ctx.rotate(Math.atan2(particle.vy, particle.vx));
      ctx.scale(1 + particle.speedBoost + (particle.spark ? 0.3 : 0), particle.spark ? 0.52 : 0.82);
      var particleSprite = particle.warm ? emberSprite : (particle.spark ? sparkSprite : mistSprite);
      ctx.drawImage(particleSprite, -radius, -radius, radius * 2, radius * 2);
      ctx.restore();
    }

    drawHead(time, visualTrail);

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
    }, { rootMargin: '0px 0px 22% 0px', threshold: 0 }).observe(timeline);
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
