import socket
import thread

import monitor_constants as constants
from monitor import *

prepare()
thread.start_new_thread(send, (constants.DURATION,))
if 'UDP' == constants.SCHEME_MONITOR :
    # Set up a UDP server
    s = socket.socket(socket.AF_INET,socket.SOCK_DGRAM)
    
    # Listen on port 10010 (to all IP addresses on this system)
    listen_addr = (constants.HOST_MONITOR, constants.PORT_MONITOR)
    s.bind(listen_addr)
    
    # Report on all data packets received and
    # where they came from in each case (as this is
    # UDP, each may be from a different source and it's
    # up to the server to sort this out!)
    print('Waiting for data on port '+ json.dumps(constants.PORT_MONITOR))
    while True:
            data,addr = s.recvfrom(1024)
            print data.strip(),addr
            thread.start_new_thread(store, (data,))
