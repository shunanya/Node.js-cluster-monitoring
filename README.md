Node.js-cluster-monitoring
==========================

  The current project is representing the implementation of Monitis custom monitor approach that evaluates the health state of Node.js cluster. 
It is composed of two part - JavaScript plugin for Node.js server and python script that watching the file named 'monitor_result' provided by Monitor plugin. 
The python script processes and sends the evaluation of cluster health status into Monitis via the Monitis open API. 
Since Node.js itself doesn't exist the embeded stats module we had to create the plugin part that accumulates some pure statistics and put it in file. 
In contrast to [single Node.js monitor](https://github.com/shunanya/Node.js-monitoring) the file is used to excahnge the monitoring data between Node.js monitor plugin and script parts.
The Python script part provides the packing and sending information to the Monitis main server. 
Because the plugin is implemented by using events-driven technology and only just collects information, it adds in fact very insignificant additional load 
to the existing server and practically don't affect on server performance  - the main processing is done in remote script part.
The main purpose of current project is to show the possible way of using Monitis Open API for monitoring Node.js cluster. 
Naturally, a different variations of the presented code can be made in accordance user needs. 
The current project presents only one of many possible solutions.

Generally, this monitor architecture can be depicted as the following 

<a href="http://imgur.com/dTsBi"><img src="http://i.imgur.com/dTsBi.png" title="Node server monitoring" /></a>

#### The momitor plug-in collects the following parameters

Whole set of measured parameters divided on two parts  

- fixed that can be defined beforehand  

    + Uptime - measure of time from a last server restarting without any downtime.  
    + The monitoring time (mon_time) - the time between points of sending accumulated data.  
    + The listen ports of servers (list) - the ports on Node server that are under monitoring.  
    + The Requests count (reqs) - the quantity of request which are receiving server during monitoring time.  
    + The count of POST requests (post) - the percentage of POST request quantity with respect to the total number of requests during monitoring time.  
    + The responce time of server for requests during monitoring time
          - the average response time 
          - the maximum response time
    + The throughput of server (kbps) during monitoring time
          - the input throughput (in_kbps)
          - the output throughput (out_kbps)
    + The count of successfully processed requests (2xx) - the percentage of request quantity responded by 2xx status code with respect to the total number of requests during monitoring time.
    + The server processing time (active) - the percentage of busy time of server (real processing time) during monitoring time
    + The server load (load) - the evaluation of number of requests per second during monitoring time.  
  

- flexible that mostly isn't fixed and can be changing time by time  

    + The status codes (codes) - the collecting status codes shown in form {1xx: value, 2xx: value, 3xx: value, 4xx: value, 5xx: value}  
    + The application specific parameters (e.g. client platform, client application version and so on).  
    + In addition the top requests lists sorted by max response time, count of requests  or other  can be added.  
	+ The count of GET requests (get) - the percentage of GET request quantity with respect to the total number of requests during monitoring time.
	+ The count of HEAD requests (head) - the percentage of HEAD request quantity with respect to the total number of requests during monitoring time.  
	+ The count of PUT requests (put) - the percentage of PUT request quantity with respect to the total number of requests during monitoring time.  
	+ The count of DELETE requests (delete) - the percentage of DELETE request quantity with respect to the total number of requests during monitoring time.  
	+ The count of OPTIONS requests (options) - the percentage of OPTIONS request quantity with respect to the total number of requests during monitoring time.  
	+ The count of TRACE requests (trace) - the percentage of TRACE request quantity with respect to the total number of requests during monitoring time.

#### Getting the monitor module
You can get the monitor as NPM module by using the following command  
(make sure beforehand, that you are in the root folder of your server project)  

        npm install node-cluster-monitor

and next use it as an embedded Node.js module (see below).  
Please note that you should create the __log__ folder somewhere in or above your project. This will be used to logging monitor records.

#### Customizing and Usage
##### The activation of monitor pluging can be done very easily 

You need to add the following two lines in your workers code  

        var monitor = require('node-cluster-monitor');// insert monitor module-plugin
        ....
        monitor.Monitor(server, options);//add server to monitor

   where  

        server {Object} representing the server to be monitored
        options {Object} the options for given server monitor 
                {worker:<worker name>, port:<listen port>, host:<server host>,'collect_all': ('yes' | 'no'), 'top':{'view':<value>, 'limit':<value>, 'timelimit':<value>, 'sortby':<value>}} 
                worker - cluster worker name (mandatory value)
                port - Node.js server listen port (mandatory value)
                host - host IP/Name where server is located (optional, default value - localhost)
                top.view - the number of viewable part of collected requests (optional, default value - 3)
                top.limit - the maximum number of collected requests that spent most time for execution (optional, default value - 100)
                top.timelimit - the monitor have to collect info when exceeding the number of specified seconds only (optional, default value - 1)
                top.sortby - sorting by {max_time | rate | count | load} (optional, default value - max_time)
 
As soon you register the monitor for your cluster by calling Monitor method, the monitor will be collecting the measuring data  
and put them periodically into file 'monitor_result'.  

##### You should start monitor Python shell script firstly
The shell scrip will watching 'monitor_result' file for new measured data.  
If Node cluster doesn't start yet or down, the script will send corresponding information to the monitis (Server DOWN).  
As Node cluster will be available, the measurements will be grabbing and sending to the monitis.  
 
To use existing Python scripts you will need to do some changes that will correspond your account and data

        in monitis_constant.sh 
        - replace ApiKey and SecretKey by your keys values (can be obtained from your Monitis account)
         
        in monitor_constants.py 
        - you may replace MONITOR_NAME, MONITOR_TAG and MONITOR_TYPE by your desired names
        - you may replace RESULT_PARAMS and ADDITIONAL_PARAMS strings by data formats definition of your monitor (strongly not recommended)
        - you can replace MON_SERVER string by your server IP address (it is necessary for title only)
        - you can do also definition of DURATION between sending results (currently it is declared as 5 min)
        
That's all. Now you can controlling the script by the following command  

        ./NodeMonitor.sh {start|stop|restart}

and monitoring process will be started, stopped or restarted.  
Please note also that the script run as a daemon process so it will works even when your session will be closed.

#### Dependencies
There are some dependencies for monitor plugin  

   - __log4js__ that is used for write information about  every request into log file  

#### Testing 
To check the correctness of monitor workability, some simple Node test cluster is included in the package.  
So, you can start Node cluster by command  

        ./NodeCluster.sh (start|stop|restart)

The cluster will listen on HTTP port (8080) which will be monitored.  
  
<a href="http://imgur.com/k6qaP"><img src="http://i.imgur.com/IoJfNQR.png" title="Node cluster monitoring test" /></a>

Double-clicking on any line can be switching fixed (tabular view) to the flexible one.  

<a href="http://imgur.com/JiRBX"><img src="http://i.imgur.com/Me5czze.png" title="Node cluster monitoring test" /></a>

You can also see the grafical view for any numerical values.  

<a href="http://imgur.com/YIZIc"><img src="http://i.imgur.com/jWfuzzs.png" title="Node cluster monitoring test" /></a>

It can be noticed that the testing Node server is alive and have quite good state.  



