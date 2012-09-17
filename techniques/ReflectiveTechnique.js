GG.ReflectiveTechnique = function(spec) {	
	spec        = spec || {};
	spec.passes = [ new GG.ReflectiveTechnique.ReflectivePass(spec)];
	GG.BaseTechnique.call(this, spec);

};

GG.ReflectiveTechnique.prototype = new GG.BaseTechnique();
GG.ReflectiveTechnique.prototype.constructor = GG.ReflectiveTechnique;

GG.ReflectiveTechnique.ReflectivePass = function (spec) {
	
	spec.vertexShader = [
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
	
	spec.fragmentShader = [
		"precision mediump float;",

		"varying vec3 v_viewVector;",
		"varying vec3 v_normal;",

		"uniform vec3 u_baseColor;",
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
		"	gl_FragColor = vec4(mix(u_baseColor, envColor, u_reflectance), 1.0);",
		"}"
	].join("\n");
	
	GG.RenderPass.call(this, spec);
};

GG.ReflectiveTechnique.ReflectivePass.prototype = new GG.RenderPass();
GG.ReflectiveTechnique.ReflectivePass.prototype.constructor = GG.ReflectiveTechnique.ReflectivePass;

GG.ReflectiveTechnique.ReflectivePass.prototype.__setCustomUniforms = function(renderable, ctx, program) {
	var mat = renderable.getMaterial();
	gl.uniform1i(this.program.u_cubemap, GG.TEX_UNIT_ENV_MAP);

	gl.uniform3fv(this.program.u_eta, [ 
		mat.IOR[0] / mat.externalIOR[0],
		mat.IOR[1] / mat.externalIOR[1],
		mat.IOR[2] / mat.externalIOR[2] ]);
	gl.uniform3fv(this.program.u_baseColor, mat.diffuse);
	gl.uniform2fv(this.program.u_fresnelParams, [ mat.fresnelBias, mat.fresnelExponent ]);
	gl.uniform1f(this.program.u_reflectance, mat.reflectance);
};

GG.ReflectiveTechnique.ReflectivePass.prototype.__setCustomRenderState = function(renderable, ctx, program) {	
	renderable.getMaterial().envMap.bind();	
 	gl.enable(gl.CULL_FACE);
};
