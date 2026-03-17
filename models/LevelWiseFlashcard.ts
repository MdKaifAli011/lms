import mongoose, { Schema, model, models } from "mongoose";

/**
 * Seven-level content hierarchy for level-wise flashcards (same as level-wise practice):
 * 1=Exam, 2=Subject, 3=Unit, 4=Chapter, 5=Topic, 6=Subtopic, 7=Definition
 */
export type ContentLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const CONTENT_LEVEL_NAMES: Record<ContentLevel, string> = {
  1: "Exam",
  2: "Subject",
  3: "Unit",
  4: "Chapter",
  5: "Topic",
  6: "Subtopic",
  7: "Definition",
};

export interface ILevelWiseFlashcard {
  _id: mongoose.Types.ObjectId;
  examId: mongoose.Types.ObjectId;
  level: ContentLevel;
  subjectId?: mongoose.Types.ObjectId;
  unitId?: mongoose.Types.ObjectId;
  chapterId?: mongoose.Types.ObjectId;
  topicId?: mongoose.Types.ObjectId;
  subtopicId?: mongoose.Types.ObjectId;
  definitionId?: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description?: string;
  orderNumber: number;
  status: "Active" | "Inactive";
  locked?: boolean;
  /** SEO for the public flashcard deck page */
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImageUrl?: string;
    canonicalUrl?: string;
    noIndex?: boolean;
    noFollow?: boolean;
  };
  /** Visit counts (public deck page views). Blocked IPs do not increment. */
  visits?: number;
  today?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const levelWiseFlashcardSchema = new Schema<ILevelWiseFlashcard>(
  {
    examId: { type: Schema.Types.ObjectId, required: true, ref: "Exam" },
    level: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
      default: 1,
    },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject" },
    unitId: { type: Schema.Types.ObjectId, ref: "Unit" },
    chapterId: { type: Schema.Types.ObjectId, ref: "Chapter" },
    topicId: { type: Schema.Types.ObjectId, ref: "Topic" },
    subtopicId: { type: Schema.Types.ObjectId, ref: "Subtopic" },
    definitionId: { type: Schema.Types.ObjectId, ref: "Definition" },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String, default: "" },
    orderNumber: { type: Number, default: 1 },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    locked: { type: Boolean, default: false },
    seo: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
    visits: { type: Number, default: 0 },
    today: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

levelWiseFlashcardSchema.index({ examId: 1, slug: 1 }, { unique: true });
levelWiseFlashcardSchema.index({ examId: 1, orderNumber: 1 });
levelWiseFlashcardSchema.index({ examId: 1, level: 1, orderNumber: 1 });

levelWiseFlashcardSchema.pre("save", async function () {
  const level = this.level as number;
  const doc = this as unknown as Record<string, unknown>;
  if (level < 2) {
    delete doc.subjectId;
    delete doc.unitId;
    delete doc.chapterId;
    delete doc.topicId;
    delete doc.subtopicId;
    delete doc.definitionId;
  } else if (level < 3) {
    delete doc.unitId;
    delete doc.chapterId;
    delete doc.topicId;
    delete doc.subtopicId;
    delete doc.definitionId;
  } else if (level < 4) {
    delete doc.chapterId;
    delete doc.topicId;
    delete doc.subtopicId;
    delete doc.definitionId;
  } else if (level < 5) {
    delete doc.topicId;
    delete doc.subtopicId;
    delete doc.definitionId;
  } else if (level < 6) {
    delete doc.subtopicId;
    delete doc.definitionId;
  } else if (level < 7) {
    delete doc.definitionId;
  }
});

const LevelWiseFlashcard =
  models.LevelWiseFlashcard ?? model<ILevelWiseFlashcard>("LevelWiseFlashcard", levelWiseFlashcardSchema);
export default LevelWiseFlashcard;
