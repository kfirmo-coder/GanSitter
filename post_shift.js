document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("postForm");
  var jsError = document.getElementById("jsError");

  function showError(msg) {
    jsError.className = "msg error";
    jsError.style.display = "block";
    jsError.innerHTML = msg;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function clearError() {
    jsError.style.display = "none";
    jsError.innerHTML = "";
  }

  function isIsraeliPhone(v) {
    return /^05\d-?\d{7}$/.test(v);
  }

  function todayStr() {
    var d = new Date();
    var y = d.getFullYear();
    var m = ("0" + (d.getMonth() + 1)).slice(-2);
    var day = ("0" + d.getDate()).slice(-2);
    return y + "-" + m + "-" + day;
  }


  var dateInput = document.getElementById("shift_date");
  if (dateInput) dateInput.min = todayStr();

  form.addEventListener("submit", function (e) {
    clearError();

    var phone = document.getElementById("phone").value.trim();
    var start = document.getElementById("start_time").value;
    var end = document.getElementById("end_time").value;
    var date = document.getElementById("shift_date").value;
    var wage = parseInt(document.getElementById("wage").value, 10);

    var errs = [];

    if (!isIsraeliPhone(phone)) errs.push("טלפון לא תקין. לדוגמה: 0501234567");
    if (start && end && end <= start) errs.push("שעת סיום חייבת להיות אחרי שעת התחלה");
    if (date && date < todayStr()) errs.push("התאריך לא יכול להיות בעבר");
    if (isNaN(wage) || wage < 30 || wage > 100) errs.push("השכר חייב להיות בין 30 ל-100");

   
  });
});
