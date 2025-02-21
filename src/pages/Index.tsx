
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [customJob, setCustomJob] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const jobs = [
    "Product Manager",
    "Data Analyst",
    "UX/UI Designer",
    "Développeur"
  ];

  const handleJobSelection = (job: string) => {
    setSelectedJob(job);
    setCustomJob("");
  };

  const handleCustomJobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomJob(e.target.value);
    setSelectedJob("");
  };

  const handleStart = () => {
    const finalJob = selectedJob || customJob;
    
    if (!finalJob) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner ou saisir un métier pour continuer.",
        variant: "destructive",
      });
      return;
    }

    // Enregistrer le métier choisi et naviguer vers la page suivante
    navigate(`/questions`, { state: { job: finalJob } });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-8 animate-fade-in">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight">
          Sélectionne ton métier
        </h1>
        <p className="text-gray-600">
          Choisis un métier pour commencer ton entraînement aux entretiens
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
        {jobs.map((job) => (
          <button
            key={job}
            onClick={() => handleJobSelection(job)}
            className={`job-button ${selectedJob === job ? "selected" : ""}`}
          >
            {job}
          </button>
        ))}
      </div>

      <div className="w-full max-w-md mx-auto space-y-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Ou saisis ton métier ici"
            value={customJob}
            onChange={handleCustomJobChange}
            className="w-full px-4 py-2 rounded-lg"
          />
        </div>

        <Button
          onClick={handleStart}
          className="w-full flex items-center justify-center space-x-2 py-6 text-lg bg-gray-900 hover:bg-gray-800 text-white transition-all duration-300"
        >
          <span>Commencer</span>
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default Index;
