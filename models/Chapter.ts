import mongoose, { Schema, model, models } from "mongoose"

export interface IChapter {
  _id: mongoose.Types.ObjectId
  unitId: mongoose.Types.ObjectId
  name: string
  slug: string
  status: "Active" | "Inactive"
  image?: string
  content?: string
  meta?: string
  visits?: number
  uniqueVisits?: number
  today?: number
  descriptions?: string[]
  orderNumber?: number
  lastModified?: string
  contentBody?: string
  seo?: {
    metaTitle?: string
    metaDescription?: string
    metaKeywords?: string
    ogTitle?: string
    ogDescription?: string
    ogImageUrl?: string
    canonicalUrl?: string
    noIndex?: boolean
    noFollow?: boolean
  }
  createdAt?: Date
  updatedAt?: Date
}

const chapterSchema = new Schema<IChapter>(
  {
    unitId: { type: Schema.Types.ObjectId, required: true, ref: "Unit" },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    status: { type: String, required: true, enum: ["Active", "Inactive"], default: "Active" },
    image: { type: String, default: "No Image" },
    content: { type: String, default: "-" },
    meta: { type: String, default: "-" },
    visits: { type: Number, default: 0 },
    uniqueVisits: { type: Number, default: 0 },
    today: { type: Number, default: 0 },
    descriptions: [{ type: String }],
    orderNumber: { type: Number, default: 1 },
    lastModified: { type: String },
    contentBody: { type: String },
    seo: {
      type: Schema.Types.Mixed,
      default: () => ({}),
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

chapterSchema.index({ unitId: 1, slug: 1 }, { unique: true })
chapterSchema.index({ unitId: 1, orderNumber: 1 })

const Chapter = models.Chapter ?? model<IChapter>("Chapter", chapterSchema)
export default Chapter
