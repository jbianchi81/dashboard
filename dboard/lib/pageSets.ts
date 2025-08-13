// lib/config.ts
import path from "path";
import yaml from "js-yaml";
import DataPageSet from "./domain/dataPageSet";
// let cachedConfig: any = null;

export async function getPageSet(configKey : string) : Promise<DataPageSet> {
  const fs = await import("fs")
  // if (cachedConfig) return cachedConfig;
  const filePath = path.join(process.cwd(), "config", `${configKey}.yml`);
  try {
    var fileContents = fs.readFileSync(filePath, "utf8");
  } catch (e) {
    throw new Error("PageSet config file not found for id: " + configKey)
  }
  try {
    var pageSet : DataPageSet = yaml.load(fileContents) as DataPageSet;
  } catch(e) {
    throw new Error("Invalid PageSet config file: " + filePath)
  }
  return pageSet
}
