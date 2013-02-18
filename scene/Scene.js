GG.Scene = function(name) {
	this.name             = name;
	
	this.ambientLight     = null;
	this.objects          = [];
	this.pointLights      = [];
	this.directionaLights = [];
	this.spotLights       = [];
	this.shadowsEnabled   = false;
	
	this.showFog          = false;
	this.fogStart         = 10;
	this.fogEnd           = 100;
	this.fogDensity       = 2;
	this.fogColor         = [0.7, 0.7, 0.7];
};

GG.Scene.prototype.addObject = function(object) {
	this.objects.push(object);
	return this;
};

GG.Scene.prototype.listObjects = function () {
	return this.objects;
};

GG.Scene.prototype.perObject = function(fn) {
	this.objects.forEach(fn);
	return this;
};

GG.Scene.prototype.addLight = function(light) {
	switch (light.lightType) {
	case GG.LT_DIRECTIONAL:
		this.directionaLights.push(light);
		break;
	case GG.LT_POINT:
		this.pointLights.push(light);
		break;
	case GG.LT_SPOT:
		this.spotLights.push(light);
		break;
	default:
		break;
	}
	return this;
};

GG.Scene.prototype.listPointLights = function() {
	return [].concat(this.pointLights);
};

GG.Scene.prototype.listDirectionalLights = function() {
	return [].concat(this.directionaLights);
};

GG.Scene.prototype.listSpotLights = function() {
	return [].concat(this.spotLights);
};

GG.Scene.prototype.numPointLights = function() {
	return this.pointLights.length;
};

GG.Scene.prototype.numDirectionalLights = function() {
	return this.directionaLights.length;
};

GG.Scene.prototype.numSpotLights = function() {
	return this.spotLights.length;
};

GG.Scene.prototype.hasPointLights = function() {
	return this.pointLights.length > 0;
};

GG.Scene.prototype.hasDirectionalLights = function() {
	return this.directionaLights.length > 0;
};

GG.Scene.prototype.hasSpotLights = function() {
	return this.spotLights.length > 0;
};

GG.Scene.prototype.listLights = function () {
    return []
        .concat(this.pointLights)
        .concat(this.directionaLights)
        .concat(this.spotLights);
};

GG.Scene.prototype.hasShadows = function() {
	return this.shadowsEnabled;
};

GG.Scene.prototype.shadows = function(flag) {
	this.shadowsEnabled = flag;
};

GG.Scene.prototype = new GG.Scene();
GG.Scene.prototype.constructor = GG.Scene;

