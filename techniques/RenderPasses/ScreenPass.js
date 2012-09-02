/**
 * Simplifies the creation of render passes that perform a screen space
 * effect, for e.g. tone mapping, bloom, blur, etc.
 */
GG.ScreenPass = function(spec) {
	spec = spec || {};

	GG.RenderPass.call(this, spec);

	this.sourceTexture = spec.sourceTexture || null;
	this.screenQuad = null;
};

GG.ScreenPass.SourceTextureUniform = 'u_sourceTexture';

GG.ScreenPass.prototype = new GG.RenderPass();

GG.ScreenPass.prototype.constructor = GG.ScreenPass;

GG.ScreenPass.prototype.__renderGeometry = function(renderable) {
	// render a full screen quad
	if (this.screenQuad == null) {
		this.screenQuad = new GG.TriangleMesh(new GG.ScreenAlignedQuad());
	}	
	GG.renderer.renderMesh(this.screenQuad, this.program);
};

GG.ScreenPass.prototype.__setCustomUniforms = function(renderable, renderContext, program) {
	// the default sourceTexture always goes to texture unit GG.TEX_UNIT_DIFFUSE_MAP
	if (this.sourceTexture != null) {
		this.sourceTexture.bindAtUnit(GG.TEX_UNIT_DIFFUSE_MAP);		
		gl.uniform1i(this.program.u_sourceTexture, GG.TEX_UNIT_DIFFUSE_MAP);
	}
};

GG.ScreenPass.prototype.setSourceTexture = function(texture) {
	this.sourceTexture = texture;
};


