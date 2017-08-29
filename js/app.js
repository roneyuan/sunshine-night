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

function callNewYorkTimesApi(searchTerm, callback) {
  let url = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
  let beginDate = getFormatedBeginDate();
  let endDate = getFormatedEndDate();
  
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

function callMarkitOnDemandChartApi(searchTerm, callback) {
  let MARKITONDEMAND_CHART_URL = "http://dev.markitondemand.com/Api/v2/InteractiveChart/jsonp";
  let params = {
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

      createChart(json);
    },
    error: function(response,txtStatus){
      handleError();
    }
  });
}

function createChart(data) {
  let dataArray = [];

  for (let i = 0; i < data.Elements[0].DataSeries.close.values.length; i++) {
    dataArray.push([Date.parse(data.Dates[i]), data.Elements[0].DataSeries.open.values[i]]);
  }

  let chart = {
    name: data.Elements[0].Symbol,
    data: dataArray,
    color: "#"+(Math.floor(Math.random()*16777215).toString(16)) //random color, sometimes might be transparent
  };

  stockContainer.stockChart.push(chart);
  displayChart(stockContainer.stockChart);
}

function displayChart(data) {
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

function displayStockInformation(data) {
  let stockInformation = data.results[0];
  let { netChange, percentChange, high, lastPrice, low, name, open, symbol, volume } = stockInformation;
  let stock = new Stock(symbol, high, low, volume.toLocaleString('en-US'), lastPrice, name);
   
  stockContainer.addStock(stock);
  $('.companyData').remove();

  stockContainer.stockList.forEach(stock => {
    $('.stockList').append(`
      <tr class="companyData">
        <td>${stock.symbol}</td>
        <td>${stock.high}</td>
        <td>${stock.low}</td>
        <td>${stock.volume}</td>
        <td>${stock.lastPrice}</td>
        <td>${stock.companyName}</td>
      </tr>`);
  });  

  callNewYorkTimesApi(stock.companyName, displayStockNews);
}

function displayStockNews(data, company) {
  let news = new News(company, data.response.docs);
  newsContainer.addNews(news);

  $('.newsFrame').remove();
  $('.companyNewsName').remove();

  let title = "";
  let imageUrl = "";
  let newsContent = "";

  newsContainer.newsList.forEach(data => {
    $('#newsRow').append(`<div class="col-12 companyNewsName">${data.company}</div>`)
    
    data.news.forEach(article => {
      if (article.headline.main.length > 90) {
        title = article.headline.main.substring(0,89) + "...";
      } else {
        title = article.headline.main;
      }

      if (article.multimedia.length > 2) {
        imageUrl = "http://nytimes.com/" + article.multimedia[1].url;
        newsContent = `
          <div class="col-12 newsFrame">                         
            <a target="_blank" href="${article.web_url}">
              <div class="news">
                <div class="col-4 newsImage"><img src="${imageUrl}" alt="" /></div>
                <div class="col-8 newsTitle"><div class="newsButton">
                <div class="title">${title}</div>
                <p>
                <div class="paragraph">${article.snippet}</div>
                </div></div>
              </div>
            </a>
          </div>`

      } else {
        imageUrl = "";
        newsContent = `
          <div class="col-12 newsFrame">                         
            <a target="_blank" href="${article.web_url}">
              <div class="news">
                <div class="col-12 newsTitle"><div class="newsButtonNoImage">
                <div class="title">${title}</div>
                <p>
                <div class="paragraph">${article.snippet}</div>
                </div></div>
              </div>
            </a>
          </div>`
      }

      $('#newsRow').append(newsContent);
    });               
  });
}

function getFormatedEndDate() {
  let now = new Date();
  let year = String(now.getFullYear());
  let month = now.getMonth() + 1 < 10 ? "0" + String(now.getMonth() + 1) : String(now.getMonth() + 1);
  let day = now.getDate() + 1 < 10 ? "0" + String(now.getDate() + 1) : String(now.getDate() + 1);

  let beginDate = year + month + day;
  
  return beginDate;
}

function getFormatedBeginDate() {
  let now = new Date();
  let lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  let lastWeekYear = String(lastWeek.getFullYear());
  let lastWeekMonth = lastWeek.getMonth() + 1 < 10 ? "0" + String(lastWeek.getMonth() + 1) : String(lastWeek.getMonth() + 1);
  let lastWeekDay = lastWeek.getDate() + 1 < 10 ? "0" + String(lastWeek.getDate() + 1) : String(lastWeek.getDate() + 1); 
 
  let endDate = lastWeekYear + lastWeekMonth + lastWeekDay;
  
  return endDate;
}

function handleError() {
  alert("Oops! This is a free version, which only allows 2 API calls in 10 seconds."); 
}





