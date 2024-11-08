import { PluginOption } from "vite";
import translations from "./src/locales/translations.json";
import * as babelParser from "@babel/parser";
import _babelGenerator from "@babel/generator";
import _traverse from "@babel/traverse";
import * as babelTypes from "@babel/types";
// write to file Imports
import * as fs from "fs";
import * as path from "path";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CustomAny = any;

const generator = _babelGenerator.default;
const traverse = _traverse.default;

const extractStringFromTransCall = (code: string): string | null => {
  const match = code.match(/trans\(['"`](.*?)['"`]\)/);
  return match ? match[1] : null;
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

  const extractedKeys: Record<string, string> = {};

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
            const string = formatMalformedString(generator(path.node).code)
              .replace(/<Trans>|<\/Trans>/g, "")
              .trim();
            // extract key
            extractedKeys[string] = "";
            const newString = translationMap[string];

            if (!newString) {
              // if no translation is found throw and abort build
              throw new Error(
                `Aborting build due to Missing translation for [${string}]`
              );
            }

            const parentPath = path.parentPath;
            const parentNode = parentPath.node;

            if (parentNode.children) {
              const nodeAst = babelParser.parse(`<>${newString}</>`, {
                sourceType: "module",
                plugins: ["jsx", "typescript"],
              });

              const parentChildren = parentNode.children;
              const indexInParent = parentChildren.indexOf(path.node);

              if (indexInParent !== -1) {
                if (
                  "expression" in nodeAst.program.body[0] &&
                  babelTypes.isJSXFragment(nodeAst.program.body[0].expression)
                ) {
                  const fragment = nodeAst.program.body[0];
                  parentChildren[indexInParent] = fragment.expression;
                }
              }
            }
          }
        },
        CallExpression(path: CustomAny) {
          // Check if the callee is named 'trans'
          if (path.node.callee.name === "trans") {
            const string = extractStringFromTransCall(
              generator(path.node).code
            );
            if (!string) return;
            // extract key
            extractedKeys[string] = "";
            const newString = translationMap[string];

            if (!newString) {
              // if no translation is found throw and abort build
              throw new Error(
                `Aborting build due to Missing translation for [${string}]`
              );
            }

            const parentPath = path.parentPath;
            const parentNode = parentPath.node;
            const grandParentPath = parentPath.parentPath;
            const grandParentNode = grandParentPath.node;
            if (grandParentNode.children) {
              const nodeAst = babelParser.parse(`<>${newString}</>`, {
                sourceType: "module",
                plugins: ["jsx", "typescript"],
              });

              const grandParentChildren = grandParentNode.children;
              const indexInParent = grandParentChildren.indexOf(parentNode);
              if (indexInParent !== -1) {
                if (
                  "expression" in nodeAst.program.body[0] &&
                  babelTypes.isJSXFragment(nodeAst.program.body[0].expression)
                ) {
                  const fragment = nodeAst.program.body[0].expression;
                  grandParentChildren[indexInParent] = fragment.children[0];
                }
              }
            }
          }
        },
      });

      // ----Done elsewhere
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

      return generator(ast).code;
    },
  };
}
