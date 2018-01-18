/*
 * name: node-monitor
 * version: 0.5.13
 * description: Node.js cluster monitor module
 * repository: git://github.com/shunanya/Node.js-cluster-monitoring.git
 * dependencies: 
 * 	 Node.js: >= 4.0.x
 *   log4js: >= 0.6.x
 * copyright : (c) 2014 - 2016 Monitis
 * license : MIT
 */
var events = require('events')
  , sys = require('util')
  , http = require('http')
  , url = require('url')
  , path = require('path')
  , hash = require('node_hash')
  , utils = require('./util/utils')
  , logger = require('./util/logger').Logger('node_monitor');

// ****** Constants ******
var MAX_VALUE = Number.MAX_VALUE;
var TOP_MAX = 3; // The maximum number of collected requests that spent most time for execution
var TOP_LIMIT = 1; // the monitor have to collect info when exceeding the number of specified seconds only
var STATUS_OK = 'OK';
var STATUS_NOK = 'NOK';
var STATUS_DOWN = 'DOWN';
var STATUS_IDLE = 'IDLE';
var DURATION = 1;
var FILE_PATH = path.join(utils.search_file('./log/', '/home/vesta/log/'), "monitor_result");
var schedule = null;
// ***********************

var monitors = [];

function createMon() {
	// monitored data structure
	var mon = {
		// options
		'worker' : -1,
		'pid': 0,
		'collect_all' : false,
		// fixed part
		'server' : null,
		'listen' : "",
		'requests' : 0,
		'post_count' : 0,
		'exceptions' : 0,
		'get_count' : 0,
		'active' : 0,
		// Total
		'time' : 0,
		'avr_time' : 0,
		'min_time' : MAX_VALUE,
		'max_time' : 0,
		// Network latency
		'net_time' : 0,
		'avr_net_time' : 0,
		'min_net_time' : MAX_VALUE,
		'max_net_time' : 0,
		// Server responce time
		'resp_time' : 0,
		'avr_resp_time' : 0,
		'min_resp_time' : MAX_VALUE,
		'max_resp_time' : 0,
		// Read/Writes
		'bytes_read' : 0,
		'bytes_written' : 0,
		// Status codes
		'1xx' : 0,
		'2xx' : 0,
		'3xx' : 0,
		'4xx' : 0,
		'timeout' : 0,// status code 408
		'5xx' : 0,
		'timeS' : Date.now(),
		'timeE' : Date.now(),
		'status' : STATUS_IDLE,
		// flexible part
		'info' : {
			'add' : function(name, data, count) {
				if (!this[name]) {
					this[name] = {};
				}

				if (this[name][data]) {
					this[name][data] += count !== undefined ? count : 1;
				} else {
					this[name][data] = count !== undefined ? count : 1;
				}
			},
			'addSorted' : function(name, data, sort_key_value) {
				var value = sort_key_value / 1000;
				if (TOP_MAX <= 0 || TOP_LIMIT > value) {
					return;
				}
				if (!this[name]) {
					this[name] = [];
				}
				var t = {
					't' : value,
					'data' : data
				};
				this[name].push(t);
				if (this[name].length > 1) {
					this[name].sort(function(a, b) {
						return b['t'] - a['t'];
					});
				}
				if (this[name].length > TOP_MAX) {
					this[name].pop();
				}
			},
			'addAll' : function(info) {
				var self = this;
				var t = "";
				function isArray(obj) {
					return obj.constructor == Array;
				}
				JSON.stringify(info, function(key, value) {
					if (typeof (value) == 'object') {
						if (!isArray(value)) {
							t = key;
						} else {
							value.forEach(function(element, index, value) {
								self.addSorted(key, element['data'], element['t']);
							}, self);
							return;
						}
					} else if (utils.var_type(value) != 'function' && t.length > 0) {
						self.add(t, key, value);
					}
					return value;
				});
			}
		}

	};
	return mon;
}

/**
 * Adds the given server to the monitor chain
 * 
 * @param server
 *            {Object}
 * @param options
 *            {Object} the options for given server monitor 
 *            {'collect_all': ('yes' | 'no'), 'top':{'max':<value>, 'limit':<value>}} 
 *            where 
 *            top.max - the maximum number of collected requests that spent most time for execution 
 *            top.limit - the monitor have to collect info when exceeding the number of specified seconds only
 *            default - {'collect_all': 'no', 'top':{'max':3, 'limit':1}}
 * @returns {Object} mon_server structure if given server added to the monitor chain 
 * 			  null if server is already in monitor
 */
