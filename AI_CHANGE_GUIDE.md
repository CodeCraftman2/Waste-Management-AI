# AI Change Guide - Waste Management System

## Current AI Implementation

### What AI is Currently Used?
**Google Gemini Pro Vision (gemini-1.5-flash model)**

### Key Files:
1. **Main AI API**: `/app/api/analyze-waste/route.ts`
2. **AI Utilities**: `/utils/aiVerification.ts` 
3. **Frontend Integration**: `/app/report/page.tsx`
4. **Package**: `@google/generative-ai` (version ^0.21.0)
5. **Environment Variable**: `GOOGLE_AI_API_KEY`

### How It Works:
1. User uploads waste image in Report page
2. Image sent to `/api/analyze-waste` endpoint
3. Google Gemini analyzes image and returns:
   - Waste type (plastic, paper, organic, etc.)
   - Confidence score (0-100%)
   - Description of waste
   - Estimated amount (small/medium/large)
   - Hazard assessment (true/false)
   - Disposal recommendations
4. Results used for verification and point assignment

## How to Change the AI Service

### Option 1: Change Google Gemini Model (Easiest)

**Current model**: `gemini-1.5-flash`

**Available alternatives**:
- `gemini-1.5-pro` (higher accuracy, slower)
- `gemini-1.0-pro-vision` (older version)

**Steps**:
1. Open `/app/api/analyze-waste/route.ts`
2. Change line 47:
   ```typescript
   // Current
   const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
   
   // Change to
   const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
   ```

### Option 2: Switch to OpenAI GPT-4 Vision

**Steps**:
1. Install OpenAI package:
   ```bash
   npm install openai
   ```

2. Update environment variables in `.env.local`:
   ```env
   # Remove or comment out
   # GOOGLE_AI_API_KEY=your_google_key
   
   # Add OpenAI key
   OPENAI_API_KEY=your_openai_api_key
   ```

3. Replace `/app/api/analyze-waste/route.ts` content:
   ```typescript
   import { NextRequest, NextResponse } from 'next/server';
   import OpenAI from 'openai';

   export const dynamic = 'force-dynamic';

   const openai = new OpenAI({
     apiKey: process.env.OPENAI_API_KEY || '',
   });

   export async function POST(request: NextRequest) {
     try {
       const formData = await request.formData();
       const imageFile = formData.get('image') as File;
       
       if (!imageFile) {
         return NextResponse.json({ error: 'No image provided' }, { status: 400 });
       }

       if (!process.env.OPENAI_API_KEY) {
         return NextResponse.json({ 
           error: 'AI service not configured. OPENAI_API_KEY environment variable is missing.' 
         }, { status: 500 });
       }

       const bytes = await imageFile.arrayBuffer();
       const buffer = Buffer.from(bytes);
       const base64Image = buffer.toString('base64');
       
       const response = await openai.chat.completions.create({
         model: "gpt-4-vision-preview",
         messages: [
           {
             role: "user",
             content: [
               {
                 type: "text",
                 text: `Analyze this waste image and respond with only a JSON object:
                 {
                   "wasteType": "plastic|paper|organic|metal|glass|electronic|hazardous|mixed",
                   "confidence": 85,
                   "description": "Detailed description",
                   "estimatedAmount": "small|medium|large", 
                   "isHazardous": false,
                   "recommendations": ["recommendation1", "recommendation2"],
                   "verificationStatus": "verified"
                 }`
               },
               {
                 type: "image_url",
                 image_url: {
                   url: `data:${imageFile.type};base64,${base64Image}`
                 }
               }
             ]
           }
         ],
         max_tokens: 500
       });

       const content = response.choices[0]?.message?.content;
       if (!content) {
         throw new Error('No response from AI');
       }

       const analysisResult = JSON.parse(content);
       
       return NextResponse.json({
         success: true,
         result: analysisResult
       });

     } catch (error) {
       console.error('AI verification error:', error);
       return NextResponse.json({
         success: false,
         error: error instanceof Error ? error.message : 'AI verification failed'
       }, { status: 500 });
     }
   }
   ```

4. Update `package.json` dependencies:
   ```json
   {
     "dependencies": {
       // Remove or keep both
       // "@google/generative-ai": "^0.21.0",
       "openai": "^4.0.0"
     }
   }
   ```

### Option 3: Switch to Anthropic Claude Vision

**Steps**:
1. Install Anthropic package:
   ```bash
   npm install @anthropic-ai/sdk
   ```

