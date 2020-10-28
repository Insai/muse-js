'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.MUSE_SERVICE = 0xfe8d;
// TODO: clean up redundant uuids constants
exports.MUSE_GATT_ATTR_STREAM_TOGGLE = '273e0001-4c4d-454d-96be-f03bac821358';
exports.CONTROL_CHARACTERISTIC = '273e0001-4c4d-454d-96be-f03bac821358';
exports.MUSE_GATT_ATTR_TELEMETRY = '273e000b-4c4d-454d-96be-f03bac821358';
exports.TELEMETRY_CHARACTERISTIC = '273e000b-4c4d-454d-96be-f03bac821358';
exports.MUSE_GATT_ATTR_GYRO = '273e0009-4c4d-454d-96be-f03bac821358';
exports.GYROSCOPE_CHARACTERISTIC = '273e0009-4c4d-454d-96be-f03bac821358';
exports.MUSE_GATT_ATTR_ACCELEROMETER = '273e000a-4c4d-454d-96be-f03bac821358';
exports.ACCELEROMETER_CHARACTERISTIC = '273e000a-4c4d-454d-96be-f03bac821358';
// EEG
exports.MUSE_GATT_ATTR_TP9 = '273e0003-4c4d-454d-96be-f03bac821358';
exports.MUSE_GATT_ATTR_AF7 = '273e0004-4c4d-454d-96be-f03bac821358';
exports.MUSE_GATT_ATTR_AF8 = '273e0005-4c4d-454d-96be-f03bac821358';
exports.MUSE_GATT_ATTR_TP10 = '273e0006-4c4d-454d-96be-f03bac821358';
exports.MUSE_GATT_ATTR_RIGHTAUX = '273e0007-4c4d-454d-96be-f03bac821358';
exports.EEG_FREQUENCY = 256;
exports.EEG_SAMPLES_PER_READING = 12;
exports.EEG_CHARACTERISTICS = [
    exports.MUSE_GATT_ATTR_TP9,
    exports.MUSE_GATT_ATTR_AF7,
    exports.MUSE_GATT_ATTR_AF8,
    exports.MUSE_GATT_ATTR_TP10,
    exports.MUSE_GATT_ATTR_RIGHTAUX,
];
// PPG
exports.MUSE_GATT_ATTR_PPG1 = '273e000f-4c4d-454d-96be-f03bac821358';
exports.MUSE_GATT_ATTR_PPG2 = '273e0010-4c4d-454d-96be-f03bac821358';
exports.MUSE_GATT_ATTR_PPG3 = '273e0011-4c4d-454d-96be-f03bac821358';
exports.PPG_FREQUENCY = 64;
exports.PPG_SAMPLES_PER_READING = 6;
exports.PPG_CHARACTERISTICS = [exports.MUSE_GATT_ATTR_PPG1, exports.MUSE_GATT_ATTR_PPG2, exports.MUSE_GATT_ATTR_PPG3];
exports.MUSE_ACCELEROMETER_SCALE_FACTOR = 0.0000610352;
exports.MUSE_GYRO_SCALE_FACTOR = 0.0074768;
exports.MUSE_SCAN_TIMEOUT = 10.5;
exports.AUTO_DISCONNECT_DELAY = 3;
//# sourceMappingURL=constants.js.map