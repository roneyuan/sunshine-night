class News {
	constructor(company, news) {
		this.company = company;
		this.news = news;
	}
}

class NewsContainer {
	constructor() {
		this.newsList = [];
	}

	addNews(companyNews) {
		this.newsList.push(companyNews);
	}
}

let newsContainer = new NewsContainer();