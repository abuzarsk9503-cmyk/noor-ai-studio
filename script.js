const input = document.getElementById("input");
const send = document.getElementById("send");
const mic = document.getElementById("mic");
const chatArea = document.getElementById("chatArea");

function updateClock(){
  const now = new Date();
  document.getElementById("time").innerText = now.toLocaleTimeString();
  document.getElementById("date").innerText = now.toDateString();
}
setInterval(updateClock,1000);
updateClock();

function addUserMessage(text){
  chatArea.innerHTML += `<div class="user-msg">${text}</div>`;
}

function addJarvisMessage(text, code=""){
  chatArea.innerHTML += `
    <div class="jarvis-card">
      ${text}
      ${code ? `<div class="code-box">${code}</div>` : ""}
    </div>
  `;
  chatArea.scrollTop = chatArea.scrollHeight;
}

async function askJarvis(message){
  addUserMessage(message);
  addJarvisMessage("Jarvis soch raha hai...");

  try{
    const response = await fetch("https://YOUR-DOMAIN.com/api.php",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({message})
    });

    const data = await response.json();

    chatArea.lastElementChild.remove();

    const answer = data.choices?.[0]?.message?.content || "Koi jawab nahi mila";

    if(answer.includes("```")){
      const cleaned = answer.replace(/```/g, "");
      addJarvisMessage("Ji Abuzar, code aa gaya:", cleaned);
    } else {
      addJarvisMessage(answer);
    }

  }catch(err){
    chatArea.lastElementChild.remove();
    addJarvisMessage("API connect nahi hui. api.php ka URL check karo.");
  }
}

send.onclick = ()=>{
  if(input.value.trim()){
    askJarvis(input.value);
    input.value = "";
  }
}

input.addEventListener("keypress",e=>{
  if(e.key === "Enter") send.click();
});

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if(SpeechRecognition){
  const recognition = new SpeechRecognition();
  recognition.lang = "en-IN";

  mic.onclick = ()=>{
    mic.innerText = "🔴";
    recognition.start();
  }

  recognition.onresult = e=>{
    const text = e.results[0][0].transcript;
    input.value = text;
    send.click();
  }

  recognition.onend = ()=> mic.innerText = "🎤";
  }
