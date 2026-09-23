/**
 * Hero product-stage rotator.
 * Ported from purelane-homepage.html's `hstage` logic (lines ~1660-1682),
 * rewritten so:
 *  - it queries per <section class="hero"> instance instead of a single #id,
 *    so multiple hero sections (or one added twice for testing) don't collide
 *  - it re-initialises itself on Shopify theme-editor block events, so
 *    adding/removing/reordering bundle_tier blocks never leaves it in a
 *    broken state
 *  - it respects prefers-reduced-motion (no autoplay, no transition)
 */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initHero(section) {
    var stage = section.querySelector('[data-hero-stage]');
    if (!stage) return;

    var slides = Array.prototype.slice.call(stage.querySelectorAll('.hslide'));
    var dotsWrap = section.querySelector('.hdots');
    var dots = dotsWrap ? Array.prototype.slice.call(dotsWrap.querySelectorAll('button')) : [];
    if (slides.length < 2) return; // nothing to rotate

    var i = 0;
    var timer = null;

    function go(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, idx) { s.classList.toggle('on', idx === i); });
      dots.forEach(function (d, idx) {
        d.classList.toggle('on', idx === i);
        d.setAttribute('aria-selected', idx === i ? 'true' : 'false');
      });
    }

    function play() {
      if (!timer && !reduce) timer = setInterval(function () { go(i + 1); }, 3800);
    }
    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    dots.forEach(function (d, idx) {
      d.addEventListener('click', function () { stop(); go(idx); play(); });
    });

    stage.addEventListener('mouseenter', stop);
    stage.addEventListener('mouseleave', play);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { e.isIntersecting ? play() : stop(); });
      }, { threshold: 0.2 }).observe(stage);
    } else {
      play();
    }

    go(0);

    // theme editor: block selected -> jump to that slide and pause
    section.addEventListener('shopify:block:select', function (evt) {
      var idx = slides.findIndex(function (s) { return s.contains(evt.target) || s === evt.target; });
      if (idx > -1) { stop(); go(idx); }
    });
    section.addEventListener('shopify:block:deselect', play);
  }

  function initAll() {
    document.querySelectorAll('.hero').forEach(initHero);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // theme editor: re-init when a section instance is reloaded (e.g. settings changed)
  document.addEventListener('shopify:section:load', function (evt) {
    if (evt.target.querySelector('.hero')) initAll();
  });
})();
