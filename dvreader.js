function DVReader(dv, littleEndian) {
  this.dv = dv;
  this.pos = 0;
  this.littleEndian = !!littleEndian;

  // helper to incorporate littleEndian default value (set in
  // constructor) and the littleEndian parameter passed to each reader
  // function. For consistency with the DataView API, passing true to
  // any reader function will cause littleEndian to be used for that
  // function. Otherwise, the value passed to the constructor will be
  // used. This means that if you pass a truthy value for littleEndian
  // in the constructor, you will have to pass false (NOT undefined)
  // to the reader functions in order to force big endian reading.
  var self = this;
  this.__defaultEndian = function (le) {
    if (le) { return true; }
    if (typeof le === "undefined") {
      return self.littleEndian;
    }
    return false;
  }
};

DVReader.prototype.getInt8 = function () {
  return this.dv.getInt8(this.pos++);
};

DVReader.prototype.getUint8 = function () {
  return this.dv.getUint8(this.pos++);
};

DVReader.prototype.getInt16 = function (littleEndian) {
  this.pos += 2;
  return this.dv.getInt16(this.pos-2, this.__defaultEndian(littleEndian));
};

DVReader.prototype.getUint16 = function (littleEndian) {
  this.pos += 2;
  return this.dv.getUint16(this.pos-2, this.__defaultEndian(littleEndian));
};

DVReader.prototype.getInt32 = function (littleEndian) {
  this.pos += 4;
  return this.dv.getInt32(this.pos - 4, this.__defaultEndian(littleEndian));
};

DVReader.prototype.getUint32 = function (littleEndian) {
  this.pos += 4
  return this.dv.getUint32(this.pos - 4, this.__defaultEndian(littleEndian));
};

DVReader.prototype.getFloat32 = function (littleEndian) {
  this.pos += 4;
  return this.dv.getFloat32(this.pos - 4, this.__defaultEndian(littleEndian));
};

DVReader.prototype.getFloat64 = function (littleEndian) {
  this.pos += 8;
  return this.dv.getFloat64(this.pos - 8, this.__defaultEndian(littleEndian));
};

DVReader.prototype.skip = function (n) {
  this.pos += n;
};

DVReader.prototype.move = function (n) {
  this.pos = n;
};

DVReader.prototype.getNullString16 = function (littleEndian) {
  var str = "", c;
  while (1) {
    c = this.getUint16(this.__defaultEndian(littleEndian));
    if (c == 0) {
      return str;
    }

    str += String.fromCharCode(c);
  }
};


function DVWriter(dv, littleEndian) {
  this.dv = dv;
  this.pos = 0;
  this.littleEndian = !!littleEndian;

  // helper to incorporate littleEndian default value (set in
  // constructor) and the littleEndian parameter passed to each reader
  // function. For consistency with the DataView API, passing true to
  // any reader function will cause littleEndian to be used for that
  // function. Otherwise, the value passed to the constructor will be
  // used. This means that if you pass a truthy value for littleEndian
  // in the constructor, you will have to pass false (NOT undefined)
  // to the reader functions in order to force big endian reading.
  var self = this;
  this.__defaultEndian = function (le) {
    if (le) { return true; }
    if (typeof le === "undefined") {
      return self.littleEndian;
    }
    return false;
  }
};

DVWriter.prototype.putInt8 = function (x) {
  return this.dv.setInt8(this.pos++, x);
};

DVWriter.prototype.putUint8 = function (x) {
  return this.dv.setUint8(this.pos++, x);
};

DVWriter.prototype.putInt16 = function (x, littleEndian) {
  this.pos += 2;
  return this.dv.setInt16(this.pos-2, x, this.__defaultEndian(littleEndian));
};

DVWriter.prototype.putUint16 = function (x, littleEndian) {
  this.pos += 2;
  return this.dv.setUint16(this.pos-2, x, this.__defaultEndian(littleEndian));
};

DVWriter.prototype.putInt32 = function (x, littleEndian) {
  this.pos += 4;
  return this.dv.setInt32(this.pos - 4, x, this.__defaultEndian(littleEndian));
};

DVWriter.prototype.putUint32 = function (x, littleEndian) {
  this.pos += 4;
  return this.dv.setUint32(this.pos - 4, x,this.__defaultEndian(littleEndian));
};

DVWriter.prototype.putFloat32 = function (x, littleEndian) {
  this.pos += 4;
  return this.dv.setFloat32(this.pos - 4, x,
                            this.__defaultEndian(littleEndian));
};

DVWriter.prototype.putFloat64 = function (x, littleEndian) {
  this.pos += 8;
  return this.dv.setFloat64(this.pos - 8, x,
                            this.__defaultEndian(littleEndian));
};

DVWriter.prototype.skip = function (n) {
  this.pos += n;
};

DVWriter.prototype.move = function (n) {
  this.pos = n;
};

DVWriter.prototype.putNullString16 = function (x, littleEndian) {
  for (var i = 0; i < x.length; ++i) {
    this.putUint16(x.charCodeAt(i), this.__defaultEndian(littleEndian));
  }
};
