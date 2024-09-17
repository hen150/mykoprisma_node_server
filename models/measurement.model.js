const mongoose = require('../common/services/mongoose.service').mongoose;
const Schema = mongoose.Schema;

const measSchema = new Schema({
    humidity: Number,
    co2: Number,
    temperature: Number,
    timestamp: Number,
    waterLevel: Number,
    device_id: Number,
    actuator0Status: Boolean,
    actuator1Status: Boolean,
    actuator2Status: Boolean,
    actuator3Status: Boolean,
    actuator4Status: Boolean,
    actuator5Status: Boolean
    
});

measSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
measSchema.set('toJSON', {
    virtuals: true
});


const Meas = mongoose.model('all_measurements', measSchema);



exports.list = (id) => {
	return Meas.find();
}

exports.new = (measData) => {
    const meas = new Meas(measData);
    return meas.save();
};

