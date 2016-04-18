import externalbase
import config

class External(externalbase.ExternalBase):
    _aMonitors = config.A_EXTERNAL_MONITORS
    _aMonitorInfo = config.A_EXTERNAL_MONITOR_INFO
    _aMonitorResults =config.A_EXTERNAL_MONITOR_RESULTS
    _pMonitorId =config.P_EXTERNAL_MONITOR_ID