export interface WasteAnalysisResult {
  wasteType: string;
  confidence: number;
  description: string;
  estimatedAmount: string;
  isHazardous: boolean;
  recommendations: string[];
  verificationStatus: 'verified' | 'pending' | 'rejected';
}

export interface AIVerificationResponse {
  success: boolean;
  result?: WasteAnalysisResult;
  error?: string;
}

export async function verifyWasteType(userReportedType: string, aiAnalysis: WasteAnalysisResult): Promise<boolean> {
  // Compare user-reported type with AI analysis
  const userType = userReportedType.toLowerCase();
  const aiType = aiAnalysis.wasteType.toLowerCase();
  
  // Define type mappings for better comparison
  const typeMappings: { [key: string]: string[] } = {
    'plastic': ['plastic', 'bottle', 'container', 'bag'],
    'paper': ['paper', 'cardboard', 'newspaper', 'magazine'],
    'organic': ['organic', 'food', 'compost', 'biodegradable'],
    'metal': ['metal', 'aluminum', 'steel', 'can'],
    'glass': ['glass', 'bottle', 'jar'],
    'electronic': ['electronic', 'e-waste', 'battery', 'device'],
    'hazardous': ['hazardous', 'chemical', 'toxic', 'dangerous'],
    'mixed': ['mixed', 'various', 'multiple']
  };

  // Check if types match
  const userMatches = typeMappings[userType]?.some(type => aiType.includes(type));
  const aiMatches = Object.entries(typeMappings).find(([key, values]) => 
    values.some(type => aiType.includes(type))
  )?.[0];

  return userMatches || userType === aiMatches || aiAnalysis.confidence > 70;
}

export async function getWasteRecommendations(wasteType: string, isHazardous: boolean): Promise<string[]> {
  const recommendations: { [key: string]: string[] } = {
    'plastic': [
      'Rinse containers before recycling',
      'Check local recycling guidelines',
      'Consider reusable alternatives'
    ],
    'paper': [
      'Keep paper dry and clean',
      'Remove any non-paper attachments',
      'Recycle in designated bins'
    ],
    'organic': [
      'Compost if possible',
      'Use organic waste collection services',
      'Avoid mixing with non-organic waste'
    ],
    'metal': [
      'Rinse metal containers',
      'Separate different metal types',
      'Check for recycling programs'
    ],
    'glass': [
      'Handle with care to avoid breakage',
      'Rinse thoroughly',
      'Separate by color if required'
    ],
    'electronic': [
      'Use certified e-waste recyclers',
      'Remove batteries if possible',
      'Check for manufacturer take-back programs'
    ],
    'hazardous': [
      'Contact local hazardous waste facility',
      'Do not mix with regular waste',
      'Follow safety guidelines strictly'
    ]
  };

  const baseRecommendations = recommendations[wasteType] || [
    'Contact local waste management',
    'Check disposal guidelines',
    'Consider professional disposal services'
  ];

  if (isHazardous) {
    baseRecommendations.unshift('⚠️ HAZARDOUS WASTE - Handle with extreme caution');
  }

  return baseRecommendations;
}

// Utility function to convert file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

// Batch analysis for multiple images
export async function analyzeMultipleImages(images: File[]): Promise<AIVerificationResponse[]> {
  const results = await Promise.all(
    images.map(async (image) => {
      const formData = new FormData();
      formData.append('image', image);
      
      const response = await fetch('/api/analyze-waste', {
        method: 'POST',
        body: formData,
      });
      
      return response.json();
    })
  );
  return results;
}

// Quality assessment for uploaded images
export function assessImageQuality(imageFile: File): Promise<{
  isValid: boolean;
  issues: string[];
  recommendations: string[];
}> {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check file size (max 10MB)
  if (imageFile.size > 10 * 1024 * 1024) {
    issues.push('Image file is too large');
    recommendations.push('Compress image to under 10MB');
  }

  // Check file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(imageFile.type)) {
    issues.push('Invalid file type');
    recommendations.push('Use JPEG, PNG, or WebP format');
  }

  // Check image dimensions (if possible)
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (img.width < 200 || img.height < 200) {
        issues.push('Image resolution is too low');
        recommendations.push('Use images with at least 200x200 pixels');
      }
      
      if (img.width > 4000 || img.height > 4000) {
        issues.push('Image resolution is very high');
        recommendations.push('Consider resizing to improve processing speed');
      }

      resolve({
        isValid: issues.length === 0,
        issues,
        recommendations
      });
    };
    img.onerror = () => {
      issues.push('Unable to read image');
      recommendations.push('Try uploading a different image');
      resolve({
        isValid: false,
        issues,
        recommendations
      });
    };
    img.src = URL.createObjectURL(imageFile);
  });
} 