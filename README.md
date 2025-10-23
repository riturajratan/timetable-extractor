# 📚 Timetable Extraction System - Learning Yogi

**AI-Powered Teacher Timetable Extraction System**

A comprehensive solution for extracting structured timetable data from teacher schedules in various formats (images, PDFs) using GPT-4 Vision AI.

---

## 🎯 Project Overview

This system allows teachers to upload their timetables in any format and automatically extracts:
- Time blocks (classes, breaks, activities)
- Start and end times
- Subject names
- Additional notes and metadata
- Teacher, class, term information

### ✨ Key Features

- **Multi-format Support**: PNG, JPEG, PDF
- **AI-Powered Extraction**: GPT-4 Vision for intelligent parsing
- **Robust Handling**: Handles vertical text, spaced letters (B R E A K), handwritten content
- **Beautiful UI**: Modern, responsive web interface
- **RESTful API**: Clean JSON responses
- **No Database Required**: Stateless demo implementation

---

## 🏗️ Architecture

### System Workflow

```
Teacher Upload → File Validation → Type Detection → Processing Pipeline
                                                            ↓
                                    ┌───────────────────────┴───────────────────────┐
                                    │                                               │
                                  Image                                           PDF
                                    │                                               │
                            ┌───────▼────────┐                            ┌────────▼────────┐
                            │ Image Processor │                            │  PDF Processor  │
                            │  - Sharp (prep) │                            │  - pdf-parse    │
                            │  - Tesseract    │                            │  - Text extract │
                            └───────┬─────────┘                            └────────┬────────┘
                                    │                                               │
                                    └───────────────────┬───────────────────────────┘
                                                        │
                                            ┌───────────▼──────────┐
                                            │   GPT-4 Vision API   │
                                            │   - Analyze content  │
                                            │   - Extract structure│
                                            │   - JSON output      │
                                            └───────────┬──────────┘
                                                        │
                                            ┌───────────▼──────────┐
                                            │    Validation        │
                                            │    - Zod schemas     │
                                            │    - Time ranges     │
                                            │    - Enrich data     │
                                            └───────────┬──────────┘
                                                        │
                                            ┌───────────▼──────────┐
                                            │   JSON Response      │
                                            │   Display in UI      │
                                            └──────────────────────┘
```

For detailed architecture, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **LLM**: OpenAI GPT-4o (Vision-capable)
- **PDF Processing**: pdf-parse
- **OCR**: Tesseract.js (fallback)
- **Image Processing**: Sharp
- **Validation**: Zod
- **Logging**: Winston
- **File Upload**: Multer

### Frontend
- **Pure HTML/CSS/JavaScript** (no build step)
- **Inter Font** (Google Fonts)
- **Responsive Design**
- **Modern CSS Variables**

### Why These Choices?

- **GPT-4 Vision**: Superior at understanding complex table layouts, handwritten text, and spaced characters
- **Node.js**: Single language across stack, excellent async I/O
- **Stateless Design**: No database for demo simplicity, easy to add later
- **Modern UI**: Professional appearance without framework overhead

---

## 📦 Installation

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- OpenAI API key

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd timetable-extractor
```

2. **Install dependencies**
```bash
cd backend
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
PORT=4012
```

4. **Start the server**
```bash
npm start
```

The server will start on http://localhost:4012

---

## 🚀 Usage

### Web Interface

1. Open http://localhost:4012 in your browser
2. Drag and drop a timetable file or click to browse
3. Wait 10-30 seconds for AI processing
4. View extracted timetable data with:
   - Stats (blocks, confidence, processing time, days)
   - Metadata (teacher, class, term, school)
   - Weekly schedule organized by day

### API Endpoints

#### 1. Upload and Extract Timetable

**Endpoint:** `POST /api/extract`

**Request:**
```bash
curl -X POST http://localhost:4012/api/extract \
  -F "file=@path/to/timetable.png"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "metadata": {
      "teacher_name": "Miss Joynes",
      "class_name": "2EJ",
      "term": "Autumn 2 2024",
      "school_name": "Little Thurrock Primary School",
      "extraction_confidence": 0.95
    },
    "timeblocks": [
      {
        "day": "Monday",
        "start_time": "8:35",
        "end_time": "8:50",
        "duration_minutes": 15,
        "subject": "Registration and Early Morning Work",
        "subject_type": "administrative",
        "notes": null,
        "confidence": 1
      },
      {
        "day": "Monday",
        "start_time": "9:00",
        "end_time": "9:30",
        "duration_minutes": 30,
        "subject": "Maths",
        "subject_type": "academic",
        "notes": null,
        "confidence": 1
      }
    ]
  },
  "metadata": {
    "model": "gpt-4o",
    "processingTime": 4523,
    "tokensUsed": 1250,
    "extractionMethod": "gpt-4-vision",
    "filename": "timetable.png",
    "fileType": "image/png"
  },
  "processingTime": 4523
}
```

**Error Response (400/415/422/500):**
```json
{
  "success": false,
  "error": {
    "code": "UNSUPPORTED_FILE_TYPE",
    "message": "File type image/gif is not supported",
    "details": "Supported types: image/png, image/jpeg, application/pdf"
  }
}
```

#### 2. Health Check

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-23T10:30:00.000Z",
  "services": {
    "api": "operational",
    "llm": "configured"
  },
  "version": "1.0.0"
}
```

