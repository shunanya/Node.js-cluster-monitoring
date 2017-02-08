#!/bin/bash

#usage: NodeServerDC.sh [command]
#allowed commands: start (default); stop; restart

# Function returns the full path to the current script.
currentscriptpath()
{
  local fullpath=`echo "$(readlink -f $0)"`
  local fullpath_length=`echo ${#fullpath}`
  local scriptname="$(basename $0)"
  local scriptname_length=`echo ${#scriptname}`
  local result_length="$(($fullpath_length - $scriptname_length - 1))"
  local result=`echo $fullpath | head -c $result_length`
  echo $result
}

PWD=` pwd `

tmp=`currentscriptpath`

cd $tmp/src/test
tmp=` pwd `

cmd=0		#start
param="$*" 	#input parameters

if [[ ($# -gt 0) ]] ; then
  stop_="stop"
  start_="start"
  restart_="restart"
  if [[ ($(expr "$param" : ".*$stop_") -gt 0) ]] ; then
      cmd=1	#stop
      echo "Command for stopping..."
  elif [[ ($(expr "$param" : ".*$restart_") -gt 0) ]] ; then
      cmd=2	#restart
      echo "Command for restarting"
  else
      echo "Command for starting"
  fi
fi

# starting Node.js cluster
pid=`ps -ef | grep -i "node.*cluster.js" | grep -v grep | awk '{print $2} ' `
if [[ "$pid" ]] ; then
	if [[ ($cmd -eq 0) ]] ; then #start server
	    echo "---node Cluster is already started  - couldn't start a new one!!!"
	    exit 1
	elif [[ ($cmd -ge 1) ]] ; then #stop server
	    echo "---node Cluster stopping... ($pid)"
	    while (test "$pid" ) ; do
		kill -SIGTERM $pid
		sleep 2
		pid=`ps -efw | grep -i "node.*cluster.js" | grep -v grep | awk '{print $2} ' `
	    done
	    if [[ ($cmd -le 1) ]] ; then
		    exit 0
	    else
		    sleep 5
	    fi
	fi
elif [[ ($cmd -eq 1) ]] ; then
	echo "node Cluster isn't running!!!"
	exit 0
fi

echo switching to $tmp and start - node cluster

opt="--nouse-idle-notification --max-old-space-size=4096"

#node $opt $tmp/cluster.js 1> /dev/null &
node $tmp/cluster.js 1> /dev/null &

echo "node Cluster ran with code $?" >&2

#sleep 2
#
#pid=`ps -ef | grep -i "node.*cluster.js" | grep -v grep | awk '{if ($3 == "1") print $2} ' `
#if test "$pid" ;  then
#    echo "$JS.cluster ran ($pid)" >&2
#else
#    echo "$JS cluster do not started" >&2
#fi

cd $PWD
