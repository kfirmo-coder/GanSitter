$(document).ready(function () {

  // נרמול: תומך גם במבנה ישן וגם חדש (DB/PHP) כדי שהמסך יעבוד תמיד
  function normalizeShift(s) {
    if (!s) return s;

    var out = {
      id: s.id,
      title: s.title || s.k_name || s.gan_name || "",
      city: s.city || "",
      area: s.area || s.shift_area || "",
      address: s.address || s.shift_address || s.location || "",
      date: s.date || s.shift_date || "",
      start: s.start || s.start_time || "",
      end: s.end || s.end_time || "",

      // שכר יכול להגיע בשם שדה שונה (wage / hourly_wage)
      wage: (s.wage != null ? s.wage : (s.hourly_wage != null ? s.hourly_wage : "")),

      type: s.type || s.shift_type || "",
      ages: s.ages || s.kids_age || "",
      kids: (s.kids != null ? s.kids : ""),
      requirements: s.requirements || s.notes || s.req || "",

      // הופך כל ערך לבוליאני אמיתי
      urgent: !!s.urgent
    };

    if (!out.title) out.title = "פרטי משמרת";
    return out;
  }

  // קורא רשימת מועמדויות שכבר נשלחו (localStorage)
  function getApplied() {
    var raw = localStorage.getItem("appliedShifts");
    if (!raw) return [];
    try { return JSON.parse(raw); } catch (e) { return []; } // הגנה על JSON פגום
  }

  // שומר רשימת מועמדויות (localStorage)
  function saveApplied(arr) {
    localStorage.setItem("appliedShifts", JSON.stringify(arr));
  }

  // מביא את המשמרת שנבחרה מהמסך הקודם
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

  s = normalizeShift(s);

  $("#shiftTitle").text(s.title || "פרטי משמרת");
  $("#cityVal").text(s.city || "-");
  $("#addressVal").text(s.address || "-");
  $("#dateVal").text(s.date || "-");

  // אם הסיום "קטן" מההתחלה → המשמרת חוצה חצות (למחרת)
  var endLabel = (s.end || "");
  if (s.start && s.end && s.end < s.start) {
    endLabel = s.end + " (למחרת)";
  }
  $("#timeVal").text((s.start || "") + " - " + (endLabel || ""));

  $("#wageVal").text((s.wage || "-") + "₪ לשעה");
  $("#typeVal").text(s.type || "-");
  $("#agesVal").text(s.ages || "-");
  $("#reqVal").text(s.requirements || "-");

  if (s.urgent) $("#urgentTag").show();

  // נטרול כפתור אם כבר נשלחה מועמדות לפי id
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

    // בדיקה נגד כפילויות לפני שמוסיפים
    for (var j = 0; j < arr.length; j++) {
      if (arr[j].id === s.id) exists = true;
    }

    if (!exists) {
      arr.push({ id: s.id, title: s.title, city: s.city, date: s.date, wage: s.wage });
      saveApplied(arr);
    }

    $(this).removeClass("btn-green").addClass("btn-gray").prop("disabled", true).text("נשלח ✅");
    $("#applyStatus").text("נשלח עכשיו");
    $("#toast").fadeIn(150).delay(1200).fadeOut(200); // הודעת Toast קצרה
  });

  //  פותח אחד וסוגר את השאר
  $(".acc-head").on("click", function () {
    var body = $(this).next(".acc-body");
    $(".acc-body").not(body).slideUp(150);
    body.slideToggle(150);
  });
});