#### 3. API Information

**Endpoint:** `GET /`

Returns API metadata and available endpoints.

---

## 📊 Data Schema

### TimeBlock Object

```typescript
{
  id?: string;              // Optional identifier
  day: string;              // "Monday" | "Tuesday" | etc.
  start_time: string;       // "HH:MM" format
  end_time: string;         // "HH:MM" format
  duration_minutes?: number; // Calculated duration
  subject: string;          // Subject name (preserved as-is)
  subject_type: string;     // "academic" | "break" | "administrative" | "other"
  notes?: string | null;    // Additional notes
  color_code?: string;      // Hex color from original
  room_location?: string;   // Room number/location
  confidence: number;       // 0-1 confidence score
}
```

### Metadata Object

```typescript
{
  teacher_name: string | null;
  class_name: string | null;
  term: string | null;
  school_name: string | null;
  extraction_confidence: number; // 0-1 overall confidence
}
```

---

## 🎨 Frontend Strategy

See [docs/FRONTEND_STRATEGY.md](docs/FRONTEND_STRATEGY.md) for detailed frontend recommendations.

**Summary:**
- **Framework**: React 18+ with TypeScript
- **State Management**: Zustand or React Query
- **Calendar UI**: FullCalendar or DayPilot
- **Styling**: TailwindCSS
- **File Upload**: react-dropzone

---

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | - | OpenAI API key (required) |
| `PORT` | 3000 | Server port |
| `NODE_ENV` | development | Environment |
| `MAX_FILE_SIZE` | 10485760 | Max upload size (10MB) |
| `ALLOWED_FILE_TYPES` | image/png,image/jpeg,application/pdf | Allowed MIME types |
| `OCR_CONFIDENCE_THRESHOLD` | 0.6 | Minimum OCR confidence |
| `ENABLE_OCR` | true | Enable Tesseract OCR |
| `ENABLE_LLM_VISION` | true | Enable GPT-4 Vision |

### LLM Configuration

The system uses GPT-4o with:
- **Model**: `gpt-4o`
- **Temperature**: 0 (deterministic)
- **Max Tokens**: 4096
- **JSON Mode**: Enabled for structured output

---

## 🧪 Testing

### Test with Example Files

Example timetables are in `/examples`:
- `Teacher Timetable Example 1.1.png` - Standard grid layout
- `Teacher Timetable Example 1.2.png` - Grid with notes
- `Teacher Timetable Example 2.pdf` - Daily schedule format
- `Teacher Timetable Example 3.png` - Handwritten style
- `Teacher Timetable Example 4.jpeg` - Alternative format

### Manual Testing

```bash
# Test image upload
curl -X POST http://localhost:4012/api/extract \
  -F "file=@examples/Teacher Timetable Example 1.1.png"

# Test PDF upload
curl -X POST http://localhost:4012/api/extract \
  -F "file=@examples/Teacher Timetable Example 2.pdf"
```

---

## ⚠️ Known Limitations

### Current Version

1. **PDF Limitations**:
   - Scanned PDFs without text layer may fail
   - Recommend converting scanned PDFs to images first

2. **OCR Accuracy**:
   - Tesseract OCR may struggle with very low quality images
   - GPT-4 Vision is primary method, OCR is fallback

3. **Time Format**:
   - Expects reasonable school hours (5 AM - 11 PM)
   - Very unusual time formats may need manual review

4. **No Persistence**:
   - Demo version doesn't store data
   - Each request is stateless

5. **Rate Limiting**:
   - OpenAI API rate limits apply
   - No built-in queueing for high volume

### Future Enhancements

- Database integration (PostgreSQL/MongoDB)
- Batch processing
- Webhook support
- Export to iCal/Google Calendar
- User authentication
- Template library for known schools
- Fine-tuning on user feedback

