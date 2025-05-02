import { bot } from "./app.js";
import { keyboards, phrases } from './language_ua.js';
import { createNewUserByChatId, findUserByChatId, updateDiaulogueStatus, updateUserByChatId } from './models/user.js';
import { logger } from "./logger/index.js";
import { sessionCreate } from "./wfpinit.js";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


export const anketaListiner = async () => {
    bot.setMyCommands([
        {command: '/start', description: 'Повернутися до головного меню'},
      ]);

    bot.on('message', async (message) => {
        const chatId = message.chat.id;
        const text = message.text;

        const user = await findUserByChatId(chatId);

        const status = user?.dialogue_status;

        try {
            if (text === '/start') {  
                

                const user = await findUserByChatId(chatId);

                await updateDiaulogueStatus(chatId, '');

                if (user) {

                    await bot.sendMessage(
                        chatId, 
                        phrases.mainMenu,
                        { reply_markup: keyboards.selectArea }
                    ); 

                } else {
                    await createNewUserByChatId(chatId);  

                    logger.info(`USER_ID: ${chatId} join BOT`);

                    await delay(2000);
    
                    await bot.sendMessage(
                        chatId, 
                        phrases.askNumber,
                        { reply_markup: keyboards.shareNumber }
                    );
    
                }  
                                  
            } 
            
            if (status === 'defaultPickup') {
                await updateDiaulogueStatus(chatId, '');

                await updateUserByChatId(chatId, { defaultPickupLocation : text });

                await bot.sendMessage(
                    chatId, 
                    phrases.successSaved,
                    { reply_markup: keyboards.selectArea }
                );

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
/*
            await bot.sendMessage(
                chatId, 
                phrases.mainMenu,
                { reply_markup: keyboards.selectArea }
            );
*/
        } catch (error) {

            logger.warn(`Cann't update phone number`);

        }

    });

    bot.on("photo", async (msg) => {

        const chatId = msg.chat.id;

        const photo = msg.photo[msg.photo.length - 1];
        const fileId = photo.file_id;

        bot.sendMessage(chatId, `Photo ID: ${fileId}`);

    })
};
