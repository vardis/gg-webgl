GG.ShaderLib = new function (argument) {
	
	return {
		blendModeMultiply : [
			"vec3 blendModeMultiply(in vec3 baseColor, in vec3 sourceColor) {",
			"	return baseColor * sourceColor;",
			"}"
		].join('\n'),

		blendModeAdd : [
			"vec3 blendModeAdd(in vec3 baseColor, in vec3 sourceColor) {",
			"	return baseColor + sourceColor;",
			"}"
		].join('\n'),

		blendModeSubtract : [
			"vec3 blendModeSubtract(in vec3 baseColor, in vec3 sourceColor) {",
			"	return baseColor - sourceColor;",
			"}"
		].join('\n'),

		blendModeDarken : [
			"vec3 blendModeDarken(in vec3 baseColor, in vec3 sourceColor) {",
			"	return min(baseColor, sourceColor);",
			"}"
		].join('\n'),

		blendModeColorBurn : [
			"vec3 blendModeColorBurn(in vec3 baseColor, in vec3 sourceColor) {",
			"	return vec3(sourceColor.r == 0.0 ? 0.0 : 1.0 - ((1.0 - baseColor.r) / sourceColor.r),",
			"		sourceColor.g == 0.0 ? 0.0 : 1.0 - ((1.0 - baseColor.g) / sourceColor.g),",
			"		sourceColor.b == 0.0 ? 0.0 : 1.0 - ((1.0 - baseColor.b) / sourceColor.b));",
			"}"
		].join('\n'),

		blendModeLinearBurn : [
			"vec3 blendModeLinearBurn(in vec3 baseColor, in vec3 sourceColor) {",
			"	return baseColor + sourceColor - vec3(1.0);",
			"}"
		].join('\n'),

		blendModeLighten : [
			"vec3 blendModeLighten(in vec3 baseColor, in vec3 sourceColor) {",
			"	return max(baseColor, sourceColor);",
			"}"
		].join('\n'),

		blendModeScreen : [
			"vec3 blendModeScreen(in vec3 baseColor, in vec3 sourceColor) {",
			"	return (baseColor + sourceColor) - (baseColor * sourceColor);",
			"}"
		].join('\n'),

		blendModeColorDodge : [
			"vec3 blendModeColorDodge(in vec3 baseColor, in vec3 sourceColor) {",
			"	return vec3(sourceColor.r == 1.0 ? 1.0 : min(1.0, baseColor.r/(1.0 - sourceColor.r)),",
			"		sourceColor.g == 1.0 ? 1.0 : min(1.0, baseColor.g/(1.0 - sourceColor.g)),",
			"		sourceColor.b == 1.0 ? 1.0 : min(1.0, baseColor.b/(1.0 - sourceColor.b));",
			"}"
		].join('\n'),

		blendModeOverlay : [
			"vec3 blendModeOverlay(in vec3 baseColor, in vec3 sourceColor) {",
			"	return vec3(baseColor.r <= 0.5 ? 2.0*sourceColor.r*baseColor.r : 1.0 - 2.0*(1.0 - baseColor.r)*(1.0 - sourceColor.r),",
			"		baseColor.g <= 0.5 ? 2.0*sourceColor.g*baseColor.g : 1.0 - 2.0*(1.0 - baseColor.g)*(1.0 - sourceColor.g),",
			"		baseColor.b <= 0.5 ? 2.0*sourceColor.b*baseColor.b : 1.0 - 2.0*(1.0 - baseColor.b)*(1.0 - sourceColor.b));",
			"}"
		].join('\n'),

		blendModeSoftLight : [
			"vec3 blendModeSoftLight(in vec3 baseColor, in vec3 sourceColor) {",
			"}"
		].join('\n'),

		blendModeHardLight : [
			"vec3 blendModeHardLight(in vec3 baseColor, in vec3 sourceColor) {",
			"	return vec3(sourceColor.r <= 0.5 ? 2.0*sourceColor.r*baseColor.r : 1.0 - 2.0*(1.0 - baseColor.r)*(1.0 - sourceColor.r),",
			"		sourceColor.g <= 0.5 ? 2.0*sourceColor.g*baseColor.g : 1.0 - 2.0*(1.0 - baseColor.g)*(1.0 - sourceColor.g),",
			"		sourceColor.b <= 0.5 ? 2.0*sourceColor.b*baseColor.b : 1.0 - 2.0*(1.0 - baseColor.b)*(1.0 - sourceColor.b));",
			"}"
		].join('\n'),

		blendModeVividLight : [
			"vec3 blendModeVividLight(in vec3 baseColor, in vec3 sourceColor) {",
			"}"
		].join('\n'),

		blendModeLinearLight : [
			"vec3 blendModeLinearLight(in vec3 baseColor, in vec3 sourceColor) {",
			"}"
		].join('\n'),

		blendModePinLight : [
			"vec3 blendModePinLight(in vec3 baseColor, in vec3 sourceColor) {",
			"}"
		].join('\n'),

		screen_filter_vertex : [
			"attribute vec4 a_position;",
			"varying vec2 v_texCoords;",

			"void main() {",
			"	v_texCoords = 0.5*(a_position.xy + vec2(1.0));",
			"	gl_Position = a_position;",
			"}"].join('\n'),
			
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
			'lightIrradiance' : [
			"void lightIrradiance(in vec3 normal, in vec3 view, in vec3 light, in LightInfo lightInfo, in Material_t mat, inout vec3 diffuse, inout vec3 specular) {",		
			"	float df = clamp(dot(normal, light), 0.0, 1.0);",
			"	if (lightInfo.type == 3.0) {",
			"		float cosSpot = clamp(" + GG.Naming.VaryingSpotlightCos + ", 0.0, 1.0);",
			"		df *= pow(cosSpot, -lightInfo.attenuation) * smoothstep(lightInfo.cosCutOff, 1.0, cosSpot);",
			"	}",
			"	float sp = pow(clamp(dot(normalize(light + view), normal), 0.0, 1.0), mat.shininess);",
			"	diffuse += df*lightInfo.diffuse;",
			"	specular += df*sp*lightInfo.specular;",
			"}"
			].join('\n')			
		},

		blocks : {
			// returns the world space vector from the vertex to the light source.
			// assumes the Light_t uniform is present.
			'getWorldLightVector' : [
			"vec3 getWorldLightVector(vec3 vertexWorldPos) {",
			"	vec3 lightVec;",
			"	if (u_light.type == 1.0) {",
			" 		lightVec = normalize(-u_light.direction);",
			"	} else {",
			" 		lightVec = normalize(u_light.position - vertexWorldPos);",
			"	}",
			"	return lightVec;",
			"}"
			].join('\n'),

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
			"	float g = fract(r*255.0);",
			"	float b = fract(g*255.0);",
			"	float a = fract(b*255.0);",
			"	return vec4(r, g, b, a);",
			"}"
			].join('\n'),

			'libUnpackRrgbaToFloat' : [
				"float libUnpackRrgbaToFloat(vec4 enc) {",
				"	const vec4 bitShifts = vec4(1.0, 1.0 / 255.0, 1.0 / (255.0 * 255.0), 1.0 / (255.0 * 255.0 * 255.0));",
				"	return dot(enc, bitShifts);",
				"}"
			].join('\n'),

			'libUnpackVec2ToFloat' : [
				"float libUnpackVec2ToFloat(vec2 enc) {",
				"	const vec2 bitShifts = vec2(1.0, 1.0 / 256.0);",
				"	return dot(enc, bitShifts);",
				"}"
			].join('\n'),

			'sampleTexUnit'  : [
				"vec4 sampleTexUnit(sampler2D map, TexUnitParams_t texUnit, vec2 baseCoords) {",
				"	return texture2D(map, texUnit.offset + (texUnit.scale * baseCoords));",
				"}"
			].join('\n'),

			'lightInfoStructure' : [
			"struct LightInfo {",
			"	float type;",
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
			].join('\n'),

			"textureUnitParams" : [
			"struct TexUnitParams_t {",
			"	vec2 offset;",
			"	vec2 scale;",
			"};"
			].join('\n')
		}
	}
};

