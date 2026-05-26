const ApiError = require("../utlis/ApiError");
const {
  verifyAccessToken,
  extractBearerToken,
} = require("../services/jwt.service");

const getAccessTokenCandidates = (req) => {
  return [
    extractBearerToken(req.headers.authorization),
    req.cookies?.accessToken,
  ].filter(Boolean);
};

const decodeAccessToken = (req) => {
  const tokenCandidates = getAccessTokenCandidates(req);

  for (const token of tokenCandidates) {
    try {
      return verifyAccessToken(token);
    } catch (error) {}
  }

  return null;
};

const optionalAuth = (req, res, next) => {
  req.user = decodeAccessToken(req);
  return next();
};

const requireAuth = (req, res, next) => {
  const tokenCandidates = getAccessTokenCandidates(req);

  if (!tokenCandidates.length) {
    throw new ApiError(401, "Access token is required");
  }

  const decoded = decodeAccessToken(req);

  if (!decoded) {
    throw new ApiError(401, "Invalid or expired access token");
  }

  req.user = decoded;
  return next();
};

module.exports = {
  optionalAuth,
  requireAuth,
};
