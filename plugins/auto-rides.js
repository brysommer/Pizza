import { createRide, findAllTodayRides, updateSeatByRideID } from "../models/rides.js"
import { createNewSeatBycarId, updateSeatById } from "../models/seats.js";


const autoRides = async () => {
    
    const currentDate = new Date();    
    const currentDay = currentDate.getDate();

    const futureDate = new Date(currentDate);
    futureDate.setDate(currentDate.getDate() + 3);

    const rides = await findAllTodayRides(currentDay);

    for (let ride of rides) {
        console.log(ride);
        const rideData = {
            route_id: ride.route_id,
            car_id: ride.car_id,
            seats_id: 0,
            price: ride.price,
            time: ride.time,
            date: futureDate.getDate(),
            month: futureDate.getMonth() + 1,
            year: futureDate.getFullYear(),
        }
        console.log(rideData);
        const newRide = await createRide(rideData);

        console.log(newRide);

        const seat = await createNewSeatBycarId(newRide.car_id, newRide.id);

        await updateSeatByRideID(newRide.id, seat.id);
    }
}


export default autoRides;