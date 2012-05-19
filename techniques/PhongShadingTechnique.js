GG.PhongShadingTechnique = function(spec) {
	spec = spec || {};
	GG.BaseTechnique.call(this, spec);

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
		"	float df = clamp(dot(normal, light), 0.0, 1.0);",
		"	float sp = pow(max(0.0, dot(reflect(-light, normal), view)), u_matShininess);",
		"	diffuse += df*lightInfo.diffuse;",
		"	specular += step(0.0, df)*sp*lightInfo.specular;",
		"}",

		"#endif",

		"#ifdef NUM_DIRECTIONAL_LIGHTS",
		"uniform LightInfo u_directionalLights[NUM_DIRECTIONAL_LIGHTS];",

		"void directionalLightIrradiance(in vec3 normal, in vec3 view, in vec3 light, in LightInfo lightInfo, inout vec3 diffuse, inout vec3 specular) {",		
		"	float df = clamp(dot(normal, light), 0.0, 1.0);",
		"	float sp = pow(max(0.0, dot(reflect(-light, normal), view)), u_matShininess);",
		"	diffuse += df*lightInfo.diffuse;",
		"	specular += step(0.0, df)*sp*lightInfo.specular;",
		"}",

		"#endif",

		"#ifdef NUM_SPOT_LIGHTS",
		"uniform LightInfo u_spotLights[NUM_SPOT_LIGHTS];",

		"void spotLightIrradiance(in vec3 normal, in vec3 view, in vec3 light, in LightInfo lightInfo, inout vec3 diffuse, inout vec3 specular) {",		
		"	float df = clamp(dot(normal, light), 0.0, 1.0);",
		"	float cosSpot = clamp(dot(normalize(u_matView*vec4(lightInfo.direction, 0.0)).xyz, -light), 0.0, 1.0);",
		"	df *= pow(cosSpot, -lightInfo.attenuation) * smoothstep(lightInfo.cosCutOff, 1.0, cosSpot);",
		"	float sp = pow(max(0.0, dot(reflect(-light, normal), view)), u_matShininess);",
		"	diffuse += df*lightInfo.diffuse;",
		"	specular += step(0.00001, df)*sp*lightInfo.specular;",
		"}",		
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

		"	gl_FragColor = /*vec4(abs(diffuse), 1.0); */u_matAmbient + u_matDiffuse*vec4(diffuse, 1.0) + u_matSpecular*vec4(specular, 1.0);",
		"	gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(0.5));",
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
	uniforms = {
		position : ["position", 3],
		direction : ["direction", 3],
		diffuse : ["diffuse", 3],
		specular : ["specular", 3],
		attenuation : ["attenuation", 1],
		cosCutOff : ["cosCutOff", 1]
	}
	for (var i = 0; i < lights.length; i++) {
		lightIndex = lights.length > 1 ? "[" + i + "]" : "";
		for (k in uniforms) {
			field = uniformName + lightIndex + "." + uniforms[k][0] ;			
			var val = lights[i][k];
			eval("gl.uniform" + (uniforms[k][1] > 1 ? "3fv" : "1f") + "(program[field], val)");
		}
	}
};

GG.PhongShadingTechnique.prototype.__createLightUniforms = function(program, uniformName, lights) {
	uniforms = {
		position : ["position", 3],
		direction : ["direction", 3],
		diffuse : ["diffuse", 3],
		specular : ["specular", 3],
		attenuation : ["attenuation", 1],
		cosCutOff : ["cosCutOff", 1]
	}
	
	for (var i = 0; i < lights.length; i++) {
		lightIndex = lights.length > 1 ? "[" + i + "]" : "";
		for (k in uniforms) {
			field = uniformName + lightIndex + "." + uniforms[k][0];
			try {
				eval("program[field] = gl.getUniformLocation(program, field);");	
			}catch (ex) {
				console.log(ex)
			}
			
		}
	}
}

GG.PhongShadingTechnique.prototype.__createProgramFromParams = function(pointLights, directionalLights, spotLights) {
	
	key = pointLights.length + "_" + directionalLights.length + "_" + spotLights.length;
	var program = this.programsCache[key];

	if (program == undefined) {		
		fs = this.fragmentShader;

		if (pointLights.length > 0) {
			fs = "#define NUM_POINT_LIGHTS " + pointLights.length + "\n" + fs;
			lc = "";
			for (i = 0; i < pointLights.length; i++) {
				lc += this.fragmentPointLight.replace(/INDEX/g, i) + "\n";
			}
			fs = fs.replace("<<POINT_LIGHTS_FRAGMENT>>", lc);
		}
	
	
		if (directionalLights.length > 0) {
			fs = "#define NUM_DIRECTIONAL_LIGHTS " + directionalLights.length + "\n" + fs;
			lc = "";
			for (i = 0; i < directionalLights.length; i++) {
				lc += this.fragmentDirectionalLight.replace(/INDEX/g, i) + "\n";
			}
			fs = fs.replace("<<DIRECTIONAL_LIGHTS_FRAGMENT>>", lc);
		}

		if (spotLights.length > 0) {
			fs = "#define NUM_SPOT_LIGHTS " + spotLights.length + "\n" + fs;
			lc = "";
			for (i = 0; i < spotLights.length; i++) {
				lc += this.fragmentSpotLight.replace(/INDEX/g, i) + "\n";
			}
			fs = fs.replace("<<SPOT_LIGHTS_FRAGMENT>>", lc);
		}

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
		program.uniformViewMatrix = gl.getUniformLocation(program, "u_matView");
		program.uniformNormalsMatrix = gl.getUniformLocation(program, "u_matNormals");

		program.uniformMatAmbient = gl.getUniformLocation(program, "u_matAmbient");
		program.uniformMatDiffuse = gl.getUniformLocation(program, "u_matDiffuse");
		program.uniformMatSpecular = gl.getUniformLocation(program, "u_matSpecular");
		program.uniformMatShininess = gl.getUniformLocation(program, "u_matShininess");
		}
		
	gl.useProgram(program);
	return program;
};

GG.PhongShadingTechnique.prototype.render = function(mesh, lights) {

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
	gl.uniformMatrix4fv(program.uniformViewMatrix, false, viewMat);

	NM = mat4.create();
	mat4.inverse(MV, NM);
	mat4.transpose(NM);
	gl.uniformMatrix3fv(program.uniformNormalsMatrix, false, mat4.toMat3(NM));
	gl.uniformMatrix4fv(program.uniformProjection, false, this.renderer.getProjectionMatrix());

	gl.uniform4fv(program.uniformMatAmbient, mesh.material.ambient);
	gl.uniform4fv(program.uniformMatDiffuse, mesh.material.diffuse);
	gl.uniform4fv(program.uniformMatSpecular, mesh.material.specular);
	gl.uniform1f(program.uniformMatShininess, mesh.material.shininess);

	this.renderer.renderMesh(mesh, program);
};