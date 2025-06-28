const axios = require('axios');
const captainmodel = require('../models/captain.model');

module.exports.getAddressCoordinate=async(address)=>{
    const apiKey = process.env.ORS_MAPS_API;
    const url = `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(address)}`;

    try {
        const response = await axios.get(url);
        if (response.data && response.data.features && response.data.features.length > 0) {
            const coordinates = response.data.features[0].geometry.coordinates;
            return { ltd: coordinates[1], lng: coordinates[0] };
        } else {
            throw new Error('No coordinates found for the given address');
        }
    } catch (error) {
        console.error('Error fetching coordinates:', error.message);
        throw error;
    }
}


 const getCoordinatesFromName = async (place) => {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(place)}&limit=1`;
    const res = await axios.get(url);
    if (res.data.features && res.data.features.length > 0) {
      const [lng, lat] = res.data.features[0].geometry.coordinates;
      return [lng, lat];
    } else {
      throw new Error(`Location not found: ${place}`);
    }
  };

  module.exports.getCoordinatesFromName = getCoordinatesFromName;


module.exports.getDistanceAndTime = async (origin, destination) => {
  if (!origin || !destination) {
    throw new Error('Origin and destination are required');
  }

  const apiKey = process.env.ORS_MAPS_API;
  if (!apiKey) {
    throw new Error('ORS API key is missing');
  }

  const isCoordinates = (str) => /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(str.trim());

  

  const formatDistance = (meters) => {
    const km = meters / 1000;
    return {
      text: `${km.toFixed(2)} km`,
      value: Math.round(meters)
    };
  };

  const formatDuration = (seconds) => {
    let sec = Math.round(seconds);
    const days = Math.floor(sec / 86400);
    sec %= 86400;
    const hours = Math.floor(sec / 3600);
    sec %= 3600;
    const minutes = Math.floor(sec / 60);

    let text = '';
    if (days > 0) text += `${days} day${days > 1 ? 's' : ''} `;
    if (hours > 0) text += `${hours} hr${hours > 1 ? 's' : ''} `;
    if (minutes > 0) text += `${minutes} min`;

    return {
      text: text.trim(),
      value: Math.round(seconds)
    };
  };

  try {
    const [startLon, startLat] = isCoordinates(origin)
      ? origin.split(',').map(Number)
      : await getCoordinatesFromName(origin);

    const [endLon, endLat] = isCoordinates(destination)
      ? destination.split(',').map(Number)
      : await getCoordinatesFromName(destination);

    const body = {
      coordinates: [
        [startLon, startLat],
        [endLon, endLat]
      ]
    };

    const response = await axios.post(
      'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
      body,
      {
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data?.features?.length > 0) {
      const summary = response.data.features[0].properties.summary;
      return {
        distance: formatDistance(summary.distance),
        duration: formatDuration(summary.duration)
      };
    } else {
      throw new Error('No route found in ORS response');
    }

  } catch (error) {
    console.error('🔥 Error:', error.message);
    throw new Error('Distance and time not found');
  }
};



module.exports.getAutoCompleteSuggestions = async (input) => {
  if (!input || input.length < 3) {
    throw new Error('Input must be at least 3 characters long');
  }

  const apiKey = process.env.ORS_MAPS_API;
  if (!apiKey) {
    throw new Error('ORS API key is missing');
  }

  const url = `https://api.openrouteservice.org/geocode/autocomplete?api_key=${apiKey}&text=${encodeURIComponent(input)}`;

  try {
    const response = await axios.get(url);
    if (response.data && response.data.features && response.data.features.length > 0) {
      return response.data.features.map(feature => ({
        name: feature.properties.label,
        coordinates: feature.geometry.coordinates
      }));
    } else {
      throw new Error('No suggestions found for the given input');
    }
  } catch (error) {
    console.error('Error fetching suggestions:', error.message);
    throw error;
  }
};









module.exports.getcaptainsintheradius=async (ltd, lng, radius) => {
  if (!ltd || !lng || !radius) {
    throw new Error('Latitude, longitude, and radius are required');
  }
  //radius is in kilometers
  const apiKey = process.env.ORS_MAPS_API;
  if (!apiKey) {
    throw new Error('ORS API key is missing');
  }
  // const url = `https://api.openrouteservice.org/v2/pois?api_key=${apiKey}&point.lat=${ltd}&point.lon=${lng}&radius=${radius}`;
  const captains=await captainmodel.find({
    location: {
      $geoWithin: {
        $centerSphere: [[lng, ltd], radius / 6378.1]
      }
    }
  });
  return captains;
}



