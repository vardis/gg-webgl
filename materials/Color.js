/**
 * Stores a color in RGBA format.
 * @param r
 * @param g
 * @param b
 * @param a
 * @constructor
 */
GG.Color = function(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a == undefined ? 1.0 : a;
};

GG.Color.prototype.constructor = GG.Color;

GG.Color.fromHSV = function(hue, saturation, value) {
    var chroma = saturation * value;
    var h = hue / 60.0;
    var x = chroma*(1 - Math.abs((h % 2) - 1));
    var m = value - chroma;

    var r, g, b;
    if (h >= 0 && h < 1) {
        r = chroma; g = x; b = 0;
    } else if (h >= 1 && h < 2) {
        r = x; g = chroma; b = 0;
    } else if (h >= 2 && h < 3) {
        r = 0; g = chroma; b = x;
    } else if (h >= 3 && h < 4) {
        r = 0; g = x; b = chroma;
    } else if (h >= 4 && h < 5) {
        r = x; g = 0; b = chroma;
    } else if (h >= 5 && h < 6) {
        r = chroma; g = 0; b = x;
    } else {
        r = g = b = 0;
    }
    //return new GG.Color(r + m, g + m, b + m, 1.0);
    return new GG.Color(255*(r + m), 255*(g + m), 256*(b + m), 1.0);
};

GG.Color.prototype.rgb = function() {
    return [this.r, this.g, this.b];
};

GG.Color.prototype.rgba = function() {
    return [this.r, this.g, this.b, this.a];
};