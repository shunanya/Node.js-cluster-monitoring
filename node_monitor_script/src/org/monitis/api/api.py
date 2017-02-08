import urllib
import httplib
import json
import logging

import config
import exception

class Api:
    __apiKey = None
    __secretKey = None
    __authToken = None
    __apiUrl = None
    __apiPath = None
    # @param string apiKey
    # @param string secretKey
    # @param string authToken
    # @param string apiUrl
    # @param string apiPath
    def __init__(self, apiKey, secretKey, authToken = None, apiUrl = None, apiPath = None):
        if(apiUrl is None):
            apiUrl = config.API_URL
        if(apiPath is None):
            apiPath = config.API_PATH
        self.__apiKey = apiKey
        self.__secretKey = secretKey
        self.__authToken = authToken
        self.__apiUrl =  apiUrl
        self.__apiPath =  apiPath
    # Make GET request
    # @param dict data
    # @return dict or list
    # @raise HTTPException - API connection error
    # @raise ValueError - result is not valid JSON
    # @raise Exeption - returned value
    def doGet(self, data):
        connection = httplib.HTTPConnection(self.__apiUrl)
        data[config.P_API_KEY] = self.__apiKey
        connection.request('GET', self.__apiPath + '?' + urllib.urlencode(data))
        response = connection.getresponse()
        try:
            responseJson = json.loads(response.read())
        except Exception as e:
            responseJson = {'error':'undefined response', 'desc':str(e.args)}
#         if(config.R_ERROR in responseJson):
#             raise exception.MonitisException(data, responseJson, 'get')
        return responseJson
    # Make POST request
    # @param dict data
    # @return dict or list
    # @raise HTTPException - API connection error
    # @raise ValueError - result is not valid JSON
    # @raise Exeption - returned value
    def doPost(self, data):
        connection = httplib.HTTPConnection(self.__apiUrl)
        data[config.P_API_KEY] = self.__apiKey
        data[config.P_VALIDATION] = config.V_VALIDATION_TOKEN
#        authToken = self.getAuthToken()
        if(self.__authToken is None):
            self.updateAuthToken()
        data[config.P_AUTH_TOKEN] = self.__authToken
        headers = {'Content-type': 'application/x-www-form-urlencoded', 'Accept': 'text/plain'}
        connection.request('POST', self.__apiPath, urllib.urlencode(data), headers)
        response = connection.getresponse()
        try:
            responseJson = json.loads(response.read())
        except Exception as e:
            responseJson = {'error':'undefined response', 'desc':str(e.args)}
#        if(config.R_ERROR in responseJson):
#            raise exception.MonitisException(data, responseJson, 'post')
        return responseJson

    def requestAuthToken(self):
        return self.doGet({
            config.P_ACTION: config.A_AUTH_TOKEN,
            config.P_API_KEY: self.__apiKey,
            config.P_SECRET_KEY: self.__secretKey
        });
    # @return string authToken
    def updateAuthToken(self):
        response = self.requestAuthToken()
        self.__authToken = response[config.R_AUTH_TOKEN]
        return self.__authToken
    # @return string
    def getAuthToken(self):
        return self.__authToken
    # @return string
    def getApiKey(self):
        return self.__apiKey
    # @return string
    def getSecretKey(self):
        return self.__secretKey
    # @return string
    def getApiUrl(self):
        return self.__apiUrl
    