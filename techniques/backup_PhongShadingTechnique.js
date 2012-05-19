GG.PhongShadingTechnique = function(spec) {
	spec = spec || {};
	GG.BaseTechnique.call(this, spec);

	this.vertexShader = [
		"attribute vec4 a_position;",
		"attribute vec3 a_normal;",		
		"uniform mat4 u_matInverseView;",
		"uniform mat4 u_matModelView;",
		"uniform mat4 u_matProjection;",
		"uniform mat3 u_matNormals;",		
		"varying vec3 v_normal;",
		"varying vec3 v_viewVector;",
		"varying vec4 v_viewPos;",

		"void main() {",
		"	vec4 viewPos = u_matModelView*a_position;",
		"	gl_Position = u_matProjection*viewPos;",
		"	v_normal = u_matNormals * a_normal;",
		"	v_viewVector = -viewPos.xyz; //(u_matInverseView * vec4(0.0, 0.0, 0.0, 1.0) - viewPos).xyz;",		
		"	v_viewPos = viewPos;",
		"}"
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

		"struct LightInfo {",
		"	vec3 position;",
		"	vec3 direction;",
		"	vec3 diffuse;",
		"	vec3 specular;",
		"	float attenuation;",
		"	float cosCutOff;",
		"};",

		"#ifdef NUM_POINT_LIGHTS",
		"uniform LightInfo u_pointLights[NUM_POINT_LIGHTS];",
		"void pointLightIrradiance(in vec3 normal, in vec3 view, in vec3 light, in LightInfo lightInfo, inout vec3 diffuse, inout vec3 specular) {",		
		"	float df = max(0.0, dot(normal, light));",
		"	float sp = pow(max(0.0, dot(reflect(-light, normal), view)), u_matShininess);",
		"	diffuse += df*lightInfo.diffuse;",
		"	specular += sp*lightInfo.specular;",
		"}",

		"#endif",

		"#ifdef NUM_DIRECTIONAL_LIGHTS",
		"uniform LightInfo u_directionalLights[NUM_DIRECTIONAL_LIGHTS];",
		"vec3 directionalLightIrradiance(in vec3 normal, in vec3 view, in vec3 light, out vec3 diffuse, out vec3 specular) {",		
		"	float df = max(0.0, dot(normal, light));",
		"	float sp = pow(max(0.0, dot(reflect(-light, normal), view)), u_matShininess);",
		"	return vec3(1.0, df, sp);",
		"}",

		"#endif",

		"#ifdef NUM_SPOT_LIGHTS",
		"uniform LightInfo u_spotLights[NUM_SPOT_LIGHTS];",
		"void spotLightIrradiance(in vec3 normal, in vec3 view, in vec3 light, in LightInfo lightInfo, out vec3 diffuse, out vec3 specular) {",		
		"	float df = max(0.0, dot(normal, light));",
		"	float cosSpot = dot(lightInfo.direction, -light);",
		"	df *= pow(cosSpot, -lightInfo.attenuation) * smoothstep(lightInfo.cosCutOff, 1.0, cosSpot);",
		"	float sp = pow(max(0.0, dot(reflect(-L, normal), view)), u_matShininess);",
		"	diffuse += df*lightInfo.diffuse;",
		"	specular += sp*lightInfo.specular;",
		"}",		
		"#endif",

		"void main() {",
		"	vec3 N = normalize(v_normal);",
		"	vec3 V = normalize(v_viewVector);",		
		"	vec3 diffuse = vec3(0.0);",
		"	vec3 specular = vec3(0.0);",

		"#ifdef NUM_POINT_LIGHTS",
		"	for (int i = 0; i < NUM_POINT_LIGHTS; i++) {",
		"		vec3 L = normalize(u_pointLights[i].position - v_viewPos.xyz);",
		"		pointLightIrradiance(N, V, L, u_pointLights[i], diffuse, specular);",
		"	}",
		"#endif",

		"#ifdef NUM_DIRECTIONAL_LIGHTS",
		"	for (int i = 0; i < NUM_DIRECTIONAL_LIGHTS; i++) {",
		"		directionalLightIrradiance(N, V, u_directionalLights[i].direction, diffuse, specular);",
		"	}",
		"#endif",

		"#ifdef NUM_SPOT_LIGHTS",
		"	for (int i = 0; i < NUM_SPOT_LIGHTS; i++) {",
		"		vec3 L = normalize(u_spotLights[i].position - v_viewPos.xyz);",
		"		spotLightIrradiance(N, V, L, u_spotLights[i], diffuse, specular);",
		"	}",
		"#endif",

		"	gl_FragColor = u_matAmbient + u_matDiffuse*vec4(diffuse, 1.0) + u_matSpecular*vec4(specular, 1.0);",
		//"	gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(0.45));",
		"}"
	].join("\n");
	
	this.programsCache = {};
};

GG.PhongShadingTechnique.prototype = new GG.BaseTechnique();
GG.PhongShadingTechnique.prototype.constructor = GG.PhongShadingTechnique;

GG.PhongShadingTechnique.prototype.initialize = function() {
	GG.BaseTechnique.prototype.initialize();	
};

GG.PhongShadingTechnique.prototype.destroy = function() {
	GG.BaseTechnique.prototype.destroy();
	for (k in this.programsCache)
		gl.deleteProgram(this.programsCache[k]);
};


