
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

const Feedback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [generalFeedback, setGeneralFeedback] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  
  // États pour les notations par étoiles
  const [jobRelevanceRating, setJobRelevanceRating] = useState(0);
  const [aiFeedbackRating, setAiFeedbackRating] = useState(0);
  const [prototypeRating, setPrototypeRating] = useState(0);
  const [uiNavigationRating, setUiNavigationRating] = useState(0);

  const handleSubmit = () => {
    // Ici vous pourriez envoyer les données à une API
    console.log({
      generalFeedback,
      jobRelevanceRating,
      aiFeedbackRating,
      prototypeRating,
      uiNavigationRating,
      comment
    });
    
    toast({
      title: "Merci pour votre retour !",
      description: "Votre feedback a été envoyé avec succès.",
    });
    
    // Rediriger vers la page d'accueil après soumission
    navigate("/");
  };

  return (
    <PageContainer>
      <Card className="w-full max-w-4xl mx-auto animate-fade-in shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Qu'en pensez-vous ?</CardTitle>
          <CardDescription className="text-center">
            Aidez-nous à améliorer notre application avec votre feedback
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Section de feedback général */}
          <div className="space-y-4">
            <RadioGroup
              value={generalFeedback || ""}
              onValueChange={setGeneralFeedback}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="useful" id="useful" />
                <Label htmlFor="useful" className="cursor-pointer">C'est utile</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="wrong" id="wrong" />
                <Label htmlFor="wrong" className="cursor-pointer">Quelque chose ne va pas</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="not_relevant" id="not_relevant" />
                <Label htmlFor="not_relevant" className="cursor-pointer">Ce n'est pas pertinent</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="not_useful" id="not_useful" />
                <Label htmlFor="not_useful" className="cursor-pointer">Ce n'est pas utile</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Questions avec notation par étoiles */}
          <div className="space-y-6 pt-4 border-t">
            <h3 className="text-lg font-medium">Sur une échelle de 1 à 5, évaluez les points suivants :</h3>

            <div className="space-y-6">
              {/* Question 1 */}
              <div className="space-y-2">
                <Label className="font-medium">Les questions étaient-elles adaptées au métier sélectionné ?</Label>
                <StarRating rating={jobRelevanceRating} onChange={setJobRelevanceRating} />
              </div>

              {/* Question 2 */}
              <div className="space-y-2">
                <Label className="font-medium">Le feedback de l'IA était-il utile pour vous améliorer ?</Label>
                <StarRating rating={aiFeedbackRating} onChange={setAiFeedbackRating} />
              </div>

              {/* Question 3 */}
              <div className="space-y-2">
                <Label className="font-medium">Quelle note donneriez-vous au prototype dans l'état actuel ?</Label>
                <StarRating rating={prototypeRating} onChange={setPrototypeRating} />
              </div>

              {/* Question 4 */}
              <div className="space-y-2">
                <Label className="font-medium">Sur une échelle de 1 à 5, dans quelle mesure l'interface est-elle facile à naviguer ?</Label>
                <StarRating rating={uiNavigationRating} onChange={setUiNavigationRating} />
              </div>
            </div>
          </div>

          {/* Commentaires ou suggestions */}
          <div className="space-y-2 pt-4 border-t">
            <Label htmlFor="comment" className="font-medium">Avez-vous des commentaires ou des suggestions ?</Label>
            <Textarea 
              id="comment"
              placeholder="Partagez vos suggestions"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          <div className="text-sm text-muted-foreground">
            Les données que vous fournissez nous aident à améliorer notre plateforme.
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline"
            onClick={() => navigate("/")}
          >
            Annuler
          </Button>
          <Button onClick={handleSubmit}>
            Soumettre
          </Button>
        </CardFooter>
      </Card>
    </PageContainer>
  );
};

export default Feedback;
