// src/types/subBatchTypes.ts

export interface SizeDetailInput {
  category: string;
  pieces: number;
}

export interface AttachmentInput {
  attachmentName: string;
  quantity: number;
}

export interface SubBatchPayload {
  rollId?: number;
  batchId?: number;
  name: string;
  estimatedPieces: number;
  expectedItems: number;
  startDate: string; // ISO string
  dueDate: string; // ISO string
  departmentId?: number;

  sizeDetails?: SizeDetailInput[]; // optional
  attachments?: AttachmentInput[]; // optional

  // optional arrays you might add in the future
  rejected?: any[];
  altered?: any[];
  dept_links?: any[];
  worker_logs?: any[];
}

// This is the type used in update, allowing partial fields
export type SubBatchPayloadWithArrays = SubBatchPayload;
