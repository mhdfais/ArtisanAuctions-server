import { IAuctionWon, IPopulatedAuctionWon } from "../IAuctionWon";

export interface IAuctionWonRepository{
    findAuctionsWonByWinnerId(winnerId:string):Promise<IPopulatedAuctionWon[]|null>
    updateAddress(wonAuctionId: string, address: object):Promise<void>
    findBySellerId(sellerId:string):Promise<IPopulatedAuctionWon[]|null>
    updateStatusByArtworkId(id: string, status: string):Promise<void>
}