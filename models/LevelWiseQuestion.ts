import mongoose, { Schema, model, models } from "mongoose";

export type LevelWiseQuestionType = "MCQ" | "NVQ";

export interface ILevelWiseQuestion {
  _id: mongoose.Types.ObjectId;
  practiceId: mongoose.Types.ObjectId;
  questionText: string;
  type: LevelWiseQuestionType;
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

const levelWiseQuestionSchema = new Schema<ILevelWiseQuestion>(
  {
    practiceId: { type: Schema.Types.ObjectId, required: true, ref: "LevelWisePractice" },
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

levelWiseQuestionSchema.index({ practiceId: 1, orderNumber: 1 });

const LevelWiseQuestion =
  models.LevelWiseQuestion ?? model<ILevelWiseQuestion>("LevelWiseQuestion", levelWiseQuestionSchema);
export default LevelWiseQuestion;
