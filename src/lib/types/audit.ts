import { z } from 'zod';

export type AuditStatus = 'draft' | 'in_progress' | 'completed' | 'archived';
export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AuditCategory = 'security' | 'performance' | 'compliance' | 'functionality';

export interface AuditFinding {
  id: string;
  title: string;
  description: string;
  severity: AuditSeverity;
  category: AuditCategory;
  evidence?: string;
  recommendations: string[];
  status: AuditStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditReport {
  id: string;
  title: string;
  summary: string;
  auditor: string;
  startDate: Date;
  endDate?: Date;
  status: AuditStatus;
  findings: AuditFinding[];
  createdAt: Date;
  updatedAt: Date;
}

export const auditFindingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  category: z.enum(['security', 'performance', 'compliance', 'functionality']),
  evidence: z.string().optional(),
  recommendations: z.array(z.string()),
  status: z.enum(['draft', 'in_progress', 'completed', 'archived'])
});

export const auditReportSchema = z.object({
  title: z.string().min(1, "Title is required"),
  summary: z.string().min(1, "Summary is required"),
  auditor: z.string().min(1, "Auditor name is required"),
  startDate: z.date(),
  endDate: z.date().optional(),
  status: z.enum(['draft', 'in_progress', 'completed', 'archived']),
  findings: z.array(auditFindingSchema)
});

export type AuditFindingFormData = z.infer<typeof auditFindingSchema>;
export type AuditReportFormData = z.infer<typeof auditReportSchema>;