/* ========= ShiftDetails.js =========
   תפקיד: טוען פרטי משמרת מהשרת לפי id ב-URL + מועמדות localStorage + Accordion
*/

$(document).ready(function () {

  function getParam(name) {
    var url = new URL(window.location.href);
    return url.searchParams.get(name);
  }

  function getApplied() {
    var raw = localStorage.getItem("appliedShifts");
    if (!raw) return [];
    try { return JSON.parse(raw); } catch (e) { return []; }
  }

  function saveApplied(arr) {
    localStorage.setItem("appliedShifts", JSON.stringify(arr));
  }

  var id = parseInt(getParam("id"), 10);
  if (!id) {
    $("#noShift").show();
    $("#detailsWrap").hide();
    return;
  }

  // טוען מהשרת
  $.getJSON("shift_details_api.php", { id: id })
    .done(function (resp) {
      if (!resp || !resp.ok || !resp.shift) {
        $("#noShift").show();
        $("#detailsWrap").hide();
        return;
      }

      var s = resp.shift;

      $("#shiftTitle").text(s.title || "פרטי משמרת");
      $("#cityVal").text(s.city || "-");
      $("#addressVal").text(s.address || "-");
      $("#dateVal").text(s.date || "-");
      $("#timeVal").text((s.start || "") + " - " + (s.end || ""));
      $("#wageVal").text((s.wage || "-") + "₪ לשעה");
      $("#typeVal").text(s.type || "-");
      $("#agesVal").text(s.ages || "-");
      $("#reqVal").text(s.requirements || "-");
      if (s.urgent) $("#urgentTag").show();

      // בדיקת "כבר הוגש"
      var applied = getApplied();
      var already = applied.some(function (x) { return x.id === s.id; });

      if (already) {
        $("#applyBtn").removeClass("btn-green").addClass("btn-gray")
          .prop("disabled", true).text("נשלח ✅");
        $("#applyStatus").text("כבר שלחת מועמדות למשמרת הזאת");
      }

      $("#applyBtn").on("click", function () {
        var arr = getApplied();
        var exists = arr.some(function (x) { return x.id === s.id; });

        if (!exists) {
          arr.push({ id: s.id, title: s.title, city: s.city, date: s.date, wage: s.wage });
          saveApplied(arr);
        }

        $(this).removeClass("btn-green").addClass("btn-gray")
          .prop("disabled", true).text("נשלח ✅");
        $("#applyStatus").text("נשלח עכשיו");
        $("#toast").fadeIn(150).delay(1200).fadeOut(200);
      });
    })
    .fail(function () {
      $("#noShift").show();
      $("#detailsWrap").hide();
    });

  // Accordion
  $(".acc-head").on("click", function () {
    var body = $(this).next(".acc-body");
    $(".acc-body").not(body).slideUp(150);
    body.slideToggle(150);
  });
});
