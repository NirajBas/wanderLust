// Single source of truth for listing categories (used by the model, Joi schema and views).
// `icon` is a Font Awesome 7 class.
const categories = [
    { name: "Trending",      icon: "fa-solid fa-fire" },
    { name: "Rooms",         icon: "fa-solid fa-bed" },
    { name: "Iconic Cities", icon: "fa-solid fa-mountain-city" },
    { name: "Mountains",     icon: "fa-solid fa-mountain" },
    { name: "Castles",       icon: "fa-brands fa-fort-awesome" },
    { name: "Amazing Pools", icon: "fa-solid fa-person-swimming" },
    { name: "Camping",       icon: "fa-solid fa-campground" },
    { name: "Farms",         icon: "fa-solid fa-cow" },
    { name: "Arctic",        icon: "fa-regular fa-snowflake" },
    { name: "Domes",         icon: "fa-solid fa-igloo" },
    { name: "Boats",         icon: "fa-solid fa-sailboat" },
];

const categoryNames = categories.map(c => c.name);

module.exports = { categories, categoryNames };
