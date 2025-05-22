import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/StarRating";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import PageContainer from "../SelectQuestions/components/PageContainer";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { trackEvent } from "@/services/analyticsService";

const Feedback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [overallRating, setOverallRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (overallRating === 0) {
      toast({
        title: "Note requise",
        description: "Veuillez donner une note avant d'envoyer.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('user_feedback')
        .insert({
          prototype_rating: overallRating,
          comment: comment || null,
          // Keeping these fields in the schema but setting them to null
          job_relevance_rating: null,
          ai_feedback_rating: null,
          ui_navigation_rating: null,
          email: null,
          phone: null,
          name: null,
          general_feedback: null
        });
      
      if (error) {
        console.error("Erreur lors de l'enregistrement du feedback:", error);
        throw error;
      }
      
      trackEvent({
        event_type: 'feedback_submitted',
        event_data: {
          overall_rating: overallRating,
          has_comment: !!comment
        }
      });
      
      toast({
        title: "Merci pour votre retour !",
        description: "Votre feedback a été envoyé avec succès.",
      });
      
      navigate("/");
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Une erreur s'est produite",
        description: "Impossible d'envoyer votre feedback. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <Card className="w-full max-w-lg mx-auto animate-fade-in">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-center">Qu'en pensez-vous ?</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 px-4">
          <div className="space-y-3">
            <p className="text-base font-medium">Sur une échelle de 1 à 5, comment évalueriez-vous votre expérience globale avec ce prototype ?</p>
            <div className="flex justify-center">
              <StarRating rating={overallRating} onChange={setOverallRating} size={isMobile ? 32 : 36} />
            </div>
          </div>
          
          {overallRating > 0 && (
            <div className="space-y-2">
              <p className="text-base">Qu'est-ce qui vous a le plus plu ou déplu ?</p>
              <Textarea 
                placeholder="Partagez votre expérience (facultatif)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[80px] border-transparent focus:ring-0 focus:border-transparent"
              />
            </div>
          )}

          <div className="text-xs text-muted-foreground text-center">
            Votre avis nous aide à améliorer notre plateforme
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between pt-2 px-4">
          <Button 
            variant="ghost"
            onClick={() => navigate("/")}
            disabled={isSubmitting}
            className="text-sm"
          >
            Ignorer
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || overallRating === 0}
            className="text-sm"
          >
            {isSubmitting ? "Envoi en cours..." : "Envoyer"}
          </Button>
        </CardFooter>
      </Card>
    </PageContainer>
  );
};

export default Feedback;
