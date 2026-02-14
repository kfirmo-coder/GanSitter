/* ========= dashboard.js =========
   תפקיד:
   - טעינת משמרות מהשרת (dashboard_api.php)
   - רינדור לרשימה ב-HTML
   - צפייה בפרטים: שמירה ל-localStorage + מעבר ל-shift_details.html
   - סגירת משמרת: נשמר מקומית (localStorage) לפי ID + שינוי UI
   - הצגת "נשמר בהצלחה" לפי saved=1
   - הצגת מועמדויות מה-localStorage
================================= */

(function () {
  var postsEl = document.getElementById("posts");
  var emptyStateEl = document.getElementById("emptyState");
  var savedMsgEl = document.getElementById("savedMsg");
  var toastEl = document.getElementById("toast");

  function qs(name) {
    var url = new URL(window.location.href);
    return url.searchParams.get(name);
  }

  function show(el) { el.style.display = "block"; }
  function hide(el) { el.style.display = "none"; }

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg || "עודכן ✅";
    toastEl.classList.add("show");
    setTimeout(function () { toastEl.classList.remove("show"); }, 1200);
  }

  // saved=1 מהפניה אחרי פרסום
  if (qs("saved") === "1") show(savedMsgEl);

  // סטטוס "סגורה" מקומית לפי ID (כי אין עמודת סטטוס בטבלה)
  function getClosedMap() {
    try { return JSON.parse(localStorage.getItem("closedShiftsMap") || "{}"); }
    catch (e) { return {}; }
  }
  function setClosed(id, isClosed) {
    var map = getClosedMap();
    if (isClosed) map[String(id)] = true;
    else delete map[String(id)];
    localStorage.setItem("closedShiftsMap", JSON.stringify(map));
  }
  function isClosed(id) {
    var map = getClosedMap();
    return !!map[String(id)];
  }

  function esc(s) {
    // לשימוש בטקסט בלבד (לא innerHTML)
    return (s == null) ? "" : String(s);
  }

  function buildShiftObj(r) {
    return {
      id: r.id,
      title: r.k_name,
      city: r.city,
      address: "",
      date: r.shift_date,
      start: r.start_time,
      end: r.end_time,
      wage: r.wage,
      type: "גן",
      hours: "",
      urgent: !!r.urgent,
      ages: "",
      requirements: r.notes || ""
    };
  }

  function renderRows(rows) {
    postsEl.innerHTML = "";

    if (!rows || rows.length === 0) {
      show(emptyStateEl);
      return;
    }
    hide(emptyStateEl);

    rows.forEach(function (r) {
      var closed = isClosed(r.id);

      var article = document.createElement("article");
      article.className = "post";
      article.setAttribute("data-post-id", r.id);

      // Header
      var head = document.createElement("div");
      head.className = "post-head";

      var left = document.createElement("div");
      var strong = document.createElement("strong");
      strong.textContent = esc(r.k_name);

      var meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = "📍 " + esc(r.city) + " | 📅 " + esc(r.shift_date) + " | " + esc(r.start_time) + "-" + esc(r.end_time);

      left.appendChild(strong);
      left.appendChild(meta);

      var right = document.createElement("div");
      right.className = "right";
      var status = document.createElement("span");

      if (closed) {
        status.className = "status closed";
        status.textContent = "סגורה";
      } else if (r.urgent) {
        status.className = "status urgent";
        status.textContent = "דחוף";
      } else {
        status.className = "status open";
        status.textContent = "פתוחה";
      }

      right.appendChild(status);
      head.appendChild(left);
      head.appendChild(right);

      // Meta2
      var meta2 = document.createElement("div");
      meta2.className = "meta2";
      meta2.textContent = "💰 " + esc(r.wage) + "₪/שעה | 👶 " + esc(r.kids) + " ילדים | ☎ " + esc(r.phone);

      // Actions
      var actions = document.createElement("div");
      actions.className = "post-actions";

      var btnView = document.createElement("button");
      btnView.type = "button";
      btnView.className = "btn smallbtn viewDetails";
      btnView.textContent = "צפייה בפרטים";

      var btnClose = document.createElement("button");
      btnClose.type = "button";
      btnClose.className = "btn closeShift";
      btnClose.textContent = closed ? "פתח מחדש" : "סגור משמרת";

      var note = document.createElement("span");
      note.className = "small note";

      btnView.addEventListener("click", function () {
        var shiftObj = buildShiftObj(r);
        localStorage.setItem("selectedShift", JSON.stringify(shiftObj));
        window.location.href = "shift_details.html";
      });

      btnClose.addEventListener("click", function () {
        var nowClosed = !isClosed(r.id);
        setClosed(r.id, nowClosed);

        // עדכון UI
        if (nowClosed) {
          status.className = "status closed";
          status.textContent = "סגורה";
          btnClose.textContent = "פתח מחדש";
          toast("המשמרת נסגרה ✅");
        } else {
          if (r.urgent) {
            status.className = "status urgent";
            status.textContent = "דחוף";
          } else {
            status.className = "status open";
            status.textContent = "פתוחה";
          }
          btnClose.textContent = "סגור משמרת";
          toast("המשמרת נפתחה ✅");
        }
      });

      actions.appendChild(btnView);
      actions.appendChild(btnClose);
      actions.appendChild(note);

      article.appendChild(head);
      article.appendChild(meta2);
      article.appendChild(actions);

      postsEl.appendChild(article);
    });
  }

  function loadRows() {
    fetch("dashboard_api.php", { method: "GET" })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data || !data.ok) {
          show(emptyStateEl);
          emptyStateEl.textContent = "שגיאה בטעינת נתונים מהשרת.";
          show(emptyStateEl);
          return;
        }
        renderRows(data.rows || []);
      })
      .catch(function () {
        show(emptyStateEl);
        emptyStateEl.textContent = "לא ניתן לטעון נתונים. ודא שהאתר רץ דרך שרת PHP.";
      });
  }

  // מועמדויות מה-localStorage (כמו שהיה לך)
  function loadApplications() {
    var el = document.getElementById("myApplications");
    if (!el) return;

    var arr = [];
    try { arr = JSON.parse(localStorage.getItem("myApplications") || "[]"); }
    catch (e) { arr = []; }

    if (!arr.length) {
      el.innerHTML = "<div class='msg info'>אין עדיין מועמדויות.</div>";
      return;
    }

    // רינדור בסיסי
    var html = "";
    for (var i = 0; i < arr.length; i++) {
      var a = arr[i] || {};
      html += "<div class='app'>";
      html += "<strong>" + esc(a.title || "משמרת") + "</strong>";
      html += "<div class='small'>" + esc(a.city || "") + " | " + esc(a.date || "") + " | " + esc(a.start || "") + "-" + esc(a.end || "") + "</div>";
      html += "</div>";
    }
    el.innerHTML = html;
  }

  loadRows();
  loadApplications();
})();
