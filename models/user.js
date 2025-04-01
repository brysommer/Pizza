import { Model, DataTypes } from "sequelize";
import { sequelize } from './sequelize.js';
import { logger } from '../logger/index.js';


class User extends Model {}
User.init({
    chat_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true
    },
    favorite_city: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    dialogue_status: {
        type: DataTypes.STRING,
        allowNull: true
    },

}, {
    freezeTableName: false,
    timestamps: true,
    modelName: 'users',
    sequelize
});

const createNewUser = async (userData) => {
    let res;
    try {
        res = await User.create({ ...userData });
        res = res.dataValues;
        //logger.info(`Created user with id: ${res.id}`);
    } catch (err) {
        //logger.error(`Impossible to create user: ${err}`);
    }
    return res;
};

const createNewUserByChatId = async (chat_id) => {
    let res;
    try {
        res = await User.create({ chat_id });
        res = res.dataValues;
        logger.info(`Created user with id: ${res.id}`);
    } catch (err) {
        logger.error(`Impossible to create user: ${err}`);
    }
    return res;
};

const updateUserByChatId = async (chat_id, updateParams) => {
    const res = await User.update({ ...updateParams } , { where: { chat_id } });
    if (res[0]) {
        const data = await findUserByChatId(chat_id);
        if (data) {
            logger.info(`User ${data.chat_id} updated`);
            return data;
        }
        logger.info(`User ${chat_id} updated, but can't read result data`);
    } 
    return undefined;
};

const updateDiaulogueStatus = async (chat_id, dialogue_status) => {
    const res = await User.update({ dialogue_status }, { where: { chat_id } });
    return res[0] ? res[0] : undefined;
};

const userLogout = async (chat_id) => {
    const res = await User.update({ isAuthenticated: false }, { where: { chat_id } });
    if (res) logger.info(`Channel ${chat_id} logging out`);
    return res[0] ? chat_id : undefined;
};


const findUserById = async (id) => {
    const res = await User.findAll({ where: { id: id } });
    if (res.length > 0) return res.map(el => el.dataValues);
    return;
};

const findUsersByStatus = async (isAuthenticated) => {
    const res = await User.findAll({ where: { isAuthenticated } });
    if (res.length > 0) return res.map(el => el.dataValues);
    return;
};

const findUserByChatId = async (chat_id) => {
    const res = await User.findOne({ where: { chat_id: chat_id } });
    if (res) return res.dataValues;
    return res;
};

const findUserByPhone = async (phone) => {
    const res = await User.findOne({ where: { phone } });
    if (res) return res.dataValues;
    return res;
};

export {
    User,
    createNewUser,
    updateUserByChatId,
    updateDiaulogueStatus,
    userLogout,
    findUserById,
    findUsersByStatus,
    findUserByChatId,
    createNewUserByChatId,
    findUserByPhone
};   