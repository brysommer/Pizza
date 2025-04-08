import TelegramBot from 'node-telegram-bot-api';
import { anketaListiner } from './anketa.js';
import { dataBot } from './values.js';
import { sequelize } from './models/sequelize.js';
import { localTrip } from './queries/local-trip.js'
import buyTicket from './queries/buy-ticket.js';
import server from './webserver.js';
import getRide from './get-ride.js';
import autoRides from './plugins/auto-rides.js';
import cron from 'node-cron';
import support from './queries/support.js';
import getRideByDate from './queries/getRideByDate.js';

const bot = new TelegramBot(dataBot.telegramBotToken, { polling: true });
const driversBot = new TelegramBot(dataBot.courierBotToken, { polling: true });

export { bot, driversBot };

const main = async () => {
    const models = {
        list:  [
 //           'cars'
        ]
    };
    // DB
    const configTables = models.list;
    const dbInterface = sequelize.getQueryInterface();
    const checks = await Promise.all(configTables.map(configTable => {
        return dbInterface.tableExists(configTable);
    }));
    const result = checks.every(el => el === true);
    if (!result) {
        // eslint-disable-next-line no-console
        console.error(`🚩 Failed to check DB tables, see config.models.list`);
        throw (`Some DB tables are missing`);
    }
    //logger.info('DB connected.');
}; 

main();

anketaListiner();
localTrip();
//buyTicket();
//server();
getRide();
//support();
//getRideByDate();

 cron.schedule('0 0 * * *', () => {
    autoRides();
 }, {
     scheduled: true,
     timezone: 'Europe/Kiev' 
 });
