import IndexComponent from './components/indexComponent';
import NotFoundComponent from './components/notFoundComponent';
import PageComponent from './components/pageComponent';
import PackageComponent from './components/packageComponent';
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
		const thisEntry = findBySlug({data, slug});
		const {entryType} = thisEntry;
		
		if(entryType === 'pages')
		{
			if(slug)
			{
				new PageComponent(args).init(thisEntry);
			}
			else
			{
				new IndexComponent(args).init();
			}
		}
		else if(entryType === 'packages')
		{
			new PackageComponent(args).init(thisEntry);
		}
		else if(entryType === 'posts')
		{
			new PostComponent(args).init(thisEntry);
		}
		else
		{
			new NotFoundComponent(args).init();
		}
	}
}