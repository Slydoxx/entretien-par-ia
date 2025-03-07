
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
    const { jobTitle } = await req.json();

    if (!jobTitle) {
      return new Response(
        JSON.stringify({ error: 'Le titre du poste est requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating description for job: ${jobTitle}`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'Vous êtes un expert en ressources humaines qui rédige des descriptions de poste détaillées et professionnelles. Écrivez en français. Fournissez des informations sur les compétences requises, les responsabilités et les qualifications. Soyez concis mais complet, en 300 mots maximum.' 
          },
          { 
            role: 'user', 
            content: `Générez une description de poste réaliste et détaillée pour le métier de : ${jobTitle}` 
          }
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('OpenAI API error:', data.error);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la génération de la description' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const jobDescription = data.choices[0].message.content.trim();
    
    return new Response(
      JSON.stringify({ description: jobDescription }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating job description:', error);
    return new Response(
      JSON.stringify({ error: 'Une erreur est survenue lors de la génération de la description' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
