import { IArtwork } from "../interfaces/IArtwork";
import { IBid, IPopulatedBid } from "../interfaces/IBid";
import { IBidRepository } from "../interfaces/repositoryInterfaces/IBidRepository";
import Bid from "../models/Bid";

export class BidRepository implements IBidRepository {
  async getBidsByArtwork(artworkId: string): Promise<IBid[] | null> {
    return await Bid.find({ artworkId }).sort({ placedAt: -1 });
  }

  async getBidsByBidderId(bidderId: string): Promise<IPopulatedBid[] | null> {
     const bids = await Bid.find({ bidderId })
    .populate<{ artworkId: IArtwork }>({
      path: "artworkId",
      model: "Artwork",
      select: "title auctionEndTime highestBid highestBidderId isEnded",
    })
    .sort({placedAt:-1})
    .lean() 
    .exec();

  if (!bids) return null;
  
  return bids as unknown as IPopulatedBid[];
  }
}
