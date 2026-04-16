/* ============================================================
   JARVIS PRO — app.js
   Abuzar ke liye banaya gaya — 3 Features Only
   ============================================================ */

"use strict";

// ============================================================
//  KEYS & INIT
// ============================================================
const LS = {
  get: k => localStorage.getItem('jarvis_' + k),
  set: (k, v) => localStorage.setItem('jarvis_' + k, v),
};

function getKeys() {
  return {
    groq:   LS.get('groq')   || '',
    gemini: LS.get('gemini') || '',
    github: LS.get('github') || '',
    repo:   LS.get('repo')   || '',
  };
}

window.addEventListener('DOMContentLoaded', () => {
  const keys = getKeys();
  if (!keys.groq) {
    show('setup-screen');
    hide('app');
  } else {
    hide('setup-screen');
    show('app');
    bootJarvis();
  }
});

function saveSetup() {
  const groq   = val('setup-groq');
  const gemini = val('setup-gemini');
  const github = val('setup-github');
  const repo   = val('setup-repo');
  if (!groq) { alert('Groq API key zaroori hai!'); return; }
  LS.set('groq',   groq);
  LS.set('gemini', gemini);
  LS.set('github', github);
  LS.set('repo',   repo);
  hide('setup-screen');
  show('app');
  bootJarvis();
}

function bootJarvis() {
  animateCore('JARVIS', 'ONLINE');
  setTimeout(() => animateCore('READY', 'ABUZAR'), 2000);
}

// ============================================================
//  UTILS
// ============================================================
function val(id) { return (document.getElementById(id)?.value || '').trim(); }
function show(id) { document.getElementById(id)?.classList.remove('hidden'); }
function hide(id) { document.getElementById(id)?.classList.add('hidden'); }
function animateCore(t, s) {
  const cl = document.getElementById('core-label');
  const cs = document.getElementById('core-sub');
  if (cl) cl.textContent = t;
  if (cs) cs.textContent = s;
}

// ============================================================
//  TAB SWITCHING
// ============================================================
const TABS = ['chat', 'builder', 'movie'];

function switchTab(tab) {
  TABS.forEach(t => {
    const panel = document.getElementById('panel-' + t);
    const nav   = document.getElementById('nav-' + t);
    if (t === tab) {
      panel?.classList.remove('hidden');
      panel?.classList.add('active');
      nav?.classList.add('active');
    } else {
      panel?.classList.add('hidden');
      panel?.classList.remove('active');
      nav?.classList.remove('active');
    }
  });
  const labels = { chat: ['CHAT', 'AI MODE'], builder: ['BUILD', 'APP MODE'], movie: ['MOVIE', 'SCENE MODE'] };
  animateCore(labels[tab][0], labels[tab][1]);
}

// ============================================================
//  FEATURE 1 — CHAT AI (Groq + Hindi)
// ============================================================
const chatHistory = [];

async function sendChat() {
  const input = document.getElementById('chat-input');
  const msg   = input.value.trim();
  if (!msg) return;
  input.value = '';

  addMsg('user', msg, 'A');
  chatHistory.push({ role: 'user', content: msg });

  const thinkingId = addMsg('jarvis', `<div class="loading-dots"><span></span><span></span><span></span></div>`, 'J', true);

  try {
    const keys = getKeys();
    const res  = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${keys.groq}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `Aap JARVIS PRO hain — Abuzar ke personal AI assistant. Hamesha Hindi/Urdu mein jawab do (Hinglish theek hai). Friendly, smart, helpful raho. Lagta hai Iron Man ka JARVIS — confident, witty. Short answers prefer karo unless detail chahiye.`
          },
          ...chatHistory.slice(-10)
        ],
        max_tokens: 800,
        temperature: 0.75,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Groq API error');
    }

    const data   = await res.json();
    const reply  = data.choices?.[0]?.message?.content || 'Kuch samajh nahi aaya...';
    chatHistory.push({ role: 'assistant', content: reply });

    removeMsg(thinkingId);
    addMsg('jarvis', reply, 'J');
  } catch (e) {
    removeMsg(thinkingId);
    addMsg('jarvis', `❌ Error: ${e.message}`, 'J');
  }
}

let msgCounter = 0;

