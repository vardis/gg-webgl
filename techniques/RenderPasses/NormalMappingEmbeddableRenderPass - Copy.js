GG.NormalMappingEmbeddableRenderPass = function (spec) {
    GG.EmbeddableAdaptiveRenderPass.call(this, spec);
    this.BASE_UNIFORM_NAME = 'u_normalMapTexUnit';
};

GG.NormalMappingEmbeddableRenderPass.prototype = new GG.EmbeddableAdaptiveRenderPass();
GG.NormalMappingEmbeddableRenderPass.prototype.constructor = GG.NormalMappingEmbeddableRenderPass;

GG.NormalMappingEmbeddableRenderPass.prototype.adaptShadersToMaterial = function (vertexShader, fragmentShader, material, renderContext) {
    if (material.normalMap.texture != null) {
        gl.getExtension("OES_standard_derivatives");
        fragmentShader
            .enableExtension('GL_OES_standard_derivatives')
            .preprocessorDefinition(GG.Naming.DefUseTangentSpace)
            .addDecl('sampleTexUnit', GG.ShaderLib.blocks.sampleTexUnit)
            .uniformTexUnit(this.BASE_UNIFORM_NAME)
            .uniform('float', 'u_normalMapScale')
            .addDecl('derivativeNormalMapping', [
                "vec3 derivativeNormalMapping(vec3 viewPos, vec3 geometricNormal, vec2 texCoords) {",

                "   vec3 q0 = dFdx(viewPos.xyz);",
                "   vec3 q1 = dFdy(viewPos.xyz);",
                "   vec2 st0 = dFdx(texCoords.st);",
                "   vec2 st1 = dFdy(texCoords.st);",

                "   vec3 S = normalize(q0*st1.t - q1*st0.t);",
                "   vec3 T = normalize(-q0*st1.s + q1*st0.s);",
                "   vec3 surfaceNormal = sampleTexUnit(" + GG.Naming.textureUnitUniformMap(this.BASE_UNIFORM_NAME) + ", " + this.BASE_UNIFORM_NAME + ", v_texCoords).xyz * 2.0 - 1.0;",
                "   surfaceNormal.xy = u_normalMapScale * surfaceNormal.xy;",
                "   mat3 tangentToViewSpace = mat3(S, T, geometricNormal);",
                "   return normalize(tangentToViewSpace * surfaceNormal);",

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