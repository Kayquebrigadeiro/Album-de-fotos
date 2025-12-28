// App principal atualizado: adiciona opção "Ocasião especial" e descrição no upload
// Mantém fitas, notas manuscritas e animação de virar página (flip)
// Mantém upload, IndexedDB e export/import
import { dbAddPhoto, dbGetAllPhotos, dbClearAll, dbBulkAdd } from './db.js'
import { generateThumbnail } from './utils.js'

const PHOTOS_PER_PAGE = 8

export function App() {
  const container = document.createElement('div')
  container.className = 'min-h-screen py-8 px-4 bg-amber-50 flex justify-center'

  container.innerHTML = `
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
              <button id="uploadBtn" class="btn-primary">💾 Salvar</button>
              <button id="clearBtn" class="btn-secondary">🗑️ Limpar</button>
              <button id="exportBtn" class="btn-accent">📥 Exportar</button>
              <input id="importFile" type="file" accept="application/json" class="ml-2 inline-block" />
              <button id="toggleNotes" title="Mostrar / esconder notas" class="btn-page ml-2">📝 Notas</button>
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
  `

  // elementos
  const fileInput = container.querySelector('#fileInput')
  const uploadBtn = container.querySelector('#uploadBtn')
  const clearBtn = container.querySelector('#clearBtn')
  const exportBtn = container.querySelector('#exportBtn')
  const importFile = container.querySelector('#importFile')
  const toggleNotesBtn = container.querySelector('#toggleNotes')
  const galleryFront = container.querySelector('#gallery-front')
  const galleryBack = container.querySelector('#gallery-back')
  const albumFrame = container.querySelector('.album-frame')
  const flipContainer = container.querySelector('.flip-container')
  const prevBtn = container.querySelector('#prevBtn')
  const nextBtn = container.querySelector('#nextBtn')
  const pageIndicator = container.querySelector('#pageIndicator')
  const modalRoot = container.querySelector('#modalRoot')

  // inputs adicionais
  const titleInput = container.querySelector('#title')
  const dateInput = container.querySelector('#date')
  const tagsInput = container.querySelector('#tags')
  const descInput = container.querySelector('#desc')
  const specialInput = container.querySelector('#special')

  // estado
  let photosAll = []
  let currentPage = 0
  let totalPages = 1
  let notesVisible = true
  let frontIsCurrent = true // indica se front tem a página atual

  async function refreshGallery() {
    photosAll = await dbGetAllPhotos()
    photosAll.sort((a,b) => (b.date || '').localeCompare(a.date || ''))
    totalPages = Math.max(1, Math.ceil(photosAll.length / PHOTOS_PER_PAGE))
    currentPage = Math.min(currentPage, totalPages - 1)
    pageIndicator.textContent = `${currentPage + 1} / ${totalPages}`

    // preenche front ou back dependendo de frontIsCurrent
    const pageHtml = buildPagePhotos(currentPage)
    if (frontIsCurrent) {
      galleryFront.innerHTML = ''
      galleryFront.append(...pageHtml)
    } else {
      galleryBack.innerHTML = ''
      galleryBack.append(...pageHtml)
    }
  }

  function buildPagePhotos(pageIndex) {
    const elements = []
    const start = pageIndex * PHOTOS_PER_PAGE
    const slice = photosAll.slice(start, start + PHOTOS_PER_PAGE)
    slice.forEach(p => {
      const card = document.createElement('article')
      const angle = (Math.random() * 8) - 4
      card.className = 'polaroid'
      card.style.setProperty('--angle', `${angle}deg`)

      // montar notas e fitas
      const noteHtml = (notesVisible && p.description) ? `<div class="sticky-note">${escapeHtml(shortText(p.description, 90))}</div>` : ''
      const ribbonHtml = p.special ? `<div class="ribbon">Especial</div>` : `<div class="ribbon">Memória</div>`

      card.innerHTML = `
        ${p.special ? '<div class="special-badge">Ocasião</div>' : ''}
        ${ribbonHtml}
        <a href="#" class="block photo-link">
          <div class="photo-frame">
            <img src="${p.thumb}" alt="${escapeHtml(p.title || '')}" />
          </div>
        </a>
        <div class="caption">
          <strong>${escapeHtml(p.title || p.date || '')}</strong>
          <div class="meta">${escapeHtml(p.date || '')} ${p.tags?.length ? ' • ' + escapeHtml(p.tags.join(', ')) : ''}</div>
        </div>
        ${noteHtml}
      `
      // abrir modal ao clicar
      card.querySelector('.photo-link').addEventListener('click', (e) => {
        e.preventDefault()
        openModal(p)
      })
      elements.push(card)
    })
    // se houver menos que PHOTOS_PER_PAGE, preencher com espaços vazios para visual consistente
    const missing = PHOTOS_PER_PAGE - slice.length
    for (let i=0;i<missing;i++){
      const placeholder = document.createElement('div')
      placeholder.className = ''
      elements.push(placeholder)
    }
    return elements
  }

  // trocar para nova página com animação de virar
  async function changePage(toPage) {
    if (toPage < 0 || toPage >= totalPages || toPage === currentPage) return
    const nextPage = toPage
    // preparar a face oposta com o conteúdo da próxima página
    frontIsCurrent = !frontIsCurrent
    const targetGallery = frontIsCurrent ? galleryFront : galleryBack
    targetGallery.innerHTML = ''
    targetGallery.append(...buildPagePhotos(nextPage))

    // iniciar animação: adicionar classe 'is-flipping' na album-frame
    albumFrame.classList.add('is-flipping')
    // aguardar término da transição (use timeout seguro)
    await waitMs(750)

    // animação concluída: atualizar estado e remover classe
    currentPage = nextPage
    pageIndicator.textContent = `${currentPage + 1} / ${totalPages}`
    albumFrame.classList.remove('is-flipping')
    // frontIsCurrent já invertido no início da função
  }

  function waitMs(ms) {
    return new Promise(res => setTimeout(res, ms))
  }

  function openModal(photo) {
    modalRoot.innerHTML = `
      <div id="overlay" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div class="bg-white max-w-3xl w-full p-4 rounded shadow-lg">
          <div class="flex justify-between items-start">
            <h3 class="text-lg font-semibold">${escapeHtml(photo.title || photo.date)}</h3>
            <button id="closeModal" class="text-gray-600">Fechar ✕</button>
          </div>
          <div class="mt-4">
            <img src="${photo.data}" alt="${escapeHtml(photo.title || '')}" class="w-full rounded" />
            <p class="text-sm text-gray-600 mt-2">${escapeHtml(photo.description || '')}</p>
            <p class="text-xs text-gray-500 mt-2">Data: ${escapeHtml(photo.date || '')} ${photo.tags?.length ? ' • Tags: ' + escapeHtml(photo.tags.join(', ') ) : ''}</p>
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
  uploadBtn.addEventListener('click', async (e) => {
    e.preventDefault()
    const file = fileInput.files[0]
    if (!file) {
      alert('Escolha uma imagem primeiro')
      return
    }
    const title = titleInput.value.trim()
    const date = dateInput.value || (new Date()).toISOString().slice(0,10)
    const tags = tagsInput.value.split(',').map(t => t.trim()).filter(Boolean)
    const desc = descInput.value.trim()
    const special = specialInput.checked

    const dataURL = await toDataURL(file)
    const thumb = await generateThumbnail(dataURL, 800)
    await dbAddPhoto({
      data: dataURL,
      thumb,
      title,
      date,
      tags,
      description: desc,
      special: special ? true : false,
      filename: file.name
    })

    // limpa form
    fileInput.value = ''
    titleInput.value = ''
    dateInput.value = ''
    tagsInput.value = ''
    descInput.value = ''
    specialInput.checked = false

    await refreshGallery()
  })

  clearBtn.addEventListener('click', async (e) => {
    e.preventDefault()
    if (!confirm('Apagar todas as fotos salvas localmente?')) return
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
      const text = await f.text()
      const parsed = JSON.parse(text)
      if (!parsed.photos || !Array.isArray(parsed.photos)) {
        alert('Arquivo inválido')
        return
      }
      await dbBulkAdd(parsed.photos)
      await refreshGallery()
      alert('Importação concluída')
    } catch (err) {
      console.error(err)
      alert('Erro ao importar: ' + err.message)
    } finally {
      importFile.value = ''
    }
  })

  toggleNotesBtn.addEventListener('click', async (e) => {
    e.preventDefault()
    notesVisible = !notesVisible
    await refreshGallery()
  })

  prevBtn.addEventListener('click', (e) => {
    e.preventDefault()
    const target = Math.max(0, currentPage - 1)
    changePage(target)
  })
  nextBtn.addEventListener('click', (e) => {
    e.preventDefault()
    const target = Math.min(totalPages - 1, currentPage + 1)
    changePage(target)
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

  // util: escape e utilidades
  function escapeHtml(str){
    return String(str || '').replace(/[&<>"'`=\/]/g, function(s) {
      return ({
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;','`':'&#x60;','=':'&#x3D;'
      })[s]
    })
  }
  function shortText(s, n) {
    if (!s) return ''
    return s.length > n ? s.slice(0, n-1) + '…' : s
  }

  // init
  refreshGallery()

  return container
}