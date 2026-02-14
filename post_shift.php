<?php
// ========= process_post_shift.php =========
// מקבל POST מהטופס, ולידציות צד שרת, INSERT ל-DB, ואז Redirect לדשבורד

require_once __DIR__ . "/Includes/db.php";

if ($conn instanceof mysqli) {
  $conn->set_charset("utf8mb4");
}

function h($s) {
  return htmlspecialchars($s ?? "", ENT_QUOTES, "UTF-8");
}

function show_error_page($title, $errors = []) {
  http_response_code(400);
  echo "<!doctype html><html lang='he' dir='rtl'><head><meta charset='utf-8'>";
  echo "<meta name='viewport' content='width=device-width,initial-scale=1'>";
  echo "<title>" . h($title) . "</title></head>";
  echo "<body style='font-family:Arial;max-width:900px;margin:20px auto;padding:0 14px;line-height:1.5'>";
  echo "<h2>" . h($title) . "</h2>";
  if (!empty($errors)) {
    echo "<ul>";
    foreach ($errors as $e) echo "<li>" . h($e) . "</li>";
    echo "</ul>";
  }
  echo "<p><a href='post_shift.html'>חזרה לטופס</a></p>";
  echo "</body></html>";
  exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  show_error_page("גישה לא תקינה", ["Method not allowed"]);
}

// קליטת נתונים
$k_name     = trim($_POST["k_name"] ?? "");
$city       = trim($_POST["city"] ?? "");
$shift_date = trim($_POST["shift_date"] ?? "");
$start_time = trim($_POST["start_time"] ?? "");
$end_time   = trim($_POST["end_time"] ?? "");
$wage       = trim($_POST["wage"] ?? "");
$kids       = trim($_POST["kids"] ?? "");
$phone      = trim($_POST["phone"] ?? "");
$urgent     = isset($_POST["urgent"]) ? 1 : 0;
$notes      = trim($_POST["notes"] ?? "");

// ולידציות צד שרת
$errors = [];

if ($k_name === "") $errors[] = "חובה למלא שם גן";
if ($city === "") $errors[] = "חובה לבחור עיר";
if ($shift_date === "") $errors[] = "חובה לבחור תאריך";
if ($start_time === "" || $end_time === "") $errors[] = "חובה לבחור שעות";

if ($wage === "" || !is_numeric($wage) || (int)$wage < 30 || (int)$wage > 100) {
  $errors[] = "השכר חייב להיות בין 30 ל-100";
}
if ($kids === "" || !is_numeric($kids) || (int)$kids < 1 || (int)$kids > 60) {
  $errors[] = "מספר ילדים לא תקין";
}
if (!preg_match('/^05\d-?\d{7}$/', $phone)) {
  $errors[] = "טלפון לא תקין (לדוגמה 0501234567)";
}

$today = date("Y-m-d");
if ($shift_date !== "" && $shift_date < $today) {
  $errors[] = "התאריך לא יכול להיות בעבר";
}
if ($start_time !== "" && $end_time !== "" && $end_time <= $start_time) {
  $errors[] = "שעת סיום חייבת להיות אחרי שעת התחלה";
}

if (!empty($errors)) {
  show_error_page("שגיאה בפרטי הטופס", $errors);
}

// INSERT
$sql = "INSERT INTO shifts
  (k_name, city, shift_date, start_time, end_time, wage, kids, phone, urgent, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
if (!$stmt) {
  show_error_page("שגיאת מערכת", ["כשל בהכנת השאילתה. בדוק טבלה/שמות עמודות/חיבור DB."]);
}

$wage_i = (int)$wage;
$kids_i = (int)$kids;

// 5x s, 2x i, s, i, s  => "sssssiiisis" (בלי רווחים)
$stmt->bind_param(
  "sssssiiisis",
  $k_name,
  $city,
  $shift_date,
  $start_time,
  $end_time,
  $wage_i,
  $kids_i,
  $phone,
  $urgent,
  $notes
);

if (!$stmt->execute()) {
  $stmt->close();
  show_error_page("שגיאת מערכת", ["שמירה נכשלה. בדוק חיבור DB וטבלת shifts."]);
}

$stmt->close();

header("Location: dashboard.php?saved=1");
exit;
