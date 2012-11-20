/**
 * Renders an object without shading, colors are fecthed from a single 2D texture.
 * Note that objects rendered using this technique must have texture coordinates 
 * defined in their geometry.
 *
 * tech = new GG.TexturedShadelessTechnique({ textures : t });
 */
GG.TexturedShadelessTechnique = function(texture, spec) {
	spec = spec || {};
	spec.passes = [new GG.PhongPass( { 'texture' : texture })];
	GG.BaseTechnique.call(this, spec);	
};

GG.TexturedShadelessTechnique.prototype = new GG.BaseTechnique();
GG.TexturedShadelessTechnique.prototype.constructor = GG.TexturedShadelessTechnique;

GG.TexturedShadelessPass = function (spec) {	
	spec = spec || {};
	GG.RenderPass.call(this, spec);

	this.texture = spec.texture;

	var pg = new GG.ProgramSource();
	pg.position()
		.texCoords()
		.uniformModelViewMatrix()
		.uniformProjectionMatrix()
		.varying('vec2', 'v_texCoords')
		.addMainBlock([
			"	v_texCoords = a_texCoords;",
			"	gl_Position = u_matProjection*u_matModelView*a_position;",
			].join('\n')
		);

	this.vertexShader = pg.toString();
	
	pg = new GG.ProgramSource();
	pg.asFragmentShader()
		.varying('vec2', 'v_texCoords')
		.uniform('sampler2D', 'u_texture')
		.addMainBlock("gl_FragColor = texture2D(u_texture, v_texCoords);");

	this.fragmentShader = pg.toString();	
};


GG.TexturedShadelessPass.prototype = new GG.RenderPass();
GG.TexturedShadelessPass.prototype.constructor = GG.TexturedShadelessPass;

GG.TexturedShadelessPass.prototype.__setCustomUniforms = function(renderable, ctx, program) {
	this.texture.bindAtUnit(GG.TEX_UNIT_DIFFUSE_MAP_0);
    gl.uniform1i(this.program.samplerUniform.handle(), 0);
};