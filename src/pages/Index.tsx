
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-mentorgoal-darkBlue text-white">
        <div className="p-4 border-b border-gray-700 flex items-center">
          <span className="text-sm font-medium">MENTOR GOAL</span>
        </div>
        <nav className="p-4">
          <ul className="space-y-4">
            <li className="py-2">Mon dashboard</li>
            <li className="py-2">Mes candidatures</li>
            <li className="py-2 font-medium text-mentorgoal-orange">Génération par IA</li>
            <li className="py-2">Candidatures spontanées</li>
            <li className="py-2 flex items-center justify-between">
              Jobthèque
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </li>
            <li className="py-2 flex items-center justify-between">
              Mes ressources
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </li>
            <li className="py-2">Événements</li>
            <li className="py-2 bg-gray-600 px-2 rounded">Préparer mon entretien</li>
            <li className="py-2 mt-8">Aide</li>
            <li className="py-2">Vos suggestions</li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl">
          <h1 className="text-2xl font-bold mb-8 text-mentorgoal-darkBlue">
            Préparation aux entretiens
          </h1>

          <section className="mb-12">
            <h2 className="text-lg font-semibold text-mentorgoal-orange mb-3">Qu'est-ce que Prepera ?</h2>
            <p className="text-gray-700 mb-4">
              Prepera est une plateforme partenaire de Mentor Goal, qui te permettra de préparer tes futurs entretiens d'embauche. Tu seras guidé.e en fonction de tes besoins, de ton métier et de ton expérience.
            </p>
            <button className="text-mentorgoal-orange font-medium">En savoir plus</button>
          </section>

          <section className="mb-12">
            <h2 className="text-lg font-semibold text-mentorgoal-orange mb-3">Comment ça marche ?</h2>
            <p className="text-gray-700 mb-4">
              C'est simple d'utilisation : cet outil te permettra de structurer ta préparation et de t'entraîner aux questions des recruteurs !
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-lg font-semibold text-mentorgoal-orange mb-3">Que te propose ce partenaire ?</h2>
            <p className="text-gray-700 mb-4">
              Une expérience avec de multiples entretiens vidéos auprès d'experts : pitch, entretien RH, entretien technique...
            </p>
          </section>

          <div className="mt-8 space-y-6">
            <div className="flex flex-wrap gap-2">
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

            <div className="space-y-4">
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
                className="w-full flex items-center justify-center space-x-2 py-6 text-lg bg-mentorgoal-orange hover:bg-mentorgoal-orange/90 text-white transition-all duration-300"
              >
                <span>Générer les questions</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

            <div className="text-sm text-gray-500 p-4 border border-gray-200 rounded bg-gray-50">
              En cliquant sur ce bouton, vous serez redirigé(e) vers un site tiers et vos données personnelles ne seront pas conservées une fois que vous aurez quitté notre plateforme.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
