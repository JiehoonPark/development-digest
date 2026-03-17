document.addEventListener("DOMContentLoaded", function () {
  var buttons = document.querySelectorAll(".label-filter");
  var cards = document.querySelectorAll(".article-card");

  if (buttons.length === 0 || cards.length === 0) return;

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var label = btn.getAttribute("data-label");

      buttons.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");

      cards.forEach(function (card) {
        if (label === "all") {
          card.style.display = "";
          return;
        }
        var labels = (card.getAttribute("data-labels") || "").split(",");
        card.style.display = labels.indexOf(label) !== -1 ? "" : "none";
      });
    });
  });
});
