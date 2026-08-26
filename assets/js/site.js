(function () {
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

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
      }
    });
  });
})();
