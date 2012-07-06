GG.OrthographicCamera = function (spec) {
	spec = spec || {};
	GG.BaseCamera.call(this, spec);
	this.left = spec.left || -1.0;
	this.right = spec.right || 1.0;
	this.bottom = spec.bottom || -1.0;
	this.top = spec.top || 1.0;
	this.projectionMatix = mat4.create();	
};

GG.OrthographicCamera.prototype = new GG.BaseCamera();
GG.OrthographicCamera.prototype.constructor = GG.OrthographicCamera;

GG.OrthographicCamera.prototype.getProjectionMatrix = function() {
	mat4.ortho(this.left, this.right, this.bottom, this.top, this.near, this.far, this.projectionMatix);
	return this.projectionMatix;
};


GG.OrthographicCamera.prototype.setup = function(pos, lookAt, up, left, right, bottom, top, near, far) {	
	this.position = pos;
	this.lookAt = lookAt;
	this.up = up;
	this.near = near;
	this.far = far;
	this.left = left;
	this.right = right;
	this.bottom = bottom;
	this.top = top;
	mat4.lookAt(pos, lookAt, up, this.viewMatrix);
	mat4.ortho(left, right, bottom, top, near, far, this.projectionMatix);
	return this;
};
