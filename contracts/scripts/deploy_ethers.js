import { ethers } from "ethers";
import fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const rpc = process.env.RITUAL_RPC || "https://testnet.rpc.ritual.net";
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error("Missing PRIVATE_KEY in .env");

  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("Deployer address:", wallet.address);

  // Deploy TutorAgent
  const tutorAgentArtifact = JSON.parse(fs.readFileSync("./artifacts/src/TutorAgent.sol/TutorAgent.json", "utf8"));
  const TutorAgentFactory = new ethers.ContractFactory(tutorAgentArtifact.abi, tutorAgentArtifact.bytecode, wallet);
  console.log("Deploying TutorAgent...");
  const agent = await TutorAgentFactory.deploy(true);
  await agent.waitForDeployment();
  const agentAddress = await agent.getAddress();
  console.log("TutorAgent deployed to:", agentAddress);

  // Deploy SovereignAITutor
  const tutorArtifact = JSON.parse(fs.readFileSync("./artifacts/src/SovereignAITutor.sol/SovereignAITutor.json", "utf8"));
  const SovereignFactory = new ethers.ContractFactory(tutorArtifact.abi, tutorArtifact.bytecode, wallet);
  console.log("Deploying SovereignAITutor...");
  const tutor = await SovereignFactory.deploy(agentAddress);
  await tutor.waitForDeployment();
  const tutorAddress = await tutor.getAddress();
  console.log("SovereignAITutor deployed to:", tutorAddress);
}

main().catch(console.error);
