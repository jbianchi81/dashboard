// lib/config.ts
import path from "path";
import yaml from "js-yaml";
import DataPageSet from "./domain/dataPageSet";
// let cachedConfig: any = null;

const configPath = process.env.CONFIG_PATH 
  ? path.resolve(process.cwd(), process.env.CONFIG_PATH) 
  : path.join(process.cwd(), "config");

export async function getPageSet(configKey : string) : Promise<DataPageSet> {
  const fs = await import("fs")
  // if (cachedConfig) return cachedConfig;
  const filePath = path.join(configPath, `${configKey}.yml`);
  console.debug({configPath: configPath, filePath: filePath})
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
