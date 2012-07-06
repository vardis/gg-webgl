GG.BaseCamera = function (spec) {
	spec = spec || {};
	this.position = spec.position || [ 0.0, 0.0, 0.0];
	this.lookAt = spec.lookAt || [ 0.0, 0.0, -1.0];
	this.up = spec.up || [ 0.0, 1.0, 0.0 ];
	this.rotation = spec.rotation || [ 0.0, 0.0, 0.0];
	this.near = spec.near || 0.1;
	this.far = spec.far || 100.0;
	this.aspectRatio = spec.aspectRatio || 1.33;

	this.viewMatrix = mat4.create();	
};

GG.BaseCamera.FORWARD_VECTOR = [0.0, 0.0, 1.0];

GG.BaseCamera.prototype.getViewMatrix = function() {
	//mat4.lookAt(this.position, this.lookAt, this.up, this.viewMatrix);
	return this.viewMatrix;
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
	mat4.identity(this.viewMatrix); 	 
	mat4.rotate(this.viewMatrix, GG.MathUtils.degToRads(this.rotation[0]), [1, 0, 0]);
	mat4.rotate(this.viewMatrix, GG.MathUtils.degToRads(this.rotation[1]), [0, 1, 0]); 	
	
	mat4.multiplyVec3(this.viewMatrix, GG.BaseCamera.FORWARD_VECTOR, this.lookAt);
	
	mat4.translate(this.viewMatrix, [-this.position[0], -this.position[1], -this.position[2]]);
	return this;
};

GG.BaseCamera.constructor = GG.BaseCamera;