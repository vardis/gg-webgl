/**
 * Simple particles rendering using points for each particle.
 * You can also specify a single texture and the attenuation factor.
 * 
 * psTechnique = new GG.ParticlesTechnique(texMap, 1.0);
 * psTechnique.initialize();
 * psTechnique.render(aParticleSystem);
 */
GG.ParticlesTechnique = function(spec) {
	spec = spec || {};
	GG.BaseTechnique.call(this, spec);

	this.texture = spec.texture || null;
	this.distanceAttenuation = spec.attenuation || 1.0;

	// stores compiled programs for different configurations of the techniques
	// and the particle system that is to be rendered
	this.programCache = [];

	this.vertexShader = [
		"attribute vec4 a_position;",
		
		"#ifdef USE_COLORS",
		"attribute vec3 a_color;",
		"varying vec3 v_color;",
		"#endif",

		"uniform mat4 u_matModelView;",
		"uniform mat4 u_matProjection;",
		"uniform float u_pointSize;",

		"void main() {",
		"	vec4 viewPos = u_matModelView * a_position;",
		"	gl_Position = u_matProjection * viewPos;",
		"	gl_PointSize = u_pointSize / (1.0 + length(viewPos.xyz));",

		"#ifdef USE_COLORS",
		"	v_colr = a_color;",
		"#endif",
		"}"
	].join("\n");
	
	this.fragmentShader = [
		"precision mediump float;",	

		"#ifdef USE_COLORS",		
		"varying vec3 v_color;",
		"#endif",		

		"#ifdef USE_MAP",
		"uniform sampler2D u_texture;",
		"#endif",

		"void main() {",
			"#ifdef USE_COLORS",
			"gl_FragColor = vec4(v_color, 1.0);",
			"#endif",

			"#ifdef USE_MAP",
			"gl_FragColor = gl_FragColor * texture2D(u_texture, gl_PointCoord);",
			"#endif",

			"#ifdef NO_COLORS_OR_MAP",
			"gl_FragColor = vec4(1.0);",
			"#endif",
		"}"
	].join("\n");
	
};

GG.ParticlesTechnique.prototype = new GG.BaseTechnique();
GG.ParticlesTechnique.prototype.constructor = GG.ParticlesTechnique;

GG.ParticlesTechnique.prototype.initialize = function() {

};

GG.ParticlesTechnique.prototype.destroy = function() {
	GG.BaseTechnique.prototype.destroy();
	
	this.programs.forEach(function(prog) {
		gl.deleteProgram(prog);
	});
};

GG.ParticlesTechnique.prototype.render = function(ps) {
	program = this.getSuitableProgram(ps);	

	if (program.uniformTexture != null) {
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(this.texture);
		gl.uniform1i(program.uniformTexture, 0);
	}
	if (!program.uniformSize) {		
		program.uniformSize = gl.getUniformLocation(program, "u_pointSize");
	}
	gl.uniform1f(program.uniformSize, ps.getPointSize());

	if (!program.uniformMV) {	
		program.uniformMV = gl.getUniformLocation(program, "u_matModelView");		
	}
	MV = mat4.create();
	mat4.multiply(this.renderer.getViewMatrix(), ps.getModelMatrix(), MV);
	gl.uniformMatrix4fv(program.uniformMV, false, MV);

	if (!program.uniformProjection) {	
		program.uniformProjection = gl.getUniformLocation(program, "u_matProjection");		
	}
	gl.uniformMatrix4fv(program.uniformProjection, false, this.renderer.getProjectionMatrix());

	this.renderer.renderPoints(program, ps.getVertexBuffer(), ps.getColorsBuffer());

	gl.useProgram(null);
};

GG.ParticlesTechnique.prototype.getSuitableProgram = function(ps) {

	vs = this.vertexShader;
	fs = this.fragmentShader;
	progKey = 1;
	instr = "";

	if (this.texture != null) {
		progKey += 2;
		vs = "#define USE_MAP\n" + vs;
		fs = "#define USE_MAP\n" + fs;

		instr += 'prog.uniformTexture = gl.getUniformLocation(prog, "u_texture");';
	}

	if (ps.getColorsBuffer() != null) {
		progKey += 4;
		vs = "#define USE_COLORS\n" + vs;
		fs = "#define USE_COLORS\n" + fs;
		instr += 'prog.attribColor = gl.getAttribLocation(prog, "a_color");';
	}

	if (this.texture == null && ps.getColorsBuffer() == null) {
		progKey += 8;
		vs = "#define NO_COLORS_OR_MAP\n" + vs;
		fs = "#define NO_COLORS_OR_MAP\n" + fs;
	}

	prog = this.programCache[progKey];
	if (prog == null) {
		prog = this.programCache[progKey] = this.createProgram(vs, fs);
	}
	
	gl.useProgram(prog);
	
	prog.attribPosition = gl.getAttribLocation(prog, "a_position");
	
	eval(instr);

	return prog;
};
