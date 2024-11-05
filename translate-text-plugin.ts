
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

      const allTransComponents:CustomAny[] =[]
      const allTransComponentsString:string[] =[]


      traverse(ast, {
        JSXElement(path:CustomAny) {
          if (path.node.openingElement.name.name === 'Trans') {
            allTransComponents.push(path.node)}
        },
      });



      const createStringFromNode= (content:CustomAny[])=>{
        const strArr:string[] = []
        content.forEach((node:CustomAny)=>{

          if( babelTypes.isJSXText(node)){
            const text = node.value.replace(/\s+/g, ' ').trim()
            strArr.push(text)
          } else if(babelTypes.isJSXElement(node)){
            const children = node.children
            const el ='name' in node.openingElement.name && node.openingElement.name.name
            let cEl;
            if((node.closingElement && 'name' in node.closingElement.name)){
              cEl = node.closingElement.name.name
            }

            const str = createStringFromNode(children)

            let newStr:string[] = []
            if(el &&  typeof el ==='string' && cEl &&  typeof cEl ==='string'){
              newStr = [`<${el}>`, ...str, `</${cEl}>`]
            } else{
               newStr = [...str]
            }
            strArr.push(...newStr)
          }else{
            strArr.push('')
          }

        });

        return strArr
      }

      allTransComponents.forEach((node:CustomAny)=>{
          const content:CustomAny[] = node.children
        const str = createStringFromNode(content)

        if(content.length === 1 && babelTypes.isJSXText(content[0])){
          const stringToTrans = str.join(' ').trim()
          allTransComponentsString.push(stringToTrans)
        }else{
          const newStrArr:string[] = str[str.length - 1] === '.' ? str.slice(0, -1) : str;
          const stringToTrans = newStrArr.join(' ').replace(/\s+/g, ' ').replace(/\s*>\s*/g, '>').trim()
          allTransComponentsString.push(stringToTrans)
          //   work with  complex nodes

        }

      })


      const parseStringToArray = (inputString:string):string[] =>{
        const regex = /(<[^>]+>|[^<]+)/g;
        const matches = inputString.match(regex);
        const result:string[] = [];


       if(matches) matches.forEach((match) => {
          if (match.startsWith('<')) {
            result.push(match);  // push the HTML tag itself
          } else {
            result.push(match.trim());  // push the text content
          }
        });

        return result;
      }


      allTransComponentsString.forEach((str,index)=>{

        const newString = (translationMap[str] || str);

        const currentNode = allTransComponents[index]
        traverse(ast, {
          JSXElement(path:CustomAny) {
            if (path.node.start === currentNode.start && path.node.end === currentNode.end) {
             const content:CustomAny[] = path.node.children;
             if(content.length === 1 && babelTypes.isJSXText(content[0])){
               content[0].value = newString;
               content[0].extra = {
                 rawValue: newString,
                 raw: `${newString}`,
               };
             }else{
               const example = newString.replace(/\s*>\s*/g, '>').trim()
               const originalArr = parseStringToArray(str)
               const transArr = parseStringToArray(example)
               const findAndTranslate = (parentNode:CustomAny)=> {
                 // Iterate over the child nodes of the parent node
                 parentNode.children.forEach((child:CustomAny) => {
                   if (child.type === 'JSXText') {
                   // replace if found
                     const text= child.value.replace(/\s+/g, ' ').trim()

                     if(text && typeof text === 'string'){
                       const index = originalArr.indexOf(text)
                       if(index !== -1 && transArr[index]){
                       // wait
                         const val =transArr[index]+" "
                         child.value = val;
                         child.extra = {
                           rawValue: val,
                           raw: `${val}`,
                         };
                       }
                     }

                   }

                   // If the child is a JSXElement, recurse into its children
                   if (child.type === 'JSXElement') {
                     findAndTranslate(child) // Recurse
                   }
                 });

               }

               findAndTranslate(path.node);


             //   complex nodes
             }
            }
          },
          CallExpression(path:CustomAny) {
            // Check if the callee is named 'trans'
            if (path.node.callee.name === 'trans') {
              const content:CustomAny[] = path.node.arguments
              if(content[0]  && 'value' in content[0]){
                const newStr = (translationMap[content[0].value] || content[0].value);
                content[0].value = newStr;
                content[0].extra = {
                  rawValue: newStr,
                  raw: `"${newStr}"`,
                };
              }
            }
          }
        });

      })







      return generator(ast).code;


    },
  };
}