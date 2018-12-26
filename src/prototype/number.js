Number.prototype.clamp = function(min, max) {
	return Math.min(Math.max(this, min), max);
};

Number.prototype.between = function(min, max) {
	return this >= min && this <= max;
};
