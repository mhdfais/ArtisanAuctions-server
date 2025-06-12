import { IBid } from "../interfaces/IBid";
import { IBidRepository } from "../interfaces/repositoryInterfaces/IBidRepository";
import Bid from "../models/Bid";

export class BidRepository implements IBidRepository{
    async getBidsByArtwork(artworkId:string):Promise<IBid[]|null>{
        return Bid.find({artworkId}).sort({placedAt:-1})
    }
}