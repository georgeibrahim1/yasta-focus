# AI Chat Setup Guide

## Groq API Configuration

The AI chat feature uses Groq's Llama 3.3 70B model (completely FREE & UNLIMITED).

### Why Groq?

- ✅ **100% FREE** - No credit card required
- ✅ **14,400 requests/day** - Practically unlimited for students
- ✅ **10x Faster** than other AI providers
- ✅ **Excellent for academics** - Llama 3.3 70B is smart and accurate
- ✅ **No rate limits** or "visibility check" errors
- ✅ **Instant signup** - Get API key in seconds

### Step 1: Get Your Free API Key

1. Visit: https://console.groq.com/keys
2. Sign up (instant, no credit card needed)
3. Click "Create API Key"
4. Copy the generated key

### Step 2: Add to Configuration File

1. Open `yasta-focus-backend/config.env`
2. Find the line: `GROQ_API_KEY=`
3. Paste your API key after the `=` sign:
   ```env
   GROQ_API_KEY=gsk_your_key_here
   ```
4. Save the file

### Step 3: Restart Backend Server

After adding the API key, restart your backend:

```bash
cd yasta-focus-backend
npm run start
```

### Verify Setup

Check the backend console logs when starting - you should see:
```
🚀 Using Groq API (Llama 3.3 70B)
```

When you send a message, you'll see:
```
📚 Subject Chat Request: { subjectName: 'General', prompt: '...' }
🚀 Calling Groq API with Llama 3.3 70B (UNLIMITED)
✅ Groq response received
```

### Test the AI Chat

1. Navigate to the Subjects page in the frontend
2. Click the "AI Chat" button (bottom right corner)
3. Send a test message like "Explain photosynthesis"
4. You should receive a fast, detailed response from Groq

### Troubleshooting

**Error: "AI service not configured"**
- Make sure you added `GROQ_API_KEY` to `config.env`
- Restart your backend server after adding it
- Check that the key starts with `gsk_`

**Error: "Groq API error: 401"**
- Your API key might be invalid
- Generate a new key at https://console.groq.com/keys
- Make sure there are no extra spaces in config.env

**No response from AI**
- Check browser console (F12) for errors
- Check backend logs for detailed error messages
- Ensure your internet connection is working

### API Limits

- **FREE** with no credit card required
- **14,400 requests per day** (10 requests/minute)
- **No usage quota** or hidden fees
- **Fast response times** (~200-500ms per request)

### Model Information

- **Model**: Llama 3.3 70B Versatile
- **Provider**: Groq (using custom AI chips)
- **Parameters**: 70 billion
- **Temperature**: 0.7 (balanced creativity/accuracy)
- **Max tokens**: 2048 (long, detailed responses)

### Benefits for Students

Groq with Llama 3.3 70B is specifically excellent for:
- ✅ Math problem solving with step-by-step explanations
- ✅ Science concepts and detailed explanations
- ✅ Programming help and code debugging
- ✅ Essay writing and grammar assistance
- ✅ Study guide generation
- ✅ Homework help across all subjects
