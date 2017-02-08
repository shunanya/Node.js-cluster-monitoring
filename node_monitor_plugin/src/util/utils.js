/**
 * Copyright (c) 2014 Monitis
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * @author Monitis CJSC
 * @license http://www.opensource.org/licenses/mit-license.html MIT License
 */
var fs = require('fs');
var path = require('path');
var net = require('net');
//var _ = require('lodash');

/**
 * The function returns an object containing the mac addresses of all eth* devices.
 * e.g. { eth0: 'f4:6d:04:63:8e:21' } 
 * NOTE: If you want all devices that have one, even if they are e.g. called wlan*, 
 * 		 simply remove the <code>dev.substr(0, 3) == 'eth'</code> check.
 */
function getMACAddresses() {
	var macs = {};
	var devs = fs.readdirSync('/sys/class/net/');
	devs.forEach(function(dev) {
		var fn = path.join('/sys/class/net', dev, 'address');
		if (/*dev.substr(0, 3) == 'eth' && */fs.existsSync(fn)) {
			macs[dev] = fs.readFileSync(fn).toString().trim();
		}
	});
	return macs;
}
exports.getMACAddresses = getMACAddresses;

/**
 * Returns the user home directory
 */
function home_dir(){
	return JSON.parse(JSON.stringify(process.env)).HOME;
}
exports.home_dir = home_dir;

/**
 * Returns parent dirname if parameter represents a path to file.
 * Otherwise returns the same path.
 */
function dirname(value){
	if (typeof(value) == 'string'){//parameter is string
		if (value.charAt(value.length - 1) != '/') {//path to file
			return value.replace(path.basename(value),'');
		}
		return value;
	}
}
exports.dirname = dirname;

/**
 * returns file or folder info
 * 
 * @param file_name
 *            {STRING} a name of file or folder
 * @param parameter
 *            {STRING} optional parameter (mode, size, blksize, [a|m|c]time, etc.)
 */
function file_info(file_name, parameter){
	var json = JSON.stringify(fs.statSync(file_name));
	if (parameter === undefined) {
		return json;
	} else {
		return JSON.parse(json)[parameter];
	}
}
exports.file_info = file_info;

/**
 * returns the temporary directory path in the user HOME 
 */
function temp_dir(){
	var tmp_dir = path.join(JSON.parse(JSON.stringify(process.env)).HOME, "tmp");
	if (!fs.existsSync(tmp_dir)) {
		console.log("Creating directory: "+tmp_dir);
		fs.mkdirSync(tmp_dir, 16877);
	}
	return tmp_dir;
}
exports.temp_dir = temp_dir;

//removes file from temporary folder
exports.temp_remove = function(file_name){
	try {
		fs.unlinkSync(path.join(temp_dir(),file_name));
	} catch(e){/*nothing to do*/}
};

//write stored result (temporary action - for debug only)
exports.temp_write = function(file_name, data, type, append){
	var file_path = path.join(temp_dir(),file_name);
	file_write(file_path, data, type, append);
};

//write file asynchronously
//Note that this doesn't a synchronous blocking call.
function file_write(file_path, data, type, append, callback) {
	if (type !== undefined && type == 'binary') {// binary file cannot be appended
		try {
			fs.unlinkSync(file_path);
		} catch (e) {/* nothing to do */}
	}
	var file1 = fs.createWriteStream(file_path, {'flags' : (append !== undefined ? 'a' : 'w')});
	if (file1) {
		file1.on('error', function(err) {
			return callback(err);
		})
		file1.end(data, function() {
			return callback();
		});
	} else {
		return callback('Cold not create file ' + file_path);
	}
}
exports.file_write = file_write;

function file_read(file_path, type){
	 return fs.readFileSync(file_path, type?type:'utf8');
}
exports.file_read = file_read;

/**
 * Searching of specified file/dir beginning from 'start_dir' up to 'end_dir'. 
 * 
 * At the end of search the full path will returned on success.
 * The default path (def-file_path) can be specified. it will return on search failed.
 */
function search_file(file_path, def_file_path){
	var end_dir = '/';			//root folder as the end dir of searching
	var start_dir = __dirname;	//current folder as the start dir of searching
	var isDir = false
	if (file_path.charAt(file_path.length -1)=='/'){
		isDir = true
	}
	var file = undefined;
	var _file;
	var cur_path = start_dir; // current folder
	while (cur_path != end_dir) {
		_file = path.normalize(path.resolve(cur_path, '..', file_path));
		if (fs.existsSync(_file) && fs.statSync(_file).isDirectory() == isDir) {
			file = _file;
//			console.log("FOUND: "+file);
			break;
		} else {
//			console.log("NOT found "+_file);
			cur_path = path.join(cur_path, '..');
		}
	}
	return file || def_file_path;
}
exports.search_file = search_file;

/**
 * Converts buffer to hex string (lowercase)
 * 
 * @param buffer [BUFFER] Buffer that contain binary data 
 * @return [STRING] lower case hex string 
 */
