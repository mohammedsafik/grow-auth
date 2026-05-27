const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    data: {
      type: Buffer,
      required: true,
    },
    contentType: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);

const kycSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // PAN STEP
    panNumber: {
      type: String,
      uppercase: true,
      trim: true,
      default: null,
    },
    panCardImage: {
      type: imageSchema,
      default: null,
    },
    panStatus: {
      type: String,
      enum: ["NOT_SUBMITTED", "SUBMITTED"],
      default: "NOT_SUBMITTED",
    },

    // AADHAAR STEP
    aadhaarNumber: {
      type: String,
      trim: true,
      default: null,
    },
    aadhaarFrontImage: {
      type: imageSchema,
      default: null,
    },
    aadhaarBackImage: {
      type: imageSchema,
      default: null,
    },
    aadhaarStatus: {
      type: String,
      enum: ["NOT_SUBMITTED", "SUBMITTED"],
      default: "NOT_SUBMITTED",
    },

    // BANK STEP
    bankName: {
      type: String,
      trim: true,
      default: null,
    },
    accountNumber: {
      type: String,
      trim: true,
      default: null,
    },
    ifscCode: {
      type: String,
      uppercase: true,
      trim: true,
      default: null,
    },
    accountHolderName: {
      type: String,
      trim: true,
      default: null,
    },
    cancelledChequeImage: {
      type: imageSchema,
      default: null,
    },
    bankStatus: {
      type: String,
      enum: ["NOT_SUBMITTED", "SUBMITTED"],
      default: "NOT_SUBMITTED",
    },

    // SELFIE STEP
    selfieImage: {
      type: imageSchema,
      default: null,
    },
    selfieStatus: {
      type: String,
      enum: ["NOT_SUBMITTED", "SUBMITTED"],
      default: "NOT_SUBMITTED",
    },

    // SIGNATURE STEP
    signatureImage: {
      type: imageSchema,
      default: null,
    },
    signatureStatus: {
      type: String,
      enum: ["NOT_SUBMITTED", "SUBMITTED"],
      default: "NOT_SUBMITTED",
    },

    status: {
      type: String,
      enum: ["DRAFT", "PENDING", "APPROVED", "REJECTED"],
      default: "DRAFT",
    },

    rejectionReason: {
      type: String,
      default: null,
    },

    submittedAt: {
      type: Date,
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("KYC", kycSchema);