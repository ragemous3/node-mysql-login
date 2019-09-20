function MYSQL_ERROR_HANDLER(e) {

	if (e.prototype instanceof Object) {
		if (e.hasOwnProperty('code')) {
			if (e.info.code == 1062) {
				console.error(e.info.msg);
			} else if (e.info.code == 22001) {
				console.error(e.info.msg);
			}
		} else {
			console.log(e);
			console.error(`Error getting all that you want baby ${e}`);
		}
	} else {
		console.error("\x1b[41m", '\n!wtf!\n');
		console.error("\x1b[40m", e);
		return {
			msg: e,
		};
	}
}
module.exports = { MYSQL_ERROR_HANDLER };
