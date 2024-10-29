const fs = require("fs");
const path = require("path");
const glob = require("glob").glob;

const processFiles = (directory) => {
  const pattern = path.join(directory, "**/*.tsx");
  const files = glob.sync(pattern);
  if (!files) {
    console.error("Error finding files:");
    return;
  }

  const formatMalformedString = (inputString) => {
    let trimmedString = inputString.trim();
    let continuousString = trimmedString.replace(/\n/g, " ");
    continuousString = continuousString.replace(/{" "}/g, "");
    continuousString = continuousString.replace(/\s+/g, " ");
    continuousString = continuousString.replace(/"/g, "'");
    // Step 4: Ensure HTML tags are properly formatted (optional: further validation can be added here)
    // For this example, we assume tags are already correct

    return continuousString;
  };

  const extractedKeys = {};

  files.forEach((file) => {
    let content = fs.readFileSync(file, "utf-8");
    const regex = /<Trans>([\s\S]*?)<\/Trans>/g;
    const regex2 = /{?trans\("([^"]*)"\)}?/g;

    let match;
    while ((match = regex.exec(content)) !== null) {
      const key = formatMalformedString(match[1]);
      extractedKeys[key] = "";
    }

    while ((match = regex2.exec(content)) !== null) {
      const key = match[1].trim();
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
