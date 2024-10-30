import {PluginOption} from 'vite'
import translations from "./src/locales/translations.json";

export default function translateTextPlugin(env: { [key: string]: string }): PluginOption {
  console.log("translating....");

  const locale = (env["LOCALE"] || "en")as keyof typeof translations
  const translationMap:Record<string, string> = translations[locale ];


  const formatMalformedString = (inputString: string): string => {
    // Trim the string
    const trimmedString = inputString.trim();

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
    transform(code: string): string {
      const componentRegex = /<Trans>([\s\S]*?)<\/Trans>/g;
      const functionRegex = /{?trans\("([^"]*)"\)}?/g;

      const extractedKeys: { [key: string]: string } = {};

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

      const replaceWithTranslation = (_match: string, p1: string): string => {
        const key = formatMalformedString(p1)
        return translationMap[key] ? formatMalformedString(translationMap[key]) : key;
      };

      return code
        .replace(componentRegex, replaceWithTranslation)
        .replace(functionRegex, replaceWithTranslation);
    },
  };
}