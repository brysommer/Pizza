import { sequelize } from '../models/sequelize.js';
import { QueryInterface } from 'sequelize';
import { User } from '../models/user.js';
import { TaxiRoute, createDemoRoute } from '../models/taxiRoute.js'; 
import { Rides } from '../models/rides.js';
import { Routes } from '../models/routes.js';
import { Locations } from '../models/locations.js';
import { Cars } from '../models/cars.js';
import { Seats } from '../models/seats.js';
import { Cities } from '../models/taxi-cities.js';
import { Orders } from '../models/orders.js';
import { Driver } from '../models/drivers.js';
import { LocalOrders } from '../models/localOrders.js';

const DEBUG = false;

const main = async () => {
    try {
        const queryInterface = sequelize.getQueryInterface();

        // Синхронізація таблиць
        const syncState = await Promise.all([
            User.sync(),
            TaxiRoute.sync(),
            Locations.sync(),
            Rides.sync(),
            Routes.sync(),
            Seats.sync(),
            Cars.sync(),
            Cities.sync(),
            Orders.sync(),
            Driver.sync(),
            LocalOrders.sync()
        ]);


        if (DEBUG && syncState) {
            await createDemoRoute();
        }

    } catch (err) {
        console.error('Migration failed:', err);
    }
};

main();