function addToMonitors(server, options) {
	var collect_all = false;
	if ('object' == typeof(options)) {// Parse options
		logger.info(options.worker+': Registering Monitor: ' + JSON.stringify(options));
		collect_all = !!(options.collect_all && (options.collect_all == 'yes' || options.collect_all === true ));
	if (options['top'] && options['top']['max'] !== undefined) {
		TOP_MAX = Math.max(TOP_MAX, Math.max(options.top.max, 0));
	}
	if (options['top'] && options['top']['limit'] !== undefined) {
		TOP_LIMIT = options.top.limit <= 0 ? 0 : Math.max(TOP_LIMIT, options.top.limit);
	}
	DURATION = (options.duration || 1);
	}

	if (server && (options.active != "no" || options.active !== false)
	 && (monitors.length === 0 || !monitors.some(function(element) {return element['server'] == server;}))
	 ) {
		var mon_server = createMon();
		var host = options.worker+"."+options.host + ":" + options.port;
		mon_server['worker'] = options.worker;
		mon_server['collect_all'] = collect_all;
		mon_server['server'] = server;
		mon_server['listen'] = options.port;// host;
		mon_server['pid'] = process.pid;
		monitors.push(mon_server);
		logger.info(options.worker+": Server " + host + " added to monitors chain ("+monitors.length+")");
		logger.info(options.worker+": Monitoring data will be put into '"+FILE_PATH+"'");
		if (!schedule) {
			schedule = require('node-schedule');
			var rule = new schedule.RecurrenceRule();

			rule.minute = new schedule.Range(0, 59, DURATION);
			rule.second = utils.toInt(options.worker);

			schedule.scheduleJob(rule, function(){
				putMeasuredData(options.worker);
			});
		}
		return mon_server;
	}
	logger.warn(options.worker+": Monitor isn't activated ("+(options.active == "no"? "active = no":"couldn't add the same server")+")");
	return null;
}

/**
 * Removes given server from monitor chain
 * 
 * @param server
 */
function removeFromMonitor(server) {
	if (server && monitors.length > 0) {
		for ( var i = 0; i < monitors.length; i++) {
			var mon_server = monitors[i];
			if (mon_server['server'] == server) {
				logger.warn(mon_server['worker']+": Server " + mon_server['listen'] + " stopped and removed from monitors chain");
				monitors.splice(i, 1);// remove monitored element
			}
		}
	}
}

function addExceptionToMonitor(server, callback) {
	var ret = false;
	if (server && monitors.length > 0) {
		for ( var i = 0; i < monitors.length; i++) {
			var mon_server = monitors[i];
			if (mon_server['server'] == server && mon_server.hasOwnProperty('exceptions')) {
				++mon_server['exceptions'];
				ret = true;
				break;
			}
		}
	}
	return (callback ? (callback(!ret)) : (ret));
}
exports.addExceptionToMonitor = addExceptionToMonitor;

function addResultsToMonitor(server, requests, post_count, get_count, net_duration, pure_duration, total_duration,
		bytes_read, bytes_written, status_code, info, userInfo, callback) {
	var ret = false;
	if (server && monitors.length > 0) {
		for ( var i = 0; i < monitors.length; i++) {
			var mon_server = monitors[i];
			if (mon_server['server'] == server) {
				// logger.debug(mon_server['worker']+": adding parameters...");
				mon_server['time'] += total_duration;
				mon_server['min_time'] = Math.min(total_duration, mon_server['min_time']);
				if (status_code != 408){// timeout shouldn't be calculated
					mon_server['max_time'] = Math.max(total_duration, mon_server['max_time']);
					mon_server['max_resp_time'] = Math.max(pure_duration, mon_server['max_resp_time']);
					mon_server['max_net_time'] = Math.max(net_duration, mon_server['max_net_time']);
				} else {
					mon_server['timeout'] += 1;// DEBUG
				}
				mon_server['resp_time'] += pure_duration;
				mon_server['min_resp_time'] = Math.min(pure_duration, mon_server['min_resp_time']);
				mon_server['net_time'] += net_duration;
				mon_server['min_net_time'] = Math.min(net_duration, mon_server['min_net_time']);
				mon_server['active'] += ((net_duration + pure_duration) / 1000);
				mon_server['requests'] += requests;
				mon_server['avr_time'] = mon_server['time'] / mon_server['requests'];
				mon_server['avr_resp_time'] = mon_server['resp_time'] / mon_server['requests'];
				mon_server['avr_net_time'] = mon_server['net_time'] / mon_server['requests'];
				mon_server['post_count'] += post_count;
				mon_server['get_count'] += get_count;
				mon_server['bytes_read'] += bytes_read;
				mon_server['bytes_written'] += bytes_written;
				mon_server['1xx'] += (status_code < 200 ? 1 : 0);
				mon_server['2xx'] += (status_code >= 200 && status_code < 300 ? 1 : 0);
				mon_server['3xx'] += (status_code >= 300 && status_code < 400 ? 1 : 0);
				mon_server['4xx'] += (status_code >= 400 && status_code < 500 ? 1 : 0);
				mon_server['5xx'] += (status_code >= 500 ? 1 : 0);
				mon_server['timeE'] = Date.now();
				if (typeof(info) == 'object') {
					mon_server['info'].addAll(info);
				}
				if (userInfo) {
					mon_server['info'].addSorted('top' + TOP_MAX, userInfo, total_duration);
				}
				ret = true;
				break;
			}
		}
	}
	return (callback ? (callback(!ret)) : (ret));
}

