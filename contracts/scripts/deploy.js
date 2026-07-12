import hre from "hardhat";

async function main() {
  console.log("Deploying TutorAgent...");
  const TutorAgent = await hre.ethers.getContractFactory("TutorAgent");
  const agent = await TutorAgent.deploy(true);
  await agent.waitForDeployment();
  const agentAddress = await agent.getAddress();
  console.log("TutorAgent deployed to:", agentAddress);

  console.log("Deploying SovereignAITutor...");
  const SovereignAITutor = await hre.ethers.getContractFactory("SovereignAITutor");
  const tutor = await SovereignAITutor.deploy(agentAddress);
  await tutor.waitForDeployment();
  const tutorAddress = await tutor.getAddress();
  console.log("SovereignAITutor deployed to:", tutorAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
