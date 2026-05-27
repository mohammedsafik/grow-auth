const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      default: null,
    },

    name: {
      type: String,
      trim: true,
    },

    profileImage: {
      type: String,
      default: null,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      default: null,
    },

    phoneVerified: {
      type: Boolean,
      default: false,
    },

    pinHash: {
      type: String,
      default: null,
    },

    passwordHash: {
      type: String,
      default: null,
    },

    authProvider: {
      type: String,
      enum: ["GOOGLE", "EMAIL"],
      default: "GOOGLE",
    },

    status: {
      type: String,
      enum: [
        "PHONE_REQUIRED",
        "PHONE_OTP_PENDING",
        "PIN_REQUIRED",
        "PIN_OTP_PENDING",
        "PASSWORD_REQUIRED",
        "ACTIVE",
        "BLOCKED",
      ],
      default: "PHONE_REQUIRED",
    },

    kycStatus: {
      type: String,
      enum: [
        "NOT_SUBMITTED",
        "IN_PROGRESS",
        "PENDING",
        "APPROVED",
        "REJECTED",
      ],
      default: "NOT_SUBMITTED",
    },

    kycId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "KYC",
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);