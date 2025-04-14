
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type SelectionHeaderProps = {
  onBack: () => void;
};

const SelectionHeader = ({ onBack }: SelectionHeaderProps) => {
  return (
    <div className="flex items-center mb-8">
      <Button 
        onClick={onBack}
        variant="ghost"
        className="flex items-center text-gray-600 hover:text-gray-900 p-0 h-auto"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        <span>Retour</span>
      </Button>
    </div>
  );
};

export default SelectionHeader;
