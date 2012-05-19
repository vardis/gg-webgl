GG.LT_DIRECTIONAL = 1;
GG.LT_POINT = 2;
GG.LT_SPOT = 3;

GG.Light = function(spec) {
	spec = spec || {};
	this.lightName = spec.name || 'light';
	this.lightType = spec.type || GG.LT_POINT;
	this.position = spec.position || [0.0, 0.0, 0.0];
	this.direction = spec.direction || [0.0, 0.0, -1.0];
	this.diffuse = spec.diffuse || [1.0, 1.0, 1.0];
	this.specular = spec.specular || [1.0, 1.0, 1.0];
	this.attenuation = spec.attenuation || 5.0;
	this.cosCutOff = spec.cosCutOff || 0.5;
};

GG.Light.prototype = new GG.Light();
GG.Light.prototype.constructor = GG.Light;