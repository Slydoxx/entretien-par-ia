
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
    const { jobTitle, jobDescription, jobOffer } = await req.json();

    if (!jobTitle && !jobDescription) {
      throw new Error("Le titre du poste ou la description est requis");
    }

    let promptContent = `
Tu es un expert en recrutement spécialisé dans la préparation d'entretiens pour étudiants en alternance ou à la recherche de stages.
Génère 12 questions d'entretien pertinentes pour un poste de ${jobTitle}.

Ces questions doivent être spécifiquement adaptées au niveau d'un étudiant en alternance qui débute sa carrière professionnelle, tout en étant suffisamment exigeantes pour évaluer ses compétences et son potentiel d'apprentissage.

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
- Compétences techniques (spécifiques au métier, adaptées au niveau étudiant)
- Formation et projets académiques (mettant en valeur les compétences acquises en formation)
- Soft skills et travail d'équipe (particulièrement importants pour les alternants)
- Motivation et projet professionnel (pourquoi cette entreprise, ce secteur, cette alternance)

Pour chaque question:
1. Assure-toi qu'elle soit adaptée à un profil junior/étudiant en alternance
2. Formule-les de manière à ce que l'étudiant puisse valoriser son parcours académique et ses projets d'études
3. Évite les questions qui nécessitent une longue expérience professionnelle
4. Intègre des questions sur la capacité à apprendre et à s'adapter, essentielle en alternance
5. Prends en compte le rythme alternance école/entreprise dans tes questions

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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Tu es un assistant spécialisé dans les entretiens professionnels pour étudiants en alternance.' },
          { role: 'user', content: promptContent }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
