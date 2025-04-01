import { Model, DataTypes } from "sequelize";
import { sequelize } from './sequelize.js';
import { logger } from '../logger/index.js';


class Driver extends Model {}
Driver.init({
    chat_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    registration_number: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },

}, {
    freezeTableName: false,
    timestamps: false,
    modelName: 'drivers',
    sequelize
});


const createNewDriverByChatId = async (chat_id) => {
    let res;
    try {
        res = await Driver.create({ chat_id });
        res = res.dataValues;
        logger.info(`Created driver with id: ${res.id}`);
    } catch (err) {
        logger.error(`Impossible to create driver: ${err}`);
    }
    return res;
};


const findDriverByChatId = async (chat_id) => {
    const res = await Driver.findOne({ where: { chat_id } });
    if (res) return res.dataValues;
    return res;
};

export {
    Driver,
    createNewDriverByChatId,
    findDriverByChatId
};   