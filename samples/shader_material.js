/**
 * Procedural shader taken from the Orange book, OGL Shading Language 2nd Ed., section 11.1 Regular Patterns.
 */
ShaderMaterialSample = function (spec) {
    this.renderer           = null;
    this.y_rot              = 0.0;
    this.camera             = null;
    this.mouseHandler       = null;
    GG.SampleBase.call(this, spec);
};

ShaderMaterialSample.prototype = new GG.SampleBase();
ShaderMaterialSample.prototype.constructor = ShaderMaterialSample;

ShaderMaterialSample.prototype.initializeAssets = function () {
    this.assetsLoaded = true;        
};

ShaderMaterialSample.prototype.initializeWithAssetsLoaded = function () {
    this.shaderMaterial = new GG.BaseMaterial();

    this.camera = new GG.PerspectiveCamera();
    this.camera.setPosition([0.0, 0.0, 2.8]);

    this.renderer = new GG.Renderer();
    this.renderer.setCamera(this.camera);
    GG.renderer = this.renderer;

    this.mouseHandler = new GG.MouseHandler();
    this.mouseHandler.setCamera(this.camera);

    this.sphere = new GG.TriangleMesh(new GG.SphereGeometry(1.0, 64, 64));

    var vertexShader = this.getVertexShader();
    var fragmentShader = this.getFragmentShader();

    var self = this;
    var setUniforms = function (renderable, ctx, program) {
        gl.uniform1f(program.Fuzz, self.Fuzz);
        gl.uniform1f(program.Scale, self.Scale);
        gl.uniform1f(program.Width, self.Width);
        gl.uniform3fv(program.BackColor, [ self.BackColor[0]/256, self.BackColor[1]/256, self.BackColor[2]/256 ]);
        gl.uniform3fv(program.StripeColor, [ self.StripeColor[0]/256, self.StripeColor[1]/256, self.StripeColor[2]/256 ]);
        gl.uniform3fv(program.DiffuseColor, [ self.DiffuseColor[0]/256, self.DiffuseColor[1]/256, self.DiffuseColor[2]/256 ]);
    };
    this.shaderTechnique = GG.BaseTechnique.fromShaders(vertexShader, fragmentShader);
    this.shaderTechnique.passes[0].__setCustomUniforms = setUniforms;

    this.Scale = 10.0;
    this.Width = 0.2;
    this.Fuzz = 0.1;
    this.BackColor = [255,255,255];
    this.StripeColor = [255,0,0];
    this.DiffuseColor = [128, 128, 220];

    var gui = new dat.GUI();
    gui.add(this, 'Scale', 0.0, 100.0);
    gui.add(this, 'Width', 0.0, 1.0);
    gui.add(this, 'Fuzz', 0.0, 1.0);
    gui.addColor(this, 'BackColor');
    gui.addColor(this, 'StripeColor');
    gui.addColor(this, 'DiffuseColor');

    this.initialized = true;
};

ShaderMaterialSample.prototype.getVertexShader = function (argument) {
    var pg = new GG.ProgramSource();
    pg
        .position()
        .texCoord0()
        .varying('vec2', 'v_texCoords')
        .uniformModelViewMatrix()
        .uniformProjectionMatrix()
        .addMainBlock([
            "v_texCoords = a_texCoords;",
            "gl_Position = u_matProjection * u_matModelView * a_position;"
            ].join('\n')
        );
    return pg.toString();
};

ShaderMaterialSample.prototype.getFragmentShader = function (argument) {
    var pg = new GG.ProgramSource();
    pg
        .asFragmentShader()
        .varying('vec2', 'v_texCoords')
        .uniform('vec3', 'BackColor')
        .uniform('vec3', 'StripeColor')
        .uniform('vec3', 'DiffuseColor')        
        .uniform('float', 'Fuzz')
        .uniform('float', 'Scale')
        .uniform('float', 'Width')
        .addMainBlock([
            "float scaledT = fract(v_texCoords.t * Scale);",
            "float frac1 = clamp(scaledT / Fuzz, 0.0, 1.0); ",
            "float frac2 = clamp((scaledT - Width) / Fuzz, 0.0, 1.0); ",
         
            "frac1 = frac1 * (1.0 - frac2); ",
            "frac1 = frac1 * frac1 * (3.0 - (2.0 * frac1)); ",
         
            "vec3 finalColor = mix(BackColor, StripeColor, frac1); ",
            "finalColor = finalColor * DiffuseColor; ",
         
            "gl_FragColor = vec4(finalColor, 1.0); "
            ].join('\n')
        );
    return pg.toString(); 
};

ShaderMaterialSample.prototype.update = function () {
    GG.SampleBase.prototype.update.call(this);    
};

ShaderMaterialSample.prototype.draw = function () {
    var ctx = new GG.RenderContext();
    ctx.camera = this.camera;    

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.shaderTechnique.render(this.sphere, ctx);
};


