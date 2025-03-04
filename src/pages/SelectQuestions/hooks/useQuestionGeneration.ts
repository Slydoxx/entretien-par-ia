
import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const useQuestionGeneration = (job?: string, description?: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  const { toast } = useToast();

  const generateQuestions = useCallback(async () => {
    if (!description) return;
    
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
  }, [job, description, toast]);

  return { generatedQuestions, isLoading, generateQuestions };
};

export default useQuestionGeneration;
