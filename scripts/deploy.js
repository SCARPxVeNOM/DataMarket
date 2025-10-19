async function main() {
  const { ethers } = hre;
  const [deployer] = await ethers.getSigners();
  if (!deployer) throw new Error("No signer available. Check PRIVATE_KEY in hardhat.config.js env.");
  console.log("Deployer:", await deployer.getAddress());
  const DataMarket = await ethers.getContractFactory("DataMarket");
  const market = await DataMarket.connect(deployer).deploy();
  await market.waitForDeployment();
  console.log("DataMarket deployed:", await market.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


