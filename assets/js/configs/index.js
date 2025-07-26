const App = {
  init() {
    this.instanceEl = document.querySelector('input[name="instance"]');
    if (!this.instanceEl) return;

    this.configsEl = document.querySelector("#configs");
    this.bindEvents();
    this.updateInstanceUrl();
  },

  bindEvents() {
    this.configsEl.addEventListener("click", (event) => {
      const { bindClick } = event.target.dataset;
      if (bindClick === "show") {
        this.handleShowClick(event);
      } else if (bindClick === "copy") {
        this.handleCopyClick(event);
      }
    });

    this.instanceEl.addEventListener("blur", this.updateInstanceUrl.bind(this));
  },

  getInstanceUrl() {
    const url = this.instanceEl.value;
    return url.endsWith("/") ? url : `${url}/`;
  },

  updateInstanceUrl() {
    const url = this.getInstanceUrl();
    document.querySelectorAll(".instance").forEach((el) => {
      if (el instanceof HTMLElement) {
        el.innerText = url;
      }
    });
  },

  handleShowClick(event) {
    const { target } = event;
    target.href = `${this.getInstanceUrl()}${target.dataset.path}`;
  },

  async handleCopyClick(event) {
    const { target } = event;
    const href = `${this.getInstanceUrl()}${target.dataset.path}`;

    try {
      await navigator.clipboard.writeText(href);
      this.showCopiedState(target);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  },

  showCopiedState(triggerEl) {
    triggerEl.classList.add("copied");
    setTimeout(() => {
      triggerEl.classList.remove("copied");
      triggerEl.blur();
    }, 1000);
  },
};

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
