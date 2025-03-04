
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
    const { jobTitle, jobDescription } = await req.json();

    if (!jobTitle && !jobDescription) {
      throw new Error("Le titre du poste ou la description est requis");
    }

    const prompt = `
Tu es un expert en recrutement spécialisé dans la création de questions d'entretien pertinentes et perspicaces. 
Génère 20 questions d'entretien pour un poste de ${jobTitle}.

Voici la description du poste:
${jobDescription}

Critères pour les questions:
1. Les questions doivent être variées et couvrir différents aspects (compétences techniques, soft skills, expérience, etc.)
2. Les questions doivent être spécifiques au poste et au secteur
3. Évite les questions génériques que l'on peut poser à n'importe quel candidat
4. Formule les questions de manière professionnelle et directe
5. N'inclus pas de numéros ou de préfixes dans les questions

Renvoie uniquement un tableau JSON de 20 questions sans autre texte ou explication.
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
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    let questions = [];

    try {
      // Try to parse the content as JSON directly
      const content = data.choices[0].message.content.trim();
      
      // Handle cases where the AI might have wrapped the array in code blocks or added explanatory text
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                        content.match(/```\s*([\s\S]*?)\s*```/) ||
                        content.match(/\[([\s\S]*?)\]/);
      
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        // Try direct parse if no code blocks found
        questions = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("Failed to parse response:", parseError);
      
      // Fallback: extract array items using regex pattern matching
      const contentStr = data.choices[0].message.content;
      const questionMatches = contentStr.match(/"([^"]+)"/g);
      
      if (questionMatches && questionMatches.length > 0) {
        questions = questionMatches.map(q => q.replace(/"/g, ''));
      } else {
        // Last resort: split by newlines and clean up
        questions = contentStr
          .split('\n')
          .filter(line => line.trim().length > 10 && !line.includes('```'))
          .map(line => line.replace(/^\d+\.\s*/, '').trim())
          .filter(q => q.length > 0);
      }
    }

    // Ensure we have exactly 20 questions
    if (questions.length > 20) {
      questions = questions.slice(0, 20);
    }

    return new Response(JSON.stringify({ questions }), {
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
