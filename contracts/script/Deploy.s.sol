// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/SovereignAITutor.sol";
import "../src/TutorAgent.sol";

/**
 * @title Deploy
 * @dev Deploys TutorAgent and SovereignAITutor to Ritual Testnet.
 *      Reads PRIVATE_KEY from .env and RPC from env var RITUAL_RPC.
 */
contract Deploy is Script {
    // Addresses used for the deployment – will be printed for later use.
    address public tutorAgentAddress;
    address public sovereignAITutorAddress;

    function run() external {
        // Load private key from env var (must be set before running script)
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        string memory rpc = vm.envString("RITUAL_RPC");
        // Set RPC
        vm.createSelectFork(rpc);
        // Derive an address for the deployer
        address deployer = vm.addr(deployerKey);
        vm.startBroadcast(deployerKey);

        // Deploy TutorAgent with mock mode = true (for demo). Change to false for real precompiles.
        TutorAgent agent = new TutorAgent(true);
        tutorAgentAddress = address(agent);

        // Deploy main contract, linking the agent address
        SovereignAITutor tutor = new SovereignAITutor(tutorAgentAddress);
        sovereignAITutorAddress = address(tutor);

        vm.stopBroadcast();
        console.log("TutorAgent deployed to:", tutorAgentAddress);
        console.log("SovereignAITutor deployed to:", sovereignAITutorAddress);
    }
}
