import { ethers } from "hardhat";

async function main() {
  const DataMarket = await ethers.getContractFactory("DataMarket");
  const market = await DataMarket.deploy();
  await market.deployed();
  console.log("DataMarket deployed:", market.address);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


