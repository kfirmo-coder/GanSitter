<?php
// ========= dashboard_api.php =========
// תפקיד: מחזיר נתוני משמרות מה-DB בפורמט JSON (לשימוש ב-dashboard.js בלבד)
// הערה: זה לא דף שמציג HTML. זה "API" פנימי למסך dashboard.html

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . "/Includes/db.php";

if ($conn instanceof mysqli) {
  $conn->set_charset("utf8mb4");
}

function out($ok, $payload = [], $code = 200) {
  http_response_code($code);
  echo json_encode(array_merge(["ok" => $ok], $payload), JSON_UNESCAPED_UNICODE);
  exit;
}

$sql = "SELECT id, k_name, city, shift_date, start_time, end_time, wage, kids, phone, urgent, notes, created_at
        FROM shifts
        ORDER BY created_at DESC
        LIMIT 20";

$res = $conn->query($sql);
if (!$res) {
  out(false, ["error" => "DB query failed"], 500);
}

$rows = [];
while ($r = $res->fetch_assoc()) {
  $rows[] = [
    "id" => (int)$r["id"],
    "k_name" => (string)$r["k_name"],
    "city" => (string)$r["city"],
    "shift_date" => (string)$r["shift_date"],
    "start_time" => (string)$r["start_time"],
    "end_time" => (string)$r["end_time"],
    "wage" => (int)$r["wage"],
    "kids" => (int)$r["kids"],
    "phone" => (string)$r["phone"],
    "urgent" => ((int)$r["urgent"] === 1),
    "notes" => (string)$r["notes"],
    "created_at" => (string)$r["created_at"]
  ];
}

$res->free();
out(true, ["rows" => $rows]);
