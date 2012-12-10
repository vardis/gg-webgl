/**
 * Contains the naming conventions used throughout the framework.
 */
GG.Naming = {
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
	
	AttributePosition        : 'a_position',
	AttributeNormal          : 'a_normal',
	AttributeColor           : 'a_color',
	AttributeTexCoords       : 'a_texCoords',

    // the following name the fragment shader variables to receive the
    // final values for the diffuse, specular and alpha, respectively.
    VarDiffuseOutput         : 'diffuse',
    VarSpecularOutput        : 'specular',
    VarAlphaOutput           : 'alpha'

};

GG.Naming.textureUnitUniformMap = function (basename) {
    return basename + '_map';
};