
// THIS IS A SAMPLE FILE TO DEPLOY TO VERCEL
// Create a new Vercel project and add this as /api/transcribe.js

const { Readable } = require('stream');
const { createFFmpeg } = require('@ffmpeg/ffmpeg');
const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Handle converting a request formData file to buffer
async function fileToBuffer(formData) {
  const file = formData.get('audio');
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Convert audio to mp3 using FFmpeg
async function convertAudioToMp3(inputBuffer) {
  const ffmpeg = createFFmpeg({ log: true });
  await ffmpeg.load();
  
  // Write the input file to memory
  ffmpeg.FS('writeFile', 'input.webm', new Uint8Array(inputBuffer));
  
  // Run FFmpeg command to convert to mp3 (16kHz, mono)
  await ffmpeg.run(
    '-i', 'input.webm',
    '-ar', '16000',
    '-ac', '1',
    '-c:a', 'mp3',
    'output.mp3'
  );
  
  // Read the output file
  const data = ffmpeg.FS('readFile', 'output.mp3');
  
  // Clean up
  ffmpeg.FS('unlink', 'input.webm');
  ffmpeg.FS('unlink', 'output.mp3');
  
  return Buffer.from(data.buffer);
}

// Main API handler
export default async function handler(req, res) {
  // Handle CORS for preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Parse the multipart form data
    const formData = await req.formData();
    const audioBuffer = await fileToBuffer(formData);
    const language = formData.get('language') || 'fr';
    const userAgent = formData.get('userAgent') || '';
    
    console.log("Received audio for transcription:");
    console.log("Size:", audioBuffer.length, "bytes");
    console.log("Language:", language);
    console.log("User Agent:", userAgent);
    
    // Convert audio to mp3 format
    console.log("Converting audio to mp3...");
    const mp3Buffer = await convertAudioToMp3(audioBuffer);
    console.log("Conversion complete. MP3 size:", mp3Buffer.length, "bytes");
    
    // Create a readable stream from the buffer
    const stream = new Readable();
    stream.push(mp3Buffer);
    stream.push(null);
    
    // Call OpenAI's transcription API
    console.log("Sending to OpenAI for transcription...");
    const transcription = await openai.audio.transcriptions.create({
      file: stream,
      model: "whisper-1",
      language: language,
    });
    
    console.log("Transcription successful:", transcription.text);
    
    // Return the transcribed text
    return res.status(200).json({ text: transcription.text });
    
  } catch (error) {
    console.error("Transcription error:", error);
    return res.status(500).json({ 
      error: `Transcription failed: ${error.message}`,
      details: error.stack 
    });
  }
}
