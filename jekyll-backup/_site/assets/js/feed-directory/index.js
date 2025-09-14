document.addEventListener("alpine:init", () => {
  Alpine.data("feedDirectory", () => ({
    instanceUrl: atob("aHR0cHM6Ly8xLmgyci53b3JrZXJzLmRldi8="),
    searchQuery: "",
    configs: window.feedDirectoryData,

    fuzzyMatch(text, query) {
      const lowerText = text.toLowerCase();
      const lowerQuery = query.toLowerCase();
      let textIndex = 0;
      let queryIndex = 0;

      while (queryIndex < lowerQuery.length && textIndex < lowerText.length) {
        if (lowerQuery[queryIndex] === lowerText[textIndex]) {
          queryIndex++;
        }
        textIndex++;
      }
      return queryIndex === lowerQuery.length;
    },

    filterConfig(configName) {
      if (!this.searchQuery) {
        return true;
      }
      return this.fuzzyMatch(configName, this.searchQuery);
    },

    getFeedUrl(config, params = {}) {
      let url = this.instanceUrl.endsWith("/")
        ? this.instanceUrl
        : `${this.instanceUrl}/`;
      url += `${config.domain}/${config.name}.rss`;

      const queryParams = new URLSearchParams();

      if (config.url_parameters) {
        for (const key of Object.keys(config.url_parameters)) {
          if (params[key]) {
            queryParams.append(key, params[key]);
          }
        }
      }

      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      return url;
    },
  }));

  Alpine.data("feedItemData", (index) => ({
    config: window.feedDirectoryData[index],
    params: {},
    pathPreview: "",
    showParamsForm: false,
    toggleParamsForm() {
      this.showParamsForm = !this.showParamsForm;
    },
    dynamicParamsInterpolate(string, params) {
      return string.replace(/%<(\w+)>s/g, (_, key) => {
        if (!(key in params)) {
          throw new Error(`Missing value for placeholder: ${key}`);
        }
        return params[key];
      });
    },

    initializeDefaultParameters() {
      Object.entries(this.config.url_parameters).forEach(([key, fallback]) => {
        const inputId = `${this.config.domain}-${this.config.name}-${key}`;
        const input = document.getElementById(inputId);

        if (input && this.config.default_parameters[key]) {
          // Set the actual value in the input field
          input.value = this.config.default_parameters[key];
          // Also set placeholder as fallback
          input.placeholder = this.config.default_parameters[key];
        }
      });

      // Now set params with default values (this will trigger the watcher)
      this.params = { ...this.config.default_parameters };
    },

    init() {
      if (!this.config) return;

      // Initialize params first
      this.params = {};

      // Set default values in input fields after DOM is ready
      if (this.config.default_parameters && !this.config.valid_channel_url) {
        this.$nextTick(() => {
          this.initializeDefaultParameters();
        });
      }

      if (!this.config.valid_channel_url) {
        this.$watch("params", (value) => {
          let params = {};

          Object.entries(this.config.url_parameters).forEach(
            ([key, fallback]) => {
              const val = value[key];
              params[key] = val || `{${fallback}}`;
            },
          );

          try {
            this.pathPreview = this.dynamicParamsInterpolate(
              this.config.channel.url,
              params,
            );
          } catch (error) {
            console.error("Error interpolating parameters:", error);
          }
        });
      }
    },
  }));
});
