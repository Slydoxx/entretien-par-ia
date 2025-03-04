
import { ChevronLeft } from "lucide-react";

type SelectionHeaderProps = {
  job: string;
  onBack: () => void;
};

const SelectionHeader = ({ job, onBack }: SelectionHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <button 
        onClick={onBack}
        className="flex items-center text-gray-600 hover:text-gray-900"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        Retour
      </button>
      <div className="text-lg font-medium text-prepera-blue">
        {job || "Entretien personnalisé"}
      </div>
    </div>
  );
};

export default SelectionHeader;
