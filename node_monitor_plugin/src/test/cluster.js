global.options;

var numCPUs = require('os').cpus().length;
var logger = require('../util/logger').Logger('cluster');
////var config = require('../config');
//The store requires that a shared-state server is running in the master process. 
//The server is initialized automatically when you call require() for this module from the master. 
//In the case that your master and workers have separate source files, you must explicitly require this module in your master source file. 
//Optionally, you can call setup() to make it more obvious why you are loading a module that is not used anywhere else.
//var shareTlsSessions = require('strong-cluster-tls-store').setup();

var workers = numCPUs;

logger.info("*** Required number of workers = "+workers+" ***");

if (workers > 0) {// cluster mode
	logger.info("***** Run Node.js server in cluster mode with "+workers+" workers *****");
	var cluster = require('cluster');
	
	if (cluster.isMaster) {
		var map = {};

		function forkWorker(data) {
			var worker = cluster.fork({
				data : data
			});
			map[worker.id] = data;
		}

		// Fork workers.
		for (var i = 0; i < workers; i++) {
			forkWorker(i);
		}

		cluster.on('exit', function(worker, code, signal) {
			logger.warn('Worker ' + worker.process.pid + ' died' + " (" + worker.process.env + ")");
			var data = map[worker.id];
			delete map[worker.id]; // We don't need old id mapping.
			forkWorker(data);
		});
		// monitor.init();
		cluster.on('listening', function(worker, address) {
			logger.info("A worker is now connected to " + worker.id + "." + address.address + ":" + address.port);
		});

	} else {
		logger.info("A new worker is launched: " + process.env.data);
		var id = require('./server').launch(process.env.data);
		logger.info("serverID = " + id);
	}
} else {// run without cluster
	logger.info("***** Run Node.js server without cluster mode *****");
	require('./server').launch();
}
