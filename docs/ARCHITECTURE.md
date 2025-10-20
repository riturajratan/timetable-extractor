# Timetable Extraction System - Architecture Design

**Project:** Learning Yogi - Teacher Timetable Extraction System
**Author:** Rituraj Ratan
**Date:** October 2025
**Version:** 1.0

---

## Executive Summary

This document outlines the architectural design for an intelligent timetable extraction system that processes teacher timetables in various formats (images, PDFs, Word documents) and extracts structured time-block data for display in a modern web interface.

**Key Design Principles:**
- **Robustness**: Handle diverse formats and layouts
- **Intelligence**: LLM-powered extraction for complex cases
- **Scalability**: Modular architecture for future enhancements
- **Simplicity**: Lightweight prototype without unnecessary complexity

---

## 1. System Overview

### 1.1 End-to-End Workflow

```
┌─────────────┐
│   Teacher   │
│  Uploads    │
│  Timetable  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│         Frontend (React App)            │
│  - File picker component                │
│  - Upload progress indicator            │
│  - Timetable visualization              │
└──────────────┬──────────────────────────┘
               │ HTTP POST /api/extract
               │ (multipart/form-data)
               ▼
┌─────────────────────────────────────────┐
│      Backend API (Node.js/Express)      │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │   File Upload Handler (Multer)    │ │
│  │  - Validate file type & size      │ │
│  │  - Store temp file                │ │
│  └───────────┬───────────────────────┘ │
│              │                          │
│              ▼                          │
│  ┌───────────────────────────────────┐ │
│  │    File Type Detector             │ │
│  │  - Check MIME type                │ │
│  │  - Route to appropriate processor │ │
│  └───────────┬───────────────────────┘ │
│              │                          │
│              ▼                          │
│  ┌─────────────────────────────────┐   │
│  │   Processing Pipeline Router     │   │
│  │                                  │   │
│  │  ┌──────────┐  ┌──────────┐    │   │
│  │  │  Image   │  │   PDF    │    │   │
│  │  │ Processor│  │ Processor│    │   │
│  │  └────┬─────┘  └────┬─────┘    │   │
│  │       │             │           │   │
│  │       ▼             ▼           │   │
│  │  ┌──────────────────────┐      │   │
│  │  │   OCR/Text Extract   │      │   │
│  │  │  - Tesseract.js      │      │   │
│  │  │  - pdf-parse         │      │   │
│  │  └──────────┬───────────┘      │   │
│  │             │                   │   │
│  └─────────────┼───────────────────┘   │
│                │                        │
│                ▼                        │
│  ┌─────────────────────────────────┐   │
│  │   LLM Processing (Claude API)   │   │
│  │  - Vision-capable model         │   │
│  │  - Structured prompt            │   │
│  │  - JSON extraction              │   │
│  │  - Confidence scoring           │   │
│  └──────────┬──────────────────────┘   │
│             │                           │
│             ▼                           │
│  ┌─────────────────────────────────┐   │
│  │   Response Validator            │   │
│  │  - Schema validation (Zod)      │   │
│  │  - Data sanitization            │   │
│  │  - Error handling               │   │
│  └──────────┬──────────────────────┘   │
│             │                           │
└─────────────┼───────────────────────────┘
              │ JSON Response
              ▼
┌─────────────────────────────────────────┐
│         Frontend Display                │
│  - Parse JSON response                  │
│  - Render timetable grid                │
│  - Apply styling & interactions         │
└─────────────────────────────────────────┘
```

### 1.2 Sequence Diagram

