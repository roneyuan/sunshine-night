class Stock {
	constructor(symbol, high, low, volume, lastPrice, companyName) {
		this.symbol = symbol;
		this.high = high;
		this.low = low;
		this.volume = volume;
		this.lastPrice = lastPrice;
		this.companyName = companyName;
	}
}


class StockContainer {
	constructor() {
		this.stockList = [];
		this.stockChart = [];
	}

	addStock(stock) {
		this.stockList.push(stock);
	}

	checkIfExist(symbol) {
		let result = false;
		
		this.stockList.forEach(stock => {
			if (stock.symbol === symbol) {
				result = true;
			} 
		});

		return result;
	}
}

let stockContainer = new StockContainer();