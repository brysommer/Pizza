import { bot, driversBot } from '../app.js';
import { keyboards, phrases } from '../language_ua.js';
import { findDriversChatId } from '../models/drivers.js';
import { createNewLocalOrder, findLocalOrderById, updateCommentLocalOrderById, updateDirectionLocalOrderById, updatePhoneLocalOrderById, updatePickUpLocalOrderById } from '../models/localOrders.js';
import { findAllCities, findCityById } from '../models/taxi-cities.js';
import { findUserByChatId, updateDiaulogueStatus, updateUserByChatId } from '../models/user.js';
import { generateLocaLLocationsMenu } from '../plugins/generate-menu.js';
import { dataBot } from '../values.js';
import { sessionCreate } from '../wfpinit.js';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const localTrip = async () => {
    bot.on('callback_query', async (query) => {
        const action = query.data;
        const chatId = query.message.chat.id;

        try {
            switch (action) {
                case 'exit':
                    await updateDiaulogueStatus(chatId, '');

                   /* await bot.sendMessage(
                        chatId, 
                        phrases.botInformation
                    );
                    */
                    await bot.sendMessage(
                    chatId, 
                    phrases.mainMenu,
                    { reply_markup: keyboards.selectArea }
                );

                    break;
                case 'local':
                    const cities = await findAllCities();

                    const citiesMenu = await generateLocaLLocationsMenu(cities, 'local');

                    await bot.sendMessage(
                        chatId,
                        phrases.localDepCity,
                        { reply_markup: { inline_keyboard: citiesMenu } }    
                    );
                    break;
                default:
                    const callback_data = action.split("+");

                    const callback_hook = callback_data[0];

                    const callback_info = callback_data[1];

                    const callback_next = callback_data[2];

                    switch (callback_hook) {
                        case 'city':
                            const city = await updateUserByChatId(chatId, { favorite_city: callback_info });

                           /* await bot.sendPhoto(
                                chatId,
                                'AgACAgIAAxkBAAMsZu1lYLwq8Sgxg0lbkpK847-vaQYAAkrmMRtbL2hL4YcfYGuNAAExAQADAgADeQADNgQ',
                                { caption: phrases.geolocation }    
                            );
*/
                         //   await delay (2000);
                            await bot.sendMessage(
                                chatId,
                                phrases.sendAddress                                 
                            );
                            /*
                            await delay (2000);

                            await bot.sendMessage(
                                chatId,
                                phrases.sendGeo,
                                { reply_markup: { keyboard:
                                    [
                                        [{
                                          text: 'Надіслати геопозицію',
                                          request_location: true
                                        }]
                                      ],
                                      resize_keyboard: true,
                                      one_time_keyboard: true
                                }   }    
                            );

                            */

                            

                            await updateDiaulogueStatus(chatId, 'address');

                        break;

                        case 'localComment': 
                            await bot.sendMessage(
                                chatId,
                                phrases.leaveComment,
                                { reply_markup: { inline_keyboard: [[{ text: 'Вихід 🚪', callback_data: 'exit' }]] } }    
                            );

                            await updateDiaulogueStatus(chatId, 'localComment+' + callback_info);
                        break;

                        case 'localComment': 
                            await bot.sendMessage(
                                chatId,
                                phrases.leaveComment,
                                { reply_markup: { inline_keyboard: [[{ text: 'Вихід 🚪', callback_data: 'exit' }]] } }    
                            );

                            await updateDiaulogueStatus(chatId, 'localComment+' + callback_info);
                        break;

                        case 'direction': 

                            await bot.sendMessage(
                                chatId,
                                phrases.sendGeo,
                              /*  { reply_markup: { keyboard:
                                    [
                                        [{
                                          text: 'Надіслати геопозицію',
                                          request_location: true
                                        }]
                                      ],
                                      resize_keyboard: true,
                                      one_time_keyboard: true
                                }   }   
                                      */ 
                            );

                            await delay (2000);

                            await bot.sendMessage(
                                chatId,
                                phrases.sendAddress                                 
                            );

                            await updateDiaulogueStatus(chatId, 'direction+' + callback_info);

                        break;

                        case 'anydirection': 

                            const paymentLink = await sessionCreate(1, 'local', callback_info, chatId);

                            await bot.sendMessage(
                                chatId,
                                phrases.rules,
                                { reply_markup: { inline_keyboard: [
                                    [{ text: 'Замовити', url: paymentLink }],
                                    [{ text: 'Вихід 🚪', callback_data: 'exit' }]] } }    
                            );

                            await updateDiaulogueStatus(chatId, '');
                        break;
                    }                
            }
        } catch (error) {
            console.error('Error callback query:', error);
        }
    });

    bot.on("location", async (msg) => {
        const chatId = msg.chat.id;
        const location = msg.location;

        console.log(location);
        const user = await findUserByChatId(chatId);
        const status = user?.dialogue_status;

        
        const status_data = status ? status.split("+") : null;
        const status_hook = status_data?.[0];

        const status_info = status_data?.[1];

        if (user && status_hook === 'direction') {

            const order = await updateDirectionLocalOrderById(status_info, location.latitude + ' ' + location.longitude);

            const paymentLink = await sessionCreate(1, 'local', status_info, chatId);

            await bot.sendMessage(
                chatId,
                phrases.rules,
                    { reply_markup: { inline_keyboard: [
                        [{ text: 'Замовити', url: paymentLink }],
                        [{ text: 'Вихід 🚪', callback_data: 'exit' }]] } }    
            );
        } else {
            await updateDiaulogueStatus(chatId, '');


            const order = await createNewLocalOrder(chatId, location.latitude + ' ' + location.longitude, user.favorite_city);
    
            await bot.sendMessage(chatId, 
                phrases.taxiOnTheWay,
                { reply_markup: { inline_keyboard: [
                    [{ text: 'Вказати напрямок руху', callback_data: `direction+${order.id}` }],
                    [{ text: 'Залишити напрямок руху довільним', callback_data: `anydirection+${order.id}` }],
                    [{ text: 'Вихід 🚪', callback_data: 'exit' }],
                    [{ text: 'Залишити коментар 💬', callback_data: `localComment+${order.id}` }],
                    
                ]} }
            )
        }

        

       

      
    })

    bot.on('message', async (message) => {
        const chatId = message.chat.id;
        const text = message.text;

        const location = message.location;

        const user = await findUserByChatId(chatId);

        const status = user?.dialogue_status;
        console.log(status)
        
        const status_data = status ? status.split("+") : null;
        const status_hook = status_data?.[0];

        const status_info = status_data?.[1];
        
        if (user && status_hook === 'address' && !location && text!='/start') {
            
            console.log(chatId, text, user.favorite_city)
            const order = await createNewLocalOrder(chatId, text, user.favorite_city);
            console.log(order)
            await updateDiaulogueStatus(chatId, 'pickup+' + order.id);

            await bot.sendMessage(chatId, 
                phrases.pickup,
              /*  { reply_markup: { inline_keyboard: [
                    [{ text: 'Вказати напрямок руху', callback_data: `direction+${order.id}` }],
                    [{ text: 'Залишити напрямок руху довільним', callback_data: `anydirection+${order.id}` }],
                    [{ text: 'Вихід 🚪', callback_data: 'exit' }],
                    [{ text: 'Залишити коментар 💬', callback_data: `localComment+${order.id}` }],
                    
                ]} }
                    */
            )
        }

        if (user && status_hook === 'direction' && !location) {

            

            const direction = await updateDirectionLocalOrderById(status_info, text);
            
       //     const paymentLink = await sessionCreate(1, 'local', status_info, chatId);
            await updateDiaulogueStatus(chatId, 'customerPhone+' + status_info);

            await bot.sendMessage(
                chatId,
                phrases.rules,
              /*      { reply_markup: { inline_keyboard: [
                        [{ text: 'Замовити', url: paymentLink }],
                        [{ text: 'Вихід 🚪', callback_data: 'exit' }]] } }   
                         */ 
            );
        };

        if (user && status_hook === 'pickup' && !location) {

            

            const direction = await updatePickUpLocalOrderById(status_info, text);
            
       //     const paymentLink = await sessionCreate(1, 'local', status_info, chatId);
            await updateDiaulogueStatus(chatId, 'direction+' + status_info);

            await bot.sendMessage(
                chatId,
                phrases.taxiOnTheWay,
              /*      { reply_markup: { inline_keyboard: [
                        [{ text: 'Замовити', url: paymentLink }],
                        [{ text: 'Вихід 🚪', callback_data: 'exit' }]] } }   
                         */ 
            );
        };

        if (status_hook === 'customerPhone') {

            try {
                const localOrder = await findLocalOrderById(status_info);

                const orderPhone = await updatePhoneLocalOrderById(status_info, text);

                const drivers = await findDriversChatId();
                console.log(drivers);

                
                
                //const getTag = localOrder?.pickup_location ? localOrder?.pickup_location.split(" ") : null;
                //const putTag = localOrder?.direction_location ? localOrder?.direction_location.split(" ") : null;

                /*
                if (getTag.length === 2) {
                    await bot.sendLocation(dataBot.driversChannel, getTag[0], getTag[1]);
                } else {
                    await bot.sendMessage(dataBot.driversChannel, 'Посадка: ' + localOrder.pickup_location);
                }
                
                if (putTag.length === 2) {
                    await bot.sendLocation(dataBot.driversChannel, putTag[0], putTag[1]);
                } else {
                    await bot.sendMessage(dataBot.driversChannel, 'Оплата: '+localOrder.direction_location);
                }
                */
                const city = await findCityById(localOrder?.city);

                const user = await findUserByChatId(chatId);
                
                await bot.sendMessage(  
                    dataBot.driversChannel,  
                    `📦 *Замовлення №: ${localOrder.id} \n${city.emoji} ${city.city}*\n` +  
                    `📍 *Адреса куди:* ${localOrder.pickup_location}\n` +  
                    `📍 *Адреса звідки:* ${localOrder.price}\n` +
                    `💳 *Оплата:* ${localOrder.direction_location} грн ✅`,  
                    { parse_mode: "Markdown" }  
                );
                
                for (const driverId of drivers) {
                    try {
                        await driversBot.sendMessage(
                            driverId,
                            `📦 *Замовлення №: ${localOrder.id}*\n` +
                            `${city.emoji} ${city.city}\n` +
                            `📍 *Адреса куди:* ${localOrder.pickup_location}\n` +  
                            `📍 *Адреса звідки:* ${localOrder.price}\n` +
                            `💳 *Оплата:* ${localOrder.direction_location} грн ✅`,
                            {
                                parse_mode: "Markdown",
                                reply_markup: {
                                    inline_keyboard: [
                                        [
                                            {
                                                text: "🚗 Взяти замовлення",
                                                callback_data: `get@${localOrder.id}`
                                            }
                                        ]
                                    ]
                                }
                            }
                        );
                    } catch (error) {
                        console.warn(`❌ Не вдалося надіслати повідомлення водієві з chatId ${driverId}:`, error?.message || error);
                        // Можеш ще додати логіку, щоб відмічати неактивних водіїв у базі
                    }
                }
                

                await bot.sendMessage(chatId, 
                    phrases.successPay,
                    
                    { reply_markup: { inline_keyboard: [
                        [{ text: 'Вихід 🚪', callback_data: 'exit' }],
                        [{ text: 'Залишити коментар 💬', callback_data: `localComment+${localOrder.id}` }],                                
                        ]}
                    }
                )

    
            } catch (error) {
                console.log(error)
            }
        }

        if (status_hook === 'localComment') {
            await updateDiaulogueStatus(chatId, '');

            await updateCommentLocalOrderById(status_info, text)

            await bot.sendMessage(dataBot.driversChannel, `Замовлення №: ${status_info+ ' 💬 Коментар: ' +text}`);

            await bot.sendMessage(chatId, 
                phrases.comentReceived,
                { reply_markup: { inline_keyboard: [[{ text: 'Вихід 🚪', callback_data: 'exit' }]] } }
            )
        }
    })

}

export {
    localTrip
}