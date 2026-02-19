/* ================================
   קובץ: (לדוגמה) post_shift.js
   תפקיד: ולידציה צד-לקוח לטופס פרסום משמרת + הודעות הצלחה/שגיאה
================================ */

document.addEventListener("DOMContentLoaded", function () {
  /* ריצה רק אחרי שה-DOM נטען כדי שהאלמנטים יהיו זמינים */
  var form = document.getElementById("postForm");      // הטופס של פרסום משמרת
  var serverMsg = document.getElementById("serverMsg"); // אזור הודעות (שגיאה/הצלחה) למשתמש

  /* מציג הודעת שגיאה בראש העמוד (בפורמט HTML כדי לאפשר <br>) */
  function showError(msg) {
    if (!serverMsg) return;                    // הגנה: אם אין אלמנט הודעה, לא עושים כלום
    serverMsg.className = "msg error";         // מחיל עיצוב CSS של שגיאה
    serverMsg.style.display = "block";         // מציג את הבלוק
    serverMsg.innerHTML = msg;                 // מציב את ההודעה (כולל ירידות שורה)
    window.scrollTo({ top: 0, behavior: "smooth" }); // גלילה חלקה לראש כדי שהמשתמש יראה את ההודעה
  }

  /* מציג הודעת הצלחה בראש העמוד */
  function showSuccess(msg) {
    if (!serverMsg) return;                    // הגנה: אם אין אלמנט הודעה, לא עושים כלום
    serverMsg.className = "msg success";       // מחיל עיצוב CSS של הצלחה
    serverMsg.style.display = "block";         // מציג את הבלוק
    serverMsg.innerHTML = msg;                 // מציב את ההודעה
    window.scrollTo({ top: 0, behavior: "smooth" }); // גלילה לראש
  }

  /* מנקה הודעה קיימת (כדי לא להשאיר הודעות ישנות בעת ניסיון חדש) */
  function clearMsg() {
    if (!serverMsg) return;          // הגנה: אם אין אלמנט הודעה, לא עושים כלום
    serverMsg.style.display = "none";// מסתיר את אזור ההודעה
    serverMsg.innerHTML = "";        // מנקה תוכן
  }

  /* מחזיר את התאריך של היום בפורמט YYYY-MM-DD
     (אותו פורמט של <input type="date">) */
  function todayStr() {
    var d = new Date();                              // תאריך/שעה נוכחיים
    var y = d.getFullYear();                         // שנה (YYYY)
    var m = ("0" + (d.getMonth() + 1)).slice(-2);    // חודש עם 0 מוביל (01-12)
    var day = ("0" + d.getDate()).slice(-2);         // יום עם 0 מוביל (01-31)
    return y + "-" + m + "-" + day;                  // בניית מחרוזת תאריך תקנית
  }

  /* הגדרת מינימום לתאריך במשמרת: לא מאפשר לבחור תאריך עבר באמצעות ה-datepicker */
  var dateInput = document.getElementById("shift_date");
  if (dateInput) dateInput.min = todayStr();

  /* קריאת פרמטרים מה-URL כדי לזהות חזרה מהשרת אחרי פרסום מוצלח (?success=1) */
  var params = new URLSearchParams(window.location.search);
  if (params.get("success") === "1") {
    showSuccess("המשמרת פורסמה בהצלחה ✅"); // הודעת הצלחה למשתמש

    /* ניקוי הפרמטר מה-URL כדי שלא תופיע ההודעה שוב ברענון */
    window.history.replaceState({}, document.title, window.location.pathname);

    /* איפוס הטופס כדי שלא יישארו ערכים קודמים לאחר הצלחה */
    if (form) form.reset();
  }

  /* אם אין טופס בעמוד - אין מה להאזין לשליחה */
  if (!form) return;

  /* מאזין לשליחה של הטופס ובודק ולידציה לפני שהדפדפן שולח לשרת */
  form.addEventListener("submit", function (e) {
    clearMsg(); // מנקה הודעות קודמות בתחילת ניסיון שליחה חדש

    /* שליפת ערכים מהשדות החשובים + trim כדי להסיר רווחים מיותרים */
    var k_name = document.getElementById("k_name").value.trim();
    var city = document.getElementById("city").value.trim();
    var addressEl = document.getElementById("address");
    var shiftTypeEl = document.getElementById("shift_type");

    /* הגנה: address/shift_type יכולים להיות חסרים ב-DOM (לפי מבנה העמוד) */
    var address = addressEl ? addressEl.value.trim() : "";
    var shift_type = shiftTypeEl ? shiftTypeEl.value.trim() : "";

    /* שדות נוספים */
    var phone = document.getElementById("phone").value.trim();
    var start = document.getElementById("start_time").value;
    var end = document.getElementById("end_time").value;
    var date = document.getElementById("shift_date").value;

    /* המרות למספרים (wage/kids) */
    var wage = parseInt(document.getElementById("wage").value, 10);
    var kids = parseInt(document.getElementById("kids").value, 10);

    /* מערך צובר שגיאות כדי להציג למשתמש את כל הבעיות יחד */
    var errs = [];

    /* ולידציות שדות חובה */
    if (k_name === "") errs.push("חובה למלא שם גן");
    if (city === "") errs.push("חובה לבחור עיר");
    if (address === "") errs.push("חובה למלא כתובת");
    if (shift_type === "") errs.push("חובה לבחור סוג מסגרת");
    if(start==="") errs.push("חובה להכניס שעת התחלה");
    if(end==="") errs.push("חובה להכניס שעת סיום");
    if(date==="") errs.push("חובה להכניס תאריך");

    /* ולידציה לטלפון ישראלי שמתחיל ב-05 + 8 ספרות
       מאפשר גם מקף אופציונלי אחרי 3 ספרות (050-1234567) */
    if (!/^05\d-?\d{7}$/.test(phone)) errs.push("טלפון לא תקין. לדוגמה: 0501234567");

    /* בדיקה ששעת סיום לא זהה לשעת התחלה (טווח לא הגיוני) */
    if (start && end && end === start) {
      errs.push("שעת סיום לא יכולה להיות זהה לשעת התחלה");
    }

    /* בדיקה שהתאריך לא בעבר (מעבר לחסימה של min בדפדפן) */
    if (date && date < todayStr()) errs.push("התאריך לא יכול להיות בעבר");

    /* טווח הגיוני לשכר */
    if (isNaN(wage) || wage < 30 || wage > 100) errs.push("השכר חייב להיות בין 30 ל-100");

    /* טווח הגיוני למספר ילדים */
    if (isNaN(kids) || kids < 1 || kids > 60) errs.push("מספר ילדים לא תקין");

    /* אם יש שגיאות:
       - מונעים שליחת טופס לשרת
       - מציגים את השגיאות במרוכז */
    if (errs.length) {
      e.preventDefault();
      showError(errs.join("<br>"));
    }
  });
});
