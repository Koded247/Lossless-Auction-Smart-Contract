import { ethers } from "hardhat";

async function main() {
  // i will put deployed contract
  const AUCTION_ADDRESS = ""; //my contract address

  // contract instance
  const Auction = await ethers.getContractFactory("Auction");
  const auction = await Auction.attach(AUCTION_ADDRESS);

  const bidAmount = ethers.utils.parseEther("1.0");
  await auction.bid({ value: bidAmount });

  console.log("Bid placed successfully");



  const status = await auction.getAuctionStatus();
  console.log("Auction Status:", status);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});