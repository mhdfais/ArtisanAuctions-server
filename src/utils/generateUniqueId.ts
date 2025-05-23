import { randomUUID } from "crypto"

 export const generateUniqueId=(prefix='artisan_auctions')=>{
    return `aritisan_auction-${prefix}-${randomUUID().slice(10)}`
 }