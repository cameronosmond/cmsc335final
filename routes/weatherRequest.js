const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const mongoUri = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.he0peyp.mongodb.net/weatherapp?retryWrites=true&w=majority&appName=Cluster0`;

/* Including Weather model */
const Weather = require("../model/Weather.js");

/* router is like a mini application
   endpoint that processes anything that
   starts with /processRequest
*/

/* We can add our own middleware that only
   applies to weather requests */


// http://localhost:5001/processRequest/
router.get("/", async (req, res) => {

    const { location, favorite } = req.query;

    let city = "";
    if (location.includes("College Park")) {
        city = "College Park";
    } else if (location.includes("Boonsboro")) {
        city = "Boonsboro";
    } else if (location.includes("Utica")) {
        city = "Utica";
    } else {
        city = "Astoria";
    }
    
    const variables = {
        loc: location,
        temp: "",
        feelsLike: "",
        windSpeed: ""
    }

    try {

        await mongoose.connect(mongoUri);

        if (favorite === "yes") { // if adding to favorites
            const alreadyThere = await Weather.findOne({ location: location });
            if (!alreadyThere) {
                await Weather.create({ location: location });
            }
        }

        let lat = "";
        let lon = "";
        // access lat and lon, then use to get weather data
        const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${process.env.API_KEY}`;
        const response = await fetch(geoUrl);
        if (!response.ok) {
            throw new Error(`Geo api error: ${response.status}`);
        }
        const data = await response.json();
        lat = data?.[0]?.lat;
        lon = data?.[0]?.lon;

        if (lat === "" || lon === "") {
            console.error("lat and lon not fetched properly");
        }

        let theTemp, theFeelsLike, theWindSpeed = "";
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.API_KEY}&units=imperial`;
        const wResponse = await fetch(weatherUrl);
        if (!wResponse.ok) {
            throw new Error(`Weather api error: ${wResponse.status}`);
        }
        const wData = await wResponse.json();
        theTemp = wData.main.temp;
        theFeelsLike = wData.main.feels_like;
        theWindSpeed = wData.wind.speed;

        variables.temp = theTemp;
        variables.feelsLike = theFeelsLike;
        variables.windSpeed = theWindSpeed;
    } catch(err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }

    res.render("processRequest", variables);
});

// http://localhost:5001/processRequest/favorites
router.get("/favorites", (req, res) => {

    const variables = { favorites: "<ul>" };

    (async () => {
    try {
        await mongoose.connect(mongoUri);

        /* Retrieving all favorites */
        const favs = await Weather.find({});

        favs.forEach((element) => variables.favorites += `<li>${element.location}</li>`);
        variables.favorites += "</ul>";
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();

        if (variables.favorites === "<ul></ul>") {
            variables.favorites = "None";
        }

        res.render("favorites", variables);
    }
    })();
});

// http://localhost:5001/processRequest/notValid
router.use((request, response) => {
    response.status(404).send("Resource Not Found (in weatherRequest router)");
});
 
 
module.exports = router;