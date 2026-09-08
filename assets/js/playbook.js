(function () {
  var studies = document.querySelectorAll('.case-study');
  if (!studies.length || !('IntersectionObserver' in window)) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      entry.target.classList.toggle('is-focus', entry.isIntersecting);
    });
  }, { rootMargin: '-42% 0px -42% 0px', threshold: 0 });

  studies.forEach(function (study) { observer.observe(study); });
})();
