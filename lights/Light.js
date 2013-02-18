GG.LT_DIRECTIONAL = 1;
GG.LT_POINT       = 2;
GG.LT_SPOT        = 3;
GG.LT_AMBIENT     = 4;

GG.Light = function(spec) {
	spec              = spec || {};
	this.lightName    = spec.name != undefined ? spec.name : 'light';
	this.lightType    = spec.type != undefined ? spec.type : GG.LT_POINT;
	this.position     = spec.position != undefined ? spec.position : [0.0, 0.0, 0.0];
	this.direction    = spec.direction != undefined ? spec.direction : [0.0, 0.0, -1.0];
	this.ambient      = spec.ambient != undefined ? spec.ambient : [1.0, 1.0, 1.0];
	this.diffuse      = spec.diffuse != undefined ? spec.diffuse : [1.0, 1.0, 1.0];
	this.specular     = spec.specular != undefined ? spec.specular : [1.0, 1.0, 1.0];
	this.attenuation  = spec.attenuation != undefined ? spec.attenuation : 5.0;
	this.cosCutOff    = spec.cosCutOff != undefined ? spec.cosCutOff : 0.5;
	this.shadowCamera = new GG.PerspectiveCamera();
};

GG.Light.prototype = new GG.Light();
GG.Light.prototype.constructor = GG.Light;

GG.Light.prototype.getShadowCamera = function () {	
/*
	if (this.lightType == GG.LT_POINT) {
		var cam = new GG.PerspectiveCamera();
		cam.setup(this.position, this.direction, [0.0, 1.0, 0.0], 90.0, 1.33, 1.0, 100.0);
	} else {
		var cam = new GG.OrthographicCamera();
		cam.setup(this.position, vec3.add(this.position, this.direction, vec3.create()), [0.0, 1.0, 0.0], -7.0, 7.0, -7.0, 7.0, 1.0, 50.0);
	}
	return cam;
	*/
	return this.shadowCamera;
};