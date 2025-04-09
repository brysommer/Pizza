import { bot, driversBot } from "./app.js";
import { keyboards, phrases } from './language_ua.js';
import { findUserByChatId } from './models/user.js';
import { logger } from "./logger/index.js";
import { findLocalOrderById, updateDriverLocalOrderById } from "./models/localOrders.js";
import { findDriverByChatId, findDriversChatId } from "./models/drivers.js";
import { dataBot } from "./values.js";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


const getRide = async () => {
    const handleGet = async (chatId, textCommand) => {
        try {
            const localOrder = await findLocalOrderById(textCommand[1]);
            const driver = await findDriverByChatId(chatId);
            await updateDriverLocalOrderById(textCommand[1], driver.id);

            await bot.sendMessage(localOrder.client, `Замовлення ${localOrder.id} прийнято ` );
            await bot.sendMessage(localOrder.client, `Очікуйте авто ${driver.registration_number}\nНомер кур'єра: ${driver.phone}`);

            if (textCommand[2]) {
                await bot.sendMessage(localOrder.client, `Час прибуття: ${textCommand[2]}`);
            }

            await bot.sendMessage(dataBot.driversChannel, `Замовлення ${textCommand[1]} знято`);

            const drivers = await findDriversChatId();

            for (const driverId of drivers) {
                try {
                    await driversBot.sendMessage(driverId, `Замовлення ${textCommand[1]} знято`);
                } catch (error) {
                    console.warn(`❌ Не вдалося надіслати повідомлення водієві з chatId ${driverId}:`, error?.message || error);
                    // Можеш ще додати логіку, щоб відмічати неактивних водіїв у базі
                }
            }

            await driversBot.sendMessage(
                chatId,
                `*Ви успішно забрали замовлення ${textCommand[1]}*\n` +
                `📍 *Адреса куди:* ${localOrder.pickup_location}\n` +  
                `📍 *Адреса звідки:* ${localOrder.price}\n` +
                `💳 *Оплата:* ${localOrder?.direction_location} грн ✅\n` +
                `📞 ${localOrder?.phone}`,
                { parse_mode: "Markdown" }
            );

        } catch (error) {
            logger.warn(`Something went wrong when driver ${chatId} book the ride ${textCommand[1]}. Error: ${error}`);
            bot.sendMessage(chatId, phrases.localBookingWrong);
        }
    };

    // Обробка текстового повідомлення
    bot.on('message', async (message) => {
        const chatId = message.chat.id;
        const text = message.text;
        const textCommand = text ? text.split("@") : undefined;

        if (textCommand?.[0] === 'get') {
            await handleGet(chatId, textCommand);
        }
    });

    // Обробка callback-кнопки
    driversBot.on('callback_query', async (callbackQuery) => {
        const chatId = callbackQuery.from.id;
        const data = callbackQuery.data; // наприклад "get@123@15:00"
        const textCommand = data ? data.split("@") : undefined;

        if (textCommand?.[0] === 'get') {
            await handleGet(chatId, textCommand);

            // Закрити сповіщення про натискання кнопки
            await driversBot.answerCallbackQuery(callbackQuery.id);
        }
    });
};


export default getRide;