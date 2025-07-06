import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    console.log('AI API route called');
    console.log('Environment variables:', {
      hasApiKey: !!process.env.GOOGLE_AI_API_KEY,
      apiKeyLength: process.env.GOOGLE_AI_API_KEY?.length || 0
    });

    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    
    if (!imageFile) {
      console.log('No image file provided');
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    console.log('Image file received:', {
      name: imageFile.name,
      size: imageFile.size,
      type: imageFile.type
    });

    // Check if API key is configured
    if (!process.env.GOOGLE_AI_API_KEY) {
      console.log('No API key found in environment');
      console.log('Available environment variables:', Object.keys(process.env).filter(key => key.includes('GOOGLE') || key.includes('DATABASE')));
      return NextResponse.json({ 
        error: 'AI service not configured. GOOGLE_AI_API_KEY environment variable is missing. Please restart the development server after setting up .env.local file.' 
      }, { status: 500 });
    }

    // Convert image to base64
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');
    
    // Initialize the model (updated to newer version)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Create the prompt for waste analysis
    const prompt = `
    Analyze this image of waste and provide detailed information.
    
    You must respond with ONLY a valid JSON object, no markdown formatting, no code blocks, no explanations.
    
    The JSON must have this exact structure:
    {
      "wasteType": "plastic|paper|organic|metal|glass|electronic|hazardous|mixed",
      "confidence": 85,
      "description": "Detailed description of what you see",
      "estimatedAmount": "small|medium|large",
      "isHazardous": false,
      "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
      "verificationStatus": "verified"
    }
    
    Do not include any text before or after the JSON. Only return the JSON object.
    `;

    // Generate content with image
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: imageFile.type,
          data: base64Image
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    console.log('Raw AI response:', text);
    
    // Clean and parse the JSON response
    let cleanText = text.trim();
    
    // Remove markdown code blocks if present
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Remove any leading/trailing text that's not JSON
    const jsonStart = cleanText.indexOf('{');
    const jsonEnd = cleanText.lastIndexOf('}') + 1;
    if (jsonStart !== -1 && jsonEnd > jsonStart) {
      cleanText = cleanText.substring(jsonStart, jsonEnd);
    }
    
    console.log('Cleaned JSON text:', cleanText);
    
    // Parse the JSON response
    const analysisResult = JSON.parse(cleanText);
    
    return NextResponse.json({
      success: true,
      result: analysisResult
    });

  } catch (error) {
    console.error('AI verification error:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'AI verification failed',
      details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : 'No stack trace' : undefined
    }, { status: 500 });
  }
} 