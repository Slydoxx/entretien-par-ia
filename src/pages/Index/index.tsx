import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import JobSearchInput from "./components/JobSearchInput";
import JobDescriptionTabs from "./components/JobDescriptionTabs";
import { jobs } from "./data/jobs";
import { trackEvent } from "@/services/analyticsService";

const Index = () => {
  const [jobTitle, setJobTitle] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [jobOffer, setJobOffer] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSelectJob = (job: string) => {
    setJobTitle(job);
    setJobDescription(jobs[job as keyof typeof jobs]);
  };

  const handleClearJob = () => {
    setJobTitle("");
    setJobDescription("");
  };

  const handleGenerateDescription = (description: string) => {
    setJobDescription(description);
    // Auto-switch to the description tab if needed
  };

  const handleJobDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescription(e.target.value);
  };

  const handleJobOfferChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobOffer(e.target.value);
  };

  const handleStart = () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Description requise",
        description: "Veuillez saisir une description pour continuer.",
        variant: "destructive",
      });
      return;
    }

    trackEvent({
      event_type: 'generate_questions_clicked',
      event_data: {
        job_title: jobTitle || "Personnalisé",
        has_job_offer: !!jobOffer
      }
    });

    navigate(`/select-questions`, { 
      state: { 
        job: jobTitle || "Personnalisé",
        description: jobDescription,
        jobOffer: jobOffer.trim() || undefined
      } 
    });
  };

  useEffect(() => {
    if (jobTitle && jobs[jobTitle as keyof typeof jobs]) {
      setJobDescription(jobs[jobTitle as keyof typeof jobs]);
    }
  }, [jobTitle]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-8 animate-fade-in">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-prepera-blue">
          Sélectionne ton métier
        </h1>
      </div>

      <div className="w-full max-w-3xl mx-auto space-y-4">
        <JobSearchInput 
          jobTitle={jobTitle}
          setJobTitle={setJobTitle}
          jobs={jobs}
          onSelectJob={handleSelectJob}
          onClear={handleClearJob}
          onGenerateDescription={handleGenerateDescription}
        />

        <JobDescriptionTabs 
          jobDescription={jobDescription}
          jobOffer={jobOffer}
          onJobDescriptionChange={handleJobDescriptionChange}
          onJobOfferChange={handleJobOfferChange}
        />

        <Button
          onClick={handleStart}
          className="w-full flex items-center justify-center space-x-2 py-6 text-lg bg-prepera-blue hover:bg-prepera-darkBlue text-white transition-all duration-300"
        >
          <span>Générer les questions</span>
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default Index;
