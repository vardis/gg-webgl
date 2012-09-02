GG.ShaderLib = new function (argument) {
	
	return lib = {
		blit : {
			vertex : [
			"attribute vec4 a_position;",
			"varying vec2 v_texCoords;",

			"void main() {",
			"	v_texCoords = 0.5*(a_position.xy + vec2(1.0));",
			"	gl_Position = a_position;",
			"}"].join('\n'),

			fragment : [
			"precision mediump float;",
			"uniform sampler2D u_sourceTexture;",
			"varying vec2 v_texCoords;",

			"void main() {",
			"	gl_FragColor = texture2D(u_sourceTexture, v_texCoords);",
			"}"].join('\n'),

			uniforms : ['u_sourceTexture']
		},

		phong : {
			'pointLightIrradiance' : [
			"void pointLightIrradiance(in vec3 normal, in vec3 view, in vec3 light, in LightInfo lightInfo, in Material_t mat, inout vec3 diffuse, inout vec3 specular) {",		
			"	float df = clamp(dot(normal, light), 0.0, 1.0);",
			"	float sp = pow(max(0.0, dot(reflect(-light, normal), view)), mat.shininess);",
			"	diffuse += df*lightInfo.diffuse;",
			"	specular += step(0.00001, df)*sp*lightInfo.specular;",
			"}"
			].join('\n'),

			'directionalLightIrradiance' : [
			"void directionalLightIrradiance(in vec3 normal, in vec3 view, in vec3 light, in LightInfo lightInfo, in Material_t mat, inout vec3 diffuse, inout vec3 specular) {",		
			"	float df = clamp(dot(normal, light), 0.0, 1.0);",
			"	float sp = pow(max(0.0, dot(reflect(-light, normal), view)), mat.shininess);",
			"	diffuse += df*lightInfo.diffuse;",
			"	specular += step(0.00001, df)*sp*lightInfo.specular;",
			"}"
			].join('\n'),

			'spotLightIrradiance' : [
			"void spotLightIrradiance(in vec3 normal, in vec3 view, in vec3 light, in LightInfo lightInfo, in Material_t mat, inout vec3 diffuse, inout vec3 specular) {",		
			"	float df = clamp(dot(normal, light), 0.0, 1.0);",
			"	float cosSpot = clamp(dot(normalize(u_matView*vec4(lightInfo.direction, 0.0)).xyz, -light), 0.0, 1.0);",
			"	df *= pow(cosSpot, -lightInfo.attenuation) * smoothstep(lightInfo.cosCutOff, 1.0, cosSpot);",
			"	float sp = pow(max(0.0, dot(reflect(-light, normal), view)), mat.shininess);",
			"	diffuse += df*lightInfo.diffuse;",
			"	specular += step(0.00001, df)*sp*lightInfo.specular;",
			"}"
			].join('\n')
		},

		blocks : {
			// Packs a normalized half to a vec2.
			'libPackHalfToVec2' : [
			" ",
			"vec2 libPackHalfToVec2(float value) {",
			"	float r = value;",
			"	float g = fract(r*256.0);",
			"	return vec2(r, g);",
			"}"
			].join('\n'),

			// Packs a normalized float to a vec4.
			'libPackFloatToRGBA' : [
			" ",
			"vec4 libPackFloatToRGBA(float value) {",
			"	float r = value;",
			"	float g = fract(r*256.0);",
			"	float b = fract(g*256.0);",
			"	float a = fract(b*256.0);",
			"	return vec4(r, g, b, a);",
			"}"
			].join('\n'),

			'libUnpackRrgbaToFloat' : [
				"float libUnpackRrgbaToFloat(vec4 enc) {",
				"	const vec4 bitShifts = vec4(1.0, 1.0 / 256.0, 1.0 / (256.0 * 256.0), 1.0 / (256.0 * 256.0 * 256.0));",
				"	return dot(enc, bitShifts);",
				"}"
			].join('\n'),

			'libUnpackVec2ToFloat' : [
				"float libUnpackVec2ToFloat(vec2 enc) {",
				"	const vec2 bitShifts = vec2(1.0, 1.0 / 256.0);",
				"	return dot(enc, bitShifts);",
				"}"
			].join('\n'),

			'lightInfoStructure' : [
			"struct LightInfo {",
			"	vec3 position;",
			"	vec3 direction;",
			"	vec3 diffuse;",
			"	vec3 specular;",
			"	float attenuation;",
			"	float cosCutOff;",
			"};"
			].join('\n'),

			'materialInfoStructure' : [
			"struct Material_t {",
			"	vec3 diffuse;",
			"	vec3 specular;",
			"	vec3 ambient;",
			"	float shininess;",
			"};"
			].join('\n')
		}
	}
};

