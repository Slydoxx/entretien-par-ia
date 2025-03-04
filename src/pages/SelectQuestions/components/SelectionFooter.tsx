
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

type SelectionFooterProps = {
  selectedCount: number;
  onContinue: () => void;
};

const SelectionFooter = ({ selectedCount, onContinue }: SelectionFooterProps) => {
  return (
    <div className="flex justify-between items-center pt-4">
      <div className="text-sm text-gray-500">
        {selectedCount} / 5 questions sélectionnées
      </div>
      <Button
        onClick={onContinue}
        className="bg-prepera-blue text-white hover:bg-prepera-darkBlue flex items-center gap-2"
      >
        <span>Continuer</span>
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default SelectionFooter;
