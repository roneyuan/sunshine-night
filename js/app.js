

var callMarkitOnDemandApi = function(searchTerm, callback) {
    var MARKITONDEMAND_URL = "http://dev.markitondemand.com/Api/v2/Quote/jsonp"; 

    $.ajax({
        data: { symbol: searchTerm },
        url: MARKITONDEMAND_URL,
        dataType: "jsonp",
        success: callback,
        error: handleError
    }); 
}

function callBarchartOnDemandApi(searchTerm, callback) {
  let url = "https://marketdata.websol.barchart.com/getQuote.jsonp"; 
  $.ajax({
    data: { 
      symbols: searchTerm,
      key: "2fa1f157fb3ce032ffbb1d9fc16b687f"
    },
        url: url,
        dataType: "jsonp",
        success: callback,
        error: handleError
    });
}

var displayStockData = function(data) {

    if (data.status.message !== "Success.") {
        alert("Unable to find the symbol. Try Use Symbol Finder!"); /* TODO Symbo Finder */
    } else {
        /*
        {
  "status": {
    "code": 200,
    "message": "Success."
  },
  "results": [
    {
      "symbol": "AAPL",
      "exchange": "BATS",
      "name": "Apple Inc",
      "dayCode": "A",
      "serverTimestamp": "2017-08-11T15:41:48-05:00",
      "mode": "i",
      "lastPrice": 157.48,
      "tradeTimestamp": "2017-08-11T15:59:59-05:00",
      "netChange": 2.16,
      "percentChange": 1.39,
      "unitCode": "2",
      "open": 154.94,
      "high": 158.57,
      "low": 154.94,
      "close": 0,
      "flag": "",
      "volume": 1824000
    }
  ]
}
        */

        let stock = data.results[0];
        var stockData = {
            Change: stock.netChange,
            ChangePercent: stock.percentChange,
            High: stock.high,
            LastPrice: stock.lastPrice,
            Low: stock.low,
            Name: stock.name,
            Open: stock.open,
            Symbol: stock.symbol,
            Volume: stock.volume
        }   

        stockQuote.push(stockData);
        
        $('.companyData').remove();

        stockQuote.forEach(function(element) {
            $('.stockList').append(`<tr class="companyData"><td>${element.Symbol}</td>
                                        <td>${element.High}</td>
                                        <td>${element.Low}</td>
                                        <td>${element.Volume}</td>
                                        <td>${element.LastPrice}</td>
                                        <td>${element.Name}</td></tr>`);
        });

        callNewYorkTimesApi(stockData.Name, displayStockNews);
    }
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
                    Symbol: searchTerm,
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
            if (!json || json.Message){
                console.error("Error: ", json.Message);
                return;
            }
            searchHistory.push(searchTerm.toUpperCase()); 
            createChart(json);
        },
        error: function(response,txtStatus){
            handleError()
            console.log(response,txtStatus)
        }
    });
}

var createChart = function(data) {
    var dataArray = [];
    var tempArray = [];

    for (var i = 0; i < data.Elements[0].DataSeries.close.values.length; i++) {
        tempArray = [];
        tempArray.push(Date.parse(data.Dates[i]));
        tempArray.push(data.Elements[0].DataSeries.open.values[i]);
        dataArray.push(tempArray);
    }

    var tempChart = {
        name: data.Elements[0].Symbol,
        data: dataArray,
        color: "#"+(Math.floor(Math.random()*16777215).toString(16)) //random color, sometimes might be transparent
    };

    stockCharts.push(tempChart);
    displayChart(stockCharts);
}

