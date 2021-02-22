import IndexComponent from './components/indexComponent';
import NotFoundComponent from './components/notFoundComponent';
import PageComponent from './components/pageComponent';
import PostComponent from './components/postComponent';

export default class PageHooks {
	constructor({store, hasForm, sharedData, labels})
	{
		this.store = store,
		this.hasForm = hasForm,
		this.sharedData = sharedData;
		this.labels = labels;
		this.init();
		this.route();
	}
	init(){
		const {store, labels, sharedData, hasForm} = this;
		this.homePage = new IndexComponent({store, labels});
		this.notFoundPage = new NotFoundComponent({store, labels});
		this.pageComponent = new PageComponent({store, labels, sharedData, hasForm});
		this.postComponent = new PostComponent({store, labels});
	}
	route(){
		const {store} = this;
		const {getState} = store;		
		const request = getState().request.data;
		const pages = getState().contentful.data.pages.entries;
		const posts = getState().contentful.data.posts;	
		const {slug} = request;
		const page = pages.find(i => i.slug === slug);
		const post = posts.entries.find(i => i.slug === slug);
		
		if(slug === '')
		{
			this.homePage.init();			
		}
		else if(typeof page  === 'object')
		{
			this.pageComponent.init(page);
		}
		else if(typeof post === 'object')
		{
			this.postComponent.init(post);
		}
		else
		{
			this.notFoundPage.init();
		}
	}
}