/**
 * A buffer that provides the data for a vertex attribute.
 * The input specfication objects can contain the following fields:
 *  -arrayData: an array that contains the actual data of the buffer
 *  -itemSize: the number of components of each datum
 *  -itemType: one of gl.FLOAT, gl.BYTE, gl.UNSIGNED_BYTE, gl.SHORT, gl.UNSIGNED_SHORT, gl.FIXED
 *  -normalize: indicates whether the data should be normalized when streamed for an attribute
 *  -usageType: one of gl.STATIC_DRAW, gl.STREAM_DRAW, gl.DYNAMIC_DRAW
 */
GG.AttributeDataBuffer = function (spec) {
    spec = spec || {};
    this.arrayData = spec.arrayData;
    this.itemSize = spec.itemSize;
    this.itemType = spec.itemType;
    this.stride = spec.stride != undefined ? spec.stride : 0;
    this.normalize = spec.normalize != undefined ? spec.normalize : false;
    this.usageType = spec.usageType != undefined ? spec.usageType : gl.STATIC_DRAW;

    this.glBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.glBuffer);

    if (this.arrayData == null) {
        this.itemCount = spec.itemCount;
        if (this.itemCount == null) throw "dataLength must be defined";
        this.arrayData = this.allocateTypedArray();
    } else {
        if (this.arrayData.constructor == Array) {
            this.arrayData = this.allocateTypedArrayFromArray(this.arrayData);
        }
        this.itemCount = this.arrayData.length / this.itemSize;
    }

    gl.bufferData(gl.ARRAY_BUFFER, this.arrayData, this.usageType);
};

GG.AttributeDataBuffer.prototype.constructor = GG.AttributeDataBuffer;

GG.AttributeDataBuffer.newEmptyDataBuffer = function() {
    return new GG.AttributeDataBuffer({
        itemCount : 0, itemSize : 1, itemType : gl.BYTE
    });
};

GG.AttributeDataBuffer.prototype.destroy = function() {
    if (gl.isBuffer(this.glBuffer)) gl.deleteBuffer(this.glBuffer);
};

GG.AttributeDataBuffer.prototype.streamAttribute = function (attrib) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.glBuffer);
    gl.enableVertexAttribArray(attrib);
    gl.vertexAttribPointer(attrib, this.itemSize, this.itemType, this.normalize, this.stride, 0);
};

GG.AttributeDataBuffer.prototype.allocateTypedArray = function () {
    var size = this.itemCount * this.itemSize;
    var ctor = this.getArrayBufferConstructrForItemType(this.itemType);
    return new ctor(size);
};

GG.AttributeDataBuffer.prototype.allocateTypedArrayFromArray = function (rawArray) {    
    var ctor = this.getArrayBufferConstructrForItemType(this.itemType);
    return new ctor(rawArray);
};

GG.AttributeDataBuffer.prototype.getArrayBufferConstructrForItemType = function (itemType) {
    var ctor;
    switch (this.itemType) {
        case gl.BYTE:
            ctor = ArrayBuffer;
            break;
        case gl.UNSIGNED_BYTE:
            ctor = Uint8Array;
            break;
        case gl.FLOAT:
            ctor = Float32Array;
            break;
        case gl.SHORT:
            ctor = Int16Array;
            break;
        case gl.UNSIGNED_SHORT:
            ctor = Uint16Array;
            break;
        case gl.FIXED:
            ctor = Uint32Array;
            break;
        default:
            throw "Unrecognized itemType";
    }
    return ctor;
};
GG.AttributeDataBuffer.prototype.getItemCount = function () {
    return this.itemCount;
};

GG.AttributeDataBuffer.prototype.getData = function () {
    return this.arrayData;
};

GG.AttributeDataBuffer.prototype.getElementAt = function (index) {
    return this.arrayData.subarray(index*this.itemSize, (index+1)*this.itemSize);
};


GG.AttributeDataBuffer.prototype.updateData = function (typedArray) {
    this.arrayData.set(typedArray);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.glBuffer);
    gl.bufferSubData(this.glBuffer, 0, this.arrayData);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
};