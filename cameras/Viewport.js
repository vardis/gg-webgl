/**
 * A viewport is linked with a camera and defines the portion of the render surface that
 * will be covered by the camera's display.
 */
GG.Viewport = function (spec) {
	spec = spec || {};
	this.x = spec.x != undefined ? spec.x : 0;
	this.y = spec.y != undefined ? spec.y : 0;
	this.width = spec.width != undefined ? spec.width : 320;
	this.height = spec.height != undefined ? spec.height : 200;
	this.clearColor = spec.clearColor != undefined ? spec.clearColor : [0, 0, 0];
	this.zOrder = spec.zOrder != undefined ? spec.zOrder : 0;
};

GG.Viewport.prototype.activate = function() {
    gl.viewport(0, 0, this.width, this.height);
    gl.clearColor(this.clearColor[0], this.clearColor[1], this.clearColor[2], 1.0);
};

GG.Viewport.prototype.getWidth = function() {
    return this.width;
};

GG.Viewport.prototype.setWidth = function(width) {
    this.width = width;
    return this;
};


GG.Viewport.prototype.getHeight = function() {
    return this.height;
};

GG.Viewport.prototype.setHeight = function(height) {
    this.height = height;
    return this;
};


GG.Viewport.prototype.getClearColor = function() {
    return this.clearColor;
};

GG.Viewport.prototype.setClearColor = function(clearColor) {
    this.clearColor = clearColor;
    return this;
};
