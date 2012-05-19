/**
 * Simplifies the creation of render passes that perform a screen space
 * effect, for e.g. tone mapping, bloom, blur, etc.
 */
GG.ScreenPass = function(spec) {
	spec = spec || {};
	uniforms = spec.uniforms || [];
	uniforms = uniforms.concat(['u_sourceTexture']);
	spec.uniforms = uniforms;

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

GG.ScreenPass.prototype.__setCustomUniforms = function() {
	// the default sourceTexture always goes to texture unit 0
	if (this.sourceTexture != null) {
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.sourceTexture);
		gl.uniform1i(this.program.u_sourceTexture, 0);
	}
}


