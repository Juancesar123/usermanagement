
function hasValue(v) {
	return !(v === null || v === '' || typeof v === 'undefined');
}
//exporting function
module.exports.hasValue = hasValue;