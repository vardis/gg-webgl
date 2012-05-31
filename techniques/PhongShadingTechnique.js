GG.PhongShadingTechnique = function(spec) {
	spec = spec || {};
	GG.BaseTechnique.call(this, spec);

	this.phonPass = new GG.RenderPass();

	this.vertexShader = [
		"attribute vec4 a_position;",
		"attribute vec3 a_normal;",				
		"uniform mat4 u_matModelView;",
		"uniform mat4 u_matProjection;",
		"uniform mat3 u_matNormals;",		
		"varying vec3 v_normal;",
		"varying vec3 v_viewVector;",
		"varying highp vec4 v_viewPos;",

		"void main() {",
		"	vec4 viewPos = u_matModelView*a_position;",
		"	gl_Position = u_matProjection*viewPos;",
		"	v_normal = u_matNormals * a_normal;",
		"	v_viewVector = -viewPos.xyz; //(u_matInverseView * vec4(0.0, 0.0, 0.0, 1.0) - viewPos).xyz;",		
		"	v_viewPos = viewPos;",
		"}"
	].join("\n");
	
	this.fragmentPointLight = [		
		"	L = normalize(u_matView*vec4(u_pointLights[INDEX].position, 1.0) - v_viewPos).xyz;",
		"	pointLightIrradiance(N, V, L, u_pointLights[INDEX], diffuse, specular);"
		].join("\n");

	this.fragmentDirectionalLight = [
		"	L = normalize(u_matView*vec4(u_directionalLights[INDEX].direction, 0.0)).xyz;",
		"	directionalLightIrradiance(N, V, L, u_directionalLights[INDEX], diffuse, specular);",
		].join("\n");

	this.fragmentSpotLight = [
		"	L = normalize(u_matView*vec4(u_spotLights[INDEX].position, 1.0) - v_viewPos).xyz;",
		"	spotLightIrradiance(N, V, L, u_spotLights[INDEX], diffuse, specular);"
		].join("\n");

	this.fragmentShader = [
		"precision mediump float;",

		"varying vec3 v_normal;",
		"varying vec3 v_viewVector;",		
		"varying vec4 v_viewPos;",
		"uniform vec4 u_matAmbient;",
		"uniform vec4 u_matDiffuse;",
		"uniform vec4 u_matSpecular;",
		"uniform float u_matShininess;",

		"uniform mat4 u_matView;",

		GG.ShaderLib.blocks['lightInfoStructure'],

		"#ifdef NUM_POINT_LIGHTS",
		"uniform LightInfo u_pointLights[NUM_POINT_LIGHTS];",

		GG.ShaderLib.blocks['pointLightIrradiance'],

		"#endif",

		"#ifdef NUM_DIRECTIONAL_LIGHTS",
		"uniform LightInfo u_directionalLights[NUM_DIRECTIONAL_LIGHTS];",

		GG.ShaderLib.blocks['directionalLightIrradiance'],

		"#endif",

		"#ifdef NUM_SPOT_LIGHTS",
		"uniform LightInfo u_spotLights[NUM_SPOT_LIGHTS];",

		GG.ShaderLib.blocks['spotLightIrradiance'], 

		"#endif",

		"void main() {",
		"	vec3 N = normalize(v_normal);",
		"	vec3 V = normalize(v_viewVector);",		
		"	vec3 diffuse = vec3(0.0);",
		"	vec3 specular = vec3(0.0);",
		"	vec3 L;",

		"#ifdef NUM_POINT_LIGHTS",
		"	<<POINT_LIGHTS_FRAGMENT>>",
		"#endif",

		"#ifdef NUM_DIRECTIONAL_LIGHTS",
		"	<<DIRECTIONAL_LIGHTS_FRAGMENT>>",
		"#endif",

		"#ifdef NUM_SPOT_LIGHTS",
		"	<<SPOT_LIGHTS_FRAGMENT>> ",
		"#endif",

		"	gl_FragColor = u_matAmbient + u_matDiffuse*vec4(diffuse, 1.0) + u_matSpecular*vec4(specular, 1.0);",
		"	gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(0.5));",
		"}"
	].join("\n");
	
	this.cachedPasses = {};
};

GG.PhongShadingTechnique.prototype = new GG.BaseTechnique();
GG.PhongShadingTechnique.prototype.constructor = GG.PhongShadingTechnique;

GG.PhongShadingTechnique.prototype.initialize = function() {
	GG.BaseTechnique.prototype.initialize();	
};

