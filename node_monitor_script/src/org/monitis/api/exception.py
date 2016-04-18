import json

class MonitisException(Exception):
    __request = None
    __response = None
    __method = None
    # @param request
    # @param response
    # @param method
    def __init__(self, request, response, method):
        self.__request = request
        self.__response = response
        self.__method = method
    # @return dict
    def __str__(self):
        result = {};
        result['request'] = self.__request
        result['response'] = self.__response
        result['method'] = self.__method
        return json.dumps(result)
    # @return dict
    def getRequest(self):
        return self.__request
    # @return dict
    def getResponse(self):
        return self.__response
    # @return dict
    def getMethod(self):
        return self.__method