import { Model, DataTypes, Op } from "sequelize";
import { sequelize } from './sequelize.js';
import { logger } from '../logger/index.js';

class Rides extends Model {}

Rides.init({
    route_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    car_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    seats_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    time: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    month: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    
}, {
    freezeTableName: false, 
    timestamps: false, 
    modelName: 'rides',  
    sequelize                 
});

const findFutureRidesByRouteID = async (route_id) => {

    const currentDate = new Date();

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // Місяці в JS починаються з 0
    const currentDay = currentDate.getDate();
    const currentTime = currentDate.toTimeString().slice(0, 5); // Формат 08:00

    console.log(currentTime);

    const res = await Rides.findAll({
        where: {
            route_id,
            [Op.or]: [
                // Рік більший за поточний
                { year: { [Op.gt]: currentYear } },
                // Той самий рік, але місяць більший за поточний
                {
                    [Op.and]: [
                        { year: currentYear },
                        { month: { [Op.gt]: currentMonth } }
                    ]
                },
                // Той самий рік і місяць, але день більший за поточний
                {
                    [Op.and]: [
                        { year: currentYear },
                        { month: currentMonth },
                        { date: { [Op.gt]: currentDay } }
                    ]
                },
                // Той самий рік, місяць і день, але час більший за поточний
                {
                    [Op.and]: [
                        { year: currentYear },
                        { month: currentMonth },
                        { date: currentDay },
                        { time: { [Op.gt]: currentTime } } // Час більший за поточний
                    ]
                }
            ]
        }
    });

    console.log(`RES: ${res}`)

    if (res.length > 0) return res.map(ride => ride.dataValues);
    return [];
};


const findRideById = async (id) => {
    const res = await Rides.findOne({ where: { id } });
    if (res) return res.dataValues;
    return res;
};


const findAllTodayRides = async (date) => {
    const res = await Rides.findAll({ where: { date } });
    if (res.length > 0) return res.map(el => el.dataValues);
    return;
};

const createRide = async (rideData) => {
    let res;
    try {
        res = await Rides.create(rideData);
        res = res.dataValues;
    } catch (err) {
        logger.error(`Impossible to create ride: ${err}`);
    }
    return res;
};

const updateSeatByRideID = async (id, seats_id) => {
    const res = await Rides.update({ seats_id }, { where: { id } });
    return res[0] ? id : undefined;
};

const findAllTodayRouteRides = async (route_id, date, month, year) => {
    const res = await Rides.findAll({ where: { route_id, date, month, year } });
    if (res.length > 0) return res.map(el => el.dataValues);
    return;
};

const findAllTodayRouteRidesinTime = async (route_id, date, month, year, time) => {
    const res = await Rides.findAll({ where: { route_id, date, month, year, time } });
    if (res.length > 0) return res.map(el => el.dataValues);
    return;
};

export {
    Rides,
    findFutureRidesByRouteID,
    findRideById,
    findAllTodayRides,
    createRide,
    updateSeatByRideID,
    findAllTodayRouteRides,
    findAllTodayRouteRidesinTime
};