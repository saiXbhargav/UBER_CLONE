export const VEHICLES = {
  car: {
    id: 'car',
    name: 'RideX Go',
    seats: 4,
    tagline: 'Affordable, compact rides',
    image: '/vehicles/car.svg',
  },
  auto: {
    id: 'auto',
    name: 'Auto',
    seats: 3,
    tagline: 'Quick autos for short trips',
    image: '/vehicles/auto.svg',
  },
  moto: {
    id: 'moto',
    name: 'Moto',
    seats: 1,
    tagline: 'Beat the traffic on two wheels',
    image: '/vehicles/moto.svg',
  },
};

export const VEHICLE_LIST = Object.values(VEHICLES);

export const getVehicle = (type) => VEHICLES[type] || (type === 'motorcycle' ? VEHICLES.moto : VEHICLES.car);
