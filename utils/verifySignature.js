import { hash } from "starknet";
import { getProvider } from "./provider.js";

/**
 * Verifies a StarkNet signature using on-chain verification
 * 
 * This function uses StarkNet's on-chain verification method which:
 * - Verifies the message has not been modified
 * - Confirms the sender owns the private key corresponding to the account address
 * - Works with account abstraction and exotic signing methods
 * - Provides higher security than off-chain verification
 * 
 * @param {string} account - The StarkNet account address (0x...) of the signer
 * @param {string|string[]} message - The original message that was signed. Can be a string or array of strings
 * @param {string[]} signature - The signature array returned by the StarkNet wallet (usually [r, s])
 * 
 * @returns {Promise<boolean>} - Returns true if signature is valid, false otherwise
 * 
 * @example
 * // Basic usage
 * const isValid = await verifySignature(
 *   "0x1234567890abcdef...",  // Account address
 *   "Hello World",           // Message that was signed
 *   ["0x123...", "0x456..."] // Signature from wallet
 * );
 * 
 * @example
 * // With array message
 * const isValid = await verifySignature(
 *   "0x1234567890abcdef...",
 *   ["authentication_data", "timestamp"],
 *   ["0x123...", "0x456..."]
 * );
 */
export const verifySignature = async (account, message, signature) => {
  // Get the configured StarkNet provider (mainnet/testnet)
  const provider = getProvider();

  // Normalize account address to lowercase to ensure consistency
  const accountAddress = account.toLowerCase();

  // Compute the hash of the message using StarkNet's standard hashing
  // This creates a deterministic hash that matches what the wallet signed
  const msgHash = hash.computeHashOnElements(message);

  try {
    // Perform on-chain signature verification
    // This method queries the StarkNet network to verify the signature
    // against the account contract, supporting account abstraction
    const resp = await provider.verifyMessageInStarknet(msgHash, signature, accountAddress);

    return resp;
  } catch (ex) {
    // Log the error for debugging purposes
    console.log('Signature verification failed:', ex);

    // Return false for any verification failures
    // This includes network errors, invalid signatures, or account issues
    return false;
  }
};
