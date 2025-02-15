import { ethers } from "hardhat";

async function main() {

  const DURATION_IN_SECONDS = 60 * 60 * 24;


  const Auction = await ethers.getContractFactory("Auction");
  const auction = await Auction.deploy(DURATION_IN_SECONDS);

  await auction.deployed();

  console.log("Auction contract deployed to:", auction.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});