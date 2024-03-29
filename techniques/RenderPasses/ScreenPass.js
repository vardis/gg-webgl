/**
 * Simplifies the creation of render passes that perform a screen space
 * effect, for e.g. tone mapping, bloom, blur, etc.
 */
GG.ScreenPass = function(spec) {
	spec = spec || {};
	spec.customRendering = true;
	spec.usesLighting    = false;
	GG.RenderPass.call(this, spec);

	this.sourceTexture = spec.sourceTexture;
	this.screenQuad = null;
};

GG.ScreenPass.SourceTextureUniform = 'u_sourceTexture';

GG.ScreenPass.prototype             = new GG.RenderPass();
GG.ScreenPass.prototype.constructor = GG.ScreenPass;

GG.ScreenPass.prototype.__renderGeometry = function(renderable) {
	// render a full screen quad
	if (this.screenQuad == null) {
		this.screenQuad = new GG.TriangleMesh(new GG.ScreenAlignedQuad());
	}	
	GG.renderer.render(this.screenQuad, this.program);
};

GG.ScreenPass.prototype.__setCustomUniforms = function(renderable, renderContext, program) {
	// the default sourceTexture always goes to texture unit GG.TEX_UNIT_DIFFUSE_MAP_0
	if (this.sourceTexture != null) {
		this.sourceTexture.bindAtUnit(GG.TEX_UNIT_DIFFUSE_MAP_0);		
		gl.uniform1i(this.program.u_sourceTexture, GG.TEX_UNIT_DIFFUSE_MAP_0);
	}
};

GG.ScreenPass.prototype.setSourceTexture = function(texture) {
	this.sourceTexture = texture;
};

GG.ScreenPass.prototype.__setCustomRenderState = function(renderable, ctx, program) {
	gl.disable(gl.CULL_FACE);
	gl.disable(gl.DEPTH_TEST);
};



