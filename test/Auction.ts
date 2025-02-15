import { expect } from "chai";
import { ethers, Contract, Signer } from "hardhat";

describe("Auction", function () {
    let auction: Contract;
    let owner: Signer;
    let bidder1: Signer;
    let bidder2: Signer;
    const auctionDuration = 3600; 

    beforeEach(async function () {
     
        [owner, bidder1, bidder2] = await ethers.getSigners();

     
        const Auction = await ethers.getContractFactory("Auction");
        auction = await Auction.deploy(auctionDuration);
    });

    describe("Deployment", function () {
        it("should deploy the contract successfully", async function () {
            const Auction = await ethers.getContractFactory("Auction");
            const auction = await Auction.deploy(auctionDuration);
            expect(auction.target).to.not.be.undefined;
        });

        it("should log the correct deployment address", async function () {
            const Auction = await ethers.getContractFactory("Auction");
            const auction = await Auction.deploy(auctionDuration);
            console.log("Deployed contract address:", auction.target);
            expect(auction.target).to.match(/^0x[a-fA-F0-9]{40}$/);
        });
    });

    describe("constructor", function () {
        it("should initialize auction with correct parameters", async function () {
            const ownerAddress = await owner.getAddress();
            const endTime = (await ethers.provider.getBlock("latest")).timestamp + auctionDuration;

            expect(await auction.owner()).to.equal(ownerAddress);
            expect(await auction.auctionEndTime()).to.equal(endTime);
            expect(await auction.auctionEnded()).to.be.false;
            expect(await auction.paused()).to.be.false;
        });

        

        it("should not allow zero duration", async function () {
            const Auction = await ethers.getContractFactory("Auction");
            await expect(Auction.deploy(0)).to.be.revertedWith("Duration must be greater than zero");
        });
    });

    describe("bid function", function () {
        it("should allow bidding and track highest bid", async function () {
            const bidAmount = ethers.parseEther("1");
            await auction.connect(bidder1).bid({ value: bidAmount });

            expect(await auction.highestBidder()).to.equal(await bidder1.getAddress());
            expect(await auction.highestBid()).to.equal(bidAmount);
        });

        it("should refund outbid bidder with 10% bonus", async function () {
            const bid1 = ethers.parseEther("1");
            const bid2 = ethers.parseEther("2");

       
            await auction.connect(bidder1).bid({ value: bid1 });

    
            const initialBalance = await ethers.provider.getBalance(await bidder1.getAddress());
            await auction.connect(bidder2).bid({ value: bid2 });

    
            const expectedRefund = bid1 + (bid2 * BigInt(10)) / BigInt(100);
            const finalBalance = await ethers.provider.getBalance(await bidder1.getAddress());

            expect(finalBalance).to.be.closeTo(
                initialBalance + expectedRefund,
                ethers.parseEther("0.01")
            );
        });

      

        it("should not allow zero bids", async function () {
            const bidAmount = ethers.parseEther("0");
            await expect(
                auction.connect(bidder1).bid({ value: bidAmount })
            ).to.be.revertedWith("Bid must be higher than current highest bid");
        });

        it("should not allow bid equal to current highest bid", async function () {
            const bidAmount = ethers.parseEther("1");
            await auction.connect(bidder1).bid({ value: bidAmount });

            await expect(
                auction.connect(bidder2).bid({ value: bidAmount })
            ).to.be.revertedWith("Bid must be higher than current highest bid");
        });

        

       

        it("should not allow bids when paused", async function () {
            await auction.connect(owner).setPaused(true);
            const bidAmount = ethers.parseEther("1");

            await expect(
                auction.connect(bidder1).bid({ value: bidAmount })
            ).to.be.revertedWith("Auction is paused");
        });
    });

    describe("endAuction function", function () {
        it("should end auction after duration", async function () {
    
            await ethers.provider.send("evm_increaseTime", [auctionDuration + 1]);
            await ethers.provider.send("evm_mine");

            await auction.endAuction();
            expect(await auction.auctionEnded()).to.be.true;
        });

        it("should not allow ending auction before duration", async function () {
            await expect(auction.endAuction()).to.be.revertedWith("Auction has not ended");
        });

        

        it("should end auction even with no bids", async function () {
         
            await ethers.provider.send("evm_increaseTime", [auctionDuration + 1]);
            await ethers.provider.send("evm_mine");

            await auction.endAuction();
            expect(await auction.auctionEnded()).to.be.true;
            expect(await auction.highestBidder()).to.equal(ethers.ZeroAddress);
            expect(await auction.highestBid()).to.equal(0);
        });
    });

    describe("withdraw function", function () {
        it("should allow owner to withdraw funds after auction ends", async function () {
            const bidAmount = ethers.parseEther("1");
            await auction.connect(bidder1).bid({ value: bidAmount });
            await ethers.provider.send("evm_increaseTime", [auctionDuration + 1]);
            await ethers.provider.send("evm_mine");

            await auction.endAuction();
            const initialBalance = await ethers.provider.getBalance(await owner.getAddress());
            await auction.withdraw();

            const finalBalance = await ethers.provider.getBalance(await owner.getAddress());
            expect(finalBalance).to.be.greaterThan(initialBalance);
        });

        it("should not allow non-owner to withdraw funds", async function () {
            const bidAmount = ethers.parseEther("1");
            await auction.connect(bidder1).bid({ value: bidAmount });

   
            await ethers.provider.send("evm_increaseTime", [auctionDuration + 1]);
            await ethers.provider.send("evm_mine");

            await auction.endAuction();
            await expect(
                auction.connect(bidder1).withdraw()
            ).to.be.revertedWith("Only owner can call this function");
        });
    });


    
});