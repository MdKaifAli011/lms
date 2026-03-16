import mongoose, { Schema, model, models } from "mongoose";

export interface ILevelWiseFlashcardCard {
  _id: mongoose.Types.ObjectId;
  deckId: mongoose.Types.ObjectId;
  front: string;
  back: string;
  orderNumber: number;
  updatedAt?: Date;
}

const levelWiseFlashcardCardSchema = new Schema<ILevelWiseFlashcardCard>(
  {
    deckId: { type: Schema.Types.ObjectId, required: true, ref: "LevelWiseFlashcard" },
    front: { type: String, required: true, trim: true },
    back: { type: String, required: true, trim: true },
    orderNumber: { type: Number, default: 1 },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

levelWiseFlashcardCardSchema.index({ deckId: 1, orderNumber: 1 });

const LevelWiseFlashcardCard =
  models.LevelWiseFlashcardCard ?? model<ILevelWiseFlashcardCard>("LevelWiseFlashcardCard", levelWiseFlashcardCardSchema);
export default LevelWiseFlashcardCard;
