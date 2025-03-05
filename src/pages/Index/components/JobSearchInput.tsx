
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface JobSearchInputProps {
  jobTitle: string;
  setJobTitle: (value: string) => void;
  jobs: Record<string, string>;
  onSelectJob: (job: string) => void;
  onClear: () => void;
}

const JobSearchInput = ({ 
  jobTitle, 
  setJobTitle, 
  jobs, 
  onSelectJob,
  onClear
}: JobSearchInputProps) => {
  const [filteredJobs, setFilteredJobs] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

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

  return (
    <div className="relative w-full">
      <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-prepera-blue focus-within:border-prepera-blue">
        <Search className="ml-3 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Entrez votre métier d'alternance..."
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
    </div>
  );
};

export default JobSearchInput;
