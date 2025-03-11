
# Vercel Function Deployment Instructions

To resolve the audio transcription issues, follow these steps to deploy the transcription service to Vercel:

## Step 1: Create a new Vercel project

1. Create a new directory for your Vercel project:
   ```
   mkdir transcription-service
   cd transcription-service
   ```

2. Copy the provided files to your project:
   - Copy `example-vercel-function.js` to `api/transcribe.js`
   - Copy `example-vercel-package.json` to `package.json`
   - Copy `example-vercel-next-config.js` to `next.config.js`

## Step 2: Initialize Git and install dependencies

```
git init
npm install
```

## Step 3: Deploy to Vercel

1. Install Vercel CLI if you haven't already:
   ```
   npm i -g vercel
   ```

2. Deploy to Vercel:
   ```
   vercel
   ```

3. Follow the prompts to connect to your Vercel account and deploy the project.

4. Add your OpenAI API key as an environment variable:
   ```
   vercel env add OPENAI_API_KEY
   ```

5. Enter your OpenAI API key when prompted, then redeploy:
   ```
   vercel --prod
   ```

## Step 4: Update your application code

Once deployed, get your Vercel deployment URL (e.g., https://transcription-service.vercel.app) and update the `VERCEL_TRANSCRIPTION_ENDPOINT` constant in `src/pages/Questions/services/transcriptionService.ts` to point to your function:

```javascript
const VERCEL_TRANSCRIPTION_ENDPOINT = "https://your-app-name.vercel.app/api/transcribe";
```

## Step 5: Test the application

Test the application on various devices to ensure the transcription is working correctly.

## Troubleshooting

If you encounter issues:

1. Check the Vercel function logs in the Vercel dashboard
2. Make sure your OpenAI API key is properly set in the Vercel environment variables
3. Check that CORS is properly configured in next.config.js
