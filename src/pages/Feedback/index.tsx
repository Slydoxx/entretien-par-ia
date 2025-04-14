
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/StarRating";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import PageContainer from "../SelectQuestions/components/PageContainer";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

const Feedback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [generalFeedback, setGeneralFeedback] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [jobRelevanceRating, setJobRelevanceRating] = useState(0);
  const [aiFeedbackRating, setAiFeedbackRating] = useState(0);
  const [prototypeRating, setPrototypeRating] = useState(0);
  const [uiNavigationRating, setUiNavigationRating] = useState(0);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('user_feedback')
        .insert({
          general_feedback: generalFeedback,
          job_relevance_rating: jobRelevanceRating || null,
          ai_feedback_rating: aiFeedbackRating || null,
          prototype_rating: prototypeRating || null,
          ui_navigation_rating: uiNavigationRating || null,
          comment: comment || null
        });
      
      if (error) {
        console.error("Erreur lors de l'enregistrement du feedback:", error);
        throw error;
      }
      
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
      <Card className="w-full max-w-4xl mx-auto animate-fade-in">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl md:text-2xl font-bold text-center">Qu'en pensez-vous ?</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 md:space-y-8 px-3 md:px-6">
          <div className="space-y-4">
            <RadioGroup
              value={generalFeedback || ""}
              onValueChange={setGeneralFeedback}
              className="flex flex-wrap justify-center gap-3"
            >
              <div className="flex flex-col items-center">
                <div className={`rounded-md border border-input p-2 cursor-pointer transition-colors ${generalFeedback === "useful" ? "bg-prepera-blue text-white" : "bg-white"}`}>
                  <RadioGroupItem value="useful" id="useful" className="hidden" />
                  <Label htmlFor="useful" className="cursor-pointer px-3 py-1 whitespace-nowrap">C'est utile</Label>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className={`rounded-md border border-input p-2 cursor-pointer transition-colors ${generalFeedback === "wrong" ? "bg-prepera-blue text-white" : "bg-white"}`}>
                  <RadioGroupItem value="wrong" id="wrong" className="hidden" />
                  <Label htmlFor="wrong" className="cursor-pointer px-3 py-1 whitespace-nowrap">Quelque chose ne va pas</Label>
                </div>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="comment" className="font-medium">Avez-vous des commentaires ou des suggestions ?</Label>
            <Textarea 
              id="comment"
              placeholder="Partagez vos suggestions"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px] md:min-h-[120px]"
            />
          </div>

          <div className="space-y-4 md:space-y-6">
            <h3 className="text-base md:text-lg font-medium">Sur une échelle de 1 à 5, évaluez les points suivants :</h3>

            <div className="space-y-5 md:space-y-6">
              <div className="space-y-2">
                <Label className="font-medium text-sm md:text-base">Les questions étaient-elles adaptées au métier sélectionné ?</Label>
                <StarRating rating={jobRelevanceRating} onChange={setJobRelevanceRating} size={isMobile ? 20 : 24} />
              </div>

              <div className="space-y-2">
                <Label className="font-medium text-sm md:text-base">Le feedback de l'IA était-il utile pour vous améliorer ?</Label>
                <StarRating rating={aiFeedbackRating} onChange={setAiFeedbackRating} size={isMobile ? 20 : 24} />
              </div>

              <div className="space-y-2">
                <Label className="font-medium text-sm md:text-base">Quelle note donneriez-vous au prototype dans l'état actuel ?</Label>
                <StarRating rating={prototypeRating} onChange={setPrototypeRating} size={isMobile ? 20 : 24} />
              </div>

              <div className="space-y-2">
                <Label className="font-medium text-sm md:text-base">Sur une échelle de 1 à 5, dans quelle mesure l'interface est-elle facile à naviguer ?</Label>
                <StarRating rating={uiNavigationRating} onChange={setUiNavigationRating} size={isMobile ? 20 : 24} />
              </div>
            </div>
          </div>

          <div className="text-xs md:text-sm text-muted-foreground">
            Les données que vous fournissez nous aident à améliorer notre plateforme.
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between pt-2 px-3 md:px-6">
          <Button 
            variant="outline"
            onClick={() => navigate("/")}
            disabled={isSubmitting}
            className="text-sm md:text-base"
          >
            Passer
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="text-sm md:text-base"
          >
            {isSubmitting ? "Envoi en cours..." : "Soumettre"}
          </Button>
        </CardFooter>
      </Card>
    </PageContainer>
  );
};

export default Feedback;
