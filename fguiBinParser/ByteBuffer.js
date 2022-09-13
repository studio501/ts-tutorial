"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fgui = void 0;
var fgui;
(function (fgui) {
    var ByteBuffer = /** @class */ (function () {
        function ByteBuffer(buffer, offset, length) {
            if (offset === void 0) { offset = 0; }
            if (length === void 0) { length = -1; }
            this.version = 0;
            if (length == -1)
                length = buffer.byteLength - offset;
            this._bytes = new Uint8Array(buffer, offset, length);
            this._view = new DataView(this._bytes.buffer, offset, length);
            this._pos = 0;
            this._length = length;
        }
        Object.defineProperty(ByteBuffer.prototype, "data", {
            get: function () {
                return this._bytes;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ByteBuffer.prototype, "position", {
            get: function () {
                return this._pos;
            },
            set: function (value) {
                if (value > this._length)
                    throw "Out of bounds";
                this._pos = value;
            },
            enumerable: false,
            configurable: true
        });
        ByteBuffer.prototype.skip = function (count) {
            this._pos += count;
        };
        ByteBuffer.prototype.validate = function (forward) {
            if (this._pos + forward > this._length)
                throw "Out of bounds";
        };
        ByteBuffer.prototype.readByte = function () {
            this.validate(1);
            return this._view.getInt8(this._pos++);
        };
        ByteBuffer.prototype.readUbyte = function () {
            return this._bytes[this._pos++];
        };
        ByteBuffer.prototype.readBool = function () {
            return this.readByte() == 1;
        };
        ByteBuffer.prototype.readShort = function () {
            this.validate(2);
            var ret = this._view.getInt16(this._pos, this.littleEndian);
            this._pos += 2;
            return ret;
        };
        ByteBuffer.prototype.readUshort = function () {
            this.validate(2);
            var ret = this._view.getUint16(this._pos, this.littleEndian);
            this._pos += 2;
            return ret;
        };
        ByteBuffer.prototype.readInt = function () {
            this.validate(4);
            var ret = this._view.getInt32(this._pos, this.littleEndian);
            this._pos += 4;
            return ret;
        };
        ByteBuffer.prototype.readUint = function () {
            this.validate(4);
            var ret = this._view.getUint32(this._pos, this.littleEndian);
            this._pos += 4;
            return ret;
        };
        ByteBuffer.prototype.readFloat = function () {
            this.validate(4);
            var ret = this._view.getFloat32(this._pos, this.littleEndian);
            this._pos += 4;
            return ret;
        };
        ByteBuffer.prototype.readString = function (len) {
            if (len == undefined)
                len = this.readUshort();
            this.validate(len);
            var v = "", max = this._pos + len, c = 0, c2 = 0, c3 = 0, f = String.fromCharCode;
            var u = this._bytes, i = 0;
            var pos = this._pos;
            while (pos < max) {
                c = u[pos++];
                if (c < 0x80) {
                    if (c != 0) {
                        v += f(c);
                    }
                }
                else if (c < 0xE0) {
                    v += f(((c & 0x3F) << 6) | (u[pos++] & 0x7F));
                }
                else if (c < 0xF0) {
                    c2 = u[pos++];
                    v += f(((c & 0x1F) << 12) | ((c2 & 0x7F) << 6) | (u[pos++] & 0x7F));
                }
                else {
                    c2 = u[pos++];
                    c3 = u[pos++];
                    v += f(((c & 0x0F) << 18) | ((c2 & 0x7F) << 12) | ((c3 << 6) & 0x7F) | (u[pos++] & 0x7F));
                }
                i++;
            }
            this._pos += len;
            return v;
        };
        ByteBuffer.prototype.readS = function () {
            var index = this.readUshort();
            if (index == 65534) //null
                return null;
            else if (index == 65533)
                return "";
            else
                return this.stringTable[index];
        };
        ByteBuffer.prototype.readSArray = function (cnt) {
            var ret = new Array(cnt);
            for (var i = 0; i < cnt; i++)
                ret[i] = this.readS();
            return ret;
        };
        ByteBuffer.prototype.writeS = function (value) {
            var index = this.readUshort();
            if (index != 65534 && index != 65533)
                this.stringTable[index] = value;
        };
        ByteBuffer.prototype.readColor = function (hasAlpha) {
            var r = this.readUbyte();
            var g = this.readUbyte();
            var b = this.readUbyte();
            var a = this.readUbyte();
            return [r, g, b, (hasAlpha ? a : 255)];
        };
        ByteBuffer.prototype.readChar = function () {
            var i = this.readUshort();
            return String.fromCharCode(i);
        };
        ByteBuffer.prototype.readBuffer = function () {
            var count = this.readUint();
            this.validate(count);
            var ba = new ByteBuffer(this._bytes.buffer, this._bytes.byteOffset + this._pos, count);
            ba.stringTable = this.stringTable;
            ba.version = this.version;
            this._pos += count;
            return ba;
        };
        ByteBuffer.prototype.seek = function (indexTablePos, blockIndex) {
            var tmp = this._pos;
            this._pos = indexTablePos;
            var segCount = this.readByte();
            if (blockIndex < segCount) {
                var useShort = this.readByte() == 1;
                var newPos;
                if (useShort) {
                    this._pos += 2 * blockIndex;
                    newPos = this.readUshort();
                }
                else {
                    this._pos += 4 * blockIndex;
                    newPos = this.readUint();
                }
                if (newPos > 0) {
                    this._pos = indexTablePos + newPos;
                    return true;
                }
                else {
                    this._pos = tmp;
                    return false;
                }
            }
            else {
                this._pos = tmp;
                return false;
            }
        };
        return ByteBuffer;
    }());
    fgui.ByteBuffer = ByteBuffer;
})(fgui = exports.fgui || (exports.fgui = {}));
;
//# sourceMappingURL=ByteBuffer.js.map