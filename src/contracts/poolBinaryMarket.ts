import type { Abi } from 'viem';
import poolAbi from './poolBinaryMarket.abi.json';
import { isPoolMarketConfigured, poolMarketAddress, usdcAddress } from '../config/env';

export const poolBinaryMarketAbi = poolAbi as Abi;
export { isPoolMarketConfigured, poolMarketAddress, usdcAddress };