function addMsg(type, content, avatar, isTemp = false) {
  const id   = 'msg-' + (++msgCounter);
  const wrap = document.getElementById('chat-messages');
  const div  = document.createElement('div');
  div.className = `msg ${type}`;
  div.id = id;
  div.innerHTML = `
    <div class="msg-avatar">${avatar}</div>
    <div class="msg-bubble">${content}</div>
  `;
  wrap.appendChild(div);
  wrap.scrollTop = wrap.scrollHeight;
  return id;
}

function removeMsg(id) {
  document.getElementById(id)?.remove();
}

// ============================================================
//  FEATURE 2 — APP BUILDER (Drag & Drop)
// ============================================================
let dragType = null;
let canvasComponents = []; // { type, id, label }

function dragStart(e) {
  dragType = e.currentTarget.dataset.type;
}

function dragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
}

function dropComp(e) {
  e.preventDefault();
  if (!dragType) return;

  const hint = document.getElementById('drop-hint');
  if (hint) hint.style.display = 'none';

  const id   = 'dc-' + Date.now();
  const comp = { type: dragType, id };
  canvasComponents.push(comp);

  const el = createCompEl(comp);
  document.getElementById('phone-screen').appendChild(el);
  dragType = null;
}

function createCompEl(comp) {
  const wrap = document.createElement('div');
  wrap.className = 'dropped-comp';
  wrap.id = comp.id;
  wrap.onclick = () => removeCompEl(comp.id);

  switch (comp.type) {
    case 'button':
      wrap.innerHTML = `<button class="dc-button" contenteditable="true" onclick="event.stopPropagation()">Button</button>`;
      break;
    case 'text':
      wrap.innerHTML = `<div class="dc-text" contenteditable="true">Text Label yahan hai</div>`;
      break;
    case 'header':
      wrap.innerHTML = `<div class="dc-header" contenteditable="true">App Title</div>`;
      break;
    case 'image':
      wrap.innerHTML = `<div class="dc-image" style="display:flex">🖼️</div>`;
      break;
    case 'input':
      wrap.innerHTML = `<input class="dc-input" placeholder="Yahan type karo..." onclick="event.stopPropagation()" />`;
      break;
  }
  return wrap;
}

function removeCompEl(id) {
  document.getElementById(id)?.remove();
  canvasComponents = canvasComponents.filter(c => c.id !== id);
  if (canvasComponents.length === 0) {
    const hint = document.getElementById('drop-hint');
    if (hint) hint.style.display = 'flex';
  }
}

function clearCanvas() {
  const screen = document.getElementById('phone-screen');
  screen.innerHTML = `<div class="drop-hint" id="drop-hint">⬇ Yahan component drop karo</div>`;
  canvasComponents = [];
  hide('generated-code-wrap');
}

function generateCode() {
  const screen = document.getElementById('phone-screen');
  const comps  = screen.querySelectorAll('.dropped-comp');
  if (!comps.length) { alert('Pehle koi component drop karo!'); return; }

  let html = `<!DOCTYPE html>\n<html lang="hi">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Meri App</title>\n  <style>\n    body { font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 16px; }\n    button { background: #1a73e8; color: #fff; padding: 10px 18px; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; display: block; width: 100%; margin: 8px 0; }\n    input { width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; margin: 8px 0; box-sizing: border-box; }\n    h1 { font-size: 20px; border-bottom: 1px solid #eee; padding-bottom: 8px; }\n    p { font-size: 14px; color: #555; margin: 8px 0; }\n  </style>\n</head>\n<body>\n`;

  comps.forEach(comp => {
    const type = comp.querySelector('[class^="dc-"]')?.className?.replace('dc-', '') || '';
    const content = comp.querySelector('[contenteditable]')?.textContent?.trim() || '';

    if (type === 'header') html += `  <h1>${content || 'App Title'}</h1>\n`;
    else if (type === 'text') html += `  <p>${content || 'Text yahan hai'}</p>\n`;
    else if (type === 'button') html += `  <button onclick="alert('Button clicked!')">${content || 'Button'}</button>\n`;
    else if (type === 'input') html += `  <input type="text" placeholder="Yahan type karo..." />\n`;
    else if (type === 'image') html += `  <img src="https://via.placeholder.com/300x120" alt="Image" style="width:100%;border-radius:8px;margin:8px 0" />\n`;
  });

  html += `</body>\n</html>`;

  document.getElementById('generated-code').textContent = html;
  show('generated-code-wrap');
}

