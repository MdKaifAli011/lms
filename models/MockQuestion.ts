import mongoose, { Schema, model, models } from "mongoose";

export type MockQuestionType = "MCQ" | "NVQ";

export interface IMockQuestion {
  _id: mongoose.Types.ObjectId;
  sectionId: mongoose.Types.ObjectId;
  questionText: string;
  type: MockQuestionType;
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
  createdAt?: Date;
  updatedAt?: Date;
}

const mockQuestionSchema = new Schema<IMockQuestion>(
  {
    sectionId: { type: Schema.Types.ObjectId, required: true, ref: "MockSection" },
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
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

mockQuestionSchema.index({ sectionId: 1, orderNumber: 1 });

const MockQuestion =
  models.MockQuestion ?? model<IMockQuestion>("MockQuestion", mockQuestionSchema);
export default MockQuestion;
