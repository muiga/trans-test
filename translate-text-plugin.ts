import { PluginOption } from "vite";
import translations from "./src/locales/translations.json";
import * as babelParser from "@babel/parser";
import _babelGenerator from "@babel/generator";
import _traverse from "@babel/traverse";
import * as babelTypes from "@babel/types";
// write to json file Imports
import * as fs from "fs";
import * as path from "path";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CustomAny = any;

const generator = _babelGenerator.default;
const traverse = _traverse.default;

const extractStringFromTransCall = (code: string): string => {
  const match = code.match(/trans\(['"`](.*?)['"`]\)/);
  return match ? match[1] : code;
};

const formatMalformedString = (inputString: string) => {
  const trimmedString = inputString.trim();
  return trimmedString
    .replace(/\n/g, " ")
    .replace(/(\s?)(<[^>]*>)/g, " $2")
    .replace(/\s{2,}/g, " ")
    .replace(/{" "}/g, "")
    .replace(/\s+/g, " ")
    .replace(/"/g, "'")
    .replace(/>\s+/g, ">")
    .replace(/\s+</g, " <")
    .replace(/(?<!>)<\//g, " </")
    .replace(/(\w)\s*(<)/g, "$1 $2");
};

const extractedKeys: Record<string, string> = {};

const replaceTags=(k:string, w:string[], alternative:string[]):string =>{
  for (let i = 0; i < w.length; i++) {
    const part = w[i];
    if (k.includes(part)) {
      k = k.replace(part, alternative[i]);
    }
  }
  return k;
}

const replaceTagsWithIndex = (arr: string[]): string[] => {
  const tagToIndex = new Map<string, number>;  // Map to track assigned indices for tags
  let currentIndex = 1;  // Start assigning index from 1

  return arr.map((str) => {
    const tagMatch = str.match(/<\/?(\w+)/);
    if (tagMatch) {
      const tag = tagMatch[1];
      // If it's an opening tag
      if (!str.startsWith('</')) {
        const index = currentIndex
        tagToIndex.set(`${tag}-${currentIndex}`,currentIndex++) ;
        return `<${index}>`;
      }
      else {
        const lastTagToIndex = Array.from(tagToIndex.keys())
        const currentKey = lastTagToIndex[lastTagToIndex.length-1]
        const index = tagToIndex.get(currentKey);
        tagToIndex.delete(currentKey)
        return `</${index}>`;
      }
    }

    return str;
  });
}

const workNode = (
  node: CustomAny,
  map: Record<string, string>,
  isCall = false
) => {
  const string = isCall
    ? extractStringFromTransCall(generator(node).code)
    : formatMalformedString(generator(node).code)
        .replace(/<Trans>|<\/Trans>/g, "")
        .trim();

  const regex = /<[^>]+>/g;  // This regex matches everything between '<' and '>', including the tag and attributes
  let match;
  const tags = [];

  while ((match = regex.exec(string)) !== null) {
    tags.push(match[0]); // match[0] contains the full HTML tag including the '<' and '>'
  }

  const replacementTags = tags.length>0? replaceTagsWithIndex(tags):[]
  const newTrans = replaceTags(string,tags,replacementTags)

  // extract key
  extractedKeys[newTrans] = "";
  const newString = map[newTrans];

  if (!newString) {
    throw new Error(
      `Aborting build due to Missing translation for [${string}]`
    );
  }
  const translationValue = replacementTags.length>0? replaceTags(newString, replacementTags,tags): newString


  return babelParser.parse(`<>${translationValue}</>`, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });
};

const writeKeysToFile = (extractedKeys:Record<string, string>)=>{
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
}

export default function translateTextPlugin(env: {
  [key: string]: string;
}): PluginOption {
  console.log("translating....");
  const locale = env["LOCALE"] || "en";

  let translationMap: Record<string, string>;

  if (locale in translations) {
    const rawTranslationMap = translations[locale as keyof typeof translations];
    if (rawTranslationMap) {
      translationMap = Object.entries(rawTranslationMap).reduce(
        (acc, [key, value]) => {
          const cleanedKey = key.replace(/\s+/g, " ").trim();
          acc[cleanedKey] = value.replace(/\s+/g, " ").trim();
          return acc;
        },
        {} as Record<string, string>
      );
    }
  } else {
    throw new Error(
      `Aborting build due to Missing translationMap for [${locale}]`
    );
  }

  return {
    name: "translate-text-plugin",
    enforce: "pre",
    transform(code: string, id: string): string {
      if (
        (!id.endsWith(".ts") && !id.endsWith(".tsx")) ||
        id.endsWith("main.tsx") ||
        locale === "en"
      ) {
        return code;
      }

      const ast = babelParser.parse(code, {
        sourceType: "module",
        plugins: ["jsx", "typescript"],
      });

      traverse(ast, {
        JSXElement(path: CustomAny) {
          if (path.node.openingElement.name.name === "Trans") {
            const newNode = workNode(path.node, translationMap);

            const parentPath = path.parentPath;
            const parentNode = parentPath.node;

            if (parentNode.children) {
              const parentChildren: CustomAny[] = parentNode.children;
              const indexInParent = parentChildren.indexOf(path.node);

              if (indexInParent !== -1) {
                if (
                  "expression" in newNode.program.body[0] &&
                  babelTypes.isJSXFragment(newNode.program.body[0].expression)
                ) {
                  const fragment = newNode.program.body[0];
                  parentChildren[indexInParent] = fragment.expression;
                }
              }
            }
          }
        },
        CallExpression(path: CustomAny) {
          if (path.node.callee.name === "trans") {
            const newNode = workNode(path.node, translationMap, true);

            const parentPath = path.parentPath;
            const parentNode = parentPath.node;
            const grandParentPath = parentPath.parentPath;
            const grandParentNode = grandParentPath.node;
            if (grandParentNode.children) {
              const grandParentChildren: CustomAny[] = grandParentNode.children;
              const indexOfParent = grandParentChildren.indexOf(parentNode);
              if (indexOfParent !== -1) {
                if (
                  "expression" in newNode.program.body[0] &&
                  babelTypes.isJSXFragment(newNode.program.body[0].expression)
                ) {
                  const fragment = newNode.program.body[0].expression;
                  grandParentChildren[indexOfParent] = fragment.children[0];
                }
              }
            }
          }
        },
      });

      // Write extracted keys to a JSON file
      writeKeysToFile(extractedKeys)

      return generator(ast).code;
    },
  };
}
