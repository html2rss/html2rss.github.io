;(function() {
  "use strict"

  const instanceEl = document.querySelector('input[name="instance"]')

  function instanceUrl() {
    const url = instanceEl.value

    return url.substr(-1) === "/" ? url : `${url}/`
  }

  function onChangeInstanceUrl() {
    const url = instanceUrl()

    Array.from(document.querySelectorAll(".instance")).forEach(function(el) {
      el.innerText = url
    })
  }

  function onShowClick(event) {
    event.target.href = [instanceUrl(), event.target.dataset.path].join("")
    return false
  }

  function onCopyClick(event) {
    const href = [instanceUrl(), event.target.dataset.path].join("")
    const el = document.createElement("span")
    el.classList.add("js__copy-element")
    el.innerText = href

    document.body.appendChild(el)
    copyElementContents(el, event.target)
    return false
  }

  function copyElementContents(el, triggerEl) {
    el.focus()
    window.getSelection().selectAllChildren(el)
    document.execCommand("copy")

    triggerEl.classList.add("copied")
    window.setTimeout(function() {
      el.blur()
      el.remove()
      triggerEl.classList.remove("copied")
      triggerEl.blur()
    }, 1000)
  }

  // init
  document.querySelector("#configs").addEventListener("click", event => {
    if (event.target.dataset.bindClick === "show") {
      return onShowClick(event)
    } else if (event.target.dataset.bindClick === "copy") {
      return onCopyClick(event)
    }
  })

  instanceEl.addEventListener("blur", onChangeInstanceUrl)
  onChangeInstanceUrl()
})()
