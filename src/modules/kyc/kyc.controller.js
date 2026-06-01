const asyncHandler = require("../../middlewares/asynchandler");
const ApiResponse = require("../../utlis/ApiResponse");
const kycService = require("./kyc.service");


const savePan = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const kyc = await kycService.savePan(userId, req.body, req.file);

  return res
    .status(200)
    .json(new ApiResponse(200, kyc, "PAN details saved successfully"));
});

const saveAadhaar = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const kyc = await kycService.saveAadhaar(userId, req.body, req.files);
  return res
    .status(200)
    .json(new ApiResponse(200, kyc, "Aadhaar details saved successfully"));
});

const saveBank = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const kyc = await kycService.saveBank(userId, req.body, req.file);
  return res
    .status(200)
    .json(new ApiResponse(200, kyc, "Bank details saved successfully"));
});

const saveSelfie = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const kyc = await kycService.saveSelfie(userId, req.file);
  return res
    .status(200)
    .json(new ApiResponse(200, kyc, "Selfie saved successfully"));
});

const saveSignature = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const kyc = await kycService.saveSignature(userId, req.file);
  return res
    .status(200)
    .json(new ApiResponse(200, kyc, "Signature saved successfully"));
});

const submitForReview = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const kyc = await kycService.submitForReview(userId);
  return res
    .status(200)
    .json(new ApiResponse(200, kyc, "KYC submitted for review"));
});

const getMyKycStatus = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const kyc = await kyService.getMyKycStatus(userId);
  return res
    .status(200)
    .json(new ApiResponse(200, kyc, "KYC status fetched successfully"));
});

module.exports = {
  savePan,
  saveAadhaar,
  saveBank,
  saveSelfie,
  saveSignature,
  submitForReview,
  getMyKycStatus,
};