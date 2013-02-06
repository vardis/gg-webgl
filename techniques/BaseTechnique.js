GG.BaseTechnique = function(spec) {	
	spec          = spec || {};	
	this.passes   = spec.passes || [];
	this.program  = null;
};

GG.BaseTechnique.prototype.constructor = GG.BaseTechnique;

GG.BaseTechnique.fromShaders = function (vertexShader, fragmentShader) {
	var pass = new GG.RenderPass({ 'vertexShader' : vertexShader, 'fragmentShader' : fragmentShader });
	return new GG.BaseTechnique({ passes : [ pass ] });
};

GG.BaseTechnique.prototype.initialize = function() {

};

GG.BaseTechnique.prototype.destroy = function() {
	if (this.passes) {
		for (var i = this.passes.length - 1; i >= 0; i--) {
			this.passes[i].destroy();
        }
    }
};

GG.BaseTechnique.prototype.renderPasses = function() {
	return [].concat(this.passes);
};

GG.BaseTechnique.prototype.render = function(renderable, ctx) {		
	this.passes.forEach(function(pass) {
		pass.render(renderable, ctx);
	});
};

