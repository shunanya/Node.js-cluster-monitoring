import socket
import time

numerofpackets = 10
connectiontype = 'UDP'
hostname = 'localhost'
port = 50000
i = 0

if connectiontype != "TCP" and connectiontype != "UDP":
    print "Input not valid. Either type TCP or UDP"
else:
    if connectiontype == "TCP":
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM) 
        s.connect((hostname, port))

        while i < numerofpackets:
            s.send('tcp') 
            response = s.recv(1024)
            print response
            i = i + 1

        s.close()
    elif connectiontype == "UDP":
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

        while i < numerofpackets:
            print time.strftime('%d %b %Y %H:%M:%S'),'Send Packet ',i
            s.sendto('UDP'+`i`, (hostname, port)) 
#             response, serverAddress = s.recvfrom(1024)
#             print response
            time.sleep(5)
            i += 1

    s.close()
    