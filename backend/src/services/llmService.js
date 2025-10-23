import OpenAI from 'openai';
import { config } from '../config/index.js';
import logger from '../utils/logger.js';

// Initialize OpenAI client
const openai = config.openaiApiKey
  ? new OpenAI({ apiKey: config.openaiApiKey })
  : null;

// System prompt for timetable extraction
const SYSTEM_PROMPT = `You are an expert at extracting structured timetable data from teacher schedules.
You must output valid JSON only, following the exact schema provided.

Your task is to:
1. Identify all time blocks (classes, breaks, activities, registration, etc.)
2. Extract accurate start and end times
3. Preserve original subject names exactly as they appear
4. Include any notes or additional details
5. Identify the day of the week for each block
6. Determine the subject type (academic, break, administrative, or other)

Important guidelines:
- Be precise with times - if you see "9:30 - 10am", that's 9:30 to 10:00
- If times are ambiguous, use your best judgment
- Preserve all original text (don't translate or modify subject names)
- If you can't determine something, use null
- Include ALL blocks you can identify, even small ones like "Registration"
- IMPORTANT: Text may be written vertically or with spaces between letters (e.g. "B R E A K" or "L U N C H" or "H O M E")
- When you see spaced letters like "B R E A K", combine them into "Break"
- Common vertical/spaced words: BREAK, LUNCH, HOME, STORYTIME - these are usually break periods
- Classify activities like Break, Lunch, Home Time, Story Time as subject_type: "break"
- Classify Registration, Assembly as subject_type: "administrative"`;

// Example output format in the prompt
const EXAMPLE_OUTPUT = {
  metadata: {
    teacher_name: 'Miss Joynes',
    class_name: '2EJ',
    term: 'Autumn 2 2024',
    school_name: 'Little Thurrock Primary School',
    extraction_confidence: 0.95,
  },
  timeblocks: [
    {
      day: 'Monday',
      start_time: '8:35',
      end_time: '8:50',
      subject: 'Registration and Early Morning Work',
      subject_type: 'administrative',
      notes: null,
    },
    {
      day: 'Monday',
      start_time: '9:00',
      end_time: '9:30',
      subject: 'Maths',
      subject_type: 'academic',
      notes: null,
    },
    {
      day: 'Monday',
      start_time: '10:30',
      end_time: '10:45',
      subject: 'Break',
      subject_type: 'break',
      notes: null,
    },
    {
      day: 'Monday',
      start_time: '12:00',
      end_time: '13:00',
      subject: 'Lunch',
      subject_type: 'break',
      notes: null,
    },
  ],
};

/**
 * Extract timetable data using GPT-4 Vision capabilities
 * @param {Buffer} imageBuffer - Image file buffer
 * @param {string} mimeType - Image MIME type
 * @returns {Promise<Object>} Extracted timetable data
 */
export async function extractWithVision(imageBuffer, mimeType) {
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }

  logger.info('Starting GPT-4 Vision extraction', { mimeType });

  const base64Image = imageBuffer.toString('base64');

  const userPrompt = `Extract the timetable data from this image.

Output format (JSON only, no additional text):
${JSON.stringify(EXAMPLE_OUTPUT, null, 2)}

Important:
- Extract ALL time blocks you can see
- Be precise with times
- Preserve original subject names
- Identify the day of week for each block
- Provide a confidence score (0-1) for your extraction in metadata
- If you can't read something clearly, mark it as null

Now extract from the provided image:`;

  try {
    const startTime = Date.now();

    const response = await openai.chat.completions.create({
      model: config.llm.model,
      max_tokens: config.llm.maxTokens,
      temperature: config.llm.temperature,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: userPrompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
                detail: 'high',
              },
            },
          ],
        },
      ],
    });

    const processingTime = Date.now() - startTime;
    logger.info('GPT-4 Vision extraction completed', {
      processingTime,
      tokensUsed: response.usage.total_tokens,
      promptTokens: response.usage.prompt_tokens,
      completionTokens: response.usage.completion_tokens,
    });

    // Parse JSON response
    const responseText = response.choices[0].message.content;
    const extractedData = JSON.parse(responseText);

    return {
      data: extractedData,
      metadata: {
        model: config.llm.model,
        processingTime,
        tokensUsed: response.usage.total_tokens,
      },
    };
  } catch (error) {
    logger.error('GPT-4 Vision extraction failed', {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

/**
 * Extract timetable data from text using GPT-4
 * @param {string} text - Extracted text from document
 * @param {Object} options - Additional context
 * @returns {Promise<Object>} Extracted timetable data
 */
export async function extractFromText(text, options = {}) {
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }

  logger.info('Starting GPT-4 text extraction', { textLength: text.length });

  const userPrompt = `Extract the timetable data from this text.

Text content:
"""
${text}
"""

Output format (JSON only, no additional text):
${JSON.stringify(EXAMPLE_OUTPUT, null, 2)}

Important:
- Extract ALL time blocks you can identify
- Parse times carefully (handle formats like "9-9.30", "10:30-11:00", etc.)
- Preserve original subject names
- Identify the day of week for each block
- Provide a confidence score (0-1) for your extraction
- If information is missing, use null

Now extract the timetable data:`;

  try {
    const startTime = Date.now();

    const response = await openai.chat.completions.create({
      model: config.llm.model,
      max_tokens: config.llm.maxTokens,
      temperature: config.llm.temperature,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const processingTime = Date.now() - startTime;
    logger.info('GPT-4 text extraction completed', {
      processingTime,
      tokensUsed: response.usage.total_tokens,
    });

    // Parse JSON response
    const responseText = response.choices[0].message.content;
    const extractedData = JSON.parse(responseText);

    return {
      data: extractedData,
      metadata: {
        model: config.llm.model,
        processingTime,
        tokensUsed: response.usage.total_tokens,
      },
    };
  } catch (error) {
    logger.error('GPT-4 text extraction failed', {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

/**
 * Health check for LLM service
 */
export function isConfigured() {
  return openai !== null;
}
