
<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);
$message = $data["message"] ?? "Hello";

$payload = [
  "model" => "llama3-70b-8192",
  "messages" => [
    [
      "role" => "system",
      "content" => "Tum Jarvis ho. Chhote aur futuristic jawab do. Agar code maange to code bhi do."
    ],
    [
      "role" => "user",
      "content" => $message
    ]
  ]
];

$ch = curl_init("https://api.groq.com/openai/v1/chat/completions");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  "Content-Type: application/json",
  "Authorization: Bearer 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"
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

$result = curl_exec($ch);
curl_close($ch);

echo $result;
?>
