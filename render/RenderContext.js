/**
 * Provides information regarding the current render context. This type
 * of information includes the active scene, the camera, the render target, etc.
 */
GG.RenderContext = function(spec) {
	spec              = spec || {};	
	this.renderer     = spec.renderer != undefined ? spec.renderer : GG.renderer;
	this.clock        = spec.clock != undefined ? spec.clock : GG.clock;
	this.camera       = spec.camera;
	this.renderTarget = spec.renderTarget;
	this.scene        = spec.scene;
	this.light        = spec.light;
	this.renderState  = spec.renderState;
};