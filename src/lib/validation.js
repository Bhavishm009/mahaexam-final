import { z } from "zod";

export const createStudentSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email().max(255),
  phone: z.string().trim().max(30).optional().nullable(),
  education: z.string().trim().max(120).optional().nullable(),
  district: z.string().trim().max(120).optional().nullable(),
  taluka: z.string().trim().max(120).optional().nullable(),
  targetExam: z.string().trim().max(120).optional().nullable(),
});

export const createBatchSchema = z.object({
  name: z.string().trim().min(2).max(120),
  examType: z.string().trim().max(120).optional(),
  description: z.string().trim().max(1000).optional().nullable(),
  teacherId: z.string().optional().nullable(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional().nullable(),
});

export const createExamSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).optional(),
  examType: z.string().trim().max(120).optional(),
  language: z.enum(["mr", "en", "both"]).optional(),
  durationMinutes: z.coerce.number().int().min(1).max(600),
  negativeMarks: z.coerce.number().min(0).max(100).optional(),
  passingScore: z.coerce.number().min(0).max(100).nullable().optional(),
  questionIds: z.array(z.string()).min(1).max(500),
  startAt: z.coerce.date().nullable().optional(),
  endAt: z.coerce.date().nullable().optional(),
  randomizeQuestions: z.boolean().optional(),
  randomizeOptions: z.boolean().optional(),
  fullscreenRequired: z.boolean().optional(),
  violationThreshold: z.coerce.number().int().min(1).max(20).optional(),
  attemptLimit: z.coerce.number().int().min(1).max(10).optional(),
});

export function parseBody(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    const message = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    const error = new Error(message);
    error.status = 422;
    throw error;
  }
  return result.data;
}
