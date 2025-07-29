import { driversBot } from "../app.js";
import qrcode from 'qrcode';
import { getReferralsByInviter } from "../models/referals.js";
import { findUserByChatId } from "../models/user.js";

export const referalProgram = () => {
    driversBot.setMyCommands([
        {command: '/referal', description: 'Запрошувальне посилання'},
        {command: '/balance', description: 'Особистий кабінет'},
    ]);
    
    // Приклад відповіді на команду /referal
    driversBot.onText(/\/referal/, async (msg) => {
        const chatId = msg.chat.id;
        const referralLink = `https://t.me/che\\_go\\_bot?start=${chatId}`; // Замініть на ваше фактичне реферальне посилання

        const message = `🤝 **Запрошуй друзів та отримуй бонуси!**\n\n` +
                        `Поділись цим посиланням зі своїми знайомими закладами, і коли вони зареєструються та виконають перше замовлення, ти отримаєш винагороду!\n\n` +
                        `🔗 Ось твоє персональне запрошувальне посилання:\n` +
                        `${referralLink}\n\n` +
                        `Дякуємо, що допомагаєш розширювати нашу спільноту! ✨`;

        driversBot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

        try {
            // Генеруємо QR-код як буфер (Buffer) з зображенням
            const qrCodeBuffer = await qrcode.toBuffer(`https://t.me/che_go_bot?start=${chatId}`, {
                errorCorrectionLevel: 'H', // Рівень корекції помилок (H = High)
                type: 'png', // Тип зображення
                width: 300 // Ширина QR-коду
            });
    
            // Відправляємо QR-код як фото
            await driversBot.sendPhoto(chatId, qrCodeBuffer, {
                caption: 'Твій QR-код для запрошення друзів!'
            });
    
        } catch (err) {
            console.error('Помилка при генерації або відправленні QR-коду:', err);
            driversBot.sendMessage(chatId, 'Виникла помилка при генерації QR-коду. Спробуйте пізніше.');
        }
    }); 

    // Приклад відповіді на команду /referal
    driversBot.onText(/\/balance/, async (msg) => {
        const chatId = msg.chat.id;
        const referalst = await getReferralsByInviter(chatId);

        console.log(referalst)

        if(referalst.length < 1) {
            driversBot.sendMessage(chatId, `Ви ще не запросили жодного користувача
            `);
            return;
        }

        const referalString = (await Promise.all(
            referalst.map(async (el) => {
              const user = await findUserByChatId(el.invited_id);
              const nameOrId = user?.businessName || el.invited_id;
              const status = el.is_active ? '✅' : '🕒';
              return `${nameOrId} ${status}`;
            })
          )).join('\n📓 ├ ');
          

        driversBot.sendMessage(chatId, `
👤 Особистий кабінет:

🆔 ├ ID: ${chatId}  
📓 ├ ${referalString} 
💵 └ Усього запрошено: ${referalst.length}
    
        `)
    }); 
}