function copyCode() {
  const code = document.getElementById('generated-code').textContent;
  navigator.clipboard?.writeText(code).then(() => {
    const btn = event.target;
    btn.textContent = '✅ Copied!';
    setTimeout(() => btn.textContent = '📋 Copy Code', 2000);
  });
}

// ============================================================
//  FEATURE 3 — MOVIE MAKER (Story → Scenes via Groq)
// ============================================================
async function generateMovie() {
  const story  = val('story-input');
  const style  = document.getElementById('movie-style').value;
  const scenes = parseInt(document.getElementById('scene-count').value) || 4;

  if (!story || story.length < 20) { alert('Thodi lambi kahani likho — kam se kam 20 characters!'); return; }

  const btn = document.querySelector('.movie-btn');
  btn.textContent = '⏳ Scenes ban rahe hain...';
  btn.disabled = true;

  const styleDesc = {
    cartoon: 'colorful cartoon animation like Disney/Looney Tunes',
    anime:   'detailed Japanese anime style',
    pixar:   'warm Pixar 3D animation style with expressive characters',
    comic:   'bold comic book panels with thick outlines and halftone dots'
  }[style];

  const prompt = `Tum ek cinematic scene writer ho. Yeh story ke liye exactly ${scenes} scenes banao:

STORY: "${story}"

VISUAL STYLE: ${styleDesc}

Respond in JSON ONLY (no markdown, no extra text):
{
  "title": "Movie ka naam",
  "tagline": "Short tagline Hindi mein",
  "scenes": [
    {
      "number": 1,
      "title": "Scene ka naam",
      "description": "Kya ho raha hai 2-3 sentences Hindi mein",
      "visual_prompt": "Detailed visual description for ${styleDesc} — characters, colors, lighting, camera angle in English"
    }
  ]
}`;

  try {
    const keys = getKeys();
    const res  = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${keys.groq}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a cinematic scene writer. Always respond with valid JSON only. No markdown fences.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.85,
      }),
    });

    if (!res.ok) throw new Error('Groq API error: ' + res.status);

    const data = await res.json();
    let raw    = data.choices?.[0]?.message?.content || '{}';
    raw = raw.replace(/```json|```/g, '').trim();

    let parsed;
    try { parsed = JSON.parse(raw); }
    catch { throw new Error('JSON parse failed — AI ka response galat tha'); }

    renderScenes(parsed);
  } catch (e) {
    alert('Error: ' + e.message);
  } finally {
    btn.textContent = '🎬 SCENE GENERATE KARO';
    btn.disabled = false;
  }
}

