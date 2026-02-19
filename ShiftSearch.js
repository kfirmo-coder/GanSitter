$(document).ready(function () {
  // אם המשתנה לא קיים/לא מערך – עובדים עם מערך ריק כדי לא לקרוס
  var shifts = Array.isArray(window.SHIFTS) ? window.SHIFTS : [];

  function daysFromToday(dateStr) {
    if (!dateStr) return 9999; // תאריך חסר ידורג "רחוק מאוד"
    // מצפה לפורמט: שנה-חודש-יום
    var parts = dateStr.split("-");
    var d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    // מאפסים שעות כדי להשוות רק לפי ימים (בלי השפעת שעה)
    var now = new Date();
    var a = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var b = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return Math.round((b - a) / (1000 * 60 * 60 * 24));
  }

  function render(list) {
    // בונים מחרוזת אחת גדולה ואז מכניסים למסך בבת אחת
    var html = "";
    for (var i = 0; i < list.length; i++) {
      var s = list[i];
      // שומרים מזהה על הכרטיס כדי לדעת על איזו משמרת לחצו
      html += '<article class="shift-card" data-id="' + s.id + '">';
      if (s.urgent) html += '<span class="badge">דחוף</span>';
      html += "<h3>" + s.title + "</h3>";
      html += '<p class="meta">📍 ' + s.city + (s.area ? " (" + s.area + ")" : "") + "</p>";

      // אם שעת סיום קטנה מהתחלה → המשמרת חוצה חצות
      var endLabel = s.end;
      if (s.start && s.end && s.end < s.start) {
        endLabel = s.end + " (למחרת)";
      }

      html += "<p>📅 " + s.date + " | " + s.start + " - " + endLabel + "</p>";

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
    // קורא ערכים מהטופס
    var city = $("#city").val();
    var date = $("#date").val();
    var minWage = parseInt($("#minWage").val(), 10); // הופכים מספר אמיתי
    var type = $("#type").val();
    var hours = $("#hours").val();
    var urgentOnly = $("#urgentOnly").is(":checked");
    var sort = $("#sort").val();

    var list = [];
    for (var i = 0; i < shifts.length; i++) {
      var s = shifts[i];
      // דילוג מהיר על משמרות שלא עומדות בתנאים
      if (city && s.city !== city) continue;
      if (date && s.date !== date) continue;
      if (type && (s.type || "גן") !== type) continue;
      if (hours && (s.hours || "") !== hours) continue;
      if (urgentOnly && !s.urgent) continue;
      if (s.wage < minWage) continue;
      list.push(s);
    }

    if (sort === "high") {
      // שכר גבוה קודם
      list.sort(function (a, b) { return b.wage - a.wage; });
    } else if (sort === "urgent") {
      // דחופים קודם
      list.sort(function (a, b) {
        if (a.urgent === b.urgent) return 0;
        return a.urgent ? -1 : 1;
      });
    } else {
      // קודם משמרות בעיר שנבחרה, ואז לפי כמה התאריך קרוב להיום
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
    // רשימת מועמדויות שמורה בדפדפן
    var raw = localStorage.getItem("appliedShifts");
    if (!raw) return [];
    try { return JSON.parse(raw); } catch (e) { return []; }
  }
  function saveApplied(arr) {
    localStorage.setItem("appliedShifts", JSON.stringify(arr));
  }

  function update() {
    // עדכון הטקסט ליד הסרגל
    $("#minWageText").html("מ-" + $("#minWage").val() + "₪");

    var list = getFiltered();
    $("#resultCount").html("נמצאו " + list.length + " משמרות");

    var note = "";
    if ($("#urgentOnly").is(":checked")) note = "מציג רק דחופים";
    $("#statusNote").html(note);

    // אנימציה: מסתיר, מרנדר, ומחזיר
    $("#resultsGrid").slideUp(120, function () {
      render(list);
      $("#resultsGrid").slideDown(120);
    });
  }

  update(); // טעינה ראשונית

  // שינוי בשדות → עדכון תוצאות
  $("#city, #date, #type, #hours, #sort").on("change", update);
  $("#minWage, #urgentOnly").on("input change", update);

  $("#clearBtn").on("click", function () {
    // איפוס כל המסננים לברירת מחדל
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
    // קורא את מזהה המשמרת מתוך הכרטיס שנלחץ
    var id = parseInt($(this).closest(".shift-card").attr("data-id"), 10);
    var chosen = null;
    for (var i = 0; i < shifts.length; i++) {
      if (shifts[i].id === id) chosen = shifts[i];
    }
    if (chosen) {
      // שומר את המשמרת כדי שמסך הפרטים יקרא אותה
      localStorage.setItem("selectedShift", JSON.stringify(chosen));
      // שולח למסך פרטים עם מזהה בכתובת
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
    // מניעת כפילות מועמדות לאותה משמרת
    for (var j = 0; j < arr.length; j++) {
      if (arr[j].id === chosen.id) exists = true;
    }
    if (!exists) {
      arr.push({ id: chosen.id, title: chosen.title, city: chosen.city, date: chosen.date, wage: chosen.wage });
      saveApplied(arr);
    }

    // שינוי הכפתור כדי להראות שנשלח ולמנוע לחיצה חוזרת
    $(this).removeClass("btn-blue").addClass("btn-gray").prop("disabled", true).text("נשלח ✅");
  });
});
