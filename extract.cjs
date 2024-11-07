const fs = require("fs");
const path = require("path");
const glob = require("glob").glob;

const formatMalformedString = (inputString) => {
  const trimmedString = inputString.trim();
  return trimmedString.replace(/\n/g, " ")
      .replace(/(\s?)(<[^>]*>)/g, ' $2').replace(/\s{2,}/g, ' ')
      .replace(/{" "}/g, "")
      .replace(/\s+/g, " ")
      .replace(/"/g, "'")
      .replace(/>\s+/g, '>').replace(/\s+</g, ' <')
      .replace(/(?<!>)<\//g, ' </')
      .replace(/(\w)\s*(<)/g, '$1 $2');
};

const processFiles = (directory) => {
  const pattern = path.join(directory, "**/*.tsx");
  const files = glob.sync(pattern);
  if (!files) {
    console.error("Error finding files:");
    return;
  }


  const extractedKeys = {};

  files.forEach((file) => {
    let content = fs.readFileSync(file, "utf-8");
    const regex = /<Trans>([\s\S]*?)<\/Trans>/g;
    const regex2 = /{?trans\("([^"]*)"\)}?/g;

    let match;
    while ((match = regex.exec(content)) !== null) {
      const key = formatMalformedString(match[1])
      extractedKeys[key] = "";
    }

    while ((match = regex2.exec(content)) !== null) {
      const key = formatMalformedString(match[1])
      extractedKeys[key] = "";
    }
  });

  // Write extracted keys to a JSON file
  const outputFilePath = path.join(
    __dirname,
    "src",
    "locales",
    "extracted_keys.json"
  );
  fs.writeFileSync(
    outputFilePath,
    JSON.stringify(extractedKeys, null, 2),
    "utf-8"
  );
  console.log(`Extracted keys written to: ${outputFilePath}`);
};

// Specify the source directory
const srcDirectory = path.join(__dirname, "src");
processFiles(srcDirectory);
