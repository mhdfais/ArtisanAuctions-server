import { IBid, IPopulatedBid } from "../IBid";

export interface IBidRepository {
  getBidsByArtwork(artworkId: string): Promise<IBid[]| null>;
  getBidsByBidderId(bidderId:string):Promise<IPopulatedBid[]|null>
}
