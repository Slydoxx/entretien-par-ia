
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [jobOffer, setJobOffer] = useState<string>("");
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const jobs = {
    "Développeur Web Front-End": `Description du poste : Nous recherchons un(e) Développeur Web Front-End en alternance pour rejoindre notre équipe tech. Vous participerez au développement de nos interfaces utilisateur.

Responsabilités :
- Développer des interfaces utilisateur réactives et intuitives
- Collaborer avec les designers UX/UI
- Implémenter des fonctionnalités avec HTML, CSS et JavaScript/React/Vue`,
    "Développeur Web Back-End": `Description du poste : Nous recherchons un(e) Développeur Web Back-End en alternance pour rejoindre notre équipe technique.

Responsabilités :
- Concevoir et développer des API REST/GraphQL
- Optimiser les performances des applications
- Gérer les bases de données et l'architecture serveur`,
    "Développeur Mobile": `Description du poste : Nous recherchons un(e) Développeur Mobile en alternance pour créer des applications natives ou hybrides.

Responsabilités :
- Développer des applications mobiles pour iOS et/ou Android
- Assurer la compatibilité avec différents appareils
- Optimiser les performances des applications`,
    "Assistant(e) Marketing Digital": `Description du poste : Rejoignez notre équipe marketing en tant qu'Assistant(e) Marketing Digital en alternance.

Responsabilités :
- Gérer les réseaux sociaux et les campagnes digitales
- Analyser les performances des actions marketing
- Participer à la création de contenu multimédia`,
    "Assistant(e) Communication": `Description du poste : Nous recherchons un(e) Assistant(e) Communication en alternance pour renforcer notre équipe.

Responsabilités :
- Participer à l'élaboration de la stratégie de communication
- Rédiger des contenus pour différents supports
- Assister à l'organisation d'événements`,
    "Assistant(e) Commercial(e)": `Description du poste : Rejoignez notre équipe commerciale en tant qu'Assistant(e) Commercial(e) en alternance.

Responsabilités :
- Prospecter et suivre une clientèle de professionnels
- Participer aux rendez-vous commerciaux
- Contribuer à l'élaboration des offres commerciales`,
    "Chargé(e) de Projet Digital": `Description du poste : Nous recherchons un(e) Chargé(e) de Projet Digital en alternance pour coordonner nos projets web.

Responsabilités :
- Coordonner les différentes phases des projets digitaux
- Assurer le suivi du cahier des charges et des délais
- Faire le lien entre les équipes techniques et clients`,
    "Community Manager": `Description du poste : Devenez Community Manager en alternance et gérez notre présence sur les réseaux sociaux.

Responsabilités :
- Animer nos communautés sur les différentes plateformes
- Créer et planifier du contenu engageant
- Analyser les performances et proposer des améliorations`,
    "Data Analyst Junior": `Description du poste : Nous recherchons un(e) Data Analyst Junior en alternance pour exploiter nos données.

Responsabilités :
- Collecter et analyser des données
- Créer des tableaux de bord et des visualisations
- Formuler des recommandations basées sur les données`,
    "UX/UI Designer Junior": `Description du poste : Rejoignez notre équipe design en tant que UX/UI Designer Junior en alternance.

Responsabilités :
- Concevoir des wireframes et des maquettes
- Réaliser des tests utilisateurs
- Collaborer avec l'équipe de développement`
  };

  const handleJobSelection = (job: string) => {
    setSelectedJob(job);
    setJobDescription(jobs[job as keyof typeof jobs] || "");
    setShowCustomInput(false);
  };

  const handleJobDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescription(e.target.value);
    if (selectedJob && e.target.value !== jobs[selectedJob as keyof typeof jobs]) {
      setSelectedJob("");
    }
  };

  const handleJobOfferChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobOffer(e.target.value);
  };

  const handleCustomClick = () => {
    setShowCustomInput(true);
    setSelectedJob("");
    setJobDescription("");
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

    navigate(`/select-questions`, { 
      state: { 
        job: selectedJob || "Personnalisé",
        description: jobDescription,
        jobOffer: jobOffer.trim() || undefined
      } 
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-8 animate-fade-in">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-prepera-blue">
          Sélectionne ton métier d'alternance
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
        <button
          onClick={handleCustomClick}
          className={`job-button ${showCustomInput ? "selected" : ""}`}
        >
          Rédiger ma propre description
        </button>
      </div>

      <div className="w-full max-w-3xl mx-auto space-y-4">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="description">Description du poste</TabsTrigger>
            <TabsTrigger value="offer">Offre d'emploi (optionnel)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description">
            <Textarea
              placeholder={showCustomInput ? "Rédigez ou collez la description de votre poste ici" : "Sélectionnez un métier ci-dessus ou rédigez votre propre description"}
              value={jobDescription}
              onChange={handleJobDescriptionChange}
              className="min-h-[200px] p-4 text-base"
            />
            <div className="text-right text-sm text-gray-500 mt-2">
              {5000 - jobDescription.length} caractères restants
            </div>
          </TabsContent>
          
          <TabsContent value="offer">
            <Textarea
              placeholder="Collez l'offre d'emploi complète ici pour obtenir des questions plus ciblées (optionnel)"
              value={jobOffer}
              onChange={handleJobOfferChange}
              className="min-h-[200px] p-4 text-base"
            />
            <div className="text-right text-sm text-gray-500 mt-2">
              {10000 - jobOffer.length} caractères restants
            </div>
          </TabsContent>
        </Tabs>

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
