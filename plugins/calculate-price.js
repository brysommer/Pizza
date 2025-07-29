import { dataBot } from "../values.js"

export const calculatePrice = (distance) => {
    let weatherRatio = 1
    return (( dataBot.basePrice + dataBot.distancePrice  * parseFloat(distance) ) * weatherRatio).toFixed(0);
}