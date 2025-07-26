const App = {
  init() {
    this.instanceEl = document.querySelector('input[name="instance"]');
    if (!this.instanceEl) return;

    this.searchEl = document.querySelector('input[name="search"]');
    this.configsEl = document.querySelector("#configs");
    this.cards = this.configsEl.querySelectorAll(".card");
    this.bindEvents();
    this.updateInstanceUrl();
    this.initDynamicForms();
  },

  bindEvents() {
    this.searchEl.addEventListener("input", this.filterConfigs.bind(this));
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

  filterConfigs() {
    const query = this.searchEl.value.toLowerCase();
    this.cards.forEach((card) => {
      const title = card.querySelector(".card-title").innerText.toLowerCase();
      if (title.includes(query)) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });
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
    const path = this.getPath(target);
    if (path) {
      target.href = `${this.getInstanceUrl()}${path}`;
    } else {
      event.preventDefault();
    }
  },

  async handleCopyClick(event) {
    const { target } = event;
    const path = this.getPath(target);
    if (!path) return;

    const href = `${this.getInstanceUrl()}${path}`;

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

  initDynamicForms() {
    document
      .querySelectorAll("[data-dynamic-form]")
      .forEach((formContainer) => {
        const form = formContainer.querySelector("form");
        const pathPreview = formContainer.querySelector("[data-path-preview]");
        const actionButtons = formContainer.querySelectorAll(
          "[data-path-template]",
        );

        if (!form || !pathPreview || !(pathPreview instanceof HTMLElement))
          return;

        const updateDynamicPath = () => {
          const formData = new FormData(form);
          const firstButton = actionButtons[0];
          if (!(firstButton instanceof HTMLElement)) return;

          let pathTemplate = firstButton.dataset.pathTemplate || "";
          let pathPreviewTemplate = pathTemplate;

          for (const [key, value] of formData.entries()) {
            if (typeof value === "string") {
              const placeholder = `{${key}}`;
              pathTemplate = pathTemplate.replace(
                placeholder,
                encodeURIComponent(value),
              );
              pathPreviewTemplate = pathPreviewTemplate.replace(
                placeholder,
                value || `{${key}}`,
              );
            }
          }

          actionButtons.forEach((button) => {
            if (button instanceof HTMLElement) {
              button.dataset.path = pathTemplate;
            }
          });
          pathPreview.innerText = pathPreviewTemplate;
        };

        form.addEventListener("input", updateDynamicPath);
        updateDynamicPath(); // Initial update
      });
  },

  getPath(target) {
    if (!(target instanceof HTMLElement)) return null;

    if (target.dataset.path) {
      return target.dataset.path;
    }

    if (target.dataset.pathTemplate) {
      const formContainer = target.closest("[data-dynamic-form]");
      if (!formContainer) return null;

      const form = formContainer.querySelector("form");
      if (!form) return null;

      const formData = new FormData(form);
      let path = target.dataset.pathTemplate;
      let allParamsFilled = true;

      for (const [key, value] of formData.entries()) {
        if (!value) {
          allParamsFilled = false;
        }
        if (typeof value === "string") {
          path = path.replace(`{${key}}`, encodeURIComponent(value));
        }
      }

      return allParamsFilled ? path : null;
    }

    return null;
  },
};

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
