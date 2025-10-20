import { z } from 'zod';

// Time format: "HH:MM" or "H:MM"
const timeSchema = z.string().regex(/^\d{1,2}:\d{2}$/, 'Invalid time format. Expected HH:MM');

// Day of week
const daySchema = z.enum([
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]);

// Subject type
const subjectTypeSchema = z.enum(['academic', 'break', 'administrative', 'other']);

// TimeBlock schema
export const timeBlockSchema = z.object({
  id: z.string().optional(),
  day: daySchema,
  start_time: timeSchema,
  end_time: timeSchema,
  duration_minutes: z.number().int().min(1).optional(),
  subject: z.string().min(1, 'Subject name is required'),
  subject_type: subjectTypeSchema.optional().default('academic'),
  notes: z.string().optional().nullable(),
  color_code: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
  room_location: z.string().optional().nullable(),
  confidence: z.number().min(0).max(1).optional().default(1),
});

// Metadata schema
export const metadataSchema = z.object({
  teacher_name: z.string().nullable().optional(),
  class_name: z.string().nullable().optional(),
  term: z.string().nullable().optional(),
  school_name: z.string().nullable().optional(),
  extraction_confidence: z.number().min(0).max(1).default(0.5),
});

// Full extraction response schema
export const timetableExtractionSchema = z.object({
  metadata: metadataSchema,
  timeblocks: z.array(timeBlockSchema).min(1, 'At least one timeblock is required'),
});

// Validation helper
export function validateTimetable(data) {
  return timetableExtractionSchema.safeParse(data);
}

// Business logic validation
export function validateTimeRanges(timeblocks) {
  const errors = [];

  for (const block of timeblocks) {
    const [startHour, startMin] = block.start_time.split(':').map(Number);
    const [endHour, endMin] = block.end_time.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (endMinutes <= startMinutes) {
      errors.push({
        block,
        error: 'End time must be after start time',
      });
    }

    // Reasonable school hours (5 AM to 11 PM)
    if (startHour < 5 || endHour > 23) {
      errors.push({
        block,
        error: 'Time outside reasonable school hours',
        severity: 'warning',
      });
    }
  }

  return errors;
}

// Calculate duration if missing
export function enrichTimeBlocks(timeblocks) {
  return timeblocks.map((block) => {
    if (!block.duration_minutes) {
      const [startHour, startMin] = block.start_time.split(':').map(Number);
      const [endHour, endMin] = block.end_time.split(':').map(Number);
      const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
      block.duration_minutes = duration;
    }
    return block;
  });
}
