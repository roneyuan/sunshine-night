function getStockDataFromApi(searchTerm, callback) {


// Example


var Markit = {};
/**
* Define the QuoteService.
* First argument is symbol (string) for the quote. Examples: AAPL, MSFT, JNJ, GOOG.
* Second argument is fCallback, a callback function executed onSuccess of API.
*/
Markit.QuoteService = function(sSymbol, fCallback) {
    this.symbol = sSymbol;
    this.fCallback = fCallback;
    this.DATA_SRC = "http://dev.markitondemand.com/Api/v2/Quote/jsonp";
    this.makeRequest();
};
/**
* Ajax success callback. fCallback is the 2nd argument in the QuoteService constructor.
*/
Markit.QuoteService.prototype.handleSuccess = function(jsonResult) {
    this.fCallback(jsonResult);
};
/**
* Ajax error callback
*/
Markit.QuoteService.prototype.handleError = function(jsonResult) {
    console.error(jsonResult);
};
/** 
* Starts a new ajax request to the Quote API
*/
Markit.QuoteService.prototype.makeRequest = function() {
    //Abort any open requests
    if (this.xhr) { this.xhr.abort(); }
    //Start a new request
    this.xhr = $.ajax({
        data: { symbol: this.symbol },
        url: this.DATA_SRC,
        dataType: "jsonp",
        success: this.handleSuccess,
        error: this.handleError,
        context: this
    });
};

new Markit.QuoteService("AAPL", function(jsonResult) {

    //Catch errors
    if (!jsonResult || jsonResult.Message){
        console.error("Error: ", jsonResult.Message);
        return;
    }

    //If all goes well, your quote will be here.
    console.log(jsonResult);

    //Now proceed to do something with the data.
    $(".stock").first().text(jsonResult.Name);

    /**
    * Need help? Visit the API documentation at:
    * http://dev.markitondemand.com
    */
});	

}

function marketDataExample2() {
/** 
 * Version 2.0
 */
var Markit = {};
/**
 * Define the InteractiveChartApi.
 * First argument is symbol (string) for the quote. Examples: AAPL, MSFT, JNJ, GOOG.
 * Second argument is duration (int) for how many days of history to retrieve.
 */
Markit.InteractiveChartApi = function(symbol,duration){
    this.symbol = symbol.toUpperCase();
    this.duration = duration;
    this.PlotChart();
};

Markit.InteractiveChartApi.prototype.PlotChart = function(){
    
    var params = {
        parameters: JSON.stringify( this.getInputParams() )
    }

    //Make JSON request for timeseries data
    $.ajax({
        beforeSend:function(){
            $("#chartDemoContainer").text("Loading chart...");
        },
        data: params,
        url: "http://dev.markitondemand.com/Api/v2/InteractiveChart/jsonp",
        dataType: "jsonp",
        context: this,
        success: function(json){
            //Catch errors
            if (!json || json.Message){
                console.error("Error: ", json.Message);
                return;
            }
            this.render(json);
        },
        error: function(response,txtStatus){
            console.log(response,txtStatus)
        }
    });
};

Markit.InteractiveChartApi.prototype.getInputParams = function(){
    return {  
        Normalized: false,
        NumberOfDays: this.duration,
        DataPeriod: "Day",
        Elements: [
            {
                Symbol: this.symbol,
                Type: "price",
                Params: ["ohlc"] //ohlc, c = close only
            },
            {
                Symbol: this.symbol,
                Type: "volume"
            }
        ]
        //,LabelPeriod: 'Week',
        //LabelInterval: 1
    }
};

Markit.InteractiveChartApi.prototype._fixDate = function(dateIn) {
    var dat = new Date(dateIn);
    return Date.UTC(dat.getFullYear(), dat.getMonth(), dat.getDate());
};

Markit.InteractiveChartApi.prototype._getOHLC = function(json) {
    var dates = json.Dates || [];
    var elements = json.Elements || [];
    var chartSeries = [];

    if (elements[0]){

        for (var i = 0, datLen = dates.length; i < datLen; i++) {
            var dat = this._fixDate( dates[i] );
            var pointData = [
                dat,
                elements[0].DataSeries['open'].values[i],
                elements[0].DataSeries['high'].values[i],
                elements[0].DataSeries['low'].values[i],
                elements[0].DataSeries['close'].values[i]
            ];
            chartSeries.push( pointData );
        };
    }
    return chartSeries;
};

Markit.InteractiveChartApi.prototype._getVolume = function(json) {
    var dates = json.Dates || [];
    var elements = json.Elements || [];
    var chartSeries = [];

    if (elements[1]){

        for (var i = 0, datLen = dates.length; i < datLen; i++) {
            var dat = this._fixDate( dates[i] );
            var pointData = [
                dat,
                elements[1].DataSeries['volume'].values[i]
            ];
            chartSeries.push( pointData );
        };
    }
    return chartSeries;
};

Markit.InteractiveChartApi.prototype.render = function(data) {
    //console.log(data)
    // split the data set into ohlc and volume
    var ohlc = this._getOHLC(data),
        volume = this._getVolume(data);

    // set the allowed units for data grouping
    var groupingUnits = [[
        'week',                         // unit name
        [1]                             // allowed multiples
    ], [
        'month',
        [1, 2, 3, 4, 6]
    ]];

    // create the chart
    $('.chartDemoContainer').highcharts('StockChart', {
        
        rangeSelector: {
            selected: 1
            //enabled: false
        },

        title: {
            text: this.symbol + ' Historical Price'
        },

        yAxis: [{
            title: {
                text: 'OHLC'
            },
            height: 200,
            lineWidth: 2
        }, {
            title: {
                text: 'Volume'
            },
            top: 300,
            height: 100,
            offset: 0,
            lineWidth: 2
        }],
        
        series: [{
            type: 'candlestick',
            name: this.symbol,
            data: ohlc,
            dataGrouping: {
                units: groupingUnits
            }
        }, {
            type: 'column',
            name: 'Volume',
            data: volume,
            yAxis: 1,
            dataGrouping: {
                units: groupingUnits
            }
        }],
        credits: {
            enabled:false
        }
    });
}; 


 new Markit.InteractiveChartApi("AAPL", 3650);

}

function getNewsDataFromApi(searchTerm, callback) {
    var URL = "https://api.nytimes.com/svc/topstories/v2/home.json";

  var query = {
    section: "business",
    format: "jsonp",
    callback: displayNewsData
  }
  $.getJSON(URL, query, callback);  
}




var callMarkitOnDemandApi = function(searchTerm, callback) {
    var MARKITONDEMAND_URL = "http://dev.markitondemand.com/Api/v2/Quote/jsonp"; // Has to be jsonp in order to display data

    // Does not work using $.getJSON. It needs to use $.ajax
    $.ajax({
        data: { symbol: searchTerm },
        url: MARKITONDEMAND_URL,
        dataType: "jsonp",
        success: callback,
        error: callback
    });
}

var callNewYorkTimesApi = function() {

}

var callGuardianApi = function() {

}

var displayStockData = function(data) {
    console.log(data);
    // Store Data to the state
    
}

var displayNewsData = function(data) {

}

var displayGuardianData = function(data) {

}

// Button one click
$(".stock1").on('click', function(event) {
    event.preventDefault();

    var search1 = $('#firstSearch').val();
    callMarkitOnDemandApi(search1, displayStockData);
    //marketDataExample2();
    //getNewsDataFromApi(search, displayNewsData)   
})

$(".stock2").on('click', function(event) {
    event.preventDefault();

    var search = $('#secondSearch').val();
    getStockDataFromApi(secondSearch, displayStockData) 
})




