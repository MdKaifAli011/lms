import mongoose, { Schema, model, models } from "mongoose";

export type PreviousYearPaperQuestionType = "MCQ" | "NVQ";

export interface IPreviousYearPaperQuestion {
  _id: mongoose.Types.ObjectId;
  paperId: mongoose.Types.ObjectId;
  subject?: string;
  questionText: string;
  type: PreviousYearPaperQuestionType;
  options?: string[];
  correctOptionIndex?: number;
  numericalAnswer?: string;
  numericalTolerance?: number;
  numericalUnit?: string;
  marksCorrect: number;
  marksIncorrect: number;
  imageUrl?: string;
  imageCaption?: string;
  orderNumber: number;
  difficulty?: "Easy" | "Medium" | "Hard";
  explanation?: string;
  explanationImageUrl?: string;
  updatedAt?: Date;
}

const previousYearPaperQuestionSchema = new Schema<IPreviousYearPaperQuestion>(
  {
    paperId: { type: Schema.Types.ObjectId, required: true, ref: "PreviousYearPaper" },
    subject: { type: String, default: "", trim: true },
    questionText: { type: String, required: true, trim: true },
    type: { type: String, required: true, enum: ["MCQ", "NVQ"], default: "MCQ" },
    options: [{ type: String, trim: true }],
    correctOptionIndex: { type: Number, default: 0 },
    numericalAnswer: { type: String, default: "", trim: true },
    numericalTolerance: { type: Number, default: 0 },
    numericalUnit: { type: String, default: "", trim: true },
    marksCorrect: { type: Number, required: true, default: 4 },
    marksIncorrect: { type: Number, required: true, default: 1 },
    imageUrl: { type: String, default: "", trim: true },
    imageCaption: { type: String, default: "", trim: true },
    orderNumber: { type: Number, default: 1 },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
    explanation: { type: String, default: "", trim: true },
    explanationImageUrl: { type: String, default: "", trim: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

previousYearPaperQuestionSchema.index({ paperId: 1, orderNumber: 1 });

const PreviousYearPaperQuestion =
  models.PreviousYearPaperQuestion ??
  model<IPreviousYearPaperQuestion>("PreviousYearPaperQuestion", previousYearPaperQuestionSchema);
export default PreviousYearPaperQuestion;
