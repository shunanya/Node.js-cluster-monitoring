import externalbase
import config

class Transaction(externalbase.ExternalBase):
    _aMonitors = config.A_TRANSACTION_MONITORS
    _aMonitorInfo = config.A_TRANSACTION_MONITOR_INFO
    _aMonitorResults =config.A_TRANSACTION_MONITOR_RESULTS
    _pMonitorId =config.P_TRANSACTION_MONITOR_ID