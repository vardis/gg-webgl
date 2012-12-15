GG.NormalMappingEmbeddableRenderPass = function (spec) {
    GG.EmbeddableAdaptiveRenderPass.call(this, spec);
    this.BASE_UNIFORM_NAME = 'u_normalMapTexUnit';
};

GG.NormalMappingEmbeddableRenderPass.prototype = new GG.EmbeddableAdaptiveRenderPass();
GG.NormalMappingEmbeddableRenderPass.prototype.constructor = GG.NormalMappingEmbeddableRenderPass;

GG.NormalMappingEmbeddableRenderPass.prototype.adaptShadersToMaterial = function (vertexShader, fragmentShader, material) {
    if (material.normalMap.texture != null) {

        vertexShader
            .tangent()
            .varying('vec3', 'v_tangent')
            .addMainBlock("v_tangent = a_tangent;");

        fragmentShader
            .preprocessorDefinition(GG.Naming.DefUseTangentSpace)
            .addDecl('sampleTexUnit', GG.ShaderLib.blocks.sampleTexUnit)
            .uniformTexUnit(this.BASE_UNIFORM_NAME)
            .uniform('float', 'u_normalMapScale')
            .uniformNormalsMatrix()
            .varying('vec3', 'v_tangent')
            .addDecl('sampleNormalMap', [
                "vec3 sampleNormalMap() {",
                "   vec3 N = normalize(v_normal);",
                "   vec3 T = normalize(v_tangent);",
                "   vec3 B = cross(N, T);",
                "   mat3 tangentToWorld = mat3(T, B, N);",
                "   mat3 tangentToView =  tangentToWorld;",
                "   vec3 surfaceNormal = sampleTexUnit(" + GG.Naming.textureUnitUniformMap(this.BASE_UNIFORM_NAME) + ", " + this.BASE_UNIFORM_NAME + ").xyz * 2.0 - 1.0;",
                "   return normalize(tangentToView * surfaceNormal);",
                "}"
        ].join('\n'));
    }
};

GG.NormalMappingEmbeddableRenderPass.prototype.hashMaterial = function (material) {
    return material.normalMap.texture != null;
};

GG.NormalMappingEmbeddableRenderPass.prototype.__locateCustomUniforms = function(renderable, ctx, program) {
    GG.ProgramUtils.getTexUnitUniformLocations(program, this.BASE_UNIFORM_NAME);
};

GG.NormalMappingEmbeddableRenderPass.prototype.__setCustomUniforms = function(renderable, ctx, program) {
    if (renderable.material.normalMap.texture != null) {
        GG.ProgramUtils.setTexUnitUniforms(program, this.BASE_UNIFORM_NAME, renderable.material.normalMap);
        gl.uniform1f(program.u_normalMapScale, renderable.material.normalMapScale);
    }
};

GG.NormalMappingEmbeddableRenderPass.prototype.__setCustomRenderState = function(renderable, ctx, program) {
    renderable.material.normalMap.bind();
};