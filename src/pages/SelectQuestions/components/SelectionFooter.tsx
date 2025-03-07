
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

type SelectionFooterProps = {
  selectedCount: number;
  onContinue: () => void;
};

const SelectionFooter = ({ selectedCount, onContinue }: SelectionFooterProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-10 shadow-md">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {selectedCount} / 3 questions sélectionnées
        </div>
        <Button
          onClick={onContinue}
          className="bg-prepera-blue text-white hover:bg-prepera-darkBlue flex items-center gap-2"
        >
          <span>Continuer</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default SelectionFooter;