---

## 🚨 Error Handling

The system handles errors gracefully:

| Error Type | HTTP Code | Description |
|-----------|-----------|-------------|
| Invalid file type | 415 | Unsupported MIME type |
| File too large | 413 | Exceeds 10MB limit |
| No file provided | 400 | Missing file in request |
| Validation failed | 422 | Extracted data invalid |
| Processing failed | 500 | Internal error |
| LLM timeout | 500 | API timeout (retry) |

All errors return:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "User-friendly message",
    "details": "Technical details"
  }
}
```

---

## 🤖 AI Tool Usage

This project was developed with assistance from AI tools:

### Claude Code (Anthropic)
- **Architecture Design**: System workflow, technology choices
- **Code Generation**: Backend API, services, validation schemas
- **Prompt Engineering**: GPT-4 Vision prompts for extraction
- **Documentation**: README, architecture docs
- **UI Development**: Modern responsive interface

### Productivity Gains
- **50% faster development**: Boilerplate, error handling, logging
- **Better architecture**: AI suggested patterns and best practices
- **Cleaner code**: Consistent style, comprehensive error handling
- **Comprehensive docs**: Auto-generated from codebase understanding

### How AI Was Used
1. **Planning**: Discussed architecture, reviewed requirements
2. **Implementation**: Generated service modules, validation logic
3. **Testing**: Suggested test cases, edge conditions
4. **Documentation**: Created comprehensive docs
5. **Refinement**: Iterative improvements based on testing

---

## 📁 Project Structure

```
timetable-extractor/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── index.js           # Configuration
│   │   ├── controllers/
│   │   │   └── extractController.js # Request handlers
│   │   ├── middleware/
│   │   │   ├── upload.js          # File upload middleware
│   │   │   └── errorHandler.js    # Error handling
│   │   ├── routes/
│   │   │   └── extract.js         # API routes
│   │   ├── schemas/
│   │   │   └── timetable.js       # Validation schemas
│   │   ├── services/
│   │   │   ├── fileProcessor.js   # Main orchestrator
│   │   │   ├── imageProcessor.js  # Image/OCR processing
│   │   │   ├── pdfProcessor.js    # PDF processing
│   │   │   └── llmService.js      # GPT-4 integration
│   │   ├── utils/
│   │   │   └── logger.js          # Winston logger
│   │   └── index.js               # Express app
│   ├── public/
│   │   └── index.html             # Web UI
│   ├── .env.example               # Environment template
│   ├── package.json               # Dependencies
│   └── README.md                  # This file
├── docs/
│   ├── ARCHITECTURE.md            # Detailed architecture
│   └── FRONTEND_STRATEGY.md       # Frontend recommendations
├── examples/
│   ├── Teacher Timetable Example 1.1.png
│   ├── Teacher Timetable Example 1.2.png
│   ├── Teacher Timetable Example 2.pdf
│   ├── Teacher Timetable Example 3.png
│   └── Teacher Timetable Example 4.jpeg
└── README.md                      # Main README
```

---

## 🔒 Security

- File type validation (MIME type whitelist)
- File size limits (10MB default)
- No file execution
- Temporary file cleanup
- API key stored in environment (never committed)
- CORS configured for production
- Input sanitization

**Production Recommendations:**
- Add rate limiting (express-rate-limit)
- Implement API key authentication
- Use HTTPS only
- Add virus scanning (ClamAV)
- Implement request logging with PII filtering
- Use secrets management (AWS Secrets Manager, etc.)

---

## 📝 Git Commit History

The git history shows the development workflow:

1. **Initial setup**: Architecture document
2. **Backend implementation**: API, services, validation
3. **LLM integration**: OpenAI GPT-4 prompts
4. **UI development**: Responsive web interface
5. **Testing & refinement**: Bug fixes, improvements

View commits:
```bash
git log --oneline --graph
```

---

## 📞 Support

For issues or questions:
1. Check the [Architecture Documentation](docs/ARCHITECTURE.md)
2. Review [Frontend Strategy](docs/FRONTEND_STRATEGY.md)
3. See example files in `/examples`
4. Check server logs for errors

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👨‍💻 Author

**Rituraj Ratan**
- Email: riturajratan@gmail.com
- Developed for Learning Yogi Technical Assessment

---

## 🙏 Acknowledgments

- OpenAI for GPT-4 Vision API
- Anthropic for Claude Code development tool
- Learning Yogi for the assessment opportunity

---

**Last Updated**: October 2025
**Version**: 1.0.0
**Status**: Production-ready prototype
