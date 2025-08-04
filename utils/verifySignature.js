import { Account } from "starknet";
import { getProvider } from "./provider.js";

export const verifySignature = async (account, message, signature) => {
  const provider = getProvider();

  const myAccount = new Account(provider, account, "0x0123");

  try {
    const resp = await myAccount.verifyMessage(message, signature);

    return resp;
  } catch (ex) {
    console.log(ex);
    return false;
  }
};
