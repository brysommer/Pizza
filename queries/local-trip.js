import axios from 'axios';
import { bot, driversBot } from '../app.js';
import { keyboards, phrases } from '../language_ua.js';
import { findDriversChatId } from '../models/drivers.js';
import { createNewLocalOrder, findLocalOrderById, updateCommentLocalOrderById, updateDeliveryPriceLocalOrderById, updateDirectionLocalOrderById, updateDistanceLocalOrderById, updatePhoneLocalOrderById, updatePickUpLocalOrderById } from '../models/localOrders.js';
import { findAllCities, findCityById } from '../models/taxi-cities.js';
import { findUserByChatId, updateDiaulogueStatus, updateUserByChatId } from '../models/user.js';
import { generateLocaLLocationsMenu } from '../plugins/generate-menu.js';
import { dataBot } from '../values.js';
import { sessionCreate } from '../wfpinit.js';
import { calculatePrice } from '../plugins/calculate-price.js';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const localTrip = async () => {
    bot.on('callback_query', async (query) => {
        const action = query.data;
        const chatId = query.message.chat.id;

        try {
            switch (action) {
                
                case 'exit':
                    await updateDiaulogueStatus(chatId, '');

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
                        case 'approveOrder':
                            const localOrder = await findLocalOrderById(callback_info);

                            const drivers = await findDriversChatId();

                            const typeOfGoods = await findCityById(localOrder?.city);

                            const user = await findUserByChatId(chatId);

                            await bot.sendMessage(
                                dataBot.driversChannel,  
                                `📦 *Замовлення №: ${localOrder.id} \n${typeOfGoods.emoji} ${typeOfGoods.city}*\n` +  
                                `📍 *Адреса куди:* ${localOrder.pickup_location}\n` +  
                                `📍 *Адреса звідки:* ${localOrder.price}\n` +
                                `🛣️ *Відстань:* ${localOrder.distance}\n` +
                                `💳 *Доставка:* ${localOrder.deliveryPrice} грн \n` +  
                                `🥡 *Замовлення:* ${localOrder.direction_location} грн \n` +  
                                ` *₴  Загальна сума:* ${localOrder.deliveryPrice + localOrder.direction_location} грн ✅`,
                                { parse_mode: "Markdown" }  
                            );
                            
                            for (const driverId of drivers) {
            
                                try {                     
            
            
            
                                    await driversBot.sendMessage(
                                        driverId,
                                        `📦 *Замовлення №: ${localOrder.id}*\n` +
                                        `${typeOfGoods.emoji}  ${typeOfGoods.city}\n` +
                                        `📍 *Адреса куди:* ${localOrder.pickup_location}\n` +  
                                        `📍 *Адреса звідки:* ${localOrder.price}\n` +
                                        `🛣️ *Відстань:* ${localOrder.distance}\n` +
                                        `💳 *Доставка:* ${localOrder.deliveryPrice} грн \n` +  
                                        `🥡 *Замовлення:* ${localOrder.direction_location} грн \n` +  
                                        `*₴     Загальна сума:* ${localOrder.deliveryPrice + localOrder.direction_location} грн ✅ \n`, 
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
            
                                }
                            }

                            await bot.sendMessage(chatId, 
                                phrases.successPay,
                                
                                { reply_markup: { inline_keyboard: [
                                    [{ text: 'Вихід 🚪', callback_data: 'exit' }],
                                    [{ text: 'Залишити коментар 💬', callback_data: `localComment+${localOrder.id}` }],                                
                                    ]}
                                }
                            );

                        break;

                        case 'city':
                            const city = await updateUserByChatId(chatId, { favorite_city: callback_info });

                            await bot.sendMessage(
                                chatId,
                                phrases.sendAddress                                 
                            );

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
          //  await updateDiaulogueStatus(chatId, 'pickup+' + order.id);

            const direction = await updatePickUpLocalOrderById(order.id, user?.defaultPickupLocation);


            await bot.sendMessage(chatId, 
                'Ваша адреса для забору відправлення ' + user?.defaultPickupLocation,                    
            )

            await delay(500);

            await updateDiaulogueStatus(chatId, 'direction+' + order.id);

            await bot.sendMessage(
                chatId,
                phrases.taxiOnTheWay,
            );
        }

        if (user && status_hook === 'direction' && !location) {

            const direction = await updateDirectionLocalOrderById(status_info, text);
            
            await updateDiaulogueStatus(chatId, 'customerPhone+' + status_info);

            await bot.sendMessage(
                chatId,
                phrases.rules,
            );

        };

        if (user && status_hook === 'pickup' && !location) {

            const direction = await updatePickUpLocalOrderById(status_info, text);
            
            await updateDiaulogueStatus(chatId, 'direction+' + status_info);

            await bot.sendMessage(
                chatId,
                phrases.taxiOnTheWay,
            );

        };

        if (status_hook === 'customerPhone') {

            try {

                const localOrder = await findLocalOrderById(status_info);

                const orderPhone = await updatePhoneLocalOrderById(status_info, text);

                const drivers = await findDriversChatId();

                const city = await findCityById(localOrder?.city);

                const user = await findUserByChatId(chatId);

                const distanceResponse = await axios.get('https://maps.googleapis.com/maps/api/directions/json?',
                    { 
                        params: 
                        {
                            origin: localOrder.price + ', Чернівці',
                            destination: localOrder.pickup_location + ', Чернівці',
                            key: dataBot.gapiKey,
                            mode: 'driving'
                        }
                    }
                );

                
                const data = distanceResponse.data;

                let distanceValue 

                let direction;

                if (data.status === 'OK' && data.routes && data.routes.length > 0) {

                    const route = data.routes[0];

                    const leg = route.legs[0];

                    const distanceText = leg.distance.text; 
                    
                    distanceValue = leg.distance.value/1000; 

                    direction = distanceText;
                    
                    

                } else {

                    console.error("Error or no routes found:", data.status);

                };

                const deliveryPrice = calculatePrice(distanceValue);

                const updateDelivery = await updateDeliveryPriceLocalOrderById(localOrder.id, deliveryPrice);
                
                const total = parseFloat(localOrder.direction_location) + parseFloat(deliveryPrice);

                const departmentPhone = await findUserByChatId(chatId);

                const distance = await updateDistanceLocalOrderById(localOrder.id, direction)

                await bot.sendMessage(chatId, 'Це замовлення побачить ваш курьєр');
                
                await bot.sendMessage(
                    chatId,
                    `📦 *Замовлення №: ${localOrder.id} \n${city.emoji} ${city.city}*\n` +  
                    `📍 *Адреса куди:* ${localOrder.pickup_location}\n` +  
                    `📍 *Адреса звідки:* ${localOrder.price}\n` +
                    `🛣️ *Відстань:* ${direction}\n` +
                    `💳 *Доставка:* ${deliveryPrice} грн \n` +  
                    `🥡 *Замовлення:* ${localOrder.direction_location} грн \n` +  
                    `₴ *Загальна сума:* ${total} грн ✅\n` + 
                    `Номер клієнта 📞 ${text}\n` + 
                    `Номер відправника 📞 ${departmentPhone?.phone || 'не вказано'}`,
                    {
                      parse_mode: "Markdown",
                      reply_markup: {
                        inline_keyboard: [
                          [
                            {
                              text: "✅ Підтвердити",
                              callback_data: `approveOrder+${localOrder.id}`,
                            },
                            {
                              text: "❌ Відмінити",
                              callback_data: "exit",
                            },
                          ],
                        ],
                      },
                    }
                  );
            } catch (error) {

                console.log(error)

            }
        }


        if (status_hook === 'localComment') {

            await updateDiaulogueStatus(chatId, '');

            await updateCommentLocalOrderById(status_info, text);

            const comment = `Замовлення №: ${status_info+ ' 💬 Коментар: ' +text}`

            await bot.sendMessage(dataBot.driversChannel, comment);

            const drivers = await findDriversChatId();

            for (const driverId of drivers) {
                try {
                    await driversBot.sendMessage(driverId, comment);
                } catch (error) {
                    console.warn(`❌ Не вдалося надіслати повідомлення водієві з chatId ${driverId}:`, error?.message || error);
                    // Можеш ще додати логіку, щоб відмічати неактивних водіїв у базі
                }
            }

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