const KYC = require("../models/kyc.model");
const User = require("../models/user.model");

const makeImageObject = (file) => {
  if (!file) return null;

  return {
    data: file.buffer,
    contentType: file.mimetype,
    originalName: file.originalname,
  };
};

const getOrCreateKyc = async (userId) => {
  let kyc = await KYC.findOne({ userId });

  if (!kyc) {
    kyc = await KYC.create({ userId });
  }

  return kyc;
};

const ensureKycEditable = (kyc) => {
  if (kyc.status === "APPROVED") {
    throw new Error("KYC already approved");
  }

  if (kyc.status === "PENDING") {
    throw new Error("KYC already submitted and pending approval");
  }
};

const markUserKycInProgress = async (userId, kycId) => {
  await User.findByIdAndUpdate(userId, {
    kycStatus: "IN_PROGRESS",
    kycId,
  });
};

const savePan = async (userId, body, file) => {
  if (!body.panNumber) {
    throw new Error("PAN number is required");
  }

  if (!file) {
    throw new Error("PAN card image is required");
  }

  const kyc = await getOrCreateKyc(userId);
  ensureKycEditable(kyc);

  kyc.panNumber = body.panNumber;
  kyc.panCardImage = makeImageObject(file);
  kyc.panStatus = "SUBMITTED";
  kyc.status = "DRAFT";
  kyc.rejectionReason = null;
  kyc.reviewedAt = null;

  await kyc.save();
  await markUserKycInProgress(userId, kyc._id);

  return kyc;
};

const saveAadhaar = async (userId, body, files) => {
  if (!body.aadhaarNumber) {
    throw new Error("Aadhaar number is required");
  }

  if (!files?.aadhaarFrontImage?.[0]) {
    throw new Error("Aadhaar front image is required");
  }

  if (!files?.aadhaarBackImage?.[0]) {
    throw new Error("Aadhaar back image is required");
  }

  const kyc = await getOrCreateKyc(userId);
  ensureKycEditable(kyc);

  kyc.aadhaarNumber = body.aadhaarNumber;
  kyc.aadhaarFrontImage = makeImageObject(files.aadhaarFrontImage[0]);
  kyc.aadhaarBackImage = makeImageObject(files.aadhaarBackImage[0]);
  kyc.aadhaarStatus = "SUBMITTED";
  kyc.status = "DRAFT";
  kyc.rejectionReason = null;
  kyc.reviewedAt = null;

  await kyc.save();
  await markUserKycInProgress(userId, kyc._id);

  return kyc;
};

const saveBank = async (userId, body, file) => {
  const { bankName, accountNumber, ifscCode, accountHolderName } = body;

  if (!bankName || !accountNumber || !ifscCode || !accountHolderName) {
    throw new Error("All bank details are required");
  }

  if (!file) {
    throw new Error("Cancelled cheque image is required");
  }

  const kyc = await getOrCreateKyc(userId);
  ensureKycEditable(kyc);

  kyc.bankName = bankName;
  kyc.accountNumber = accountNumber;
  kyc.ifscCode = ifscCode;
  kyc.accountHolderName = accountHolderName;
  kyc.cancelledChequeImage = makeImageObject(file);
  kyc.bankStatus = "SUBMITTED";
  kyc.status = "DRAFT";
  kyc.rejectionReason = null;
  kyc.reviewedAt = null;

  await kyc.save();
  await markUserKycInProgress(userId, kyc._id);

  return kyc;
};

const saveSelfie = async (userId, file) => {
  if (!file) {
    throw new Error("Selfie image is required");
  }

  const kyc = await getOrCreateKyc(userId);
  ensureKycEditable(kyc);

  kyc.selfieImage = makeImageObject(file);
  kyc.selfieStatus = "SUBMITTED";
  kyc.status = "DRAFT";
  kyc.rejectionReason = null;
  kyc.reviewedAt = null;

  await kyc.save();
  await markUserKycInProgress(userId, kyc._id);

  return kyc;
};

const saveSignature = async (userId, file) => {
  if (!file) {
    throw new Error("Signature image is required");
  }

  const kyc = await getOrCreateKyc(userId);
  ensureKycEditable(kyc);

  kyc.signatureImage = makeImageObject(file);
  kyc.signatureStatus = "SUBMITTED";
  kyc.status = "DRAFT";
  kyc.rejectionReason = null;
  kyc.reviewedAt = null;

  await kyc.save();
  await markUserKycInProgress(userId, kyc._id);

  return kyc;
};

const submitForReview = async (userId) => {
  const kyc = await KYC.findOne({ userId });

  if (!kyc) {
    throw new Error("KYC details not found");
  }

  ensureKycEditable(kyc);

  const requiredStatuses = [
    kyc.panStatus,
    kyc.aadhaarStatus,
    kyc.bankStatus,
    kyc.selfieStatus,
    kyc.signatureStatus,
  ];

  const isCompleted = requiredStatuses.every((status) => status === "SUBMITTED");

  if (!isCompleted) {
    throw new Error("Please complete all KYC steps before submitting");
  }

  kyc.status = "PENDING";
  kyc.submittedAt = new Date();
  kyc.rejectionReason = null;
  kyc.reviewedAt = null;

  await kyc.save();

  await User.findByIdAndUpdate(userId, {
    kycStatus: "PENDING",
    kycId: kyc._id,
  });

  return kyc;
};

const getMyKycStatus = async (userId) => {
  const kyc = await KYC.findOne({ userId }).select(
    "-panCardImage.data -aadhaarFrontImage.data -aadhaarBackImage.data -cancelledChequeImage.data -selfieImage.data -signatureImage.data"
  );

  return kyc;
};

module.exports = {
  savePan,
  saveAadhaar,
  saveBank,
  saveSelfie,
  saveSignature,
  submitForReview,
  getMyKycStatus,
};