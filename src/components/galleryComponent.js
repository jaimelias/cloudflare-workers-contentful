export const GalleryComponent = ({data}) => {
	
	let output = '';
	
	if(data)
	{
		if(data.length === 1)
		{
			output = Utilities.Media({className: 'img-fluid rounded', ...data[0]});
		}
		else if(data.length > 1)
		{
			const carouselInnerItem = data.map((row, index) => {
				const active = (!index) ? 'active' : '';
				let args = {
					className: 'd-block w-100 img-fluid rounded',
					...row
				};
			
				args.lazyLoading = (index) ? true : false;
				
				const RenderMedia = Utilities.Media(args);
				return `<div class="carousel-item bg-light ${active}">${RenderMedia}</div>`;
			}).join('');
			
			const carouselIndicators = data.map((row, index) => {
				const activeClass = (!index) ? 'class="active"' : '';
				
				return `<li data-bs-target="#galleryCarousel" data-bs-slide-to="${index}" ${activeClass}></li>`;
			}).join('');			
			
			return `
				<div class="mb-5">
					<div id="galleryCarousel" class="carousel slide" data-bs-ride="carousel">
					  <ol class="carousel-indicators">
						${carouselIndicators}
					  </ol>
					  <div class="carousel-inner">
						${carouselInnerItem}
					  </div>
					  <a class="carousel-control-prev" href="#galleryCarousel" role="button" data-bs-slide="prev">
						<span class="carousel-control-prev-icon"></span>
					  </a>
					  <a class="carousel-control-next" href="#galleryCarousel" role="button" data-bs-slide="next">
						<span class="carousel-control-next-icon"></span>
					  </a>
					</div>
				</div>
			`;
		}
	}
	
	return output;
};