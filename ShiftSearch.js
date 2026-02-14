/* =========  חלק: JS + JQUERY  =========
   שם קובץ: /JS/shifts.js
   תפקיד:
   1) אלמנט מגיב לאירוע (change/click)
   2) כתיבה לתוך אלמנט (resultCount/status)
   3) עיצוב דינמי באמצעות מחלקה
   4) קליטת נתונים מהמשתמש (filters)
   5) העברת נתונים בין מסכים ב-JS (localStorage -> shift_details.html)
======================================== */

$(document).ready(function () {
  var shifts = [
    { id: 1, title: "גן פרטי בת\"א", city: "תל אביב", area: "צפון הישן", address: "אבן גבירול 120", date: "2026-01-05", start: "07:30", end: "16:00", wage: 50, type: "גן", hours: "מלא", urgent: true, ages: "2-5", requirements: "ניסיון קודם, אהבה לילדים" },
    { id: 2, title: "גן השלום", city: "רמת גן", area: "מרכז", address: "ביאליק 10", date: "2026-01-03", start: "14:00", end: "17:00", wage: 45, type: "גן", hours: "צהריים", urgent: false, ages: "3-4", requirements: "אחריות וזמינות" },
    { id: 3, title: "משפחתון קטן", city: "גבעתיים", area: "צפון", address: "כצנלסון 22", date: "2026-01-10", start: "08:00", end: "13:00", wage: 60, type: "משפחתון", hours: "בוקר", urgent: false, ages: "1-3", requirements: "סבלנות וחיוך" },
    { id: 4, title: "גן אורנים", city: "פתח תקווה", area: "אם המושבות", address: "העצמאות 7", date: "2026-01-04", start: "07:30", end: "13:30", wage: 52, type: "גן", hours: "בוקר", urgent: true, ages: "2-4", requirements: "ניסיון עם גילאי גן" },
    { id: 5, title: "משפחתון נווה", city: "תל אביב", area: "רמת אביב", address: "ברודצקי 31", date: "2026-01-06", start: "12:00", end: "16:00", wage: 55, type: "משפחתון", hours: "צהריים", urgent: true, ages: "1-2", requirements: "יכולת הרגעה וניהול" },
    { id: 6, title: "גן השקד", city: "רמת גן", area: "תל גנים", address: "נגבה 55", date: "2026-01-07", start: "07:45", end: "16:15", wage: 48, type: "גן", hours: "מלא", urgent: false, ages: "2-5", requirements: "סדר וארגון" }
  ];

  function daysFromToday(dateStr) {
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
      html += '<span class="badge' + (s.urgent ? "" : " hidden") + '">דחוף</span>';
      html += "<h3>" + s.title + "</h3>";
      html += '<p class="meta">📍 ' + s.city + (s.area ? " (" + s.area + ")" : "") + "</p>";
      html += '<p class="meta">📅 ' + s.date + " | " + s.start + " - " + s.end + "</p>";
      html += '<p class="meta">💰 ' + s.wage + "₪ / שעה</p>";
      html += '<p class="meta">🏫 ' + s.type + " | 🕒 " + s.hours + "</p>";
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
    var minWage = parseInt($("#minWage").val());
    var type = $("#type").val();
    var hours = $("#hours").val();
    var urgentOnly = $("#urgentOnly").is(":checked");
    var sort = $("#sort").val();

    var list = [];
    for (var i = 0; i < shifts.length; i++) {
      var s = shifts[i];
      if (city && s.city !== city) continue;
      if (date && s.date !== date) continue;
      if (type && s.type !== type) continue;
      if (hours && s.hours !== hours) continue;
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
    var id = parseInt($(this).closest(".shift-card").attr("data-id"));
    var chosen = null;
    for (var i = 0; i < shifts.length; i++) {
      if (shifts[i].id === id) chosen = shifts[i];
    }
    if (chosen) {
      localStorage.setItem("selectedShift", JSON.stringify(chosen));
      window.location.href = "ShiftDetails.html";
    }
  });

  $(document).on("click", ".applyBtn", function () {
    var id = parseInt($(this).closest(".shift-card").attr("data-id"));
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
