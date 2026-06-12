import mockV3AggregatorArtifactAbi from './mockV3Aggregator.abi.json';
import type { Abi } from 'viem';
import { mockOracleAddress } from '../config/env';

export const mockV3AggregatorAbi = mockV3AggregatorArtifactAbi as Abi;
export { mockOracleAddress };
