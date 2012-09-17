GG.RenderQueue = function (spec) {
	this.name = spec.name != undefined ? spec.name : "renderQueue";
	this.items = spec.items || {};
	this.priority = spec.priority != undefined ? spec.priority : 0;
};