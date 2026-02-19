/* =========  חלק: JS + JQUERY  =========
   שם קובץ: ShiftDetails.js
   תפקיד: קבלת נתון מ-localStorage (מסך קודם) + שליחת מועמדות + Accordion
======================================== */

$(document).ready(function () {

  function normalizeShift(s) {
    if (!s) return s;

    // תומך גם במבנה הישן וגם במבנה החדש שמגיע מה-PHP/DB
    var out = {
      id: s.id,

      title: s.title || s.k_name || s.gan_name || "",

      city: s.city || "",
      area: s.area || s.shift_area || "",
      address: s.address || s.shift_address || s.location || "",

      date: s.date || s.shift_date || "",
      start: s.start || s.start_time || "",
      end: s.end || s.end_time || "",

      wage: (s.wage != null ? s.wage : (s.hourly_wage != null ? s.hourly_wage : "")),
      type: s.type || s.shift_type || "",

      ages: s.ages || s.kids_age || "",
      kids: (s.kids != null ? s.kids : ""),

      requirements: s.requirements || s.notes || s.req || "",

      urgent: !!s.urgent
    };

    // אם אין title אבל יש שם גן - נשתמש בו
    if (!out.title) out.title = "פרטי משמרת";

    return out;
  }

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

  // ✅ נרמול מבנה הנתונים
  s = normalizeShift(s);

  $("#shiftTitle").text(s.title || "פרטי משמרת");
  $("#cityVal").text(s.city || "-");
  $("#addressVal").text(s.address || "-");
  $("#dateVal").text(s.date || "-");

  // ✅ “(למחרת)” אם שעת סיום קטנה משעת התחלה
  var endLabel = (s.end || "");
  if (s.start && s.end && s.end < s.start) {
    endLabel = s.end + " (למחרת)";
  }
  $("#timeVal").text((s.start || "") + " - " + (endLabel || ""));

  $("#wageVal").text((s.wage || "-") + "₪ לשעה");
  $("#typeVal").text(s.type || "-");
  $("#agesVal").text(s.ages || "-");

  // אם אין requirements אבל יש kids, אפשר להציג משהו בסיסי במקום "-" (לא חובה)
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
