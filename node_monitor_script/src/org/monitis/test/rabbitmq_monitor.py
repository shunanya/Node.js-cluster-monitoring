#!/usr/bin/env python

import sys
import json
import httplib2

#import monitor_constants as constants

rmqUrl = 'http://127.0.0.1:15673/api/'
rmqName = 'guest'
rmqPswd = 'guest'
NORM_STATE="OK"
IDLE_STATE="IDLE"
FAIL_STATE="NOK"
UNAC_STATE="status:FAIL | details + Errors while measuring"


#Access to the RabbitMQ Management HTTP API, 
# execute command and keep the result in the "result" variable
#
#@param CMD {STRING} - command that should be executed
#@return error code
#
def access_rabbitmq(command):
    ret = None
    url=rmqUrl+command
    http = httplib2.Http()
    http.add_credentials(rmqName, rmqPswd)
    resp, content = http.request(url)
    if resp != None and resp.status == 200:
#         print(resp)
#         print(content)
        ret = content
    return ret
              
#  Format a timestamp into the form 'x day hh:mm:ss'
#  @param TIMESTAMP {NUMBER} the timestamp in sec
def formatTimestamp(time):
    sec=time%60
    mins=(time/60)%60
    hr=(time/3600)%24
    da=time/86400
    s="%02u.%02u.%02u" % (hr, mins, sec)
    if da > 0:
        s=str(da)+'-'+str(s) 
    return s
 
# 
# errors=0
# declare -a MSG
# # get nodes info
try:
    result = access_rabbitmq('nodes')
    if result != None:
        nodes = json.loads(result)
        run=nodes[0].running
        pid=nodes[0].os_pid
        up=nodes[0].uptime
        upt=formatTimestamp(up / 1000)
        ofd=nodes[0].fd_used
        lfd=nodes[0].fd_total
        ofdp='%.2f' % (100.0*ofd/lfd)
        osd=nodes[0].sockets_used
        lsd=nodes[0].sockets_total
        osdp='%.2f' % (100.0*osd/lsd)
        proc=nodes[0].proc_used
        lproc=nodes[0].proc_total
        procp='%.2f' % (100.0*proc/lproc)
        #mem=nodes[0].mem_used
        #mem_mb=$(echo "scale=1;($mem/1024/1024)" | bc )
        #lmem=nodes[0].mem_limit
        #lmem_mb=$(echo "scale=1;($lmem/1024/1024)" | bc )
        #memp=$(echo "scale=1;(100.0*$mem/$lmem)" | bc )
        #dfree=nodes[0].disk_free
        #dfree_mb=$(echo "scale=1;($dfree/1024/1024)" | bc )
        #ldfree=nodes[0].disk_free_limit
        #ldfree_mb=$(echo "scale=1;($ldfree/1024/1024)" | bc )
        #dfreep=$(echo "scale=1;(100.0*$ldfree/$dfree)" | bc )
         
#         cm=( $( ps -p$pid -o %cpu,%mem | grep -v % ) )
#         cpu_pr=cm[0]
#         mem_pr=cm[1]
#              
#         if [[ (( (${ofdp/\.*} > 90) || (${osdp/\.*} > 90) )) ]] ; then
#             MSG[$errors]="WARN - Too many open files descriptors"
#             errors=$(($errors+1))        
#         fi
#          
#         if [[ (${procp/\.*} -gt 90) ]] ; then
#             MSG[$errors]="WARN - Too many Erlang processes used ($proc / $lproc)"
#             errors=$(($errors+1))        
#         fi
#          
#         if [[ (${mem_pr/\.*} -gt 95) ]] ; then
#             MSG[$errors]="WARN - Memory usage is critically big"
#             errors=$(($errors+1))        
#         fi
#          
#         if [[ (${cpu_pr/\.*} -gt 95) ]] ; then
#             MSG[$errors]="WARN - CPU usage is critically big"
#             errors=$(($errors+1))        
#         fi
         
except Exception as e:
    print(UNAC_STATE+' - '+str(e))
    sys.exit(1)
