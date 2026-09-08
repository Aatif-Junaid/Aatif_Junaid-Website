(function () {
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

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

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      var selector = this.getAttribute('href');
      if (!selector || selector.length < 2) return;
      var target = document.querySelector(selector);
      if (target) {
        event.preventDefault();
        var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        history.replaceState(null, '', selector);
      }
    });
  });

  /* Looping demo clips behave like a GIF, but reduced-motion users get the
     poster frame and a play control instead of movement they did not ask for.
     Everyone else only starts the clip once it is actually on screen. */
  var clips = document.querySelectorAll('video[data-autoloop]');
  if (clips.length) {
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    clips.forEach(function (clip) {
      if (reduced) {
        clip.removeAttribute('autoplay');
        clip.controls = true;
        clip.pause();
        return;
      }
      if (!('IntersectionObserver' in window)) {
        clip.play().catch(function () { clip.controls = true; });
        return;
      }
      // Native controls are on, so a viewer's own pause has to win over the
      // in-view autoplay. Pauses we trigger are flagged; any other pause is theirs.
      var ourPause = false, viewerPaused = false;
      clip.addEventListener('pause', function () { if (!ourPause && !clip.ended) viewerPaused = true; ourPause = false; });
      clip.addEventListener('play', function () { viewerPaused = false; });
      var watcher = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            if (!viewerPaused) clip.play().catch(function () {});
          } else if (!clip.paused) {
            ourPause = true;
            clip.pause();
          }
        });
      }, { threshold: 0.25 });
      watcher.observe(clip);
    });
  }
})();
