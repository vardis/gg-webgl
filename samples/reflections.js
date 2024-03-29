ReflectionsSample = function (spec) {
    this.renderer = null;
    this.cubeMesh = null;
    this.cubemapTechnique = null;
    this.skyMesh = null;
    this.y_rot = 0.0;
    this.reflectiveTechnique = null;
    this.refectiveMaterial = null;
    GG.SampleBase.call(this, spec);
};

ReflectionsSample.prototype = new GG.SampleBase();
ReflectionsSample.prototype.constructor = ReflectionsSample;

ReflectionsSample.prototype.initializeAssets = function () {
    var that = this;
    GG.Loader.loadImages([
        '../assets/textures/skybox_01_east.png',
        '../assets/textures/skybox_01_west.png',
        '../assets/textures/skybox_01_top.png',
        '../assets/textures/skybox_01_bottom.png',
        '../assets/textures/skybox_01_north.png',
        '../assets/textures/skybox_01_south.png'
    ],
        function (images) {
            var cubemapTexture = new GG.TextureCubemap({ 'images':images });
            that.cubemapTechnique = new GG.CubemapTechnique({
                'cubemap':cubemapTexture,
                'size':1024 });
            that.refectiveMaterial = new GG.BaseMaterial()
            that.refectiveMaterial.envMap = cubemapTexture;
            that.assetsLoaded = true;
        }
    );
};

ReflectionsSample.prototype.initializeWithAssetsLoaded = function () {
    this.camera.setPosition([0.0, 0.0, 2.8]);
    this.mouseHandler.reset();

    this.renderer = new GG.Renderer();
    this.renderer.setCamera(this.camera);
    GG.renderer = this.renderer;

    this.cubeMesh = new GG.TriangleMesh(new GG.SphereGeometry(1.0, 64, 64));//new GG.CubeGeometry());
    this.skyMesh = new GG.TriangleMesh(new GG.SphereGeometry(1.0, 32, 32));

    this.reflectiveTechnique = new GG.ReflectiveTechnique();

    this.refectiveMaterial.diffuse = [ 0.30, 0.30, 0.30 ];
    this.cubeMesh.setMaterial(this.refectiveMaterial);

    this.initialized = true;
};

ReflectionsSample.prototype.update = function () {
    GG.SampleBase.prototype.update.call(this);
    if (this.initialized) {
        this.y_rot += GG.clock.deltaTime() * 0.001;
    }
};

ReflectionsSample.prototype.draw = function () {
    var ctx = new GG.RenderContext();
    ctx.camera = this.camera;

    this.cubeMesh.setPosition([0.0, 0.0, 0.0]);
    this.cubeMesh.setRotation([this.y_rot * 0.5, this.y_rot, 0.0]);

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.cubemapTechnique.render(this.skyMesh, ctx);
    this.reflectiveTechnique.render(this.cubeMesh, ctx);
};


