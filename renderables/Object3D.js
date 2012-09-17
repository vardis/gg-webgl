GG.Object3D = function(spec) {
	spec          = spec || {};	
	this.pos      = [0.0, 0.0, 0.0];
	this.rotation = [0.0, 0.0, 0.0];
	this.scale    = [1.0, 1.0, 1.0];	
	this.material = spec.material;
}


GG.Object3D.prototype.getPosition = function() { return this.pos; },
GG.Object3D.prototype.setPosition = function(p) { this.pos = p; },
GG.Object3D.prototype.getRotation = function() { return this.rotation; },
GG.Object3D.prototype.setRotation = function(o) { this.rotation = o; },
GG.Object3D.prototype.setScale    = function(s) { this.scale = s; }
GG.Object3D.prototype.getScale    = function() { return this.scale; }

GG.Object3D.prototype.getModelMatrix=function() {
	var model = mat4.create();
	mat4.identity(model);

	mat4.translate(model, this.pos);	
	mat4.rotate(model, this.rotation[1], [0, 1, 0]);
	mat4.rotate(model, this.rotation[0], [1, 0, 0]);
	mat4.rotate(model, this.rotation[2], [0, 0, 1]);
	mat4.scale(model, this.scale);
	return model;
};

GG.Object3D.prototype.getMaterial = function () {
	return this.material;
};

GG.Object3D.prototype.setMaterial = function (m) {
	this.material = m;
	return this;
};