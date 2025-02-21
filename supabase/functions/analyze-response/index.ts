
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { question, answer, jobTitle } = await req.json();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Tu es un expert en recrutement et en coaching d'entretien. 
            Ton rôle est d'évaluer la réponse d'un candidat à une question d'entretien et de lui fournir un feedback détaillé ainsi qu'une réponse modèle optimisée.`
          },
          {
            role: 'user',
            content: `Analyse cette réponse d'entretien :
            Question : ${question}
            Réponse du candidat : ${answer}
            Poste visé : ${jobTitle}
            
            Format de sortie attendu :
            {
              "feedback": "Ton feedback détaillé avec conseils précis",
              "sample_response": "Une réponse modèle bien construite"
            }`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API Error:', error);
      throw new Error(`OpenAI API error: ${error}`);
    }

    const result = await response.json();
    const aiResponse = JSON.parse(result.choices[0].message.content);

    return new Response(
      JSON.stringify(aiResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-response function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
