(function(){const l=document.createElement("link").relList;if(l&&l.supports&&l.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))u(a);new MutationObserver(a=>{for(const n of a)if(n.type==="childList")for(const c of n.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&u(c)}).observe(document,{childList:!0,subtree:!0});function s(a){const n={};return a.integrity&&(n.integrity=a.integrity),a.referrerPolicy&&(n.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?n.credentials="include":a.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function u(a){if(a.ep)return;a.ep=!0;const n=s(a);fetch(a.href,n)}})();const K="album-db",g="photos",Q=1;function B(){return new Promise((t,l)=>{const s=indexedDB.open(K,Q);s.onupgradeneeded=u=>{const a=u.target.result;a.objectStoreNames.contains(g)||a.createObjectStore(g,{keyPath:"id",autoIncrement:!0})},s.onsuccess=()=>t(s.result),s.onerror=()=>l(s.error)})}async function W(t){const l=await B();return new Promise((s,u)=>{const c=l.transaction(g,"readwrite").objectStore(g).add({...t,createdAt:new Date().toISOString()});c.onsuccess=()=>s(c.result),c.onerror=()=>u(c.error)})}async function C(){const t=await B();return new Promise((l,s)=>{const n=t.transaction(g,"readonly").objectStore(g).getAll();n.onsuccess=()=>l(n.result),n.onerror=()=>s(n.error)})}async function X(){const t=await B();return new Promise((l,s)=>{const n=t.transaction(g,"readwrite").objectStore(g).clear();n.onsuccess=()=>l(),n.onerror=()=>s(n.error)})}async function Y(t){const l=await B();return new Promise((s,u)=>{const a=l.transaction(g,"readwrite"),n=a.objectStore(g);let c=0;t.forEach(b=>{const m=n.add({...b,importedAt:new Date().toISOString()});m.onsuccess=()=>{c++,c===t.length&&s()},m.onerror=x=>{console.error("Erro ao adicionar item",x)}}),a.oncomplete=()=>{},a.onerror=()=>u(a.error)})}async function Z(t,l=600){return new Promise((s,u)=>{const a=new Image;a.onload=()=>{const n=a.width/a.height,c=Math.min(l,a.width),b=Math.round(c/n),m=document.createElement("canvas");m.width=c,m.height=b;const x=m.getContext("2d");x.fillStyle="#fff",x.fillRect(0,0,c,b),x.drawImage(a,0,0,c,b);const M=m.toDataURL("image/jpeg",.85);s(M)},a.onerror=n=>u(n),a.src=t})}const k=8;function ee(){const t=document.createElement("div");t.className="min-h-screen py-8 px-4 bg-amber-50 flex justify-center",t.innerHTML=`
    <div class="max-w-6xl w-full">
      <header class="text-center mb-6">
        <h1 class="text-4xl font-semibold">Meu Álbum</h1>
        <p class="text-sm text-gray-600">Toque nas fotos para ver em detalhe — as imagens ficam salvas localmente</p>
      </header>

      <section class="album-frame mb-6">
        <div class="album-top-controls">
          <form id="uploadForm" class="flex flex-wrap gap-2 items-end w-full">
            <div>
              <label class="block text-sm font-medium mb-1">Imagem</label>
              <input type="file" id="fileInput" accept="image/*" class="block" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Título</label>
              <input id="title" class="border rounded p-2" placeholder="Ex: Natal 2024" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Data</label>
              <input id="date" type="date" class="border rounded p-2" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Tags</label>
              <input id="tags" class="border rounded p-2" placeholder="natal, familia" />
            </div>

            <div class="w-full sm:w-auto">
              <label class="block text-sm font-medium mb-1">Descrição (opcional)</label>
              <input id="desc" class="border rounded p-2 w-full" placeholder="Breve descrição / nota" />
            </div>

            <div class="flex items-center gap-2 ml-2">
              <input id="special" type="checkbox" class="h-4 w-4" />
              <label for="special" class="text-sm">Ocasião especial?</label>
            </div>

            <div class="ml-auto flex gap-2">
              <button id="uploadBtn" class="bg-amber-600 text-white px-4 py-2 rounded">Salvar</button>
              <button id="clearBtn" class="bg-gray-200 px-3 py-2 rounded">Limpar</button>
              <button id="exportBtn" class="bg-blue-600 text-white px-3 py-2 rounded">Exportar</button>
              <input id="importFile" type="file" accept="application/json" class="ml-2 inline-block" />
              <button id="toggleNotes" title="Mostrar / esconder notas" class="btn-page ml-2">Notas</button>
            </div>
          </form>
        </div>

        <div class="flip-wrapper relative">
          <div class="flip-container">
            <div class="page front">
              <div id="gallery-front" class="album-grid"></div>
            </div>
            <div class="page back">
              <div id="gallery-back" class="album-grid"></div>
            </div>
          </div>
        </div>

        <div class="mt-4 flex justify-between items-center">
          <div class="text-sm text-gray-500">Dica: clique nas fotos para abrir em tamanho real</div>
          <div class="page-controls">
            <button id="prevBtn" class="btn-page">◀ Anterior</button>
            <div class="page-indicator" id="pageIndicator">1 / 1</div>
            <button id="nextBtn" class="btn-page">Próxima ▶</button>
          </div>
        </div>
      </section>

      <footer class="text-center text-sm text-gray-500">
        <small>Álbum estático — exporte para salvar em outros dispositivos</small>
      </footer>

      <div id="modalRoot"></div>
    </div>
  `;const l=t.querySelector("#fileInput"),s=t.querySelector("#uploadBtn"),u=t.querySelector("#clearBtn"),a=t.querySelector("#exportBtn"),n=t.querySelector("#importFile"),c=t.querySelector("#toggleNotes"),b=t.querySelector("#gallery-front"),m=t.querySelector("#gallery-back"),x=t.querySelector(".album-frame");t.querySelector(".flip-container");const M=t.querySelector("#prevBtn"),U=t.querySelector("#nextBtn"),O=t.querySelector("#pageIndicator"),w=t.querySelector("#modalRoot"),$=t.querySelector("#title"),j=t.querySelector("#date"),A=t.querySelector("#tags"),T=t.querySelector("#desc"),N=t.querySelector("#special");let L=[],v=0,h=1,I=!0,q=!0;async function S(){L=await C(),L.sort((r,o)=>(o.date||"").localeCompare(r.date||"")),h=Math.max(1,Math.ceil(L.length/k)),v=Math.min(v,h-1),O.textContent=`${v+1} / ${h}`;const e=R(v);q?(b.innerHTML="",b.append(...e)):(m.innerHTML="",m.append(...e))}function R(e){const r=document.createDocumentFragment(),o=e*k,d=L.slice(o,o+k);d.forEach(i=>{var F;const f=document.createElement("article"),E=Math.random()*8-4;f.className="polaroid",f.style.setProperty("--angle",`${E}deg`);const D=I&&i.description?`<div class="sticky-note">${p(V(i.description,90))}</div>`:"",P=i.special?'<div class="ribbon">Especial</div>':'<div class="ribbon">Memória</div>';f.innerHTML=`
        ${i.special?'<div class="special-badge">Ocasião</div>':""}
        ${P}
        <a href="#" class="block photo-link">
          <div class="photo-frame">
            <img src="${i.thumb}" alt="${p(i.title||"")}" />
          </div>
        </a>
        <div class="caption">
          <strong>${p(i.title||i.date||"")}</strong>
          <div class="meta">${p(i.date||"")} ${(F=i.tags)!=null&&F.length?" • "+p(i.tags.join(", ")):""}</div>
        </div>
        ${D}
      `,f.querySelector(".photo-link").addEventListener("click",z=>{z.preventDefault(),_(i)}),r.appendChild(f)});const y=k-d.length;for(let i=0;i<y;i++){const f=document.createElement("div");f.className="",r.appendChild(f)}return r}async function H(e){if(e<0||e>=h||e===v)return;const r=e;q=!q;const o=q?b:m;o.innerHTML="",o.append(...R(r)),x.classList.add("is-flipping"),await G(750),v=r,O.textContent=`${v+1} / ${h}`,x.classList.remove("is-flipping")}function G(e){return new Promise(r=>setTimeout(r,e))}function _(e){var r;w.innerHTML=`
      <div id="overlay" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div class="bg-white max-w-3xl w-full p-4 rounded shadow-lg">
          <div class="flex justify-between items-start">
            <h3 class="text-lg font-semibold">${p(e.title||e.date)}</h3>
            <button id="closeModal" class="text-gray-600">Fechar ✕</button>
          </div>
          <div class="mt-4">
            <img src="${e.data}" alt="${p(e.title||"")}" class="w-full rounded" />
            <p class="text-sm text-gray-600 mt-2">${p(e.description||"")}</p>
            <p class="text-xs text-gray-500 mt-2">Data: ${p(e.date||"")} ${(r=e.tags)!=null&&r.length?" • Tags: "+p(e.tags.join(", ")):""}</p>
          </div>
        </div>
      </div>
    `,w.querySelector("#closeModal").addEventListener("click",()=>{w.innerHTML=""}),w.querySelector("#overlay").addEventListener("click",o=>{o.target.id==="overlay"&&(w.innerHTML="")})}s.addEventListener("click",async e=>{e.preventDefault();const r=l.files[0];if(!r){alert("Escolha uma imagem primeiro");return}const o=$.value.trim(),d=j.value||new Date().toISOString().slice(0,10),y=A.value.split(",").map(P=>P.trim()).filter(Boolean),i=T.value.trim(),f=N.checked,E=await J(r),D=await Z(E,800);await W({data:E,thumb:D,title:o,date:d,tags:y,description:i,special:!!f,filename:r.name}),l.value="",$.value="",j.value="",A.value="",T.value="",N.checked=!1,await S()}),u.addEventListener("click",async e=>{e.preventDefault(),confirm("Apagar todas as fotos salvas localmente?")&&(await X(),await S())}),a.addEventListener("click",async e=>{e.preventDefault();const r=await C(),o=new Blob([JSON.stringify({photos:r},null,2)],{type:"application/json"}),d=URL.createObjectURL(o),y=document.createElement("a");y.href=d,y.download=`album-export-${new Date().toISOString().slice(0,10)}.json`,document.body.appendChild(y),y.click(),y.remove(),URL.revokeObjectURL(d)}),n.addEventListener("change",async e=>{const r=e.target.files[0];if(r)try{const o=await r.text(),d=JSON.parse(o);if(!d.photos||!Array.isArray(d.photos)){alert("Arquivo inválido");return}await Y(d.photos),await S(),alert("Importação concluída")}catch(o){console.error(o),alert("Erro ao importar: "+o.message)}finally{n.value=""}}),c.addEventListener("click",async e=>{e.preventDefault(),I=!I,await S()}),M.addEventListener("click",e=>{e.preventDefault();const r=Math.max(0,v-1);H(r)}),U.addEventListener("click",e=>{e.preventDefault();const r=Math.min(h-1,v+1);H(r)});function J(e){return new Promise((r,o)=>{const d=new FileReader;d.onload=()=>r(d.result),d.onerror=o,d.readAsDataURL(e)})}function p(e){return String(e||"").replace(/[&<>"'`=\/]/g,function(r){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;","`":"&#x60;","=":"&#x3D;"}[r]})}function V(e,r){return e?e.length>r?e.slice(0,r-1)+"…":e:""}return S(),t}const te=document.getElementById("app");te.appendChild(ee());
