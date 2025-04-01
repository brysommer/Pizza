import { Model, DataTypes } from "sequelize";
import { sequelize } from './sequelize.js';
import { logger } from '../logger/index.js';
import { Locations } from "./locations.js";

class Routes extends Model {}

Routes.init({
    departure_city: {
        type: DataTypes.STRING,
        allowNull: false
    },
    arrival_city: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    freezeTableName: false,
    timestamps: false, 
    modelName: 'routes',  
    sequelize                 
});

const findRouteById = async (id) => {
    const res = await Routes.findAll({ where: { id: id } });
    if (res.length > 0) return res.map(el => el.dataValues);
    return;
};

const findInternationalRoutesFromDeparture = async (departure_city) => {
    const res = await Routes.findAll({ where: { departure_city } });
    if (res.length > 0) {

        const internationalRoutes = [];

        for (const route of res) {
            const departure = await Locations.findOne({ where: { id: route.departure_city } });
            const arrival = await Locations.findOne({ where: { id: route.arrival_city } });

            // Якщо країни міст відрізняються
            if (departure.country !== arrival.country) {
                internationalRoutes.push(route.dataValues);
            }
        }

        return internationalRoutes;
    };
    return;
};

const findDomesticRoutesFromDeparture = async (departure_city) => {
    const routes = await Routes.findAll({ where: { departure_city } });

    if (routes.length > 0) {
        const domesticRoutes = [];

        for (const route of routes) {
            const departure = await Locations.findOne({ where: { id: route.departure_city } });
            const target = await Locations.findOne({ where: { id: route.arrival_city } });

            if (departure.country === '🇺🇦' && target.country === '🇺🇦') {
                domesticRoutes.push(route.dataValues);
            }
        }

        return domesticRoutes;
    }
    return [];
};

const buildRouteDescriptions = async (routes) => {
    const routeDescriptions = [];

    for (const route of routes) {
        const departure = await Locations.findOne({ where: { id: route.departure_city } });
        const target = await Locations.findOne({ where: { id: route.arrival_city } });

        if (departure && target) {
            const description = `${departure.city} ${departure.country} - ${target.city} ${target.country}`;
            
            routeDescriptions.push({
                description: description,
                id: route.id
            });
        }
    }

    return routeDescriptions;
};

const isDomesticRoute = async (routeId) => {

    const route = await Routes.findOne({ where: { id: routeId } });
    if (!route) {
        throw new Error(`Route with ID ${routeId} not found`);
    }

    const departure = await Locations.findOne({ where: { id: route.departure_city } });
    const target = await Locations.findOne({ where: { id: route.arrival_city } });

    if (!departure || !target) {
        throw new Error(`Locations for the route not found`);
    }

    return departure.country === '🇺🇦' && target.country === '🇺🇦';
};



export {
    Routes,
    findInternationalRoutesFromDeparture,
    findDomesticRoutesFromDeparture,
    buildRouteDescriptions,
    findRouteById,
    isDomesticRoute
};