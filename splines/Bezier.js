GG.Bezier = function (spec) {
    this.points = spec.points != null ? spec.points : [];
    this.tangents = [];
    this.cp0 = spec.cp0 != null ? spec.cp0 : [0, 0, 0];
    this.cp1 = spec.cp1 != null ? spec.cp1 : [0, 0, 0];
    this.cp2 = spec.cp2 != null ? spec.cp2 : [0, 0, 0];
    this.cp3 = spec.cp3 != null ? spec.cp3 : [0, 0, 0];
};

GG.Bezier.prototype.constructor = GG.Bezier;




GG.Bezier.prototype.point = function (t) {
    var t1 = 1 - t;
    var t2 = t1 * t1;
    var timeSquared = t * t;
    var timeCubic = t * timeSquared;

    var pt = [0, 0, 0];
    pt[0] = t1 * t2 * this.cp0[0] + 3 * t * t2 * this.cp1[0] + 3 * timeSquared * t1 * this.cp2[0] + timeCubic * this.cp3[0];
    pt[1] = t1 * t2 * this.cp0[1] + 3 * t * t2 * this.cp1[1] + 3 * timeSquared * t1 * this.cp2[1] + timeCubic * this.cp3[1];
    pt[2] = t1 * t2 * this.cp0[2] + 3 * t * t2 * this.cp1[2] + 3 * timeSquared * t1 * this.cp2[2] + timeCubic * this.cp3[2];
    return pt;
};
