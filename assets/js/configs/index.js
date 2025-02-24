;(() => {
  const instanceEl = document.querySelector('input[name="instance"]')

  function instanceUrl() {
    const url = instanceEl.value

    return url.substr(-1) === "/" ? url : `${url}/`
  }

  function onChangeInstanceUrl() {
    const url = instanceUrl()

    Array.from(document.querySelectorAll(".instance")).forEach((el) => {
      el.innerText = url
    })
  }

  function onShowClick({ target }) {
    target.href = [instanceUrl(), target.dataset.path].join("")
    return false
  }

  function onCopyClick({ target }) {
    const href = [instanceUrl(), target.dataset.path].join("")
    const el = document.createElement("span")
    el.classList.add("js__copy-element")
    el.innerText = href

    document.body.appendChild(el)
    copyElementContents(el, target)
    return false
  }

  function copyElementContents(el, triggerEl) {
    el.focus()
    window.getSelection().selectAllChildren(el)
    document.execCommand("copy")

    triggerEl.classList.add("copied")
    window.setTimeout(() => {
      el.blur()
      el.remove()
      triggerEl.classList.remove("copied")
      triggerEl.blur()
    }, 1000)
  }

  // init
  document.querySelector("#configs").addEventListener("click", (event) => {
    if (event.target.dataset.bindClick === "show") {
      return onShowClick(event)
    } else if (event.target.dataset.bindClick === "copy") {
      return onCopyClick(event)
    }
  })

  instanceEl.addEventListener("blur", onChangeInstanceUrl)
  onChangeInstanceUrl()
})()
