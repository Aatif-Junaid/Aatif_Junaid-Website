(function () {
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Restore a reader's disclosure choices when returning to either layout.
  var folds = document.querySelectorAll('details.fold');
  if (folds.length) {
    var phone = window.matchMedia('(max-width: 768px)');
    var compact = phone.matches;
    var compactStates = new WeakMap();
    var desktopStates = new WeakMap();
    folds.forEach(function (fold) {
      fold.open = compact ? fold.hasAttribute('data-phone-open') : !fold.classList.contains('fold--always');
    });
    function applyFolds() {
      var nextCompact = phone.matches;
      if (nextCompact === compact) return;
      var previousStates = compact ? compactStates : desktopStates;
      var nextStates = nextCompact ? compactStates : desktopStates;
      folds.forEach(function (fold) {
        if (fold.classList.contains('fold--always')) return;
        previousStates.set(fold, fold.open);
        fold.open = nextStates.has(fold) ? nextStates.get(fold) : !nextCompact || fold.hasAttribute('data-phone-open');
      });
      compact = nextCompact;
    }
    if (phone.addEventListener) phone.addEventListener('change', applyFolds); else phone.addListener(applyFolds);
  }

  // Build tracks: show the first two nodes, the rest behind a See more control.
  // Without this script every node renders, so nothing depends on it.
  document.querySelectorAll('ol.eng-steps').forEach(function (list, index) {
    var total = list.querySelectorAll('li').length;
    if (total <= 2) return;
    if (!list.id) list.id = 'eng-steps-' + (index + 1);
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'eng-more';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', list.id);
    var label = function (open) { button.textContent = open ? 'Show less' : 'Show ' + (total - 2) + ' more'; };
    label(false);
    list.classList.add('is-clipped');
    list.insertAdjacentElement('afterend', button);
    button.addEventListener('click', function () {
      var open = list.classList.toggle('is-clipped') === false;
      button.setAttribute('aria-expanded', String(open));
      label(open);
    });
  });

  var motionButton = document.querySelector('.motion-toggle');
  if (motionButton) motionButton.addEventListener('click', function () {
    var paused = document.documentElement.classList.toggle('animations-paused');
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.textContent = paused ? 'Play the comet' : 'Pause the comet';
  });

  document.querySelectorAll('.logo-chip img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.style.display = 'none';
    });
  });

  var header = document.querySelector('.site-header');
  if (header) {
    var measureHeader = function () {
      document.documentElement.style.setProperty('--site-header-height', header.offsetHeight + 'px');
    };
    measureHeader();
    if (window.ResizeObserver) new ResizeObserver(measureHeader).observe(header);
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      var target = document.getElementById(this.hash.slice(1));
      // Make the destination focusable without intercepting fragment navigation or Back.
      if (target && target.tabIndex < 0 && !target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
      }
    });
  });

  /* Autoplay demo clips in view when motion is allowed. Native play and pause
     controls remain available with either motion preference. */
  var clips = document.querySelectorAll('video[data-autoloop]');
  if (clips.length) {
    var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var observeVisibility = 'IntersectionObserver' in window;
    clips.forEach(function (clip) {
      var inView = !observeVisibility;
      var viewerIntent = null;
      var automaticPlayback = false;
      var pausingAutomatically = false;
      clip.controls = true;

      function playInView() {
        if (motion.matches || !inView || viewerIntent === 'pause' || !clip.paused || automaticPlayback) return;
        automaticPlayback = true;
        clip.play().catch(function () { automaticPlayback = false; });
      }

      function pauseForPage() {
        if (clip.paused) return;
        pausingAutomatically = true;
        clip.pause();
      }

      function syncMotion() {
        if (!motion.matches) playInView();
        else {
          clip.removeAttribute('autoplay');
          if (automaticPlayback && viewerIntent !== 'play') pauseForPage();
        }
      }

      // Media events also fire for calls the page makes. Only a viewer's
      // own Play or Pause should change their preference.
      clip.addEventListener('pause', function () {
        var pagePaused = pausingAutomatically;
        pausingAutomatically = false;
        automaticPlayback = false;
        if (pagePaused) playInView();
        else if (!clip.ended) viewerIntent = 'pause';
      });
      clip.addEventListener('play', function () {
        if (!automaticPlayback) viewerIntent = 'play';
        else if (!inView || (motion.matches && viewerIntent !== 'play')) pauseForPage();
      });
      if (observeVisibility) {
        var watcher = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            inView = entry.intersectionRatio >= 0.25;
            if (inView) playInView();
            else pauseForPage();
          });
        }, { threshold: 0.25 });
        watcher.observe(clip);
      }
      if (motion.addEventListener) motion.addEventListener('change', syncMotion);
      else motion.addListener(syncMotion);
      syncMotion();
    });
  }
})();
