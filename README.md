
# Entretien-par-IA

**Entretien-par-IA** est une application web qui permet d'enregistrer des audios (comme des entretiens) et de les transcrire automatiquement grâce à l'API OpenAI Whisper. Elle est construite avec React, utilise Supabase pour une architecture serverless, et offre une interface utilisateur intuitive et moderne.

## Aperçu
- **Frontend** : React avec Vite, Tailwind CSS, et composants UI optimisés.
- **Backend** : Supabase Edge Functions pour une gestion serverless.
- **API** : OpenAI Whisper pour la transcription audio.
- **UI** : Interface utilisateur améliorée pour une expérience fluide et professionnelle.

## Pourquoi serverless avec Supabase ?
J'ai choisi une approche serverless avec Supabase pour les raisons suivantes :
- **Rapidité de livraison** : Ce prototype a été livré en une journée, grâce à l'efficacité de Supabase.
- **Simplicité d'installation** : Pas besoin de configurer un serveur, tout est géré par Supabase.
- **Scalabilité automatique** : L'application s'adapte à la demande, même si le nombre d'utilisateurs augmente.
- **Coût réduit** : Vous payez uniquement pour l'utilisation réelle (appels à la Edge Function), et non un serveur fixe.

### Comment ça fonctionne ?
1. L'interface React (accessible via navigateur) capture l'audio de l'utilisateur.
2. L'audio est envoyé à une Edge Function hébergée sur Supabase (`transcribe-audio`).
3. La fonction appelle l'API OpenAI Whisper pour transcrire l'audio et renvoie le texte.
4. La transcription s'affiche dans l'interface utilisateur.

## Prérequis
Avant de commencer, assurez-vous d'avoir :
- Un compte [Supabase](https://supabase.com/) (inscription gratuite).
- Une clé API OpenAI ([obtenez-la ici](https://platform.openai.com/)).
- Un serveur web pour héberger le frontend (ex. Apache, Nginx, ou un hébergement comme Netlify).
- Node.js et npm installés pour construire le projet.
- La CLI Supabase : installez-la avec `npm install -g supabase`.

## Installation
Suivez ces étapes pour installer et déployer l'application :

### 1. Clonez le dépôt
Clonez le projet depuis GitHub et naviguez dans le dossier :
```bash
git clone https://github.com/Slydoxx/entretien-o-matic.git
cd entretien-o-matic
```

### 2. Installez les dépendances
Installez les dépendances nécessaires pour le frontend :
```bash
npm install
```

### 3. Configurez un projet Supabase
Inscrivez-vous sur Supabase et créez un nouveau projet (ex. nom : entretien-o-matic, choisissez une région proche).

Notez l'ID du projet (ex. abc123) depuis le Dashboard Supabase (Settings > General).

### 4. Déployez la Edge Function
Déployez la fonction transcribe-audio qui gère la transcription :
Connectez-vous à la CLI Supabase :
```bash
supabase login
```

Liez votre projet local à Supabase :
```bash
supabase link --project-ref abc123
```

Déployez la fonction :
```bash
cd supabase/functions/transcribe-audio
supabase functions deploy transcribe-audio --project-ref abc123
```

Ajoutez la clé API OpenAI dans Supabase :
Allez dans Dashboard > Settings > Environment Variables.

Ajoutez une variable OPENAI_API_KEY avec votre clé OpenAI.

Notez l'URL de la fonction (ex. https://abc123.supabase.co/functions/v1/transcribe-audio).

### 5. Configurez l'application
Mettez à jour le fichier de configuration pour pointer vers votre Edge Function :
Ouvrez src/transcriptionService.ts (ou le fichier équivalent qui appelle l'API).

Remplacez l'URL placeholder par l'URL de votre fonction (ex. https://abc123.supabase.co/functions/v1/transcribe-audio).

### 6. Construisez et déployez le frontend
Construisez le projet React et déployez-le sur votre serveur :
Construisez le projet :
```bash
npm run build
```

Copiez le dossier dist/ généré vers votre serveur web (ex. /var/www/html pour Apache, ou utilisez un hébergement comme Netlify).

Assurez-vous que votre domaine (ex. app.mondomaine.com) pointe vers ce dossier.

## Utilisation
Accédez à votre application via l'URL (ex. app.mondomaine.com).

Cliquez sur le bouton "Start" pour commencer l'enregistrement audio.

Cliquez sur "Stop" pour arrêter et lancer la transcription.

La transcription s'affiche à l'écran une fois terminée.

## Limitations
Compatibilité iOS/Safari : L'application ne fonctionne pas correctement sur iPhone/Safari en raison d'un bug avec l'enregistrement audio (format non supporté). Une solution sera proposée ultérieurement.

Solution temporaire : Utilisez Android ou un navigateur desktop (Chrome, Firefox), ou pré-enregistrez un fichier MP3.

Stockage : Pas de base de données persistante (les transcriptions ne sont pas sauvegardées).

## Support
Pour toute question ou problème, contactez-moi à [votre e-mail] ou [votre numéro].

Support initial disponible jusqu'au 19/03/2025.

Si vous souhaitez des améliorations (ex. compatibilité iPhone, stockage des transcriptions), je peux vous fournir un devis personnalisé.

## Développement
Technologies : React, Vite, Tailwind CSS, Supabase, OpenAI Whisper.

UI : Interface optimisée avec Lovable pour une meilleure expérience utilisateur.

Structure :
- `src/components/ui/` : Composants réutilisables (boutons, cartes, etc.).
- `supabase/functions/transcribe-audio/` : Edge Function pour la transcription.
- `pages/` : Pages principales de l'application (ex. index.tsx).

## Crédits
Développé par Elano, spécialiste des prototypes rapides.
