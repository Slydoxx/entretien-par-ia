
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface JobDescriptionTabsProps {
  jobDescription: string;
  jobOffer: string;
  onJobDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onJobOfferChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const JobDescriptionTabs = ({ 
  jobDescription, 
  jobOffer, 
  onJobDescriptionChange, 
  onJobOfferChange 
}: JobDescriptionTabsProps) => {
  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger 
          value="description" 
          className="text-[#2A3F54] text-opacity-80 font-semibold data-[state=active]:text-opacity-100 data-[state=active]:border-[#2A3F54] data-[state=active]:border-[1px]"
        >
          Description du poste
        </TabsTrigger>
        <TabsTrigger 
          value="offer" 
          className="text-[#2A3F54] text-opacity-80 font-semibold data-[state=active]:text-opacity-100 data-[state=active]:border-[#2A3F54] data-[state=active]:border-[1px]"
        >
          Offre d'emploi
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="description">
        <Textarea
          placeholder="Description du poste - modifiez si nécessaire"
          value={jobDescription}
          onChange={onJobDescriptionChange}
          className="min-h-[200px] p-4 text-base text-[#2A3F54] border-gray-300 focus:outline-none focus:ring-0"
        />
        <div className="text-right text-sm text-[#2A3F54] mt-2">
          {5000 - jobDescription.length} caractères restants
        </div>
      </TabsContent>
      
      <TabsContent value="offer">
        <Textarea
          placeholder="Collez l'offre d'emploi complète ici pour obtenir des questions plus ciblées"
          value={jobOffer}
          onChange={onJobOfferChange}
          className="min-h-[200px] p-4 text-base text-[#2A3F54] border-gray-300 focus:outline-none focus:ring-0"
        />
        <div className="text-right text-sm text-[#2A3F54] mt-2">
          {10000 - jobOffer.length} caractères restants
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default JobDescriptionTabs;
