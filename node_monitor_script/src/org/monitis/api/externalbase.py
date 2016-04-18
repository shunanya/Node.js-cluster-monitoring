import monitorbase
import config

class ExternalBase(monitorbase.MonitorBase):
    _aMonitors = None
    _aMonitorInfo = None
    _aMonitorResults = None
    _pMonitorId = None
    # Request monitors
    # @return list
    def requestMonitors(self):
        return self.doGet({
            config.P_ACTION: self._aMonitors
        })
    # Request monitor info
    # @param monitorId
    # @param timezone
    # @return list
    def requestMonitorInfo(self, monitorId, timezone = None):
        data = {
            config.P_ACTION: self._aMonitorInfo,
            self._pMonitorId: monitorId
        }
        if(not timezone is None):
            data[config.P_TIMEZONE] = timezone
        return self.doGet(data)
    # Request monitors list
    # @param monitorId
    # @param year
    # @param month
    # @param day
    # @param timezone
    # @return list
    # @example (123, 2014, 2, 23)
    def requestMonitorResults(self, monitorId, year, month, day, timezone = None):
        data = {
            config.P_ACTION: self._aMonitorResults,
            self._pMonitorId: monitorId,
            config.P_DAY: day,
            config.P_MONTH: month,
            config.P_YEAR: year
        }
        if(not timezone is None):
            data[config.P_TIMEZONE] = timezone
        return self.doGet(data)