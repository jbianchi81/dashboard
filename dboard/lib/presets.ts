// lib/config.ts
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import Preset from "./domain/preset";

// let cachedConfig: any = null;

export function getPresets(pageKey : string) : Record<string, Preset> {
  // if (cachedConfig) return cachedConfig;

  const filePath = path.join(process.cwd(), "presets.yml");
  const fileContents = fs.readFileSync(filePath, "utf8");
  const presets : Record<string, Record<string, Preset>> = yaml.load(fileContents) as Record<string, Record<string, Preset>>;
  if(!presets.hasOwnProperty(pageKey)) {
    throw new Error("Page key " + pageKey + " not found in presets.yml")
  }
  return presets[pageKey];
}
