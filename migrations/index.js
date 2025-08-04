import { Cars } from '../models/cars.js';
import { Driver } from '../models/drivers.js';
import { LocalOrders } from '../models/localOrders.js';
import { Locations } from '../models/locations.js';
import { Orders } from '../models/orders.js';
import { Prices } from '../models/prices.js';
import { Referral } from '../models/referals.js';
import { Rides } from '../models/rides.js';
import { Routes } from '../models/routes.js';
import { Seats } from '../models/seats.js';
import { sequelize } from '../models/sequelize.js';
import { Cities } from '../models/taxi-cities.js';
import { TaxiRoute, createDemoRoute } from '../models/taxiRoute.js';
import { User } from '../models/user.js';

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
			Prices.sync(),
			Cities.sync(),
			Orders.sync(),
			Driver.sync(),
			LocalOrders.sync(),
			Referral.sync(),
		]);

		if (DEBUG && syncState) {
			await createDemoRoute();
		}
	} catch (err) {
		console.error('Migration failed:', err);
	}
};

main();
