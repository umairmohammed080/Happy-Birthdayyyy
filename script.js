// Simple interactive birthday wishes site
const messagesEl = document.getElementById('messages');
const nameInput = document.getElementById('name');
const msgInput = document.getElementById('message');
const sendBtn = document.getElementById('send');
const confettiBtn = document.getElementById('confettiBtn');
const publicSave = document.getElementById('publicSave');

// Load messages from localStorage
const STORAGE_KEY = 'birthday_wishes_messages_v1';
let messages = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

function render() {
  messagesEl.innerHTML = '';
  if (messages.length === 0) {
    messagesEl.innerHTML = '<div class="msg">No wishes yet — be the first!</div>';
    return;
  }
  messages.slice().reverse().forEach(m => {
    const d = document.createElement('div');
    d.className = 'msg';
    d.innerHTML = `<div class="meta">${escapeHtml(m.name || 'Anonymous')} — ${new Date(m.t).toLocaleString()}</div><div class="text">${escapeHtml(m.text)}</div>`;
    messagesEl.appendChild(d);
  });
}

function escapeHtml(s){ return String(s).replace(/[&<>\"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":"&#39;" }[c])); }

sendBtn.addEventListener('click', ()=>{
  const text = msgInput.value.trim();
  if(!text) return;
  const entry = { name: nameInput.value.trim(), text, t: Date.now() };
  messages.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  render();
  msgInput.value = '';

  if(publicSave.checked){
    // create shareable URL containing the latest message encoded (small, client-side only)
    const encoded = encodeURIComponent(btoa(JSON.stringify(entry)));
    const url = `${location.origin}${location.pathname}#msg=${encoded}`;
    navigator.clipboard?.writeText(url);
    alert('Shareable link copied to clipboard!');
  }
});

confettiBtn.addEventListener('click', ()=>{
  // lightweight confetti effect
  runConfetti();
});

// Parse share link on load
(function(){
  const hash = location.hash;
  if(hash.startsWith('#msg=')){
    try{
      const payload = JSON.parse(atob(decodeURIComponent(hash.slice(5))));
      messages.push(Object.assign({t:Date.now()}, payload));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      render();
      runConfetti();
      setTimeout(()=>{ location.hash = ''; }, 1000);
    }catch(e){console.warn(e)}
  }
})();

// simple confetti implementation
function runConfetti(){
  const COUNT = 40;
  for(let i=0;i<COUNT;i++){
    const el = document.createElement('div');
    el.style.position = 'fixed';
    el.style.left = Math.random()*100 + '%';
    el.style.top = '-10px';
    el.style.width = '10px';
    el.style.height = '14px';
    el.style.background = `hsl(${Math.random()*360} 80% 60%)`;
    el.style.opacity = '0.95';
    el.style.borderRadius = '2px';
    el.style.transform = `rotate(${Math.random()*360}deg)`;
    el.style.zIndex = 9999;
    document.body.appendChild(el);
    const fall = el.animate([
      { transform: `translateY(0) rotate(0)`, opacity:1 },
      { transform: `translateY(${window.innerHeight + 50}px) rotate(720deg)`, opacity:0.8 }
    ], { duration: 2000 + Math.random()*1500, easing:'cubic-bezier(.2,.8,.2,1)' });
    fall.onfinish = ()=> el.remove();
  }
}

render();
