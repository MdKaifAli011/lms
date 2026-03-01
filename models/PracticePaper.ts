import mongoose, { Schema, model, models } from "mongoose";

/** Practice paper type: topic practice, full-length mock, or previous year paper */
export type PracticePaperType = "practice" | "full_length" | "previous_paper";

/**
 * Seven-level content hierarchy (not mastery path):
 * 1=Exam, 2=Subject, 3=Unit, 4=Chapter, 5=Topic, 6=Subtopic, 7=Definition
 */
export type ContentLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface IPracticePaper {
  _id: mongoose.Types.ObjectId;
  /** Exam this paper belongs to */
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
  type: PracticePaperType;
  title: string;
  slug: string;
  description?: string;
  durationMinutes: number;
  totalMarks: number;
  totalQuestions: number;
  difficulty?: "Easy" | "Medium" | "Hard" | "Mixed";
  /** For previous_paper: year e.g. 2023 */
  year?: number;
  /** Display order within same exam/type */
  orderNumber: number;
  status: "Active" | "Inactive";
  /** If true, show as "Unlocks later" / locked */
  locked?: boolean;
  /** Optional image URL for card */
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const practicePaperSchema = new Schema<IPracticePaper>(
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
    type: {
      type: String,
      required: true,
      enum: ["practice", "full_length", "previous_paper"],
      default: "practice",
    },
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
    year: { type: Number, default: null },
    orderNumber: { type: Number, default: 1 },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    locked: { type: Boolean, default: false },
    image: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

practicePaperSchema.index({ examId: 1, slug: 1 }, { unique: true });
practicePaperSchema.index({ examId: 1, type: 1, orderNumber: 1 });
practicePaperSchema.index({ examId: 1 });
practicePaperSchema.index({ type: 1 });
practicePaperSchema.index({ level: 1 });

const PracticePaper =
  models.PracticePaper ?? model<IPracticePaper>("PracticePaper", practicePaperSchema);
export default PracticePaper;
