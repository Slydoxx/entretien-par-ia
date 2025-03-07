
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Wand2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface JobSearchInputProps {
  jobTitle: string;
  setJobTitle: (value: string) => void;
  jobs: Record<string, string>;
  onSelectJob: (job: string) => void;
  onClear: () => void;
  onGenerateDescription: (description: string) => void;
}

const JobSearchInput = ({ 
  jobTitle, 
  setJobTitle, 
  jobs, 
  onSelectJob,
  onClear,
  onGenerateDescription
}: JobSearchInputProps) => {
  const [filteredJobs, setFilteredJobs] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const { toast } = useToast();

  const isCustomJob = jobTitle && !Object.keys(jobs).includes(jobTitle);

  useEffect(() => {
    if (jobTitle === "") {
      setFilteredJobs([]);
      return;
    }

    const filtered = Object.keys(jobs).filter(job => 
      job.toLowerCase().includes(jobTitle.toLowerCase())
    );
    
    setFilteredJobs(filtered);
  }, [jobTitle, jobs]);

  const handleJobTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setJobTitle(value);
    
    // Show suggestions when typing
    setShowSuggestions(value.length > 0);
  };

  const handleGenerateDescription = async () => {
    if (!jobTitle.trim()) return;
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-job-description', {
        body: { jobTitle }
      });

      if (error) {
        console.error('Error generating job description:', error);
        toast({
          title: "Erreur",
          description: "Impossible de générer la description du poste.",
          variant: "destructive",
        });
        return;
      }

      if (data.description) {
        onGenerateDescription(data.description);
        toast({
          title: "Description générée",
          description: "La description du poste a été générée avec succès.",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-prepera-blue focus-within:border-prepera-blue">
        <Search className="ml-3 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Entrez le nom de votre métier"
          value={jobTitle}
          onChange={handleJobTitleChange}
          onFocus={() => setShowSuggestions(jobTitle.length > 0)}
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
        />
        {jobTitle && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClear}
            className="mr-1 h-8 w-8"
            aria-label="Effacer la sélection"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {showSuggestions && filteredJobs.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
          <ul className="py-1 divide-y divide-gray-100">
            {filteredJobs.map((job) => (
              <li 
                key={job}
                className="px-4 py-3 cursor-pointer hover:bg-gray-100 text-left text-base touch-manipulation"
                onClick={() => {
                  onSelectJob(job);
                  setShowSuggestions(false);
                }}
              >
                {job}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isCustomJob && (
        <div className="mt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-prepera-blue border-prepera-blue hover:bg-prepera-blue/10"
            disabled={isGenerating}
            onClick={handleGenerateDescription}
          >
            <Wand2 className="h-4 w-4" />
            <span>{isGenerating ? "Génération en cours..." : "Générer une description pour ce métier"}</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default JobSearchInput;
