
import { PluginOption} from 'vite';
import translations from "./src/locales/translations.json";
import * as babelParser from "@babel/parser";
import _babelGenerator from "@babel/generator";
import _traverse from "@babel/traverse";
import * as babelTypes from '@babel/types';

type CustomAny = any

const generator = _babelGenerator.default
const traverse = _traverse.default;

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



  return {
    name: "translate-text-plugin",
    enforce: "pre",
    transform(code: string,id:string): string {



      if (!id.endsWith('.ts') && !id.endsWith('.tsx') || id.endsWith('main.tsx')) {
        return code;
      }


      console.log('GOT TO  PLUGIN::',id)
      //  log ast
      // const ast= parseAst(code)



      const ast = babelParser.parse(code,{
        sourceType: 'module',
        plugins: [
          'jsx',
          'typescript',
        ],
      })

      if(/App.tsx/.test(id)){
        console.dir(ast,{depth:Infinity})
      }




      traverse(ast, {
        // Babel visitor to look for "Identifier" nodes with name "Trans"
        Identifier(path:CustomAny) {
          if (path.node.name === 'Trans') {
            const parent = path.findParent((p:CustomAny) => p.isCallExpression());
            if (parent) {
              const content = parent.node.arguments[1];

              console.log(generator(parent.node).code)

              // Check if the second argument is an ObjectExpression and contains 'children'
              if (babelTypes.isObjectExpression(content)) {
                const childrenProp = content.properties.find(
                    (prop) => babelTypes.isObjectProperty(prop) && 'name' in prop.key && prop.key.name === 'children'
                );

                // console.dir(childrenProp, {depth:Infinity})

                if (childrenProp && 'value' in childrenProp ) {

                  if( babelTypes.isStringLiteral(childrenProp.value)) {
                    const stringToTranslate = childrenProp.value.value;

                    // Perform translation if found in the map
                    const newString = translationMap[stringToTranslate] || stringToTranslate;

                    // Update the value with the translated string
                    childrenProp.value = babelTypes.stringLiteral(newString);

                    // You can also modify the raw property for further adjustments if needed
                    childrenProp.value.extra = {
                      rawValue: newString,
                      raw: `"${newString}"`,
                    };
                  }

                  if( babelTypes.isArrayExpression(childrenProp.value) && childrenProp.value.elements) {
                    childrenProp.value.elements.forEach((element) => {
                      if (babelTypes.isStringLiteral(element) && !!element.value) {
                        const stringToTranslate = element.value.trimEnd();
                        // Perform translation if found in the map
                        const newString = (translationMap[stringToTranslate] || stringToTranslate) + " ";
                        // Update the value with the translated string
                        element.value = newString;
                        // You can also modify the raw property for further adjustments if needed
                        element.extra = {
                          rawValue: newString,
                          raw: `"${newString}"`,
                        };
                      }
                    })

                  }
                }
              }
            }
          }
        },
        CallExpression(path:CustomAny) {
          // Check if the function called is named "trans"
          if (path.node.callee.name === 'trans') {
            const content= path.node.arguments[0];
              if ( 'value' in content) {
                 const stringToTranslate = content.value;
                 // Perform translation if found in the map
                 const newString = translationMap[stringToTranslate] || stringToTranslate;
                 // Update the value with the translated string
                 content.value = newString;
                 // You can also modify the raw property for further adjustments if needed
                 content.extra = {
                   rawValue: newString,
                   raw: `"${newString}"`,
                 };
               }
          }
        }
      });



      return generator(ast).code;


    },
  };
}