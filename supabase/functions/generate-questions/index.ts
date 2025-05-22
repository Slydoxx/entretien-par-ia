
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate API key first
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is missing. Please set the OPENAI_API_KEY environment variable.');
    }

    const { jobTitle, jobDescription, jobOffer } = await req.json();

    if (!jobTitle && !jobDescription) {
      throw new Error("Le titre du poste ou la description est requis");
    }

    let promptContent = `
Tu es un expert en recrutement spécialisé dans la préparation d'entretiens pour étudiants en alternance ou à la recherche de stages.
Génère 12 questions d'entretien pertinentes pour un poste de ${jobTitle}.

Ces questions doivent sonner naturelles, comme si elles étaient posées par un vrai recruteur lors d'un entretien. Évite le langage trop formel ou robotique.
Utilise un ton conversationnel et amical, comme lors d'une vraie discussion entre humains.

Important:
- Formule les questions de façon simple et directe
- Utilise la deuxième personne ("tu" ou "vous")
- Évite les phrases trop longues ou complexes
- Évite le jargon RH ou les formulations artificielles
- Sois concret et spécifique au poste

Voici la description du poste:
${jobDescription}
`;

    // Add job offer if provided
    if (jobOffer && jobOffer.trim()) {
      promptContent += `
Voici également l'offre d'emploi complète qui contient des informations supplémentaires:
${jobOffer}
`;
    }

    promptContent += `
Divise les questions en 4 thèmes principaux pertinents pour ce poste d'alternance (3 questions par thème):
- Compétences techniques (adaptées au niveau étudiant)
- Formation et projets académiques
- Soft skills et travail d'équipe
- Motivation et projet professionnel

Pour chaque question:
1. Formule-la comme lors d'une vraie conversation, de façon naturelle
2. Garde-la concise et facile à comprendre
3. Assure-toi qu'elle soit adaptée à un profil junior/étudiant
4. Évite les formulations du type "Pouvez-vous me parler de..." ou "Pourriez-vous décrire..." pour toutes les questions
5. Varie les formulations pour que les questions ne se ressemblent pas toutes

Exemples de formulations naturelles:
- "Qu'est-ce qui t'a attiré vers ce domaine?"
- "As-tu déjà travaillé sur [compétence spécifique]?"
- "Comment tu t'organises quand tu as plusieurs projets en même temps?"
- "Raconte-moi un projet dont tu es fier"

Renvoie tes résultats au format JSON structuré comme ceci:
{
  "themes": [
    {
      "name": "Nom du thème 1",
      "questions": ["Question 1", "Question 2", "Question 3"]
    },
    {
      "name": "Nom du thème 2",
      "questions": ["Question 1", "Question 2", "Question 3"]
    },
    {
      "name": "Nom du thème 3",
      "questions": ["Question 1", "Question 2", "Question 3"]
    },
    {
      "name": "Nom du thème 4",
      "questions": ["Question 1", "Question 2", "Question 3"]
    }
  ]
}

N'inclus aucun autre texte ou explication en dehors de ce JSON.
`;

    // Implement retry logic for OpenAI API calls
    const callOpenAI = async (retryCount = 0, maxRetries = 2) => {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'Tu es un assistant spécialisé dans les entretiens professionnels pour étudiants en alternance. Tu formules tes questions de façon naturelle et conversationnelle.' },
              { role: 'user', content: promptContent }
            ],
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error(`OpenAI API error (status ${response.status}):`, errorData);
          
          // If we get a rate limit error (429) or server error (5xx), retry
          if ((response.status === 429 || response.status >= 500) && retryCount < maxRetries) {
            // Exponential backoff: wait longer between retries
            const delay = 1000 * Math.pow(2, retryCount);
            console.log(`Retrying OpenAI API call in ${delay}ms... (${retryCount + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return callOpenAI(retryCount + 1, maxRetries);
          }
          
          throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
        }

        return await response.json();
      } catch (error) {
        console.error(`OpenAI API call failed (attempt ${retryCount + 1}):`, error);
        
        // Retry on network errors
        if (retryCount < maxRetries && !(error.message && error.message.includes('API key'))) {
          const delay = 1000 * Math.pow(2, retryCount);
          console.log(`Retrying after network error in ${delay}ms... (${retryCount + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return callOpenAI(retryCount + 1, maxRetries);
        }
        
        throw error;
      }
    };

    // Call OpenAI with retry logic
    const data = await callOpenAI();
    let result;

    try {
      // Try to parse the content as JSON directly
      const content = data.choices[0].message.content.trim();
      
      // Handle cases where the AI might have wrapped the JSON in code blocks
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                        content.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, content]; // If no code blocks, use the entire content
      
      if (jsonMatch && jsonMatch[1]) {
        result = JSON.parse(jsonMatch[1]);
      } else {
        // Try direct parse
        result = JSON.parse(content);
      }
      
      console.log("Successfully parsed themes and questions");
    } catch (parseError) {
      console.error("Failed to parse response:", parseError);
      
      // Fallback: create a basic structure with available questions
      const contentStr = data.choices[0].message.content;
      const questionMatches = contentStr.match(/"([^"]+)"/g);
      
      if (questionMatches && questionMatches.length > 0) {
        const questions = questionMatches
          .map(q => q.replace(/"/g, ''))
          .filter(q => q.length > 10);
        
        // Split questions into 4 themes as fallback
        const questionsPerTheme = Math.ceil(questions.length / 4);
        result = {
          themes: [
            {
              name: "Compétences techniques",
              questions: questions.slice(0, questionsPerTheme)
            },
            {
              name: "Formation et projets académiques",
              questions: questions.slice(questionsPerTheme, questionsPerTheme * 2)
            },
            {
              name: "Soft skills",
              questions: questions.slice(questionsPerTheme * 2, questionsPerTheme * 3)
            },
            {
              name: "Motivation et projet professionnel",
              questions: questions.slice(questionsPerTheme * 3)
            }
          ]
        };
      } else {
        // Last resort: create generic themes with empty question arrays
        result = {
          themes: [
            { name: "Compétences techniques", questions: [] },
            { name: "Formation et projets académiques", questions: [] },
            { name: "Soft skills", questions: [] },
            { name: "Motivation et projet professionnel", questions: [] }
          ]
        };
      }
    }

    // Ensure we have exactly 4 themes with 3 questions each
    result.themes = result.themes.slice(0, 4).map(theme => {
      // Ensure each theme has exactly 3 questions
      if (theme.questions.length > 3) {
        theme.questions = theme.questions.slice(0, 3);
      }
      return theme;
    });

    // Flatten the questions for backward compatibility
    const flatQuestions = result.themes.flatMap(theme => theme.questions);

    return new Response(JSON.stringify({ 
      themes: result.themes,
      questions: flatQuestions
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-questions function:', error);
    
    let statusCode = 500;
    let errorMessage = error.message || "Une erreur inconnue s'est produite";
    
    // Provide more specific error messages
    if (errorMessage.includes('API key')) {
      errorMessage = "Erreur d'authentification avec l'API OpenAI: clé API invalide ou manquante";
      statusCode = 401;
    } else if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
      errorMessage = "Limite d'utilisation de l'API OpenAI atteinte";
      statusCode = 429;
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      detail: error.toString()
    }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
