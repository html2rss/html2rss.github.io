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

    init() {
      if (!this.config) return;
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
