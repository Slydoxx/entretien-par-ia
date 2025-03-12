
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

    console.log("First few bytes for debugging:", Array.from(result.slice(0, 20)));
    console.log("Total processed size:", result.length, "bytes");
    return result;
  } catch (error) {
    console.error("Error processing base64 chunks:", error);
    throw new Error("Failed to process audio data: " + error.message);
  }
}

// Ensure we're sending data in a format OpenAI accepts
function prepareAudioForOpenAI(audioData: Uint8Array): { data: Uint8Array, mimeType: string } {
  // Check for common audio format signatures
  const mp3Signature = [0x49, 0x44, 0x33];
  const wavSignature = [0x52, 0x49, 0x46, 0x46];
  const m4aSignature = [0x66, 0x74, 0x79, 0x70];
  
  const firstBytes = Array.from(audioData.slice(0, 4));
  console.log("Checking audio signature:", firstBytes);
  
  // Default to MP3 as it's widely compatible
  let mimeType = 'audio/mpeg';
  
  // Basic format detection
  if (mp3Signature.every((byte, i) => audioData[i] === byte)) {
    console.log("Detected MP3 format");
    mimeType = 'audio/mpeg';
  } else if (wavSignature.every((byte, i) => audioData[i] === byte)) {
    console.log("Detected WAV format");
    mimeType = 'audio/wav';
  } else if (m4aSignature.every((byte, i) => audioData[i + 4] === byte)) {
    console.log("Detected M4A format");
    mimeType = 'audio/mp4';
  } else {
    console.log("Unknown format, defaulting to MP3");
  }

  return { data: audioData, mimeType };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const reqBody = await req.json();
    const { audioBlob, language } = reqBody;
    
    if (!audioBlob) {
      throw new Error('No audio data provided');
    }

    // Process the audio data
    console.log("Processing audio data...");
    const audioData = processBase64Chunks(audioBlob);
    
    // Prepare audio for OpenAI
    const { data: processedAudio, mimeType } = prepareAudioForOpenAI(audioData);
    console.log("Audio prepared with MIME type:", mimeType);
    
    // Create form data for OpenAI
    const formData = new FormData();
    const audioFile = new Blob([processedAudio], { type: mimeType });
    formData.append('file', audioFile, `audio.${mimeType.split('/')[1]}`);
    formData.append('model', 'whisper-1');
    
    if (language) {
      formData.append('language', language);
    }

    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log("Sending request to OpenAI...");
    console.log("Audio file size:", audioFile.size, "bytes");
    console.log("MIME type:", mimeType);
    
    // Send to OpenAI
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API Error:", errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("Transcription successful");
    
    return new Response(
      JSON.stringify({ text: result.text }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in transcribe-audio function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error during transcription' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
