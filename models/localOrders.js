import { Model, DataTypes } from "sequelize";
import { sequelize } from './sequelize.js';
import { logger } from '../logger/index.js';

class LocalOrders extends Model {}

LocalOrders.init({
    client: {
        type: DataTypes.STRING,
        allowNull: false
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false
    },
    pickup_location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    direction_location: {
        type: DataTypes.STRING,
        allowNull: true
    },
    driver: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    comment: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    price: {
        type: DataTypes.STRING,
        allowNull: true
    }

}, {
    freezeTableName: false,
    timestamps: true, 
    modelName: 'local-orders',
    sequelize
});

const createNewLocalOrder = async (client, pickup_location, city) => {
    let res;    
    try {
        res = await LocalOrders.create({ client, pickup_location, city });
        res = res.dataValues;
        console.log('RES:'+ res)
        logger.info(`Created LocalOrder with id: ${res.id}`);
    } catch (err) {
        logger.error(`Impossible to create LocalOrder: ${err}`);
    }
    return res;
};

const findLocalOrderById = async (id) => {
    const res = await LocalOrders.findOne({ where: { id } });
    if (res) return res.dataValues;
    return res;
};

const updateDriverLocalOrderById = async (id, driver) => {
    const res = await LocalOrders.update({ driver }, { where: { id } });
    if (res) logger.info(`Driver ${driver} get the local order ${id}`);
    return res[0] ? id : undefined;
};

const updateCommentLocalOrderById = async (id, comment) => {
    const res = await LocalOrders.update({ comment }, { where: { id } });
    return res[0] ? id : undefined;
};

const updateDirectionLocalOrderById = async (id, direction) => {
    const res = await LocalOrders.update({ direction_location: direction }, { where: { id } });
    return res[0] ? id : undefined;
};

const updatePickUpLocalOrderById = async (id, price) => {
    const res = await LocalOrders.update({ price }, { where: { id } });
    return res[0] ? id : undefined;
};

const updatePhoneLocalOrderById = async (id, phone) => {
    const res = await LocalOrders.update({ phone }, { where: { id } });
    return res[0] ? id : undefined;
};

export {
    LocalOrders,
    createNewLocalOrder,
    findLocalOrderById,
    updateDriverLocalOrderById,
    updateCommentLocalOrderById,
    updateDirectionLocalOrderById,
    updatePhoneLocalOrderById,
    updatePickUpLocalOrderById
};