/**
 * Renders an object without shading, colors are fecthed from a single 2D texture.
 * Note that objects rendered using this technique must have texture coordinates 
 * defined in their geometry.
 *
 * tech = new GG.TexturedShadelessTechnique({ textures : t });
 */
GG.TexturedShadelessTechnique = function(texture, spec) {
	spec = spec || {};
	GG.BaseTechnique.call(this, spec);	

	this.texture = texture;

	this.vertexShader = [
		"attribute vec4 a_position;",
		"attribute vec2 a_texCoords;",
		"varying vec2 v_texCoords;",
		"uniform mat4 u_matModelView;",
		"uniform mat4 u_matProjection;",
		"void main() {",
		"	v_texCoords = a_texCoords;",
		"	gl_Position = u_matProjection*u_matModelView*a_position;",
		"}"
	].join("\n");
	
	this.fragmentShader = [
		"precision mediump float;",
		"varying vec2 v_texCoords;",
		"uniform sampler2D u_texture;",
		"void main() {",
		"	gl_FragColor = texture2D(u_texture, v_texCoords);",
		"}"
	].join("\n");
	
	this.program = null;
}

GG.TexturedShadelessTechnique.prototype = new GG.BaseTechnique();
GG.TexturedShadelessTechnique.prototype.constructor = GG.TexturedShadelessTechnique;

GG.TexturedShadelessTechnique.prototype.initialize = function() {
	GG.BaseTechnique.prototype.initialize();
	this.program = this.createProgram(this.vertexShader, this.fragmentShader);
	gl.useProgram(this.program);
	this.program.attribPosition = gl.getAttribLocation(this.program, "a_position");
	this.program.attribTexCoords = gl.getAttribLocation(this.program, "a_texCoords");
	this.program.uniformMV = gl.getUniformLocation(this.program, "u_matModelView");
	this.program.uniformProjection = gl.getUniformLocation(this.program, "u_matProjection");
	this.program.samplerUniform = gl.getUniformLocation(this.program, "u_texture");
};

GG.TexturedShadelessTechnique.prototype.destroy = function() {
	GG.BaseTechnique.prototype.destroy();
	gl.deleteProgram(this.program);
};

GG.TexturedShadelessTechnique.prototype.render = function(mesh, material) {
	// this could go to the renderer
	gl.useProgram(this.program);			
	
	MV = mat4.create();
	mat4.multiply(this.renderer.getViewMatrix(), mesh.getModelMatrix(), MV);
	gl.uniformMatrix4fv(this.program.uniformMV, false, MV);
	gl.uniformMatrix4fv(this.program.uniformProjection, false, this.renderer.getProjectionMatrix());

	gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(this.program.samplerUniform, 0);

	this.renderer.renderMesh(mesh, this.program);
};