import monitorbase
import config

class Custom(monitorbase.MonitorBase):
    # @param string apiKey
    # @param string secretKey
    # @param string authToken
    # @param string apiUrl
    # @param string apiPath
    def __init__(self, apiKey, secretKey, authToken = None, apiUrl = None, apiPath = None):
        if(apiPath is None):
            apiPath = config.API_PATH_CUSTOM
        monitorbase.MonitorBase.__init__(self, apiKey, secretKey, authToken, apiUrl, apiPath)
    # Request list of monitors
    # @param string monitorName
    # @param string monitorTag
    # @param string monitorType
    # @param int agentId
    # @return list
    def requestMonitors(self, monitorName = None, monitorTag = None, monitorType = None, agentId = None):
        data = {
            config.P_ACTION: config.A_CUSTOM_MONITORS
        }
        if(not monitorName is None):
            data[config.P_CUSTOM_NAME] = monitorName
        if(not monitorTag is None):
            data[config.P_CUSTOM_TAG] = monitorTag
        if(not monitorType is None):
            data[config.P_CUSTOM_TYPE] = monitorType
        if(not agentId is None):
            data[config.P_CUSTOM_AGENT_ID] = agentId
        return self.doGet(data)
    # Request list of monitor results
    # @param int monitorId
    # @param int year
    # @param int month
    # @param int day
    # @return dict
    # @example (123, 2014, 2, 23)
    def requestMonitorResults(self, monitorId, year, month, day, timezone = None):
        data = {
            config.P_ACTION: config.A_CUSTOM_MONITOR_RESULTS,
            config.P_CUSTOM_MONITOR_ID: monitorId,
            config.P_DAY: day,
            config.P_MONTH: month,
            config.P_YEAR: year
        }
        if(not timezone is None):
            data[config.P_TIMEZONE] = timezone
        return self.doGet(data)
    # Request list of monitor additional results
    # @param int monitorId
    # @param int checktime
    # @return dict
    # @example (123, int(time.time()-1000)*1000, int(time.time()*1000))
    def requestMonitorAdditionalResults(self, monitorId, checkTime):
        data = {
            config.P_ACTION: config.A_CUSTOM_MONITOR_ADDITIONAL_RESULTS,
            config.P_CUSTOM_MONITOR_ID: monitorId,
            config.P_CUSTOM_CHECK_TIME: checkTime
        }
        return self.doGet(data)
    # Request monitor information
    # @param int monitorId
    # @param bool isExcludeHidden - if true hidden monitors would not be included in response
    # @return dict
    def requestMonitorInfo(self, monitorId, isExcludeHidden = None):
        data = {
            config.P_ACTION: config.A_CUSTOM_MONITOR_INFO,
            config.P_CUSTOM_MONITOR_ID: monitorId
        }
        if(not isExcludeHidden is None):
            if(isExcludeHidden):
                data[config.P_CUSTOM_EXCLUDE_HIDDEN] = config.V_TRUE
            else:
                data[config.P_CUSTOM_EXCLUDE_HIDDEN] = config.V_FALSE
        return self.doGet(data)
    # Request monitor report
    # @param int monitorId
    # @param int dateFrom - unix timestamp
    # @param int dateTo - unix timestamp
    # @param int interval
    # @param string intervalType = config.V_CUSTOM_INTERVAL_TYPE_MIN (HOUR, DAY, MONTH)
    # @param int timezone - for exmple 400
    # @return dict
    # @example (123, int(time.time()-1000)*1000, int(time.time()*1000))
    def requestMonitorReport(self, monitorId, dateFrom, dateTo, interval = None, intervalType = None, timezone = None):
        data = {
            config.P_ACTION: config.A_CUSTOM_MONITOR_REPORT,
            config.P_CUSTOM_MONITOR_ID: monitorId,
            config.P_CUSTOM_DATE_FROM: dateFrom,
            config.P_CUSTOM_DATE_TO: dateTo
        }
        if(not interval is None):
            data[config.P_CUSTOM_INTERVAL] = interval
        if(not intervalType is None):
            data[config.P_CUSTOM_INTERVAL_TYPE] = intervalType
        if(not timezone is None):
            data[config.P_TIMEZONE] = timezone
        return self.doGet(data)
    # Request monitor additional report
    # @param int monitorId
    # @param int dateFrom - unix timestamp
    # @param int dateTo - unix timestamp
    # @param int timezone - for exmple 400
    # @return dict
    # @example (123, int(time.time()-1000)*1000, int(time.time()*1000))
    def requestMonitorAdditionalReport(self, monitorId, dateFrom, dateTo, timezone = None):
        data = {
            config.P_ACTION: config.A_CUSTOM_MONITOR_REPORT,
            config.P_CUSTOM_MONITOR_ID: monitorId,
            config.P_CUSTOM_DATE_FROM: dateFrom,
            config.P_CUSTOM_DATE_TO: dateTo
        }
        if(not timezone is None):
            data[config.P_TIMEZONE] = timezone
        return self.doGet(data)
    # Add new custom monitor
    # @param string monitorName
    # @param string monitorTag
    # @param string resultParams - format 'name:diaplayName:unitsOfMeasure:dataType;...'
    # @param bool isMultiValue
    # @param string monitorType
    # @param string monitorParams - format 'name:diaplayName:unitsOfMeasure:dataType:isHidden(by default - false);...'
    # @param string additionalResultParams - format 'name:diaplayName:unitsOfMeasure:dataType;...'
    # @param string agentId
    # @param string agentName
    # @param int pluginMonitorId
    # @return dict
    # @example ('test', 'test', 'name:dispayName:units:2:false')
    def addMonitor(self, monitorName, monitorTag, resultParams, isMultiValue = None, monitorType = None, monitorParams = None, additionalResultParams = None,
                   agentId = None, agentName = None, pluginMonitorId = None):
        data = {
            config.P_ACTION: config.A_CUSTOM_ADD_MONITOR,
            config.P_CUSTOM_NAME: monitorName,
            config.P_CUSTOM_TAG: monitorTag,
            config.P_CUSTOM_RESULT_PARAMS: resultParams
        }
        if(not isMultiValue is None):
            if(isMultiValue):
                data[config.P_CUSTOM_IS_MULTI_VALUE] = config.V_TRUE
            else:
                data[config.P_CUSTOM_IS_MULTI_VALUE] = config.V_FALSE
        if(not monitorType is None):
            data[config.P_CUSTOM_TYPE] = monitorType
        if(not monitorParams is None):
            data[config.P_CUSTOM_MONITOR_PARAMS] = monitorParams
        if(not additionalResultParams is None):
            data[config.P_CUSTOM_ADDITIONAL_RESULT_PARAMS] = additionalResultParams
        if(not agentId is None):
            data[config.P_CUSTOM_AGENT_ID] = agentId
        if(not agentName is None):
            data[config.P_CUSTOM_AGENT_NAME] = agentName
        if(not pluginMonitorId is None):
            data[config.P_CUSTOM_PLUGIN_MONITOR_ID] = pluginMonitorId
        return self.doPost(data);
    # Edit custom montior
    # @param int monitorId
    # @param string monitorName
    # @param string monitorTag
    # @param string resultParams - format 'name:diaplayName:unitsOfMeasure:dataType;...'
    # @param bool isMultiValue
    # @param string monitorParams - format 'name:diaplayName:unitsOfMeasure:dataType:isHidden(by default - false);...'
    # @return dict
    def editMonitor(self, monitorId, monitorName = None, monitorTag = None, resultParams = None, isMultiValue = None, monitorParams = None,
                    additionalResultParams = None):
        data = {
            config.P_ACTION: config.A_CUSTOM_EDIT_MONITOR,
            config.P_CUSTOM_MONITOR_ID: monitorId
        }
        if(not monitorName is None):
            data[config.P_CUSTOM_NAME] = monitorName
        if(not monitorTag is None):
            data[config.P_CUSTOM_TAG] = monitorTag
        if(not resultParams is None):
            data[config.P_CUSTOM_RESULT_PARAMS] = resultParams
        if(not isMultiValue is None):
            if(isMultiValue):
                data[config.P_CUSTOM_IS_MULTI_VALUE] = config.V_TRUE
            else:
                data[config.P_CUSTOM_IS_MULTI_VALUE] = config.V_FALSE
        if(not monitorParams is None):
            data[config.P_CUSTOM_MONITOR_PARAMS] = monitorParams
        if(not additionalResultParams is None):
            data[config.P_CUSTOM_ADDITIONAL_RESULT_PARAMS] = additionalResultParams
        return self.doPost(data);
    # Delete custom montior
    # @param int monitorId
    # @return dict
    def deleteMonitor(self, monitorId):
        return self.doPost({
            config.P_ACTION: config.A_CUSTOM_DELETE_MONITOR,
            config.P_CUSTOM_MONITOR_ID: monitorId
        });
    # Add custom monitor results
    # @param int monitorId
    # @param int checkTime
    # @param string results - format 'name:value1,value2,...;...'
    # @return dict
    # @exmaple (123, int(time.time()*1000), 'name:value1,value2')
    def addMonitorResults(self, monitorId, checkTime, results):
        return self.doPost({
            config.P_ACTION: config.A_CUSTOM_ADD_RESULTS,
            config.P_CUSTOM_MONITOR_ID: monitorId,
            config.P_CUSTOM_CHECK_TIME: checkTime,
            config.P_CUSTOM_RESULTS: results
        });
    # Add custom monitor additional results
    # @param int monitorId
    # @param int checkTime
    # @param string results - format '[{param1:value11,param2:value21,...},{param1:value12,param2:value22,...},...]'
    # @return dict
    # @exmaple (123, int(time.time()*1000), 'name:value1,value2')
    def addMonitorAdditionalResults(self, monitorId, checkTime, results):
        return self.doPost({
            config.P_ACTION: config.A_CUSTOM_ADD_ADDITIONAL_RESULTS,
            config.P_CUSTOM_MONITOR_ID: monitorId,
            config.P_CUSTOM_CHECK_TIME: checkTime,
            config.P_CUSTOM_RESULTS: results
        });
    