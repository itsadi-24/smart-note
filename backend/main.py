from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import google.generativeai as genai
import base64
import io
from PIL import Image
import os
from dotenv import load_dotenv
import logging
from typing import Optional
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('app.log')
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class ImageRequest(BaseModel):
    imageData: str

class AnalysisResponse(BaseModel):
    result: str
    error: Optional[str] = None

# Initialize FastAPI app
app = FastAPI(title="Smart Note Analysis API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","https://smart-note-adi.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini AI
try:
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    if not GOOGLE_API_KEY:
        raise ValueError("GOOGLE_API_KEY not found in environment variables")
    
    genai.configure(api_key=GOOGLE_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
    logger.info("Gemini AI initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Gemini AI: {str(e)}")
    raise

def decode_base64_image(base64_string: str) -> Image.Image:
    """Decode base64 image data to PIL Image."""
    try:
        # Remove data URL prefix if present
        if 'base64,' in base64_string:
            base64_string = base64_string.split('base64,')[1]
        
        image_data = base64.b64decode(base64_string)
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
            
        return image
    except Exception as e:
        logger.error(f"Image decoding error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid image data: {str(e)}")

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_image(request: ImageRequest):
    """
    Analyze a mathematical image using Gemini AI.
    """
    try:
        logger.info("Receiving analysis request")
        
        # Decode the base64 image
        image = decode_base64_image(request.imageData)
        logger.info("Image decoded successfully")
        
        # Prepare the prompt
        prompt = """
Analyze this image and respond naturally, as if you’re explaining to someone in simple terms. Tailor your response based on the type of image:

1. **General Scene**: Describe what is happening, who or what is in the scene, and any key details that stand out.
2. **Math Problem**: Solve it, briefly outline your approach, and explain the answer step-by-step.
3. **Text (Short or Long)**: Summarize the meaning and tone. For longer text, focus on main points and skip less important details.
4. **Chart or Graph**: Describe the type of chart, main trends, and any noticeable peaks or dips.
5. **Diagram**: Explain the components and their relationships in a simple way, clarifying any processes involved.
6. **Drawing, Artwork, or Abstract Image**: Describe the scene, style, or mood, and what it might represent or evoke.
7. **Map**: Identify the location and highlight any specific points, regions, or markers that stand out.
8. **Scientific Data or Formula**: Break down the key elements, explain the variables and operations, and summarize the results or insights in plain language.
9. **Handwritten Notes or Scanned Documents**: Describe the content, any legibility issues, and key takeaways.

Keep your response conversational, clear, and straightforward. Avoid complex language and focus on simplicity, as if explaining to a friend.
"""


        # Generate response using Gemini
        logger.info("Sending request to Gemini AI")
        response = model.generate_content([prompt, image])
        logger.info("Received response from Gemini AI")
        
        return AnalysisResponse(result=response.text)

    except HTTPException as he:
        logger.error(f"HTTP Exception: {str(he)}")
        raise
    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}")
        return AnalysisResponse(
            result="",
            error=f"Analysis failed: {str(e)}"
        )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Verify Gemini AI connection
        model.generate_content("Test")
        return {"status": "healthy", "gemini_status": "connected"}
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "status": "unhealthy",
                "error": str(e)
            }
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8080, 
        reload=True,
        log_level="info"
    )