import { IBid, IPopulatedBid } from "../IBid";
import { IBidData } from "../IBidData";

export interface IBidRepository {
  getBidsByArtwork(artworkId: string): Promise<IBid[]| null>;
  getBidsByBidderId(bidderId:string):Promise<IPopulatedBid[]|null>
}
