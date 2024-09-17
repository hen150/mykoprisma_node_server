const mongoose = require('../common/services/mongoose.service').mongoose;
const Schema = mongoose.Schema;

const presetSchema = new Schema({
    presetHumidityL: Number,
    presetHumidityH: Number,
    presetCo2L: Number,
    presetC2H: Number,
    presetTemperatureL: Number,
    presetTemperatureH: Number,
    presetBlueLight: Number,
    presetUVLight: Number,

});

presetSchema.set('toJSON', {
    virtuals: true
});

const PresetModel = mongoose.model('preset_buffer', presetSchema);

// Function to set the override buffer
PresetModel.set = async function (input) {
    try {
        console.log("Attempting to set presets...");
        // Check if there's an existing entry, if yes, remove it
        await PresetModel.deleteMany({});
        console.log("Deleted existing presets.");

        // Create a new entry with the provided override data
        await PresetModel.create(input);
        console.log("Presets set successfully.");
        return true;
    } catch (error) {
        console.error("Error changing preset", error);
        return false;
    }
};

// Function to get the override buffer
PresetModel.get = async function () {
    try {
        console.log("Attempting to retrieve presets...");
        // Find the latest entry (there should be only one)
        const presets = await PresetModel.findOne({});
        console.log("Presets retrieved successfully.");
        return presets;
    } catch (error) {
        console.error("Error retrieving presets", error);
        return null;
    }
};

module.exports = PresetModel;
