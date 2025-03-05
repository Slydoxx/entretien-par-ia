
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="max-w-3xl w-full bg-white rounded-xl shadow-md p-8">
        <Link to="/" className="inline-flex items-center mb-6 text-gray-600 hover:text-blue-600">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à l'accueil
        </Link>
        
        <h1 className="text-3xl font-bold mb-6 text-gray-900">À propos de Entretien par IA</h1>
        
        <div className="space-y-4 text-gray-700">
          <p>
            <strong>Entretien par IA</strong> est une application conçue pour vous aider à préparer vos entretiens 
            d'embauche en générant des questions personnalisées basées sur votre profil professionnel.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 my-6">
            <h2 className="text-xl font-semibold mb-2 text-blue-900">Créateurs</h2>
            <p><strong>Développé par :</strong> Elano</p>
            <p><strong>Projet dirigé par :</strong> Thomas Szydlo</p>
          </div>
          
          <h2 className="text-xl font-semibold mt-6 mb-2">Comment ça marche</h2>
          <p>
            1. Sélectionnez un poste ou entrez une description personnalisée<br />
            2. Notre IA générera des questions pertinentes pour votre entretien<br />
            3. Pratiquez en répondant aux questions et recevez un feedback de l'IA<br />
            4. Téléchargez un rapport PDF pour conserver vos réponses et analyses
          </p>
          
          <p className="mt-6">
            Cette application ne stocke aucune de vos réponses dans une base de données. 
            Toutes vos données restent localement dans votre navigateur pour assurer votre confidentialité.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
