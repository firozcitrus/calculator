/**
 * Netspective Error Management System
 * Statistics Javascript Library
 * Version 0.1.8
 */
window.EMS_STATS = (function(window, document, navigator) {
    var self = {
        version: "0.1.8",
        lang: "js",
        baseUrl: "https://ems.netspective.com/api",
        contentType: "application/json",
        dataType: "json",
        async: true,
        processData: true,
        crossDomain: true,
        loginRequestType : 1,
        logoutRequestType : 2
    };
    self.notifyReleaseStages = ['development', 'production', 'staging'];
    self.notifyReleaseStageStatus = false;
    self.customMetaData;
    self.nowTime = new Date().getTime();
    self.account = "";
    self.role = "";
    self.groups = "";
    self.appversion = "";
    self.ajaxData = JSON.parse(localStorage.getItem('ajaxData')) || [];
    self.bulkData = false;
    self.localStorageSize = 4500; // MAX Local storage size. (5 MB per origin in Google Chrome, Mozilla Firefox, and Opera; 10 MB per storage area in Internet Explorer and Safari).
    // Compile regular expressions upfront.
    var API_KEY_REGEX = /^[0-9a-f]{32}$/i;
    var FUNCTION_REGEX = /function\s*([\w\-$]+)?\s*\(/i;

    /**
     * Enter your settings here
     */
    self.settings = {
        "apiKey": "xxxxx-xxxx-xxxxx", // Your Project API-KEY
        "releaseStage": 'Development', //Release Stage 1-Development, 2-Production, 3-Staging
        "customStorageLimit" : 500 // As per this size bulk data will store in local storage. rest of the storage for queuing .
    }
 
    /**
     * To initialize EMS
     * @params string  apiKey
     * @params string  releaseStage - (Development, Production, Staging)
     * @params int  storageLimit
     */
    self.register = function(apiKey, releaseStage, storageLimit) {
        self.settings.apiKey = apiKey;
        self.settings.releaseStage = capitalise(releaseStage);
        self.settings.customStorageLimit = storageLimit;
    }


    /**
     * Return Settings by name
     */
    self.getSetting = function(name) {
        var setting = self.settings[name] !== undefined ? self.settings[name] : false;
        return setting;
    }

    /**
     * Return Release Stage
     */
    getReleaseStage = function() {
        name = 'releaseStage';
        var setting = self.settings[name] !== undefined ? self.settings[name] : "Development";
        return setting;
    }

    /**
     * Return Context with url and method
     */
    getContext = function(url, method) {
        method = typeof method == 'undefined' ? 'window.onerror' : method;
        var res = url.replace(window.location.origin, "");
        var context = method + " " + res;
        return context;
    }

    /**
     * Convert string's first letter to uppercase
     */
    capitalise = function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    };

    /**
     * Return Current Time
     */
    getCurrentTime = function() {
        var d = new Date(),
            dformat = [
                d.getFullYear(), (d.getMonth() + 1),
                d.getDate()
            ].join('-') +
                ' ' + [d.getHours(),
                    d.getMinutes(),
                    d.getSeconds()
            ].join(':');

        return dformat;
    }

    /**
     * To send custom stat count.
     * example if you want to count the logged in users.
     * This will automatically adds your new value to old value
     */
    self.statCount = function(name, value, userDataCallback, time) {
        time = (typeof(time) == undefined) ? "" : Math.floor(new Date().getTime() / 1000);
        // Prepare data for statistics
        var pageName = location.pathname.substring(1)+location.hash;
        var data = [{
            'statName': name,
            'statCount': value,
            'statTime': time
        }];
        var requestData = {
            'data': data,
            'apiKey': self.getSetting('apiKey'),
            'releaseStage': getReleaseStage(),
            'pageName': '/' + pageName,
            'exitpage': '',
            'pageTitle': document.title,
            'url': window.location.href,
            'userAgent': navigator.userAgent,
            'userData': (typeof userDataCallback == 'function')?userDataCallback():userDataCallback,
            'pageMetrics' : self.pageMetricsData()
        };
        self.sendStatData(requestData);
    }

    /**
     * To send custom stat value.
     * This will update your old value with new value.
     */
    self.statValue = function(name, value, userDataCallback, time) {
        time = (typeof(time) == undefined) ? "" : Math.floor(new Date().getTime() / 1000);
        // Prepare data for statistics
        var pageName = location.pathname.substring(1)+location.hash;
        var data = [{
            'statName': name,
            'statValue': value,
            'statTime': time
        }];
        var requestData = {
            'data': data,
            'apiKey': self.getSetting('apiKey'),
            'releaseStage': getReleaseStage(),
            'pageName': '/' + pageName,
            'exitpage': '',
            'pageTitle': document.title,
            'url': window.location.href,
            'userAgent': navigator.userAgent,
            'userData': (typeof userDataCallback == 'function')?userDataCallback():userDataCallback,
            'pageMetrics' : self.pageMetricsData()
        }; 
        self.sendStatData(requestData);
    }

    /**
     * To track the users.
     * if you notify an user is logged in , EMS can track other activities with this user.
     */
    self.notifyLogin = function(requestDataCallback, customDataCallback, userDataCallback) {
        name = ''; 
        time =  Math.floor(new Date().getTime() / 1000);
        // Prepare data for statistics
        var pageName = location.pathname.substring(1)+location.hash;
        var data = [{
            'statName': name,
            'statTime': time
        }];
        var requestData = {
            'statName': "",
            'apiKey': self.getSetting('apiKey'),
            'requestType': self.loginRequestType,
            'releaseStage': getReleaseStage(),
            'pageName': '/' + pageName,
            'exitpage': '',
            'pageTitle': document.title,
            'url': window.location.href,
            'userAgent': navigator.userAgent,
            'pageMetrics' : self.pageMetricsData()
        };
        requestData = requestDataCallback(requestData); 
        var statName= requestData['statName'] ;

        requestData['data'] = data;
        requestData['data'][0]['statName'] = (statName=="")?"Login":statName+'-Login';

        requestData['customData'] = (typeof customDataCallback == 'function')?customDataCallback():customDataCallback;

        requestData['userData'] = (typeof userDataCallback == 'function')?userDataCallback():userDataCallback;

        self.sendStatData(requestData);
    }

    /**
     * To nofity an user in logged out from your application. 
     */
    self.notifyLogout = function(requestDataCallback, customDataCallback, userDataCallback) {
        
        name = ''; 
        time =  Math.floor(new Date().getTime() / 1000);
        // Prepare data for statistics
        var pageName = location.pathname.substring(1)+location.hash;
        var data = [{
            'statName': name,
            'statTime': time
        }];
        var requestData = {
            'statName': "",
            'apiKey': self.getSetting('apiKey'),
            'releaseStage': getReleaseStage(),
            'requestType': self.logoutRequestType,
            'pageName': '/' + pageName,
            'exitpage': '',
            'pageTitle': document.title,
            'url': window.location.href,
            'userAgent': navigator.userAgent,
            'pageMetrics' : self.pageMetricsData()
        };
        requestData = requestDataCallback(requestData); 
        var statName= requestData['statName'] ;

        requestData['data'] = data;
        requestData['data'][0]['statName'] = (statName=="")?"Logout":statName+'-Logout';

        requestData['customData'] = (typeof customDataCallback == 'function')?customDataCallback():customDataCallback;

        requestData['userData'] = (typeof userDataCallback == 'function')?userDataCallback():userDataCallback;
 
        self.sendStatData(requestData);
    }
    /**
     * To Store Bulk data. 
     */
    self.addToLocalStorage = function(data) {
        flag = false;
        if (self.ajaxData.length!=0) {
            self.ajaxData = JSON.parse(localStorage.getItem('ajaxData'));
        }
        if (self.ajaxData==null) {
            self.ajaxData=[];
        };
        var currentStorageSize = self.getLengthInKB(self.ajaxData);
        var currentdataSize = self.getLengthInKB(data);
        if (currentdataSize < (self.localStorageSize-currentStorageSize)) {
                self.ajaxData.push(data);
            localStorage.setItem('ajaxData', JSON.stringify(self.ajaxData));
            flag = true;
        };
    };
    /**
     * Return last Inserted id 
     */
    self.getLastInsertedId = function() {
        var id = self.readCookie('lastInsertedId');
        if (id==null) {
            id = 0;
        };
        return parseInt(id);
    };
    /**
     * Return size of the data.
     * @param data - array 
     */
    self.getLengthInKB = function(data) {
        var jsonString = JSON.stringify(data);
        var m = jsonString.match(/[^\x00-\xff]/g);//encodeURIComponent(testData).match(/%[89ABab]/g);
        var dataLength = jsonString.length + (!m ? 0: m.length);
        dataLengthInKB=Math.round((dataLength/1000).toFixed(2));
        return dataLengthInKB;
    };
    /**
     * Summary : Perform Data Transfer Service
     * @param ajaxParams - ajax parameters
     */
    self.serviceData = function(ajaxParams) {
        var serverParams = {};
        if (self.bulkData) {
            if (ajaxParams[0].httpPath) {
                serverParams.url = ajaxParams[0].httpPath;
            }
            if (ajaxParams[0].httpMethod) {
                serverParams.type = ajaxParams[0].httpMethod;
            }
            if (ajaxParams[0].data) {
                serverParams.data = ajaxParams[0].data;
            }
            if (ajaxParams[0].params.async) {
                serverParams.async = ajaxParams[0].params.async;
            }else {
                serverParams.async = self.async;
            }
            if (ajaxParams[0].params.dataType) {
                serverParams.dataType = ajaxParams[0].params.dataType;
            }else {
                serverParams.dataType = self.dataType;
            }
            if (ajaxParams[0].httpHeaders) {
                serverParams.headers = ajaxParams[0].httpHeaders;
            }
            if (ajaxParams[0].params.crossDomain) {
                serverParams.crossDomain = ajaxParams[0].params.crossDomain;
            }else {
                serverParams.crossDomain = self.crossDomain;
            }
            if (ajaxParams[0].params.contentType) {
                serverParams.contentType = ajaxParams[0].params.contentType;
            } else {
                serverParams.contentType = self.contentType;
            }
            if (ajaxParams[0].params.errorCallback) {
                serverParams.error = ajaxParams[0].params.errorCallback;
            }
            serverParams.success = ajaxParams[0].params.successCallback;
            var flag = false;
            var data = JSON.stringify(ajaxParams);
            jQuery.ajax({
                dataType: serverParams.dataType,
                crossDomain: serverParams.crossDomain,
                dataType: 'json',
                type: 'post',
                contentType: 'application/json',
                async: false,
                cache: false,
                url: serverParams.url,
                data: data,
                success: function(data) {
                    if (data.lastId != null) {
                        self.setCookie('lastInsertedId', data.lastId, 1);
                    }
                    if (data.successData.length != 0) {
                        flag = data.successData;
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    return false;
                }
            });
            return flag;
        }
        else{
            if (document.cookie.indexOf("EMSSESSID") == -1) {
                var cookie = self.randomString(30);
                self.setCookie('EMSSESSID', cookie, 1);
            }
            ajaxParams.data.EMSSESSID = self.readCookie('EMSSESSID');
            if(ajaxParams.data.requestType){
                if(ajaxParams.data.requestType == self.logoutRequestType){ 
                    self.eraseCookie("EMSSESSID");
                }
            }
            if (ajaxParams.httpPath) {
                serverParams.url = ajaxParams.httpPath;
            }
            if (ajaxParams.httpMethod) {
                serverParams.type = ajaxParams.httpMethod;
            }
            if (ajaxParams.data) {
                serverParams.data = ajaxParams.data;
            }
            if (ajaxParams.params.async) {
                serverParams.async = ajaxParams.params.async;
            }else {
                serverParams.async = self.async;
            }
            if (ajaxParams.params.dataType) {
                serverParams.dataType = ajaxParams.params.dataType;
            }else {
                serverParams.dataType = self.dataType;
            }
            if (ajaxParams.httpHeaders) {
                serverParams.headers = ajaxParams.httpHeaders;
            }
            if (ajaxParams.params.crossDomain) {
                serverParams.crossDomain = ajaxParams.params.crossDomain;
            }else {
                serverParams.crossDomain = self.crossDomain;
            }
            if (ajaxParams.params.contentType) {
                serverParams.contentType = ajaxParams.params.contentType;
            } else {
                serverParams.contentType = self.contentType;
            }
            if (ajaxParams.params.errorCallback) {
                serverParams.error = ajaxParams.params.errorCallback;
            }
            serverParams.success = ajaxParams.params.successCallback;
            jQuery.ajax({
                dataType: serverParams.dataType,
                crossDomain: serverParams.crossDomain,
                async: true,
                cache: false,
                url: serverParams.url,
                data: serverParams.data,
                success: function(data) {
                    //data = JSON.parse(data);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    return false;
                }
            });
        }
    };
    var performance = window.performance || window.msPerformance || window.webkitPerformance || window.mozPerformance;
    /**
     * To return page metrics like loadTime, latency, cssCount, jsCount etc.
     */
    self.pageMetricsData = function() {

        var path = "/statistic.json".replace(/{format}/g, 'json');
        var headJson = {};
        var ajaxParams = {
            params: {}
        };
        var performance = window.performance || window.msPerformance || window.webkitPerformance || window.mozPerformance;
        var now = new Date().getTime();
        if (!performance) {
            var pageMetrics  = {
                "pageLoadTime" : Math.abs(( now - self.nowTime)),
                "perfbar" : Math.abs((now - self.nowTime)),
                "googleAnalytics" : Math.abs((now - self.nowTime)),
                "normalJavaScript" : Math.abs((now - self.nowTime)),
                "navigationTimingAPI" : Math.abs((now - self.nowTime)),
                "cssCount" :  document.querySelectorAll('link[rel="stylesheet"]').length,
                "jsCount" :  document.querySelectorAll('script').length,
                "imgCount" :  document.querySelectorAll('img').length
            }
        }
        else{
            pageMetrics  = {
                "pageLoadTime" :  Math.abs((performance.timing.loadEventStart - performance.timing.navigationStart)),
                "perfbar" : Math.abs(( performance.timing.loadEventStart- performance.timing.navigationStart)),
                "googleAnalytics" : Math.abs((performance.timing.loadEventStart - performance.timing.navigationStart)),
                "normalJavaScript" : Math.abs((now - self.nowTime)),
                "navigationTimingAPI" : Math.abs((performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart )),
                "latency" :  Math.abs((performance.timing.responseStart - performance.timing.connectStart)) ,
                "frontEnd" :  Math.abs((performance.timing.loadEventStart - performance.timing.responseEnd)) ,
                "backEnd" :  Math.abs((performance.timing.responseEnd  - performance.timing.navigationStart)),
                "responseDuration" :  Math.abs((performance.timing.responseEnd  - performance.timing.responseStart)),
                "requestDuration" : Math.abs((performance.timing.responseStart   - performance.timing.requestStart)) ,
                "redirectCount" : Math.abs(performance.navigation.redirectCount) ,
                "loadEventTime" : Math.abs((performance.timing.loadEventEnd   - performance.timing.loadEventStart)) ,
                "domContentLoaded" : Math.abs((performance.timing.domContentLoadedEventStart   - performance.timing.domInteractive)) ,
                "processing" :  Math.abs((performance.timing.loadEventStart   - performance.timing.domLoading)),
                "cssCount" :  document.querySelectorAll('link[rel="stylesheet"]').length,
                "jsCount" :  document.querySelectorAll('script').length,
                "imgCount" :  document.querySelectorAll('img').length
            }
    }
        return pageMetrics;
    };

    /**
     * Prepare statistics data for sending.
     */
    self.sendStatData = function(data) {
        data.account = self.account;
        data.role = self.role;
        data.groups=self.groups;
        data.appversion=self.appversion;
        data.version = self.version;
        data.lang = self.lang;

        var path = "/statistic.json".replace(/{format}/g, 'json');
        var headJson = {};
        var ajaxParams = {
            params: {}
        };
        ajaxParams.httpPath = self.baseUrl + (path);
        ajaxParams.httpHeaders = headJson;
        ajaxParams.params.dataType = 'jsonp';
        ajaxParams.params.crossDomain = true;
        ajaxParams.data = data;
        ajaxParams.createdAt = getCurrentTime();
        if(storageSupport() && self.getLengthInKB(self.ajaxData) <= self.localStorageSize){
            self.bulkProcessing(ajaxParams);
        }
        else{
            self.serviceData(ajaxParams);
        }
    };

    /**
     * To generate a random string. 
     */
    self.randomString = function(len, bits) {
        bits = bits || 36;
        var outStr = "",
            newStr;
        while (outStr.length < len) {
            newStr = Math.random().toString(bits).slice(2);
            outStr += newStr.slice(0, Math.min(newStr.length, (len - outStr.length)));
        }
        return outStr;
    };
    /**
     * Check support for localstorage. 
     */
    function storageSupport(){
        /*try {
            return 'localStorage' in window && window['localStorage'] !== null;
        } catch(e) {
            return false;
        }*/
        return false;
    }
    /**
     * To save cookie.
     */
    self.setCookie = function(name, value, days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toGMTString();
        } else var expires = "";
        document.cookie = name + "=" + value + expires + "; path=/";
        return true;
    };
    /**
     * To Process bulking.
     */
    self.bulkProcessing = function(ajaxParams) {
        var localCount = self.readCookie('localCount');
            if (localCount == null) {
                self.setCookie('localCount', 1, 1);
                localCount = self.readCookie('localCount');
            }
            var lastId = self.getLastInsertedId();
            var id = lastId + parseInt(localCount);
            localCount = parseInt(localCount) +1;
            self.setCookie('localCount', localCount, 1);
            ajaxParams.id = id;
			ajaxParams.bulk = true;
            if (document.cookie.indexOf("EMSSESSID") == -1) {
                var cookie = self.randomString(30);
                self.setCookie('EMSSESSID', cookie, 1);
            }
            ajaxParams.data.EMSSESSID = self.readCookie('EMSSESSID');
            if(ajaxParams.data.requestType){
                if(ajaxParams.data.requestType == self.logoutRequestType){
                    self.eraseCookie("EMSSESSID");
                }
            }
            self.addToLocalStorage(ajaxParams); 
    };

    /**
     * To read cookie.
     */
    self.readCookie = function(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }
    /**
     * To delete cookie
     */
    self.eraseCookie = function(name) {
        self.setCookie(name, "", -1);
        return true;
    };
    /*------------ Send every 1MB of Bulkdata --------------*/

    var size = self.getLengthInKB(self.ajaxData);
    if (self.ajaxData.length!=0 && self.settings.customStorageLimit < size && storageSupport()) {
            self.bulkData = true;

            var success = self.serviceData(self.ajaxData);
            if(success){  
                success.forEach(function(successEntry) {
                    self.ajaxData.forEach(function(fullEntry, index) {
                        if (fullEntry.id === successEntry.id){
                            self.ajaxData.splice(index,1);
                        }
                    });
                });
                localStorage.setItem('ajaxData', JSON.stringify(self.ajaxData));
                self.eraseCookie('localCount');
            }
            
    };

    /**
     * To send automatic statistics about a page.
     * This will happen on page change or refresh.
     */
    self.statisticData = function(enableStat,userDataCallback) {
        if (enableStat) {
            var nVer = navigator.appVersion;
            var nAgt = navigator.userAgent;
            var nameOffset, verOffset, ix, OSName;

            if (navigator.appVersion.indexOf("Win") != -1) OSName = "Windows";
            else if (navigator.appVersion.indexOf("Mac") != -1) OSName = "MacOS";
            else if (navigator.appVersion.indexOf("X11") != -1) OSName = "UNIX";
            else if (navigator.appVersion.indexOf("Linux") != -1) OSName = "Linux";

            var path = "/statistic.json".replace(/{format}/g, 'json');
            var apiKey = self.getSetting('apiKey');
            var releaseStage = getReleaseStage();
            var page = location.pathname.substring(1)+location.hash;
            var queryParam = '';
            var sampleData = {};
            var pageLoadEvent = function () {
                sampleData = {
                    apiKey: apiKey,
                    releaseStage: releaseStage,
                    userAgent: navigator.userAgent,
                    pageTitle: document.title,
                    pageName: '/' + page,
                    url: window.location.href,
                    userData: (typeof userDataCallback == 'function') ? userDataCallback() : userDataCallback,
                    pageMetrics : self.pageMetricsData()
                };
                self.sendStatData(sampleData);
            };
            window.addEventListener("load", pageLoadEvent, false);
            window.addEventListener("onbeforeunload", pageLoadEvent, false);
        }
    };
    return self;
}(window, document, navigator));
