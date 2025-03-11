
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

    // Log first few bytes for debugging format issues
    console.log("First 20 bytes of processed audio:", Array.from(result.slice(0, 20)));
    console.log("Finished base64 processing, total size:", result.length, "bytes");
    return result;
  } catch (error) {
    console.error("Error processing base64 chunks:", error);
    throw new Error("Failed to process audio data: " + error.message);
  }
}

// Detect audio format from file signature
function detectAudioFormat(data: Uint8Array): string {
  // Log first bytes for debugging
  console.log("Detecting format from bytes:", Array.from(data.slice(0, 16)));
  
  // Common audio format signatures
  const signatures: Record<string, { bytes: number[], extension: string }> = {
    // WebM format
    webm: { bytes: [0x1A, 0x45, 0xDF, 0xA3], extension: 'webm' },
    // MP3 format
    mp3: { bytes: [0x49, 0x44, 0x33], extension: 'mp3' },
    // Alternative MP3 signature
    mp3alt: { bytes: [0xFF, 0xFB], extension: 'mp3' },
    // WAV format
    wav: { bytes: [0x52, 0x49, 0x46, 0x46], extension: 'wav' },
    // M4A format
    m4a: { bytes: [0x66, 0x74, 0x79, 0x70], extension: 'm4a' },
    // OGG format
    ogg: { bytes: [0x4F, 0x67, 0x67, 0x53], extension: 'ogg' },
  };

  // Check for each signature
  for (const [format, { bytes, extension }] of Object.entries(signatures)) {
    let match = true;
    
    // Special case for m4a which has its signature at offset 4
    if (format === 'm4a') {
      for (let i = 0; i < bytes.length; i++) {
        if (data[i + 4] !== bytes[i]) {
          match = false;
          break;
        }
      }
    } else {
      for (let i = 0; i < bytes.length; i++) {
        if (data[i] !== bytes[i]) {
          match = false;
          break;
        }
      }
    }
    
    if (match) {
      console.log(`Detected format: ${format} (${extension})`);
      return extension;
    }
  }
  
  console.log("Could not detect format from signatures, falling back to user-provided type");
  return '';
}

// Map detected format to OpenAI-compatible format
function getOpenAICompatibleFormat(detectedFormat: string, mimeType: string): {
  contentType: string,
  extension: string,
  isCompatible: boolean
} {
  // List of formats explicitly supported by OpenAI's API
  const openAIFormats = ['flac', 'm4a', 'mp3', 'mp4', 'mpeg', 'mpga', 'oga', 'ogg', 'wav', 'webm'];
  
  // First try to use the detected format
  if (detectedFormat && openAIFormats.includes(detectedFormat)) {
    const contentType = `audio/${detectedFormat}`;
    console.log(`Format ${detectedFormat} is directly compatible with OpenAI`);
    return { contentType, extension: detectedFormat, isCompatible: true };
  }
  
  // If detected format isn't compatible, try to map the MIME type
  if (mimeType) {
    // Extract the format from MIME type (e.g., audio/webm -> webm)
    const formatFromMime = mimeType.split('/')[1]?.split(';')[0];
    if (formatFromMime && openAIFormats.includes(formatFromMime)) {
      console.log(`Using MIME-derived format: ${formatFromMime}`);
      return { contentType: mimeType, extension: formatFromMime, isCompatible: true };
    }
  }
  
  // If we get here, we need to force a compatible format
  // Default to mp3 as it's widely compatible
  console.log("Format not directly compatible with OpenAI, forcing to mp3");
  return { contentType: 'audio/mp3', extension: 'mp3', isCompatible: false };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Transcription request received");
    const reqBody = await req.json();
    
    console.log("Request parsed successfully");
    const { audioBlob, mimeType, fileExtension, language, isMobile, browser, userAgent } = reqBody;
    
    console.log("Device info - Mobile:", isMobile, "Browser:", browser);
    console.log("User agent:", userAgent || "Not provided");
    console.log("Received format info - MIME:", mimeType, "Extension:", fileExtension);
    
    if (!audioBlob) {
      console.error("No audio data provided");
      throw new Error('No audio data provided');
    }

    if (typeof audioBlob !== 'string') {
      console.error("Audio data is not in the expected format (string)");
      throw new Error('Audio data must be a base64 string');
    }

    console.log("Received audio data, processing...");
    
    // Process audio in chunks
    const binaryAudio = processBase64Chunks(audioBlob);
    console.log("Audio processed, size:", binaryAudio.length, "bytes");
    
    if (binaryAudio.length === 0) {
      throw new Error('Processed audio has zero length');
    }
    
    // Detect the format from the binary data
    const detectedFormat = detectAudioFormat(binaryAudio);
    console.log("Format detection result:", detectedFormat || "Unknown");
    
    // Get compatible format information for OpenAI
    const { contentType, extension, isCompatible } = getOpenAICompatibleFormat(
      detectedFormat, 
      mimeType
    );
    
    console.log(`Using content type: ${contentType} with extension: ${extension} (Compatible: ${isCompatible})`);
    
    // Prepare form data for OpenAI
    const formData = new FormData();
    const blob = new Blob([binaryAudio], { type: contentType });
    
    formData.append('file', blob, `audio.${extension}`);
    formData.append('model', 'whisper-1');
    
    if (language) {
      formData.append('language', language);
      console.log("Language set to:", language);
    }
    
    // Get the OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not found in environment variables');
    }
    
    console.log("Sending request to OpenAI");
    
    // Send to OpenAI with detailed user agent information
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'User-Agent': `TranscriptionApp/${isMobile ? 'Mobile' : 'Desktop'}-${browser || 'Unknown'}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      const statusCode = response.status;
      console.error(`OpenAI API Error (${statusCode}):`, errorText);
      throw new Error(`OpenAI API error: ${statusCode} - ${errorText}`);
    }

    const result = await response.json();
    
    console.log("Transcription received from OpenAI");
    
    return new Response(
      JSON.stringify({ text: result.text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in transcribe-audio function:', error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown transcription error" }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
