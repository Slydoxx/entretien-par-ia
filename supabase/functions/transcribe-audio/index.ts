
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
    const reqBody = await req.json().catch(err => {
      console.error("Error parsing request JSON:", err);
      throw new Error("Invalid JSON in request");
    });
    
    console.log("Request parsed successfully");
    const { audioBlob, mimeType, fileExtension, language, isMobile, browser, userAgent } = reqBody;
    
    console.log("Device info - Mobile:", isMobile, "Browser:", browser);
    console.log("User agent:", userAgent || "Not provided");
    
    if (!audioBlob) {
      console.error("No audio data provided");
      throw new Error('No audio data provided');
    }

    if (typeof audioBlob !== 'string') {
      console.error("Audio data is not in the expected format (string)");
      throw new Error('Audio data must be a base64 string');
    }

    console.log("Received audio data, processing...");
    console.log("Original mime type:", mimeType, "File extension:", fileExtension);
    
    // Process audio in chunks
    const binaryAudio = processBase64Chunks(audioBlob);
    console.log("Audio processed, size:", binaryAudio.length, "bytes");
    
    if (binaryAudio.length === 0) {
      throw new Error('Processed audio has zero length');
    }
    
    // Normalize the mime type for better compatibility
    let audioType = mimeType || 'audio/webm';
    let filename = `audio.${fileExtension || 'webm'}`;
    
    // Adjust format based on device/browser for better compatibility
    if (isMobile) {
      if (browser?.toLowerCase().includes('safari') || userAgent?.includes('iPhone') || userAgent?.includes('iPad')) {
        audioType = 'audio/mp4';
        filename = 'audio.m4a';
      } else if (browser?.toLowerCase().includes('firefox')) {
        audioType = 'audio/ogg';
        filename = 'audio.ogg';
      }
    }
    
    console.log("Using audio type:", audioType, "with filename:", filename);
    
    // Prepare form data
    const formData = new FormData();
    const blob = new Blob([binaryAudio], { type: audioType });
    
    console.log("Creating audio file with name:", filename);
    formData.append('file', blob, filename);
    formData.append('model', 'whisper-1');
    
    // Set language explicitly and add prompt to avoid default placeholders
    formData.append('language', 'fr'); 
    formData.append('prompt', 'Ce qui suit est une transcription en français. Transcrire uniquement et exactement le discours oral en texte précis. Ne jamais générer de phrases par défaut comme "Sous-titrage Société Radio-Canada", "Amara.org", ou autres contenus génériques. Transcrire seulement ce qui est dit dans l\'audio et rien d\'autre.');
    formData.append('response_format', 'json');
    
    console.log("Sending request to OpenAI with filename:", filename, "language:", 'fr');
    
    // Get the OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not found in environment variables');
    }
    
    // Send to OpenAI with detailed user agent information
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'User-Agent': `TranscriptionApp/${isMobile ? 'Mobile' : 'Desktop'}-${browser || 'Unknown'}`,
      },
      body: formData,
    }).catch(err => {
      console.error("Fetch to OpenAI failed:", err);
      throw new Error(`Failed to connect to OpenAI API: ${err.message}`);
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Could not read error response");
      const statusCode = response.status;
      console.error(`OpenAI API Error (${statusCode}):`, errorText);
      throw new Error(`OpenAI API error: ${statusCode} - ${errorText}`);
    }

    const result = await response.json().catch(err => {
      console.error("Failed to parse OpenAI response:", err);
      throw new Error("Invalid response from OpenAI");
    });
    
    console.log("Transcription received:", result.text);
    
    // Add additional validation to filter out common placeholder responses
    if (result.text && 
        (result.text.toLowerCase().includes("sous-titrage") || 
        result.text.toLowerCase().includes("radio-canada") ||
        result.text.toLowerCase().includes("amara.org") ||
        result.text.toLowerCase().includes("soustiteur"))) {
      console.error("Detected placeholder text:", result.text);
      throw new Error("La transcription a généré un texte par défaut incorrect. Veuillez réessayer.");
    }
    
    // If the text is empty or extremely short, consider it an error
    if (!result.text || result.text.trim().length < 2) {
      console.error("Empty or extremely short transcription");
      throw new Error("Aucun texte n'a été détecté dans l'enregistrement. Veuillez parler plus fort ou vous rapprocher du microphone.");
    }

    return new Response(
      JSON.stringify({ text: result.text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in transcribe-audio function:', error);
    return new Response(
      JSON.stringify({ error: error.message || "Erreur de transcription inconnue" }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
