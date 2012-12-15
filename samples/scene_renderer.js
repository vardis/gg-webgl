SceneRendererSample = function (spec) {

    this.renderer = null;
    this.cubeMesh = null;
    this.planeMesh = null;
    this.sphereMesh = null;

    this.y_rot = 0.0;

    this.mouseHandler = null;

    this.redLight = null;
    this.greenLight = null;
    this.phongMat = null;

    this.lightModel = null;

    this.highResFBO = null;

    this.sceneRenderer = null;

    this.teapot = null;

    this.texturedMaterial = null;

    this.testScene = null;

    GG.SampleBase.call(this, spec);
};

SceneRendererSample.prototype = new GG.SampleBase();
SceneRendererSample.prototype.constructor = SceneRendererSample;

SceneRendererSample.prototype.initializeAssets = function () {
    this.texturedMaterial = new GG.BaseMaterial();
    var that = this;
    GG.Loader.loadImage('earth', '../assets/textures/earth.png', function (reqId, image) {
        var earthTexture = GG.Texture.createTexture({
            'image':image, width:1024,
            minFilter:gl.LINEAR, magFilter:gl.LINEAR,
            'wrapS':gl.REPEAT, wrapT:gl.REPEAT,
            flipY:false
        });
        that.texturedMaterial.addDiffuseTexture(earthTexture);
    });

    this.testScene = new GG.Scene();

    GG.Loader.loadJSON('teapot', '../assets/models/teapot.js', function (jsonObj) {
            that.jsonMesh = new GG.TriangleMesh(GG.Geometry.fromJSON(jsonObj));
            that.jsonMesh.setPosition([0.0, 1.0, 15.0]);
            that.jsonMesh.setScale([0.5, 0.5, 0.5]);
            that.jsonMesh.material = new GG.PhongMaterial();
            that.testScene.addObject(that.jsonMesh);
            that.assetsLoaded = true;
        },
        function () {
            alert('failed to load the json model');
        });
};

SceneRendererSample.prototype.initializeWithAssetsLoaded = function () {
    this.mouseHandler = new GG.MouseHandler();

    this.camera = new GG.PerspectiveCamera();
    this.camera.setPosition([0.0, 9.0, 22]);
    this.camera.getViewport().setWidth(gl.viewportWidth);
    this.camera.getViewport().setHeight(gl.viewportWidth);

    this.mouseHandler.setCamera(this.camera);

    this.renderer = new GG.Renderer();
    this.renderer.setCamera(this.camera);
    GG.renderer = this.renderer;

    this.cubeMesh = new GG.TriangleMesh(new GG.CubeGeometry());
    this.planeMesh = new GG.TriangleMesh(new GG.PlaneGeometry(16));
    this.sphereMesh = new GG.TriangleMesh(new GG.SphereGeometry());
    this.lightModel = new GG.TriangleMesh(new GG.SphereGeometry());

    this.phongMat = new GG.PhongMaterial();
    this.phongMat.ambient = [0.0, 0.0, 0.0];
    this.phongMat.shininess = 20.0;


    this.sphereMesh.material = this.texturedMaterial;
    this.cubeMesh.material = this.phongMat;
    this.planeMesh.material = this.phongMat;


    this.lightModel.material = new GG.BaseMaterial({diffuse:[0.7, 0.7, 0.2], shadeless:true});

    this.redLight = new GG.Light({
        name:'red',
        type:GG.LT_DIRECTIONAL,
        position:[0.0, 3.0, 21.0],
        direction:[-0.0, -0.4, -0.70],
        diffuse:[1.0, 0.0, 0.0],
        cosCutOff:0.9
    });
    //var shadowCamera =
    //shadowCamera.setup(redLight.position, [0.0, -0.3, -4.0], [0.0, 1.0, 0.0], -7.0, 7.0, -7.0, 7.0, 1.0, 50.0);
    this.redLight.shadowCamera = new GG.OrthographicCamera();
    this.redLight.shadowCamera.near = 3.0;
    this.redLight.shadowCamera.far = 100.0;
    this.redLight.shadowCamera.left = -12.0;
    this.redLight.shadowCamera.right = 12.0;
    this.redLight.shadowCamera.top = 7.0;
    this.redLight.shadowCamera.bottom = -7.0;

    this.greenLight = new GG.Light({
        name:'green',
        type:GG.LT_POINT,
        position:[10.0, 3.0, 2.0],
        diffuse:[0.0, 1.0, 0.0]
    });

    this.testScene.addObject(this.planeMesh)
        .addObject(this.cubeMesh)
        .addObject(this.sphereMesh)
        .addObject(this.lightModel)
        .addLight(this.redLight)
        .addLight(this.greenLight)
        .shadows(true);

    this.sceneRenderer = new GG.DefaultSceneRenderer({ scene: this.testScene, camera:this.camera });

    this.initializeGui();

    this.initialized = true;
};

SceneRendererSample.prototype.initializeGui = function () {
    var gui = new dat.GUI();
    gui.add(window.sample.redLight.shadowCamera, 'near', 0.0, 10.0);
    gui.add(window.sample.redLight.shadowCamera, 'far', 0.0, 1000.0);
    gui.add(window.sample.redLight.shadowCamera, 'right', 0.0, 1000.0);
    gui.add(window.sample.redLight.shadowCamera, 'top', 0.0, 1000.0);
};

SceneRendererSample.prototype.update = function () {
    GG.SampleBase.prototype.update.call(this);
    if (this.initialized) {
        this.redLight.position[0] = 22.0 * Math.cos(this.y_rot);
        this.redLight.position[1] = 2.0;
        this.redLight.position[2] = 22.0 * Math.sin(this.y_rot);
        //this.redLight.position = [0.0, 2.0, 22.0];

        this.lightModel.setPosition(this.redLight.position);

        this.redLight.direction[0] = -Math.cos(this.y_rot);
        this.redLight.direction[1] = -0.2;
        this.redLight.direction[2] = -Math.sin(this.y_rot);

        //this.redLight.position = [2.0, 5.0, 4.0];

        //var lightDir = [-Math.cos(0.5*this.y_rot), 0.0, -Math.sin(0.5*this.y_rot)];
        this.redLight.shadowCamera.setup(this.redLight.position, [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);

        /*
         greenLight.position[0] = 15.0*Math.cos(0.5*this.y_rot);
         greenLight.position[1] = 10.0
         greenLight.position[2] = 15.0*Math.sin(0.5*this.y_rot);
         */
        //this.cubeMesh.setScale([0.8, 0.8, 0.8]);
        this.cubeMesh.setPosition([0.0, 1.0, -6.0]);
        //this.cubeMesh.setRotation([0.5, this.y_rot, 0.2]);

        this.planeMesh.setScale([100.0, 100.0, 1.0]);
        this.planeMesh.setPosition([0.0, -6.0, 0.0]);
        this.planeMesh.setRotation([-1.50, 0.0, 0.0]);

        //this.sphereMesh.setScale([0.8, 0.8, 0.8]);
        //this.sphereMesh.setPosition([-1.0, -1.0, -12.0]);

        this.sphereMesh.setPosition([0.0, 0.0, 0.0]);
        this.sphereMesh.setPosition([0.0, 1.0, -6.0]);
        this.sphereMesh.setRotation([0.5, this.y_rot, 0.2]);
        this.cubeMesh.setPosition([0.0, 0.0, 0.0]);

        this.y_rot += GG.clock.deltaTime() * 0.001;
    }
};


SceneRendererSample.prototype.draw = function () {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    this.sceneRenderer.render();
};
			
