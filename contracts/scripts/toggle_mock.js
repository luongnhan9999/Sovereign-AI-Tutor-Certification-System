import { ethers } from "ethers";
import fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const rpc = process.env.RITUAL_RPC || "https://rpc.ritualfoundation.org";
  const privateKey = process.env.PRIVATE_KEY;
  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(privateKey, provider);

  const agentAddress = "0x1fdC33140418aC0F6E11019FC615fCDE74e407F4";
  const abi = ["function setMockMode(bool) external"];
  const contract = new ethers.Contract(agentAddress, abi, wallet);

  console.log("Toggling Mock Mode to true...");
  const tx = await contract.setMockMode(true);
  await tx.wait();
  console.log("Mock mode enabled!");
}

main().catch(console.error);
