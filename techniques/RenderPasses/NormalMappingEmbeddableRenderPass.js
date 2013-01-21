/**
 * Provides normal & parallax mapping functionality for shader programs.
 * At a minimum the material's normal map must be defined for this pass to perform any action.
 * The parallax map on the other hand is optional and in its absence only a simple normal
 * mapping effect is applied.
 *
 * This pass will:
 * - bind the normal & parallax height maps as uniforms and set the appropriate
 *   render state for sampling them.
 * - introduce the sampleNormalMap method which returns the surface normal as calculated
 *   from the normal & parallax maps.
 *
 * Requirements for shader programs that integrate this render pass: 
 * - the varyings GG.Naming.VaryingViewVec, GG.Naming.VaryingLightVec and GG.Naming.VaryingNormal must be present
 */
GG.NormalMappingEmbeddableRenderPass = function (spec) {
    GG.EmbeddableAdaptiveRenderPass.call(this, spec);
    this.NORMALMAP_UNIFORM_NAME     = 'u_normalMapTexUnit';
    this.PARALLAX_UNIFORM_NAME = 'u_parallaxMapTexUnit';
};

GG.NormalMappingEmbeddableRenderPass.prototype = new GG.EmbeddableAdaptiveRenderPass();
GG.NormalMappingEmbeddableRenderPass.prototype.constructor = GG.NormalMappingEmbeddableRenderPass;

GG.NormalMappingEmbeddableRenderPass.prototype.adaptShadersToMaterial = function (vertexShader, fragmentShader, material, renderContext) {
    if (material.normalMap.texture != null) {
        vertexShader
            .normal()
            .tangent()
            .texCoord0()        
            .uniform('vec3', 'u_wCameraPos')
            .uniformModelMatrix()
            .uniformLight()
            .addDecl('blocks.getWorldLightVector', GG.ShaderLib.blocks.getWorldLightVector)
            .preprocessorDefinition(GG.Naming.DefUseTangentSpace)
            .addMainBlock([
                "   vec3 N = normalize(a_normal);",
                "   vec3 T = normalize(a_tangent);",
                "   vec3 B = cross(N, T);",
                "   vec4 wPos = u_matModel * a_position;",
                "   vec3 viewVec = u_wCameraPos.xyz - wPos.xyz;",

                "   vec3 tbnViewVec;",
                "   tbnViewVec.x = dot(T, viewVec);",
                "   tbnViewVec.y = dot(B, viewVec);",
                "   tbnViewVec.z = dot(N, viewVec);",
                "   v_viewVec = tbnViewVec;",

                "   vec3 lightVec = getWorldLightVector(wPos.xyz);",
                "   vec3 tbnLightVec;",
                "   tbnLightVec.x = dot(T, lightVec);",
                "   tbnLightVec.y = dot(B, lightVec);",
                "   tbnLightVec.z = dot(N, lightVec);",
                "   v_lightVec = tbnLightVec;",

                "   v_normal = a_normal;"
                ].join('\n'));


        fragmentShader
            .preprocessorDefinition(GG.Naming.DefUseTangentSpace)
            .addDecl('sampleTexUnit', GG.ShaderLib.blocks.sampleTexUnit)
            .uniformTexUnit(this.NORMALMAP_UNIFORM_NAME)
            .uniform('float', 'u_normalMapScale')
            .uniformNormalsMatrix();

        if (material.parallaxMap.texture != null) {
            fragmentShader.uniformTexUnit(this.PARALLAX_UNIFORM_NAME);
            fragmentShader.addDecl('parallaxTexCoords', [
                "vec2 parallaxTexCoords(vec2 uvCoords) {",                
                "   vec3 tbnViewDir = normalize(-v_viewVec);",
                "   float height = " + GG.ProgramSource.textureSampling(this.PARALLAX_UNIFORM_NAME, 'uvCoords') + ".r;",
                "   vec2 vHalfOffset = tbnViewDir.xy * height * u_normalMapScale;",

                "   height = (height + " + GG.ProgramSource.textureSampling(this.PARALLAX_UNIFORM_NAME, 'uvCoords + vHalfOffset') + ".r)*0.5;",
                "   vHalfOffset = tbnViewDir.xy * height * u_normalMapScale;",

                "   height = (height + " + GG.ProgramSource.textureSampling(this.PARALLAX_UNIFORM_NAME, 'uvCoords + vHalfOffset') + ".r)*0.5;",
                "   vHalfOffset = tbnViewDir.xy * height * u_normalMapScale;",

                "   return uvCoords + vHalfOffset;",
                "}"
             ].join('\n'));
        }

        var uvCoords = (material.parallaxMap.texture != null) ? "parallaxTexCoords(v_texCoords)" : "v_texCoords";

        fragmentShader.addDecl('sampleNormalMap', [
                "vec3 sampleNormalMap() {",
                "   vec2 uv = " + uvCoords + ";",
                "   vec3 surfaceNormal = " + GG.ProgramSource.textureSampling(this.NORMALMAP_UNIFORM_NAME, 'uv') + ".xyz * 2.0 - 1.0;",
                "   return normalize(surfaceNormal);",
                "}"
            ].join('\n')
        );
    }
};

GG.NormalMappingEmbeddableRenderPass.prototype.hashMaterial = function (material, renderContext) {
    return material.normalMap.texture != null + '_' + material.parallaxMap.texture != null;
};

GG.NormalMappingEmbeddableRenderPass.prototype.__locateCustomUniforms = function(renderable, ctx, program) {
    GG.ProgramUtils.getTexUnitUniformLocations(program, this.NORMALMAP_UNIFORM_NAME);
    GG.ProgramUtils.getTexUnitUniformLocations(program, this.PARALLAX_UNIFORM_NAME);
};

GG.NormalMappingEmbeddableRenderPass.prototype.__setCustomUniforms = function(renderable, ctx, program) {
    if (renderable.material.normalMap.texture != null) {
        GG.ProgramUtils.setTexUnitUniforms(program, this.NORMALMAP_UNIFORM_NAME, renderable.material.normalMap);        
    }

    if (renderable.material.parallaxMap.texture != null) {
        GG.ProgramUtils.setTexUnitUniforms(program, this.PARALLAX_UNIFORM_NAME, renderable.material.parallaxMap);
        gl.uniform1f(program.u_normalMapScale, renderable.material.normalMapScale);
    }
};

GG.NormalMappingEmbeddableRenderPass.prototype.__setCustomRenderState = function(renderable, ctx, program) {    
    if (renderable.material.normalMap.texture != null) {
        renderable.material.normalMap.bind();
    }
    if (renderable.material.parallaxMap.texture != null) {
        renderable.material.parallaxMap.bind();
    }
};