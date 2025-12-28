(function(){const l=document.createElement("link").relList;if(l&&l.supports&&l.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))d(a);new MutationObserver(a=>{for(const o of a)if(o.type==="childList")for(const r of o.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&d(r)}).observe(document,{childList:!0,subtree:!0});function i(a){const o={};return a.integrity&&(o.integrity=a.integrity),a.referrerPolicy&&(o.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?o.credentials="include":a.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function d(a){if(a.ep)return;a.ep=!0;const o=i(a);fetch(a.href,o)}})();const z="album-db",m="photos",G=1;function x(){return new Promise((t,l)=>{const i=indexedDB.open(z,G);i.onupgradeneeded=d=>{const a=d.target.result;a.objectStoreNames.contains(m)||a.createObjectStore(m,{keyPath:"id",autoIncrement:!0})},i.onsuccess=()=>t(i.result),i.onerror=()=>l(i.error)})}async function J(t){const l=await x();return new Promise((i,d)=>{const r=l.transaction(m,"readwrite").objectStore(m).add({...t,createdAt:new Date().toISOString()});r.onsuccess=()=>i(r.result),r.onerror=()=>d(r.error)})}async function U(){const t=await x();return new Promise((l,i)=>{const o=t.transaction(m,"readonly").objectStore(m).getAll();o.onsuccess=()=>l(o.result),o.onerror=()=>i(o.error)})}async function V(){const t=await x();return new Promise((l,i)=>{const o=t.transaction(m,"readwrite").objectStore(m).clear();o.onsuccess=()=>l(),o.onerror=()=>i(o.error)})}async function K(t){const l=await x();return new Promise((i,d)=>{const a=l.transaction(m,"readwrite"),o=a.objectStore(m);let r=0;t.forEach(f=>{const v=o.add({...f,importedAt:new Date().toISOString()});v.onsuccess=()=>{r++,r===t.length&&i()},v.onerror=g=>{console.error("Erro ao adicionar item",g)}}),a.oncomplete=()=>{},a.onerror=()=>d(a.error)})}async function _(t,l=600){return new Promise((i,d)=>{const a=new Image;a.onload=()=>{const o=a.width/a.height,r=Math.min(l,a.width),f=Math.round(r/o),v=document.createElement("canvas");v.width=r,v.height=f;const g=v.getContext("2d");g.fillStyle="#fff",g.fillRect(0,0,r,f),g.drawImage(a,0,0,r,f);const $=v.toDataURL("image/jpeg",.85);i($)},a.onerror=o=>d(o),a.src=t})}function Q(){const t=document.createElement("div");t.className="min-h-screen",t.innerHTML=`
    <div class="app-container">
      <!-- Header fixo -->
      <header class="app-header">
        <div class="header-content">
          <div class="logo">
            <span class="logo-icon">📸</span>
            <h1>Meu Álbum</h1>
          </div>
          <div class="header-actions">
            <button id="toggleUpload" class="btn-icon" title="Adicionar foto">
              <span>➕</span>
            </button>
            <button id="exportBtn" class="btn-icon" title="Exportar">
              <span>📥</span>
            </button>
            <button id="toggleNotes" class="btn-icon" title="Notas">
              <span>📝</span>
            </button>
            <button id="clearBtn" class="btn-icon btn-danger" title="Limpar tudo">
              <span>🗑️</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Painel de upload (oculto por padrão) -->
      <div id="uploadPanel" class="upload-panel hidden">
        <div class="upload-content">
          <button id="closeUpload" class="close-btn">×</button>
          <h2>📷 Adicionar Nova Foto</h2>
          <form id="uploadForm" class="upload-form">
            <div class="file-upload-area">
              <input type="file" id="fileInput" accept="image/*" hidden />
              <label for="fileInput" class="file-upload-label">
                <span class="upload-icon">🖼️</span>
                <span>Clique ou arraste uma foto</span>
              </label>
              <div id="preview" class="preview-area hidden"></div>
            </div>
            
            <div class="form-grid">
              <div class="form-group">
                <label>🏷️ Título</label>
                <input id="title" type="text" placeholder="Ex: Natal 2024" />
              </div>
              
              <div class="form-group">
                <label>📅 Data</label>
                <input id="date" type="date" />
              </div>
              
              <div class="form-group full-width">
                <label>🏷 Tags</label>
                <input id="tags" type="text" placeholder="natal, familia, viagem" />
              </div>
              
              <div class="form-group full-width">
                <label>📝 Descrição</label>
                <textarea id="desc" rows="3" placeholder="Conte a história desta foto..."></textarea>
              </div>
              
              <div class="form-group full-width">
                <label class="checkbox-label">
                  <input id="special" type="checkbox" />
                  <span>⭐ Marcar como ocasião especial</span>
                </label>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="button" id="cancelBtn" class="btn-secondary">Cancelar</button>
              <button type="submit" id="uploadBtn" class="btn-primary">💾 Salvar Foto</button>
            </div>
          </form>
          
          <div class="import-section">
            <label for="importFile" class="import-label">
              📂 Importar álbum (JSON)
            </label>
            <input id="importFile" type="file" accept="application/json" />
          </div>
        </div>
      </div>

      <!-- Grid de fotos (Masonry layout) -->
      <main class="gallery-container">
        <div id="gallery" class="masonry-grid"></div>
        
        <div id="emptyState" class="empty-state">
          <div class="empty-icon">🖼️</div>
          <h2>Seu álbum está vazio</h2>
          <p>Comece adicionando suas primeiras memórias!</p>
          <button id="addFirstPhoto" class="btn-primary">➕ Adicionar Foto</button>
        </div>
      </main>

      <!-- Modal de visualização -->
      <div id="modalRoot"></div>
      
      <!-- Loading -->
      <div id="loading" class="loading hidden">
        <div class="spinner"></div>
      </div>
    </div>
  `;const l=t.querySelector("#fileInput"),i=t.querySelector("#uploadBtn"),d=t.querySelector("#clearBtn"),a=t.querySelector("#exportBtn"),o=t.querySelector("#importFile"),r=t.querySelector("#toggleNotes"),f=t.querySelector("#toggleUpload"),v=t.querySelector("#closeUpload"),g=t.querySelector("#cancelBtn"),$=t.querySelector("#addFirstPhoto"),y=t.querySelector("#uploadPanel"),w=t.querySelector("#gallery"),A=t.querySelector("#emptyState"),b=t.querySelector("#modalRoot"),q=t.querySelector("#preview"),h=t.querySelector("#loading"),D=t.querySelector("#title"),M=t.querySelector("#date"),O=t.querySelector("#tags"),F=t.querySelector("#desc"),N=t.querySelector("#special");let E=[],B=!0,L=null;async function S(){h.classList.remove("hidden"),E=await U(),E.sort((e,s)=>(s.date||"").localeCompare(e.date||"")),w.innerHTML="",E.length===0?(A.classList.remove("hidden"),w.classList.add("hidden")):(A.classList.add("hidden"),w.classList.remove("hidden"),E.forEach((e,s)=>{const n=j(e,s);w.appendChild(n)})),h.classList.add("hidden")}function j(e,s){var p;const n=document.createElement("div");n.className="photo-card",n.style.animationDelay=`${s*.05}s`;const c=B&&e.description?`<div class="photo-note">${u(e.description)}</div>`:"";return n.innerHTML=`
      ${e.special?'<div class="special-badge">⭐ Especial</div>':""}
      <div class="photo-image">
        <img src="${e.thumb}" alt="${u(e.title||"")}" loading="lazy" />
        <div class="photo-overlay">
          <button class="view-btn" data-id="${e.id}">🔍 Ver</button>
        </div>
      </div>
      <div class="photo-info">
        <h3>${u(e.title||"Sem título")}</h3>
        <p class="photo-date">📅 ${u(e.date||"")}</p>
        ${(p=e.tags)!=null&&p.length?`<div class="photo-tags">${e.tags.map(I=>`<span class="tag">#${u(I)}</span>`).join("")}</div>`:""}
        ${c}
      </div>
    `,n.querySelector(".view-btn").addEventListener("click",()=>R(e)),n.querySelector(".photo-image").addEventListener("click",()=>R(e)),n}function R(e){var s;b.innerHTML=`
      <div id="overlay" class="modal-overlay">
        <div class="modal-content">
          <button id="closeModal" class="modal-close">×</button>
          <div class="modal-image">
            <img src="${e.data}" alt="${u(e.title||"")}" />
          </div>
          <div class="modal-info">
            <h2>${u(e.title||"Sem título")}</h2>
            ${e.special?'<span class="modal-badge">⭐ Ocasião Especial</span>':""}
            <p class="modal-date">📅 ${u(e.date||"")}</p>
            ${e.description?`<p class="modal-desc">${u(e.description)}</p>`:""}
            ${(s=e.tags)!=null&&s.length?`<div class="modal-tags">${e.tags.map(n=>`<span class="tag">#${u(n)}</span>`).join("")}</div>`:""}
          </div>
        </div>
      </div>
    `,b.querySelector("#closeModal").addEventListener("click",()=>{b.innerHTML=""}),b.querySelector("#overlay").addEventListener("click",n=>{n.target.id==="overlay"&&(b.innerHTML="")})}f.addEventListener("click",()=>{y.classList.remove("hidden")}),v.addEventListener("click",()=>{y.classList.add("hidden"),P()}),g.addEventListener("click",()=>{y.classList.add("hidden"),P()}),$.addEventListener("click",()=>{y.classList.remove("hidden")}),l.addEventListener("change",e=>{const s=e.target.files[0];if(s){L=s;const n=new FileReader;n.onload=c=>{q.innerHTML=`<img src="${c.target.result}" alt="Preview" />`,q.classList.remove("hidden")},n.readAsDataURL(s)}}),i.addEventListener("click",async e=>{if(e.preventDefault(),!L){alert("📷 Escolha uma imagem primeiro");return}h.classList.remove("hidden");const s=D.value.trim(),n=M.value||new Date().toISOString().slice(0,10),c=O.value.split(",").map(H=>H.trim()).filter(Boolean),p=F.value.trim(),I=N.checked,k=await T(L),C=await _(k,800);await J({data:k,thumb:C,title:s,date:n,tags:c,description:p,special:!!I,filename:L.name}),P(),y.classList.add("hidden"),await S()});function P(){l.value="",D.value="",M.value="",O.value="",F.value="",N.checked=!1,L=null,q.innerHTML="",q.classList.add("hidden")}d.addEventListener("click",async e=>{e.preventDefault(),confirm("🗑️ Apagar todas as fotos salvas localmente?")&&(h.classList.remove("hidden"),await V(),await S())}),a.addEventListener("click",async e=>{e.preventDefault();const s=await U(),n=new Blob([JSON.stringify({photos:s},null,2)],{type:"application/json"}),c=URL.createObjectURL(n),p=document.createElement("a");p.href=c,p.download=`album-export-${new Date().toISOString().slice(0,10)}.json`,document.body.appendChild(p),p.click(),p.remove(),URL.revokeObjectURL(c)}),o.addEventListener("change",async e=>{const s=e.target.files[0];if(s)try{h.classList.remove("hidden");const n=await s.text(),c=JSON.parse(n);if(!c.photos||!Array.isArray(c.photos)){alert("❌ Arquivo inválido");return}await K(c.photos),await S(),alert("✅ Importação concluída!")}catch(n){console.error(n),alert("❌ Erro ao importar: "+n.message)}finally{o.value=""}}),r.addEventListener("click",async e=>{e.preventDefault(),B=!B,r.classList.toggle("active"),await S()});function T(e){return new Promise((s,n)=>{const c=new FileReader;c.onload=()=>s(c.result),c.onerror=n,c.readAsDataURL(e)})}function u(e){return String(e||"").replace(/[&<>"'`=\/]/g,function(s){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;","`":"&#x60;","=":"&#x3D;"}[s]})}return S(),t}const W=document.getElementById("app");W.appendChild(Q());
