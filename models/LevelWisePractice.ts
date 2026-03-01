import mongoose, { Schema, model, models } from "mongoose";

/**
 * Seven-level content hierarchy for level-wise practice:
 * 1=Exam, 2=Subject, 3=Unit, 4=Chapter, 5=Topic, 6=Subtopic, 7=Definition
 */
export type ContentLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** Human-readable level names for API messages and UI */
export const CONTENT_LEVEL_NAMES: Record<ContentLevel, string> = {
  1: "Exam",
  2: "Subject",
  3: "Unit",
  4: "Chapter",
  5: "Topic",
  6: "Subtopic",
  7: "Definition",
};

export interface ILevelWisePractice {
  _id: mongoose.Types.ObjectId;
  /** Exam this practice belongs to */
  examId: mongoose.Types.ObjectId;
  /** Content hierarchy level: 1=Exam, 2=Subject, ..., 7=Definition */
  level: ContentLevel;
  /** Optional refs for level 2–7 (scope of the practice) */
  subjectId?: mongoose.Types.ObjectId;
  unitId?: mongoose.Types.ObjectId;
  chapterId?: mongoose.Types.ObjectId;
  topicId?: mongoose.Types.ObjectId;
  subtopicId?: mongoose.Types.ObjectId;
  definitionId?: mongoose.Types.ObjectId;
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
  /** If true, show as "Unlocks later" / locked */
  locked?: boolean;
  /** Optional image URL for card */
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const levelWisePracticeSchema = new Schema<ILevelWisePractice>(
  {
    examId: { type: Schema.Types.ObjectId, required: true, ref: "Exam" },
    level: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
      default: 1,
      comment: "1=Exam, 2=Subject, 3=Unit, 4=Chapter, 5=Topic, 6=Subtopic, 7=Definition",
    },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", default: null },
    unitId: { type: Schema.Types.ObjectId, ref: "Unit", default: null },
    chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", default: null },
    topicId: { type: Schema.Types.ObjectId, ref: "Topic", default: null },
    subtopicId: { type: Schema.Types.ObjectId, ref: "Subtopic", default: null },
    definitionId: { type: Schema.Types.ObjectId, ref: "Definition", default: null },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String, default: "" },
    durationMinutes: { type: Number, required: true, default: 60 },
    totalMarks: { type: Number, required: true, default: 100 },
    totalQuestions: { type: Number, required: true, default: 30 },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard", "Mixed"],
      default: "Medium",
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

levelWisePracticeSchema.index({ examId: 1, slug: 1 }, { unique: true });
levelWisePracticeSchema.index({ examId: 1, orderNumber: 1 });
levelWisePracticeSchema.index({ examId: 1 });
levelWisePracticeSchema.index({ level: 1 });
levelWisePracticeSchema.index({ level: 1, orderNumber: 1 });
levelWisePracticeSchema.index({ examId: 1, level: 1, orderNumber: 1 });

const LevelWisePractice =
  models.LevelWisePractice ?? model<ILevelWisePractice>("LevelWisePractice", levelWisePracticeSchema);
export default LevelWisePractice;
