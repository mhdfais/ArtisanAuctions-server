import { IBid } from "../IBid";

export interface IBidRepository {
  getBidsByArtwork(artworkId: string): Promise<IBid[]| null>;
}
