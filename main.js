const marks = document.querySelectorAll(
  ".panel, .swatch, .type-sample, .pack-card, .mood-card, .hero-meta div"
);

marks.forEach((mark, index) => {
  mark.style.animationDelay = `${index * 40}ms`;
});
