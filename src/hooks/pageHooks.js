import IndexComponent from './components/indexComponent';
import NotFoundComponent from './components/notFoundComponent';
import PageComponent from './components/pageComponent';
import PostComponent from './components/postComponent';
const {findBySlug} = Utilities;

export default class PageHooks {
	constructor({store, labels})
	{
		this.store = store,
		this.labels = labels;
		this.init();
		this.route();
	}
	init(){
		const {store, labels} = this;
		this.homePage = new IndexComponent({store, labels});
		this.notFoundPage = new NotFoundComponent({store, labels});
		this.pageComponent = new PageComponent({store, labels});
		this.postComponent = new PostComponent({store, labels});
	}
	route(){
		const {store} = this;
		const {getState} = store;		
		const {data: {slug}} = getState().request;
		const {data} = getState().contentful;
		const thisPage = findBySlug({data, slug});
						
		switch(thisPage.type){
			case 'index':
				this.homePage.init();
				break;
			case 'notFound':
				this.notFoundPage.init();
				break;
			case 'pages':
				this.pageComponent.init(thisPage.data);
				break;
			case 'packages':
				this.pageComponent.init(thisPage.data);
				break;
			case 'posts':
				this.postComponent.init(thisPage.data);
				break;
			default:
				this.notFoundPage.init();
		}
	}
}