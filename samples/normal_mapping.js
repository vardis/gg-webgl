NormalMappingSample = function (spec) {
    this.sphereMesh      = null;
    this.y_rot         = 0.0;
    this.light         = null;
    this.technique     = null;

    GG.SampleBase.call(this, spec);
};

NormalMappingSample.prototype = new GG.SampleBase();
NormalMappingSample.prototype.constructor = NormalMappingSample;

NormalMappingSample.prototype.initializeAssets = function () {
    var self = this;
    self.teapotMat = new GG.BaseMaterial();

    GG.Loader.loadImage('earth', '../assets/textures/rockwall.png', function (reqId, image) {
        var diffuseMap = GG.Texture.createTexture({
            'image' : image, width : 1024,
            minFilter : gl.LINEAR, magFilter : gl.LINEAR,
            'wrapS' : gl.REPEAT, wrapT : gl.REPEAT,
            flipY : false
        });
        self.teapotMat.addDiffuseTexture(diffuseMap);
        self.teapotMat.getDiffuseMap(0).scaleU = 3.0;
        self.teapotMat.getDiffuseMap(0).scaleV = 3.0;        
    });

    GG.Loader.loadImage('earth', '../assets/textures/brickwall-normal.png', function (reqId, image) {
        var normalMap = GG.Texture.createTexture({
            'image' : image, width : 1024,
            minFilter : gl.LINEAR, magFilter : gl.LINEAR,
            'wrapS' : gl.REPEAT, wrapT : gl.REPEAT,
            flipY : false
        });
        self.teapotMat.setNormalMap(normalMap);
        self.teapotMat.normalMap.scaleU = 3.0;
        self.teapotMat.normalMap.scaleV = 3.0;
        //self.assetsLoaded = true;
    });

    GG.Loader.loadImage('earth', '../assets/textures/rockwall_height.png', function (reqId, image) {
        var parallaxMap = GG.Texture.createTexture({
            'image' : image, width : 256, colorFormat : gl.RGB,
            minFilter : gl.LINEAR, magFilter : gl.LINEAR,
            'wrapS' : gl.REPEAT, wrapT : gl.REPEAT,
            flipY : false
        });
        self.teapotMat.setParallaxMap(parallaxMap);
        self.teapotMat.parallaxMap.scaleU = 3.0;
        self.teapotMat.parallaxMap.scaleV = 3.0;
        self.assetsLoaded = true;
    });
};

NormalMappingSample.prototype.initializeWithAssetsLoaded = function () {
    this.camera.setPosition([0.0, 0.0, 900.8]);
    this.mouseHandler.reset();

    this.camera.far = 1000;
    this.camera.getViewport().setWidth(gl.viewportWidth);
    this.camera.getViewport().setHeight(gl.viewportHeight);

   this.technique = new GG.PhongShadingTechnique();

    this.teapotMat.diffuse   = [1.0, 1.0, 1.0];
    this.teapotMat.ambient   = [0.05, 0.05, 0.05];
    this.teapotMat.shininess = 60.0;
    this.teapotMat.normalMapScale = 0.0011;

    var geom = new GG.SphereGeometry(2.0, 64, 64);
    geom.calculateTangents();
    this.sphereMesh          = new GG.TriangleMesh(geom);
    this.sphereMesh.material = this.teapotMat;
    this.sphereMesh.setScale([200,200,200]);

    this.light = new GG.Light({
        name : 'red',
        type : GG.LT_POINT,
        position : [0.0, 1.0, 500.0],
        direction : [0.0, 0.0, -0.90],
        diffuse : [0.60, 0.70, 0.70],
        cosCutOff : 0.9
    });
    this.renderContext = new GG.RenderContext({ camera : this.camera, light : this.light });
    this.initialized = true;
};

NormalMappingSample.prototype.update = function () {
    GG.SampleBase.prototype.update.call(this);

    if (this.initialized) {
        this.light.position[0] = 500.0*Math.cos(0.5*this.y_rot);
        this.light.position[1] = 3.0;
        this.light.position[2] = 500.0*Math.sin(0.5*this.y_rot);

        this.sphereMesh.setPosition([0.0, 0.0, -2.0]);
        //this.jsonMesh.setRotation([0.0, this.y_rot, 0.0]);

        this.y_rot += GG.clock.deltaTime() * 0.00021;
    }
};

NormalMappingSample.prototype.draw = function () {
    var vp = this.camera.getViewport();
    gl.viewport(0, 0, vp.getWidth(), vp.getHeight());
    gl.clearColor(vp.getClearColor()[0], vp.getClearColor()[1], vp.getClearColor()[2], 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);
    gl.enable(gl.CULL_FACE);

    this.technique.render(this.sphereMesh, this.renderContext);
};