```
Teacher    Frontend       Backend API    File Processor    LLM Service    Response
  │           │                │                │               │            │
  ├─Upload────►                │                │               │            │
  │           │                │                │               │            │
  │           ├─POST /extract──►                │               │            │
  │           │                │                │               │            │
  │           │                ├─Validate File──►               │            │
  │           │                │                │               │            │
  │           │                ├─Detect Type────►               │            │
  │           │                │                │               │            │
  │           │                │                ├─Extract Text──►            │
  │           │                │                │   (OCR/Parse) │            │
  │           │                │                │               │            │
  │           │                │                ◄───Raw Text────┤            │
  │           │                │                │               │            │
  │           │                │                ├─Send to LLM───►            │
  │           │                │                │  (with prompt)│            │
  │           │                │                │               │            │
  │           │                │                │               ├─Parse─────►│
  │           │                │                │               │  Structure │
  │           │                │                │               │            │
  │           │                │                │               ◄─JSON Data─┤
  │           │                │                │               │            │
  │           │                │                ◄─Structured────┤            │
  │           │                │                │   Timetable   │            │
  │           │                │                │               │            │
  │           │                ◄─Validate───────┤               │            │
  │           │                │  Response      │               │            │
  │           │                │                │               │            │
  │           ◄─200 OK + JSON──┤                │               │            │
  │           │                │                │               │            │
  ◄─Display───┤                │                │               │            │
```

---

## 2. Technology Stack

### 2.1 Backend Stack (Node.js)

| Component | Technology | Justification |
|-----------|-----------|---------------|
| **Runtime** | Node.js 18+ | Industry standard, excellent async I/O for file processing |
| **Framework** | Express.js | Lightweight, mature, extensive middleware ecosystem |
| **File Upload** | Multer | De facto standard for multipart/form-data handling |
| **PDF Processing** | pdf-parse | Pure JavaScript, no system dependencies, fast |
| **OCR** | Tesseract.js | WebAssembly-based, runs in Node.js, decent accuracy |
| **Image Processing** | Sharp | High-performance image manipulation, preprocessing |
| **LLM Integration** | Anthropic SDK | Claude 3.5 Sonnet for vision + structured output |
| **Validation** | Zod | Type-safe schema validation, great TypeScript support |
| **Logging** | Winston | Structured logging, multiple transports |
| **Environment** | dotenv | Configuration management |

### 2.2 Why These Choices?

**Node.js + Express:**
- Fast development cycle
- Single language (JavaScript/TypeScript) across stack
- Excellent package ecosystem for file processing
- Non-blocking I/O ideal for API services

**Claude API over OpenAI:**
- Superior vision capabilities for complex timetable layouts
- Better at following structured output instructions
- Longer context window (200K tokens)
- More accurate with table understanding
- Excellent handling of handwritten/scanned content

**Tesseract.js:**
- No Python dependencies (pure JS)
- WebAssembly performance
- Fallback when LLM vision isn't needed

**No Database for Prototype:**
- Faster development
- Focus on core extraction logic
- Stateless API design
- Easy to add persistence layer later

### 2.3 Frontend Stack (Recommended)

| Component | Technology | Justification |
|-----------|-----------|---------------|
| **Framework** | React 18+ with TypeScript | Component reusability, strong ecosystem |
| **State Management** | Zustand or React Query | Simple, modern state management |
| **Calendar UI** | FullCalendar or DayPilot | Production-ready timetable components |
| **Styling** | TailwindCSS | Rapid UI development, responsive design |
| **File Upload** | react-dropzone | Drag-drop support, good UX |
| **API Client** | Axios or Fetch | HTTP request handling |
| **Build Tool** | Vite | Fast HMR, modern build pipeline |

---

## 3. Database Schema Design

While the prototype doesn't implement a database, here's the recommended schema for production:

### 3.1 Entity Relationship Diagram

```
┌─────────────────────────┐
│      Timetables         │
├─────────────────────────┤
│ id (UUID) PK            │
│ teacher_name            │
│ class_name              │
│ term_name               │
│ school_name             │
│ uploaded_at (timestamp) │
│ original_filename       │
│ file_type               │
│ processing_status       │
│ extraction_confidence   │
└──────────┬──────────────┘
           │
           │ 1:N
           │
           ▼
┌─────────────────────────┐
│      TimeBlocks         │
├─────────────────────────┤
│ id (UUID) PK            │
│ timetable_id (FK)       │
│ day_of_week (ENUM)      │
│ start_time (TIME)       │
│ end_time (TIME)         │
│ duration_minutes (INT)  │
│ subject_name            │
│ subject_category        │
│ notes                   │
│ color_code              │
│ room_location           │
│ confidence_score (0-1)  │
└─────────────────────────┘
```

