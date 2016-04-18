#!/usr/bin/env python

import os, sys, time, getopt
import os.path as path

from common import logger
import monitor_constants as constants
from monitor import *

optlist, args = getopt.gnu_getopt(sys.argv[1:], 'd:', ['duration='])
for opt, value in optlist:
    if opt == "-d" or opt == "--duration":
        constants.DURATION = int(value)
        logger.info("Duration was redefined: "+str(constants.DURATION)+" min")

custom = Monitor(0)
if not custom.prepareMonitor():
    logger.critical("Cannot obtain/create monitor:(")
    sys.exit(1)

logger.info("Start watching loop...")

def getFileName(relPathToFile, defPath):
    if relPathToFile[len(relPathToFile)-1] == '/' : # path to directory
        folder = relPathToFile
        basename = None
    else : # path to file
        folder = path.dirname(relPathToFile)
        basename = path.basename(relPathToFile)
    filename = None
    cur = path.abspath('.')
    while cur != '/' : # 
        tmp = path.normpath(path.join(cur, folder))
        if path.exists(tmp) and path.isdir(tmp) :
            if basename :
                filename = path.normpath(path.join(tmp, basename))
            else :
                filename = tmp +'/'
            break
        cur = path.dirname(cur)        
    return filename or defPath

    
filename = getFileName(constants.MON_PATHNAME, '/home/vesta/log/monitor_result')
if not filename :
    logger.critical('Cannot find monitoring file')
    sys.exit
    
logger.info('monitoring file: '+filename)

tm = -1
while True : # watching for changes in monitoring file
    try :
        ntm = path.getmtime(filename)
    except os.error :
        ntm = -1
        
    if ntm != tm :
        if tm >= 0 and ntm < 0 :
            action = 'removed'
#         elif tm < 0 and ntm >= 0 :
#             logger.info('new tm = '+str(ntm))
#             action = 'created'
        else :
            action = 'updated' #or created
            data = custom.preprocessing(filename, action)
            if data and len(data) > 0 :
                custom.send(data)
            else :
                logger.warn('No data to send.')   
        tm = ntm      
              
    time.sleep(1) # watching every second

logger.info('FINISHED')