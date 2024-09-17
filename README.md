
# Mykoprisma Node.js Server

This REST API documentation provides an overview of the endpoints and functionality of the Mykoprisma Node.js server. The server interacts with an ESP32 device in a mushroom monitoring and control system and a locally hosted web server with a user interface (UI). The API facilitates the exchange of measurement data, manual control of actuators, and setting of preset conditions. The ESP32 periodically sends POST requests to the server at a set interval, exchanging new environmental data for actuator commands. The actuators on board the container include Fans (Actuator 1), Blue Lights (Actuator 2), UV Lights (Actuator 3), a Heater (Actuator 4), and an Atomizer (Actuator 5).

## Table of Contents

- [Preset, Actuator, and Override Overview](#preset-actuator-and-override-overview)
- [Routes](#routes)
- [Models](#models)
  - [Measurement Model](#measurement-model)
  - [Override Model](#override-model)
  - [Preset Model](#preset-model)
  - [Photo Model](#photo-model)
- [Controllers](#controllers)
  - [Measurement Controller](#measurement-controller)
  - [Override Controller](#override-controller)
  - [Photo Controller](#photo-controller)
  - [Preset Controller](#preset-controller)
- [Interacting with Locally Hosted Webserver](#interacting-with-locally-hosted-webserver)
- [Security and Data Handling](#security-and-data-handling)
- [Dependencies](#dependencies)

## Preset, Actuator, and Override Overview

### Preset

A **Preset** defines the target environmental conditions (e.g., humidity, CO2, temperature) for optimal mushroom growth. The system automatically adjusts actuators to maintain these conditions unless an override is set.

### Actuator

An **Actuator** is a device (e.g., fan, heater) that adjusts the environment based on control signals. Actuator status is represented by a numerical value:

- `0`: Off
- `1`: On (operating normally)
- `2`: Override mode (manual control)

### Override

An **Override** allows manual control of actuators, overriding preset conditions. This is useful for testing, maintenance, or specific adjustments. Overrides remain active until they are reset, allowing direct control of individual actuators as needed.

## Routes

The following routes are defined in the API:

- **POST `/setMeas`**: Used by the ESP32 to upload a new set of measurements and receive the current preset and override values merged together to update the actuators.
- **POST `/setOverride`**: Used by the UI to manually set the status of the actuators.
- **POST `/setPhoto`**: Used by the ESP32 to upload photos and detect mushrooms in the image.
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
```

### Override Model

An Override is used to manually set the status of an actuator or take pictures. The override data is stored in the MongoDB database, and the next time a measurement is posted, the server will respond with the updated override statuses.

The override data is stored using the following schema:

```javascript
overrideSchema = {
  actuator0Override: Integer,
  actuator1Override: Integer,
  actuator2Override: Integer,
  actuator3Override: Integer,
  actuator4Override: Integer,
  actuator5Override: Integer,
  photoOverride: Integer
}
```

### Preset Model

A Preset is a set of defined environmental conditions, such as humidity, CO2 levels, and temperature. Once a preset is set, it is stored in the database and accessed by the ESP32. The ESP applies the preset values unless an override is active.

The preset data is stored using the following schema:

```javascript
presetSchema = {
  humidity: Number,
  co2: Number,
  temperature: Number
}
```

### Photo Model

Photos are processed and stored with a timestamp for identification.

## Controllers

### Measurement Controller

- **POST `/setMeas`**: Uploads a new set of measurements and returns the current preset and override values merged together. The ESP exchanges its own measurements for commands from the server with this POST request. The response will have a structured JSON response with current preset and override data.
- **GET `/getMeas`**: Retrieves measurement data from the database based on specified query parameters, such as from, to, limit, and page.

### Override Controller

- **POST `/setOverride`**: Manually sets the status of the actuators. They can be set individually or all together.
- **GET `/getOverride`**: Retrieves the current override data from the database.

### Photo Controller

- **POST `/setPhoto`**: Processes the uploaded photo, detects mushrooms, draws a circle around them, and saves the result. The radius of the detected mushrooms is included in the response.

### Preset Controller

- **POST `/setPreset`**: Sets the new preset data in the database.
- **GET `/getPreset`**: Retrieves the current preset data from the database.

## Interacting with Locally Hosted Webserver

### JSON File Usage and Downsampling

To optimize the rendering of large datasets on the frontend, the application leverages downsampling. The backend API stores data in a JSON file (`pubD.json`) rather than directly exposing the API, providing several benefits:

- **Backend Security**: The backend API is not publicly accessible; only the ESP32 is whitelisted through the server's firewall. This prevents unauthorized access and enhances security.
- **Performance Optimization**: Large datasets can overwhelm charting libraries like Chart.js. Downsampling ensures only a manageable number of data points are loaded based on the time frame.
- **Responsive Downsampling**: Frontend JavaScript handles dynamic downsampling, adjusting the number of data points displayed based on the selected timeframe:
  - **Narrow Time Frame**: Displays more data points for detailed insights.
  - **Wide Time Frame**: Displays fewer data points to maintain readability and performance.

The JSON file is regularly updated with the most recent measurements, and the backend periodically saves data points to this file. This ensures smooth navigation through historical data on the UI.

## Security and Data Handling

The server's backend API is secured by a firewall that only allows communication from the ESP32 device, which is whitelisted. This setup prevents unauthorized access, ensuring that the API is not publicly accessible. All measurement, preset, and override data is securely handled and exchanged between the ESP32 and the server using structured JSON payloads, making the system robust and secure.

## Dependencies

Ensure you have the required modules installed:

```bash
npm install express body-parser canvas date-fns opencv4nodejs
```

This setup will efficiently detect mushrooms, draw a circle around them, and provide a radius output.
