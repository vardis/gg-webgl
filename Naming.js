/**
 * Contains the naming conventions used throughout the framework.
 */
GG.Naming = {
    // names for standard varyings
    VaryingNormal            : 'v_normal',
    VaryingViewPos           : 'v_viewPos',
    VaryingColor             : 'v_color',
    VaryingTexCoords         : 'v_texCoords',
    VaryingWorldPos          : 'v_worldPos',
    VaryingLightVec          : 'v_lightVec',
    VaryingViewVec           : 'v_viewVec',
    VaryingSpotlightCos      : 'v_spotlightCos',

	UniformMaterial          : 'u_material',
	UniformLight             : 'u_light',	
	UniformModelMatrix       : 'u_matModel',
	UniformNormalMatrix      : 'u_matNormals',
	UniformModelViewMatrix   : 'u_matModelView',
	UniformViewMatrix        : 'u_matView',
	UniformInverseViewMatrix : 'u_matViewInverse',
	UniformProjectionMatrix  : 'u_matProjection',
	UniformTime0_X           : 'u_fTime0_X',
	UniformTime0_1           : 'u_fTime0_1',
	UniformCameraWorldPos    : 'u_wCameraPos',
    UniformFogColor          : 'u_fogColor',
    UniformFogStart          : 'u_fogStart',
    UniformFogEnd            : 'u_fogEnd',
    UniformFogDensity        : 'u_fogDensity',
	
	AttributePosition        : 'a_position',
	AttributeNormal          : 'a_normal',
	AttributeColor           : 'a_color',
	AttributeTexCoords       : 'a_texCoords',
    AttributeTangent         : 'a_tangent',

    // the following name the fragment shader variables to receive the
    // final values for the diffuse, specular and alpha, respectively.
    VarDiffuseOutput         : 'diffuse',
    VarSpecularOutput        : 'specular',
    VarAlphaOutput           : 'alpha',

    // the final 3-component value to be assigned as the rgb output of the fragment shader
    VarColorOutput           : 'finalColor',

    VarDiffuseBaseColor      : 'baseColor',
    
    // common preprocessor definition names
    DefUseTangentSpace       : 'USE_TANGENT_SPACE_FOR_LIGHTING'

};

/** Given the uniform name of a texture unit, it returns the name of the corresponding uniform sampler. */
GG.Naming.textureUnitUniformMap = function (basename) {
    return basename + '_map';
};