/**
 * Composes all monitored servers data in following form <server1 data string> <server2 data string> ......
 * 
 * @param clean
 *            (optional) if given, 
 *            it is forcing to clear all accumulated data after composing a summarized result string
 * 
 * @returns {String}
 */
function getMonitorAllResults(clean) {
	var res = "";
	for ( var i = 0; i < monitors.length; i++) {
		res += monitorResultsToString(monitors[i]);
		res += "\n";
	}
	if (clean) {
		cleanAllMonitorResults();
	}
	return res;
}

/**
 * Returns total (summarized) monitored results
 * 
 * @param clean
 *            (optional) if given, 
 *            it is forcing to clear all accumulated data after composing a summarized result string
 * @returns {String} the total monitored result string
 */
function getMonitorTotalResult(clean) {
	var sum = createMon();
	for ( var i = 0; i < monitors.length; i++) {
		var mon = monitors[i];
		if (sum['listen'].length <= 0) {
			sum['listen'] = mon['listen'];
		} else {
			sum['listen'] += ',' + mon['listen'];
		}
		if (sum['worker'] < 0 || sum['worker'] != mon['worker']){
//			logger.warn(mon['worker']+": Different workers ("+sum['worker']+" != "+mon['worker']+")")
			sum['worker'] = mon['worker'];
			sum['pid'] = mon['pid'];
		}
		sum['min_time'] = Math.min(sum['min_time'], mon['min_time']);
		sum['max_time'] = Math.max(sum['max_time'], mon['max_time']);
		sum['time'] += mon['time'];
		sum['min_net_time'] = Math.min(sum['min_net_time'], mon['min_net_time']);
		sum['max_net_time'] = Math.max(sum['max_net_time'], mon['max_net_time']);
		sum['net_time'] += mon['net_time'];
		sum['min_resp_time'] = Math.min(sum['min_resp_time'], mon['min_resp_time']);
		sum['max_resp_time'] = Math.max(sum['max_resp_time'], mon['max_resp_time']);
		sum['resp_time'] += mon['resp_time'];
		sum['exceptions'] += mon['exceptions'];
		sum['active'] += mon['active'];
		sum['requests'] += mon['requests'];
		sum['post_count'] += mon['post_count'];
		sum['get_count'] += mon['get_count'];
		sum['bytes_read'] += mon['bytes_read'];
		sum['bytes_written'] += mon['bytes_written'];
		sum['1xx'] += mon['1xx'];
		sum['2xx'] += mon['2xx'];
		sum['3xx'] += mon['3xx'];
		sum['4xx'] += mon['4xx'];
		sum['5xx'] += mon['5xx'];
		sum['timeout'] += mon['timeout'];
		sum['timeS'] = Math.min(sum['timeS'], mon['timeS']);
		sum['timeE'] = Math.max(sum['timeE'], mon['timeE']);

		// logger.info(mon['worker']+": >>>>>>>"+JSON.stringify(mon['info']).toString());

		sum.info.addAll(mon.info);

		// logger.info(mon['worker']+": <<<<<<<"+JSON.stringify(sum['info']).toString());
	}
	if (sum['active'] <= 0) {
		sum['avr_time'] = 0;
		sum['avr_resp_time'] = 0;
		sum['avr_net_time'] = 0;
	} else {
		sum['avr_time'] = sum['time'] / sum['requests'];
		sum['avr_resp_time'] = sum['resp_time'] / sum['requests'];
		sum['avr_net_time'] = sum['net_time'] / sum['requests'];
	}
	if (clean) {
		cleanAllMonitorResults();
	}
	if (sum['listen'].length == 0) {
		sum['status'] = STATUS_DOWN;
	} else if (sum['requests'] == 0) {
		sum['status'] = STATUS_IDLE;
	} else if ((sum['max_net_time'] != 0 && sum['avr_net_time'] / sum['max_net_time'] > 1)
			|| (sum['max_resp_time'] != 0 && sum['avr_resp_time'] / sum['max_resp_time'] > 1)) {
		sum['status'] = STATUS_NOK;
	} else {
		sum['status'] = STATUS_OK;
	}
	return monitorResultsToString(sum);
}

