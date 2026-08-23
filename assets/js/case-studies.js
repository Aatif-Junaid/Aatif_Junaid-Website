(function () {
  var studies = Array.prototype.slice.call(document.querySelectorAll('.case-study'));
  var frameRequested = false;

  if (!studies.length) return;

  function updateFocusedStudy() {
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    var viewportCenter = viewportHeight * 0.5;
    var closestStudy = null;
    var closestDistance = Infinity;

    studies.forEach(function (study) {
      var bounds = study.getBoundingClientRect();
      if (bounds.bottom <= 0 || bounds.top >= viewportHeight) return;

      var studyCenter = bounds.top + (bounds.height * 0.5);
      var distance = Math.abs(studyCenter - viewportCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestStudy = study;
      }
    });

    studies.forEach(function (study) {
      study.classList.toggle('is-focus', study === closestStudy);
    });
    frameRequested = false;
  }

  function requestFocusUpdate() {
    if (frameRequested) return;
    frameRequested = true;
    window.requestAnimationFrame(updateFocusedStudy);
  }

  window.addEventListener('scroll', requestFocusUpdate, { passive: true });
  window.addEventListener('resize', requestFocusUpdate, { passive: true });
  requestFocusUpdate();
})();
