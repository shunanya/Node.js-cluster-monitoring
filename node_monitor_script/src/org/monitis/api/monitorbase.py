import api
import config

class MonitorBase(api.Api):
    def requestMonitors(self):
        return
    def requestMonitorInfo(self, monitorId, timezone = None):
        return
    def requestMonitorResults(self, monitorId, year, month, day, timezone = None):
        return