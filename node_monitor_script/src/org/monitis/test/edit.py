#!/usr/bin/env python

from api import custom
import monitor_constants as constants

monitorId = constants.MONITOR_ID
print constants.MONITOR_ID

api = custom.Custom(constants.APIKEY, constants.SECRETKEY)
info = api.requestMonitorInfo(monitorId)
print( info)
res = api.editMonitor(monitorId, resultParams = constants.RESULT_PARAMS)
print(res)




