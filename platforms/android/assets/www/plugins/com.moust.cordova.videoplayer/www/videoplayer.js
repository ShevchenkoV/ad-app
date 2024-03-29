cordova.define("com.moust.cordova.videoplayer.VideoPlayer", function(require, exports, module) { var exec = require("cordova/exec");

module.exports = {

    DEFAULT_OPTIONS: {
        volume: 1.0,
        scalingMode: 1
    },

    SCALING_MODE: {
        SCALE_TO_FIT: 1,
        SCALE_TO_FIT_WITH_CROPPING: 2
    },

    play: function (path, options, errorCallback) {
        options = this.merge(this.DEFAULT_OPTIONS, options);
        exec(null, errorCallback, "VideoPlayer", "play", [path, options]);
    },

    merge: function () {
        var obj = {};
        Array.prototype.slice.call(arguments).forEach(function(source) {
            for (var prop in source) {
                obj[prop] = source[prop];
            }
        });
        return obj;
    }

};
});
