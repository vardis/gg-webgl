GG.ReflectiveTechnique = function(spec) {

	spec = spec || {};
	GG.BaseTechnique.call(this, spec);

	// amount of reflectance
	this.reflectance = 0.80;

	this.baseColor = spec.baseColor || [ 0.30, 0.30, 0.30, 1.0 ];

	// index of refraction of the object being rendered
	this.IOR = spec.IOR || [ 1.0, 1.0, 1.0 ];

	// index of refraction of the environment surounding the object 
	this.externalIOR = spec.externalIOR || [ 1.330, 1.31, 1.230 ];

	this.cubemap = spec.cubemap || null;
	
	this.fresnelBias = spec.fresnelBias || 0.44;

	this.fresnelExponent = spec.fresnelExponent || 2.0;

	this.vertexShader = [
		"attribute vec4 a_position;",
		"attribute vec3 a_normal;",

		"uniform mat4 u_matModel;",
		"uniform mat4 u_matViewInverse;",
		"uniform mat4 u_matModelView;",
		"uniform mat4 u_matProjection;",

		"varying vec3 v_viewVector;",
		"varying vec3 v_normal;",

		"void main() {",
		"	gl_Position = u_matProjection*u_matModelView*a_position;",
		"	vec4 wPos = u_matModel * a_position;",
		"	v_normal = (u_matModel * vec4(a_normal, 0.0)).xyz;",
		"	vec4 wCameraPos = u_matViewInverse * vec4(0.0, 0.0, 0.0, 1.0);",
		"	v_viewVector = (wPos - wCameraPos).xyz;",		
		"}"
	].join("\n");
	
	this.fragmentShader = [
		"precision mediump float;",

		"varying vec3 v_viewVector;",
		"varying vec3 v_normal;",

		"uniform vec4 u_baseColor;",
		"uniform float u_reflectance;",
		"uniform vec3 u_eta;",

		// (bias, exponent)
		"uniform vec2 u_fresnelParams;",

		"uniform samplerCube u_cubemap;",

		"float schlick_fresnel(vec3 I, vec3 N, float bias, float exponent)",
		"{",		
		"   return bias - (1.0 - bias)*pow(1.0 - dot(N, I), exponent); ",
		"}",

		"void main() {",
		"	vec3 I = normalize(v_viewVector);",
		"	vec3 N = normalize(v_normal);",
		"	vec3 r = reflect(I, N);",
		"	vec3 reflColor = textureCube(u_cubemap, r).rgb;",

		"	vec3 transmColor;",
		"	vec3 t = refract(I, N, u_eta.x);",
		"	transmColor.r = textureCube(u_cubemap, t).r;",

		"	t = refract(I, N, u_eta.y);",
		"	transmColor.g = textureCube(u_cubemap, t).g;",

		"	t = refract(I, N, u_eta.z);",
		"	transmColor.b = textureCube(u_cubemap, t).b;",

		"	float freshnelTerm = schlick_fresnel(-I, N, u_fresnelParams.x, u_fresnelParams.y);",
		"	vec3 envColor = mix(transmColor, reflColor, freshnelTerm);",		
		//"	envColor = mix(transmColor, reflColor, u_reflectance);",
		"	gl_FragColor = vec4(mix(u_baseColor.rgb, envColor, u_reflectance), 1.0);",
		"}"
	].join("\n");
	
	this.program = null;
};

GG.ReflectiveTechnique.prototype = new GG.BaseTechnique();
GG.ReflectiveTechnique.prototype.constructor = GG.ReflectiveTechnique;

GG.ReflectiveTechnique.prototype.initialize = function() {
	GG.BaseTechnique.prototype.initialize();
	this.program = this.createProgram(this.vertexShader, this.fragmentShader);
	gl.useProgram(this.program);
	this.program.attribPosition = gl.getAttribLocation(this.program, "a_position");
	this.program.attribNormal = gl.getAttribLocation(this.program, "a_normal");
	this.program.uniformBaseColor = gl.getUniformLocation(this.program, "u_baseColor");
	this.program.uniformMV = gl.getUniformLocation(this.program, "u_matModelView");
	this.program.uniformModel = gl.getUniformLocation(this.program, "u_matModel");
	this.program.uniformViewInverse = gl.getUniformLocation(this.program, "u_matViewInverse");
	this.program.uniformProjection = gl.getUniformLocation(this.program, "u_matProjection");
	this.program.uniformCubemap = gl.getUniformLocation(this.program, "u_cubemap");
	this.program.uniformReflectance = gl.getUniformLocation(this.program, "u_reflectance");
	this.program.uniformEta = gl.getUniformLocation(this.program, "u_eta");
	this.program.uniformFresnelParams = gl.getUniformLocation(this.program, "u_fresnelParams");
};

GG.ReflectiveTechnique.prototype.render = function(mesh, material) {
	// this could go to the renderer
	gl.useProgram(this.program);				
	
	MV = mat4.create();
	mat4.multiply(this.renderer.getViewMatrix(), mesh.getModelMatrix(), MV);
	gl.uniformMatrix4fv(this.program.uniformMV, false, MV);
	gl.uniformMatrix4fv(this.program.uniformProjection, false, this.renderer.getProjectionMatrix());
	gl.uniformMatrix4fv(this.program.uniformViewInverse, false, this.renderer.getInverseViewMatrix());
	gl.uniformMatrix4fv(this.program.uniformModel, false, mesh.getModelMatrix());

	gl.activeTexture(gl.TEXTURE0);
	this.cubemap.bind();
	gl.uniform1i(this.program.uniformCubemap, 0);

	gl.uniform3fv(this.program.uniformEta, [ 
		this.IOR[0] / this.externalIOR[0],
		this.IOR[1] / this.externalIOR[1],
		this.IOR[2] / this.externalIOR[2] ]);
	gl.uniform4fv(this.program.uniformBaseColor, this.baseColor);
	gl.uniform2fv(this.program.uniformFresnelParams, [ this.fresnelBias, this.fresnelExponent ]);
	gl.uniform1f(this.program.uniformReflectance, this.reflectance);
 
 	gl.enable(gl.CULL_FACE);

	this.renderer.renderMesh(mesh, this.program);
};
