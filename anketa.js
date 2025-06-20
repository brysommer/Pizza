import { bot } from "./app.js";
import { keyboards, phrases } from './language_ua.js';
import { createNewUserByChatId, findUserByChatId, updateDiaulogueStatus, updateUserByChatId } from './models/user.js';
import { logger } from "./logger/index.js";
import { sessionCreate } from "./wfpinit.js";
import { findDriverByChatId } from "./models/drivers.js";
import { dataBot } from "./values.js";
import axios from "axios";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


export const anketaListiner = async () => {
    bot.setMyCommands([
        {command: '/start', description: 'Повернутися до головного меню'},
      ]);

      bot.onText(/\/start(?:\s(.*))?/, async (msg, match) => {

        const chatId = msg.chat.id;

        const referralCode = match[1];

        const user = await findUserByChatId(chatId);

        if(user && !user?.phone ) {

            await bot.sendMessage(
                chatId, 
                phrases.askNumber,
                { reply_markup: keyboards.shareNumber }
            );
            return;

        }

        if(user && !user?.defaultPickupLocation) {
            return;
        }

        await updateDiaulogueStatus(chatId, '');

        if (user) {

            await bot.sendMessage(
                chatId, 
                phrases.mainMenu,
                { reply_markup: keyboards.selectArea }
            ); 
        

        } else {
            const newUser = await createNewUserByChatId(chatId);  

            logger.info(`USER_ID: ${chatId} join BOT`);

            await delay(2000);

            if (referralCode) {
                bot.sendMessage(chatId, `Вас запросив користувач з кодом: ${referralCode}`);

                const inviter = await findDriverByChatId(referralCode);
                if (!inviter) {
                    return bot.sendMessage(chatId, 'Посилання недійсне: користувач не знайдений');
                }

                await addReferral(inviter.id, newUser.id);
                bot.sendMessage(chatId, `Вітаємо! Вас запросив ${inviter.name || 'користувач'}`);


                await delay(2000);                
        
                await bot.sendMessage(
                    chatId, 
                    phrases.askNumber,
                    { reply_markup: keyboards.shareNumber }
                );
            } else {

                await delay(2000);                
        
                await bot.sendMessage(
                    chatId, 
                    phrases.askNumber,
                    { reply_markup: keyboards.shareNumber }
                );

            }
        }

      });

    bot.on('message', async (message) => {
        const chatId = message.chat.id;
        const text = message.text;

        const user = await findUserByChatId(chatId);

        const status = user?.dialogue_status;

        try {
                       
            if (status === 'defaultPickup') {
                // Цей рядок залишаємо тут, щоб статус діалогу завжди скидався після спроби отримати адресу
                
            
                if (text === '/start' || text === null) {
                    await bot.sendMessage(
                        chatId,
                        'Будь ласка, введіть коректну адресу для збереження за замовчуванням.'
                    );
                } else {
                    // Якщо ввід коректний, продовжуємо звичайну логіку
                    await updateDiaulogueStatus(chatId, '');
                    await updateUserByChatId(chatId, { defaultPickupLocation: text });
            
                    await bot.sendMessage(
                        chatId,
                        phrases.successSaved,
                        { reply_markup: keyboards.selectArea }
                    );
                }
            }

            if (status === 'nameRequest') {
                await updateDiaulogueStatus(chatId, 'defaultPickup');
                await updateUserByChatId(chatId, { businessName : text });

                await bot.sendMessage(
                    chatId, 
                    phrases.defaultAddress,
                );
            }
            if (user && status === 'pay') {
                if (!isNaN(text)) {
                    await updateDiaulogueStatus(chatId, ''); 
   
                    const paymentLink = await sessionCreate(text, 'pay', 'pay', chatId);
        
                    await bot.sendMessage(
                        chatId, 
                        `
    Перейдіть за посиланням на для оплати
                        `,
                        { reply_markup: { inline_keyboard: [[{text: `Оплатити ${text}`, url: paymentLink}]] } }
                    );
                } else {
                    await bot.sendMessage(
                        chatId, 
                        phrases.wrongAmount
                    );
                }
            }

            
        } catch (error) {
            console.error('Error handling message:', error);
        }
    });
    
    bot.on("contact", async (msg) => {

        const phone = msg.contact.phone_number;
        const chatId = msg.chat.id;        

        try {
            const user = await findUserByChatId(chatId);

            user && await updateUserByChatId(chatId, { phone, dialogue_status: 'nameRequest' });

            await bot.sendMessage(
                chatId, 
                phrases.requestedName,
            );

        } catch (error) {

            logger.warn(`Cann't update phone number`);

        }

    });

    bot.on("photo", async (msg) => {

        const chatId = msg.chat.id;

        const photo = msg.photo[msg.photo.length - 1];
        const fileId = photo.file_id;

        bot.sendMessage(chatId, `Photo ID: ${fileId}`);

    });

    bot.on("location", async (msg) =>{

        const chatId = msg.chat.id;

        const user = await findUserByChatId(chatId);

        const status = user?.dialogue_status;
        
        const targetCoordinate = {lat: msg.location.latitude, lon: msg.location.longitude};

        const addressResponse = await axios.get('https://maps.googleapis.com/maps/api/geocode/json?',
            { 
                params: 
                    {
                        latlng: targetCoordinate.lat + ',' + targetCoordinate.lon,
                        key: dataBot.gapiKey,
                    }
                }
        );

        const data = addressResponse.data;


        if (data.status === 'OK' ) {

            const address = data.results[0];

            const addressFormatted = `${address.address_components[1].short_name}, ${address.address_components[0].short_name}`;

            if (status === 'defaultPickup') {
                await updateDiaulogueStatus(chatId, '');
                await updateUserByChatId(chatId, { defaultPickupLocation: addressFormatted });
            
                await bot.sendMessage(
                    chatId,
                    phrases.successSaved,
                    { reply_markup: keyboards.selectArea }
                );
            }
            
        } else {

            console.error("Error or no routes found:", data.status);

        }
        

    })
};
