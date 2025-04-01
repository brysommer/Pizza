import { Model, DataTypes } from "sequelize";
import { sequelize } from './sequelize.js';
//import { logger } from '../logger/index.js';

class TaxiRoute extends Model {}

TaxiRoute.init({
    departure_city: {
        type: DataTypes.STRING,
        allowNull: false
    },
    target_city: {
        type: DataTypes.STRING,
        allowNull: false
    },
    area: {
        type: DataTypes.STRING,
        allowNull: false
    },
    departure_time: {
        type: DataTypes.DATE,
        allowNull: true
    },
    arrival_time: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    freezeTableName: false, 
    timestamps: false, 
    modelName: 'taxi_routes',  
    sequelize                 
});

const createDemoRoute = async () => {
    try {
        const demoRouteData = {
            departure_city: 'Одеса',
            target_city: 'Софія',
            area: 'international',
            departure_time: new Date('2024-09-13T08:00:00'),  
            arrival_time: new Date('2024-09-13T21:00:00')
        };

        console.log('Creating demo bus route...');

        // Create a new bus route entry in the database
        const demoRoute = await TaxiRoute.create(demoRouteData);

        console.log('Demo route created:', demoRoute.toJSON());
    } catch (err) {
        console.error('Error creating demo route:', err);
    }
};
const findDeparturesByArea = async (area) => {
    const res = await TaxiRoute.findAll({ where: { area } });

    
    if (res.length > 0) {
         
        const departureCities = res.map(el => el.dataValues.departure_city);

        
        
        const uniqueDepartureCities = Array.from(new Set(departureCities));
       
        return uniqueDepartureCities;
    }
    return [];
};

const findRoutesByDepature = async (city) => {
    const res = await TaxiRoute.findAll({ where: { departure_city: city } });
    if (res.length > 0) {
        const cityPairs = res.map(el => ({
            departure_city: el.dataValues.departure_city,
            target_city: el.dataValues.target_city
        }));
        
        const uniquePairs = Array.from(new Set(cityPairs.map(pair => JSON.stringify(pair)))).map(JSON.parse);
        
        return uniquePairs;
    } 
    return;
};



export {
    TaxiRoute,
    createDemoRoute,
    findDeparturesByArea,
    findRoutesByDepature
};