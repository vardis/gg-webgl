GG.ShaderBuilder = function (argument) {
	this.shader = '';
};

function addBuiltInAttribute(attribName) {
	declName = GG.GLSLProgram.BuiltInAttributes[attribName];
	switch (attribName) {
		case GG.GLSLProgram.BuiltInAttributes.attribPosition:
			declType = "vec4";
			break;
	}
	this.attributesDeclarations += declType + " " + declName + ";\n";
}

function addBlockFromLib(blockName) {
	this.code += GG.ShaderLib.blocks[blockName] + "\n";
}

builder.addPositionAttribute().addBlockFromLib('BLK_PACK_FLOAT_TO_RGBA')
.addBlockFromLib('BLK_PACK_HALF_TO_RGBA')
.addToMain(
	"
// Linear depth
    float linearDepth = length(vPosition) * LinearDepthConstant;
    
    if ( FilterType == 2 )
    {
        //
        // Variance Shadow Map Code
        // Encode moments to RG/BA
        //
        //float moment1 = gl_FragCoord.z;
        float moment1 = linearDepth;
        float moment2 = moment1 * moment1;
        gl_FragColor = vec4(packHalf(moment1), packHalf(moment2));
    }
    else
    {
        //
        // Classic shadow mapping algorithm.
        // Store screen-space z-coordinate or linear depth value (better precision)
        //
        //gl_FragColor = pack(gl_FragCoord.z);
        gl_FragColor = pack(linearDepth);
    }
	");