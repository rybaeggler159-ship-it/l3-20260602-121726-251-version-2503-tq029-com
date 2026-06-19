(function() {
  var data = window.SEARCH_MOVIES || [];
  var form = document.querySelector("[data-search-form]");
  var input = document.querySelector("[data-search-input]");
  var regionSelect = document.querySelector("[data-region-filter]");
  var typeSelect = document.querySelector("[data-type-filter]");
  var grid = document.querySelector("[data-search-results]");
  var empty = document.querySelector("[data-search-empty]");

  if (!form || !input || !regionSelect || !typeSelect || !grid) {
    return;
  }

  function uniqueValues(key) {
    var map = {};
    data.forEach(function(item) {
      if (item[key]) {
        map[item[key]] = true;
      }
    });
    return Object.keys(map).sort();
  }

  function fillSelect(select, values) {
    values.forEach(function(value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function(char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function card(item) {
    return [
      '<a class="movie-card" href="' + escapeHtml(item.url) + '">',
      '<span class="poster-wrap">',
      '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="poster-glow"></span>',
      '<span class="year-badge">' + escapeHtml(item.year) + '</span>',
      '</span>',
      '<span class="card-info">',
      '<strong>' + escapeHtml(item.title) + '</strong>',
      '<small><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.genre) + '</span></small>',
      '<em>' + escapeHtml(item.oneLine) + '</em>',
      '</span>',
      '</a>'
    ].join("");
  }

  function queryFromLocation() {
    var params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  }

  function render() {
    var keyword = input.value.trim().toLowerCase();
    var region = regionSelect.value;
    var type = typeSelect.value;

    var results = data.filter(function(item) {
      var haystack = [
        item.title,
        item.region,
        item.type,
        item.year,
        item.genre,
        item.oneLine,
        (item.tags || []).join(" ")
      ].join(" ").toLowerCase();

      if (keyword && haystack.indexOf(keyword) === -1) {
        return false;
      }

      if (region && item.region !== region) {
        return false;
      }

      if (type && item.type !== type) {
        return false;
      }

      return true;
    }).slice(0, 120);

    grid.innerHTML = results.map(card).join("");
    if (empty) {
      empty.style.display = results.length ? "none" : "block";
    }
  }

  fillSelect(regionSelect, uniqueValues("region"));
  fillSelect(typeSelect, uniqueValues("type"));

  input.value = queryFromLocation();
  form.addEventListener("submit", function(event) {
    event.preventDefault();
    render();
  });
  input.addEventListener("input", render);
  regionSelect.addEventListener("change", render);
  typeSelect.addEventListener("change", render);

  render();
})();