var displayChart = function(data) {
    Highcharts.stockChart('chartDemoContainer', {

        rangeSelector: {
            selected: 4 // Select default range like 3m 6m or 12m
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

var callNewYorkTimesApi = function(searchTerm, callback) {
    var url = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
    var today = new Date();
    var year = String(today.getFullYear());
    var month = String(today.getMonth() + 1);
    if (today.getMonth()+1 < 10) { month = "0" + month }
    var day = String(today.getDate());
    if (today.getDate() < 10) { day = "0" + day } 
    var lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    var lastWeekMonth = String(lastWeek.getMonth() + 1);
    if (lastWeek.getMonth()+1 < 10) { lastWeekMonth = "0" + lastWeekMonth }
    var lastWeekDay = String(lastWeek.getDate());    
    if (lastWeek.getDate() < 10) { lastWeekDay = "0" + lastWeekDay } 
    var beginDate = String(lastWeek.getFullYear()) + lastWeekMonth + lastWeekDay;
    var endDate = year + month + day;

    url += '?' + $.param({
        'api-key': "01c5c546907941af9428ba53d9625c9b",
        'q': searchTerm,
        'begin_date': beginDate, // today - 7 days
        'end_date': endDate  // today
    });

    $.ajax({
        url: url,
        method: 'GET',
    }).done(function(result) {
        callback(result, searchTerm);
    }).fail(function(err) {
        throw err;
    });
}

var displayStockNews = function(data, searchTerm) {
    var news = {
        company: searchTerm,
        article: data.response.docs,
    }

    stockNews.push(news);
    console.log(stockNews);
    $('.newsFrame').remove();
    $('.companyNewsName').remove();

    let title = "";
    let imageUrl = "";
    let newsContent = "";

    stockNews.forEach(function(stockElement) {
        $('#newsRow').append(`<div class="col-12 companyNewsName">${stockElement.company}</div>`)
        stockElement['article'].forEach(function(newsElement) {
            if (newsElement.headline.main.length > 90) {
                title = newsElement.headline.main.substring(0,89) + "...";
            } else {
                title = newsElement.headline.main;
            }

            if (newsElement.multimedia.length > 2) {
                imageUrl = "http://nytimes.com/" + newsElement.multimedia[2].url;
                newsContent = `<div class="col-12 newsFrame">                         
                                    <a target="_blank" href="${newsElement.web_url}">
                                        <div class="news">
                                            <div class="col-4 newsImage"><img src="${imageUrl}" alt="" /></div>
                                            <div class="col-8 newsTitle"><div class="newsButton">
                                            <div class="title">${title}</div>
                                            <p>
                                            <div class="paragraph">${newsElement.snippet}</div>
                                            </div></div>
                                        </div>
                                    </a>
                                </div>`
            } else {
                imageUrl = "";
                newsContent = `<div class="col-12 newsFrame">                         
                                    <a target="_blank" href="${newsElement.web_url}">
                                        <div class="news">
                                            <div class="col-12 newsTitle"><div class="newsButtonNoImage">
                                            <div class="title">${title}</div>
                                            <p>
                                            <div class="paragraph">${newsElement.snippet}</div>
                                            </div></div>
                                        </div>
                                    </a>
                                </div>`
            }

            $('#newsRow').append(newsContent);
        })               
    });
}

var handleError = function() {
    alert("Oops! This is a free version, which only allows 2 API calls in 10 seconds."); 
}

/*CORS Issue with Glassdoor*/
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

$(".addStock").on('click', function(event) {
    event.preventDefault();
    var searchStock = $('#search').val();
    $('#search').val('');

    var unifiedSearchTerm = searchStock.toUpperCase();

    if (searchHistory.includes(unifiedSearchTerm)) {
        alert("You have added " + searchStock);
    } else {
        //searchHistory.push(unifiedSearchTerm); // When the API call and push. Not here. Or do it with promise, success and failure.
        callBarchartOnDemandApi(searchStock, displayStockData);      
        callMarkitOnDemandChartApi(searchStock, createChart);    
    }
});

// Better Style. Put () outside
(function(){
    callBarchartOnDemandApi("AAPL", displayStockData);      
    callMarkitOnDemandChartApi("AAPL", createChart);  
})()