2. Update environment variables:
   ```env
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

3. Replace `/app/api/analyze-waste/route.ts`:
   ```typescript
   import { NextRequest, NextResponse } from 'next/server';
   import Anthropic from '@anthropic-ai/sdk';

   export const dynamic = 'force-dynamic';

   const anthropic = new Anthropic({
     apiKey: process.env.ANTHROPIC_API_KEY || '',
   });

   export async function POST(request: NextRequest) {
     try {
       const formData = await request.formData();
       const imageFile = formData.get('image') as File;
       
       if (!imageFile) {
         return NextResponse.json({ error: 'No image provided' }, { status: 400 });
       }

       if (!process.env.ANTHROPIC_API_KEY) {
         return NextResponse.json({ 
           error: 'AI service not configured. ANTHROPIC_API_KEY environment variable is missing.' 
         }, { status: 500 });
       }

       const bytes = await imageFile.arrayBuffer();
       const buffer = Buffer.from(bytes);
       const base64Image = buffer.toString('base64');
       
       const response = await anthropic.messages.create({
         model: "claude-3-sonnet-20240229",
         max_tokens: 500,
         messages: [
           {
             role: "user",
             content: [
               {
                 type: "image",
                 source: {
                   type: "base64",
                   media_type: imageFile.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                   data: base64Image,
                 },
               },
               {
                 type: "text",
                 text: `Analyze this waste image and respond with only a JSON object:
                 {
                   "wasteType": "plastic|paper|organic|metal|glass|electronic|hazardous|mixed",
                   "confidence": 85,
                   "description": "Detailed description",
                   "estimatedAmount": "small|medium|large", 
                   "isHazardous": false,
                   "recommendations": ["recommendation1", "recommendation2"],
                   "verificationStatus": "verified"
                 }`
               }
             ],
           },
         ],
       });

       const content = response.content[0];
       if (content.type !== 'text') {
         throw new Error('Unexpected response type from AI');
       }

       const analysisResult = JSON.parse(content.text);
       
       return NextResponse.json({
         success: true,
         result: analysisResult
       });

     } catch (error) {
       console.error('AI verification error:', error);
       return NextResponse.json({
         success: false,
         error: error instanceof Error ? error.message : 'AI verification failed'
       }, { status: 500 });
     }
   }
   ```

### Option 4: Use Azure Computer Vision

**Steps**:
1. Install Azure packages:
   ```bash
   npm install @azure/cognitiveservices-computervision @azure/ms-rest-js
   ```

2. Update environment variables:
   ```env
   AZURE_COMPUTER_VISION_KEY=your_azure_key
   AZURE_COMPUTER_VISION_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
   ```

3. Replace analysis logic with Azure implementation (custom training needed for waste classification)

## Migration Checklist

### Before Changing AI:
- [ ] Backup current implementation
- [ ] Test current functionality
- [ ] Note current performance metrics
- [ ] Prepare new API keys

### During Change:
- [ ] Update environment variables
- [ ] Install new packages
- [ ] Replace API route code
- [ ] Update package.json
- [ ] Test with sample images

### After Change:
- [ ] Verify all functionality works
- [ ] Test edge cases (poor quality images, wrong file types)
- [ ] Monitor error logs
- [ ] Compare accuracy with previous AI
- [ ] Update documentation

## Cost Comparison

| AI Service | Cost per 1000 images* | Accuracy | Speed |
|------------|----------------------|----------|--------|
| Google Gemini 1.5 Flash | ~$0.50 | High | Fast |
| Google Gemini 1.5 Pro | ~$1.00 | Higher | Medium |
| OpenAI GPT-4 Vision | ~$10.00 | High | Medium |
| Claude 3 Sonnet | ~$3.00 | High | Medium |
| Azure Computer Vision | ~$1.00 | Medium** | Fast |

*Approximate costs, check current pricing
**Requires custom training for waste classification

## Troubleshooting

### Common Issues:
1. **API Key not working**: Verify key is correct and service is enabled
2. **Rate limits**: Implement retry logic and rate limiting
3. **Large images**: Add image compression before sending to AI
4. **Parsing errors**: Improve JSON parsing and error handling
5. **Different response formats**: Adjust prompt to ensure consistent JSON structure

### Testing:
```bash
# Test with development server
npm run dev

# Test API endpoint directly
curl -X POST http://localhost:3000/api/analyze-waste \
  -F "image=@test-image.jpg"
```

## Quick Setup Verification

Run the verification script to check your current setup:
```bash
node verify-ai-setup.js
```

This will show you:
- Current AI service being used
- Environment variables status
- Required dependencies
- Setup recommendations

## Testing Your AI Changes

### Test Scripts Provided:
1. **verify-ai-setup.js** - Checks current configuration
2. **test-ai.js** - Tests AI analysis with sample images

### Manual Testing:
```bash
# 1. Start development server
npm run dev

# 2. Test API directly
curl -X POST http://localhost:3000/api/analyze-waste \
  -F "image=@test-image.jpg"

# 3. Use the web interface at http://localhost:3000/report
```

## Current Environment Status
Based on repository analysis:
- ✅ **Current AI**: Google Gemini 1.5 Flash
- ✅ **Main File**: `/app/api/analyze-waste/route.ts`
- ⚠️  **Environment**: No .env.local found (needs API key setup)
- ✅ **Dependencies**: @google/generative-ai installed
- ✅ **Code Quality**: Linting passes (some warnings unrelated to AI)

## Recommendation

For this waste management application:
- **Keep Google Gemini 1.5 Flash** for balanced cost/performance
- **Upgrade to Gemini 1.5 Pro** for better accuracy if budget allows
- **Consider OpenAI GPT-4V** for highest accuracy but watch costs
- **Use Claude 3** as middle ground for accuracy and cost

## Next Steps After Reading This Guide
1. Run `node verify-ai-setup.js` to check current status
2. Choose your preferred AI service from options above
3. Follow the specific migration steps for your chosen service
4. Test thoroughly before deploying to production