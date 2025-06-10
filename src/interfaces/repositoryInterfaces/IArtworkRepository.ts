import { IArtwork } from "../IArtwork";

export interface IArtworkRepository {
  create(data: IArtwork): Promise<IArtwork | null>;
  updateApprovalStatus(
    artworkId: string,
    status: string
  ): Promise<IArtwork | null>;
  findBySellerId(sellerId: string): Promise<IArtwork[] | null>;
  findByAndUpdate(
    id: string,
    startTime: string,
    endTime: string
  ): Promise<IArtwork | null>;
  getAllArtworks(): Promise<IArtwork[] | null>
  findById(id:string):Promise<IArtwork|null>
}