function renderScenes(data) {
  const container = document.getElementById('scenes-output');
  container.innerHTML = '';

  const header = document.createElement('div');
  header.style.cssText = 'text-align:center;margin-bottom:16px';
  header.innerHTML = `
    <div style="font-family:var(--ff-hud);font-size:16px;color:var(--gold);letter-spacing:3px;font-weight:800">${data.title || 'MY MOVIE'}</div>
    <div style="font-family:var(--ff-body);font-size:13px;color:var(--white-dim);margin-top:4px">${data.tagline || ''}</div>
  `;
  container.appendChild(header);

  (data.scenes || []).forEach((scene, i) => {
    const card = document.createElement('div');
    card.className = 'scene-card';
    card.style.animationDelay = (i * 0.1) + 's';
    card.innerHTML = `
      <div class="scene-num">SCENE ${scene.number || (i + 1)}</div>
      <div class="scene-title">${scene.title || 'Scene ' + (i + 1)}</div>
      <div class="scene-desc">${scene.description || ''}</div>
      ${scene.visual_prompt ? `<div class="scene-visual">🎨 ${scene.visual_prompt}</div>` : ''}
    `;
    container.appendChild(card);
  });

  show('scenes-output');
  container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================================
//  SETTINGS
// ============================================================
function openSettings() {
  const keys = getKeys();
  document.getElementById('s-groq').value   = keys.groq;
  document.getElementById('s-gemini').value = keys.gemini;
  document.getElementById('s-github').value = keys.github;
  document.getElementById('s-repo').value   = keys.repo;
  hide('update-status');
  show('settings-modal');
}

function saveSettings() {
  LS.set('groq',   document.getElementById('s-groq').value.trim());
  LS.set('gemini', document.getElementById('s-gemini').value.trim());
  LS.set('github', document.getElementById('s-github').value.trim());
  LS.set('repo',   document.getElementById('s-repo').value.trim());
  closeSettings();
  showToast('✅ Settings saved!');
}

function closeSettings() {
  hide('settings-modal');
}

// ============================================================
//  SELF UPDATE (Gemini API → GitHub)
// ============================================================
async function selfUpdate() {
  const keys = getKeys();
  if (!keys.gemini) { alert('Gemini API key set karo pehle!'); return; }
  if (!keys.github || !keys.repo) { alert('GitHub token aur repo set karo!'); return; }

  const statusEl = document.getElementById('update-status');
  statusEl.className = 'update-status';
  statusEl.textContent = '⏳ Gemini se improvements fetch ho rahi hain...';
  show('update-status');

  try {
    // Step 1: Ask Gemini for improvement suggestions
    const gemRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${keys.gemini}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are improving JARVIS PRO — a single-page PWA. 
              
Current features: Chat AI (Groq), App Builder (drag-drop), Movie Maker (story→scenes).
Current version uses: Deep navy theme, gold accents, HUD design, localStorage keys.

Suggest ONE small but meaningful JavaScript improvement that:
1. Adds a useful feature or UX enhancement
2. Is max 15 lines of code
3. Does NOT break existing features

Respond ONLY with valid JSON:
{
  "improvement": "What this adds",
  "js_snippet": "the actual JS code to add",
  "inject_after": "exact function name after which to add this"
}
No markdown, no explanation outside JSON.`
            }]
          }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
        })
      }
    );

    if (!gemRes.ok) throw new Error('Gemini API error: ' + gemRes.status);
    const gemData = await gemRes.json();
    let raw = gemData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    raw = raw.replace(/```json|```/g, '').trim();

    let suggestion;
    try { suggestion = JSON.parse(raw); }
    catch { throw new Error('Gemini ka response parse nahi hua'); }

    statusEl.textContent = `⏳ GitHub pe push ho raha hai: "${suggestion.improvement}"...`;

    // Step 2: Get current app.js from GitHub
    const repoPath = `https://api.github.com/repos/${keys.repo}/contents/app.js`;
    const getRes   = await fetch(repoPath, {
      headers: {
        'Authorization': `Bearer ${keys.github}`,
        'Accept': 'application/vnd.github+json',
      }
    });

    if (!getRes.ok) throw new Error('GitHub se app.js fetch nahi hua (status: ' + getRes.status + ')');
    const fileData = await getRes.json();
    const sha      = fileData.sha;
    const current  = atob(fileData.content.replace(/\n/g, ''));

    // Step 3: Inject snippet
    const injected = current + `\n\n/* ---- AUTO UPDATE: ${suggestion.improvement} ---- */\n${suggestion.js_snippet}\n`;
    const encoded  = btoa(unescape(encodeURIComponent(injected)));

    // Step 4: Push to GitHub
    const pushRes = await fetch(repoPath, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${keys.github}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `🤖 JARVIS Auto-Update: ${suggestion.improvement}`,
        content: encoded,
        sha: sha,
      })
    });

    if (!pushRes.ok) {
      const err = await pushRes.json();
      throw new Error('GitHub push failed: ' + (err.message || pushRes.status));
    }

    statusEl.className = 'update-status ok';
    statusEl.innerHTML = `✅ Update successful!<br>📝 ${suggestion.improvement}<br>🐙 GitHub pe push ho gaya!`;

  } catch (e) {
    statusEl.className = 'update-status err';
    statusEl.textContent = '❌ Error: ' + e.message;
  }
}

// ============================================================
//  TOAST
// ============================================================
function showToast(msg) {
  const t = document.createElement('div');
  t.style.cssText = `
    position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
    background:var(--navy-card); border:1px solid var(--gold);
    color:var(--gold); padding:10px 20px; border-radius:20px;
    font-family:var(--ff-hud); font-size:12px; letter-spacing:1.5px;
    z-index:9999; box-shadow:0 4px 20px rgba(240,192,64,0.2);
    animation:panel-in 0.3s ease;
  `;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}
