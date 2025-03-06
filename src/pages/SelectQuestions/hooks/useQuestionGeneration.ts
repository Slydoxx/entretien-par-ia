
import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export type QuestionTheme = {
  name: string;
  questions: string[];
};

const useQuestionGeneration = (job?: string, description?: string, jobOffer?: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  const [questionThemes, setQuestionThemes] = useState<QuestionTheme[]>([]);
  const { toast } = useToast();

  const generateQuestions = useCallback(async () => {
    if (!description) return;
    
    setIsLoading(true);
    try {
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
      console.error('Error generating questions:', error);
      // Provide some fallback questions in case of API failure
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
      
      toast({
        title: "Erreur de génération",
        description: "Impossible de générer des questions personnalisées. Des questions génériques ont été chargées.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [job, description, jobOffer, toast]);

  return { generatedQuestions, questionThemes, isLoading, generateQuestions };
};

export default useQuestionGeneration;
