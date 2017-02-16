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


var callMarkitOnDemandChartApi = function(searchTerm, callback) {
    var MARKITONDEMAND_CHART_URL = "http://dev.markitondemand.com/Api/v2/InteractiveChart/jsonp";
    var params = {
        parameters: JSON.stringify(            
        { Normalized: false,
            NumberOfDays: 180,
            DataPeriod: "Day",
            Elements: [
                {
                    Symbol: "IBM",
                    Type: "price",
                    Params: ["ohlc"] //ohlc, c = close only
                },
                {
                    Symbol: "IBM",
                    Type: "volume"
                }
            ]} )
    }

    $.ajax({
        data: params,
        url: MARKITONDEMAND_CHART_URL,
        dataType: "jsonp",
        context: this,
        success: function(json){
            //Catch errors
            if (!json || json.Message){
                console.error("Error: ", json.Message);
                return;
            }
            disaplyChart(json);
        },
        error: function(response,txtStatus){
            console.log(response,txtStatus)
        }


    });
}

var callNewYorkTimesApi = function(searTerm, callback) {
    var url = "https://api.nytimes.com/svc/topstories/v2/business.json";
    url += '?' + $.param({
        'api-key': "01c5c546907941af9428ba53d9625c9b",
    }); 
    $.ajax({
        url: url,
        method: 'GET'
    }).done(function(result) {
        callback(result)
    }).fail(function(err) {
       throw err;
    });
}

function businessTopStoriesCallback(data) {
    console.log(data)
}
var callGuardianApi = function() {

}

var displayStockData1 = function(data) {
    var res = 0;
    
    stockQuote[res].Change = data.Change,
    stockQuote[res].ChangePercent = data.ChangePercent,
    stockQuote[res].ChangePercentYTD = data.ChangePercentYTD,
    stockQuote[res].ChangeYTD = data.ChangeYTD,
    stockQuote[res].High = data.High,
    stockQuote[res].LastPrice = data.LastPrice,
    stockQuote[res].Low = data.Low,
    stockQuote[res].MSDate = data.MSDate,
    stockQuote[res].MarketCap = data.MarketCap,
    stockQuote[res].Name = data.Name,
    stockQuote[res].Open = data.Open,
    stockQuote[res].Status = data.Status,
    stockQuote[res].Symbol = data.Symbol,
    stockQuote[res].Timestamp = data.Timestamp,
    stockQuote[res].Volume = data.Volume

    //console.log(stockQuote[0]);

    for (key in stockQuote[res]) {
        $('#stock1').append(`<div class="col-3">${stockQuote[res][key]}</div>`);
    }
}

var displayStockData2 = function(data) {
    var res = 1;
    
    stockQuote[res].Change = data.Change,
    stockQuote[res].ChangePercent = data.ChangePercent,
    stockQuote[res].ChangePercentYTD = data.ChangePercentYTD,
    stockQuote[res].ChangeYTD = data.ChangeYTD,
    stockQuote[res].High = data.High,
    stockQuote[res].LastPrice = data.LastPrice,
    stockQuote[res].Low = data.Low,
    stockQuote[res].MSDate = data.MSDate,
    stockQuote[res].MarketCap = data.MarketCap,
    stockQuote[res].Name = data.Name,
    stockQuote[res].Open = data.Open,
    stockQuote[res].Status = data.Status,
    stockQuote[res].Symbol = data.Symbol,
    stockQuote[res].Timestamp = data.Timestamp,
    stockQuote[res].Volume = data.Volume

    //console.log(stockQuote[1]);
    for (key in stockQuote[res]) {
        $('#stock2').append(`<div class="col-3">${stockQuote[res][key]}</div>`);
    }
}


function disaplyChart(data) {
    console.log(data);
}

var displayNewsData = function(data) {
    //var res = data.responseText;
    console.log(data.results[1]);

}

var displayGuardianData = function(data) {

}


var callGlassdoorApi = function(searchTerm, callback) {
    var GLASSDOOR_URL = 'https://api.glassdoor.com/api/api.htm';

    var query = {
        v: 1,
        format: 'json',
        't.p':"119004",
        't.k': "gHME7vA2tRw",
        userip:"0.0.0.0",
        useragent:"Mozilla",
        callback:displayGlassdoorData,
        action: "employers",
        q: searchTerm
    }
    $.getJSON(GLASSDOOR_URL, query, callback);
}

function displayGlassdoorData(data) {
    console.log(data);
}

// Button one click
$(".stock1").on('click', function(event) {
    event.preventDefault();

    var search1 = $('#firstSearch').val();
    callMarkitOnDemandApi(search1, displayStockData1);
    //marketDataExample2();
    callNewYorkTimesApi(search1, displayNewsData);
    callMarkitOnDemandChartApi(search1, disaplyChart);
    //callGlassdoorApi(search1, displayGlassdoorData);   
})

$(".stock2").on('click', function(event) {
    event.preventDefault();

    var search2 = $('#secondSearch').val();
    callMarkitOnDemandApi(search2, displayStockData2) 
})