function getMonitorResults(server) {
	var ret = "";
	if (server && monitors.length > 0) {
		for ( var i = 0; i < monitors.length; i++) {
			var mon_server = monitors[i];
			if (mon_server['server'] == server) {
//				logger.debug(mon_server['worker']+": getting monitor parameters...");
				ret = monitorResultsToString(mon_server);
				break;
			}
		}
	}
	return ret;
}

/**
 * Returns the composed string in the following form
 * 
 * <fixed part of data> | <flexible (optional part of data)>
 * 
 * where the fixed part item has key:value form and flexible part represents in JSON form like
 * 		{name1:{name11:value11,...},name2:{name21:vale21,...}...}
 * 
 * @param mon_server
 *            the collecting monitored data structure
 * @returns composed string that represents a monitoring data
 */
function monitorResultsToString(mon_server) {
	var time_window = ((Date.now()) - mon_server['timeS']) / 1000; // monitoring time window in sec
	var time_idle = time_window - mon_server['active'];
	var load = mon_server['requests'] / time_window;
	ret = "status:" + mon_server['status'] 
		+ ";uptime:" + escape(utils.formatTimestamp(process.uptime()))
		+ ";worker:" + mon_server['worker']
		+ ";avr_net:" + (mon_server['avr_net_time'] / 1000).toFixed(3) 
		+ ";max_net:" + (mon_server['max_net_time'] / 1000).toFixed(3)
		+ ";avr_resp:" + (mon_server['avr_resp_time'] / 1000).toFixed(3) 
		+ ";max_resp:" + (mon_server['max_resp_time'] / 1000).toFixed(3)
		+ ";avr_total:" + (mon_server['avr_time'] / 1000).toFixed(3) 
		+ ";max_total:" + (mon_server['max_time'] / 1000).toFixed(3) 
		+ ";in_rate:" + ((mon_server['bytes_read'] / time_window / 1000).toFixed(3)) 
		+ ";out_rate:" + ((mon_server['bytes_written'] / time_window / 1000).toFixed(3)) 
		+ ";active:" + (mon_server['active'] / time_window * 100).toFixed(2) 
		+ ";load:" + (load).toFixed(3);
	// + ";OFD:"+OFD;
	if (mon_server['requests'] > 0) {
		mon_server['info'].add('platform', "total", mon_server['requests']);
		mon_server['info'].add("codes", "1xx", mon_server['1xx']);
		mon_server['info'].add("codes", "2xx", mon_server['2xx']);
		mon_server['info'].add("codes", "3xx", mon_server['3xx']);
		mon_server['info'].add("codes", "4xx", mon_server['4xx']);
		mon_server['info'].add("codes", "408", mon_server['timeout']);
		mon_server['info'].add("codes", "5xx", mon_server['5xx']);
		mon_server['info'].add("misc", "post", ((mon_server['post_count'] / mon_server['requests'] * 100)).toFixed(1));
		mon_server['info'].add("misc", "2xx", (100 * mon_server['2xx'] / mon_server['requests']).toFixed(1));
		mon_server['info'].add("misc", "exc", mon_server['exceptions']);
	}
	mon_server['info'].add("misc", "mon_time", (time_window).toFixed(3));
	mon_server['info'].add("misc", "listen", '{' + mon_server['listen'] + '}');
	mon_server['info'].add("misc", "pid", mon_server['pid']);
	ret += " | " + JSON.stringify(mon_server['info']).toString()+'\n'; // additional (variable part) results
	return ret;
}

function cleanAllMonitorResults() {
	for ( var i = 0; i < monitors.length; i++) {
		monitors[i] = monitorResultsClean(monitors[i]);
	}
}

