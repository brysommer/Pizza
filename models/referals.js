import { Model, DataTypes } from "sequelize";
import { sequelize } from './sequelize.js';
import { logger } from '../logger/index.js';

class Referral extends Model {}
Referral.init({
    inviter_id: {  
        type: DataTypes.BIGINT,
        allowNull: false
    },
    invited_id: { 
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true
    },
    is_active: { 
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    joined_at: { 
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    freezeTableName: true,
    timestamps: false,
    modelName: 'referrals',
    sequelize
});

const addReferral = async (inviter_id, invited_id) => {
    try {
        const res = await Referral.create({ inviter_id, invited_id });
        return res.dataValues;
    } catch (err) {
        logger.error(`Referral creation failed: ${err}`);
        return null;
    }
};

const setReferralActive = async (invited_id, is_active = true) => {
    const res = await Referral.update({ is_active }, { where: { invited_id } });
    return res[0] > 0;
};

const getReferralsByInviter = async (inviter_id) => {
    const res = await Referral.findAll({ where: { inviter_id } });
    return res.map(el => el.dataValues);
};

const getInviterByUser = async (invited_id) => {
    const res = await Referral.findOne({ where: { invited_id } });
    return res?.dataValues;
};

const countReferrals = async (inviter_id, onlyActive = false) => {
    const where = { inviter_id };
    if (onlyActive) where.is_active = true;
    return await Referral.count({ where });
};

export {
    Referral,
    addReferral,
    setReferralActive,
    getReferralsByInviter,
    getInviterByUser,
    countReferrals
}