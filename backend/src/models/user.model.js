import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 160,
      default: "",
    },
    avatarUrl: {
      type: String,
      trim: true,
      default: "",
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

// Gera username automático antes de salvar se não tiver
userSchema.pre("save", async function (next) {
  if (!this.username) {
    const base = this.name.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "")
    let candidate = base
    let i = 1
    while (await User.exists({ username: candidate })) {
      candidate = `${base}${i++}`
    }
    this.username = candidate
  }
  next()
})

const User = mongoose.model("User", userSchema)

export default User