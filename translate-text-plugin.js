import translations from "./src/locales/translations.json";

export default function translateTextPlugin(env) {
  console.log("translating....");

  const locale = env["LOCALE"] || "en";
  const translationMap = translations[locale];

  const formatMalformedString = (inputString) => {
    let trimmedString = inputString.trim();
    let continuousString = trimmedString.replace(/\n/g, " ");
    continuousString.replace(/(\s?)(<[^>]*>)/g, ' $2').replace(/\s{2,}/g, ' ');
    continuousString = continuousString.replace(/{" "}/g, "");
    continuousString = continuousString.replace(/\s+/g, " ");
    continuousString = continuousString.replace(/"/g, "'");
    // Step 4: Ensure HTML tags are properly formatted (optional: further validation can be added here)

    continuousString = continuousString.replace(/>\s+/g, '>').replace(/\s+</g, ' <')
      .replace(/(?<!>)<\//g, ' </')
      .replace(/(\w)\s*(<)/g, '$1 $2');

    return continuousString;
  };
  return {
    name: "translate-text-plugin",
    enforce: "pre",
    transform(code, id) {
      const regex = /<Trans>([\s\S]*?)<\/Trans>/g;
      const regex2 = /{?trans\("([^"]*)"\)}?/g;

      const extractedKeys = {};

      let match;
      while ((match = regex.exec(code)) !== null) {
        const key = formatMalformedString(match[1]);
        extractedKeys[key] = "";
      }

      while ((match = regex2.exec(code)) !== null) {
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
        const translation = formatMalformedString(translationMap[key]) || key;
        console.log(translation)
        return translation
      };

      return code
        .replace(regex, replaceWithTranslation)
        .replace(regex2, replaceWithTranslation);
    },
  };
}