### 3.2 Table Schemas

**timetables**
```sql
CREATE TABLE timetables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_name VARCHAR(255),
    class_name VARCHAR(255),
    term_name VARCHAR(255),
    school_name VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    original_filename VARCHAR(500),
    file_type VARCHAR(50),
    processing_status VARCHAR(50) DEFAULT 'pending',
    extraction_confidence DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**timeblocks**
```sql
CREATE TABLE timeblocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timetable_id UUID REFERENCES timetables(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INTEGER,
    subject_name VARCHAR(255) NOT NULL,
    subject_category VARCHAR(100),
    notes TEXT,
    color_code VARCHAR(7),
    room_location VARCHAR(100),
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_timeblocks_timetable_id ON timeblocks(timetable_id);
CREATE INDEX idx_timeblocks_day ON timeblocks(day_of_week);
```

**extraction_metadata** (for analytics)
```sql
CREATE TABLE extraction_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timetable_id UUID REFERENCES timetables(id) ON DELETE CASCADE,
    file_size_bytes INTEGER,
    processing_time_ms INTEGER,
    ocr_used BOOLEAN,
    llm_model_used VARCHAR(100),
    llm_tokens_used INTEGER,
    extraction_errors JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.3 Future Extensions

**For multi-tenancy:**
- Add `organizations` table
- Add `users` table with roles
- Add `organization_id` foreign keys

**For versioning:**
- Add `timetable_versions` table
- Track changes over time
- Allow rollback functionality

---

## 4. LLM Integration Strategy

### 4.1 Pipeline Integration Points

The LLM (Claude 3.5 Sonnet) is used at the **parsing and structuring stage**, after initial text/image extraction:

```
Raw File → Preprocessing → [LLM HERE] → Structured JSON → Validation → Response
```

**Why at this stage?**
- Has access to both raw images and extracted text
- Can use vision capabilities for complex layouts
- Understands context better than rule-based parsers
- Handles edge cases and variations naturally

### 4.2 Prompt Engineering Strategy

**Approach:** Multi-shot prompting with structured output

**Prompt Structure:**
```
[SYSTEM PROMPT]
You are an expert at extracting structured timetable data from teacher schedules.
You must output valid JSON only.

[CONTEXT]
Teachers upload timetables in various formats. Your task:
1. Identify all time blocks (classes, breaks, activities)
2. Extract accurate start/end times
3. Preserve original subject names
4. Include any notes or details

[EXAMPLES - Few-shot learning]
Example 1: [Simple grid timetable] → [Expected JSON]
Example 2: [Complex with notes] → [Expected JSON]

[TASK]
Extract timetable data from the provided image/text.

[OUTPUT FORMAT]
{
  "metadata": {
    "teacher_name": string | null,
    "class_name": string | null,
    "term": string | null,
    "extraction_confidence": number (0-1)
  },
  "timeblocks": [
    {
      "day": string,
      "start_time": "HH:MM",
      "end_time": "HH:MM",
      "subject": string,
      "notes": string | null,
      "type": "academic" | "break" | "other"
    }
  ]
}

[INPUT]
```

### 4.3 Ensuring Accuracy & Reproducibility

**Accuracy Measures:**

1. **Temperature = 0**: Deterministic outputs
2. **JSON Mode**: Force valid JSON structure
3. **Schema Validation**: Zod schema enforcement post-LLM
4. **Confidence Scoring**: LLM provides self-assessment
5. **Multi-pass Verification**: For low confidence, re-run with different prompt
6. **Human-in-the-Loop**: Flag low confidence for manual review

**Reproducibility:**

1. **Version Tracking**: Log model version (claude-3-5-sonnet-20241022)
2. **Prompt Versioning**: Git-tracked prompt templates
3. **Request Logging**: Store all LLM requests/responses
4. **Deterministic Settings**: temperature=0, top_p=1
5. **Retry Logic**: Same input → same output (with retries)

**Fallback Strategy:**

```
┌─────────────────┐
│  Input File     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Try OCR First  │
└────────┬────────┘
         │
         ▼
    ┌─────────┐
    │ Success?│
    └────┬────┘
         │
    No   │   Yes
    ◄────┼────►
         │         ┌────────────────┐
         │         │ Try LLM Parse  │
         │         └───────┬────────┘
         │                 │
         ▼                 ▼
┌─────────────────┐  ┌─────────────┐
│ LLM Vision Mode │  │  Success?   │
│ (Send Image)    │  └──────┬──────┘
└────────┬────────┘         │
         │             No   │   Yes
         ▼             ◄────┼────►
┌─────────────────┐         │
│ Structured JSON │         │
└────────┬────────┘         │
         │                  │
         ▼                  ▼
┌─────────────────┐  ┌─────────────┐
│   Validate      │  │   Return    │
└────────┬────────┘  │   Result    │
         │           └─────────────┘
         ▼
┌─────────────────┐
│ Return Result   │
└─────────────────┘
```

### 4.4 Cost & Performance Optimization

**Cost Management:**
- Cache common patterns (similar timetables)
- Batch processing where possible
- Use OCR first, LLM only when needed
- Compress images before sending to API

**Performance:**
- Async processing (return job ID, poll for results)
- Parallel processing for multi-page documents
- Response caching (identical files)
- Streaming responses for large documents

---

## 5. Error Handling & Fallback Strategies

### 5.1 Error Categories

| Error Type | Detection | Handling Strategy |
|-----------|-----------|-------------------|
| **Invalid File Type** | MIME type check | Reject with 400, clear error message |
| **File Too Large** | Size validation | Reject with 413, suggest compression |
| **Corrupted File** | Parse attempt | Return 422 with "Unable to process" |
| **OCR Failure** | Low confidence score | Fallback to LLM vision mode |
| **LLM Timeout** | API timeout | Retry with exponential backoff (3x) |
| **Malformed LLM Output** | JSON parse error | Re-prompt with stricter instructions |
| **Missing Time Data** | Schema validation | Mark fields as null, flag low confidence |
| **Ambiguous Times** | Validation logic | Include multiple interpretations |
| **API Rate Limit** | 429 response | Queue request, inform user of delay |

### 5.2 Validation Pipeline

```typescript
function validateExtraction(data: any): ValidationResult {
  // 1. Schema validation (structure)
  const schemaValid = zodSchema.safeParse(data);
  if (!schemaValid.success) {
    return { valid: false, errors: schemaValid.error };
  }

  // 2. Business logic validation
  const businessRules = [
    validateTimeRanges,      // end_time > start_time
    validateDayNames,        // Valid days of week
    validateDuplicates,      // No overlapping blocks
    validateReasonableTimes, // Times within school hours
  ];

  const errors = businessRules
    .map(rule => rule(data))
    .filter(result => !result.valid);

  // 3. Confidence scoring
  const confidence = calculateConfidence(data);

  return {
    valid: errors.length === 0,
    errors,
    confidence,
    requiresReview: confidence < 0.7
  };
}
```

### 5.3 User-Facing Error Messages

**Good Error Messages:**
- ✅ "Unable to extract time information from this timetable. The format may be unclear. Please try a higher quality image."
- ✅ "Processing... Detected handwritten timetable. This may take longer."
- ✅ "Extracted timetable with 85% confidence. Please review the following blocks: [list]"

**Bad Error Messages:**
- ❌ "Internal server error"
- ❌ "Extraction failed"
- ❌ "Invalid JSON"

---

## 6. Flexibility & Extensibility

### 6.1 Modular Architecture

**Strategy Pattern for File Processors:**

```typescript
interface FileProcessor {
  canProcess(fileType: string): boolean;
  process(file: Buffer): Promise<ProcessedData>;
}

class ImageProcessor implements FileProcessor { }
class PDFProcessor implements FileProcessor { }
class DOCXProcessor implements FileProcessor { }

// Easy to add new processors
class HandwritingProcessor implements FileProcessor { }
```

**Benefits:**
- Add new file types without modifying core logic
- Swap implementations easily
- Unit test each processor independently

### 6.2 Configuration-Driven Design

**config.ts:**
```typescript
export const config = {
  llm: {
    provider: 'anthropic', // Easily switch to 'openai'
    model: 'claude-3-5-sonnet-20241022',
    temperature: 0,
    maxTokens: 4096,
  },
  processing: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/png', 'image/jpeg', 'application/pdf'],
    ocrConfidenceThreshold: 0.6,
  },
  features: {
    enableOCR: true,
    enableLLMVision: true,
    enableCaching: false, // For future
  }
};
```

### 6.3 API Versioning

**Future-proof API design:**

```
/api/v1/extract      ← Current version
/api/v2/extract      ← Future version with streaming
/api/v1/batch        ← Future batch endpoint
/api/v1/webhooks     ← Future webhook support
```

### 6.4 Extension Points

**Planned Extensions:**

1. **Batch Processing**: Upload multiple timetables at once
2. **Async Processing**: Job queue with polling endpoint
3. **Webhook Support**: Notify external systems on completion
4. **Template Library**: Pre-configured parsers for known schools
5. **Custom Training**: Fine-tune models on user feedback
6. **Export Formats**: iCal, Google Calendar, JSON, CSV
7. **Collaborative Editing**: Multi-user timetable adjustments
8. **Analytics**: Usage patterns, popular subjects, time distribution

### 6.5 Testing Strategy

**Unit Tests:**
- File type detection
- Time parsing logic
- Validation functions
- Schema enforcement

**Integration Tests:**
- End-to-end file upload → extraction → response
- LLM integration with mocked responses
- Error handling scenarios

**Regression Tests:**
- All example timetables in /examples
- Known edge cases
- Performance benchmarks

---

## 7. Security Considerations

### 7.1 File Upload Security

- File size limits (10MB max)
- MIME type whitelist
- Content-Type verification
- Virus scanning (future: ClamAV integration)
- Temporary file cleanup
- No execution of uploaded files

### 7.2 API Security

- Rate limiting (10 requests/minute per IP)
- CORS configuration
- Input sanitization
- API key authentication (for LLM calls)
- HTTPS only in production
- Request logging (no PII)

### 7.3 Data Privacy

- No storage of uploaded files (deleted after processing)
- No persistent database in demo
- Anonymize in logs
- GDPR compliance considerations for production

---

## 8. Performance Considerations

### 8.1 Expected Latency

| File Type | Size | Processing Time | Notes |
|-----------|------|-----------------|-------|
| Clean PDF | <1MB | 2-4 seconds | Fast PDF parse + LLM |
| Scanned Image | <2MB | 5-10 seconds | OCR + LLM processing |
| Handwritten | <3MB | 8-15 seconds | LLM vision mode only |

### 8.2 Optimization Strategies

1. **Image Preprocessing**: Resize large images before OCR
2. **Parallel Processing**: Multiple pages concurrently
3. **Caching**: Response cache for identical files (SHA256 hash)
4. **Lazy Loading**: Only load processors when needed
5. **Resource Limits**: Memory caps, timeout enforcement

### 8.3 Scalability Path

**Current (Demo):**
- Single Node.js process
- Synchronous processing
- No database

**Future (Production):**
- Horizontal scaling with load balancer
- Job queue (Bull/Redis)
- Worker processes for heavy tasks
- CDN for static assets
- Database connection pooling

---

## 9. Monitoring & Observability

### 9.1 Key Metrics

- **Processing Time**: P50, P95, P99 latencies
- **Success Rate**: % of successful extractions
- **Confidence Scores**: Distribution of confidence levels
- **Error Rates**: By error type
- **LLM Token Usage**: Cost tracking
- **File Type Distribution**: PNG vs PDF vs DOCX

### 9.2 Logging Strategy

**Log Levels:**
- ERROR: Extraction failures, API errors
- WARN: Low confidence, missing fields
- INFO: Successful extractions, API calls
- DEBUG: Detailed processing steps

**Structured Logging:**
```json
{
  "timestamp": "2025-10-20T14:30:00Z",
  "level": "INFO",
  "event": "extraction_complete",
  "file_type": "image/png",
  "processing_time_ms": 4523,
  "confidence": 0.92,
  "timeblocks_extracted": 25
}
```

---

## 10. Development Workflow

### 10.1 Git Workflow

**Commit Strategy:**
- Architectural planning
- Setup and configuration
- Feature implementation
- Testing and fixes
- Documentation updates

**Branch Strategy (for team):**
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: New features
- `fix/*`: Bug fixes

### 10.2 AI Tool Usage

**Tools Used:**
- Claude Code (this tool): Architecture, code generation, problem-solving
- GitHub Copilot: Autocomplete, boilerplate
- ChatGPT: Documentation, prompt engineering

**Productivity Gains:**
- Rapid prototyping
- Boilerplate generation
- Error debugging
- Documentation writing
- Test case generation

---

## 11. Deployment Strategy

### 11.1 Local Development

```bash
npm install
cp .env.example .env
# Add ANTHROPIC_API_KEY
npm run dev
```

### 11.2 Production Deployment

**Recommended Platforms:**
- **Vercel**: Serverless functions, easy deploy
- **Railway**: Full-stack apps, auto-scaling
- **AWS Elastic Beanstalk**: Full control, scalability
- **Docker + DigitalOcean**: Cost-effective

**Environment Variables:**
```
NODE_ENV=production
ANTHROPIC_API_KEY=sk-ant-...
MAX_FILE_SIZE=10485760
LOG_LEVEL=info
CORS_ORIGIN=https://app.learningyogi.com
```

---

## 12. Conclusion

This architecture provides:

✅ **Robust file processing** with OCR and PDF parsing
✅ **Intelligent extraction** using Claude LLM
✅ **Flexible design** for future enhancements
✅ **Clear error handling** with user-friendly messages
✅ **Scalable foundation** for production deployment

**Next Steps:**
1. Implement backend prototype
2. Test with provided examples
3. Document API endpoints
4. Create frontend recommendations
5. Record handover video

---

## Appendix A: JSON Response Schema

```typescript
interface TimetableExtractionResponse {
  success: boolean;
  data?: {
    metadata: {
      teacher_name: string | null;
      class_name: string | null;
      term: string | null;
      school_name: string | null;
      extraction_confidence: number; // 0-1
    };
    timeblocks: TimeBlock[];
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  processing_time_ms: number;
}

interface TimeBlock {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  start_time: string; // "HH:MM" format
  end_time: string;   // "HH:MM" format
  duration_minutes: number;
  subject: string;
  subject_type: 'academic' | 'break' | 'administrative' | 'other';
  notes?: string;
  color_code?: string; // Hex color from original
  room_location?: string;
  confidence: number; // 0-1
}
```

## Appendix B: API Endpoints

### POST /api/v1/extract

**Request:**
```
Content-Type: multipart/form-data

Body:
  - file: <binary data>
  - options: {
      "include_low_confidence": boolean,
      "enable_ocr": boolean
    }
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "metadata": { ... },
    "timeblocks": [ ... ]
  },
  "processing_time_ms": 4523
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "Only PNG, JPG, and PDF files are supported"
  }
}
```

---

**End of Architecture Document**