function cleanMonitorResults(server) {
	var ret = false;

	if (server && monitors.length > 0) {
		for ( var i = 0; i < monitors.length; i++) {
			if (monitors[i]['server'] == server) {
//				logger.debug(monitors[i]['worker']+": cleaning parameters...");
				monitors[i] = monitorResultsClean(monitors[i]);
				ret = true;
				break;
			}
		}
	}
	return ret;
}

function monitorResultsClean(mon_server) {
	var server = mon_server['server'];
	var listen = mon_server['listen'];
	var timeS = mon_server['timeS'];
	var worker = mon_server['worker'];
	var pid = mon_server['pid'];
	
	var mon = createMon();

	mon['server'] = server;
	mon['listen'] = listen;
	mon['timeE'] = timeS;
	mon['worker'] = worker;
	mon['pid'] = pid;
	return mon;
}

/**
 * Composes the flexible info part of data NOTE: this part is very specific and depends on possible server requests
 * 
 * @param request
 *            {Object} the HTTP(S) request object that holds a required information
 * @param collect_all
 *            {boolean} true value indicates to collecting all possible information
 * @returns the composed flexible info object
 */
function getRequestInfo(request, collect_all) {
	var tmp = createMon();
	var headers = request.headers;
	if (typeof(headers) == 'object') {
		var value = headers['mon-platform'];
		if (value && value.length > 0) {
			tmp.info.add('platform', value);
		}
		value = headers['mon-version'];
		if (value && value.length > 0) {
			tmp.info.add('version', value);
		}
		if (collect_all) {
			value = headers['mon-email'] || headers['info']['us'];
			if (value && value.length > 0) {
				tmp.info.add('email', value);
			}
			value = headers['mon-aname'] || headers['info']['ag'];
			if (value && value.length > 0) {
				tmp.info.add('aname', value);
			}
		}
	}
	return tmp.info;
}

/**
 * 
 * @param req
 * @returns OBJECT with user info
 */
function getUserInfo(req) {
	var tmp = {};
	var headers = req.headers;
	if (typeof(headers) == 'object') {
		var value = utils.getClientIp(req);
		if (value && value.length > 0) {
			tmp['ip'] = value;
		}
		value = headers['host'];
		if (value && value.length > 0) {
			tmp['host'] = value;
		}
	}
	return tmp;
}

/**
 * Main Monitor class
 * 
 * It only should be initiated when given server wants to be under monitoring *
 * 
 * @param server
 *            {Object} to be under monitoring
 * @param options
 *            {Object} the options for given server monitor 
 *            {'collect_all': ('yes' | 'no'), 'top':{'max':<value>, 'limit':<value>}} 
 *            where 
 *            	top.max - the maximum number of collected requests that spent most time for execution 
 *            	top.limit - the monitor have to collect info when exceeding the number of specified seconds only
 *            	default - {'collect_all': 'no', 'top':{'max':3, 'limit':3}}
 * 
 */
