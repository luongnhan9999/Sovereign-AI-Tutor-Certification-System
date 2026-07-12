import { ethers } from "ethers";
import fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const rpc = process.env.RITUAL_RPC || "https://rpc.ritualfoundation.org";
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error("Missing PRIVATE_KEY in .env");

  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("Deploying to Ritual Testnet...");
  console.log("Deployer address:", wallet.address);

  // Deploy TutorAgent (mockMode = false since we are on Ritual)
  const tutorAgentArtifact = JSON.parse(fs.readFileSync("./artifacts/src/TutorAgent.sol/TutorAgent.json", "utf8"));
  const TutorAgentFactory = new ethers.ContractFactory(tutorAgentArtifact.abi, tutorAgentArtifact.bytecode, wallet);
  console.log("Deploying TutorAgent (Real Mode)...");
  const agent = await TutorAgentFactory.deploy(false);
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

  console.log("\n==================================");
  console.log("Save these addresses for the frontend:");
  console.log("NEXT_PUBLIC_AGENT_ADDRESS=" + agentAddress);
  console.log("NEXT_PUBLIC_TUTOR_ADDRESS=" + tutorAddress);
  console.log("==================================");
}

main().catch(console.error);
