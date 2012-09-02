/**
 * Provides information regarding the current render context. This type
 * of information includes the active scene, the camera, the render target, etc.
 */
GG.RenderContext = function(spec) {
	spec              = spec || {};	
	this.renderer     = spec.renderer || GG.renderer;
	this.clock        = spec.clock || GG.clock;
	this.camera       = spec.camera || null;
	this.renderTarget = spec.renderTarget || null;
	this.scene        = spec.scene || null;
};