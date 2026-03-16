import mongoose, { Schema, model, models } from "mongoose";

export interface IFullLengthMock {
  _id: mongoose.Types.ObjectId;
  /** Exam this mock test belongs to */
  examId: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description?: string;
  durationMinutes: number;
  totalMarks: number;
  totalQuestions: number;
  difficulty?: "Easy" | "Medium" | "Hard" | "Mixed";
  /** Display order within same exam */
  orderNumber: number;
  status: "Active" | "Inactive";
  /** Display ID e.g. MOCK-2024-001 */
  mockId?: string;
  /** If true, show as "Unlocks later" / locked */
  locked?: boolean;
  /** Optional image URL for card */
  image?: string;
  /** Exam regulations HTML (rich text), shown before candidate starts the mock */
  regulations?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const fullLengthMockSchema = new Schema<IFullLengthMock>(
  {
    examId: { type: Schema.Types.ObjectId, required: true, ref: "Exam" },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String, default: "" },
    durationMinutes: { type: Number, required: true, default: 180 },
    totalMarks: { type: Number, required: true, default: 300 },
    totalQuestions: { type: Number, required: true, default: 90 },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard", "Mixed"],
      default: "Mixed",
    },
    orderNumber: { type: Number, default: 1 },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    mockId: { type: String, default: "", trim: true },
    locked: { type: Boolean, default: false },
    image: { type: String, default: "" },
    regulations: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

fullLengthMockSchema.index({ examId: 1, slug: 1 }, { unique: true });
fullLengthMockSchema.index({ examId: 1, orderNumber: 1 });
fullLengthMockSchema.index({ examId: 1 });
fullLengthMockSchema.index({ status: 1 });

const FullLengthMock =
  models.FullLengthMock ?? model<IFullLengthMock>("FullLengthMock", fullLengthMockSchema);
export default FullLengthMock;
