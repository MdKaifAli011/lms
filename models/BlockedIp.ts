import mongoose, { Schema, model, models } from "mongoose"

export interface IBlockedIp {
  _id: mongoose.Types.ObjectId
  /** IPv4 or IPv6 address to block from visit counts */
  ip: string
  /** Optional reason (e.g. "bot", "internal testing") */
  reason?: string
  createdAt?: Date
}

const blockedIpSchema = new Schema<IBlockedIp>(
  {
    ip: { type: String, required: true, trim: true },
    reason: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
)

blockedIpSchema.index({ ip: 1 }, { unique: true })

const BlockedIp = models.BlockedIp ?? model<IBlockedIp>("BlockedIp", blockedIpSchema)
export default BlockedIp
