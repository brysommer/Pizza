import { findPrices } from "../models/prices.js"

export const calculatePrice = async (distance) => {
    const dataPrice = await findPrices()
    
    let weatherRatio = 1
    return (( dataPrice.basePrice + dataPrice.distancePrice  * parseFloat(distance) ) * weatherRatio).toFixed(0);
}