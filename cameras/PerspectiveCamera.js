GG.PerspectiveCamera = function() {

	this.position = [ 0.0, 0.0, 0.0];
	this.lookAt = [ 0.0, 0.0, -1.0];
	this.up = [ 0.0, 1.0, 0.0 ];
	this.rotation = [ 0.0, 0.0, 0.0];
	this.fov = 45.0;
	this.near = 0.1;
	this.far = 100.0;
	this.aspectRatio = 1.33;

	this.viewingMatrix = mat4.create();
	this.projectionMatix = mat4.create();	
}

GG.PerspectiveCamera.prototype.constructor = GG.PerspectiveCamera;

GG.PerspectiveCamera.prototype.getPerspectiveMatrix = function() {
	mat4.perspective(this.fov, this.aspectRatio, this.near, this.far, this.projectionMatix);
	return this.projectionMatix;
};

GG.PerspectiveCamera.prototype.getViewingMatrix = function() {
	mat4.identity(this.viewingMatrix); 	 
	mat4.rotate(this.viewingMatrix, GG.MathUtils.degToRads(this.rotation[0]), [1, 0, 0]);
	mat4.rotate(this.viewingMatrix, GG.MathUtils.degToRads(this.rotation[1]), [0, 1, 0]); 	
	mat4.translate(this.viewingMatrix, [-this.position[0], -this.position[1], -this.position[2]]);
	
	//mat4.lookAt(this.position, this.lookAt, this.up, this.viewingMatrix);
	return this.viewingMatrix;
};

GG.PerspectiveCamera.prototype.getPosition = function() {
	return this.position;
};

GG.PerspectiveCamera.prototype.setPosition = function(p) {
	this.position = p;
};

GG.PerspectiveCamera.prototype.getRotation = function() {
	return this.rotation;
};

GG.PerspectiveCamera.prototype.setRotation = function(r) {
	this.rotation = r;
	return this;
};

GG.PerspectiveCamera.prototype.setup = function(pos, lookAt, up, fov, aspectRatio, near, far) {
	this.position = pos;
	this.lookAt = lookAt;
	this.up = up;
	this.fov = fov;
	this.near = near;
	this.far = far;
	this.aspectRatio = aspectRatio;
	return this;
};