GG.PhongShadingTechnique.prototype.destroy = function() {
	GG.BaseTechnique.prototype.destroy();
	for (var k in this.cachedPasses)
		gl.deleteProgram(this.cachedPasses[k].program);
};

GG.PhongShadingTechnique.prototype.__createProgramFromParams = function(ctx) {
	var pointLights = ctx.scene.listPointLights();
	var directionalLights = ctx.scene.listDirectionalLights();
	var spotLights = ctx.scene.listSpotLights();

	var key = pointLights.length + "_" + directionalLights.length + "_" + spotLights.length;
	var pass = this.cachedPasses[key];

	if (pass == undefined) {		
		var fs = this.fragmentShader;

		if (pointLights.length > 0) {
			fs = "#define NUM_POINT_LIGHTS " + pointLights.length + "\n" + fs;
			var lc = "";
			for (var i = 0; i < pointLights.length; i++) {
				lc += this.fragmentPointLight.replace(/INDEX/g, i) + "\n";
			}
			fs = fs.replace("<<POINT_LIGHTS_FRAGMENT>>", lc);
		}
	
		if (directionalLights.length > 0) {
			fs = "#define NUM_DIRECTIONAL_LIGHTS " + directionalLights.length + "\n" + fs;
			var lc = "";
			for (var i = 0; i < directionalLights.length; i++) {
				lc += this.fragmentDirectionalLight.replace(/INDEX/g, i) + "\n";
			}
			fs = fs.replace("<<DIRECTIONAL_LIGHTS_FRAGMENT>>", lc);
		}

		if (spotLights.length > 0) {
			fs = "#define NUM_SPOT_LIGHTS " + spotLights.length + "\n" + fs;
			var lc = "";
			for (var i = 0; i < spotLights.length; i++) {
				lc += this.fragmentSpotLight.replace(/INDEX/g, i) + "\n";
			}
			fs = fs.replace("<<SPOT_LIGHTS_FRAGMENT>>", lc);
		}

		pass = new GG.RenderPass({
			vertexShader : this.vertexShader,
			fragmentShader : fs,
			callback : this,
			uniforms : ['u_matModelView', 'u_matNormals', 'u_matAmbient', 'u_matDiffuse', 'u_matSpecular', 'u_matShininess']
		});
		pass.initialize();

		var program = pass.program; //this.createProgram(this.vertexShader, fs);	
		this.cachedPasses[key] = pass;

		if (pointLights.length > 0)
			GG.ProgramUtils.createLightUniforms(program, "u_pointLights", pointLights);
		
		if (directionalLights.length > 0)
			GG.ProgramUtils.createLightUniforms(program, "u_directionalLights", directionalLights);
		
		if (spotLights.length > 0)
			GG.ProgramUtils.createLightUniforms(program, "u_spotLights", spotLights);
	}
	return pass;
};

GG.PhongShadingTechnique.prototype.__setCustomAttributes = function(mesh, ctx, program) {
};

GG.PhongShadingTechnique.prototype.__setCustomUniforms = function(mesh, ctx, program) {
	var viewMat = ctx.camera.getViewMatrix();

	if (ctx.scene.hasPointLights())	
		GG.ProgramUtils.setLightsUniform(program, viewMat, "u_pointLights", ctx.scene.listPointLights());

	if (ctx.scene.hasDirectionalLights())	
		GG.ProgramUtils.setLightsUniform(program, viewMat, "u_directionalLights", ctx.scene.listDirectionalLights());
	
	if (ctx.scene.hasSpotLights())	
		GG.ProgramUtils.setLightsUniform(program, viewMat, "u_spotLights", ctx.scene.listSpotLights());

	var MV = mat4.create();
	mat4.multiply(viewMat, mesh.getModelMatrix(), MV);
	gl.uniformMatrix4fv(program.u_matModelView, false, MV);

	var NM = mat4.create();
	mat4.inverse(MV, NM);
	mat4.transpose(NM);
	gl.uniformMatrix3fv(program.u_matNormals, false, mat4.toMat3(NM));

	gl.uniform4fv(program.u_matAmbient, mesh.material.ambient);
	gl.uniform4fv(program.u_matDiffuse, mesh.material.diffuse);
	gl.uniform4fv(program.u_matSpecular, mesh.material.specular);
	gl.uniform1f(program.u_matShininess, mesh.material.shininess);
};

GG.PhongShadingTechnique.prototype.render = function(mesh, ctx) {
	var pass = this.__createProgramFromParams(ctx);
	pass.render(mesh, ctx);
};