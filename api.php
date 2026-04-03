<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$ch = curl_init("https://api.groq.com/openai/v1/chat/completions");

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  "Content-Type: application/json",
  "Authorization: Bearer TUMHARI_API_KEY"
]);

curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
  "model" => "llama3-70b-8192",
  "messages" => [
    [
      "role" => "user",
      "content" => $data["message"]
    ]
  ]
]));

$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>
