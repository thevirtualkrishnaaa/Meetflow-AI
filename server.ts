import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Increase payload limit for base64 audio uploads
app.use(express.json({ limit: '50mb' }));

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// 1. Audio Transcription using gemini-3.5-transcribe
app.post('/api/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/webm', meetingContext = '' } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: 'audioBase64 is required' });
    }

    if (!apiKey) {
      // Graceful realistic fallback if API key is not present in local test environment
      return res.json({
        text: `10:00 Alex: Welcome everyone. Today we need to lock in the Q4 roadmap priorities and resolve overdue items.\n10:02 Sarah: I recommend prioritizing the analytics dashboard and customer onboarding simplification.\n10:05 James: Agreed. I will prepare the technical architecture wireframes and have them reviewed by Friday.\n10:08 Elena: Great, I'll audit the signup funnel drop-off points to ensure conversion targets are met.`,
        modelUsed: 'fallback_simulated',
      });
    }

    const audioPart = {
      inlineData: {
        mimeType: mimeType || 'audio/webm',
        data: audioBase64,
      },
    };

    const promptText = meetingContext
      ? `Transcribe this audio accurately. Context: ${meetingContext}. Format speaker turns with timestamps (e.g. 10:00 Alex: ...) and ensure high clarity for business action items and decisions.`
      : 'Transcribe this audio recording accurately. Where possible, identify distinct speaker turns with timestamps (e.g. [00:15] Speaker: ...) and punctuate cleanly for business records.';

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [audioPart, { text: promptText }],
      },
    });

    const transcriptText = response.text || '';
    return res.json({
      text: transcriptText,
      modelUsed: 'gemini-3.5-transcribe',
    });
  } catch (err: any) {
    console.error('Gemini 3.5 Transcribe error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to transcribe audio with gemini-3.5-transcribe',
    });
  }
});

// 2. AI Extraction of Decisions and Actions using gemini-3.8-flash
app.post('/api/extract-actions', async (req, res) => {
  try {
    const { transcript, meetingTitle = 'Team Meeting', teamMembers = [] } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: 'transcript is required' });
    }

    if (!apiKey) {
      return res.json({
        summary:
          'The team aligned on core Q4 initiatives, placing the highest priority on analytics visibility and automated follow-ups.',
        decisions: [
          {
            text: 'Prioritize analytics dashboard implementation for the upcoming release.',
            context: 'Agreed by Alex and Sarah during discussion.',
            confidence: 0.96,
          },
          {
            text: 'Streamline signup onboarding funnel to cut friction.',
            context: 'Elena presented drop-off statistics.',
            confidence: 0.94,
          },
        ],
        actions: [
          {
            title: 'Prepare analytics dashboard wireframes and review with product team',
            suggestedOwner: 'Sarah Chen',
            suggestedDueDate: '28 Sep',
            priority: 'High',
            confidence: 0.95,
          },
          {
            title: 'Audit signup funnel drop-off points and propose optimizations',
            suggestedOwner: 'Elena Rostova',
            suggestedDueDate: '30 Sep',
            priority: 'Medium',
            confidence: 0.92,
          },
        ],
      });
    }

    const memberNames = teamMembers.map((m: any) => `${m.name} (${m.role})`).join(', ');

    const systemPrompt = `You are MeetingFlow AI, an executive B2B meeting intelligence engine.
Your task is to analyze the meeting transcript and extract:
1. An executive summary (2-3 sentences max) capturing main consensus.
2. Concrete key decisions made (not just topics discussed).
3. Clear action items with specific titles (start with an action verb), best matching owner from available team members [${memberNames}], realistic due dates (e.g. "Today", "26 Sep", "30 Sep"), and priority level ("Urgent", "High", "Medium", "Low").

Return strictly valid JSON format matching:
{
  "summary": "...",
  "decisions": [
    {
      "text": "Decision statement",
      "context": "Brief supporting context from transcript",
      "confidence": 0.95
    }
  ],
  "actions": [
    {
      "title": "Action title",
      "suggestedOwner": "Team member name or Unassigned",
      "suggestedDueDate": "Due date e.g. 28 Sep",
      "priority": "High",
      "confidence": 0.93
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        { text: systemPrompt },
        { text: `Meeting: ${meetingTitle}\n\nTranscript:\n${transcript}` },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Extract actions error:', err);
    return res.status(500).json({ error: err.message || 'Failed to extract meeting outcomes' });
  }
});

// Full-stack Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`MeetingFlow AI server running at http://localhost:${port}`);
  });
}

startServer();
