/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, ReactNode } from "react";

// type Values = Record<string, string | number>;
// const reconstructJSX = (p: {
//   text: string;
//   content: any[];
// }): React.ReactNode => {
//   const elements: React.ReactNode[] = [];

//   const text = trans(p.text);

//   // Split the text into parts based on the iteration tags
//   const parts = text
//     .split(/(<\/?(\d+)>.*?<\/\2>|<\w+>.*?<\/\w+>)/g)
//     .filter(Boolean)
//     .filter((a) => a !== "0");

//   let contentIndex = 0;

//   console.log(text, parts);

//   parts.forEach((part) => {
//     const match = part.match(/<(\d+)>(.*?)<\/\1>/);
//     if (match) {
//       const childContent = p.content[contentIndex] || null;

//       // Create a React element for the matched iteration
//       if (childContent) {
//         elements.push(childContent);
//         contentIndex++; // Move to the next content for the next match
//       }
//     } else {
//       // If there's plain text, just add it
//       elements.push(part);
//     }
//   });

//   return <>{elements}</>;
// };

// const breakDownChildren = (
//   data: any[],
//   iteration: number = 0
// ): { text: string; content: any[] } => {
//   const text: string[] = [];
//   const content: any[] = [];

//   data.forEach((d) => {
//     if (typeof d === "string") {
//       text.push(d);
//     } else if (d && typeof d === "object" && "props" in d) {
//       const c = { ...d };
//       content.push(c);
//       if ("children" in c.props) {
//         const childResult = breakDownChildren(
//           [c.props.children].flat(),
//           iteration + 1
//         );
//         text.push(`<${iteration}>${childResult.text}</${iteration}>`);
//         content.push(childResult.content); // Collect content if needed
//       }
//     }
//   });

//   return { text: text.join(" "), content: content.flat() }; // Joining text and flattening content
// };

interface TransProps {
  children: ReactNode;
}

const Trans: FC<TransProps> = ({ children }) => {
  return children;
};

export default Trans;
