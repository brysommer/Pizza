import { Model, DataTypes } from "sequelize";
import { sequelize } from './sequelize.js';
import { logger } from '../logger/index.js';

class Cities extends Model {}

Cities.init({
    city: {
        type: DataTypes.STRING,
        allowNull: false
    },
    emoji: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    freezeTableName: false,
    timestamps: false, 
    modelName: 'cities',
    sequelize
});

const findAllCities = async () => {
    const res = await Cities.findAll({ where: {  } });
    if (res.length > 0) return res.map(el => el.dataValues);
    return;
};

const findCityById = async (id) => {
    const res = await Cities.findOne({ where: { id } });
    if (res) return res.dataValues;
    return res;
};

export {
    Cities,
    findAllCities,
    findCityById
};