function hexl(buffer) {
    var str = "";
    for (var i=0; i!=buffer.length; ++i) {
      str += pad(buffer[i], 2);
    }
    return str;
}
exports.hexl = hexl;

/**
 * Converts buffer to hex string (upercase)
 * 
 * @param buffer [BUFFER] Buffer that contain binary data 
 * @return [STRING] upper case hex string 
 */
exports.hexu = function (buffer) {
    return hexl(buffer).toUpperCase();
  };

//---Internally used functions-----
 function pad(b, len) {
    var s = b.toString(16);
    
    while (s.length < len) {
      s = "0" + s;
    }
    return s;
  }
  
 function rpad(s, len) {
    while(s.length < len) {
      s += " ";
    }
    return s;
  }
//-----------------------------------

/**
 * Convert string to hex string
 */
exports.stringtoHex = function (str){
    var r="";
    var e=str.length;
    var c=0;
    var h;
    while(c<e){
        h=str.charCodeAt(c++).toString(16);
        while(h.length<3) h="0"+h;
        r+=h;
    }
    return r;
};

/**
 * Convert string to hex string
 */
exports.stringtoHex2 = function(str) {
//	console.log("String to convert = "+str);
    var hex = "";
    for(var i=0;i<str.length;i++) {
//    	console.log(i+"-symbol = "+(str.charCodeAt(i)-48));
        hex += ""+(str.charCodeAt(i)-48).toString(16);
//        console.log("converting after "+i+" itteration = "+hex);
    }
    return hex;
};

/**
 * Convert string to byte array
 * 
 * @param str [STRING] string to be converted
 * @param bytesPerSymbol [NUMBER] ???
 * @return [ARRAY] converted string
 */
exports.str2bytes = function(str, bytesPerSymbol){
	var arr=[];
		
	for (var i=0;i<str.length;i++){			
		var temp = str.charCodeAt(i);
		for(var j=0; j<bytesPerSymbol;j++){			
				var oneByte = Math.floor(temp/Math.pow(255,bytesPerSymbol-j-1));
				arr.push(oneByte);
				temp -= oneByte * Math.pow(255, bytesPerSymbol - j - 1);
		} 
	}
	return arr;
};

/**
 * Convert byte array to string
 * 
 * @param arr [ARRAY] byte array to be converted
 * @param bytesPerSymbol [NUMBER] ???
 * @return [STRING] the string representing byte array 
 */
exports.bytes2str = function(arr, bytesPerSymbol){
	var str="";
	
	for (var i=0; i<arr.length; i+=bytesPerSymbol){
		var chCode=0;
		for (var j=0;j<bytesPerSymbol;j++){	
			chCode+=arr.slice(i,i+bytesPerSymbol)[j]*Math.pow(255,bytesPerSymbol-j-1);
		
		}
		str+=String.fromCharCode(chCode);
	}
	return str;
};

/* Hexadecimal conversion methods.
 * Copyright (c) 2006 by Ali Farhadi.
 * released under the terms of the Gnu Public License.
 *
 * Encodes data to Hex(base16) format
 * 
 * @see http://farhadi.ir/
 */
exports.hexEncode = function(data){
	var b16_digits = '0123456789ABCDEF';
	var b16_map = new Array();
	for (var i=0; i<256; i++) {
		b16_map[i] = b16_digits.charAt(i >> 4) + b16_digits.charAt(i & 15);
	}
	
	var result = new Array();
	for (var i=0; i<data.length; i++) {
		result[i] = b16_map[data.charCodeAt(i)];
	}
	
	return result.join('');
};

/**
 * Decodes Hex(base16) formated data
 */
exports.hexDecode = function(data){
	var b16_digits = '0123456789ABCDEF';
	var b16_map = new Array();
	for (var i=0; i<256; i++) {
		b16_map[b16_digits.charAt(i >> 4) + b16_digits.charAt(i & 15)] = String.fromCharCode(i);
	}
	if (!data.match(/^[a-f0-9]*$/i)) return null;// return false if input data is not a valid Hex string
	
	if (data.length % 2) data = '0'+data;
		
	var result = new Array();
	var j=0;
	for (var i=0; i<data.length; i+=2) {
		result[j++] = b16_map[data.substr(i,2)];
	}

	return result.join('');
};

/**
 * Return the type of o as a string
 * -If o is null, return "null", if o is NaN, return "nan".
 * -If typeof returns a value other than "object" return that value.
 *  (Note that some implementations identify regexps as functions.)
 * -If the class of o is anything other than "Object", return that.
 * -If o has a constructor and that constructor has a name, return it.
 * -Otherwise, just return "Object".
 */
exports.var_type = function(o) {
	var t, c, n; // type, class, name
	// Special case for the null value:
	if (o === null) return "null";
	// Another special case: NaN is the only value not equal to itself:
	if (o !== o) return "nan";
	// Use typeof for any value other than "object".
	// This identifies any primitive value and also functions.
	if ((t = typeof o) !== "object") return t;
	// Return the class of the object unless it is "Object".
	// This will identify most native objects.
	c = Object.prototype.toString.call(o).slice(8,-1);
	if (c !== "Object") return c;
	// Return the object's constructor name, if it has one
	if (o.constructor && typeof o.constructor === "function" &&
	(n = o.constructor.getName())) return n;

	// We can't determine a more specific type, so return "Object"
	return "Object";
};

