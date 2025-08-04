import { DataTypes, Model } from 'sequelize'
import { sequelize } from './sequelize.js'

class Prices extends Model {}

Prices.init(
	{
		basePrice: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		distancePrice: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	},
	{
		freezeTableName: false,
		timestamps: false,
		modelName: 'prices',
		sequelize,
	}
);

const findPrices = async () => {
	const res = await Prices.findOne({});
    
	if (res) return res.dataValues;
	return res;
};

export {
    findPrices,
    Prices
}

