/**
 * Provides information regarding the current render context. This type
 * of information includes the active scene, the camera, the render target, etc.
 */
GG.RenderContext = function(spec) {
	this.camera = spec.camera || null;
	this.renderTarget = spec.renderTarget || null;
	this.lights = spec.lights || [];
	
};