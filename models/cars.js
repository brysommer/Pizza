import { Model, DataTypes } from "sequelize";
import { sequelize } from './sequelize.js';
import { logger } from '../logger/index.js';

class Cars extends Model {}

Cars.init({
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    seats: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    scheme: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    freezeTableName: false,
    timestamps: false, 
    modelName: 'cars',
    sequelize
});

const findCarById = async (id) => {
    const res = await Cars.findOne({ where: { id } });
    if (res) return res.dataValues;
    return res;
};


export {
    Cars,
    findCarById
};