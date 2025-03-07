
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  try {
    console.log("Starting base64 processing, length:", base64String.length);
    const chunks: Uint8Array[] = [];
    let position = 0;
    
    while (position < base64String.length) {
      const chunk = base64String.slice(position, position + chunkSize);
      const binaryChunk = atob(chunk);
      const bytes = new Uint8Array(binaryChunk.length);
      
      for (let i = 0; i < binaryChunk.length; i++) {
        bytes[i] = binaryChunk.charCodeAt(i);
      }
      
      chunks.push(bytes);
      position += chunkSize;
    }

    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    console.log("Finished base64 processing, total size:", result.length, "bytes");
    return result;
  } catch (error) {
    console.error("Error processing base64 chunks:", error);
    throw new Error("Failed to process audio data: " + error.message);
  }
}

serve(async (req) => {
  // CORS handling for preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Transcription request received");
    const reqBody = await req.json();
    const { audioBlob, mimeType, language, isMobile, userAgent } = reqBody;
    
    console.log("Device info - Mobile:", isMobile);
    console.log("User agent:", userAgent);
    
    if (!audioBlob) {
      console.error("No audio data provided");
      throw new Error('No audio data provided');
    }

    console.log("Received audio data, processing...");
    console.log("Original mime type:", mimeType);
    
    // Process audio in chunks
    const binaryAudio = processBase64Chunks(audioBlob);
    console.log("Audio processed, size:", binaryAudio.length, "bytes");
    
    if (binaryAudio.length === 0) {
      throw new Error('Processed audio has zero length');
    }
    
    // Normalize the mime type for better compatibility
    let audioType = mimeType || 'audio/webm';
    console.log("Using audio type:", audioType);
    
    // Prepare form data
    const formData = new FormData();
    const blob = new Blob([binaryAudio], { type: audioType });
    
    // Explicitly set the filename with the right extension based on the mime type
    let filename = 'audio.webm';
    if (audioType.includes('wav')) {
      filename = 'audio.wav';
    } else if (audioType.includes('mp4') || audioType.includes('m4a')) {
      filename = 'audio.mp4';
    } else if (audioType.includes('mpeg') || audioType.includes('mp3')) {
      filename = 'audio.mp3';
    }
    
    formData.append('file', blob, filename);
    formData.append('model', 'whisper-1');
    
    // Improved prompt with strict guidance for French transcription
    // Using much more explicit prompt to avoid default placeholders
    formData.append('language', 'fr'); 
    formData.append('prompt', 'Ce qui suit est une transcription en français. Transcrire le discours oral en texte précis. Ne pas générer de phrases par défaut comme "Sous-titrage Société Radio-Canada" ou autres contenus génériques.');
    formData.append('response_format', 'json');
    
    console.log("Sending request to OpenAI with filename:", filename, "language:", 'fr');
    
    // Get the OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not found in environment variables');
    }
    
    // Send to OpenAI with specific headers
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log("Transcription received:", result.text);
    
    // Add additional validation to filter out common placeholder responses
    if (result.text.includes("Sous-titrage") || 
        result.text.includes("Radio-Canada") ||
        result.text.includes("Amara.org") ||
        result.text.includes("soustiteur")) {
      console.error("Detected placeholder text:", result.text);
      throw new Error("La transcription a généré un texte par défaut incorrect. Veuillez réessayer.");
    }

    return new Response(
      JSON.stringify({ text: result.text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in transcribe-audio function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
