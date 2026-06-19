(function() {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function() {
      mobileNav.classList.toggle("open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var thumbs = Array.prototype.slice.call(document.querySelectorAll("[data-hero-thumb]"));

  if (slides.length > 1) {
    var current = 0;

    function activate(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });

      thumbs.forEach(function(thumb, thumbIndex) {
        thumb.classList.toggle("active", thumbIndex === current);
      });
    }

    thumbs.forEach(function(thumb, index) {
      thumb.addEventListener("click", function() {
        activate(index);
      });
    });

    setInterval(function() {
      activate(current + 1);
    }, 5200);
  }
})();
