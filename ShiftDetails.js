/* =========  חלק: JS + JQUERY  =========
   שם קובץ: /JS/shift_details.js
   תפקיד: קבלת נתון מ-localStorage (מסך קודם) + שליחת מועמדות + Accordion
======================================== */

$(document).ready(function () {
  function getApplied() {
    var raw = localStorage.getItem("appliedShifts");
    if (!raw) return [];
    try { return JSON.parse(raw); } catch (e) { return []; }
  }

  function saveApplied(arr) {
    localStorage.setItem("appliedShifts", JSON.stringify(arr));
  }

  var raw = localStorage.getItem("selectedShift");
  if (!raw) {
    $("#noShift").show();
    $("#detailsWrap").hide();
    return;
  }

  var s = null;
  try { s = JSON.parse(raw); } catch (e) { s = null; }

  if (!s) {
    $("#noShift").show();
    $("#detailsWrap").hide();
    return;
  }

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

  var applied = getApplied();
  var already = false;
  for (var i = 0; i < applied.length; i++) {
    if (applied[i].id === s.id) already = true;
  }

  if (already) {
    $("#applyBtn").removeClass("btn-green").addClass("btn-gray").prop("disabled", true).text("נשלח ✅");
    $("#applyStatus").text("כבר שלחת מועמדות למשמרת הזאת");
  }

  $("#applyBtn").on("click", function () {
    var arr = getApplied();
    var exists = false;
    for (var j = 0; j < arr.length; j++) {
      if (arr[j].id === s.id) exists = true;
    }
    if (!exists) {
      arr.push({ id: s.id, title: s.title, city: s.city, date: s.date, wage: s.wage });
      saveApplied(arr);
    }

    $(this).removeClass("btn-green").addClass("btn-gray").prop("disabled", true).text("נשלח ✅");
    $("#applyStatus").text("נשלח עכשיו");
    $("#toast").fadeIn(150).delay(1200).fadeOut(200);
  });

  $(".acc-head").on("click", function () {
    var body = $(this).next(".acc-body");
    $(".acc-body").not(body).slideUp(150);
    body.slideToggle(150);
  });
});
