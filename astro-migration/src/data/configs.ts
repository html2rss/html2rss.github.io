export interface Config {
  domain: string;
  name: string;
  valid_channel_url: boolean;
  url_parameters: Record<string, any>;
  default_parameters: Record<string, any>;
  channel: {
    url: string;
    time_zone?: string;
    ttl?: number;
    language?: string;
    title?: string;
    json?: boolean;
  };
}

export const configs: Config[] = [
  {
    domain: "adfc.de",
    name: "pressemitteilungen",
    valid_channel_url: true,
    url_parameters: {},
    default_parameters: {},
    channel: {
      url: "https://www.adfc.de/presse/pressemitteilungen/",
      time_zone: "Europe/Berlin",
      ttl: 720,
      language: "de",
    },
  },
  {
    domain: "apnews.com",
    name: "hub",
    valid_channel_url: false,
    url_parameters: {
      section: "String",
    },
    default_parameters: {
      section: "news",
    },
    channel: {
      url: "https://apnews.com/%<section>s",
      language: "en",
      ttl: 120,
      time_zone: "UTC",
    },
  },
  {
    domain: "avherald.com",
    name: "index",
    valid_channel_url: true,
    url_parameters: {},
    default_parameters: {},
    channel: {
      url: "https://avherald.com/",
      language: "en",
      ttl: 120,
      time_zone: "UTC",
    },
  },
  {
    domain: "bbc.co.uk",
    name: "available_episodes",
    valid_channel_url: false,
    url_parameters: {
      id: "String",
    },
    default_parameters: {
      id: "b006wkfp",
    },
    channel: {
      url: "https://www.bbc.co.uk/programmes/%<id>s/episodes/player",
      time_zone: "UTC",
      ttl: 720,
    },
  },
  {
    domain: "bbc.com",
    name: "mundo",
    valid_channel_url: true,
    url_parameters: {},
    default_parameters: {},
    channel: {
      url: "https://www.bbc.com/mundo",
      language: "es",
      ttl: 360,
      time_zone: "UTC",
    },
  },
  // Add more configs as needed - this is a subset for testing
];
