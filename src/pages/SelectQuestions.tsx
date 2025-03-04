
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const SelectQuestions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { job, description } = location.state || {};
  const [isLoading, setIsLoading] = useState(true);
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const { toast } = useToast();

  // Redirect if no job description is provided
  useEffect(() => {
    if (!description) {
      navigate("/", { replace: true });
    } else {
      generateQuestions();
    }
  }, [description, navigate]);

  const generateQuestions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-questions', {
        body: {
          jobTitle: job,
          jobDescription: description,
        }
      });

      if (error) {
        console.error('Questions generation error:', error);
        throw error;
      }

      if (!data || !data.questions || !Array.isArray(data.questions)) {
        throw new Error('Format de réponse invalide');
      }

      setGeneratedQuestions(data.questions);
    } catch (error) {
      console.error('Error generating questions:', error);
      // Provide some fallback questions in case of API failure
      setGeneratedQuestions([
        "Pouvez-vous me parler de votre parcours professionnel ?",
        "Quelles sont vos principales compétences techniques ?",
        "Comment gérez-vous les situations de stress au travail ?",
        "Décrivez un projet difficile que vous avez mené à bien.",
        "Quelles sont vos méthodes pour résoudre les problèmes complexes ?",
        "Comment travaillez-vous en équipe ?",
        "Quels sont vos points forts et points à améliorer ?",
        "Pourquoi êtes-vous intéressé par ce poste ?",
        "Comment vous tenez-vous informé des évolutions de votre domaine ?",
        "Où vous voyez-vous dans 5 ans ?",
        "Quelle a été votre plus grande réussite professionnelle ?",
        "Comment gérez-vous les conflits au sein d'une équipe ?",
        "Décrivez une situation où vous avez dû vous adapter rapidement.",
        "Quelle est votre approche pour apprendre de nouvelles compétences ?",
        "Comment établissez-vous vos priorités quand vous avez plusieurs tâches ?",
        "Parlez-moi d'une erreur professionnelle et ce que vous en avez appris.",
        "Comment communiquez-vous des informations techniques à des non-spécialistes ?",
        "Quelle est votre expérience avec [compétence spécifique au poste] ?",
        "Comment réagissez-vous face à la critique ?",
        "Avez-vous des questions à me poser sur le poste ou l'entreprise ?",
      ]);
      
      toast({
        title: "Erreur de génération",
        description: "Impossible de générer des questions personnalisées. Des questions génériques ont été chargées.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleQuestionSelection = (question: string) => {
    if (selectedQuestions.includes(question)) {
      setSelectedQuestions(selectedQuestions.filter(q => q !== question));
    } else {
      if (selectedQuestions.length < 5) {
        setSelectedQuestions([...selectedQuestions, question]);
      } else {
        toast({
          title: "Maximum 5 questions",
          description: "Vous ne pouvez sélectionner que 5 questions maximum.",
          variant: "destructive",
        });
      }
    }
  };

  const handleContinue = () => {
    if (selectedQuestions.length === 0) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner au moins une question pour continuer.",
        variant: "destructive",
      });
      return;
    }

    navigate('/questions', {
      state: {
        job,
        description,
        questions: selectedQuestions
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center">
      <div className="max-w-4xl mx-auto p-4 w-full">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Retour
          </button>
          <div className="text-lg font-medium text-prepera-blue">
            {job || "Entretien personnalisé"}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-8 space-y-6">
          <h2 className="text-xl font-semibold text-prepera-blue">
            Sélectionnez jusqu'à 5 questions d'entretien
          </h2>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-prepera-blue animate-spin mb-4" />
              <p className="text-gray-600">Génération des questions en cours...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3">
                {generatedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => toggleQuestionSelection(question)}
                    className={`text-left px-4 py-3 rounded-lg border transition-colors ${
                      selectedQuestions.includes(question)
                        ? "border-prepera-blue bg-blue-50 text-prepera-darkBlue"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    {question}
                  </button>
                ))}
              </div>
              
              <div className="flex justify-between items-center pt-4">
                <div className="text-sm text-gray-500">
                  {selectedQuestions.length} / 5 questions sélectionnées
                </div>
                <Button
                  onClick={handleContinue}
                  className="bg-prepera-blue text-white hover:bg-prepera-darkBlue flex items-center gap-2"
                >
                  <span>Continuer</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectQuestions;
