import { FC, ReactNode } from "react";


interface TransProps {
  children: ReactNode;
}

const Trans: FC<TransProps> = ({ children }) => {
  return children;
};

export default Trans;
