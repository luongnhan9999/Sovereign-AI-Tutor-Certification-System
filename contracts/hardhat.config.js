
import * as dotenv from "dotenv";

dotenv.config();

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: "0.8.28",
  paths: {
    sources: "./src",
    tests: "./test_hardhat",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
