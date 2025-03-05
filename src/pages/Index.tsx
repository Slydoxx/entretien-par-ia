import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [jobTitle, setJobTitle] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [jobOffer, setJobOffer] = useState<string>("");
  const [filteredJobs, setFilteredJobs] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const jobs = {
    // Développement
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
    "Développeur Full-Stack": `Description du poste : Nous recherchons un(e) Développeur Full-Stack en alternance pour participer au développement complet de nos applications.

Responsabilités :
- Développer des fonctionnalités côté client et serveur
- Collaborer avec l'équipe produit
- Participer à l'amélioration continue de l'architecture technique`,
    
    // Systèmes et réseaux
    "Technicien Systèmes et Réseaux": `Description du poste : Nous recherchons un(e) Technicien Systèmes et Réseaux en alternance pour assister notre équipe IT.

Responsabilités :
- Assurer le support technique et la maintenance du parc informatique
- Participer à la gestion de l'infrastructure réseau
- Contribuer à la sécurisation des systèmes d'information`,
    "Administrateur Systèmes": `Description du poste : Nous recherchons un(e) Administrateur Systèmes en alternance pour rejoindre notre équipe infrastructure.

Responsabilités :
- Installer et configurer les serveurs et systèmes
- Gérer les sauvegardes et la continuité de service
- Participer aux projets d'évolution de l'infrastructure`,
    
    // Commerce
    "Business Developer": `Description du poste : Nous recherchons un(e) Business Developer en alternance pour contribuer au développement de notre activité.

Responsabilités :
- Identifier et démarcher de nouveaux clients potentiels
- Construire et maintenir un réseau professionnel
- Participer à l'élaboration de stratégies commerciales innovantes`,
    "Commercial(e) B2B": `Description du poste : Nous recherchons un(e) Commercial(e) B2B en alternance pour développer notre portefeuille clients entreprises.

Responsabilités :
- Prospecter et développer un portefeuille de clients professionnels
- Négocier et conclure des contrats commerciaux
- Assurer le suivi et la fidélisation des clients professionnels`,
    "Assistant(e) Commercial(e)": `Description du poste : Rejoignez notre équipe commerciale en tant qu'Assistant(e) Commercial(e) en alternance.

Responsabilités :
- Prospecter et suivre une clientèle de professionnels
- Participer aux rendez-vous commerciaux
- Contribuer à l'élaboration des offres commerciales`,
    "Chargé(e) de Clientèle": `Description du poste : Nous recherchons un(e) Chargé(e) de Clientèle en alternance pour gérer et développer notre portefeuille clients.

Responsabilités :
- Accueillir et conseiller les clients
- Analyser les besoins et proposer des solutions adaptées
- Assurer le suivi des dossiers clients`,
    
    // Communication
    "Assistant(e) Communication": `Description du poste : Nous recherchons un(e) Assistant(e) Communication en alternance pour renforcer notre équipe.

Responsabilités :
- Participer à l'élaboration de la stratégie de communication
- Rédiger des contenus pour différents supports
- Assister à l'organisation d'événements`,
    "Community Manager": `Description du poste : Devenez Community Manager en alternance et gérez notre présence sur les réseaux sociaux.

Responsabilités :
- Animer nos communautés sur les différentes plateformes
- Créer et planifier du contenu engageant
- Analyser les performances et proposer des améliorations`,
    
    // Événementiel
    "Assistant(e) Chef de Projet Événementiel": `Description du poste : Nous recherchons un(e) Assistant(e) Chef de Projet Événementiel en alternance pour rejoindre notre agence.

Responsabilités :
- Participer à la conception et à l'organisation d'événements
- Coordonner les prestataires et fournisseurs
- Assurer le suivi logistique et administratif des projets`,
    "Chargé(e) de Production Événementielle": `Description du poste : Rejoignez notre équipe en tant que Chargé(e) de Production Événementielle en alternance.

Responsabilités :
- Participer à la préparation technique des événements
- Coordonner les équipes techniques sur le terrain
- Assurer le bon déroulement logistique des manifestations`,
  };

  useEffect(() => {
    if (jobTitle === "") {
      setFilteredJobs([]);
      return;
    }

    const filtered = Object.keys(jobs).filter(job => 
      job.toLowerCase().includes(jobTitle.toLowerCase())
    );
    
    setFilteredJobs(filtered);
  }, [jobTitle]);

  const handleJobTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setJobTitle(value);
    
    // Show suggestions when typing
    setShowSuggestions(value.length > 0);
    
    // If the job title doesn't match exactly a job in the list, clear the description
    if (!Object.keys(jobs).includes(value)) {
      // Keep the description if it was manually modified
      if (jobs[value as keyof typeof jobs] === jobDescription) {
        setJobDescription("");
      }
    }
  };

  const handleSelectJob = (job: string) => {
    setJobTitle(job);
    setJobDescription(jobs[job as keyof typeof jobs]);
    setShowSuggestions(false);
  };

  const handleJobDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescription(e.target.value);
  };

  const handleJobOfferChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobOffer(e.target.value);
  };

  const handleStart = () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Description requise",
        description: "Veuillez saisir une description pour continuer.",
        variant: "destructive",
      });
      return;
    }

    navigate(`/select-questions`, { 
      state: { 
        job: jobTitle || "Personnalisé",
        description: jobDescription,
        jobOffer: jobOffer.trim() || undefined
      } 
    });
  };

  // When a job is selected from the list, set the description
  useEffect(() => {
    if (jobTitle && jobs[jobTitle as keyof typeof jobs]) {
      setJobDescription(jobs[jobTitle as keyof typeof jobs]);
    }
  }, [jobTitle]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-8 animate-fade-in">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-prepera-blue">
          Sélectionne ton métier
        </h1>
      </div>

      <div className="w-full max-w-3xl mx-auto space-y-4">
        <div className="relative">
          <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-prepera-blue focus-within:border-prepera-blue">
            <Search className="ml-3 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Entrez votre métier d'alternance..."
              value={jobTitle}
              onChange={handleJobTitleChange}
              onFocus={() => setShowSuggestions(jobTitle.length > 0)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          
          {showSuggestions && filteredJobs.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
              <ul className="py-1 divide-y divide-gray-100">
                {filteredJobs.map((job) => (
                  <li 
                    key={job}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-left"
                    onClick={() => handleSelectJob(job)}
                  >
                    {job}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="description">Description du poste</TabsTrigger>
            <TabsTrigger value="offer">Offre d'emploi (optionnel)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description">
            <Textarea
              placeholder="Description du poste - modifiez si nécessaire"
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
