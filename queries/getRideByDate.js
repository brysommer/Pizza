import { bot } from "../app.js";
import { phrases } from "../language_ua.js";
import { findAllTodayRouteRides, findAllTodayRouteRidesinTime } from "../models/rides.js";
import { findUserByChatId, updateDiaulogueStatus } from "../models/user.js";
import { generateRidesMenu } from "../plugins/generate-menu.js";
import parseDateString from "../plugins/pasrseDate.js";


const getRideByDate = () => {
    bot.on('message', async (message) => {
        const chatId = message.chat.id;
        const text = message.text;

        const user = await findUserByChatId(chatId);

        const status = user.dialogue_status;

        const rideData = status.split("+");

        console.log(rideData)

        if (rideData[0] === 'route') {
            const date = parseDateString(text);

            console.log(date)

            if (date && date.length === 3) {
    
                const rides = await findAllTodayRouteRides(rideData[1], date[0], date[1], date[2]);
    
                const ridesMenu = await generateRidesMenu(rides, 'buyTicket', chatId);
    
                if (!ridesMenu) return;
                                
                
    
                await bot.sendMessage(
                    chatId, 
                    phrases.ride,
                    { reply_markup: { inline_keyboard: ridesMenu } }
                );
    
            } if (date && date.length === 4) {
                const rides = await findAllTodayRouteRidesinTime(rideData[1], date[1], date[2], date[3], date[0]);
    
                const ridesMenu = await generateRidesMenu(rides, 'buyTicket', chatId);
    
                if (!ridesMenu) return;
                                
                
    
                await bot.sendMessage(
                    chatId, 
                    phrases.ride,
                    { reply_markup: { inline_keyboard: ridesMenu } }
                );
    
            }
    
        }

    })
}

export default getRideByDate;