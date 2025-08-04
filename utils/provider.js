import { RpcProvider, constants } from "starknet";

const sepoliaRpcs = [
  "https://starknet-sepolia.public.blastapi.io",
];

const mainnetRpcs = [
  "https://starknet-mainnet.public.blastapi.io",
];

export const getProvider = () => {
  return new RpcProvider({
    nodeUrl: sepoliaRpcs[Math.floor(Math.random() * sepoliaRpcs.length)],
  });
};
