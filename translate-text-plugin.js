import translations from "./src/locales/translations.json";

/**
 * TranslateTextPlugin is a Vite plugin that performs text translation in JavaScript/TypeScript files.
 * It extracts translation keys from `<Trans>` tags and replaces them with their corresponding translations.
 * @param {Object} env - The environment variables object.
 * @returns {Object} - The Vite plugin object.
 */
export default function translateTextPlugin(env) {
  console.log("translating....");

  const locale = env["LOCALE"] || "en";
  const translationMap = translations[locale];

  /**
   * Formats a malformed string by performing the following operations:
   * - Trims the string
   * - Replaces newlines with spaces
   * - Ensures proper spacing around HTML tags
   * - Replaces double quotes with single quotes
   * - Ensures proper formatting of HTML tags
   *
   * @param {string} inputString - The malformed string to format
   * @returns {string} - The formatted string
   */
  const formatMalformedString = (inputString) => {
    // Trim the string
    let trimmedString = inputString.trim();

    // Replace newlines with spaces
    let continuousString = trimmedString.replace(/\n/g, " ");

    // Ensure proper spacing around HTML tags
    continuousString = continuousString.replace(/(\s?)(<[^>]*>)/g, ' $2').replace(/\s{2,}/g, ' ');

    // Remove unnecessary spaces around HTML tags
    continuousString = continuousString.replace(/{" "}/g, "");

    // Remove extra spaces
    continuousString = continuousString.replace(/\s+/g, " ");

    // Replace double quotes with single quotes
    continuousString = continuousString.replace(/"/g, "'");

    // Ensure proper formatting of HTML tags
    continuousString = continuousString.replace(/>\s+/g, '>').replace(/\s+</g, ' <').replace(/(?<!>)<\//g, ' </').replace(/(\w)\s*(<)/g, '$1 $2');

    return continuousString;
  };

  return {
    name: "translate-text-plugin",
    enforce: "pre",
    /**
     * Transforms the code by replacing translation keys with their corresponding translations.
     * @param {string} code - The code to transform.
     * @param {string} id - The file ID.
     * @returns {string} - The transformed code.
     */
    transform(code, id) {
      const componentRegex = /<Trans>([\s\S]*?)<\/Trans>/g;
      const functionRegex = /{?trans\("([^"]*)"\)}?/g;

      const extractedKeys = {};

      let match;
      while ((match = componentRegex.exec(code)) !== null) {
        const key = formatMalformedString(match[1]);
        extractedKeys[key] = "";
      }

      while ((match = functionRegex.exec(code)) !== null) {
        const key = match[1].trim();
        extractedKeys[key] = "";
      }

      const foundKeys = Object.keys(extractedKeys);
      const missingKeys = foundKeys.filter((key) => translationMap[key] === undefined);
      if (missingKeys.length > 0) {
        console.log(`Missing translations for ${missingKeys.join(", ")}`);
        throw new Error(`Aborting build due to Missing translation for [${missingKeys.join(", ")}]`);
      }

      const replaceWithTranslation = (_match, p1) => {
        const key = formatMalformedString(p1);
        return translationMap[key]? formatMalformedString(translationMap[key]) : key
      };

      return code
        .replace(componentRegex, replaceWithTranslation)
        .replace(functionRegex, replaceWithTranslation);
    },
  };
}