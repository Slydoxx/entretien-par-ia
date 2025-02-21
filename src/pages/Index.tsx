
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
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const jobs = {
    "Analyste Business": `Description du poste : Nous recherchons un(e) Analyste Business pour rejoindre notre équipe. Ce rôle est parfait pour ceux qui débutent leur carrière et sont désireux d'analyser les besoins commerciaux et de proposer des solutions basées sur les données.

Responsabilités :
- Travailler en étroite collaboration avec les unités commerciales pour comprendre et analyser les besoins
- Traduire les besoins en spécifications fonctionnelles
- Réaliser des analyses de données approfondies`,
    "Chef de Produit": `Description du poste : Nous recherchons un(e) Chef de Produit pour diriger nos initiatives de développement produit.

Responsabilités :
- Définir la vision et la stratégie produit
- Collaborer avec les équipes techniques
- Réaliser des études de marché et des entretiens utilisateurs`,
    "Analyste de Données": `Description du poste : Nous recherchons un(e) Analyste de Données pour transformer les données en insights.

Responsabilités :
- Analyser des ensembles de données complexes
- Créer des tableaux de bord et des rapports
- Présenter les résultats aux parties prenantes`,
    "Designer UX/UI": `Description du poste : Rejoignez-nous en tant que Designer UX/UI pour créer des expériences utilisateur exceptionnelles.

Responsabilités :
- Concevoir des interfaces utilisateur
- Mener des recherches utilisateurs
- Créer des wireframes et des prototypes`,
    "Développeur": `Description du poste : Nous recherchons un(e) Développeur pour construire des produits exceptionnels.

Responsabilités :
- Écrire du code propre et maintenable
- Travailler avec des équipes pluridisciplinaires
- Concevoir et implémenter de nouvelles fonctionnalités`,
    "Ingénieur QA": `Description du poste : Rejoignez notre équipe QA pour assurer la qualité des produits.

Responsabilités :
- Développer et exécuter des cas de test
- Effectuer des tests manuels et automatisés
- Signaler et suivre les bugs`,
    "Spécialiste Marketing": `Description du poste : Nous recherchons un(e) Spécialiste Marketing pour stimuler la croissance.

Responsabilités :
- Planifier et exécuter des campagnes marketing
- Analyser les métriques marketing
- Créer des stratégies de contenu`,
    "Chargé(e) de Support Client": `Description du poste : Rejoignez notre équipe support pour aider nos clients à réussir.

Responsabilités :
- Répondre aux demandes des clients
- Résoudre les problèmes clients
- Maintenir la satisfaction client`,
    "Commercial(e)": `Description du poste : Nous recherchons un(e) Commercial(e) pour développer notre activité.

Responsabilités :
- Identifier et poursuivre les opportunités de vente
- Construire des relations clients
- Atteindre les objectifs de vente`,
    "Responsable RH": `Description du poste : Rejoignez notre équipe RH pour soutenir notre organisation en croissance.

Responsabilités :
- Gérer le processus de recrutement
- Gérer les relations avec les employés
- Maintenir les politiques et procédures RH`
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

    navigate(`/questions`, { 
      state: { 
        job: selectedJob || "Personnalisé",
        description: jobDescription 
      } 
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-8 animate-fade-in">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight">
          Sélectionne ton métier
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
        <Textarea
          placeholder={showCustomInput ? "Rédigez ou collez la description de votre poste ici" : "Sélectionnez un métier ci-dessus ou rédigez votre propre description"}
          value={jobDescription}
          onChange={handleJobDescriptionChange}
          className="min-h-[200px] p-4 text-base"
        />
        <div className="text-right text-sm text-gray-500">
          {5000 - jobDescription.length} caractères restants
        </div>

        <Button
          onClick={handleStart}
          className="w-full flex items-center justify-center space-x-2 py-6 text-lg bg-gray-900 hover:bg-gray-800 text-white transition-all duration-300"
        >
          <span>Générer les questions</span>
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default Index;
