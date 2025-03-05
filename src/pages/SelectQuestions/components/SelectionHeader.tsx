
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type SelectionHeaderProps = {
  job: string;
  onBack: () => void;
};

const SelectionHeader = ({ job, onBack }: SelectionHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <Button 
        onClick={onBack}
        variant="ghost"
        className="flex items-center text-gray-600 hover:text-gray-900 p-0 h-auto"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        <span>Retour</span>
      </Button>
      <div className="text-lg font-medium text-prepera-blue">
        {job || "Entretien personnalisé"}
      </div>
    </div>
  );
};

export default SelectionHeader;
