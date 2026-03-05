import mongoose, { Schema, model, models } from "mongoose";

export type MockSectionType = "MCQ" | "NVQ";

export interface IMockSection {
  _id: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  name: string;
  type: MockSectionType;
  orderNumber: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const mockSectionSchema = new Schema<IMockSection>(
  {
    subjectId: { type: Schema.Types.ObjectId, required: true, ref: "MockSubject" },
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, enum: ["MCQ", "NVQ"], default: "MCQ" },
    orderNumber: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

mockSectionSchema.index({ subjectId: 1, orderNumber: 1 });

const MockSection =
  models.MockSection ?? model<IMockSection>("MockSection", mockSectionSchema);
export default MockSection;