# res="{\"nodes\" : "${result}" }"
# #echo "$res"
# 
# tickParse "$res"
# 
# nodes_count=1
# 
# # get overview info    
# access_rabbitmq "overview"
# ret="$?"
# if [[ ($ret -ne 0) ]] ; then
#     return_value="$UNAC_STATE" - "$ret_msg"
#     echo "$return_value"
#     exit 0
# fi
# 
# #echo "$result"
# 
# tickParse "$result"
# 
# v=message_stats.publish_details.rate ; v=${v:-0}
# pub_rate=$(echo "scale=1; ($v /1)" | bc)
# v=message_stats.deliver_details.rate ; v=${v:-0}
# delivery_rate=$(echo "scale=1; ($v /1)" | bc)
# v=message_stats.ack_details.rate ; v=${v:-0}
# ack_rate=$(echo "scale=1; ($v /1)" | bc)
# v=message_stats.deliver_no_ack_details.rate ; v=${v:-0}
# deliver_no_ack_rate=$(echo "scale=1; ($v /1)" | bc)
# v=message_stats.deliver_get_details.rate ; v=${v:-0}
# deliver_get_rate=$(echo "scale=1; ($v /1)" | bc)
# 
# msg=$((queue_total.messages))
# msg_ready=$((queue_total.messages_ready))
# msg_unack=$((queue_total.messages_unacknowledged))
# msg_in_queue=$(($msg + $msg_ready + $msg_unack))
# 
# if [[ ($msg_in_queue -gt 0) ]] ; then
#     MSG[$errors]="WARN - some numbers of messages are left in queue"
#     errors=$(($errors+1))        
# fi
# 
# # get connections info
# access_rabbitmq "connections"
# ret="$?"
# if [[ ($ret -ne 0) ]] ; then
#     return_value="$UNAC_STATE" - "$ret_msg"
#     echo "$return_value"
#     exit 0
# fi
# 
# result=${result//"basic.nack"/"basic_nack"}
# 
# res="{\"connections\" : "${result}" }"
# #echo "$res"
# 
# tickParse "$res"
# 
# conn=0
# r_rate=0
# w_rate=0
# timeout=0
# l=1
# while [  $l -gt 0 ] ; do
#     case $conn in
#         0)     l=connections[0].length()
#             if [[ ($l -gt 0) ]] ; then 
#                 conn=$((conn+1))
#                 r_rate=$(echo "scale=1; connections[0].recv_oct_details.rate + $r_rate" | bc)
#                 w_rate=$(echo "scale=1; connections[0].send_oct_details.rate + $w_rate" | bc)
#                 timeout=$(echo "scale=1; connections[0].timeout + $timeout" | bc) 
#                 client="connections[0].client_properties.product"_"connections[0].client_properties.version (connections[0].client_properties.platform)"
#             fi ;;
#         1)     l=connections[1].length()
#             if [[ ($l -gt 0) ]] ; then 
#                 conn=$((conn+1))
#                 r_rate=$(echo "scale=1; connections[1].recv_oct_details.rate + $r_rate" | bc)
#                 w_rate=$(echo "scale=1; connections[1].send_oct_details.rate + $w_rate" | bc)
#                 timeout=$(echo "scale=1; connections[1].timeout + $timeout" | bc)
#                 client_="connections[1].client_properties.product"_"connections[1].client_properties.version (connections[1].client_properties.platform)"
#                 if [[ ($(expr "$client" : ".*$client_") -eq 0) ]] ; then
#                     client="$client $client_"
#                 fi
#             fi ;;
#         2)     l=connections[2].length()
#             if [[ ($l -gt 0) ]] ; then 
#                 conn=$((conn+1))
#                 r_rate=$(echo "scale=1; connections[2].recv_oct_details.rate + $r_rate" | bc)
#                 w_rate=$(echo "scale=1; connections[2].send_oct_details.rate + $w_rate" | bc)
#                 timeout=$(echo "scale=1; connections[2].timeout + $timeout" | bc)
#                 client_="connections[2].client_properties.product"_"connections[2].client_properties.version (connections[2].client_properties.platform)"
#                 if [[ ($(expr "$client" : ".*$client_") -eq 0) ]] ; then
#                     client="$client $client_"
#                 fi
#             fi ;;
#         3)     l=connections[3].length()
#             if [[ ($l -gt 0) ]] ; then
#                 conn=$((conn+1))
#                 r_rate=$(echo "scale=1; connections[3].recv_oct_details.rate + $r_rate" | bc)
#                 w_rate=$(echo "scale=1; connections[3].send_oct_details.rate + $w_rate" | bc)
#                 timeout=$(echo "scale=1; connections[3].timeout + $timeout" | bc)
#                 client_="connections[3].client_properties.product"_"connections[3].client_properties.version (connections[3].client_properties.platform)"
#                 if [[ ($(expr "$client" : ".*$client_") -eq 0) ]] ; then
#                     client="$client $client_"
#                 fi
#             fi ;;
#         4)     l=connections[4].length()
#             if [[ ($l -gt 0) ]] ; then
#                 conn=$((conn+1))
#                 r_rate=$(echo "scale=1; connections[4].recv_oct_details.rate + $r_rate" | bc)
#                 w_rate=$(echo "scale=1; connections[4].send_oct_details.rate + $w_rate" | bc)
#                 timeout=$(echo "scale=1; connections[4].timeout + $timeout" | bc)
#                 client_="connections[4].client_properties.product"_"connections[4].client_properties.version (connections[4].client_properties.platform)"
#                 if [[ ($(expr "$client" : ".*$client_") -eq 0) ]] ; then
#                     client="$client $client_"
#                 fi
#             fi ;;
#         5)     l=connections[4].length()
#             if [[ ($l -gt 0) ]] ; then
#                 conn=$((conn+1))
#                 r_rate=$(echo "scale=1; connections[5].recv_oct_details.rate + $r_rate" | bc)
#                 w_rate=$(echo "scale=1; connections[5].send_oct_details.rate + $w_rate" | bc)
#                 timeout=$(echo "scale=1; connections[5].timeout + $timeout" | bc)
#                 client_="connections[5].client_properties.product"_"connections[5].client_properties.version (connections[5].client_properties.platform)"
#                 if [[ ($(expr "$client" : ".*$client_") -eq 0) ]] ; then
#                     client="$client $client_"
#                 fi
#             fi ;;
#         *)  l=0 ; break ;;
#     esac
# done        
# 
# if [[ ($conn -eq 0) ]] ; then        
#     client="No any client establish connections yet"
#     #MSG[$errors]="WARN - No any client establish connections yet"
#     #errors=$(($errors+1))        
# fi
# 
# recv_rate=$(echo "scale=1;($r_rate/1024)" | bc )
# sent_rate=$(echo "scale=1;($w_rate/1024)" | bc )
# 
# # get queue info
# access_rabbitmq "queues"
# ret="$?"
# if [[ ($ret -ne 0) ]] ; then
#     return_value="$UNAC_STATE" - "$ret_msg"
#     echo "$return_value"
#     exit 0
# fi
# 
# res="{\"queues\" : "${result}" }"
# #echo "$res"
# 
# tickParse "$res"
# 
# queue_count=0
# l=1
# while [  $l -gt 0 ] ; do
#     case $queue_count in
#         0)     l=queues[0].length()
#             if [[ ($l -gt 0) ]] ; then 
#                 queue_count=$((queue_count+1))
#                 if [[ (queues[0].message_stats.length() -gt 0) ]] ; then
#                     r_rate=$(echo "scale=1; (queues[0].message_stats.publish_details.rate / 1)" | bc)
#                     w_rate=$(echo "scale=1; (queues[0].message_stats.deliver_get_details.rate / 1)" | bc)
#                 else
#                     r_rate=0 ; w_rate=0
#                 fi
#                 queue="'queues[0].name' (queues[0].consumers) pub: $r_rate msg/s; get: $w_rate msg/s"
#             fi ;;
#         1)     l=queues[1].length()
#             if [[ ($l -gt 0) ]] ; then 
#                 queue_count=$((queue_count+1))
#                 if [[ (queues[1].message_stats.length() -gt 0) ]] ; then
#                     r_rate=$(echo "scale=1; (queues[1].message_stats.publish_details.rate / 1)" | bc)
#                     w_rate=$(echo "scale=1; (queues[1].message_stats.deliver_get_details.rate / 1)" | bc)
#                 else
#                     r_rate=0 ; w_rate=0
#                 fi
#                 queue_="\'queues[1].name\' (queues[1].consumers) pub: $r_rate msg/s; get: $w_rate msg/s"
#                 if [[ ($(expr "$queue" : ".*$queue_") -eq 0) ]] ; then
#                     queue="$queue   $queue_"
#                 fi
#             fi ;;
#         2)     l=queues[2].length()
#             if [[ ($l -gt 0) ]] ; then 
#                 queue_count=$((queue_count+1))
#                 if [[ (queues[2].message_stats.length() -gt 0) ]] ; then
#                     r_rate=$(echo "scale=1; (queues[2].message_stats.publish_details.rate / 1)" | bc)
#                     w_rate=$(echo "scale=1; (queues[2].message_stats.deliver_get_details.rate / 1)" | bc)
#                 else
#                     r_rate=0 ; w_rate=0
#                 fi
#                 queue_="\'queues[2].name\' (queues[2].consumers) pub: $r_rate msg/s; get: $w_rate msg/s"
#                 if [[ ($(expr "$queue" : ".*$queue_") -eq 0) ]] ; then
#                     queue="$queue   $queue_"
#                 fi
#             fi ;;
#         3)     l=queues[3].length()
#             if [[ ($l -gt 0) ]] ; then 
#                 queue_count=$((queue_count+1))
#                 if [[ (queues[3].message_stats.length() -gt 0) ]] ; then
#                     r_rate=$(echo "scale=1; (queues[3].message_stats.publish_details.rate / 1)" | bc)
#                     w_rate=$(echo "scale=1; (queues[3].message_stats.deliver_get_details.rate / 1)" | bc)
#                 else
#                     r_rate=0 ; w_rate=0
#                 fi
#                 queue_="\'queues[3].name\' (queues[3].consumers) pub: $r_rate msg/s; get: $w_rate msg/s"
#                 if [[ ($(expr "$queue" : ".*$queue_") -eq 0) ]] ; then
#                     queue="$queue   $queue_"
#                 fi
#             fi ;;
#         *)  l=0 ; break ;;
#     esac
# done        
# 
# if [[ ($queue_count -eq 0) ]] ; then        
#     queue="No any queues are created yet"
# fi
# 
# 
# details="details"
# if [[ ($errors -gt 0) ]]
# then
#     problem="Problems in rabbitmq ($pid)"
#     CNT=0
#     while [ "$CNT" != "$errors" ]
#     do
#         problem="$problem + ${MSG[$CNT]}"
#         CNT=$(($CNT+1))
#     done
#     details="$details+${problem}"
#     status="$FAIL_STATE"
# elif  [[ (( ($conn -eq 0) || ($queue_count -eq 0) )) ]] ; then
#     details="$details + RabbitMQ ($pid) $IDLE_STATE"
#     status="$IDLE_STATE"
# else
#     details="$details + RabbitMQ ($pid) $NORM_STATE"
#     details="$details + $conn connections are established"
#     status="$NORM_STATE"
# fi
# details="$details + clients: $client"
# details="$details + queues: $queue"
# 
# param="status:$status;osd:$osdp;ofd:$ofdp;cpu_usage:$cpu_pr;mem_usage:$mem_pr;recv_mps:$deliver_get_rate;sent_mps:$pub_rate;msg_queue:$msg_in_queue;timeout:$timeout;recv_kbps:$recv_rate;sent_kbps:$sent_rate;uptime:$upt"
# return_value="$param | $details"
# echo "$return_value"
# exit 0

