/**
 * A buffer that provides the data for a vertex attribute.
 */
GG.AttributeDataBuffer = function (spec) {
	spec           = spec || {};
	this.arrayData = spec.arrayData;
	this.itemSize  = spec.itemSize;
	this.itemType  = spec.itemType;
	this.stride    = spec.stride != undefined ? spec.stride : 0;
	this.normalize = spec.normalize != undefined ? spec.normalize : false;
	this.usageType = spec.usageType != undefined ? spec.usageType : gl.STATIC_DRAW;

	this.glBuffer  = gl.createBuffer(1);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.glBuffer);			
	gl.bufferData(gl.ARRAY_BUFFER, this.arrayData, this.usageType);	
};

GG.AttributeDataBuffer.prototype.constructor = GG.AttributeDataBuffer;

GG.AttributeDataBuffer.prototype.streamAttribute = function(attrib) {
	gl.bindBuffer(gl.ARRAY_BUFFER, this.glBuffer);
	gl.enableVertexAttribArray(attrib);
	gl.vertexAttribPointer(attrib, this.itemSize, this.itemType, this.normalized, this.stride, 0);
};