import mongoose, { Schema, model, models } from "mongoose";

export type FullLengthMockQuestionType = "MCQ" | "NVQ";

export interface IFullLengthMockQuestion {
  _id: mongoose.Types.ObjectId;
  mockId: mongoose.Types.ObjectId;
  /** Subject name for this question (e.g. Physics, Chemistry, Mathematics) – used for Section A/B grouping on user side */
  subject?: string;
  questionText: string;
  type: FullLengthMockQuestionType;
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

const fullLengthMockQuestionSchema = new Schema<IFullLengthMockQuestion>(
  {
    mockId: { type: Schema.Types.ObjectId, required: true, ref: "FullLengthMock" },
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

fullLengthMockQuestionSchema.index({ mockId: 1, orderNumber: 1 });

const FullLengthMockQuestion =
  models.FullLengthMockQuestion ??
  model<IFullLengthMockQuestion>("FullLengthMockQuestion", fullLengthMockQuestionSchema);
export default FullLengthMockQuestion;
