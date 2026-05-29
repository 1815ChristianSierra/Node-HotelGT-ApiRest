const config = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "csierrae1815_HotelLaravel",
    password: process.env.DB_PASSWORD || "!l3$DrvYn3tg8Sgk",
    database: process.env.DB_NAME || "csierrae1815_Hotel_Laravel",
    port: process.env.DB_PORT || 3306
};

module.exports = config;


/*const config = {
    host: "localhost",
    user: "root",
    password: "",
    database: "hotel_laravel",
    port: 3306
};

module.exports = config;
*/
