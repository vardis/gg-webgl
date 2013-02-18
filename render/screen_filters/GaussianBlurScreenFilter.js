GG.GaussianBlurScreenFilter = function (spec) {
    spec = spec || {};
    spec.standalone = true;

    var horizontalSpec = GG.cloneDictionary(spec);
    horizontalSpec.horizontal = true;
	var horizontalPass = new GG.GaussianBlurPass(verticalSpec);

    var verticalSpec = GG.cloneDictionary(spec);
    verticalSpec.horizontal = false;
    var verticalPass = new GG.GaussianBlurPass(verticalSpec);

    spec.screenPasses = [ horizontalPass, verticalPass ];
 	GG.ScreenFilter.call(this, spec);
};

GG.GaussianBlurScreenFilter.prototype = new GG.ScreenFilter();
GG.GaussianBlurScreenFilter.prototype.constructor = GG.GaussianBlurScreenFilter;

GG.PostProcessChain.registerScreenFilter('gaussianBlur', GG.GaussianBlurScreenFilter);
