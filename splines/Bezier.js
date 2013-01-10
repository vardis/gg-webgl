GG.Bezier = function (spec) {
    spec = spec || {};
    this.segments = [];
    // contains the running sum of the segment ratios
    this.segmentRatios = [];
};

GG.Bezier.prototype.constructor = GG.Bezier;


GG.Bezier.prototype.addCurve = function (p1, cp1, cp2, p2) {
    this.segments.push({
        'p1' : p1, 
        'cp1' : cp1, 
        'cp2' : cp2, 
        'p2' : p2});
    this.calculateSegmentsRatios();
};

GG.Bezier.prototype.point = function (t) {
    if (t == 0) {
        return this.segments[0].p1;
    } else if (t == 1.0) {
        return this.segments[this.segments.length - 1].p2;
    } else {
        var idx = this.getSegmentIndexForTime(t);
        if (idx > 0) {
            var startSegment = this.segmentRatios[idx - 1];
        } else {
            var startSegment = 0;
        }
        var endSegment = this.segmentRatios[idx];
        
        var segmentTime = (t - startSegment) / (endSegment - startSegment);
        return this.interpolateSegment(this.segments[idx], segmentTime);   
    } 
};

GG.Bezier.prototype.interpolateSegment = function (segment, t) {
    var t1 = 1 - t;
    var t2 = t1 * t1;
    var timeSquared = t * t;
    var timeCubic = t * timeSquared;

    var pt = [0, 0, 0];
    pt[0] = t1 * t2 * segment.p1[0] + 3 * t * t2 * segment.cp1[0] + 3 * timeSquared * t1 * segment.cp2[0] + timeCubic * segment.p2[0];
    pt[1] = t1 * t2 * segment.p1[1] + 3 * t * t2 * segment.cp1[1] + 3 * timeSquared * t1 * segment.cp2[1] + timeCubic * segment.p2[1];
    pt[2] = t1 * t2 * segment.p1[2] + 3 * t * t2 * segment.cp1[2] + 3 * timeSquared * t1 * segment.cp2[2] + timeCubic * segment.p2[2];
    return pt;
};

GG.Bezier.prototype.calculateSegmentsRatios = function () {
    var numSegments = this.segments.length;    
    var total = 0;    
    var segmentsLengths = [];

    for (var i = 0; i < numSegments; i++) {
        var v = vec3.create();
        vec3.subtract(this.segments[i].p2, this.segments[i].p1, v);
        var len = vec3.length(v);
        total += len;
        segmentsLengths.push(len);            
    }

    // set ratio for each curve of the spline
    this.segmentRatios = [];
    this.segmentRatios[segmentsLengths.length-1] = 1;

    for (var j = 0; j < segmentsLengths.length-1; j++) {
        this.segmentRatios[j] = segmentsLengths[j] / total;
        if (j > 0) {
            this.segmentRatios[j] += this.segmentRatios[j - 1];
        }
    }
};

/**
 * Returns the index of the spline segment that corresponds to the given
 * time value.
 */
GG.Bezier.prototype.getSegmentIndexForTime = function (t) {
    for (var j = 0; j < this.segmentRatios.length; j++) {
        if (t < this.segmentRatios[j]) return j;
    }
    return this.segmentRatios.length - 1;
};
