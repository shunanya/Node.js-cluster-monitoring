# Declaration of monitor constants

HOST_IP='127.0.0.1'
APIKEY="2K3GFQ1SU0JO8UD9OIKAVG9SE8"
SECRETKEY="LLTSDOJ6244CDA899R4H949TE"
#APIKEY="T5BAQQ46JPTGR6EBLFE28OSSQ"
#SECRETKEY="248VUB2FA3DST8J31A9U6D9OHT"

NAME="Node.Cluster"
MONITOR_NAME=NAME+"_"+HOST_IP            # name of custom monitor
MONITOR_TAG="node"                # tag for custom monitor
MONITOR_TYPE="Python"                # type for custom monitor
MULTIVALUE='true'

MONITOR_ID = 0

# monitor commands
MON_PATHNAME="./log/monitor_result"
MON_ACTION="action"
MON_GET_DATA="getData"
MON_GET_ADATA="getAData"

# format of result params - name1:displayName1:uom1:Integer
# name, displayName, uom and value should be URL encoded.
#UOM is unit of measure(user defined string parameter, e.g. ms, s, kB, MB, GB, GHz, kbit/s, ... ).
#
#dataType:   1 for boolean    2 for integer    3 for string    4 for float
#

# P1="worker:worker::3:true;status:status::3;uptime:uptime::3"
# P2="osd:osd_pr::4;ofd:ofd_pr::4;cpu_usage:cpu_usage::4;mem_usage:mem_usage::4;msg_queue:msg_in_queue::2;consumers:consumers::2"
# P3="sent_mps:pub_rate:mps:4;recv_kbps:from_client_rate:kbps:4;sent_kbps:to_client_rate:kbps:4;recv_mps:get_rate:mps:4"
# RESULT_PARAMS=P1+';'+P2+';'+P3

P0="worker:worker::3:true;status:status::3;uptime:uptime::3"
P1="avr_resp:avr_resp:s:4;max_resp:max_resp:s:4"
P11="avr_net:avr_net:s:4;max_net:max_net:s:4"
P12="avr_total:avr_total:s:4;max_total:max_total:s:4"
P2="in_rate:in_rate:kbps:4;out_rate:out_rate:kbps:4"
P3="active:active:percent:4;load:load:reqps:4"
RESULT_PARAMS=P0+';'+P1+';'+P11+';'+P12+';'+P2+';'+P3

OK_STATE='OK'
NOK_STATE='NOK'

# format of additional params - name:displayName:uom:String
ADDITIONAL_PARAMS='details:Details::3'
ARESP_DOWN='[{details:DOWN}]'

DURATION=5                         # information sending duration [min] (REPLACE by any desired value)
