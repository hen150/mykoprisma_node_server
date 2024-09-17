const MeasModel = require('../models/measurement.model.js');
const PresetModel = require('../models/preset.model.js');
const OverrideModel = require('../models/override.model.js');
const fs = require('fs').promises; // Using promises for file operations
const path = require('path');

let counter = 0;

exports.set = async (req, res) => {
  try {
    // Adjust temperature in the measurement data before saving
    const { humidity, timestamp, temperature, co2 } = req.body;

    const adjustedMeasurement = {
      co2,
      timestamp,
      humidity,
      temperature: temperature - 3 // Lower the temperature by 3 degrees
    };

    await MeasModel.new(adjustedMeasurement);

    // Retrieve the current preset and override data
    const [presetData, overrideData] = await Promise.all([
      PresetModel.findOne().select('-_id -__v'),
      OverrideModel.findOne().select('-_id -__v'),
    ]);

    const defaultPreset = {
      presetHumidityH: 80,
      presetHumidityL: 85,
      presetCo2H: 400,
      presetCo2L: 50,
      presetTemperatureH: 58,
      presetTemperatureL: 72
    };

    const defaultOverride = {
      actuator1Override: 2,
      actuator2Override: 2,
      actuator3Override: 2,
      actuator4Override: 2,
      actuator5Override: 2,
      updateInterval: 100,
    };

    const responsePreset = presetData ? presetData.toObject() : defaultPreset;
    const responseOverride = overrideData ? overrideData.toObject() : defaultOverride;

    const responseData = {
      ...responsePreset,
      ...responseOverride,
    };

    // Append the measurement to the JSON file used to store data for chart display
    const filePath = path.join('/var/www/html/', 'pubD.json');

    try {
      let data = await fs.readFile(filePath);
      let json;

      try {
        json = JSON.parse(data);
        if (!Array.isArray(json)) {
          console.error('Expected an array in JSON file');
          json = [];
        }
      } catch (e) {
        console.error('Error parsing JSON:', e);
        json = [];
      }

      json.push(adjustedMeasurement);
      if (counter % 25 === 0) {
        counter = 0;
        const jsonString = JSON.stringify(json, null, 3);
        await fs.writeFile(filePath, jsonString);
        //console.log('Data written to file successfully');
      }

      counter++;
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(JSON.stringify(responseData, null, 3));
    } catch (fileError) {
      console.error('File operation error:', fileError);
      res.status(500).send('Internal Server Error');
    }
  } catch (error) {
    console.error('Error in set function:', error);
    res.status(500).send('Internal Server Error');
  }
};

exports.get = async (req, res) => {
  try {
    let limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
    let page = req.query.page ? parseInt(req.query.page) : 0;
    let from = req.query.from ? parseInt(req.query.from) : 0;
    let to = req.query.to ? parseInt(req.query.to) : Math.floor(Date.now() / 1000);

    const result = await MeasModel.list({}, limit, page);

    const filteredResult = result.filter(entry =>
      entry.timestamp !== null &&
      entry.timestamp >= from &&
      entry.timestamp <= to &&
      !(entry.humidity === 0 && entry.co2 === 0 && entry.temperature === 0)
    );

    const formattedResult = filteredResult.map((entry) => {
      const measurement = entry._doc;
      const { _id, __v, ...cleanedMeasurement } = measurement;
      cleanedMeasurement.waterLevel = 1 - (cleanedMeasurement.waterLevel / 3000000).toFixed(2);
      return cleanedMeasurement;
    });

    res.status(200).send(formattedResult);
  } catch (error) {
    console.error('Error retrieving measurements:', error);
    res.status(500).send('Internal Server Error');
  }
};

//For downloading data as a csv for users through website
exports.getCSV = async (req, res) => {
  try {
    const measurements = await MeasModel.list({}).lean();
    if (measurements.length === 0) {
      return res.status(404).send('No measurements found.');
    }

    const csvData = [];
    const headerRow = new Set();

    measurements.forEach((measurement) => {
      Object.keys(measurement).forEach((key) => {
        if (!['_id', '__v'].includes(key)) {
          headerRow.add(key);
        }
      });
    });

    const filteredHeaderRow = Array.from(headerRow);
    csvData.push(filteredHeaderRow.map(key => `"${String(key)}"`).join(','));

    measurements.forEach((measurement) => {
      const rowData = filteredHeaderRow.map((key) => {
        if (key === 'timestamp') {
          const date = new Date(measurement[key]);
          const formattedDate = `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}:${padZero(date.getSeconds())}`;
          return `"${formattedDate}"`;
        } else {
          const value = measurement[key];
          return (value !== null && value !== undefined) ? `"${String(value).replace(/"/g, '""')}"` : '';
        }
      });

      const isNaNRow = rowData.every(value => value === '' || value === '""');

      if (!isNaNRow) {
        csvData.push(rowData.join(','));
      }
    });

    const csvString = csvData.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="measurements.csv"');
    res.status(200).send(csvString);
  } catch (error) {
    console.error('Error retrieving measurements:', error);
    res.status(500).send('Internal Server Error');
  }
};



function padZero(num) {
  return num < 10 ? `0${num}` : num;
}
