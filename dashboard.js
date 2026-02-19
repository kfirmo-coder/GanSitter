$(document).ready(function () {
  function toast(msg) {
    $("#toast").text(msg).fadeIn(150).delay(900).fadeOut(200);
  }

  $(document).on("click", ".viewDetails", function () {
    var raw = $(this).closest(".post").attr("data-shift");
    if (!raw) return;
    try {
      var s = JSON.parse(raw);
      localStorage.setItem("selectedShift", JSON.stringify(s));
      window.location.href = "ShiftDetails.html?id=" + encodeURIComponent(s.id);
    } catch (e) {
      alert("שגיאה בקריאת הנתונים");
    }
  });

  $(document).on("click", ".closeShift", function () {
    var post = $(this).closest(".post");
    post.find(".status").removeClass("open urgent").addClass("closed").text("נסגרה");
    $(this).prop("disabled", true).addClass("gray");
    post.find(".note").text("עודכן בלי רענון מלא");
    toast("המשמרת נסגרה");
  });

  function loadMyApps() {
    var raw = localStorage.getItem("appliedShifts");
    var arr = [];
    if (raw) { try { arr = JSON.parse(raw); } catch (e) { arr = []; } }

    if (!arr || arr.length === 0) {
      $("#myApplications").html('<div class="small">עדיין אין מועמדויות.</div>');
      return;
    }

    var html = "";
    for (var i = 0; i < arr.length; i++) {
      var a = arr[i];
      html += '<div class="app">';
      html += '<div class="t">' + a.title + '</div>';
      html += '<div class="m">📍 ' + a.city + ' | 📅 ' + a.date + ' | 💰 ' + a.wage + '₪/שעה</div>';
      html += "</div>";
    }
    $("#myApplications").html(html);
  }

  function loadPostsFromStaticData() {
    var shifts = Array.isArray(window.SHIFTS) ? window.SHIFTS : [];
    var wrap = $("#myPostsWrap");

    if (!wrap.length) return;

    if (!shifts.length) {
      $("#noPostsMsg").show();
      return;
    }

    $("#noPostsMsg").hide();

    var html = "";
    for (var i = 0; i < shifts.length; i++) {
      var r = shifts[i];

      html += '<article class="post" data-post-id="' + r.id + '" data-shift=\'' + JSON.stringify(r).replace(/'/g, "&apos;") + '\'>';
      html += '<div class="post-head">';
      html += '<div>';
      html += '<strong>' + r.title + '</strong>';
      html += '<div class="meta">📍 ' + r.city + ' | 📅 ' + r.date + ' | ' + r.start + '-' + r.end + '</div>';
      html += '</div>';
      html += '<div class="right">';
      if (r.urgent) html += '<span class="status urgent">דחוף</span>';
      else html += '<span class="status open">פתוחה</span>';
      html += '</div>';
      html += '</div>';

      html += '<div class="meta2">💰 ' + r.wage + '₪/שעה</div>';

      html += '<div class="post-actions">';
      html += '<button type="button" class="btn smallbtn viewDetails">צפייה בפרטים</button>';
      html += '<button type="button" class="btn closeShift">סגור משמרת</button>';
      html += '<span class="small note"></span>';
      html += '</div>';

      html += '</article>';
    }

    wrap.html(html);
  }

  loadPostsFromStaticData();
  loadMyApps();
});
