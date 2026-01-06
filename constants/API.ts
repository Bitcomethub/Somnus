// NOTE: 'tingle.railway.internal' is for internal communication only.
// For the mobile app to reach the backend, you need the Public Domain from Railway.
// It usually looks like: https://tingle-production.up.railway.app

const productionURL = 'https://somnus-production.up.railway.app'; // Replace with your actual Railway Public Domain
const localURL = 'http://localhost:8080';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || productionURL;

console.log('Tingle API URL:', API_URL);
