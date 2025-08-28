// lib/config.ts
// import path from "path";
// import yaml from "js-yaml";
import DataPageSet from "./domain/dataPageSet";
import YAML from "yaml";
// let cachedConfig: any = null;

// const configPath = process.env.CONFIG_PATH 
//   ? path.resolve(process.cwd(), process.env.CONFIG_PATH) 
//   : path.join(process.cwd(), "config");

export async function getPageSetIndex(baseUrl : string) : Promise<string[]> {
  const res = await fetch(`${baseUrl}/config/index.json`);
  if (!res.ok) {
    throw new Error(`Failed to fetch pageset index: ${res.status}`);
  }
  const files = await res.json()
  return files.map((f: string) => f.replace(/\.yml$/,""))
}

export async function getPageSet(configKey : string, baseUrl : string) : Promise<DataPageSet> {
  // const fs = await import("fs")
  // if (cachedConfig) return cachedConfig;
  const res = await fetch(`${baseUrl}/config/${configKey}.yml`);
  // const filePath = path.join(configPath, `${configKey}.yml`);
  // console.debug({env_config_path: process.env.CONFIG_PATH, configPath: configPath, filePath: filePath})
  if (!res.ok) {
    throw new Error(`Failed to fetch config: ${res.status}`);
  }
  // try {
  //   var fileContents = fs.readFileSync(filePath, "utf8");
  // } catch (e) {
  //   throw new Error("PageSet config file not found for id: " + configKey)
  // }
  const text = await res.text();
  try {
    var pageSet : DataPageSet = YAML.parse(text) as DataPageSet;
  } catch(e) {
    throw new Error(`Invalid PageSet config file: /config/${configKey}.yml`)
  }
  return pageSet
}
