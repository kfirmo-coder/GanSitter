document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("postForm");
  var serverMsg = document.getElementById("serverMsg");

  function showError(msg) {
    if (!serverMsg) return;
    serverMsg.className = "msg error";
    serverMsg.style.display = "block";
    serverMsg.innerHTML = msg;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function clearMsg() {
    if (!serverMsg) return;
    serverMsg.style.display = "none";
    serverMsg.innerHTML = "";
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

  if (!form) return;

  form.addEventListener("submit", function (e) {
    clearMsg();

    var k_name = document.getElementById("k_name").value.trim();
    var city = document.getElementById("city").value.trim();
    var phone = document.getElementById("phone").value.trim();
    var start = document.getElementById("start_time").value;
    var end = document.getElementById("end_time").value;
    var date = document.getElementById("shift_date").value;
    var wage = parseInt(document.getElementById("wage").value, 10);
    var kids = parseInt(document.getElementById("kids").value, 10);

    var errs = [];

    if (k_name === "") errs.push("חובה למלא שם גן");
    if (city === "") errs.push("חובה לבחור עיר");
    if (!/^05\d-?\d{7}$/.test(phone)) errs.push("טלפון לא תקין. לדוגמה: 0501234567");
    if (start && end && end <= start) errs.push("שעת סיום חייבת להיות אחרי שעת התחלה");
    if (date && date < todayStr()) errs.push("התאריך לא יכול להיות בעבר");
    if (isNaN(wage) || wage < 30 || wage > 100) errs.push("השכר חייב להיות בין 30 ל-100");
    if (isNaN(kids) || kids < 1 || kids > 60) errs.push("מספר ילדים לא תקין");

    if (errs.length) {
      e.preventDefault();
      showError(errs.join("<br>"));
    }
  });
});
