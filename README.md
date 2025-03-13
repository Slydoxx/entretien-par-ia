
# Entretien-par-IA

**Entretien-par-IA** est une solution d'enregistrement et de transcription audio qui s'intègre facilement dans une application web existante. Elle permet d'enregistrer des entretiens et de les transcrire automatiquement grâce à l'API OpenAI Whisper, le tout via une architecture serverless Supabase.

## Technologies utilisées
- **Frontend** : React avec Vite, Tailwind CSS, shadcn/ui
- **Backend serverless** : Supabase Edge Functions
- **API externe** : OpenAI Whisper pour la transcription audio
- **Autres dépendances** : FFmpeg (traitement audio côté client)

## Guide d'intégration à votre application existante

Cette section explique comment intégrer cette solution à votre application web PHP/SQL existante.

### 1. Configuration de Supabase (pour les Edge Functions)

Même si votre application principale utilise PHP/SQL, les fonctions serverless nécessitent Supabase:

1. **Créez un compte Supabase** gratuit sur [supabase.com](https://supabase.com/)
2. **Créez un nouveau projet** (ex. "entretien-transcription")
3. **Notez les informations de connexion** depuis le Dashboard:
   - Project URL: `https://votre-id-projet.supabase.co`
   - API Key (anon/public): visible dans Project Settings > API

### 2. Déploiement des Edge Functions

Les Edge Functions sont des fonctions serverless qui traitent la transcription:

1. **Installez la CLI Supabase**:
   ```bash
   npm install -g supabase
   ```

2. **Connectez-vous et liez votre projet**:
   ```bash
   supabase login
   supabase link --project-ref votre-id-projet
   ```

3. **Déployez la fonction de transcription**:
   ```bash
   # Naviguez vers le dossier du projet
   cd chemin/vers/entretien-par-ia
   
   # Déployez la fonction
   supabase functions deploy transcribe-audio
   ```

4. **Configuration de la clé API OpenAI**:
   - Allez dans le Dashboard Supabase > Settings > API > Edge Functions
   - Ajoutez une variable d'environnement: `OPENAI_API_KEY` avec votre clé API OpenAI
   - Pour obtenir une clé API: [platform.openai.com](https://platform.openai.com/)

### 3. Intégration des composants dans votre application PHP

#### Option 1: Intégration via iframe (plus simple)

Si vous préférez ne pas modifier votre codebase PHP:

1. **Construisez l'application React**:
   ```bash
   cd chemin/vers/entretien-par-ia
   npm install
   npm run build
   ```

2. **Déployez les fichiers statiques** sur votre serveur dans un sous-dossier (ex: `/entretien-tool/`)

3. **Intégrez via iframe** dans vos pages PHP:
   ```html
   <iframe 
     src="/entretien-tool/index.html" 
     width="100%" 
     height="700px" 
     frameborder="0">
   </iframe>
   ```

#### Option 2: Intégration directe des composants (plus avancée)

Pour une intégration plus poussée:

1. **Extrayez les composants clés**:
   - `src/pages/Questions/components/AudioRecorder.tsx`: Pour l'enregistrement audio
   - `src/pages/Questions/components/AnswerInput.tsx`: Pour l'interface de saisie/transcription
   - Les services de transcription dans `src/pages/Questions/services/`

2. **Configurez les variables d'environnement**:
   Créez un fichier `.env` dans votre application avec:
   ```
   VITE_SUPABASE_URL=https://votre-id-projet.supabase.co
   VITE_SUPABASE_ANON_KEY=votre-clé-publique-supabase
   ```

3. **Modifiez le client Supabase** dans `src/integrations/supabase/client.ts`:
   - Remplacez les constantes par vos variables d'environnement

### 4. Configuration supplémentaire

#### Ajout de CORS sur votre serveur PHP

Si vous utilisez l'intégration directe, configurez CORS dans votre `.htaccess`:

```
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization"
</IfModule>
```

#### Modification du backend PHP pour stocker les transcriptions

Pour sauvegarder les transcriptions dans votre base de données SQL:

1. **Créez un point d'API PHP** (par exemple `/api/save-transcription.php`):
   ```php
   <?php
   header('Content-Type: application/json');
   
   // Récupération des données
   $input = file_get_contents('php://input');
   $data = json_decode($input, true);
   
   // Validation
   if (!isset($data['text']) || empty($data['text'])) {
       http_response_code(400);
       echo json_encode(['error' => 'Texte de transcription manquant']);
       exit;
   }
   
   // Connexion à la base de données (utilisez vos paramètres)
   $mysqli = new mysqli('localhost', 'user', 'password', 'database');
   
   if ($mysqli->connect_error) {
       http_response_code(500);
       echo json_encode(['error' => 'Erreur de connexion à la base de données']);
       exit;
   }
   
   // Préparez et exécutez la requête
   $stmt = $mysqli->prepare("INSERT INTO transcriptions (text, created_at) VALUES (?, NOW())");
   $stmt->bind_param("s", $data['text']);
   
   if ($stmt->execute()) {
       echo json_encode(['success' => true, 'id' => $mysqli->insert_id]);
   } else {
       http_response_code(500);
       echo json_encode(['error' => 'Erreur lors de l\'enregistrement']);
   }
   
   $stmt->close();
   $mysqli->close();
   ?>
   ```

2. **Modifiez le service de transcription frontend** pour envoyer les données à votre API PHP

## Limitations et solutions

### Compatibilité iOS/Safari
L'application peut rencontrer des problèmes avec les formats audio sur iOS/Safari. Solutions:

- Utilisation de FFmpeg pour la conversion des formats audio côté client
- Support de formats alternatifs (.m4a) pour iOS
- Fallback à une saisie manuelle si la transcription échoue

### Sécurité
- Limitez l'utilisation de votre clé API Supabase
- Ajoutez une authentification sur les points d'API sensibles
- Utilisez HTTPS pour toutes les communications

## Support technique

Pour toute question d'intégration ou problème, contactez [thomasszyd@gmail.com].

Support technique disponible.

Pour des fonctionnalités supplémentaires ou modifications, un devis personnalisé peut être fourni.

## Structure du code

```
entretien-par-ia/
├── src/
│   ├── components/ui/       # Composants d'interface réutilisables
│   ├── pages/Questions/     # Interface de questions et transcription
│   ├── integrations/        # Intégrations externes (Supabase)
│   └── services/            # Services (traitement audio, transcription)
├── supabase/
│   └── functions/           # Edge Functions Supabase
│       └── transcribe-audio/# Fonction de transcription
└── public/                  # Ressources statiques
```

## Crédits
Développé par Elano, spécialiste des prototypes rapides.
