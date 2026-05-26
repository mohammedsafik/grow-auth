const Otp = require("../models/otp");
const generateOtp = require("../utlis/generateOtp");
const { hashValue, compareHash } = require("../utlis/hash");
const { sendMail } = require("./mail.service");
const ApiError = require("../utlis/ApiError");

const OTP_EXPIRY_MINUTES = 5;

const createAndSendOtp = async ({ userId, email, purpose }) => {
  await Otp.updateMany(
    {
      userId,
      purpose,
      isUsed: false,
    },
    {
      isUsed: true,
    }
  );

  const otp = generateOtp();
  const otpHash = await hashValue(otp);

  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await Otp.create({
    userId,
    email,
    otpHash,
    purpose,
    expiresAt,
  });

  await sendMail({
    to: email,
    subject: "Your OTP Verification Code",
    text: `Your OTP is ${otp}. It will expire in ${OTP_EXPIRY_MINUTES} minutes.`,
    html: `<h2>Your OTP is ${otp}</h2><p>It will expire in ${OTP_EXPIRY_MINUTES} minutes.</p>`,
  });

  return true;
};

const verifyOtp = async ({ userId, otp, purpose }) => {
  const otpRecord = await Otp.findOne({
    userId,
    purpose,
    isUsed: false,
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    throw new ApiError(400, "OTP not found or already used");
  }

  if (otpRecord.expiresAt < new Date()) {
    throw new ApiError(400, "OTP expired");
  }

  if (otpRecord.attempts >= otpRecord.maxAttempts) {
    throw new ApiError(429, "Maximum OTP attempts exceeded");
  }

  const isValid = await compareHash(otp, otpRecord.otpHash);

  if (!isValid) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw new ApiError(400, "Invalid OTP");
  }

  otpRecord.isUsed = true;
  await otpRecord.save();

  return true;
};

module.exports = {
  createAndSendOtp,
  verifyOtp,
};