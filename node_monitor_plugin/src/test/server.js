/**
 * Testing with Node.js pure server
 */
var http = require('http')
	,logger = require('../util/logger').Logger('node_server')
//	,monitor = require('node-monitor')
	,monitor = require('../monitor')
	;

/**
 * @param WID {NUMBER} the worker id (can be omitted - default value is '0')
 */
var launch = exports.launch = function(WID) {
	var worker = WID ? ('w' + WID) : 'w0'; // Worker object
	var msg = "Hello, I'm worker "+worker;
	var server = null;
	
	// *** uncaughtException - Catch-all for monitoring uncaught exceptions
	process.on('uncaughtException', function(err) {
		logger.fatal(worker + ": Un-caught exception: " + err + "\n" + err.stack);
		process.kill(process.pid, 'SIGHUP');
	});

	// *** Hook process events - This performs a graceful exit by allowing other SIGINT and SIGTERM hooks to process.
	process.once('SIGINT', function() {
		logger.warn(worker + ": SIGINT received!!!");
		stop();
	});

	process.once('SIGTERM', function() {
		logger.warn(worker + ": SIGTERM received!!!");
		stop();
	});

	process.once('SIGHUP', function() {
		logger.warn(worker + ": SIGHUP received!!!");
		stop();
	});

	// careful process ending
	function stop() {
		logger.warn(worker + ": Process will be stopping...");
		if (server && server !== null) {
			try {
				logger.warn(worker + ": Server stopping...");
				monitor.removeFromMonitor(server);
				server.close();
				server = null;
			} catch (err) {/* ignore */	}
		}
	}
	
	server = http.createServer(function(req, res) {
		
		server.emit('agent_request', req);
		
		res.writeHead(200, {
			'Content-Type' : 'text/plain',
			'Mon-SessionID' : '1a8c7e19502002b037b948714357dd3f1309960401',
			'content-length': msg.length,
			'connection': 'close'
		});
		res.write(msg);
		res.end();
	}).listen(8080);
	
	monitor.Monitor(server, {'worker':worker, port:8080, host:'localhost'});//add server to monitor
	
	console.log(worker+': Server is running on port 8080');
};
if (require.main === module) {
	launch();
}
