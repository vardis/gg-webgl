GG.Scene = function(name) {
	this.name = name;

	this.objects = [];
	this.lights = [];
};

GG.Scene.prototype.addObject = function(object) {
	this.objects.push(object);
	return this;
};

GG.Scene.prototype.perObject = function(fn) {
	for (var i = this.objects.length - 1; i >= 0; i--) {
		fn.apply(null, [this.objects[i]]);
	};
	this.objects.forEach(fn);
	return this;
};

GG.Scene.prototype.addLight = function(light) {
	this.lights.push(light);
	return this;
};

GG.Scene.prototype.removeLight = function(light) {
	this.lights = this.lights.filter(function(i) { return i != light;});
	return this;
};

GG.Scene.prototype.listLights = function() {
	return new Array(this.lights);
}
GG.Scene.prototype = new GG.Scene();
GG.Scene.prototype.constructor = GG.Scene;