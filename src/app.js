// App principal atualizado: adiciona opção "Ocasião especial" e descrição no upload
// Mantém fitas, notas manuscritas e animação de virar página (flip)
// Mantém upload, IndexedDB e export/import
import { dbAddPhoto, dbGetAllPhotos, dbClearAll, dbBulkAdd } from './db.js'
import { generateThumbnail } from './utils.js'

const PHOTOS_PER_PAGE = 8

export function App() {
  const container = document.createElement('div')
  container.className = 'min-h-screen'

  container.innerHTML = `
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
  `

  // elementos
  const fileInput = container.querySelector('#fileInput')
  const uploadBtn = container.querySelector('#uploadBtn')
  const clearBtn = container.querySelector('#clearBtn')
  const exportBtn = container.querySelector('#exportBtn')
  const importFile = container.querySelector('#importFile')
  const toggleNotesBtn = container.querySelector('#toggleNotes')
  const toggleUploadBtn = container.querySelector('#toggleUpload')
  const closeUploadBtn = container.querySelector('#closeUpload')
  const cancelBtn = container.querySelector('#cancelBtn')
  const addFirstPhotoBtn = container.querySelector('#addFirstPhoto')
  const uploadPanel = container.querySelector('#uploadPanel')
  const gallery = container.querySelector('#gallery')
  const emptyState = container.querySelector('#emptyState')
  const modalRoot = container.querySelector('#modalRoot')
  const preview = container.querySelector('#preview')
  const loading = container.querySelector('#loading')

  // inputs
  const titleInput = container.querySelector('#title')
  const dateInput = container.querySelector('#date')
  const tagsInput = container.querySelector('#tags')
  const descInput = container.querySelector('#desc')
  const specialInput = container.querySelector('#special')

  // estado
  let photosAll = []
  let notesVisible = true
  let selectedFile = null

  async function refreshGallery() {
    loading.classList.remove('hidden')
    photosAll = await dbGetAllPhotos()
    photosAll.sort((a,b) => (b.date || '').localeCompare(a.date || ''))
    
    gallery.innerHTML = ''
    
    if (photosAll.length === 0) {
      emptyState.classList.remove('hidden')
      gallery.classList.add('hidden')
    } else {
      emptyState.classList.add('hidden')
      gallery.classList.remove('hidden')
      
      photosAll.forEach((p, index) => {
        const card = createPhotoCard(p, index)
        gallery.appendChild(card)
      })
    }
    
    loading.classList.add('hidden')
  }

  function createPhotoCard(photo, index) {
    const card = document.createElement('div')
    card.className = 'photo-card'
    card.style.animationDelay = `${index * 0.05}s`
    
    const noteHtml = (notesVisible && photo.description) 
      ? `<div class="photo-note">${escapeHtml(photo.description)}</div>` 
      : ''
    
    card.innerHTML = `
      ${photo.special ? '<div class="special-badge">⭐ Especial</div>' : ''}
      <div class="photo-image">
        <img src="${photo.thumb}" alt="${escapeHtml(photo.title || '')}" loading="lazy" />
        <div class="photo-overlay">
          <button class="view-btn" data-id="${photo.id}">🔍 Ver</button>
        </div>
      </div>
      <div class="photo-info">
        <h3>${escapeHtml(photo.title || 'Sem título')}</h3>
        <p class="photo-date">📅 ${escapeHtml(photo.date || '')}</p>
        ${photo.tags?.length ? `<div class="photo-tags">${photo.tags.map(t => `<span class="tag">#${escapeHtml(t)}</span>`).join('')}</div>` : ''}
        ${noteHtml}
      </div>
    `
    
    card.querySelector('.view-btn').addEventListener('click', () => openModal(photo))
    card.querySelector('.photo-image').addEventListener('click', () => openModal(photo))
    
    return card
  }

  function openModal(photo) {
    modalRoot.innerHTML = `
      <div id="overlay" class="modal-overlay">
        <div class="modal-content">
          <button id="closeModal" class="modal-close">×</button>
          <div class="modal-image">
            <img src="${photo.data}" alt="${escapeHtml(photo.title || '')}" />
          </div>
          <div class="modal-info">
            <h2>${escapeHtml(photo.title || 'Sem título')}</h2>
            ${photo.special ? '<span class="modal-badge">⭐ Ocasião Especial</span>' : ''}
            <p class="modal-date">📅 ${escapeHtml(photo.date || '')}</p>
            ${photo.description ? `<p class="modal-desc">${escapeHtml(photo.description)}</p>` : ''}
            ${photo.tags?.length ? `<div class="modal-tags">${photo.tags.map(t => `<span class="tag">#${escapeHtml(t)}</span>`).join('')}</div>` : ''}
          </div>
        </div>
      </div>
    `
    modalRoot.querySelector('#closeModal').addEventListener('click', () => { modalRoot.innerHTML = '' })
    modalRoot.querySelector('#overlay').addEventListener('click', (e) => {
      if (e.target.id === 'overlay') modalRoot.innerHTML = ''
    })
  }

  // handlers
  toggleUploadBtn.addEventListener('click', () => {
    uploadPanel.classList.remove('hidden')
  })

  closeUploadBtn.addEventListener('click', () => {
    uploadPanel.classList.add('hidden')
    resetForm()
  })

  cancelBtn.addEventListener('click', () => {
    uploadPanel.classList.add('hidden')
    resetForm()
  })

  addFirstPhotoBtn.addEventListener('click', () => {
    uploadPanel.classList.remove('hidden')
  })

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0]
    if (file) {
      selectedFile = file
      const reader = new FileReader()
      reader.onload = (e) => {
        preview.innerHTML = `<img src="${e.target.result}" alt="Preview" />`
        preview.classList.remove('hidden')
      }
      reader.readAsDataURL(file)
    }
  })

  uploadBtn.addEventListener('click', async (e) => {
    e.preventDefault()
    if (!selectedFile) {
      alert('📷 Escolha uma imagem primeiro')
      return
    }
    
    loading.classList.remove('hidden')
    const title = titleInput.value.trim()
    const date = dateInput.value || (new Date()).toISOString().slice(0,10)
    const tags = tagsInput.value.split(',').map(t => t.trim()).filter(Boolean)
    const desc = descInput.value.trim()
    const special = specialInput.checked

    const dataURL = await toDataURL(selectedFile)
    const thumb = await generateThumbnail(dataURL, 800)
    await dbAddPhoto({
      data: dataURL,
      thumb,
      title,
      date,
      tags,
      description: desc,
      special: special ? true : false,
      filename: selectedFile.name
    })

    resetForm()
    uploadPanel.classList.add('hidden')
    await refreshGallery()
  })

  function resetForm() {
    fileInput.value = ''
    titleInput.value = ''
    dateInput.value = ''
    tagsInput.value = ''
    descInput.value = ''
    specialInput.checked = false
    selectedFile = null
    preview.innerHTML = ''
    preview.classList.add('hidden')
  }

  clearBtn.addEventListener('click', async (e) => {
    e.preventDefault()
    if (!confirm('🗑️ Apagar todas as fotos salvas localmente?')) return
    loading.classList.remove('hidden')
    await dbClearAll()
    await refreshGallery()
  })

  exportBtn.addEventListener('click', async (e) => {
    e.preventDefault()
    const photos = await dbGetAllPhotos()
    const blob = new Blob([JSON.stringify({ photos }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `album-export-${new Date().toISOString().slice(0,10)}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  })

  importFile.addEventListener('change', async (e) => {
    const f = e.target.files[0]
    if (!f) return
    try {
      loading.classList.remove('hidden')
      const text = await f.text()
      const parsed = JSON.parse(text)
      if (!parsed.photos || !Array.isArray(parsed.photos)) {
        alert('❌ Arquivo inválido')
        return
      }
      await dbBulkAdd(parsed.photos)
      await refreshGallery()
      alert('✅ Importação concluída!')
    } catch (err) {
      console.error(err)
      alert('❌ Erro ao importar: ' + err.message)
    } finally {
      importFile.value = ''
    }
  })

  toggleNotesBtn.addEventListener('click', async (e) => {
    e.preventDefault()
    notesVisible = !notesVisible
    toggleNotesBtn.classList.toggle('active')
    await refreshGallery()
  })

  // util: file -> dataURL
  function toDataURL(file) {
    return new Promise((res, rej) => {
      const reader = new FileReader()
      reader.onload = () => res(reader.result)
      reader.onerror = rej
      reader.readAsDataURL(file)
    })
  }

  function escapeHtml(str){
    return String(str || '').replace(/[&<>"'`=\/]/g, function(s) {
      return ({
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;','`':'&#x60;','=':'&#x3D;'
      })[s]
    })
  }

  // init
  refreshGallery()

  return container
}