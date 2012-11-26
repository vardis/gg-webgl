GG.EmbeddableAdaptiveRenderPass = function(spec) {
	this.activeHash = null;
	GG.AdaptiveRenderPass.call(this, spec);
};

GG.EmbeddableAdaptiveRenderPass.prototype.constructor = GG.EmbeddableAdaptiveRenderPass;

GG.EmbeddableAdaptiveRenderPass.prototype.shouldInvalidateProgram = function (hash) {	
	return this.activeHash != hash;
};


GG.EmbeddableAdaptiveRenderPass.prototype.adaptShadersToMaterial = function (vertexShader, fragmentShader, material) {
	throw "EmbeddableAdaptiveRenderPass.adaptShadersToMaterial is abstract";
};

GG.EmbeddableAdaptiveRenderPass.prototype.hashMaterial = function (material) {
	throw "EmbeddableAdaptiveRenderPass.hashMaterial is abstract";
};