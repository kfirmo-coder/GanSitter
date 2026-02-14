<?php
// ========= shift_details_api.php =========
// תפקיד: מחזיר פרטי משמרת לפי ID מה-DB (לשימוש ב-shift_details.js בלבד)

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

$id = isset($_GET["id"]) ? (int)$_GET["id"] : 0;
if ($id <= 0) out(false, ["error" => "Missing id"], 400);

$stmt = $conn->prepare("
  SELECT id, k_name, city, shift_date, start_time, end_time, wage, kids, phone, urgent, notes
  FROM shifts
  WHERE id = ?
  LIMIT 1
");
if (!$stmt) out(false, ["error" => "DB prepare failed"], 500);

$stmt->bind_param("i", $id);
if (!$stmt->execute()) {
  $stmt->close();
  out(false, ["error" => "DB execute failed"], 500);
}

$res = $stmt->get_result();
$row = $res ? $res->fetch_assoc() : null;
$stmt->close();

if (!$row) out(false, ["error" => "Not found"], 404);

out(true, ["shift" => [
  "id" => (int)$row["id"],
  "title" => (string)$row["k_name"],
  "city" => (string)$row["city"],
  "address" => "",                       // אין אצלך DB לשדה כתובת כרגע
  "date" => (string)$row["shift_date"],
  "start" => (string)$row["start_time"],
  "end" => (string)$row["end_time"],
  "wage" => (int)$row["wage"],
  "type" => "גן",
  "ages" => "",                          // אין אצלך DB לשדה גילאים כרגע
  "requirements" => (string)$row["notes"],
  "urgent" => ((int)$row["urgent"] === 1)
]]);
