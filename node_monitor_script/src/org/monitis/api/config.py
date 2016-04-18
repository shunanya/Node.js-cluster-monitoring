API_URL = 'api.monitis.com'
API_PATH = '/api'
API_PATH_CUSTOM = '/customMonitorApi'
#Info messages
INFO_TOKEN_EXPIRED = 'Token is expired, getting new token'
#Parameters
P_ACTION = 'action'
P_VALIDATION = 'validation'
P_API_KEY = 'apikey'
P_AUTH_TOKEN = 'authToken'
P_SECRET_KEY = 'secretkey'

P_TIMEZONE = 'timezone'
P_DAY = 'day'
P_MONTH = 'month'
P_YEAR = 'year'

P_EXTERNAL_MONITOR_ID = 'testId'

P_TRANSACTION_MONITOR_ID = 'monitorId'

P_FULLPAGELOAD_MONITOR_ID = 'monitorId'

P_CUSTOM_MONITOR_ID = 'monitorId'
P_CUSTOM_NAME = 'name'
P_CUSTOM_TAG = 'tag'
P_CUSTOM_TYPE = 'type'
P_CUSTOM_RESULT_PARAMS = 'resultParams'
P_CUSTOM_IS_MULTI_VALUE = 'isMultiValue'
P_CUSTOM_CHECK_TIME = 'checktime'
P_CUSTOM_RESULTS = 'results'
P_CUSTOM_INTERVAL = 'interval'
P_CUSTOM_INTERVAL_TYPE = 'intervalType'
P_CUSTOM_EXCLUDE_HIDDEN = 'excludeHidden'
P_CUSTOM_DATE_FROM = 'dateFrom'
P_CUSTOM_DATE_TO = 'dateTo'
P_CUSTOM_MONITOR_PARAMS = 'monitorParams'
P_CUSTOM_ADDITIONAL_RESULT_PARAMS = 'additionalResultParams'
P_CUSTOM_AGENT_ID = 'agentId'
P_CUSTOM_AGENT_NAME = 'agentName'
P_CUSTOM_PLUGIN_MONITOR_ID = 'pluginMonitorId'

#API actions
A_AUTH_TOKEN = 'authToken'

A_EXTERNAL_MONITORS = 'tests'
A_EXTERNAL_MONITOR_INFO = 'testinfo'
A_EXTERNAL_MONITOR_RESULTS = 'testresult'

A_TRANSACTION_MONITORS = 'transactionTests'
A_TRANSACTION_MONITOR_INFO = 'transactionTestInfo'
A_TRANSACTION_MONITOR_RESULTS = 'transactionTestResult'

A_FULLPAGELOAD_MONITORS = 'fullPageLoadTests'
A_FULLPAGELOAD_MONITOR_INFO = 'fullPageLoadTestInfo'
A_FULLPAGELOAD_MONITOR_RESULTS = 'fullPageLoadTestResult'

A_CUSTOM_MONITORS = 'getMonitors'
A_CUSTOM_MONITOR_INFO = 'getMonitorInfo'
A_CUSTOM_MONITOR_RESULTS = 'getMonitorResults'
A_CUSTOM_MONITOR_ADDITIONAL_RESULTS = 'getAdditionalResults'
A_CUSTOM_MONITOR_REPORT = 'getReport'
A_CUSTOM_ADD_MONITOR = 'addMonitor'
A_CUSTOM_EDIT_MONITOR = 'editMonitor'
A_CUSTOM_DELETE_MONITOR = 'deleteMonitor'
A_CUSTOM_ADD_RESULTS = 'addResult'
A_CUSTOM_ADD_ADDITIONAL_RESULTS = 'addAdditionalResults'
#Parameters values
V_VALIDATION_TOKEN = 'token'
V_TRUE = 'true'
V_FALSE = 'false'

V_CUSTOM_INTERVAL_TYPE_MIN = 'min'
V_CUSTOM_INTERVAL_TYPE_HOUR = 'hour'
V_CUSTOM_INTERVAL_TYPE_DAY = 'day'
V_CUSTOM_INTERVAL_TYPE_MONTH = 'month'

V_CUSTOM_AGGREGATE_AVG = 'avg'
V_CUSTOM_AGGREGATE_AVG = 'sum'
V_CUSTOM_AGGREGATE_MIN = 'min'
V_CUSTOM_AGGREGATE_MAX = 'max'
V_CUSTOM_AGGREGATE_LAST = 'last'

#Response parameters
R_AUTH_TOKEN = 'authToken'
R_ERROR = 'error'
R_ERROR_CODE = 'errorCode'