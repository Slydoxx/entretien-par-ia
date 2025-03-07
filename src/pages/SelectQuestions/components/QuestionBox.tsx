
import { ReactNode } from "react";

type QuestionBoxProps = {
  title: string;
  children: ReactNode;
};

const QuestionBox = ({ title, children }: QuestionBoxProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-8 space-y-6 animate-fade-in">
      <h2 className="text-xl font-semibold text-prepera-blue">
        {title}
      </h2>
      {children}
    </div>
  );
};

export default QuestionBox;
