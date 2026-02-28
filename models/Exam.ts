import mongoose, { Schema, model, models } from "mongoose"

export interface IExam {
  _id: mongoose.Types.ObjectId
  name: string
  slug: string
  status: "Active" | "Inactive"
  image?: string
  items?: number
  content?: string
  meta?: string
  visits?: number
  uniqueVisits?: number
  today?: number
  descriptions?: string[]
  orderNumber?: number
  lastModified?: string
  /** Rich text / HTML content from editor */
  contentBody?: string
  /** SEO fields for this exam page */
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

const examSchema = new Schema<IExam>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    status: { type: String, required: true, enum: ["Active", "Inactive"], default: "Active" },
    image: { type: String, default: "No Image" },
    items: { type: Number, default: 0 },
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

examSchema.index({ slug: 1 })
examSchema.index({ orderNumber: 1 })

const Exam = models.Exam ?? model<IExam>("Exam", examSchema)
export default Exam
