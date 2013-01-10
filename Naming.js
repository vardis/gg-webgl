/**
 * Contains the naming conventions used throughout the framework.
 */
GG.Naming = {
    // names for standard varyings
    VaryingNormal            : 'v_normal',
    VaryingView              : 'v_view',
    VaryingColor             : 'v_color',
    VaryingTexCoords         : 'v_texCoords',

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

    VarDiffuseBaseColor      : 'baseColor',
    
    // common preprocessor definition names
    DefUseTangentSpace       : 'USE_TANGENT_SPACE_FOR_LIGHTING'

};

GG.Naming.textureUnitUniformMap = function (basename) {
    return basename + '_map';
};