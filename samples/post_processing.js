PostProcessSample = function (spec) {
    this.camera = null;
    this.sphereMesh = null;
    this.planeMesh = null;
    this.y_rot = 0.0;
    this.mouseHandler = null;
    this.light = null;
    this.phongMat = null;
    this.sceneRenderer = null;

    GG.SampleBase.call(this, spec);
};

PostProcessSample.prototype = new GG.SampleBase();
PostProcessSample.prototype.constructor = PostProcessSample;

PostProcessSample.prototype.initializeAssets = function () {
    this.testScene = new GG.Scene();
    var that = this;
    GG.Loader.loadJSON('teapot', '../assets/models/teapot.js', function (jsonObj) {
        that.sphereMesh = new GG.TriangleMesh(GG.Geometry.fromJSON(jsonObj));

        that.teapotMat = new GG.PhongMaterial();
        that.sphereMesh.material = that.teapotMat;
        that.testScene.addObject(that.sphereMesh);
        that.assetsLoaded = true;
    });
};

PostProcessSample.prototype.initializeWithAssetsLoaded = function () {
    this.camera.setPosition([0.0, 0.0, 9.8]);
    this.mouseHandler.setCamera(this.camera);

    var phongMat = new GG.PhongMaterial();
    phongMat.ambient = [0.05, 0.05, 0.05];
    phongMat.shininess = 20.0;


    this.teapotMat.diffuse = [1.0, 0.5, 0.1];
    this.teapotMat.ambient = [0.05, 0.05, 0.05];
    this.teapotMat.shininess = 20.0;
    //this.teapotMat.wireframe = true;
    this.teapotMat.flatShade = true;
    this.teapotMat.wireOffset = 0.01;
    this.teapotMat.wireWidth = 20.0;

    this.planeMesh = new GG.TriangleMesh(new GG.PlaneGeometry(16));
    this.planeMesh.material = phongMat;

    this.light = new GG.Light({
        name:'red',
        type:GG.LT_POINT,
        position:[0.0, 0.0, 17.0],
        direction:[0.0, 0.0, 0.90],
        diffuse:[0.30, 0.20, 0.70],
        cosCutOff:0.9
    });

    this.testScene
        .addLight(this.light)
        .addObject(this.planeMesh)
        .shadows(false);

    this.sceneRenderer = new GG.DefaultSceneRenderer({ scene:this.testScene, camera:this.camera });

    this.highResRT = new GG.RenderTarget({ width:640, height:480});
    this.highResRT.initialize();

    this.postProcess = new GG.PostProcessChain();
    this.postProcess.source(this.highResRT).destination(null)
        .gaussianBlur({ filterSize : 5 });
        //.fxaa().tvLines().vignette().gamma(2.2);

    //this.blitPass = new GG.BlitPass(this.highResRT.getColorAttachment(0));

    this.initialized = true;
};

PostProcessSample.prototype.update = function () {
    GG.SampleBase.prototype.update.call(this);
    if (this.initialized) {
        /*
        this.light.position[0] = 15.0 * Math.cos(0.5 * this.y_rot);
        this.light.position[1] = 5.0;
        this.light.position[2] = 15.0 * Math.sin(0.5 * this.y_rot);
*/
        this.sphereMesh.setScale([0.3, 0.3, 0.3]);
        this.sphereMesh.setPosition([0.0, 5.0, -6.0]);
        this.sphereMesh.setRotation([this.y_rot, this.y_rot, 0.0]);

        this.planeMesh.setScale([100.0, 100.0, 1.0]);
        this.planeMesh.setPosition([0.0, -14.0, 0.0]);
        this.planeMesh.setRotation([-1.0, 0.0, 0.0]);

        this.y_rot += GG.clock.deltaTime() * 0.001;
    }
};

PostProcessSample.prototype.draw = function () {
    this.sceneRenderer.render(this.highResRT);
    //this.sceneRenderer.render();

    // input RT -> output BACK_BUFFER or RT_2
    this.postProcess.process();

    //this.blitPass.sourceTexture = this.highResRT.getColorAttachment(0);
    //this.blitPass.render();
};
