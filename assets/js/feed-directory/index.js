document.addEventListener("alpine:init", () => {
  Alpine.data("feedDirectory", () => ({
    instanceUrl: "https://html2rss.herokuapp.com/",
    searchQuery: "",
    configs: window.feedDirectoryData,

    filterConfig(configName) {
      if (!this.searchQuery) {
        return true;
      }
      return configName.toLowerCase().includes(this.searchQuery.toLowerCase());
    },

    getFeedUrl(config, params = {}) {
      let url = this.instanceUrl.endsWith("/")
        ? this.instanceUrl
        : `${this.instanceUrl}/`;
      url += `${config.domain}/${config.name}.rss`;

      const queryParams = new URLSearchParams();
      if (Array.isArray(config.url_parameters)) {
        config.url_parameters.forEach((param) => {
          const key = param[0];
          if (params[key]) {
            queryParams.append(key, params[key]);
          }
        });
      }

      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      return url;
    },

    copyUrl(config, params = {}, event) {
      const url = this.getFeedUrl(config, params);
      navigator.clipboard.writeText(url).then(() => {
        const originalText = event.target.innerHTML;
        event.target.innerHTML = "Copied!";
        setTimeout(() => {
          event.target.innerHTML = originalText;
        }, 2000);
      });
    },
  }));
});
