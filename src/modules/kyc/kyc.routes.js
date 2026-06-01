const express = require("express");
const multer = require("multer");

const kycController = require("./kyc.controller");
const authMiddleware = require("../../middlewares/auth.middleware");

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

router.post(
  "/pan",
  upload.single("panCardImage"),
  kycController.savePan
);

router.post(
  "/aadhaar",
  upload.fields([
    { name: "aadhaarFrontImage", maxCount: 1 },
    { name: "aadhaarBackImage", maxCount: 1 },
  ]),
  kycController.saveAadhaar
);

router.post(
  "/bank",
  upload.single("cancelledChequeImage"),
  kycController.saveBank
);

router.post(
  "/selfie",
    upload.single("selfieImage"),
  kycController.saveSelfie
);

router.post(
  "/signature",
  upload.single("signatureImage"),
  kycController.saveSignature
);

router.post("/submit", kycController.submitForReview);

router.get("/me", kycController.getMyKycStatus);

module.exports = router;