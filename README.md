# Lossless Auction Smart Contract

## Overview
The **Lossless Auction** smart contract allows users to bid on an auction item with an innovative incentive:
- If a bidder is outbid by another user, they receive **a full refund** of their previous bid **plus 10%** of the new highest bid.
- The auction continues until the designated end time.
- At the end of the auction, the highest bidder wins the item, and the seller receives the winning bid amount.

## Features
✅ **Automatic Refunds** – Outbid users receive their bid back.
✅ **Incentive Bonus** – Outbid users also receive 10% of the new highest bid.
✅ **Time-based Auction** – Bidding continues until a set deadline.
✅ **Fair & Transparent** – Ensures all users are properly rewarded.
✅ **Secure & Gas Optimized** – Built with Solidity best practices.

## How It Works
1. **Start an Auction**: The contract owner initializes an auction with an item and a deadline.
2. **Place a Bid**: Users bid on the auction item.
3. **Outbidding Process**:
   - If a new highest bid is placed, the previous highest bidder is refunded their original bid **plus 10%** of the new highest bid.
4. **Auction Ends**:
   - The auction closes after the set deadline.
   - The highest bidder wins, and the seller receives the final bid amount.

## Usage
- Users call the `placeBid()` function to participate in the auction.
- The contract automatically handles refunds and bonus payments.
- The owner can call `endAuction()` after the auction deadline to finalize the results.

## Security Considerations
- **Reentrancy Protection**: Ensures safe fund transfers.
- **Access Control**: Only the auction creator can end the auction.
- **Gas Optimization**: Efficiently structured logic for minimal fees.

## License
This project is Unlicensed.

---
### Author
**Korede Abidoye** | [Your GitHub](https://github.com/koded247) | [Your Twitter](https://twitter.com/akoredeszn_)

**Email** | [ korexcoded@gmail.com ]

