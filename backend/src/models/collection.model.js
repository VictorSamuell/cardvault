import mongoose from "mongoose"

const collectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cards: [
      {
        id: { type: String, required: true },
        quantity: { type: Number, default: 1, min: 1, max: 9999 },
        condition: { type: String, default: 'Não informado' },
        language: { type: String, default: 'Não informado' },
        purchasePrice: { type: Number, default: null, min: 0 },
        status: { type: String, enum: ['owned', 'wishlist'], default: 'owned' },
        notes: { type: String, default: '', maxlength: 500 },
        name: { type: String, required: true },
        image: { type: String, default: null },
        price: { type: Number, default: 0 },
        prices: { type: Object, default: {} },
        set: { type: String, default: null },
        number: { type: String, default: null },
        rarity: { type: String, default: null },
        tcgplayerUrl: { type: String, default: null },
        updatedAt: { type: String, default: null },
      },
    ],
  },
  { timestamps: true }
)

const Collection = mongoose.model("Collection", collectionSchema)

export default Collection
