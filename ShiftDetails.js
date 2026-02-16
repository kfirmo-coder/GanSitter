$(document).ready(function () {
  function toast(msg) {
    $("#toast").text(msg).fadeIn(150).delay(900).fadeOut(200);
  }

  function getApplied() {
    var raw = localStorage.getItem("appliedShifts");
    if (!raw) return [];
    try { return JSON.parse(raw); } catch (e) { return []; }
  }
  function saveApplied(arr) {
    localStorage.setItem("appliedShifts", JSON.stringify(arr));
  }

  function getIdFromQuery() {
    var params = new URLSearchParams(window.location.search);
    var v = params.get("id");
    return v ? parseInt(v, 10) : null;
  }

  function findShiftById(id) {
    var shifts = Array.isArray(window.SHIFTS) ? window.SHIFTS : [];
    for (var i = 0; i < shifts.length; i++) {
      if (shifts[i].id === id) return shifts[i];
    }
    return null;
  }

  var shift = null;

  var qid = getIdFromQuery();
  if (qid) shift = findShiftById(qid);

  if (!shift) {
    var raw = localStorage.getItem("selectedShift");
    if (raw) {
      try { shift = JSON.parse(raw); } catch (e) { shift = null; }
    }
  }

  if (!shift) {
    $("#noShift").show();
    $("#detailsWrap").hide();
    return;
  }

  $("#shiftTitle").text(shift.title || "פרטי משמרת");
  $("#cityVal").text(shift.city || "");
  $("#addressVal").text(shift.address || "");
  $("#dateVal").text(shift.date || "");
  $("#timeVal").text((shift.start || "") + " - " + (shift.end || ""));
  $("#wageVal").text((shift.wage != null ? shift.wage : "") + "₪");
  $("#typeVal").text(shift.type || "גן");
  $("#agesVal").text(shift.ages || "");
  $("#reqVal").text(shift.requirements || "");

  if (shift.urgent) $("#urgentTag").show();

  var applied = getApplied();
  var already = false;
  for (var i = 0; i < applied.length; i++) {
    if (applied[i].id === shift.id) already = true;
  }
  if (already) {
    $("#applyBtn").prop("disabled", true).text("כבר הוגש ✅");
    $("#applyStatus").text("כבר הגשת מועמדות למשמרת הזו.");
  }

  $("#applyBtn").on("click", function () {
    var applied2 = getApplied();
    var exists = false;
    for (var i = 0; i < applied2.length; i++) {
      if (applied2[i].id === shift.id) exists = true;
    }
    if (!exists) {
      applied2.push({ id: shift.id, title: shift.title, city: shift.city, date: shift.date, wage: shift.wage });
      saveApplied(applied2);
    }
    $("#applyBtn").prop("disabled", true).text("נשלח ✅");
    $("#applyStatus").text("המועמדות נשלחה.");
    toast("המועמדות נשלחה בהצלחה ✅");
  });

  $(document).on("click", ".acc-head", function () {
    var body = $(this).next(".acc-body");
    $(".acc-body").not(body).slideUp(150);
    body.slideToggle(150);
  });
});
