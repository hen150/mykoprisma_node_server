const mongoose = require('../common/services/mongoose.service').mongoose;
const Schema = mongoose.Schema;

const bufferSchema = new Schema({
    actuator0Override: Number,
    actuator1Override: Number,
    actuator2Override: Number,
    actuator3Override: Number,
    actuator4Override: Number,
    actuator5Override: Number,
    updateInterval: Number,
    maxWaterTime: Number,
});

bufferSchema.set('toJSON', {
    virtuals: true
});

const BufferModel = mongoose.model('override_buffer', bufferSchema);

// Function to set the override buffer
BufferModel.set = async function (overrideData) {
    try {
        // Check if there's an existing entry, if yes, remove it
        await BufferModel.deleteMany({});

        // Create a new entry with the provided override data
        await BufferModel.create(overrideData);
        return true;
    } catch (error) {
        console.error("Error setting override buffer:", error);
        return false;
    }
};

// Function to get the override buffer
BufferModel.get = async function () {
    try {
        // Find the latest entry (there should be only one)
        const overrideBuffer = await BufferModel.findOne({});
        return overrideBuffer;
    } catch (error) {
        console.error("Error getting override buffer:", error);
        return null;
    }
};

module.exports = BufferModel;
