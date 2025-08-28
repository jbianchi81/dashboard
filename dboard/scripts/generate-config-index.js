// scripts/generate-config-index.js
const fs = require("fs");
const path = require("path");

const dir = path.join(process.cwd(), "public/config");
const files = fs.readdirSync(dir).filter(f => f.endsWith(".yml") || f.endsWith(".yaml"));

fs.writeFileSync(
  path.join(process.cwd(), "public/config/index.json"),
  JSON.stringify(files, null, 2)
);
