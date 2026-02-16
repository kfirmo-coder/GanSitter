$(document).ready(function () {
  var shifts = Array.isArray(window.SHIFTS) ? window.SHIFTS : [];

  function daysFromToday(dateStr) {
    if (!dateStr) return 9999;
    var parts = dateStr.split("-");
    var d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    var now = new Date();
    var a = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var b = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return Math.round((b - a) / (1000 * 60 * 60 * 24));
  }

  function render(list) {
    var html = "";
    for (var i = 0; i < list.length; i++) {
      var s = list[i];
      html += '<article class="shift-card" data-id="' + s.id + '">';
      if (s.urgent) html += '<span class="badge">דחוף</span>';
      html += "<h3>" + s.title + "</h3>";
      html += '<p class="meta">📍 ' + s.city + (s.area ? " (" + s.area + ")" : "") + "</p>";
      html += '<p class="meta">📅 ' + s.date + " | " + s.start + " - " + s.end + "</p>";
      html += '<p class="meta">💰 ' + s.wage + "₪ / שעה</p>";
      html += '<p class="meta">🏫 ' + (s.type || "גן") + " | 🕒 " + (s.hours || "") + "</p>";
      html += '<div class="card-actions">';
      html += '<button type="button" class="btn-action btn-green detailsBtn">לפרטים</button>';
      html += '<button type="button" class="btn-action btn-blue applyBtn">הגש מועמדות</button>';
      html += "</div>";
      html += "</article>";
    }
    $("#resultsGrid").html(html);
  }

  function getFiltered() {
    var city = $("#city").val();
    var date = $("#date").val();
    var minWage = parseInt($("#minWage").val(), 10);
    var type = $("#type").val();
    var hours = $("#hours").val();
    var urgentOnly = $("#urgentOnly").is(":checked");
    var sort = $("#sort").val();

    var list = [];
    for (var i = 0; i < shifts.length; i++) {
      var s = shifts[i];
      if (city && s.city !== city) continue;
      if (date && s.date !== date) continue;
      if (type && (s.type || "גן") !== type) continue;
      if (hours && (s.hours || "") !== hours) continue;
      if (urgentOnly && !s.urgent) continue;
      if (s.wage < minWage) continue;
      list.push(s);
    }

    if (sort === "high") {
      list.sort(function (a, b) { return b.wage - a.wage; });
    } else if (sort === "urgent") {
      list.sort(function (a, b) {
        if (a.urgent === b.urgent) return 0;
        return a.urgent ? -1 : 1;
      });
    } else {
      list.sort(function (a, b) {
        var c = $("#city").val();
        var aCity = c && a.city === c ? 0 : 1;
        var bCity = c && b.city === c ? 0 : 1;
        if (aCity !== bCity) return aCity - bCity;
        return daysFromToday(a.date) - daysFromToday(b.date);
      });
    }

    return list;
  }

  function getApplied() {
    var raw = localStorage.getItem("appliedShifts");
    if (!raw) return [];
    try { return JSON.parse(raw); } catch (e) { return []; }
  }
  function saveApplied(arr) {
    localStorage.setItem("appliedShifts", JSON.stringify(arr));
  }

  function update() {
    $("#minWageText").html("מ-" + $("#minWage").val() + "₪");

    var list = getFiltered();
    $("#resultCount").html("נמצאו " + list.length + " משמרות");

    var note = "";
    if ($("#urgentOnly").is(":checked")) note = "מציג רק דחופים";
    $("#statusNote").html(note);

    $("#resultsGrid").slideUp(120, function () {
      render(list);
      $("#resultsGrid").slideDown(120);
    });
  }

  update();

  $("#city, #date, #type, #hours, #sort").on("change", update);
  $("#minWage, #urgentOnly").on("input change", update);

  $("#clearBtn").on("click", function () {
    $("#city").val("");
    $("#date").val("");
    $("#type").val("");
    $("#hours").val("");
    $("#sort").val("near");
    $("#minWage").val(30);
    $("#urgentOnly").prop("checked", false);
    update();
  });

  $(document).on("click", ".detailsBtn", function () {
    var id = parseInt($(this).closest(".shift-card").attr("data-id"), 10);
    var chosen = null;
    for (var i = 0; i < shifts.length; i++) {
      if (shifts[i].id === id) chosen = shifts[i];
    }
    if (chosen) {
      localStorage.setItem("selectedShift", JSON.stringify(chosen));
      window.location.href = "ShiftDetails.html?id=" + encodeURIComponent(id);
    }
  });

  $(document).on("click", ".applyBtn", function () {
    var id = parseInt($(this).closest(".shift-card").attr("data-id"), 10);
    var chosen = null;
    for (var i = 0; i < shifts.length; i++) {
      if (shifts[i].id === id) chosen = shifts[i];
    }
    if (!chosen) return;

    var arr = getApplied();
    var exists = false;
    for (var j = 0; j < arr.length; j++) {
      if (arr[j].id === chosen.id) exists = true;
    }
    if (!exists) {
      arr.push({ id: chosen.id, title: chosen.title, city: chosen.city, date: chosen.date, wage: chosen.wage });
      saveApplied(arr);
    }

    $(this).removeClass("btn-blue").addClass("btn-gray").prop("disabled", true).text("נשלח ✅");
  });
});
