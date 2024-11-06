import {PluginOption} from 'vite';
import translations from "./src/locales/translations.json";
import * as babelParser from "@babel/parser";
import _babelGenerator from "@babel/generator";
import _traverse from "@babel/traverse";
// import * as babelTypes from '@babel/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CustomAny = any

const generator = _babelGenerator.default
const traverse = _traverse.default;

export default function translateTextPlugin(env: { [key: string]: string }): PluginOption {
  console.log("translating....");
  const locale = (env["LOCALE"] || "en")

  let translationMap:Record<string, string>

    if(locale in translations){
       const rawTranslationMap = translations[locale as keyof typeof translations]
      if(rawTranslationMap){
       translationMap = Object.entries(rawTranslationMap).reduce((acc, [key, value]) => {
          const cleanedKey = key.replace(/\s+/g, ' ').trim();
         acc[cleanedKey] = value.replace(/\s+/g, ' ').trim();
          return acc;
        }, {} as Record<string, string>);

       if(translationMap){
       //   test
       }

      }
    }else{
      // console.log(`Missing translationMap for ${locale}`);
      throw new Error(`Aborting build due to Missing translationMap for [${locale}]`);
    }


  // const parseStringToArray = (inputString: string): string[] => {
  //   const regex = /(<[^>]+>)|(\{[^}]+})|([^<{]+(?:\s[^<{]+)*)/g;
  //   const result: string[] = [];
  //
  //   // Use regex to find matches
  //   let matches;
  //   while ((matches = regex.exec(inputString)) !== null) {
  //     if (matches[1]) {
  //       result.push(matches[1]); // Push the HTML tag
  //     } else if (matches[2]) {
  //       result.push(matches[2]); // Push the placeholder
  //     } else if (matches[3]) {
  //       result.push(matches[3].trim()); // Push the text content, trimming any excess whitespace
  //     }
  //   }
  //   return result.filter(str => str.trim() !== "")
  // };



  return {
    name: "translate-text-plugin",
    enforce: "pre",
    transform(code: string,id:string): string {
      if (!id.endsWith('.ts') && !id.endsWith('.tsx') || id.endsWith('main.tsx')) {
        return code;
      }

      const ast = babelParser.parse(code,{
        sourceType: 'module',
        plugins: [
          'jsx',
          'typescript',
        ],
      });

      const allTransComponents:CustomAny[] =[]
      const allFunctions:CustomAny[] =[]

      traverse(ast, {
        JSXElement(path:CustomAny) {
          if (path.node.openingElement.name.name === 'Trans') {
            allTransComponents.push(path.node)}
        },
        CallExpression(path:CustomAny) {
          // Check if the callee is named 'trans'
          if (path.node.callee.name === 'trans') {
            allFunctions.push(path.node)
          }
        },
      });

      allTransComponents.forEach((node:CustomAny)=>{
         const string = generator(node).code
        console.log('code', string)
      })

      return generator(ast).code;
    },
  };
}