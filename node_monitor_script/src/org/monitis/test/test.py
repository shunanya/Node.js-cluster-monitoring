#!/usr/bin/env python

import sys
import os.path as path
from org.monitis import monitor_constants as constants

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

f = './log/' 
filename = getFileName(f, '/home/vesta/log/monitor_result')
    
print(filename)
