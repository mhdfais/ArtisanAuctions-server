import { injectable } from "tsyringe";
import { IArtwork } from "../interfaces/IArtwork";
import { IArtworkRepository } from "../interfaces/repositoryInterfaces/IArtworkRepository";
import Artwork from "../models/Artwork";

@injectable()
export class ArtworkRepository implements IArtworkRepository {
  constructor() {}

  async create(data: IArtwork): Promise<IArtwork | null> {
    return Artwork.create(data);
  }

  async updateApprovalStatus(
    artworkId: string,
    status: string
  ): Promise<IArtwork | null> {
    return await Artwork.findByIdAndUpdate(
      artworkId,
      {
        approvalStatus: status,
        // isActive: true,
      },
      { new: true }
    );
  }

  async findBySellerId(sellerId: string): Promise<IArtwork[] | null> {
    return await Artwork.find({ sellerId });
  }

  async findByAndUpdate(
    id: string,
    startTime: string,
    endTime: string
  ): Promise<IArtwork | null> {
    return await Artwork.findByIdAndUpdate(
      id,
      {
        auctionStartTime: new Date(startTime),
        auctionEndTime: new Date(endTime),
        isActive:true
      },
      {
        new: true,
      }
    );
  }

  async getAllArtworks(): Promise<IArtwork[] | null> {
    return await Artwork.find({ isActive: true, }).sort({createdAt:-1});
  }

  async findById(id:string):Promise<IArtwork|null>{
    return await Artwork.findById(id)
  }
}
