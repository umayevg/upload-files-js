import uniqid from 'uniqid';

const element = (tag, classes = [], content) => {
  const node = document.createElement(tag)

  if (classes.length) {
    node.classList.add(...classes)
  }

  if (content) {
    node.textContent = content
  }

  return node
}

function noop() {
}

export function upload(selector, options = {}) {
  let files = []
  const onUpload = options.onUpload ? options.onUpload : noop
  const input = document.querySelector(selector)
  const preview = element('div', ['preview'])
  const openBtn = element('button', ['btn'], 'Open')
  const uploadBtn = element('button', ['btn', 'primary'], 'Upload')
  uploadBtn.style.display = 'none'

  if (options.multipleFiles) {
    input.setAttribute("multiple", true)
  }

  if (options.accept && Array.isArray(options.accept)) {
    input.setAttribute("accept", options.accept.join(','))
  }

  input.insertAdjacentElement("afterend", preview)
  input.insertAdjacentElement("afterend", uploadBtn)
  input.insertAdjacentElement("afterend", openBtn)

  const triggerInput = () => input.click()


  const changeHandler = (event) => {
    if (!event.target.files.length) return

    files = Array.from(event.target.files)

    preview.innerHTML = ''
    uploadBtn.style.display = 'inline'

    files.forEach(file => {
      file.uniqId = uniqid()
      if (!file.type.match('image')) return

      const reader = new FileReader()

      reader.onload = ev => {
        const src = ev.target.result
        preview.insertAdjacentHTML('afterbegin', `
          <div class="preview-image">
            <div class="preview-remove" data-name="${file.uniqId}">&times;</div>
            <img src="${src}" alt="${file.name}">
            <div class="preview-info">
                <span>${file.name}</span>
                ${bytesToSize(file.size)}
            </div>
          </div>
        `)
      }

      reader.readAsDataURL(file)

    })


  };
  const removeHandler = ev => {
    if (!ev.target.dataset.name) return
    const {name} = ev.target.dataset
    files = files.filter(file => file.uniqId !== name)

    if (!files.length) {
      uploadBtn.style.display = 'none'
    }

    const block = preview.querySelector(`[data-name="${name}"]`)
      .closest('.preview-image')

    block.classList.add('removing')
    setTimeout(() => block.remove(), 300)
  }

  const clearPreview = el => {
    el.style.bottom = '4px'
    el.innerHTML = '<div class="preview-info-progress"></div>'
  }

  const uploadHandler = ev => {
    preview.querySelectorAll('.preview-remove').forEach(el => el.remove())
    const previewInfo = preview.querySelectorAll('.preview-info')
    previewInfo.forEach(clearPreview)
    onUpload(files)
  }

  openBtn.addEventListener("click", triggerInput)
  input.addEventListener("change", changeHandler)
  preview.addEventListener('click', removeHandler)
  uploadBtn.addEventListener('click', uploadHandler)
}


function bytesToSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (!bytes) return '0 Byte'
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
  return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i]
}