#!/usr/bin/env python

import os, time, sys
from org.monitis.test.test import processing
#watching a file for changing

def callback(path, event) :
    print "file: %s, %s" % (path, event)
    if event != 'removed' :
        time.sleep(10)
        new_path = path+"_"
        print 'Move to '+new_path
        os.rename(path, new_path)
        #processing
        processing.processing(new_path)
        
if len(sys.argv) > 1 :
    filename = sys.argv[1]
else :
    filename = '/home/vesta/log/monitor_result'
   
print "Watching ", filename

try :
    tm = os.path.getmtime(filename)
except os.error :
    tm = -1
    
while True :
    try :
        ntm = os.path.getmtime(filename)
    except os.error :
        ntm = -1
        
    if ntm != tm :
        if tm >= 0 and ntm < 0 :
            action = 'removed'
        elif tm < 0 and ntm >= 0 :
            print('new tm = '+str(ntm))
            action = 'created'
        else :
            print('new tm = '+str(ntm))
            action = 'updated'
        tm = ntm
        callback(filename, action)
    time.sleep(1)
