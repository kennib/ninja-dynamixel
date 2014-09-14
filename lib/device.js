var stream = require('stream')
  , util = require('util');

// Give our device a stream interface
util.inherits(Device,stream);

// Export it
module.exports=Device;

/**
 * Creates a new Device Object
 *
 * @property {Boolean} readable Whether the device emits data
 * @property {Boolean} writable Whether the data can be actuated
 *
 * @property {Number} G - the channel of this device
 * @property {Number} V - the vendor ID of this device
 * @property {Number} D - the device ID of this device
 *
 * @property {Function} write Called when data is received from the Ninja Platform
 *
 * @fires data - Emit this when you wish to send data to the Ninja Platform
 */
function Device(motor) {
  var self = this;

  // Reset the motor's settings
  this.motor = motor;
  this.motor.setRegisterValue("maxTorque", 1023);
  this.motor.setRegisterValue("movingSpeed", 50);
  this.motor.setRegisterValue("torqueEnable", 0);

  // This device will emit data
  this.readable = true;
  // This device can be actuated
  this.writeable = true;

  this.G = motor.getID()+10000; // G is a string a represents the channel
  this.V = 0; // 0 is Ninja Blocks' device list
  this.D = 2000; // 2000 is a generic Ninja Blocks sandbox device

  process.nextTick(function() {
    // Watch for changes in motor position
    self.motor.on("valueUpdated",function(d){
      if (d.name == 'presentPosition')
        self.emit('data', d.value);
    });
  });
};

/**
 * Called whenever there is data from the Ninja Platform
 * This is required if Device.writable = true
 *
 * @param  {String} data The data received
 */
Device.prototype.write = function(data) {
  // Actuate motors
  this.motor.setRegisterValue("goalPosition", data);
};
