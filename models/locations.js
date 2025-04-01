import { Model, DataTypes } from "sequelize";
import { sequelize } from './sequelize.js';
import { logger } from '../logger/index.js';

class Locations extends Model {}

Locations.init({
    city: {
        type: DataTypes.STRING,
        allowNull: false
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    freezeTableName: false,
    timestamps: false, 
    modelName: 'locations',
    sequelize
});

const findAllLocations = async () => {
    const res = await Locations.findAll({ where: {  } });
    if (res.length > 0) return res.map(el => el.dataValues);
    return;
};

const findAllDomesticsLocations = async () => {
    const res = await Locations.findAll({ where: { country: '🇺🇦' } });
    if (res.length > 0) return res.map(el => el.dataValues);
    return;
};

export {
    Locations,
    findAllLocations,
    findAllDomesticsLocations
};