import './Startpages.css'

function StartPages() {
	return (
		<div className='start-pages'>
			<div className='section transparent first' />
			<div className='section second'>
				<div className='buttons'>
					<button>Войти как гость</button>
					<button>Войти как офицер</button>
				</div>
			</div>
			<div className='section transparent third' />
		</div>
	)
}
export default StartPages
