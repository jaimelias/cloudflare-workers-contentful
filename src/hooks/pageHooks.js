import IndexComponent from './components/indexComponent';
import NotFoundComponent from './components/notFoundComponent';
import PageComponent from './components/pageComponent';
import PostComponent from './components/postComponent';
const {findBySlug} = Utilities;

export default class PageHooks {
	constructor({store, labels})
	{
		this.args = {store, labels};
		this.route();
	}
	route(){
		const {args} = this;
		const {store, labels} = args;
		const {getState} = store;
		const {slug} = getState().request.data;
		const {data} = getState().contentful;
		const thisPage = findBySlug({data, slug});
		
		switch(thisPage.type){
			case 'index':
				new IndexComponent(args).init();
				break;
			case 'notFound':
				new NotFoundComponent(args).init();
				break;
			case 'pages':
				new PageComponent(args).init(thisPage);
				break;
			case 'packages':
				new PageComponent(args).init(thisPage);
				break;
			case 'posts':
				new PostComponent(args).init(thisPage);
				break;
			default:
				new NotFoundComponent(args).init();
		}
	}
}