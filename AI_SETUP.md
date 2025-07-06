# AI Image Verification Setup Guide

## Overview
The ScrapAI platform uses Google's Gemini Pro Vision AI to analyze waste images and verify waste types. This feature helps ensure accurate waste reporting and provides users with detailed analysis.

## Setup Instructions

### 1. Get Google AI API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Configure Environment Variables

Create a `.env.local` file in your project root and add:

```env
# Google AI (Gemini) API Key
GOOGLE_AI_API_KEY=your_actual_api_key_here

# Other required environment variables
DATABASE_URL=your_database_url_here
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=your_web3auth_client_id_here
```

### 3. How It Works

#### Client-Side (Frontend)
- User uploads an image in the Report Waste page
- Image is sent to the server via API route
- Real-time feedback shows analysis progress
- Results are displayed to the user

#### Server-Side (API Route)
- `/api/analyze-waste` handles image processing
- Uses Google Gemini Pro Vision for analysis
- Returns structured JSON with waste details
- Handles errors gracefully

### 4. AI Analysis Features

The AI analyzes images and provides:
- **Waste Type**: plastic, paper, organic, metal, glass, electronic, hazardous, mixed
- **Confidence Score**: 0-100% accuracy rating
- **Description**: Detailed description of the waste
- **Amount Estimation**: small, medium, large
- **Hazard Assessment**: true/false for dangerous materials
- **Recommendations**: Proper disposal methods

### 5. Verification System

- **Verified Reports**: 15 points (AI confirms waste type)
- **Pending Reports**: 10 points (no AI analysis)
- **Rejected Reports**: 5 points (AI disagrees with user input)

### 6. Testing the Feature

1. Start your development server: `npm run dev`
2. Go to the Report Waste page
3. Upload an image of waste
4. Watch the AI analysis in real-time
5. Submit the report to see verification results

### 7. Troubleshooting

#### "AI service not configured" Error
- Check that `GOOGLE_AI_API_KEY` is set in `.env.local`
- Restart your development server after adding the key

#### "AI analysis failed" Error
- Check your internet connection
- Verify the API key is valid
- Check browser console for detailed error messages

#### Image Upload Issues
- Ensure image is under 10MB
- Use JPEG, PNG, or WebP format
- Minimum resolution: 200x200 pixels

### 8. Security Notes

- API key is stored server-side only
- Images are processed securely via API route
- No sensitive data is exposed to the client
- Rate limiting can be added for production

### 9. Production Deployment

For production deployment:
1. Set environment variables in your hosting platform
2. Consider adding rate limiting to the API route
3. Monitor API usage and costs
4. Implement image compression for better performance

## API Response Format

```json
{
  "success": true,
  "result": {
    "wasteType": "plastic",
    "confidence": 85,
    "description": "Clear plastic water bottle with cap",
    "estimatedAmount": "small",
    "isHazardous": false,
    "recommendations": [
      "Rinse container before recycling",
      "Check local recycling guidelines"
    ],
    "verificationStatus": "verified"
  }
}
```

## Cost Considerations

- Google Gemini Pro Vision has usage-based pricing
- Typical cost: ~$0.01-0.05 per image analysis
- Monitor usage in Google AI Studio dashboard
- Consider implementing caching for repeated images 