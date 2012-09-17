GG.PerspectiveCamera = function(spec) {
	spec                 = spec || {};
	GG.BaseCamera.call(this, spec);
	this.fov             = 45.0;	
	this.projectionMatix = mat4.create();	
}

GG.PerspectiveCamera.prototype = new GG.BaseCamera();
GG.PerspectiveCamera.prototype.constructor = GG.PerspectiveCamera;

GG.PerspectiveCamera.prototype.getProjectionMatrix = function() {
	mat4.perspective(this.fov, this.aspectRatio, this.near, this.far, this.projectionMatix);
	return this.projectionMatix;
};


GG.PerspectiveCamera.prototype.setup = function(pos, lookAt, up, fov, aspectRatio, near, far) {
	this.position    = pos;
	this.lookAt      = lookAt;
	this.up          = up;
	this.fov         = fov;
	this.near        = near;
	this.far         = far;
	this.aspectRatio = aspectRatio;
	mat4.lookAt(pos, lookAt, up, this.viewMatrix);
	return this;
};

GG.PerspectiveCamera.prototype.zoom = function (amount) {
	this.fov = GG.MathUtils.clamp(this.fov + amount, 0.0, 180.0);
};