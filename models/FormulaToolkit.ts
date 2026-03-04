import mongoose, { Schema, model, models } from "mongoose";

/**
 * Seven-level content hierarchy for formula toolkits (same as level-wise practice):
 * 1=Exam, 2=Subject, 3=Unit, 4=Chapter, 5=Topic, 6=Subtopic, 7=Definition
 */
export type FormulaToolkitLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const FORMULA_TOOLKIT_LEVEL_NAMES: Record<FormulaToolkitLevel, string> = {
  1: "Exam",
  2: "Subject",
  3: "Unit",
  4: "Chapter",
  5: "Topic",
  6: "Subtopic",
  7: "Definition",
};

export interface IFormulaToolkit {
  _id: mongoose.Types.ObjectId;
  examId: mongoose.Types.ObjectId;
  level: FormulaToolkitLevel;
  subjectId?: mongoose.Types.ObjectId;
  unitId?: mongoose.Types.ObjectId;
  chapterId?: mongoose.Types.ObjectId;
  topicId?: mongoose.Types.ObjectId;
  subtopicId?: mongoose.Types.ObjectId;
  definitionId?: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description?: string;
  /** URL to PDF or resource */
  fileUrl?: string;
  pages?: number;
  size?: string;
  subjectLabel?: string;
  orderNumber: number;
  status: "Active" | "Inactive";
  createdAt?: Date;
  updatedAt?: Date;
}

const formulaToolkitSchema = new Schema<IFormulaToolkit>(
  {
    examId: { type: Schema.Types.ObjectId, required: true, ref: "Exam" },
    level: { type: Number, required: true, min: 1, max: 7, default: 1 },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", default: null },
    unitId: { type: Schema.Types.ObjectId, ref: "Unit", default: null },
    chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", default: null },
    topicId: { type: Schema.Types.ObjectId, ref: "Topic", default: null },
    subtopicId: { type: Schema.Types.ObjectId, ref: "Subtopic", default: null },
    definitionId: { type: Schema.Types.ObjectId, ref: "Definition", default: null },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String, default: "" },
    fileUrl: { type: String, default: "" },
    pages: { type: Number, default: 0 },
    size: { type: String, default: "" },
    subjectLabel: { type: String, default: "" },
    orderNumber: { type: Number, default: 1 },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

formulaToolkitSchema.index({ examId: 1, slug: 1 }, { unique: true });
formulaToolkitSchema.index({ examId: 1, orderNumber: 1 });
formulaToolkitSchema.index({ examId: 1 });
formulaToolkitSchema.index({ level: 1 });
formulaToolkitSchema.index({ status: 1 });

const FormulaToolkit =
  models.FormulaToolkit ?? model<IFormulaToolkit>("FormulaToolkit", formulaToolkitSchema);
export default FormulaToolkit;
