
/* eslint-disable @typescript-eslint/no-explicit-any */
import {parseAst, PluginOption} from 'vite';
import translations from "./src/locales/translations.json";

type CustomAny = any


export default function translateTextPlugin(env: { [key: string]: string }): PluginOption {
  // console.log("translating....");

  const locale = (env["LOCALE"] || "en")

  let translationMap:Record<string, string>

    if(locale in translations){
        translationMap = translations[locale as keyof typeof translations]
      if(translationMap){
        // console.log()
      }
    }else{
      // console.log(`Missing translationMap for ${locale}`);
      throw new Error(`Aborting build due to Missing translationMap for [${locale}]`);
    }


  // const formatMalformedString = (inputString: string): string => {
  //   // Trim the string
  //   const trimmedString = inputString.trim();
  //
  //   // Replace newlines with spaces
  //   let continuousString = trimmedString.replace(/\n/g, " ");
  //
  //   // Ensure proper spacing around HTML tags
  //   continuousString = continuousString.replace(/(\s?)(<[^>]*>)/g, ' $2').replace(/\s{2,}/g, ' ');
  //
  //   // Remove unnecessary spaces around HTML tags
  //   continuousString = continuousString.replace(/{" "}/g, "");
  //
  //   // Remove extra spaces
  //   continuousString = continuousString.replace(/\s+/g, " ");
  //
  //   // Replace double quotes with single quotes
  //   continuousString = continuousString.replace(/"/g, "'");
  //
  //   // Ensure proper formatting of HTML tags
  //   continuousString = continuousString.replace(/>\s+/g, '>').replace(/\s+</g, ' <').replace(/(?<!>)<\//g, ' </').replace(/(\w)\s*(<)/g, '$1 $2');
  //
  //   return continuousString;
  // };

  return {
    name: "translate-text-plugin",
    enforce: "post",
    transform(code: string,id:string): string {

      if(/App/.test(id)){
        console.log('id::', id)
      }

      const ast= parseAst(code)
      // console.dir(ast,{depth:Infinity});

      const findIdentifiersWithName = (ast:CustomAny, name:string) => {
        const identifiers:CustomAny[] = [];



        const traverse = (node:CustomAny, parent:CustomAny) => {
          if (!node) return;

          // Check if the current node is an Identifier with the specified name
          if (node.type === 'Identifier' && node.name === name) {
            // If the parent is a CallExpression or similar, push its arguments
            if (parent && parent.type === 'CallExpression') {
              identifiers.push(parent.arguments
              );
            }
          }

          // Traverse the body if it exists
          if (Array.isArray(node.body)) {
            node.body.forEach((child:CustomAny) => traverse(child, node));
          }

          // Traverse child nodes based on their types
          for (const key in node) {
            if (Object.prototype.hasOwnProperty.call(node, key)) {
              const child = node[key];
              if (Array.isArray(child)) {
                child.forEach(childNode => traverse(childNode, node));
              } else if (typeof child === 'object' && child !== null) {
                traverse(child, node);
              }
            }
          }
        }

        traverse(ast, null);


        const filterUniqueIdentifiers = (identifiers:CustomAny[]) => {
           const seen = new Set();
              return identifiers.filter((identifier:CustomAny[]) => {
                const key = `${identifier[0].start}-${identifier[0].end}`;
                if (seen.has(key)) {
                  return false; // Duplicate found
                }
                seen.add(key); // Mark this identifier as seen
                return true; // Keep it
           });
        };

        return filterUniqueIdentifiers(identifiers)
      }

if(
    findIdentifiersWithName(ast,'Trans')
){
  // console.log()
}
      // console.dir(findIdentifiersWithName(ast,'Trans'),{depth:Infinity});

      // const MyVisitor = {
      //   Identifier() {
      //     console.log("Called!");
      //   }
      // };
      //
      // traverse(ast, MyVisitor)

      // const componentRegex = /<Trans>([\s\S]*?)<\/Trans>/g;
      // const functionRegex = /{?trans\("([^"]*)"\)}?/g;
      //
      // const extractedKeys: { [key: string]: string } = {};
      //
      // let match;
      // while ((match = componentRegex.exec(code)) !== null) {
      //   const key = formatMalformedString(match[1]);
      //   extractedKeys[key] = "";
      // }
      //
      // while ((match = functionRegex.exec(code)) !== null) {
      //   const key = match[1].trim();
      //   extractedKeys[key] = "";
      // }
      //
      // const foundKeys = Object.keys(extractedKeys);
      // const missingKeys = foundKeys.filter((key) => translationMap[key] === undefined);
      // if (missingKeys.length > 0) {
      //   console.log(`Missing translations for ${missingKeys.join(", ")}`);
      //   throw new Error(`Aborting build due to Missing translation for [${missingKeys.join(", ")}]`);
      // }
      //
      // const replaceWithTranslation = (_match: string, p1: string): string => {
      //   const key = formatMalformedString(p1)
      //   return translationMap[key] ? formatMalformedString(translationMap[key]) : key;
      // };
      //
      // return code
      //   .replace(componentRegex, replaceWithTranslation)
      //   .replace(functionRegex, replaceWithTranslation);

      return code
    },
  };
}