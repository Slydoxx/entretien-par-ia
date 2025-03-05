
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
Tu es un expert en recrutement spécialisé dans la création de questions d'entretien pertinentes et perspicaces. 
Génère 20 questions d'entretien pour un poste de ${jobTitle}.

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
Divise les questions en 4 thèmes principaux pertinents pour ce poste (5 questions par thème):
- Compétences techniques (spécifiques au métier)
- Expérience et réalisations
- Soft skills et travail d'équipe
- Motivation et adéquation avec le poste

Pour chaque question:
1. Assure-toi qu'elle soit spécifique au poste et au secteur
2. Sois précis et évite les questions trop génériques
3. Formule les questions de manière professionnelle et directe
4. Varie la difficulté et le type de questions pour chaque thème

Renvoie tes résultats au format JSON structuré comme ceci:
{
  "themes": [
    {
      "name": "Nom du thème 1",
      "questions": ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]
    },
    {
      "name": "Nom du thème 2",
      "questions": ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]
    },
    {
      "name": "Nom du thème 3",
      "questions": ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]
    },
    {
      "name": "Nom du thème 4",
      "questions": ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]
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
          { role: 'system', content: 'Tu es un assistant spécialisé dans les entretiens professionnels.' },
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
              name: "Expérience professionnelle",
              questions: questions.slice(questionsPerTheme, questionsPerTheme * 2)
            },
            {
              name: "Soft skills",
              questions: questions.slice(questionsPerTheme * 2, questionsPerTheme * 3)
            },
            {
              name: "Motivation et culture d'entreprise",
              questions: questions.slice(questionsPerTheme * 3)
            }
          ]
        };
      } else {
        // Last resort: create generic themes with empty question arrays
        result = {
          themes: [
            { name: "Compétences techniques", questions: [] },
            { name: "Expérience professionnelle", questions: [] },
            { name: "Soft skills", questions: [] },
            { name: "Motivation et culture d'entreprise", questions: [] }
          ]
        };
      }
    }

    // Ensure we have exactly 4 themes with 5 questions each
    result.themes = result.themes.slice(0, 4).map(theme => {
      // Ensure each theme has exactly 5 questions
      if (theme.questions.length > 5) {
        theme.questions = theme.questions.slice(0, 5);
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
