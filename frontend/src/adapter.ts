import { createSDKAdapter } from './sdk-adapter';
export { configurationMessage } from './sdk-adapter';
export const adapter=createSDKAdapter({contractAddress:import.meta.env.VITE_CONTRACT_ADDRESS});
