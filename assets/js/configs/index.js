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

  // init
  document.querySelector("#configs").addEventListener("click", event => {
    if (event.target.dataset.bindClick === "show") {
      return onShowClick(event)
    }
  })

  instanceEl.addEventListener("blur", onChangeInstanceUrl)
  onChangeInstanceUrl()
})()
