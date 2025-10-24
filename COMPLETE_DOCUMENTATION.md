# Timetable Extractor - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Installation Guide](#installation-guide)
4. [API Documentation](#api-documentation)
5. [Deployment Guide](#deployment-guide)
6. [Troubleshooting](#troubleshooting)
7. [Usage Examples](#usage-examples)

---

## 1. Project Overview

### Purpose
The Timetable Extractor is an AI-powered web application that extracts structured timetable data from teacher schedule images. It uses GPT-4 Vision API to intelligently parse timetable images and returns structured JSON data.

### Key Features
- **Multi-format Support**: PNG, JPEG, PDF files
- **AI-Powered Extraction**: Uses OpenAI GPT-4o with vision capabilities
- **Structured Output**: Returns JSON with subjects, timings, and days
- **Beautiful UI**: Responsive web interface with drag-and-drop upload
- **RESTful API**: Easy integration with other applications
- **Error Handling**: Comprehensive error messages and fallback mechanisms

### Technology Stack
- **Backend**: Node.js, Express.js
- **AI/ML**: OpenAI GPT-4o Vision API
- **Image Processing**: Sharp, Tesseract.js (local only)
- **PDF Processing**: pdf-parse
- **Validation**: Zod schema validation
- **Logging**: Winston
- **Deployment**: Vercel (serverless)

---

## 2. System Architecture

### High-Level Architecture
```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │ HTTP POST /api/extract
       ▼
┌─────────────────────────┐
│   Express API Server    │
│  - File Upload (Multer) │
│  - Validation (Zod)     │
│  - Error Handling       │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│   File Processor        │
│  - Image Processor      │
│  - PDF Processor        │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│   LLM Service           │
│  - OpenAI GPT-4o        │
│  - Vision Analysis      │
│  - Text Parsing         │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│   Structured Response   │
│  - Timetable JSON       │
│  - Confidence Score     │
│  - Metadata             │
└─────────────────────────┘
```

### Data Flow
1. **Upload**: Client uploads image/PDF file
2. **Validation**: File type and size validated (max 10MB)
3. **Processing**: File converted to buffer, preprocessed
4. **AI Analysis**: GPT-4 Vision analyzes the image
5. **Parsing**: AI extracts structured timetable data
6. **Response**: JSON data returned to client
7. **Rendering**: Client displays timetable in beautiful UI

---

## 3. Installation Guide

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn
- OpenAI API key (with GPT-4o access)
- Git

### Local Development Setup

#### Step 1: Clone Repository
```bash
git clone https://github.com/riturajratan/timetable-extractor.git
cd timetable-extractor
```

#### Step 2: Install Dependencies
```bash
cd backend
npm install
```

#### Step 3: Configure Environment Variables
```bash
cp .env.example .env
```

Edit `.env` file:
```env
# OpenAI API Configuration
OPENAI_API_KEY=your_actual_api_key_here

# Server Configuration
PORT=4012
NODE_ENV=development

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/png,image/jpeg,application/pdf

# Processing Configuration
OCR_CONFIDENCE_THRESHOLD=0.6
ENABLE_OCR=true
ENABLE_LLM_VISION=true

# CORS Configuration
CORS_ORIGIN=*
```

#### Step 4: Start Development Server
```bash
npm run dev
```

The server will start at `http://localhost:4012`

#### Step 5: Access the Application
Open browser: `http://localhost:4012`

---

## 4. API Documentation

### Base URL
- **Local**: `http://localhost:4012`
- **Production**: `https://timetable-extractor.vercel.app`

### Endpoints

#### 1. Health Check
**GET** `/api/health`

Check if the API is running.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-24T06:06:12.689Z",
  "uptime": 123.456
}
```

#### 2. Extract Timetable
**POST** `/api/extract`

Extract structured timetable data from an uploaded file.

**Request:**
- **Content-Type**: `multipart/form-data`
- **Field**: `file` (image/PDF file)
- **Max Size**: 10MB
- **Supported Formats**: PNG, JPEG, PDF

**Example Request (cURL):**
```bash
curl -X POST http://localhost:4012/api/extract \
  -F "file=@/path/to/timetable.png"
```

**Example Request (JavaScript):**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('/api/extract', {
  method: 'POST',
  body: formData
});

const data = await response.json();
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "teacherName": "John Doe",
    "timetable": [
      {
        "day": "Monday",
        "periods": [
          {
            "period": 1,
            "startTime": "08:00",
            "endTime": "08:45",
            "subject": "Mathematics",
            "class": "10A",
            "type": "teaching"
          },
          {
            "period": 2,
            "startTime": "08:45",
            "endTime": "09:30",
            "subject": "Break",
            "type": "break"
          }
        ]
      }
    ],
    "metadata": {
      "totalPeriods": 40,
      "totalTeachingPeriods": 32,
      "totalBreaks": 5,
      "totalFreePeriods": 3,
      "confidence": 0.95
    }
  },
  "extractionMethod": "gpt-4-vision",
  "processingTime": 3521
}
```

**Error Response (400/413/415/500):**
```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File size exceeds maximum allowed size of 10MB"
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `FILE_REQUIRED` | 400 | No file uploaded |
| `UNSUPPORTED_FILE_TYPE` | 415 | File type not supported |
| `FILE_TOO_LARGE` | 413 | File exceeds 10MB |
| `IMAGE_PROCESSING_FAILED` | 500 | Failed to process image |
| `PDF_PROCESSING_FAILED` | 500 | Failed to process PDF |
| `LLM_EXTRACTION_FAILED` | 500 | AI extraction failed |
| `INVALID_REQUEST` | 400 | Invalid request format |

---

## 5. Deployment Guide

### Deploying to Vercel

#### Prerequisites
- Vercel account
- GitHub repository
- OpenAI API key

#### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

#### Step 2: Login to Vercel
```bash
vercel login
```

#### Step 3: Configure Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add the following:

| Variable | Value | Environments |
|----------|-------|--------------|
| `OPENAI_API_KEY` | Your OpenAI API key | Production, Preview, Development |
| `NODE_ENV` | production | Production |
| `MAX_FILE_SIZE` | 10485760 | All |
| `ENABLE_OCR` | false | Production, Preview |
| `ENABLE_LLM_VISION` | true | All |

**IMPORTANT**: Set `ENABLE_OCR=false` for serverless environments (Vercel, AWS Lambda) because Tesseract.js WASM files don't work in serverless.

#### Step 4: Deploy
```bash
# From project root
vercel --prod
```

#### Step 5: Verify Deployment
Visit your deployment URL and test file upload.

### Vercel Configuration Details

The `vercel.json` file configures:
- **Function timeout**: 60 seconds (for processing large images)
- **Memory**: 1024MB (for image processing)
- **Body size**: 50MB limit in Express (actual Vercel limit is 4.5MB on free tier)

---

## 6. Troubleshooting

### Common Issues and Solutions

#### Issue 1: "401 Incorrect API key provided"

**Symptom**: File uploads fail with API key error

**Cause**: OpenAI API key is missing, invalid, or expired

**Solution**:
1. Check your API key at: https://platform.openai.com/api-keys
2. Verify the key has GPT-4o access
3. Update environment variable in Vercel:
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Update `OPENAI_API_KEY` with valid key
   - Redeploy application

**Local Testing**:
```bash
# Test API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Issue 2: "ENOENT: tesseract-core-simd.wasm not found"

**Symptom**: Server crashes with Tesseract WASM error

**Cause**: Tesseract.js doesn't work in serverless environments

**Solution**:
Set environment variable in Vercel:
```
ENABLE_OCR=false
```

This disables OCR fallback in serverless and relies only on GPT-4 Vision.

#### Issue 3: File Upload Fails (413 Payload Too Large)

**Symptom**: Large files fail to upload

**Cause**: Body size limits too small

**Solution**:
- **Already fixed** in latest code
- Express body limits increased to 50MB
- Vercel free tier has 4.5MB limit (upgrade for larger files)

#### Issue 4: Function Timeout (504 Gateway Timeout)

**Symptom**: Processing takes too long, request times out

**Cause**: Serverless function timeout

**Solution**:
- **Already configured** in vercel.json (60s timeout)
- For very large files, consider upgrading Vercel plan
- Optimize images before upload (resize, compress)

#### Issue 5: Memory Error (Out of Memory)

**Symptom**: Processing fails with memory error

**Cause**: Insufficient memory allocation

**Solution**:
- **Already configured** in vercel.json (1024MB)
- Compress images before upload
- Upgrade Vercel plan for more memory

---

## 7. Usage Examples

### Example 1: Upload via Web Interface

1. Open `https://timetable-extractor.vercel.app`
2. Click "Choose File" or drag & drop image
3. Wait for processing (usually 2-5 seconds)
4. View extracted timetable with statistics

### Example 2: Upload via cURL

```bash
curl -X POST https://timetable-extractor.vercel.app/api/extract \
  -F "file=@teacher_timetable.png" \
  -o result.json
```

### Example 3: Upload via JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <title>Timetable Upload</title>
</head>
<body>
  <input type="file" id="fileInput" accept="image/*,application/pdf">
  <button onclick="uploadFile()">Upload</button>
  <pre id="result"></pre>

  <script>
    async function uploadFile() {
      const fileInput = document.getElementById('fileInput');
      const file = fileInput.files[0];

      if (!file) {
        alert('Please select a file');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/extract', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();
        document.getElementById('result').textContent =
          JSON.stringify(data, null, 2);
      } catch (error) {
        alert('Error: ' + error.message);
      }
    }
  </script>
</body>
</html>
```

### Example 4: Upload via Python

```python
import requests

url = 'https://timetable-extractor.vercel.app/api/extract'
files = {'file': open('timetable.png', 'rb')}

response = requests.post(url, files=files)
data = response.json()

if data['success']:
    print(f"Teacher: {data['data']['teacherName']}")
    print(f"Total Periods: {data['data']['metadata']['totalPeriods']}")
    print(f"Confidence: {data['data']['metadata']['confidence']}")
else:
    print(f"Error: {data['error']['message']}")
```

---

## API Key Management

### Getting an OpenAI API Key

1. Go to: https://platform.openai.com/signup
2. Create account or sign in
3. Navigate to: https://platform.openai.com/api-keys
4. Click "Create new secret key"
5. Copy the key (starts with `sk-proj-...`)
6. **Important**: Save it securely - you won't see it again!

### Verifying API Key Access

```bash
# Check if you have GPT-4o access
curl https://api.openai.com/v1/models/gpt-4o \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Cost Estimation

GPT-4o Vision costs:
- Input: $2.50 per 1M tokens
- Output: $10.00 per 1M tokens

Typical timetable extraction:
- ~1,000-2,000 tokens per request
- Cost: ~$0.01 - $0.02 per extraction

---

## Performance Optimization

### Image Optimization Tips
1. **Resize**: Keep images under 2000x2000px
2. **Format**: PNG or JPEG work best
3. **Quality**: 80-90% quality is sufficient
4. **File Size**: Keep under 5MB for faster processing

### Best Practices
1. Use clear, high-contrast images
2. Ensure text is readable
3. Avoid skewed or rotated images
4. Remove unnecessary borders/margins

---

## Security Considerations

### API Key Security
- **Never** commit API keys to version control
- Use environment variables for all secrets
- Rotate API keys regularly
- Monitor usage on OpenAI dashboard

### File Upload Security
- File type validation enforced
- File size limits prevent abuse
- Memory storage (no disk writes)
- Automatic cleanup after processing

### CORS Configuration
- Configured for all origins in development
- Restrict in production: `CORS_ORIGIN=https://yourdomain.com`

---

## Support and Resources

### Links
- **GitHub**: https://github.com/riturajratan/timetable-extractor
- **OpenAI Docs**: https://platform.openai.com/docs
- **Vercel Docs**: https://vercel.com/docs

### Contact
- **Developer**: Rituraj Ratan
- **Email**: riturajratan@gmail.com

---

## Changelog

### Version 1.0.0 (October 2025)
- Initial release
- GPT-4o Vision integration
- Multi-format support (PNG, JPEG, PDF)
- Vercel deployment
- Beautiful UI
- Comprehensive error handling
- Serverless optimization

---

## License

MIT License - See LICENSE file for details

---

**Generated**: October 24, 2025
**Version**: 1.0.0
**Status**: Production Ready
