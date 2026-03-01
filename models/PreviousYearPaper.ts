import mongoose, { Schema, model, models } from "mongoose";

export interface IPreviousYearPaper {
  _id: mongoose.Types.ObjectId;
  /** Exam this paper belongs to */
  examId: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description?: string;
  /** Year of the exam paper e.g. 2023 */
  year: number;
  /** Optional: Session like "January", "April", "Morning", "Evening" */
  session?: string;
  durationMinutes: number;
  totalMarks: number;
  totalQuestions: number;
  difficulty?: "Easy" | "Medium" | "Hard" | "Mixed";
  /** Display order within same exam */
  orderNumber: number;
  status: "Active" | "Inactive";
  /** If true, show as "Unlocks later" / locked */
  locked?: boolean;
  /** Optional image URL for card */
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const previousYearPaperSchema = new Schema<IPreviousYearPaper>(
  {
    examId: { type: Schema.Types.ObjectId, required: true, ref: "Exam" },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String, default: "" },
    year: { type: Number, required: true },
    session: { type: String, default: "" },
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
    locked: { type: Boolean, default: false },
    image: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

previousYearPaperSchema.index({ examId: 1, slug: 1 }, { unique: true });
previousYearPaperSchema.index({ examId: 1, year: -1 });
previousYearPaperSchema.index({ examId: 1, orderNumber: 1 });
previousYearPaperSchema.index({ examId: 1 });
previousYearPaperSchema.index({ year: 1 });
previousYearPaperSchema.index({ status: 1 });

const PreviousYearPaper =
  models.PreviousYearPaper ?? model<IPreviousYearPaper>("PreviousYearPaper", previousYearPaperSchema);
export default PreviousYearPaper;
