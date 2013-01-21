/**
 * Prerequisites:
 * a) a varying passing each of the uv coordinates per fragment.
 * b) the GG.Naming.VarAlphaOutput variable present in the fragment shader
 */
GG.AlphaMappingEmbeddableRenderPass = function (spec) {
    GG.EmbeddableAdaptiveRenderPass.call(this, spec);
    this.BASE_UNIFORM_NAME = 'u_alphaTexUnit';
};

GG.AlphaMappingEmbeddableRenderPass.prototype = new GG.EmbeddableAdaptiveRenderPass();
GG.AlphaMappingEmbeddableRenderPass.prototype.constructor = GG.AlphaMappingEmbeddableRenderPass;

GG.AlphaMappingEmbeddableRenderPass.prototype.adaptShadersToMaterial = function (vertexShader, fragmentShader, material, renderContext) {
    if (material.alphaMap.texture != null) {
        fragmentShader
            .addDecl('sampleTexUnit', GG.ShaderLib.blocks.sampleTexUnit)
            .uniformTexUnit(this.BASE_UNIFORM_NAME)
            .addPostProcessBlock([
            GG.Naming.VarAlphaOutput + " = sampleTexUnit("
                + GG.Naming.textureUnitUniformMap(this.BASE_UNIFORM_NAME) + ", " + this.BASE_UNIFORM_NAME + ", v_texCoords).r;"
        ].join('\n'));
    }
};

GG.AlphaMappingEmbeddableRenderPass.prototype.hashMaterial = function (material, renderContext) {
    return material.alphaMap.texture != null;
};

GG.AlphaMappingEmbeddableRenderPass.prototype.__locateCustomUniforms = function(renderable, ctx, program) {
    GG.ProgramUtils.getTexUnitUniformLocations(program, this.BASE_UNIFORM_NAME);
};

GG.AlphaMappingEmbeddableRenderPass.prototype.__setCustomUniforms = function(renderable, ctx, program) {
    if (renderable.material.alphaMap.texture != null) {
        GG.ProgramUtils.setTexUnitUniforms(program, this.BASE_UNIFORM_NAME, renderable.material.alphaMap);
    }
};

GG.AlphaMappingEmbeddableRenderPass.prototype.__setCustomRenderState = function(renderable, ctx, program) {
    renderable.material.alphaMap.bind();
};