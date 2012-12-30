StaticParticlesSample = function (spec) {
    this.renderer           = null;
    this.y_rot              = 0.0;
    this.camera             = null;
    this.mouseHandler       = null;
    this.particlesTechnique = null;
    this.particlesMaterial  = null;
    GG.SampleBase.call(this, spec);
};

StaticParticlesSample.prototype = new GG.SampleBase();
StaticParticlesSample.prototype.constructor = StaticParticlesSample;

StaticParticlesSample.prototype.initializeAssets = function () {
    this.particlesMaterial = new GG.BaseMaterial();
    var self = this;    
    GG.Loader.loadImage('earth', '../assets/textures/earth.png', function (reqId, image) {      
        var earthTexture = GG.Texture.createTexture({ 
            'image' : image, width : 1024, 
            minFilter : gl.LINEAR, magFilter : gl.LINEAR, 
            'wrapS' : gl.REPEAT, wrapT : gl.REPEAT,
            flipY : false 
        });     
        self.particlesMaterial.addDiffuseTexture(earthTexture);
        self.assetsLoaded = true;
    });
};

StaticParticlesSample.prototype.initializeWithAssetsLoaded = function () {
    this.camera = new GG.PerspectiveCamera();
    this.camera.setPosition([0.0, 0.0, 2.8]);

    this.renderer = new GG.Renderer();
    this.renderer.setCamera(this.camera);
    GG.renderer = this.renderer;

    this.mouseHandler = new GG.MouseHandler();
    this.mouseHandler.setCamera(this.camera);

    var sphereGeom = new GG.SphereGeometry(1.0, 64, 64);

    this.particlesTechnique = new GG.StaticPointParticlesTechnique();

    this.particles = new GG.StaticParticleSystem(sphereGeom, this.particlesMaterial);
    this.particles.setPointSize(32.0);

    this.initialized = true;
};

StaticParticlesSample.prototype.update = function () {
    GG.SampleBase.prototype.update.call(this);    
};

StaticParticlesSample.prototype.draw = function () {
    var ctx = new GG.RenderContext();
    ctx.camera = this.camera;    

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.particlesTechnique.render(this.particles, ctx);
};


