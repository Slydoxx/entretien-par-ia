
import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export type QuestionTheme = {
  name: string;
  questions: string[];
};

const MAX_RETRIES = 3; // Augmenté à 3 pour plus de fiabilité
const RETRY_DELAY = 2000; // 2 secondes entre chaque retry

const useQuestionGeneration = (job?: string, description?: string, jobOffer?: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  const [questionThemes, setQuestionThemes] = useState<QuestionTheme[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generateFallbackQuestions = () => {
    const fallbackQuestions = [
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
      "Comment gérez-vous les conflits au sein d'une équipe ?"
    ];
    
    setGeneratedQuestions(fallbackQuestions);
    
    // Create fallback themes
    setQuestionThemes([
      { name: "Compétences techniques", questions: fallbackQuestions.slice(0, 3) },
      { name: "Formation et projets académiques", questions: fallbackQuestions.slice(3, 6) },
      { name: "Soft skills", questions: fallbackQuestions.slice(6, 9) },
      { name: "Motivation", questions: fallbackQuestions.slice(9, 12) }
    ]);
  };

  const callGenerateQuestionsAPI = async (retryCount = 0): Promise<any> => {
    try {
      console.log(`Tentative d'appel API (${retryCount + 1}/${MAX_RETRIES})`);
      
      const { data, error } = await supabase.functions.invoke('generate-questions', {
        body: {
          jobTitle: job,
          jobDescription: description,
          jobOffer: jobOffer
        }
      });

      if (error) {
        console.error('Questions generation error:', error);
        throw error;
      }

      console.log("API call successful:", data);
      return data;
    } catch (error) {
      console.error(`Error generating questions (attempt ${retryCount + 1}):`, error);
      
      // If we haven't reached max retries yet, try again after a delay
      if (retryCount < MAX_RETRIES - 1) {
        console.log(`Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return callGenerateQuestionsAPI(retryCount + 1);
      }
      
      // We've exhausted our retries
      throw error;
    }
  };

  const generateQuestions = useCallback(async () => {
    if (!description) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await callGenerateQuestionsAPI();

      if (!data || !data.questions || !Array.isArray(data.questions)) {
        throw new Error('Format de réponse invalide');
      }

      // Set the flat list of questions for backward compatibility
      setGeneratedQuestions(data.questions);
      
      // Set the themed questions if available
      if (data.themes && Array.isArray(data.themes)) {
        setQuestionThemes(data.themes);
      } else {
        // Fallback in case themes aren't returned
        setQuestionThemes([
          { name: "Compétences techniques", questions: data.questions.slice(0, 3) },
          { name: "Formation et projets académiques", questions: data.questions.slice(3, 6) },
          { name: "Soft skills", questions: data.questions.slice(6, 9) },
          { name: "Motivation", questions: data.questions.slice(9, 12) }
        ]);
      }
    } catch (error) {
      console.error('Error generating questions after retries:', error);
      setError('Erreur lors de la génération des questions');
      
      // Provide fallback questions in case of API failure
      generateFallbackQuestions();
      
      // Show more specific error message based on the error type
      let errorMessage = "Impossible de générer des questions personnalisées. Des questions génériques ont été chargées.";
      
      if (error instanceof Error) {
        const errorString = error.toString().toLowerCase();
        
        if (errorString.includes("openai") || errorString.includes("api key")) {
          errorMessage = "Erreur d'authentification avec l'API OpenAI. Des questions génériques ont été chargées.";
        } else if (errorString.includes("timeout") || errorString.includes("timed out")) {
          errorMessage = "Délai d'attente dépassé. Des questions génériques ont été chargées.";
        } else if (errorString.includes("quota") || errorString.includes("rate limit")) {
          errorMessage = "Limite de l'API atteinte. Des questions génériques ont été chargées.";
        } else if (errorString.includes("auth_subrequest_error") || errorString.includes("internal server error")) {
          errorMessage = "Erreur d'authentification avec l'API. Vérifiez que la clé API est valide. Des questions génériques ont été chargées.";
        }
      }
      
      toast({
        title: "Erreur de génération",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [job, description, jobOffer, toast]);

  return { 
    generatedQuestions, 
    questionThemes, 
    isLoading, 
    generateQuestions,
    error
  };
};

export default useQuestionGeneration;