var Monitor = exports.Monitor = function(server, options) {
	var self = this;
	var mon_server = addToMonitors(server, options);
	if (mon_server && mon_server != null) {
		var host = options.host;
		var port = options.port;

		// listener for requests
		server.on('request', function(req, res) {

			// logger.info("\nRequest\n"+sys.inspect(req));

			var params = {};
			params['timeS'] = Date.now();//
			params['Host'] = /* host + ":" + */port;
			// params['Scheme'] = "HTTP";
			params['Method'] = req.method;
			params["content-length"] = req.headers['content-length'];
			params['info'] = getRequestInfo(req, mon_server['collect_all']);
			params['user'] = getUserInfo(req);

			// params['memory'] = sys.inspect(process.memoryUsage());
			// params['free'] = os.freemem()/os.totalmem()*100;
			// params['cpu'] = sys.inspect(os.cpus());

			// logger.info(options.worker+': Request0: '+JSON.stringify(params, true,2));

			req.on('add_data', function(obj) {
 			// logger.info(options.worker+': req.on add_data '+JSON.stringify(obj));
				params['net_time'] = obj['net_time'] || 0;
			});

			req.on('end', function() {
				var net_time = Date.now();
			// logger.info(options.worker+': req.on end ' + (net_time - params['timeS']));
				params['net_time'] = net_time;
			});

			var socket = req.socket || {};
			var csocket = req.connection.socket || {};
			// listener for response finishing
			if (req.socket) {
				req.socket.on('error', function(err) {
					logger.warn(options.worker+': SOCKET.ERROR ' + err + " ("+JSON.stringify(params)+") - " + (Date.now() - params['timeS'])/*+err.stack*/);
				});
				req.socket.on('close', function() {
					params['timeE'] = Date.now();
					params['pure_duration'] = (params['timeE'] - (params['net_time'] || params['timeE']));
					params['net_duration'] = ((params['net_time'] || params['timeE']) - params['timeS']);
					params['total_duration'] = (params['timeE'] - params['timeS']);

					try {
						params['Read'] = socket.bytesRead || csocket.bytesRead || 0;
//						console.log('Read: '+params['Read']);
					} catch (err) {
						params['Read'] = 0;
//						console.error('Read: 0');
					}
					try {
						params['Written'] = socket.bytesWritten || csocket.bytesWritten || 0;
//						console.log('Written: '+params['Written']);
					} catch (err) {
						params['Written'] = 0;
//						console.error('Written: 0');
					}
					try {
						params['Status'] = res.statusCode;
					} catch (err) {
						params['Status'] = 0;
					}
					params['Uptime'] = process.uptime();

					if (params['Written'] == 0) {
						var hdr = {};
						try {
							hdr = res['_headers'];
						} catch (err) {
							hdr = {};
						}
						logger.warn(options.worker+': Written:0 ' + JSON.stringify(hdr));
					}
/*					logger.info(options.worker+': SOCKET.CLOSE: ' + JSON.stringify(params));*/
					process.nextTick(function(){
						addResultsToMonitor(server, 1, (req.method == "POST" ? 1 : 0), (req.method == "GET" ? 1 : 0),
							params['net_duration'], params['pure_duration'], params['total_duration'], params['Read'],
							params['Written'], params['Status'], params['info'], params['user'], function(error) {
								if (error)
									logger.error(options.worker+': Monitor: SOCKET.CLOSE-addResultsToMonitor: error while add');
							});
					});
				});
			} else {
				res.on('finish', function() {
					params['timeE'] = Date.now();
					params['pure_duration'] = (params['timeE'] - (params['net_time'] || params['timeE']));
					params['net_duration'] = ((params['net_time'] || params['timeE']) - params['timeS']);
					params['total_duration'] = (params['timeE'] - params['timeS']);

					try {
						params['Read'] = socket.bytesRead || csocket.bytesRead;
					} catch (err) {
						params['Read'] = 0;
					}
					try {
						params['Written'] = socket.bytesWritten || csocket.bytesWritten;
					} catch (err) {
						params['Written'] = 0;
					}
					try {
						params['Status'] = res.statusCode;
					} catch (err) {
						params['Status'] = 0;
					}
					params['Uptime'] = process.uptime();// (timeE - time_start) / 1000;// uptime in sec

/*					logger.info(options.worker+': RES.FINISH: ' + JSON.stringify(params));*/
					process.nextTick(function(){
						addResultsToMonitor(server, 1, (req.method == "POST" ? 1 : 0), (req.method == "GET" ? 1 : 0),
							params['net_duration'], params['pure_duration'], params['total_duration'], params['Read'],
							params['Written'], params['Status'], params['info'], params['user'], function(error) {
								if (error)
									logger.error(options.worker+': Monitor: RES.FINISH-addResultsToMonitor: error while add');
							});
					});
				});
			}
		});

		// listener for server closing
		server.on('close', function(errno) {
			removeFromMonitor(server);
		});

		events.EventEmitter.call(this);
	}
};

sys.inherits(Monitor, events.EventEmitter);

/**
 * Calculates a count of milliseconds to nearest 'min' minute
 * 
 * @param min
 *            the desired interval in minutes
 * @returns {Number} the delay in milliseconds
 */
function getDelayToNearestMinute(min) {
	var now = Date.now();
	var tm = (min ? Math.max(min, 1) : 1) * 60000;
	var next = Math.floor((now + tm) / tm) * tm;
//	console.log('next: ' + next + '(' + new Date(next) + ') now: ' + now + ' (' + new Date(now) + ')');
	return next - now;
}

function putMeasuredData(worker) {
	var data = getMonitorTotalResult(true);
	utils.file_write(FILE_PATH, data, "utf8", true, function(err){
		if (err){
			logger.warn(worker+': ' + err);
		} else {
			logger.info(worker+': Append ' + data.length + ' bytes into ' + FILE_PATH);
		}
	});
}

