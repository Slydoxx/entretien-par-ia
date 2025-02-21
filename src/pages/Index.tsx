
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";

const Index = () => {
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const jobs = {
    "Business Analyst": `Role Summary: We are looking for a Business Analyst to join our team. This role is perfect for those who are early in their careers and are eager to dive into analyzing business needs and delivering data-driven solutions.

Responsibilities:
- Work closely with business units and stakeholders to understand and analyze business requirements.
- Translate business needs into functional specifications and system design plans.
- Conduct thorough data analysis using a variety of techniques.`,
    "Product Manager": `Role Summary: We're seeking a Product Manager to lead product development initiatives.

Responsibilities:
- Define product vision and strategy
- Work with engineering teams to deliver features
- Conduct market research and user interviews`,
    "Data Analyst": `Role Summary: Looking for a Data Analyst to transform data into insights.

Responsibilities:
- Analyze complex data sets
- Create dashboards and reports
- Present findings to stakeholders`,
    "UX/UI Designer": `Role Summary: Join us as a UX/UI Designer to create exceptional user experiences.

Responsibilities:
- Design user interfaces
- Conduct user research
- Create wireframes and prototypes`,
    "Software Engineer": `Role Summary: We're looking for a Software Engineer to build amazing products.

Responsibilities:
- Write clean, maintainable code
- Work with cross-functional teams
- Design and implement new features`,
    "QA Engineer": `Role Summary: Join our QA team to ensure product quality.

Responsibilities:
- Develop and execute test cases
- Perform manual and automated testing
- Report and track bugs`,
    "Marketing Specialist": `Role Summary: Looking for a Marketing Specialist to drive growth.

Responsibilities:
- Plan and execute marketing campaigns
- Analyze marketing metrics
- Create content strategies`,
    "Customer Service Representative": `Role Summary: Join our support team to help customers succeed.

Responsibilities:
- Respond to customer inquiries
- Resolve customer issues
- Maintain customer satisfaction`,
    "Sales Representative": `Role Summary: We need a Sales Representative to grow our business.

Responsibilities:
- Identify and pursue sales opportunities
- Build client relationships
- Meet sales targets`,
    "Human Resources Specialist": `Role Summary: Join our HR team to support our growing organization.

Responsibilities:
- Manage recruitment process
- Handle employee relations
- Maintain HR policies and procedures`
  };

  const handleJobSelection = (job: string) => {
    setSelectedJob(job);
    setJobDescription(jobs[job as keyof typeof jobs] || "");
  };

  const handleJobDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescription(e.target.value);
    if (selectedJob && e.target.value !== jobs[selectedJob as keyof typeof jobs]) {
      setSelectedJob("");
    }
  };

  const handleStart = () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Description requise",
        description: "Veuillez sélectionner un métier ou saisir une description pour continuer.",
        variant: "destructive",
      });
      return;
    }

    navigate(`/questions`, { 
      state: { 
        job: selectedJob || "Custom",
        description: jobDescription 
      } 
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-8 animate-fade-in">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight">
          Select a job description
        </h1>
      </div>

      <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
        {Object.keys(jobs).map((job) => (
          <button
            key={job}
            onClick={() => handleJobSelection(job)}
            className={`job-button ${selectedJob === job ? "selected" : ""}`}
          >
            {job}
          </button>
        ))}
      </div>

      <div className="w-full max-w-3xl mx-auto space-y-4">
        <Textarea
          placeholder="Select a job role above or paste your own description here"
          value={jobDescription}
          onChange={handleJobDescriptionChange}
          className="min-h-[200px] p-4 text-base"
        />
        <div className="text-right text-sm text-gray-500">
          {5000 - jobDescription.length} chars left
        </div>

        <Button
          onClick={handleStart}
          className="w-full flex items-center justify-center space-x-2 py-6 text-lg bg-gray-900 hover:bg-gray-800 text-white transition-all duration-300"
        >
          <span>Generate Questions</span>
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default Index;
