const MeasController = require('./controllers/measurement.controller.js');

const PresetController = require('./controllers/preset.controller.js');

const BufferController = require('./controllers/override.controller.js');

const PhotoController = require('./controllers/photo.controller.js');

const TimelapseController = require('./controllers/timelapse.controller.js');

const VidStreamController = require('./controllers/vidstream.controller.js');

const config = require('./common/config/env.config');




exports.routesConfig = function (app) {
    app.post('/setMeas', [
        MeasController.set
    ]);
    app.post('/setOverride', [
	BufferController.set
    ]);
  app.post('/vidStream', [
        VidStreamController.set
    ]);



    app.post('/setPhoto', [
        PhotoController.set
   ]);

    app.post('/setPreset', [
        PresetController.set
    ]);

    app.get('/getPreset', [
        PresetController.get
    ]);

    app.get('/getMeas', [
	MeasController.get
    ]);

//    app.get('/getTL', [
 //       TimelapseController.get
  //  ]);

    app.get('/getD', [
	MeasController.getScreen
    ]);

  /// app.get('/getCSV', [
    ///    MeasController.getCSV
    ///]);


    app.get('/getOverride', [
      BufferController.get
    ]);

};
