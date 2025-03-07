
import { ReactNode } from "react";

type QuestionBoxProps = {
  title: string;
  children: ReactNode;
};

const QuestionBox = ({ title, children }: QuestionBoxProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-8 space-y-6 animate-fade-in pb-20">
      <h2 className="text-xl font-semibold text-prepera-blue text-center">
        {title}
      </h2>
      {children}
    </div>
  );
};

export default QuestionBox;
