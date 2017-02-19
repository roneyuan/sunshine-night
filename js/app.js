/**
 * Create the chart when all data is loaded
 * @returns {undefined}
 */
function createChart(data) {
    console.log(data);
    Highcharts.stockChart('chartDemoContainer', {

        rangeSelector: {
            selected: 3 // Select default range like 3m 6m or 12m
        },

        yAxis: {

            // Setup labels on the right
            labels: {
                formatter: function () {
                    return (this.value > 0 ? ' + ' : '') + this.value + '%';
                }
            },

            // Setup 0 point line
            plotLines: [{
                value: 0,
                width: 2,
                color: 'silver'
            }]
        },

        plotOptions: {
            series: {
                compare: 'percent',
                showInNavigator: true // Show graph on the bottom
            }
        },

        tooltip: {
            pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
            valueDecimals: 2, // decimal point
            split: true
        },

        series: data // This is where the data store
    });
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
        parameters: JSON.stringify({   
            Normalized: false,
            NumberOfDays: 3650,
            DataPeriod: "Day",
            Elements: [
                {
                    Symbol: "AAPL",
                    Type: "price",
                    Params: ["ohlc"] //ohlc, c = close only
                }
            ]
        })
    }

    $.ajax({
        data: params,
        url: MARKITONDEMAND_CHART_URL,
        dataType: "jsonp",
        context: this,
        success: function(json) {
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
        method: 'GET' // jQuery Promise - done = then, fail = catch
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

    // Single reponsobility principle
    // Idea: function, class, object...encapsulate should have only one responsibilty or reason to change.
    // Second argument on the function - pass the string - will be the element you want. 

    // Capabiliy Secuity - no classs or object...
}


function disaplyChart(data) {
    console.log(data);

/*TODO Optimize performance later*/
// var dataArray = [];
// var tempArray = [];

// for (var i = 0; i < data.Elements[0].DataSeries.close.values.length; i++) {
//     tempArray = [];
//     for (var j=0; j<=3; i++) {
//         tempArray.push(data.Positions[i]);
//         tempArray.push(data.Elements[0].DataSeries.open.values[i]);
//         tempArray.push(data.Elements[0].DataSeries.high.values[i]);
//         tempArray.push(data.Elements[0].DataSeries.low.values[i]);
//         tempArray.push(data.Elements[0].DataSeries.close.values[i]);
//     }
//     dataArray.push(tempArray);
// }

//console.log(dataArray);
// data format is [[x, open, high, low, close],.....]


// data :[timestamp, open...]
    var seriesOptions = [
    { // Sample
        name: "AAPL",
        data: 
        [[1266796800000,28.63],
        [1266883200000,28.15],
        [1266969600000,28.66],
        [1267056000000,28.86],
        [1267142400000,29.23],
        [1267401600000,29.86],
        [1267488000000,29.84],
        [1267574400000,29.90],
        [1267660800000,30.10],
        [1267747200000,31.28],
        [1268006400000,31.30],
        [1268092800000,31.86],
        [1268179200000,32.12],
        [1268265600000,32.21],
        [1268352000000,32.37],
        [1268611200000,31.98],
        [1268697600000,32.06],
        [1268784000000,32.02],
        [1268870400000,32.09],
        [1268956800000,31.75],
        [1269216000000,32.11],
        [1269302400000,32.62],
        [1269388800000,32.77],
        [1269475200000,32.38],
        [1269561600000,32.99],
        [1269820800000,33.20],
        [1269907200000,33.69],
        [1269993600000,33.57]]
    },
    {
        name: "IBM",
        data: 
        [[1266796800000,128.63],
        [1266883200000,128.15],
        [1266969600000,128.66],
        [1267056000000,128.86],
        [1267142400000,129.23],
        [1267401600000,129.86],
        [1267488000000,129.84],
        [1267574400000,129.90],
        [1267660800000,130.10],
        [1267747200000,131.28],
        [1268006400000,131.30],
        [1268092800000,131.86],
        [1268179200000,132.12],
        [1268265600000,132.21],
        [1268352000000,132.37],
        [1268611200000,131.98],
        [1268697600000,132.06],
        [1268784000000,132.02],
        [1268870400000,132.09]]     
    }];
    createChart(seriesOptions);

    // $.getJSON('https://www.highcharts.com/samples/data/jsonp.php?filename=aapl-c.json&callback=?',    function (data2) {
    //     var seriesOptions = {
    //         name: searchTerm,
    //         data: data2
    //     };
    //     createChart(seriesOptions);
    // });

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


// Use map or foreach function to replace for loop
// Avoid using for loop
// for loop might freeze up...

// When we get question about challenges
// Trying to figure to good story to tell people. Every day story happened
// Interesting problems you solved. When something happen, interesting way to solve

// Recorder interesting problems you solved




