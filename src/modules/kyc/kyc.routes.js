const express = require("express");
const multer = require("multer");

const kycController = require("./kyc.controller");
const authMiddleware = require("../middlewares/auth.middleware");

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
  authMiddleware,
  upload.single("panCardImage"),
  kycController.savePan
);

router.post(
  "/aadhaar",
  authMiddleware,
  upload.fields([
    { name: "aadhaarFrontImage", maxCount: 1 },
    { name: "aadhaarBackImage", maxCount: 1 },
  ]),
  kycController.saveAadhaar
);

router.post(
  "/bank",
  authMiddleware,
  upload.single("cancelledChequeImage"),
  kycController.saveBank
);

router.post(
  "/selfie",
  authMiddleware,
  upload.single("selfieImage"),
  kycController.saveSelfie
);

router.post(
  "/signature",
  authMiddleware,
  upload.single("signatureImage"),
  kycController.saveSignature
);

router.post("/submit", authMiddleware, kycController.submitForReview);

router.get("/me", authMiddleware, kycController.getMyKycStatus);

module.exports = router;