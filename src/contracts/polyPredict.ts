import type { Abi } from 'viem';
import polyPredictArtifactAbi from './polyPredict.abi.json';
import {
  isPolyPredictConfigured,
  polyPredictAddress,
  usdcAddress,
} from '../config/env';

export const polyPredictAbi = polyPredictArtifactAbi as Abi;
export { isPolyPredictConfigured, polyPredictAddress, usdcAddress };
