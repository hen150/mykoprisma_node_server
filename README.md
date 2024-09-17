# Mykoprisma Node.js Server

This REST API documentation provides an overview of the endpoints and functionality of the Mykoprisma Node.js server. The server interacts with an ESP32 device in a mushroom monitoring and control system and a locally hosted web server with a user interface (UI). The API facilitates the exchange of measurement data, manual control of actuators, and setting of preset conditions. The ESP32 periodically sends POST requests to the server at a set interval, exchanging new environmental data for actuator commands. The actuators on board the container include Fans (Actuator 1), Blue Lights (Actuator 2), UV Lights (Actuator 3), a Heater (Actuator 4), and an Atomizer (Actuator 5).

## Table of Contents

- [Routes](#routes)
- [Models](#models)
- [Controllers](#controllers)
- [Interacting with Locally Hosted Webserver](#interacting-with-locally-hosted-webserver)
- [Security and Data Handling](#security-and-data-handling)

### Preset, Actuator, and Override Overview

#### Preset

A **Preset** defines the target environmental conditions (e.g., humidity, CO2, temperature) for optimal mushroom growth. The system automatically adjusts actuators to maintain these conditions unless an override is set.

#### Actuator

An **Actuator** is a device (e.g., fan, heater) that adjusts the environment based on control signals. Actuator status is represented by a numerical value:

- `0`: Off
- `1`: On (operating normally)
- `2`: Override mode (manual control)

#### Override

An **Override** allows manual control of actuators, overriding preset conditions. This is useful for testing, maintenance, or specific adjustments. Overrides remain active until they are reset, allowing direct control of individual actuators as needed.

## Routes

The following routes are defined in the API:

- **POST `/setMeas`**: Used by the ESP32 to upload a new set of measurements and receive the current preset and override values merged together to update the actuators.
- **POST `/setOverride`**: Used by the UI to manually set the status of the actuators.
- **POST `/setPhoto`**: Used by the ESP32 to upload photos.
- **POST `/setPreset`**: Used by the UI to update the preset data in the database.
- **GET `/getPreset`**: Used by the UI to receive the current preset data from the database.
- **GET `/getMeas`**: Used by the UI to get measurement data from the database based on specified query parameters.
- **GET `/getOverride`**: Used by the UI to retrieve the current override data from the database.

## Models

### Measurement Model

A measurement is posted using the `/setMeas` endpoint. In this exchange, humidity, CO2, temperature, actuator status, and other relevant data are sent in JSON format. After receiving the measurement data, the server responds with the current preset and override data merged together. The measurement data is stored in a locally hosted MongoDB server using the following schema:

```javascript
measSchema = {
  humidity: Number,
  co2: Number,
  temperature: Number,
  timestamp: Number,
  waterLevel: Number,
  actuator0Status: Boolean,
  actuator1Status: Boolean,
  actuator2Status: Boolean,
  actuator3Status: Boolean,
  actuator4Status: Boolean,
  actuator5Status: Boolean
}
