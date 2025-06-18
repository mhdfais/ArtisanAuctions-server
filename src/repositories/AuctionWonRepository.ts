import HttpStatusCode from "../enums/httpStatusCodes";
import { CustomError } from "../errors/customError";
import { IArtwork } from "../interfaces/IArtwork";
import { IAuctionWon, IPopulatedAuctionWon } from "../interfaces/IAuctionWon";
import { IAuctionWonRepository } from "../interfaces/repositoryInterfaces/IAuctionWonRepository";
import AuctionWon from "../models/AuctionWon";

export class AuctionWonRepository implements IAuctionWonRepository {
  async findAuctionsWonByWinnerId(
    winnerId: string
  ): Promise<IPopulatedAuctionWon[] | null> {
    const wonAuctions = await AuctionWon.find({ winnerId })
      .populate<{ artworkId: IArtwork }>({
        path: "artworkId",
        model: "Artwork",
        select: "title auctionEndTime images",
      })
      .sort({ createdAt: -1 });

    if (!wonAuctions) return null;
    // console.log(wonAuctions)
    return wonAuctions as unknown as IPopulatedAuctionWon[];
  }

  async updateAddress(wonAuctionId: string, address: object): Promise<void> {
    await AuctionWon.findByIdAndUpdate(
      wonAuctionId,
      { address },
      { upsert: true }
    );
  }

  async findBySellerId(
    sellerId: string
  ): Promise<IPopulatedAuctionWon[] | null> {
    const wonAuctions = await AuctionWon.find({ sellerId })
      .populate<{ artworkId: IArtwork }>({
        path: "artworkId",
        model: "Artwork",
        select:
          "title auctionEndTime images yearCreated dimensions medium description reservePrice highestBid auctionStartTime createdAt category",
      })
      .sort({ createdAt: -1 });

    if (!wonAuctions) return null;
    // console.log(wonAuctions)
    return wonAuctions as unknown as IPopulatedAuctionWon[];
  }

  async updateStatusByArtworkId(id: string, status: string):Promise<void> {
    const wonAuction = await AuctionWon.findOne({ artworkId: id });
    if (!wonAuction)
      throw new CustomError("not found", HttpStatusCode.NOT_FOUND);

    wonAuction.status = status;
    await wonAuction.save();
  }
}