GG.PhongShadingTechnique.prototype.__setLightsUniform = function (program, viewMat, uniformName, lights) {
	mm = {
		position : 3,
		direction : 3,
		diffuse : 3,
		specular : 3,
		attenuation : 1,
		cosCutOff : 1
	}
	for (var i = 0; i < lights.length; i++) {
		for (k in mm) {
			field = uniformName + "[" + i + "]." + k;
			if (k == 'position') {
				var val = vec3.create();
				mat4.multiplyVec3(viewMat, lights[i].position, val);
			} else if (k == 'direction') {
				var val = vec3.create();
				mat4.multiplyVec3(viewMat, [lights[i].direction[0], lights[i].direction[1], lights[i].direction[2], 0.0], val);
			} else {
				var val = lights[i][k];
			}				
			eval("gl.uniform" + (mm[k] > 1 ? "3fv" : "1f") + "(program[field], val)");
		}
	}
};

GG.PhongShadingTechnique.prototype.__createLightUniforms = function(program, uniformName, lights) {
	attribs = {
		position : 3,
		direction : 3,
		diffuse : 3,
		specular : 3,
		attenuation : 1,
		cosCutOff : 1
	}
	
	for (var i = 0; i < lights.length; i++) {
		for (k in attribs) {
			field = uniformName + "[" + i + "]." + k;		
			try {
				eval("program['" + field + "'] = gl.getUniformLocation(program, field);");	
			}catch (ex) {
				console.log(ex)
			}
			
		}
	}
}

GG.PhongShadingTechnique.prototype.__createProgramFromParams = function(pointLights, directionalLights, spotLights) {
	
	if (pointLights.length > 0)
	fs = "#define NUM_POINT_LIGHTS " + pointLights.length + "\n" + this.fragmentShader;
	
	if (directionalLights.length > 0)
	fs = "#define NUM_DIRECTIONAL_LIGHTS " + directionalLights.length + "\n" + this.fragmentShader;
	
	if (spotLights.length > 0)
	fs = "#define NUM_SPOT_LIGHTS " + spotLights.length + "\n" + this.fragmentShader;

	key = pointLights.length + "_" + directionalLights.length + "_" + spotLights.length;
	var program = this.programsCache[key];

	if (program == undefined) {		
		var program = this.createProgram(this.vertexShader, fs);	
		this.programsCache[key] = program;

		if (pointLights.length > 0)
			this.__createLightUniforms(program, "u_pointLights", pointLights);
		
		if (directionalLights.length > 0)
			this.__createLightUniforms(program, "u_directionalLights", directionalLights);
		
		if (spotLights.length > 0)
			this.__createLightUniforms(program, "u_spotLights", spotLights);

		program.attribPosition = gl.getAttribLocation(program, "a_position");
		program.attribNormal = gl.getAttribLocation(program, "a_normal");

		program.uniformMV = gl.getUniformLocation(program, "u_matModelView");
		program.uniformProjection = gl.getUniformLocation(program, "u_matProjection");
		//program.uniformViewMatrix = gl.getUniformLocation(program, "u_matView");
		program.uniformNormalsMatrix = gl.getUniformLocation(program, "u_matNormals");
		program.uniformInverseView = gl.getUniformLocation(program, "u_matInverseView");

		program.uniformMatAmbient = gl.getUniformLocation(program, "u_matAmbient");
		program.uniformMatDiffuse = gl.getUniformLocation(program, "u_matDiffuse");
		program.uniformMatSpecular = gl.getUniformLocation(program, "u_matSpecular");
		program.uniformMatShininess = gl.getUniformLocation(program, "u_matShininess");
		}
		
	gl.useProgram(program);
	return program;
};

GG.PhongShadingTechnique.prototype.render = function(mesh, material, lights) {

	pointLights = [];
	spotLights = [];
	directionalLights = [];
	for (var i = 0; i < lights.length; i++) {
		if (lights[i].lightType == GG.LT_POINT) pointLights.push(lights[i]);
		else if (lights[i].lightType == GG.LT_DIRECTIONAL) directionalLights.push(lights[i]);
		else if (lights[i].lightType == GG.LT_SPOT) spotLights.push(lights[i]);
	}

	var program = this.__createProgramFromParams(pointLights, directionalLights, spotLights);
	gl.useProgram(program);			
	
	var viewMat = this.renderer.getViewMatrix();

	if (pointLights.length > 0)	
	this.__setLightsUniform(program, viewMat, "u_pointLights", pointLights);

	if (directionalLights.length > 0)	
	this.__setLightsUniform(program, viewMat, "u_directionalLights", directionalLights);
	
	if (spotLights.length > 0)	
	this.__setLightsUniform(program, viewMat, "u_spotLights", spotLights);

	MV = mat4.create();
	mat4.multiply(viewMat, mesh.getModelMatrix(), MV);
	gl.uniformMatrix4fv(program.uniformMV, false, MV);
	//gl.uniformMatrix4fv(program.uniformViewMatrix, false, viewMat);
	gl.uniformMatrix4fv(program.uniformInverseView, false, this.renderer.getInverseViewMatrix());

	NM = mat4.create();
	mat4.inverse(mesh.getModelMatrix(), NM);
	mat4.transpose(NM);
	gl.uniformMatrix3fv(program.uniformNormalsMatrix, false, mat4.toMat3(NM));
	gl.uniformMatrix4fv(program.uniformProjection, false, this.renderer.getProjectionMatrix());

	gl.uniform4fv(program.uniformMatAmbient, material.ambient);
	gl.uniform4fv(program.uniformMatDiffuse, material.diffuse);
	gl.uniform4fv(program.uniformMatSpecular, material.specular);
	gl.uniform1f(program.uniformMatShininess, material.shininess);

	this.renderer.renderMesh(mesh, program);
};