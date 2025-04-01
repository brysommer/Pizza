import { bot } from "./app.js";
import { keyboards, phrases } from './language_ua.js';
import { findUserByChatId } from './models/user.js';
import { logger } from "./logger/index.js";
import { findLocalOrderById, updateDriverLocalOrderById } from "./models/localOrders.js";
import { findDriverByChatId } from "./models/drivers.js";
import { dataBot } from "./values.js";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


const getRide = async () => {
    bot.on('message', async (message) => {
        const chatId = message.chat.id;
        const text = message.text;

        const textCommand = text ? text.split("@") : undefined;
        if (textCommand?.[0] === 'get') {    
            
            try {
                const localOrder = await findLocalOrderById(textCommand[1]);

                const driver = await findDriverByChatId(chatId);

                const updateDriver = await updateDriverLocalOrderById(textCommand[1], driver.id);

                await bot.sendMessage(
                    localOrder.client, 
                    phrases.orderTaken,
                ); 

                await bot.sendMessage(
                    localOrder.client, 
                    `Очікуйте авто ${driver.registration_number}` + 'Номер курєра: ' + driver.phone,
                );

                if(textCommand[2]) {
                    await bot.sendMessage(
                        localOrder.client, 
                        `Час прибуття ${textCommand[2]}`,
                    );
                }

                await bot.sendMessage(
                    dataBot.driversChannel, 
                    `Замовлення ${textCommand[1]} знято`,
                );
                console.log(localOrder)
                await bot.sendMessage(
                    chatId, 
                    `*Ви успішно забрали замовлення ${textCommand[1]}*\n` + 
                    `📍 *Адреса:* ${localOrder.pickup_location}\n` +  
                    `💳 *Оплата:* ${localOrder?.direction_location} грн ✅\n` + 
                    `📞 ${localOrder?.phone}`,  
                    { parse_mode: "Markdown" }
                );
                

            } catch (error) {
                logger.warn(`Something went wrong when driver ${chatId} book the ride ${textCommand[1]}. Error: ${error}`);

                bot.sendMessage(chatId, phrases.localBookingWrong);
            }
            
            
        }
    });
    
}

export default getRide;