export type FeatureFlags = {
  showPredictions: boolean;
};

function parseBooleanEnv(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
}

export const featureFlags: FeatureFlags = {
  showPredictions: parseBooleanEnv(process.env.REACT_APP_SHOW_PREDICTIONS, false)
}; 
