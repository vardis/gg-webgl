GG.OrthographicCamera = function (spec) {
	spec                 = spec || {};
	GG.BaseCamera.call(this, spec);
	this.left            = spec.left != undefined ? spec.left : -1.0;
	this.right           = spec.right != undefined ? spec.right : 1.0;
	this.bottom          = spec.bottom != undefined ? spec.bottom : -1.0;
	this.top             = spec.top != undefined ? spec.top : 1.0;
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
	this.lookAt   = lookAt;
	this.up       = up;
	this.near     = near != undefined ? near : this.near;
	this.far      = far != undefined ? far : this.far;
	this.left     = left != undefined ? left : this.left;
	this.right    = right != undefined ? right : this.right;
	this.bottom   = bottom != undefined ? bottom : this.bottom;
	this.top      = top != undefined ? top : this.top;
	mat4.lookAt(pos, lookAt, up, this.viewMatrix);
	mat4.ortho(left, right, bottom, top, near, far, this.projectionMatix);

	var headPitchBank = GG.MathUtils.mat4ToEuler(this.viewMatrix);
	this.rotation[0] = GG.MathUtils.radsToDeg(headPitchBank[1]);
	this.rotation[1] = GG.MathUtils.radsToDeg(headPitchBank[0]);
	this.rotation[2] = GG.MathUtils.radsToDeg(headPitchBank[2]);
	return this;
};