/**
 * Return the name of a function (may be "") or null for nonfunctions
 */ 
Function.prototype.getName = function() {
	if ("name" in this) return this.name;
	return this.name = this.toString().match(/function\s*([^(]*)\(/)[1];
};
	

/**
sprintf() for JavaScript 0.7-beta1
http://www.diveintojavascript.com/projects/javascript-sprintf

sprintf() for JavaScript is a complete open source JavaScript sprintf implementation.

It's prototype is simple:

string sprintf(string format , [mixed arg1 [, mixed arg2 [ ,...]]]);
The placeholders in the format string are marked by "%" and are followed by one or more of these elements, in this order:

An optional "+" sign that forces to preceed the result with a plus or minus sign on numeric values. 
By default, only the "-" sign is used on negative numbers.

An optional padding specifier that says what character to use for padding (if specified). 
Possible values are 0 or any other character precedeed by a '. The default is to pad with spaces.

An optional "-" sign, that causes sprintf to left-align the result of this placeholder. 
The default is to right-align the result.

An optional number, that says how many characters the result should have. 
If the value to be returned is shorter than this number, the result will be padded.

An optional precision modifier, consisting of a "." (dot) followed by a number, 
that says how many digits should be displayed for floating point numbers. 
When used on a string, it causes the result to be truncated.

A type specifier that can be any of:
% - print a literal "%" character
b - print an integer as a binary number
c - print an integer as the character with that ASCII value
d - print an integer as a signed decimal number
e - print a float as scientific notation
u - print an integer as an unsigned decimal number
f - print a float as is
o - print an integer as an octal number
s - print a string as is
x - print an integer as a hexadecimal number (lower-case)
X - print an integer as a hexadecimal number (upper-case)
**/
var sprintf = (function() {
	function get_type(variable) {
		return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
	}
	function str_repeat(input, multiplier) {
		for (var output = []; multiplier > 0; output[--multiplier] = input) {/* do nothing */}
		return output.join('');
	}

	var str_format = function() {
		if (!str_format.cache.hasOwnProperty(arguments[0])) {
			str_format.cache[arguments[0]] = str_format.parse(arguments[0]);
		}
		return str_format.format.call(null, str_format.cache[arguments[0]], arguments);
	};

	str_format.format = function(parse_tree, argv) {
		var cursor = 1, tree_length = parse_tree.length, node_type = '', arg, output = [], i, k, match, pad, pad_character, pad_length;
		for (i = 0; i < tree_length; i++) {
			node_type = get_type(parse_tree[i]);
			if (node_type === 'string') {
				output.push(parse_tree[i]);
			}
			else if (node_type === 'array') {
				match = parse_tree[i]; // convenience purposes only
				if (match[2]) { // keyword argument
					arg = argv[cursor];
					for (k = 0; k < match[2].length; k++) {
						if (!arg.hasOwnProperty(match[2][k])) {
							throw(sprintf('[sprintf] property "%s" does not exist', match[2][k]));
						}
						arg = arg[match[2][k]];
					}
				}
				else if (match[1]) { // positional argument (explicit)
					arg = argv[match[1]];
				}
				else { // positional argument (implicit)
					arg = argv[cursor++];
				}

				if (/[^s]/.test(match[8]) && (get_type(arg) != 'number')) {
					throw(sprintf('[sprintf] expecting number but found %s', get_type(arg)));
				}
				switch (match[8]) {
					case 'b': arg = arg.toString(2); break;
					case 'c': arg = String.fromCharCode(arg); break;
					case 'd': arg = parseInt(arg, 10); break;
					case 'e': arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential(); break;
					case 'f': arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg); break;
					case 'o': arg = arg.toString(8); break;
					case 's': arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg); break;
					case 'u': arg = Math.abs(arg); break;
					case 'x': arg = arg.toString(16); break;
					case 'X': arg = arg.toString(16).toUpperCase(); break;
				}
				arg = (/[def]/.test(match[8]) && match[3] && arg >= 0 ? '+'+ arg : arg);
				pad_character = match[4] ? match[4] == '0' ? '0' : match[4].charAt(1) : ' ';
				pad_length = match[6] - String(arg).length;
				pad = match[6] ? str_repeat(pad_character, pad_length) : '';
				output.push(match[5] ? arg + pad : pad + arg);
			}
		}
		return output.join('');
	};

	str_format.cache = {};

	str_format.parse = function(fmt) {
		var _fmt = fmt, match = [], parse_tree = [], arg_names = 0;
		while (_fmt) {
			if ((match = /^[^\x25]+/.exec(_fmt)) !== null) {
				parse_tree.push(match[0]);
			}
			else if ((match = /^\x25{2}/.exec(_fmt)) !== null) {
				parse_tree.push('%');
			}
			else if ((match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(_fmt)) !== null) {
				if (match[2]) {
					arg_names |= 1;
					var field_list = [], replacement_field = match[2], field_match = [];
					if ((field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
						field_list.push(field_match[1]);
						while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
							if ((field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
								field_list.push(field_match[1]);
							}
							else if ((field_match = /^\[(\d+)\]/.exec(replacement_field)) !== null) {
								field_list.push(field_match[1]);
							}
							else {
								throw('[sprintf] huh?');
							}
						}
					}
					else {
						throw('[sprintf] huh?');
					}
					match[2] = field_list;
				}
				else {
					arg_names |= 2;
				}
				if (arg_names === 3) {
					throw('[sprintf] mixing positional and named placeholders is not (yet) supported');
				}
				parse_tree.push(match);
			}
			else {
				throw('[sprintf] huh?');
			}
			_fmt = _fmt.substring(match[0].length);
		}
		return parse_tree;
	};

	return str_format;
})();

/**
 * vsprintf() is the same as sprintf() except that it accepts an array of arguments, rather than a variable number of arguments:
 *
 *    vsprintf('The first 4 letters of the english alphabet are: %s, %s, %s and %s', ['a', 'b', 'c', 'd']);
 */
var vsprintf = function(fmt, argv) {
	argv.unshift(fmt);
	return sprintf.apply(null, argv);
};
exports.sprintf = sprintf;
exports.vsprintf = vsprintf;

/**
 * Format a timestamp into the form 'x-hh:mm:ss'
 * 
 * @param timestamp
 *            the timestamp in sec
 * @returns formatted string
 */
function formatTimestamp(timestamp){
	var time = timestamp;
	var sec = Math.floor(time%60);
	var min = Math.floor((time/60)%60);
	var hr = Math.floor((time/3600)%24);
	var da = Math.floor(time/86400);
	var str = sprintf("%02d.%'02d.%'02d", hr, min, sec);
	if (da > 0){
		str = da + "-" + str; 
	}
	return str;
}
exports.formatTimestamp = formatTimestamp;

/**
 * Encodes special symbols only
 */
function encodeURI_custom(string) {
//	return string.replace(/[+%]/g, 
	return string.replace(/[+]/g, 
		function(s) {
			var c = {
				'%' : '%25',
				'+' : '%2B',
				',' : '%2C',
				'/' : '%2F',
				'?' : '%3F',
				':' : '%3A',
				'@' : '%40',
				'&' : '%26',
				'=' : '%3D',
				'$' : '%24',
				'#' : '%23'
			};
			return c[s];
		});
}
exports.encodeURI_custom = encodeURI_custom;

/**
 * Encodes in additions some special characters
 * @param string
 * @return {*}
 */
function encodeURI_embedded(string) {
	return encodeURI_custom(encodeURI(string));
}
exports.encodeURI_embedded = encodeURI_embedded;

function HTMLescape(str) {
	if (str){
		return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}
};
exports.HTMLescape = HTMLescape;

function HTMLunescape(str) {
	if (str){
	    return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
	}
};
exports.HTMLunescape = HTMLunescape;

/**
 * Converts string ( prop:value, ...) into Object
 */
function toObject(str) {
	var obj = {};
	if (typeof (str) == 'string') {
		var properties = str.split(',');
		properties.forEach(function(property) {
			var tup = property.split(':');
			obj[tup[0]] = tup[1];
		});
	}
	return obj;
}
exports.toObject = toObject;

/**
 * Returns IP from HTTP request by using various methods
 */
//function getClientIp(req) {
//	  var ipAddress;
//	  // If there is a proxy we cannot have the client address - just the "localhost" address. 
//	  // Fortunately, almost any proxy puts into the request header the client IP-address with key 'x-forwarded-for'. 
//	  // So, we need check firstly the proxy forwarded address.
//	  // NOTE: Amazon EC2 / Heroku workaround to get real client IP
//	  //CloudFlare is a service that proxies site traffic in order to offer performance gains and filtering options.
//	  //Usually CloudFlare adds the 'CF-Connecting-IP' header that allow to retrieve the client IP address from.
//	  var ipStr = req.headers['x-forwarded-for'] || req.headers['cf-connecting-ip'];
//	  if (ipStr) {
//	    // 'x-forwarded-for' header may return multiple IP addresses in
//	    // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the the first one
//	    ipAddress = ipStr.split(',')[0];
//	  }
//	  if (!ipAddress && req.connection) {
//	    // Ensure getting client IP address still works in development environment
//	    ipAddress = req.connection.remoteAddress;
//	    if (!ipAddress && req.connection.socket){
//	    	ipAddress = req.connection.socket.remoteAddress;
//	    }
//	  }
//	  if (!ipAddress && req.socket) {
//		  ipAddress = req.socket.remoteAddress;
//	  }
//	  if (ipAddress && net.isIPv4(ipAddress) && ipAddress.indexOf(':') !== -1){
//		  ipAddress = ipAddress.split(':')[0];
//	  }	  
//	  return ipAddress;
//	};

//https://github.com/hellofloat/get-request-ip
function getClientIp( request) {
	// Header fields that can contains client IP
	var  headers = [
	        'x-client-ip',
	        'x-forwarded-for',
	        'cf-connecting-ip',
	        'x-real-ip',
	        'x-cluster-client-ip',
	        'x-forwarded',
	        'forwarded-for',
	        'fowarded'
	    ];
	
    var ip = null;

    headers.some(function( header ){
        ip = request.headers[ header ];
        return !!ip;
    } );

    if ( !ip ) {
        /* jshint -W126 */
        ip = ( request.connection && request.connection.remoteAddress ) ||
            ( request.socket && request.socket.remoteAddress ) ||
            ( request.connection && request.connection.socket && request.connection.socket.remoteAddress ) ||
            ( request.info && request.info.remoteAddress );
        /* jshint +W126 */
	  }

    if (ip){
	    // 'x-forwarded-for' header may return multiple IP addresses in
	    // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the the
		// first one
    	ip = ip.split(',')[0];
    	if (net.isIP(ip) == 4 /* && ip.indexOf(':') !== -1 */){
    		// port can be joined to so we have to take the first part of
			// splitting
    		ip = ip.split(':')[0];
	  }
	  }	  

    return ip;
	};
exports.getClientIp = getClientIp;

/**
 * Check matches for 'user email' and 'agent name'
 * @param filter Object {'agent': <regexp>, 'user': <regexp>}
 * @param email
 * @param aname
 * @return TRUE on matching or on non-specifying email and aname or empty filter.
 */
function filtreMatch(filter, email, aname){

	if (typeof(filter) == 'object' && (email || aname)) {
		var AGENT_FILTER = filter['agent'];
		var USER_FILTER = filter['user'];
		var ret = true;		
		if(typeof(AGENT_FILTER) == 'string' && AGENT_FILTER.length > 0 && aname){
			ret = ret && new RegExp(AGENT_FILTER,"i").test(aname);
		}
		if (ret && typeof(USER_FILTER) == 'string' && USER_FILTER.length > 0 && email){
			ret = ret && new RegExp(USER_FILTER,"i").test(email);
		}
		return ret;
	}
	return true;
}
exports.filtreMatch = filtreMatch;

/*
 * Natural comparison algorithm for JavaScript - V.0.7 - MIT license
 * Author: Jim Palmer (based on chunking idea from Dave Koelle)
 * @see https://github.com/overset/javascript-natural-sort for details
 * 
 * It can be used for natural sorting as well
 * Numerics: 		['10',9,2,'1','4'].sort(naturalComparison)) >>> 1,2,4,9,10
 * Floats: 			['10.0401',10.022,10.042,'10.021999'].sort(naturalComparison)) >>> 10.021999,10.022,10.0401,10.042
 * Float & decimal: ['10.04f','10.039F','10.038d','10.037D'].sort(naturalComparison)) >>> 10.037D,10.038d,10.039F,10.04f
 * IP addresses: 	['192.168.0.100','192.168.0.1','192.168.1.1'].sort(naturalComparison)) >>> 192.168.0.1,192.168.0.100,192.168.1.1
 * Filenames: 		['car.mov','01alpha.sgi','001alpha.sgi','my.string_41299.tif'].sort(naturalComparison)) >>> 001alpha.sgi,01alpha.sgi,car.mov,my.string_41299.tif
 * Dates: 			['10/12/2008','10/11/2008','10/11/2007','10/12/2007'].sort(naturalComparison)) >>> 10/11/2007,10/12/2007,10/11/2008,10/12/2008
 * Versions: 		['3.04a', '3.01', '4.01.22', '4.01a', '4.0'].sort(naturalComparison)) >>> 3.04a,3.01,4.0,4.01.22,4.01a
 * 
 * The default comparison is case-sensitive.
 * You can use naturalCoparison.insensitive = true to compare in insensitive way
 * @return -1 for a < b; 0 - for equal; 1 for a > b
*/
 function naturalComparison (a, b) {
    var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi,
        sre = /(^[ ]*|[ ]*$)/g,
        dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
        hre = /^0x[0-9a-f]+$/i,
        ore = /^0/,
        i = function(s) { return naturalComparison.insensitive && (''+s).toLowerCase() || ''+s; },
        // convert all to strings strip whitespace
        x = i(a).replace(sre, '') || '',
        y = i(b).replace(sre, '') || '',
        // chunk/tokenize
        xN = x.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
        yN = y.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
        // numeric, hex or date detection
        xD = parseInt(x.match(hre)) || (xN.length != 1 && x.match(dre) && Date.parse(x)),
        yD = parseInt(y.match(hre)) || xD && y.match(dre) && Date.parse(y) || null,
        oFxNcL, oFyNcL;
    // first try and sort Hex codes or Dates
    if (yD)
        if ( xD < yD ) return -1;
        else if ( xD > yD ) return 1;
    // natural sorting through split numeric strings and default strings
    for(var cLoc=0, numS=Math.max(xN.length, yN.length); cLoc < numS; cLoc++) {
        // find floats not starting with '0', string or 0 if not defined (Clint Priest)
        oFxNcL = !(xN[cLoc] || '').match(ore) && parseFloat(xN[cLoc]) || xN[cLoc] || 0;
        oFyNcL = !(yN[cLoc] || '').match(ore) && parseFloat(yN[cLoc]) || yN[cLoc] || 0;
        // handle numeric vs string comparison - number < string - (Kyle Adams)
        if (isNaN(oFxNcL) !== isNaN(oFyNcL)) { return (isNaN(oFxNcL)) ? 1 : -1; }
        // rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
        else if (typeof oFxNcL !== typeof oFyNcL) {
            oFxNcL += '';
            oFyNcL += '';
        }
        if (oFxNcL < oFyNcL) return -1;
        if (oFxNcL > oFyNcL) return 1;
    }
    return 0;
}
exports.naturalComparison = naturalComparison;

/**
 * Checks string for printability
 */
String.prototype.isPrintable = function() {
	var re = /[\0-\x1F\x7F-\x9F\xAD\u0378\u0379\u037F-\u0383\u038B\u038D\u03A2\u0528-\u0530\u0557\u0558\u0560\u0588\u058B-\u058E\u0590\u05C8-\u05CF\u05EB-\u05EF\u05F5-\u0605\u061C\u061D\u06DD\u070E\u070F\u074B\u074C\u07B2-\u07BF\u07FB-\u07FF\u082E\u082F\u083F\u085C\u085D\u085F-\u089F\u08A1\u08AD-\u08E3\u08FF\u0978\u0980\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09FC-\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A76-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF2-\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B55\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B78-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BFB-\u0C00\u0C04\u0C0D\u0C11\u0C29\u0C34\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5A-\u0C5F\u0C64\u0C65\u0C70-\u0C77\u0C80\u0C81\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0D01\u0D04\u0D0D\u0D11\u0D3B\u0D3C\u0D45\u0D49\u0D4F-\u0D56\u0D58-\u0D5F\u0D64\u0D65\u0D76-\u0D78\u0D80\u0D81\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DF1\u0DF5-\u0E00\u0E3B-\u0E3E\u0E5C-\u0E80\u0E83\u0E85\u0E86\u0E89\u0E8B\u0E8C\u0E8E-\u0E93\u0E98\u0EA0\u0EA4\u0EA6\u0EA8\u0EA9\u0EAC\u0EBA\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F48\u0F6D-\u0F70\u0F98\u0FBD\u0FCD\u0FDB-\u0FFF\u10C6\u10C8-\u10CC\u10CE\u10CF\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u137D-\u137F\u139A-\u139F\u13F5-\u13FF\u169D-\u169F\u16F1-\u16FF\u170D\u1715-\u171F\u1737-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17DE\u17DF\u17EA-\u17EF\u17FA-\u17FF\u180F\u181A-\u181F\u1878-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191D-\u191F\u192C-\u192F\u193C-\u193F\u1941-\u1943\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DB-\u19DD\u1A1C\u1A1D\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1A9F\u1AAE-\u1AFF\u1B4C-\u1B4F\u1B7D-\u1B7F\u1BF4-\u1BFB\u1C38-\u1C3A\u1C4A-\u1C4C\u1C80-\u1CBF\u1CC8-\u1CCF\u1CF7-\u1CFF\u1DE7-\u1DFB\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FC5\u1FD4\u1FD5\u1FDC\u1FF0\u1FF1\u1FF5\u1FFF\u200B-\u200F\u202A-\u202E\u2060-\u206F\u2072\u2073\u208F\u209D-\u209F\u20BB-\u20CF\u20F1-\u20FF\u218A-\u218F\u23F4-\u23FF\u2427-\u243F\u244B-\u245F\u2700\u2B4D-\u2B4F\u2B5A-\u2BFF\u2C2F\u2C5F\u2CF4-\u2CF8\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D71-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E3C-\u2E7F\u2E9A\u2EF4-\u2EFF\u2FD6-\u2FEF\u2FFC-\u2FFF\u3040\u3097\u3098\u3100-\u3104\u312E-\u3130\u318F\u31BB-\u31BF\u31E4-\u31EF\u321F\u32FF\u4DB6-\u4DBF\u9FCD-\u9FFF\uA48D-\uA48F\uA4C7-\uA4CF\uA62C-\uA63F\uA698-\uA69E\uA6F8-\uA6FF\uA78F\uA794-\uA79F\uA7AB-\uA7F7\uA82C-\uA82F\uA83A-\uA83F\uA878-\uA87F\uA8C5-\uA8CD\uA8DA-\uA8DF\uA8FC-\uA8FF\uA954-\uA95E\uA97D-\uA97F\uA9CE\uA9DA-\uA9DD\uA9E0-\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A\uAA5B\uAA7C-\uAA7F\uAAC3-\uAADA\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F-\uABBF\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBC2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFE\uFDFF\uFE1A-\uFE1F\uFE27-\uFE2F\uFE53\uFE67\uFE6C-\uFE6F\uFE75\uFEFD-\uFF00\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFDF\uFFE7\uFFEF-\uFFFB\uFFFE\uFFFF]/g;
	return (this.search(re)<0);
};

/**
 * Removes non printable symbols from string
 */
String.prototype.removeNonPrintable = function() {
	var re = /[\0-\x1F\x7F-\x9F\xAD\u0378\u0379\u037F-\u0383\u038B\u038D\u03A2\u0528-\u0530\u0557\u0558\u0560\u0588\u058B-\u058E\u0590\u05C8-\u05CF\u05EB-\u05EF\u05F5-\u0605\u061C\u061D\u06DD\u070E\u070F\u074B\u074C\u07B2-\u07BF\u07FB-\u07FF\u082E\u082F\u083F\u085C\u085D\u085F-\u089F\u08A1\u08AD-\u08E3\u08FF\u0978\u0980\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09FC-\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A76-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF2-\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B55\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B78-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BFB-\u0C00\u0C04\u0C0D\u0C11\u0C29\u0C34\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5A-\u0C5F\u0C64\u0C65\u0C70-\u0C77\u0C80\u0C81\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0D01\u0D04\u0D0D\u0D11\u0D3B\u0D3C\u0D45\u0D49\u0D4F-\u0D56\u0D58-\u0D5F\u0D64\u0D65\u0D76-\u0D78\u0D80\u0D81\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DF1\u0DF5-\u0E00\u0E3B-\u0E3E\u0E5C-\u0E80\u0E83\u0E85\u0E86\u0E89\u0E8B\u0E8C\u0E8E-\u0E93\u0E98\u0EA0\u0EA4\u0EA6\u0EA8\u0EA9\u0EAC\u0EBA\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F48\u0F6D-\u0F70\u0F98\u0FBD\u0FCD\u0FDB-\u0FFF\u10C6\u10C8-\u10CC\u10CE\u10CF\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u137D-\u137F\u139A-\u139F\u13F5-\u13FF\u169D-\u169F\u16F1-\u16FF\u170D\u1715-\u171F\u1737-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17DE\u17DF\u17EA-\u17EF\u17FA-\u17FF\u180F\u181A-\u181F\u1878-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191D-\u191F\u192C-\u192F\u193C-\u193F\u1941-\u1943\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DB-\u19DD\u1A1C\u1A1D\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1A9F\u1AAE-\u1AFF\u1B4C-\u1B4F\u1B7D-\u1B7F\u1BF4-\u1BFB\u1C38-\u1C3A\u1C4A-\u1C4C\u1C80-\u1CBF\u1CC8-\u1CCF\u1CF7-\u1CFF\u1DE7-\u1DFB\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FC5\u1FD4\u1FD5\u1FDC\u1FF0\u1FF1\u1FF5\u1FFF\u200B-\u200F\u202A-\u202E\u2060-\u206F\u2072\u2073\u208F\u209D-\u209F\u20BB-\u20CF\u20F1-\u20FF\u218A-\u218F\u23F4-\u23FF\u2427-\u243F\u244B-\u245F\u2700\u2B4D-\u2B4F\u2B5A-\u2BFF\u2C2F\u2C5F\u2CF4-\u2CF8\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D71-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E3C-\u2E7F\u2E9A\u2EF4-\u2EFF\u2FD6-\u2FEF\u2FFC-\u2FFF\u3040\u3097\u3098\u3100-\u3104\u312E-\u3130\u318F\u31BB-\u31BF\u31E4-\u31EF\u321F\u32FF\u4DB6-\u4DBF\u9FCD-\u9FFF\uA48D-\uA48F\uA4C7-\uA4CF\uA62C-\uA63F\uA698-\uA69E\uA6F8-\uA6FF\uA78F\uA794-\uA79F\uA7AB-\uA7F7\uA82C-\uA82F\uA83A-\uA83F\uA878-\uA87F\uA8C5-\uA8CD\uA8DA-\uA8DF\uA8FC-\uA8FF\uA954-\uA95E\uA97D-\uA97F\uA9CE\uA9DA-\uA9DD\uA9E0-\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A\uAA5B\uAA7C-\uAA7F\uAAC3-\uAADA\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F-\uABBF\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBC2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFE\uFDFF\uFE1A-\uFE1F\uFE27-\uFE2F\uFE53\uFE67\uFE6C-\uFE6F\uFE75\uFEFD-\uFF00\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFDF\uFFE7\uFFEF-\uFFFB\uFFFE\uFFFF]/g;
	return this.replace(re, '');
};

/**
 * Returns bytes array representing a string (unicode version)
 */
String.prototype.getBytes = function() {
	var bytes = [];
	for ( var i = 0; i < this.length; ++i) {
		bytes.push(this.charCodeAt(i));
	}
	return bytes;
};

/**
 * Validation of string for correct email form
 * 
 * @see http://fightingforalostcause.net/content/misc/2006/compare-email-regex.php
 */
String.prototype.isEmail = function() {
	var re = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|solutions|digital|marketing|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
	return (this.search(re)>=0);
};

/**
 * Returns the the differences between two similar objects
 * NOTE: don't shows the structural changes in the objects.
 * @param obj1 {Object} the current object
 * @param obj2 {Object} the changed object
 * @param d {Object} the optional returned object (if specified it must be {} while call)
 * @returns {Object} with differencies
 */
//function diffObjs(obj1, obj2, d){
//    if (!d){
//        d = new Object();
//    }
//    if (obj1 && obj2 && !Object.is(obj1, obj2)){
//        for (var a in obj1){
//            if (typeof(obj1[a]) != 'object'){
//                if (!Object.is(obj1[a], obj2[a])){
//                    d[a] = obj2[a];
//                }
//            } else {
//            	diffObjs(obj1[a], obj2[a], (Array.isArray(obj1[a])?d[a]= []:d[a]= {}));
//		        if (Object.keys(d[a]).length == 0){
//		        	delete d[a];
//		        }
//            }
//        }
//    }
//    return d;
//}
/**
 * Returns the the differences between two similar objects
 * NOTE: don't shows the structural changes in the objects.
 * @param obj1 {Object} the current object
 * @param obj2 {Object} the changed object
 * @returns {Object} that contains differences
 * @see http://blog.vjeux.com/2011/javascript/object-difference.html
 */
//function diffObjs(obj1, obj2) {
//    var ret = {};
//    for (var name in obj1) {
//        if (name in obj2) {
//            if (_.isObject(obj2[name]) && !_.isArray(obj2[name])) {
//                var diff = diffObjs(obj1[name], obj2[name]);
//                if (!_.isEmpty(diff)) {
//                    ret[name] = diff;
//                }
//            } else if (!_.isEqual(obj1[name], obj2[name])) {
//                ret[name] = obj2[name];
//            }
//        }
//    }
//    return ret;
//}
//exports.diffObjs = diffObjs;

/**
 * Returns object with merged properties
 */
function mergeObjs(def, obj) {
	if (typeof obj == 'undefined') {
		return def;
	} else if (typeof def == 'undefined') {
		return obj;
	}
	for ( var i in obj) {
		if (obj.hasOwnProperty(i)) {
			if (obj[i] !== null && obj[i].constructor == Object) {
				def[i] = mergeObjs(def[i] || {}, obj[i]);
			} else {
				def[i] = obj[i];
			}
		}
	}
	return def;
}
exports.mergeObjs = mergeObjs;

/**
 * Creates new cloned object
 */
function cloneObj(obj){
	return mergeObjs({}, obj);
}
exports.cloneObj = cloneObj;

/**
 * Clones any Object (even non-object)
 * 
 * @param obj
 *            the source object
 * @returns
 */
function clone(obj){
    if(obj === null || typeof(obj) != 'object')
        return obj;    
    var temp = new obj.constructor(); 
    for(var key in obj)
        temp[key] = clone(obj[key]);    
    return temp;
}
exports.clone = clone;

/**
 * Convert string value to number with converting to specified units
 * @param str source string (the last char can be 's', 'm', 'h', 'd')
 * @param defValue the default value
 * @param convertTo the string with the following value<br>
 * s - seconds<br>
 * m - minutes<br>
 * h - hours<br>
 * d - days
 * @returns {Number}
 */
function toInt(str, defValue, convertTo){
	var ret = (typeof(str) == 'number')?str:(defValue || 0);
	if (typeof(str) == 'string' && str.length > 0) {
		var d = parseInt(str.replace(/\D/g, ''));
		if (!isNaN(d)){
			ret = d;
		}
		if (convertTo){
			var k = 1;
			var from = str.slice(str.length - 1);
			switch (from){
			case 's':
				switch (convertTo){
				case 'ms': k = 1000;		break;
				case 'm': k = 1/60;			break;
				case 'h': k = 1/60/60;		break;
				case 'd': k = 1/60/60/24;	break;
				}
				break;
			case 'm':
				switch (convertTo){
				case 'ms': k = 60*1000;	break;
				case 's': k = 60;		break;
				case 'h': k = 1/60;		break;
				case 'd': k = 1/60/24;	break;
				}
				break;
			case 'h':
				switch (convertTo){
				case 'ms': k = 60*60*1000;	break;
				case 's': k = 60*60;		break;
				case 'm': k = 60;			break;
				case 'd': k = 1/24;			break;
				}
				break;
			case 'd':
				switch (convertTo){
				case 'ms': k = 24*60*60*1000;	break;
				case 's': k = 24*60*60;			break;
				case 'm': k = 24*60;			break;
				case 'h': k = 24;				break;
				}
				
			}
			ret *= k;
		}
	}
	return ret;
}
exports.toInt = toInt


