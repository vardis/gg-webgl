GG.BaseCamera = function (spec) {
	spec             = spec || {};
	this.position    = spec.position != undefined ? spec.position : [ 0.0, 0.0, 0.0];
	this.offset      = [0.0, 0.0, 0.0];
	this.lookAt      = spec.lookAt != undefined ? spec.lookAt : [ 0.0, 0.0, -1.0];
	this.up          = spec.up != undefined ? spec.up : [ 0.0, 1.0, 0.0 ];
	this.rotation    = spec.rotation != undefined ? spec.rotation : [ 0.0, 0.0, 0.0];
	this.near        = spec.near != undefined ? spec.near : 0.1;
	this.far         = spec.far != undefined ? spec.far : 100.0;
	this.aspectRatio = spec.aspectRatio != undefined ? spec.aspectRatio : 1.33;	
	this.viewMatrix  = mat4.create();	
	this.viewport    = new GG.Viewport();
};

GG.BaseCamera.FORWARD_VECTOR = [0.0, 0.0, 1.0, 0.0];
GG.BaseCamera.UP_VECTOR      = [0.0, 1.0, 0.0, 0.0];

GG.BaseCamera.prototype.getViewMatrix = function() {
	mat4.lookAt(this.position, this.lookAt, this.up, this.viewMatrix);
	return this.viewMatrix;
	//return mat4.inverse(this.viewMatrix);
};

GG.BaseCamera.prototype.getPosition = function() {
	return this.position;
};

GG.BaseCamera.prototype.setPosition = function(p) {
	this.position = p;
};

GG.BaseCamera.prototype.getRotation = function() {
	return this.rotation;
};
GG.BaseCamera.prototype.setRotation = function(r) {
	this.rotation = r;
	
	return this;
};


GG.BaseCamera.prototype.getViewport = function() {
    return this.viewport;
};

GG.BaseCamera.prototype.setViewport = function(viewport) {
    this.viewport = viewport;
    return this;
};


GG.BaseCamera.prototype.elevate = function (units) {
	this.position[1] += units;
};

GG.BaseCamera.prototype.forward = function (units) {
	//this.offset[2] += units;
	this.position[2] += units;
	/*
	var dir = vec3.normalize(this.lookAt);
	var offset = vec3.create();
	vec3.scale(dir, units, offset);
	vec3.add(this.position, offset, this.position);
	*/
	//vec3.add(this.position, dir, this.lookAt);
};

GG.BaseCamera.prototype.right = function (units) {
	//this.offset[0] += units;
	this.position[0] += units;
	/*
	var up       = vec3.create();
	var rightVec = vec3.create();
	mat4.multiplyVec4(this.viewMatrix, GG.BaseCamera.UP_VECTOR, up);
	vec3.normalize(up);
	vec3.normalize(this.lookAt);
	vec3.cross(this.lookAt, up, rightVec);

	vec3.scale(rightVec, units);
	vec3.add(this.position, rightVec, this.position);
	*/
	//vec3.add(this.position, this.lookAt, this.lookAt);
	//vec3.normalize(this.lookAt);
};

GG.BaseCamera.prototype.zoom = function (amount) {
	// overridde in subclasses
};

GG.BaseCamera.constructor = GG.BaseCamera;