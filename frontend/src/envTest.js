// This file is used to test if environment variables are being loaded correctly
console.log("Environment variables test:");
console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);
console.log("All env variables:", import.meta.env); 