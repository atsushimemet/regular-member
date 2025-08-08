const predictionsEnabled = process.env.PREDICTIONS_ENABLED === 'true';
const predictorUrl = process.env.PREDICTOR_URL || 'http://predictor:5000';

const rawAllowlist = (process.env.PREDICTIONS_COUPLE_ALLOWLIST || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)
  .map(s => s.toLowerCase());

const allowlistSet = new Set(rawAllowlist);

function isAllowlistEnabled() {
  return allowlistSet.size > 0;
}

function getAllowlistSize() {
  return allowlistSet.size;
}

function isCoupleAllowed(coupleId) {
  if (!isAllowlistEnabled()) return true;
  const id = (coupleId || '').toLowerCase();
  return allowlistSet.has(id);
}

module.exports = {
  predictionsEnabled,
  predictorUrl,
  isAllowlistEnabled,
  getAllowlistSize,
  isCoupleAllowed
}; 
