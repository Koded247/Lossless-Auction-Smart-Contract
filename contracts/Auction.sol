// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Auction {
   
    address public immutable owner; 
    uint public immutable auctionEndTime; 
    address public highestBidder; 
    uint public highestBid;
    bool public auctionEnded; 
    bool public paused; 

    mapping(address => uint) public bids; 

  
event AuctionInitialized(address indexed owner, uint duration, uint endTime);
 event NewBid(address indexed bidder, uint amount);
 event Refund(address indexed bidder, uint refundAmount);
    event AuctionEnded(address indexed winner, uint winningBid);
event FundsWithdrawn(address indexed owner, uint amount);
    event AuctionPaused(bool paused);

modifier onlyBeforeEnd() {
        if (block.timestamp >= auctionEndTime) {
            revert("Auction has ended");
        }    _;
    }

    modifier onlyAfterEnd() {
        if (block.timestamp < auctionEndTime) {
            revert("Auction has not ended");
        }   _;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert("Only owner can call this function");
        }  _;
    }

    modifier whenNotPaused() {
        if (paused) {
            revert("Auction is paused");
        } _;  }
 constructor(uint _durationInSeconds) {
        if (_durationInSeconds <= 0) {
            revert("Duration must be greater than zero");
        }

      owner = msg.sender;
  auctionEndTime = block.timestamp + _durationInSeconds;

        emit AuctionInitialized(owner, _durationInSeconds, auctionEndTime);
    }

 
    function bid() public payable onlyBeforeEnd whenNotPaused {
        if (msg.value <= highestBid) {
            revert("Bid must be higher than current highest bid");
        }

        if (highestBidder != address(0)) {
            uint refundAmount = bids[highestBidder] + (msg.value * 10) / 100;
            (bool success, ) = payable(highestBidder).call{value: refundAmount}("");
            if (!success) {
                revert("Refund failed");
            }
            emit Refund(highestBidder, refundAmount);
        }

        highestBidder = msg.sender;
        highestBid = msg.value;
        bids[msg.sender] = msg.value;

        emit NewBid(msg.sender, msg.value);
    }

  
    function endAuction() public onlyAfterEnd {
        if (auctionEnded) {
            revert("Auction already ended");
        }
        auctionEnded = true;

        emit AuctionEnded(highestBidder, highestBid);
    }

    
    function withdraw() public onlyAfterEnd onlyOwner {
        if (!auctionEnded) {
            revert("Auction has not ended");
        }

        uint balance = address(this).balance;
        (bool success, ) = payable(owner).call{value: balance}("");
        if (!success) {
            revert("Withdrawal failed");
        }

        emit FundsWithdrawn(owner, balance);
    }

   
    function setPaused(bool _paused) public onlyOwner {
        paused = _paused;
        emit AuctionPaused(_paused);
    }

    function getAuctionStatus() public view returns (
        uint endTime,
        uint timeRemaining,
        bool isEnded,
        bool isPaused
    ) {
        endTime = auctionEndTime;
        timeRemaining = block.timestamp < auctionEndTime ? auctionEndTime - block.timestamp : 0;
        isEnded = auctionEnded;
        isPaused = paused;
    }
}