import fs from "fs";
import path from "path";

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

export function loadConfigs(): Config[] {
  try {
    const filePath = path.join(process.cwd(), "src/data/configs.json");
    const fileContents = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(fileContents) as Config[];
    return data || [];
  } catch (error) {
    console.error("Error loading configs:", error);
    // Fallback to empty array if file doesn't exist
    return [];
  }
}

// Load configs from the generated JSON file
export const configs = loadConfigs();
