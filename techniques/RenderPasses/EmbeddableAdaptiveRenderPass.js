/**
 * An adaptive render pass which can be combined with other adaptive techniques
 * in order to form more complex techniques.
 * An EmbeddableAdaptiveRenderPass is intented to be used through combosition, not
 * through inheritance. That is, having an adaptive technique T that we wish to extend
 * with some functionality provided by the EmbeddableAdaptiveRenderPass E would require
 * in the following:
 * 1) Defining a field of type E inside the technique T
 * 2) Calling all AdaptiveRenderPass methods of E from within the AdaptiveRenderPass
 *	  methods of T. i.e: T.adaptShadersToMaterial should call E.adaptShadersToMaterial
 *    in order to adapt its own technique and E's technique on the same material
 *    having a resulting overall technique that combines both of them.
 * 3) Calling the RenderPass methods __setCustomUniforms and __setCustomRenderState
 */
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
