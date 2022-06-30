// e.x. data-da=".item,992,2"

"use strict";


function DynamicAdapt(type) {
	this.type = type;
}

DynamicAdapt.prototype.init = function () {
	const _this = this;
	// массив объектов
	this.оbjects = [];
	this.daClassname = "_dynamic_adapt_";
	// массив DOM-элементов
	this.nodes = document.querySelectorAll("[data-da]");

	// наполнение оbjects объктами
	for (let i = 0; i < this.nodes.length; i++) {
		const node = this.nodes[i];
		const data = node.dataset.da.trim();
		const dataArray = data.split(",");
		const оbject = {};
		оbject.element = node;
		оbject.parent = node.parentNode;
		оbject.destination = document.querySelector(dataArray[0].trim());
		оbject.breakpoint = dataArray[1] ? dataArray[1].trim() : "767";
		оbject.place = dataArray[2] ? dataArray[2].trim() : "last";
		оbject.index = this.indexInParent(оbject.parent, оbject.element);
		this.оbjects.push(оbject);
	}

	this.arraySort(this.оbjects);

	// массив уникальных медиа-запросов
	this.mediaQueries = Array.prototype.map.call(this.оbjects, function (item) {
		return '(' + this.type + "-width: " + item.breakpoint + "px)," + item.breakpoint;
	}, this);
	this.mediaQueries = Array.prototype.filter.call(this.mediaQueries, function (item, index, self) {
		return Array.prototype.indexOf.call(self, item) === index;
	});

	// навешивание слушателя на медиа-запрос
	// и вызов обработчика при первом запуске
	for (let i = 0; i < this.mediaQueries.length; i++) {
		const media = this.mediaQueries[i];
		const mediaSplit = String.prototype.split.call(media, ',');
		const matchMedia = window.matchMedia(mediaSplit[0]);
		const mediaBreakpoint = mediaSplit[1];

		// массив объектов с подходящим брейкпоинтом
		const оbjectsFilter = Array.prototype.filter.call(this.оbjects, function (item) {
			return item.breakpoint === mediaBreakpoint;
		});
		matchMedia.addListener(function () {
			_this.mediaHandler(matchMedia, оbjectsFilter);
		});
		this.mediaHandler(matchMedia, оbjectsFilter);
	}
};

DynamicAdapt.prototype.mediaHandler = function (matchMedia, оbjects) {
	if (matchMedia.matches) {
		for (let i = 0; i < оbjects.length; i++) {
			const оbject = оbjects[i];
			оbject.index = this.indexInParent(оbject.parent, оbject.element);
			this.moveTo(оbject.place, оbject.element, оbject.destination);
		}
	} else {
		for (let i = 0; i < оbjects.length; i++) {
			const оbject = оbjects[i];
			if (оbject.element.classList.contains(this.daClassname)) {
				this.moveBack(оbject.parent, оbject.element, оbject.index);
			}
		}
	}
};

// Функция перемещения
DynamicAdapt.prototype.moveTo = function (place, element, destination) {
	element.classList.add(this.daClassname);
	if (place === 'last' || place >= destination.children.length) {
		destination.insertAdjacentElement('beforeend', element);
		return;
	}
	if (place === 'first') {
		destination.insertAdjacentElement('afterbegin', element);
		return;
	}
	destination.children[place].insertAdjacentElement('beforebegin', element);
}

// Функция возврата
DynamicAdapt.prototype.moveBack = function (parent, element, index) {
	element.classList.remove(this.daClassname);
	if (parent.children[index] !== undefined) {
		parent.children[index].insertAdjacentElement('beforebegin', element);
	} else {
		parent.insertAdjacentElement('beforeend', element);
	}
}

// Функция получения индекса внутри родителя
DynamicAdapt.prototype.indexInParent = function (parent, element) {
	const array = Array.prototype.slice.call(parent.children);
	return Array.prototype.indexOf.call(array, element);
};

// Функция сортировки массива по breakpoint и place 
// по возрастанию для this.type = min
// по убыванию для this.type = max
DynamicAdapt.prototype.arraySort = function (arr) {
	if (this.type === "min") {
		Array.prototype.sort.call(arr, function (a, b) {
			if (a.breakpoint === b.breakpoint) {
				if (a.place === b.place) {
					return 0;
				}

				if (a.place === "first" || b.place === "last") {
					return -1;
				}

				if (a.place === "last" || b.place === "first") {
					return 1;
				}

				return a.place - b.place;
			}

			return a.breakpoint - b.breakpoint;
		});
	} else {
		Array.prototype.sort.call(arr, function (a, b) {
			if (a.breakpoint === b.breakpoint) {
				if (a.place === b.place) {
					return 0;
				}

				if (a.place === "first" || b.place === "last") {
					return 1;
				}

				if (a.place === "last" || b.place === "first") {
					return -1;
				}

				return b.place - a.place;
			}

			return b.breakpoint - a.breakpoint;
		});
		return;
	}
};

const da = new DynamicAdapt("max");
da.init();

const lazyImages = document.querySelectorAll('img[data-src],source[data-srcset]');
const windowHeight = document.documentElement.clientHeight;

let lazyImagesPositions = [];

if (lazyImages.length > 0) {
	lazyImages.forEach(img => {
		if (img.dataset.src || img.dataset.srcset) {
			lazyImagesPositions.push(img.getBoundingClientRect().top + pageYOffset);
			lazyScrollCheck();
		}
	});
};


window.addEventListener("scroll", lazyScroll);

function lazyScroll() {
	if (document.querySelectorAll('img[data-src],source[data-srcset]').length > 0) {
		lazyScrollCheck();
	}
};

function lazyScrollCheck() {
	let imgIndex = lazyImagesPositions.findIndex(
		item => pageYOffset > item - 1500 - windowHeight
	);
	if (imgIndex >= 0) {
		if (lazyImages[imgIndex].dataset.src) {
			lazyImages[imgIndex].src = lazyImages[imgIndex].dataset.src;
			lazyImages[imgIndex].removeAttribute('data-src');
		} else if (lazyImages[imgIndex].dataset.srcset) {
			lazyImages[imgIndex].srcset = lazyImages[imgIndex].dataset.srcset;
			lazyImages[imgIndex].removeAttribute('data-srcset');
		};
		// if (lazyImages[imgIndex].closest('._load-image-icon')) {
		// 	let parentImages = lazyImages[imgIndex].closest('._load-image-icon');
		// 	parentImages.classList.remove('_load-image-icon')
		// }
		delete lazyImagesPositions[imgIndex];
	}
};


window.onload = function () {
	const lineSliderSquares = document.querySelector('.range-squares');
	if (lineSliderSquares) {
		noUiSlider.create(lineSliderSquares, {
			start: [4, 30],
			connect: true,
			behaviour: 'drag',
			step: 1,
			range: {
				'min': [0],
				'max': [30]
			},
			format: {
				to: function (value) {
					return parseInt(value);
				},
				from: function (value) {
					return parseInt(value);
				}
			}
		});

		var limitFieldMinSquares = document.getElementById('squares-value-min');
		var limitFieldMaxSquares = document.getElementById('squares-value-max');

		lineSliderSquares.noUiSlider.on('update', function (values, handle) {
			(handle ? limitFieldMaxSquares : limitFieldMinSquares).innerHTML = values[handle];
		});
	};

	const lineSliderMeters = document.querySelector('.range-meters');
	if (lineSliderMeters) {
		noUiSlider.create(lineSliderMeters, {
			start: [2, 10],
			connect: true,
			behaviour: 'drag',
			step: 1,
			range: {
				'min': [0],
				'max': [10]
			},
			format: {
				to: function (value) {
					return parseInt(value);
				},
				from: function (value) {
					return parseInt(value);
				}
			}
		});

		var limitFieldMinMeters = document.getElementById('meters-value-min');
		var limitFieldMaxMeters = document.getElementById('meters-value-max');

		lineSliderMeters.noUiSlider.on('update', function (values, handle) {
			(handle ? limitFieldMaxMeters : limitFieldMinMeters).innerHTML = values[handle];
		});
	};

	//===================================================================================================================

	const filter = document.querySelector('.filter');
	const filterLabels = filter.querySelectorAll('label');
	const filterChoice = filter.querySelector('.filter__choice');
	const filterButtons = filter.querySelectorAll('.filter__btn, .buttons-filter__wrap_reset');

	// Нумирация датаатрибутов data-filter
	const dataElements = filter.querySelectorAll('[data-filter]');
	for (let index = 0; index < dataElements.length; index++) {
		const dataElement = dataElements[index];
		dataElement.dataset.filter = [index];
	}

	// Отбор елементов из фльтра
	for (let index = 0; index < filterLabels.length; index++) {
		let filterLabel = filterLabels[index];
		const filterInput = filterLabel.querySelector('input');
		filterLabel.addEventListener('click', function (e) {
			if (e.target.closest('label').querySelector('[data-filter]') && filterChoice) {
				const filterCheck = e.target.closest('label').querySelector('[data-filter]');
				const filterCheckId = e.target.closest('label').querySelector('[data-filter]').dataset.filter;
				const filterCheckOuter = e.target.closest('label').querySelector('[data-filter]').outerHTML;
				const filterCheckTextParents = filterChoice.querySelectorAll('[data-filter-text]');
				if (filterInput.checked === true) {
					filterChoice.insertAdjacentHTML(
						'beforeend',
						`<div class="filter__selected" data-filter-text="${filterCheckId}">${filterCheckOuter}<div class="filter__close"><img src="img/icons/x.svg" alt="" /></div></div>`
					);

					closeFilterText(filterCheck);

				} else if (filterCheckId) {
					for (let index = 0; index < filterCheckTextParents.length; index++) {
						let filterCheckTextParent = filterCheckTextParents[index];
						if (filterCheckTextParent.dataset.filterText == filterCheckId) {
							filterCheckTextParent.remove();
						}
					}
				}
			}
		});
	};


	// закрывать из выбраных
	function closeFilterText(filterCheck) {
		const filterCloses = filter.querySelectorAll('.filter__close');
		for (let index = 0; index < filterCloses.length; index++) {
			let filterClose = filterCloses[index];
			filterClose.addEventListener('click', function (e) {
				if (e.target.closest('[data-filter-text]').getAttribute('data-filter-text') === filterCheck.getAttribute('data-filter')) {
					let filterLabel = filterCheck.closest('label');
					const filterInput = filterLabel.querySelector('input');
					if (filterInput.checked === true) {
						filterInput.checked = false;
						e.target.closest('[data-filter-text]').remove();
					}
				}
			});
		}
	};


	// Чистка, reset всех выбраных елементов
	for (let index = 0; index < filterButtons.length; index++) {
		const filterButton = filterButtons[index];
		filterButton.addEventListener('click', filterReset);
		function filterReset() {
			while (filterChoice.firstChild) {
				filterChoice.removeChild(filterChoice.firstChild);
			}
			const results = filter.querySelectorAll('._check-result');
			results.forEach(element => {
				element.innerHTML = "";
			});
		}
	}


	//===================================================================================================================
	// Отбор выделеных елементов для mobile
	let sectionFilter1 = document.querySelector('.section-filter_1');
	let sectionFilter2 = document.querySelector('.section-filter_2');
	let sectionFilter3 = document.querySelector('.section-filter_3');
	let sectionFilter4 = document.querySelector('.section-filter_4');
	let sectionFilter5 = document.querySelector('.section-filter_5');
	let sectionFilter6 = document.querySelector('.section-filter_6');
	let sectionFilter7 = document.querySelector('.section-filter_7');
	let sectionFilter8 = document.querySelector('.section-filter_8');
	let sectionFilter9 = document.querySelector('.section-filter_9');
	let sectionFilter10 = document.querySelector('.section-filter_10');
	let sectionFilter11 = document.querySelector('.section-filter_11');
	let sectionFilter12 = document.querySelector('.section-filter_12');
	let sectionFilter13 = document.querySelector('.section-filter_13');
	let sectionFilter14 = document.querySelector('.section-filter_14');
	if (sectionFilter1) {
		getNumberChecked(sectionFilter1);
		function getNumberChecked(sectionFilter) {
			const labels = sectionFilter.querySelectorAll('label');
			const inputs = sectionFilter.querySelectorAll('input');
			const result = sectionFilter.querySelector('._check-result');
			for (let index = 0; index < labels.length; index++) {
				const label = labels[index];
				const labelInput = label.querySelector('input');
				label.addEventListener('click', function (e) {
					if (e.target === labelInput) {
						var counter = 0;
						for (var i = 0; i < inputs.length; i++) {
							if (inputs[i].type == "checkbox") {
								if (inputs[i].checked) {
									counter++;
								}
							}
						}
						if (counter === 0) {
							result.innerHTML = "";
						} else {
							result.innerHTML = `(${counter})`;
						}
					}
				});
			}
		}
	};
	if (sectionFilter2) {
		getNumberChecked(sectionFilter2);
		function getNumberChecked(sectionFilter) {
			const labels = sectionFilter.querySelectorAll('label');
			const inputs = sectionFilter.querySelectorAll('input');
			const result = sectionFilter.querySelector('._check-result');
			for (let index = 0; index < labels.length; index++) {
				const label = labels[index];
				const labelInput = label.querySelector('input');
				label.addEventListener('click', function (e) {
					if (e.target === labelInput) {
						var counter = 0;
						for (var i = 0; i < inputs.length; i++) {
							if (inputs[i].type == "checkbox") {
								if (inputs[i].checked) {
									counter++;
								}
							}
						}
						if (counter === 0) {
							result.innerHTML = "";
						} else {
							result.innerHTML = `(${counter})`;
						}
					}
				});
			}
		}
	};
	if (sectionFilter3) {
		getNumberChecked(sectionFilter3);
		function getNumberChecked(sectionFilter) {
			const labels = sectionFilter.querySelectorAll('label');
			const inputs = sectionFilter.querySelectorAll('input');
			const result = sectionFilter.querySelector('._check-result');
			for (let index = 0; index < labels.length; index++) {
				const label = labels[index];
				const labelInput = label.querySelector('input');
				label.addEventListener('click', function (e) {
					if (e.target === labelInput) {
						var counter = 0;
						for (var i = 0; i < inputs.length; i++) {
							if (inputs[i].type == "checkbox") {
								if (inputs[i].checked) {
									counter++;
								}
							}
						}
						if (counter === 0) {
							result.innerHTML = "";
						} else {
							result.innerHTML = `(${counter})`;
						}
					}
				});
			}
		}
	};
	if (sectionFilter4) {
		getNumberChecked(sectionFilter4);
		function getNumberChecked(sectionFilter) {
			const labels = sectionFilter.querySelectorAll('label');
			const inputs = sectionFilter.querySelectorAll('input');
			const result = sectionFilter.querySelector('._check-result');
			for (let index = 0; index < labels.length; index++) {
				const label = labels[index];
				const labelInput = label.querySelector('input');
				label.addEventListener('click', function (e) {
					if (e.target === labelInput) {
						var counter = 0;
						for (var i = 0; i < inputs.length; i++) {
							if (inputs[i].type == "checkbox") {
								if (inputs[i].checked) {
									counter++;
								}
							}
						}
						if (counter === 0) {
							result.innerHTML = "";
						} else {
							result.innerHTML = `(${counter})`;
						}
					}
				});
			}
		}
	};
	if (sectionFilter5) {
		getNumberChecked(sectionFilter5);
		function getNumberChecked(sectionFilter) {
			const labels = sectionFilter.querySelectorAll('label');
			const inputs = sectionFilter.querySelectorAll('input');
			const result = sectionFilter.querySelector('._check-result');
			for (let index = 0; index < labels.length; index++) {
				const label = labels[index];
				const labelInput = label.querySelector('input');
				label.addEventListener('click', function (e) {
					if (e.target === labelInput) {
						var counter = 0;
						for (var i = 0; i < inputs.length; i++) {
							if (inputs[i].type == "checkbox") {
								if (inputs[i].checked) {
									counter++;
								}
							}
						}
						if (counter === 0) {
							result.innerHTML = "";
						} else {
							result.innerHTML = `(${counter})`;
						}
					}
				});
			}
		}
	};
	if (sectionFilter6) {
		getNumberChecked(sectionFilter6);
		function getNumberChecked(sectionFilter) {
			const labels = sectionFilter.querySelectorAll('label');
			const inputs = sectionFilter.querySelectorAll('input');
			const result = sectionFilter.querySelector('._check-result');
			for (let index = 0; index < labels.length; index++) {
				const label = labels[index];
				const labelInput = label.querySelector('input');
				label.addEventListener('click', function (e) {
					if (e.target === labelInput) {
						var counter = 0;
						for (var i = 0; i < inputs.length; i++) {
							if (inputs[i].type == "checkbox") {
								if (inputs[i].checked) {
									counter++;
								}
							}
						}
						if (counter === 0) {
							result.innerHTML = "";
						} else {
							result.innerHTML = `(${counter})`;
						}
					}
				});
			}
		}
	};
	if (sectionFilter7) {
		getNumberChecked(sectionFilter7);
		function getNumberChecked(sectionFilter) {
			const labels = sectionFilter.querySelectorAll('label');
			const inputs = sectionFilter.querySelectorAll('input');
			const result = sectionFilter.querySelector('._check-result');
			for (let index = 0; index < labels.length; index++) {
				const label = labels[index];
				const labelInput = label.querySelector('input');
				label.addEventListener('click', function (e) {
					if (e.target === labelInput) {
						var counter = 0;
						for (var i = 0; i < inputs.length; i++) {
							if (inputs[i].type == "checkbox") {
								if (inputs[i].checked) {
									counter++;
								}
							}
						}
						if (counter === 0) {
							result.innerHTML = "";
						} else {
							result.innerHTML = `(${counter})`;
						}
					}
				});
			}
		}
	};
	if (sectionFilter8) {
		getNumberChecked(sectionFilter8);
		function getNumberChecked(sectionFilter) {
			const labels = sectionFilter.querySelectorAll('label');
			const inputs = sectionFilter.querySelectorAll('input');
			const result = sectionFilter.querySelector('._check-result');
			for (let index = 0; index < labels.length; index++) {
				const label = labels[index];
				const labelInput = label.querySelector('input');
				label.addEventListener('click', function (e) {
					if (e.target === labelInput) {
						var counter = 0;
						for (var i = 0; i < inputs.length; i++) {
							if (inputs[i].type == "checkbox") {
								if (inputs[i].checked) {
									counter++;
								}
							}
						}
						if (counter === 0) {
							result.innerHTML = "";
						} else {
							result.innerHTML = `(${counter})`;
						}
					}
				});
			}
		}
	};
	if (sectionFilter9) {
		getNumberChecked(sectionFilter9);
		function getNumberChecked(sectionFilter) {
			const labels = sectionFilter.querySelectorAll('label');
			const inputs = sectionFilter.querySelectorAll('input');
			const result = sectionFilter.querySelector('._check-result');
			for (let index = 0; index < labels.length; index++) {
				const label = labels[index];
				const labelInput = label.querySelector('input');
				label.addEventListener('click', function (e) {
					if (e.target === labelInput) {
						var counter = 0;
						for (var i = 0; i < inputs.length; i++) {
							if (inputs[i].type == "checkbox") {
								if (inputs[i].checked) {
									counter++;
								}
							}
						}
						if (counter === 0) {
							result.innerHTML = "";
						} else {
							result.innerHTML = `(${counter})`;
						}
					}
				});
			}
		}
	};
	if (sectionFilter10) {
		getNumberChecked(sectionFilter10);
		function getNumberChecked(sectionFilter) {
			const labels = sectionFilter.querySelectorAll('label');
			const inputs = sectionFilter.querySelectorAll('input');
			const result = sectionFilter.querySelector('._check-result');
			for (let index = 0; index < labels.length; index++) {
				const label = labels[index];
				const labelInput = label.querySelector('input');
				label.addEventListener('click', function (e) {
					if (e.target === labelInput) {
						var counter = 0;
						for (var i = 0; i < inputs.length; i++) {
							if (inputs[i].type == "checkbox") {
								if (inputs[i].checked) {
									counter++;
								}
							}
						}
						if (counter === 0) {
							result.innerHTML = "";
						} else {
							result.innerHTML = `(${counter})`;
						}
					}
				});
			}
		}
	};
	if (sectionFilter11) {
		getNumberChecked(sectionFilter11);
		function getNumberChecked(sectionFilter) {
			const labels = sectionFilter.querySelectorAll('label');
			const inputs = sectionFilter.querySelectorAll('input');
			const result = sectionFilter.querySelector('._check-result');
			for (let index = 0; index < labels.length; index++) {
				const label = labels[index];
				const labelInput = label.querySelector('input');
				label.addEventListener('click', function (e) {
					if (e.target === labelInput) {
						var counter = 0;
						for (var i = 0; i < inputs.length; i++) {
							if (inputs[i].type == "checkbox") {
								if (inputs[i].checked) {
									counter++;
								}
							}
						}
						if (counter === 0) {
							result.innerHTML = "";
						} else {
							result.innerHTML = `(${counter})`;
						}
					}
				});
			}
		}
	};
	if (sectionFilter12) {
		getNumberChecked(sectionFilter12);
		function getNumberChecked(sectionFilter) {
			const labels = sectionFilter.querySelectorAll('label');
			const inputs = sectionFilter.querySelectorAll('input');
			const result = sectionFilter.querySelector('._check-result');
			for (let index = 0; index < labels.length; index++) {
				const label = labels[index];
				const labelInput = label.querySelector('input');
				label.addEventListener('click', function (e) {
					if (e.target === labelInput) {
						var counter = 0;
						for (var i = 0; i < inputs.length; i++) {
							if (inputs[i].type == "checkbox") {
								if (inputs[i].checked) {
									counter++;
								}
							}
						}
						if (counter === 0) {
							result.innerHTML = "";
						} else {
							result.innerHTML = `(${counter})`;
						}
					}
				});
			}
		}
	};
	if (sectionFilter13) {
		getNumberChecked(sectionFilter13);
		function getNumberChecked(sectionFilter) {
			const labels = sectionFilter.querySelectorAll('label');
			const inputs = sectionFilter.querySelectorAll('input');
			const result = sectionFilter.querySelector('._check-result');
			for (let index = 0; index < labels.length; index++) {
				const label = labels[index];
				const labelInput = label.querySelector('input');
				label.addEventListener('click', function (e) {
					if (e.target === labelInput) {
						var counter = 0;
						for (var i = 0; i < inputs.length; i++) {
							if (inputs[i].type == "checkbox") {
								if (inputs[i].checked) {
									counter++;
								}
							}
						}
						if (counter === 0) {
							result.innerHTML = "";
						} else {
							result.innerHTML = `(${counter})`;
						}
					}
				});
			}
		}
	};
	if (sectionFilter14) {
		getNumberChecked(sectionFilter14);
		function getNumberChecked(sectionFilter) {
			const labels = sectionFilter.querySelectorAll('label');
			const inputs = sectionFilter.querySelectorAll('input');
			const result = sectionFilter.querySelector('._check-result');
			for (let index = 0; index < labels.length; index++) {
				const label = labels[index];
				const labelInput = label.querySelector('input');
				label.addEventListener('click', function (e) {
					if (e.target === labelInput) {
						var counter = 0;
						for (var i = 0; i < inputs.length; i++) {
							if (inputs[i].type == "checkbox") {
								if (inputs[i].checked) {
									counter++;
								}
							}
						}
						if (counter === 0) {
							result.innerHTML = "";
						} else {
							result.innerHTML = `(${counter})`;
						}
					}
				});
			}
		}
	};

	//===================================================================================================================

	document.addEventListener("click", documentActions);
	// делегирования события клик
	let filterMobile = document.querySelector('.aside-catalog__filter')
	function documentActions(e) {
		const targetElement = e.target;

		if (targetElement.closest('.top-catalog__sorting')) {
			targetElement.closest('.top-catalog__sorting').classList.toggle('_active');
		};
		if (!targetElement.closest('.top-catalog__sorting') && document.querySelectorAll('.top-catalog__sorting._active').length > 0) {
			_removeClasses(document.querySelectorAll('.top-catalog__sorting._active'), "_active");
		};
		if (targetElement.closest('.top-catalog__filters')) {
			filterMobile.classList.add('_active');
		} else if (targetElement.closest('.top-filter__close')) {
			filterMobile.classList.remove('_active');
		};

		if (targetElement.closest('.content-catalog__btn')) {
			let targetElementButton = targetElement.closest('.content-catalog__btn');
			getProducts(targetElementButton);
			e.preventDefault();
		}
		if (targetElement.closest('.kitchen-examples__btn')) {
			let targetElementButton = targetElement.closest('.kitchen-examples__btn');
			getKitchen(targetElementButton);
			e.preventDefault();
		}
	}

	// load More Products
	async function getProducts(button) {
		if (!button.classList.contains('_hold')) {
			button.classList.add('_hold');
			const file = "json/products.json";
			let response = await fetch(file, {
				method: "GET"
			});
			if (response.ok) {
				let result = await response.json();
				loadProducts(result);
				button.classList.remove('_hold');
				button.remove();
			} else {
				alert("Ошибка");
			}
		}
	}

	// load More kitchen
	async function getKitchen(button) {
		if (!button.classList.contains('_hold')) {
			button.classList.add('_hold');
			const file = "json/kitchen.json";
			let response = await fetch(file, {
				method: "GET"
			});
			if (response.ok) {
				let result = await response.json();
				loadKitchen(result, button);
				button.classList.remove('_hold');
				button.remove();
				updateSwiper();
			} else {
				alert("Ошибка");
			}
		}
	}

	function loadProducts(data) {
		const productsItems = document.querySelector('.content-catalog__row');
		data.products.forEach(item => {
			const productId = item.id;
			const productUrl = item.url;
			const productImage = item.image;
			const productTitle = item.title;
			const productText = item.text;
			const productPrice = item.price;
			const productOldPrice = item.priceOld;
			const productShareUrl = item.shareUrl;
			const productLikeUrl = item.likeUrl;
			const productLabels = item.labels;

			let productTemplateStart = `<div data-pid="${productId}" class="content-catalog__item item-catalog">`;
			let productTemplateEnd = `</div>`;

			// let productTemplateLabels = '';
			// if (productLabels) {
			// 	let productTemplateLabelsStart = `<div class="item-product__labels">`;
			// 	let productTemplateLabelsEnd = `</div>`;
			// 	let productTemplateLabelsContent = '';

			// 	productLabels.forEach(labelItem => {
			// 		productTemplateLabelsContent += `<div class="item-product__label item-product__label_${labelItem.type}">${labelItem.value}</div>`;
			// 	});

			// 	productTemplateLabels += productTemplateLabelsStart;
			// 	productTemplateLabels += productTemplateLabelsContent;
			// 	productTemplateLabels += productTemplateLabelsEnd;
			// }

			let productTemplateImage = `
		<a href="${productUrl}" class="item-catalog__image _ibg">
			<img src="img/content/catalog/${productImage}" alt="${productTitle}" />
		</a>
	`;

			let productTemplateBodyStart = `<div class="item-catalog__line">`;
			let productTemplateBodyEnd = `</div>`;

			let productTemplateContent = `
		<a href="" class="item-catalog__title">${productTitle}</a>
	`;

			// let productTemplatePrices = '';
			// let productTemplatePricesStart = `<div class="item-product__prices">`;
			// let productTemplatePricesCurrent = `<div class="item-product__price">Rp ${productPrice}</div>`;
			// let productTemplatePricesOld = `<div class="item-product__price item-product__price_old">Rp ${productOldPrice}</div>`;
			// let productTemplatePricesEnd = `</div>`;

			// productTemplatePrices = productTemplatePricesStart;
			// productTemplatePrices += productTemplatePricesCurrent;
			// if (productOldPrice) {
			// 	productTemplatePrices += productTemplatePricesOld;
			// }
			// productTemplatePrices += productTemplatePricesEnd;

			// 		let productTemplateActions = `
			// 	<div class="item-product__actions actions-product">
			// 		<div class="actions-product__body">
			// 			<a href="" class="actions-product__button btn btn_white">Add to cart</a>
			// 			<a href="${productShareUrl}" class="actions-product__link _icon-share">Share</a>
			// 			<a href="${productLikeUrl}" class="actions-product__link _icon-favorite">Like</a>
			// 		</div>
			// 	</div>
			// `;

			let productTemplateBody = '';
			productTemplateBody += productTemplateBodyStart;
			productTemplateBody += productTemplateContent;
			// productTemplateBody += productTemplatePrices;
			// productTemplateBody += productTemplateActions;
			productTemplateBody += productTemplateBodyEnd;

			let productTemplate = '';
			productTemplate += productTemplateStart;
			// productTemplate += productTemplateLabels;
			productTemplate += productTemplateImage;
			productTemplate += productTemplateBody;
			productTemplate += productTemplateEnd;

			productsItems.insertAdjacentHTML(
				'beforeend',
				`<div class="content-catalog__column">${productTemplate}</div>`
			);

		});
	}

	/*----------------------------------------*/

	function loadKitchen(data, button) {
		const buttonParent = button.closest('.kitchen-examples');
		const productsItems = buttonParent.querySelector('.kitchen-examples__row');
		data.kitchen.forEach(item => {
			const productId = item.id;
			const productSlides = item.slides;

			let productTemplateStart = `<div class="kitchen-examples__item item-kitchen" data-pid="${productId}">
<div class="item-kitchen__slider swiper-container"><div class="item-kitchen__wrapper swiper-wrapper">
			`;



			let productTemplateEnd = `</div><div class="item-kitchen__pagination">
			</div>
			</div><div class="item-kitchen__tabs _sub-tabs">
													<nav class="item-kitchen__nav">
														<div class="item-kitchen__item _sub-tabs-item _active">Эконом</div>
														<div class="item-kitchen__item _sub-tabs-item">Стандарт</div>
														<div class="item-kitchen__item _sub-tabs-item">Престиж</div>
														<div class="item-kitchen__item _sub-tabs-item">Премиум</div>
													</nav>
													<div class="item-kitchen__body">
														<div class="item-kitchen__block _sub-tabs-block _active">
															<div class="item-kitchen__bottom">
																<span>Размер</span>
																<span>Стоимость</span>
															</div>
															<div class="item-kitchen__bottom">
																<div class="item-kitchen__text">2300 x 3000 мм</div>
																<div class="item-kitchen__price">110 000 ₽</div>
															</div>
														</div>
														<div class="item-kitchen__block _sub-tabs-block">
															<div class="item-kitchen__bottom">
																<span>Размер</span>
																<span>Стоимость</span>
															</div>
															<div class="item-kitchen__bottom">
																<div class="item-kitchen__text">2000 x 2500 мм</div>
																<div class="item-kitchen__price">95 000 ₽</div>
															</div>
														</div>
														<div class="item-kitchen__block _sub-tabs-block">
															<div class="item-kitchen__bottom">
																<span>Размер</span>
																<span>Стоимость</span>
															</div>
															<div class="item-kitchen__bottom">
																<div class="item-kitchen__text">1000 x 2200 мм</div>
																<div class="item-kitchen__price">35 000 ₽</div>
															</div>
														</div>
														<div class="item-kitchen__block _sub-tabs-block">
															<div class="item-kitchen__bottom">
																<span>Размер</span>
																<span>Стоимость</span>
															</div>
															<div class="item-kitchen__bottom">
																<div class="item-kitchen__text">1500 x 2000 мм</div>
																<div class="item-kitchen__price">100 000 ₽</div>
															</div>
														</div>
													</div>
												</div>
												</div>`;

			let productTemplateSlides = '';

			productSlides.forEach(function (slideItem, index) {
				let slideItemIndex = index;
				let productTemplateSlideStart = `<div class="item-kitchen__slide swiper-slide">`;
				let productTemplateSlideContent = '';
				let productTemplateSlideEnd = `</div>`;

				let productTemplateImage = `
				<a href="${slideItem.url}" class="item-kitchen__image _ibg">
					<img src="img/content/examples/${slideItem.image}" alt="${slideItem.title}" />
				</a>`;

				productTemplateSlideContent += productTemplateImage;

				if (slideItemIndex === 0) {
					let productTemplateBody = '';
					let productTemplateBodyStart = `<div class="item-kitchen__line">`;
					let productTemplateContent = `<a href="" class="item-kitchen__title">${slideItem.title}</a>`;
					let productTemplateBodyEnd = `</div>`;
					productTemplateBody += productTemplateBodyStart;
					productTemplateBody += productTemplateContent;
					productTemplateBody += productTemplateBodyEnd;
					productTemplateSlideContent += productTemplateBody;
				} else if (slideItemIndex === 1) {
					let productTemplateBody = '';
					let productTemplateBodyStart = `<div class="item-kitchen__line item-kitchen__line_mini">`;
					let productTemplateContent = `<a href="" class="item-kitchen__subject"><span>${slideItem.subject}</span></a>`;
					let productTemplateBodyEnd = `</div>`;
					productTemplateBody += productTemplateBodyStart;
					productTemplateBody += productTemplateContent;
					productTemplateBody += productTemplateBodyEnd;
					productTemplateSlideContent += productTemplateBody;

				} else if (slideItemIndex === 2) {
					let productTemplateBody = '';
					let productTemplateBodyStart = `<div class="item-kitchen__line">`;
					let productTemplateContent = `<a href="" class="item-kitchen__title">${slideItem.title}</a>`;
					let productTemplateBodyEnd = `</div>`;
					productTemplateBody += productTemplateBodyStart;
					productTemplateBody += productTemplateContent;
					productTemplateBody += productTemplateBodyEnd;
					productTemplateSlideContent += productTemplateBody;
				} else if (slideItemIndex === 3) {
					let productTemplateBody = '';
					let productTemplateBodyStart = `<div class="item-kitchen__line item-kitchen__line_mini">`;
					let productTemplateContent = `<a href="" class="item-kitchen__subject"><span>${slideItem.subject}</span></a>`;
					let productTemplateBodyEnd = `</div>`;
					productTemplateBody += productTemplateBodyStart;
					productTemplateBody += productTemplateContent;
					productTemplateBody += productTemplateBodyEnd;
					productTemplateSlideContent += productTemplateBody;
				}

				productTemplateSlides += productTemplateSlideStart;
				productTemplateSlides += productTemplateSlideContent;
				productTemplateSlides += productTemplateSlideEnd;
			});


			let productTemplate = '';
			productTemplate += productTemplateStart;
			productTemplate += productTemplateSlides;
			productTemplate += productTemplateEnd;

			productsItems.insertAdjacentHTML(
				'beforeend',
				`<div class="kitchen-examples__column">${productTemplate}</div>`
			);
		});
	}
	//===================================================================================================================


	const syncHovers = document.querySelectorAll('[data-sync-hover]');
	const syncElements = document.querySelectorAll('[data-sync-element]');
	const documentItemHolders = document.querySelectorAll('.item-holder');
	const itemHolderBottons = document.querySelectorAll('.item-holder__btn, .item-holder__close');

	getHoverObjects();
	showSubMenu();
	closeSubMenu()
	window.addEventListener('resize', function (event) {
		getHoverObjects();
		showSubMenu();
		closeSubMenu()
	});

	function getHoverObjects() {
		for (let index = 0; index < syncHovers.length; index++) {
			const syncHover = syncHovers[index];
			syncHover.addEventListener('mouseenter', function (e) {
				if (syncHover.dataset.syncHover && document.documentElement.clientWidth > 991.98) {
					for (let index = 0; index < syncElements.length; index++) {
						const syncElement = syncElements[index];
						syncElement.classList.remove('_active');
					}
					for (let index = 0; index < syncElements.length; index++) {
						const syncElement = syncElements[index];
						if (syncHover.dataset.syncHover === syncElement.dataset.syncElement) {
							syncElement.classList.add('_active');
						}
					}
				}
			});
			syncHover.addEventListener('mouseleave', function (e) {
				for (let index = 0; index < syncElements.length; index++) {
					const syncElement = syncElements[index];
					syncElement.classList.remove('_active');
				}
			});
		}
		for (let index = 0; index < syncElements.length; index++) {
			const syncElement = syncElements[index];
			syncElement.addEventListener('mouseenter', function (e) {
				if (syncElement.dataset.syncElement && document.documentElement.clientWidth > 991.98) {
					for (let index = 0; index < syncElements.length; index++) {
						const syncElement = syncElements[index];
						syncElement.classList.remove('_active');
					}
					for (let index = 0; index < syncElements.length; index++) {
						const syncElement = syncElements[index];
						if (syncElement.dataset.syncElement === e.target.dataset.syncElement) {
							syncElement.classList.add('_active');
						}
					}
				}
			});
			syncElement.addEventListener('mouseleave', function (e) {
				for (let index = 0; index < syncElements.length; index++) {
					const syncElement = syncElements[index];
					syncElement.classList.remove('_active');
				}
			});
		}
	}


	function showSubMenu() {
		if (document.documentElement.clientWidth > 991.98) {
			for (let index = 0; index < syncHovers.length; index++) {
				const syncHover = syncHovers[index];
				syncHover.addEventListener('click', function (e) {
					const parentElement = e.target.closest('[data-sync-hover]');
					const itemHolder = parentElement.querySelector('.item-holder');
					if (itemHolder) {
						const holderPeculiarities = itemHolder.closest('.holder-peculiarities');
						const peculiaritiesSubject = parentElement.querySelector('.peculiarities__subject');
						if (parentElement.dataset.syncHover) {
							if (itemHolder.classList.contains('_active')) {
								if (!e.target.closest('.item-holder')) {
									holderPeculiarities.classList.remove('_active');
									itemHolder.classList.remove('_active');
									peculiaritiesSubject.classList.remove('_active-underline');
								}
							} else {
								for (let index = 0; index < documentItemHolders.length; index++) {
									const documentItemHolder = documentItemHolders[index];
									documentItemHolder.classList.remove('_active');
									const parentDocumentItemHolder = documentItemHolder.closest('[data-sync-hover]');
									parentDocumentItemHolder.querySelector('.peculiarities__subject').classList.remove('_active-underline');
									const holderPeculiarities = documentItemHolder.closest('.holder-peculiarities');
									holderPeculiarities.classList.remove('_active');
								}
								if (!e.target.closest('.item-holder')) {
									itemHolder.classList.add('_active');
									peculiaritiesSubject.classList.add('_active-underline');
									holderPeculiarities.classList.add('_active');
								}
							}
						}
					}
				});
			}

			for (let index = 0; index < syncElements.length; index++) {
				const syncElement = syncElements[index];
				syncElement.addEventListener('click', function (e) {
					let dataSyncElement = e.target.closest('[data-sync-element]');
					let dataSyncHovers = document.querySelectorAll('[data-sync-hover]');
					for (let index = 0; index < dataSyncHovers.length; index++) {
						const dataSyncHover = dataSyncHovers[index];
						if (dataSyncElement.dataset.syncElement === dataSyncHover.dataset.syncHover) {
							const itemHolder = dataSyncHover.querySelector('.item-holder');
							if (itemHolder) {
								const peculiaritiesSubject = dataSyncHover.querySelector('.peculiarities__subject');
								if (itemHolder.classList.contains('_active')) {
									itemHolder.classList.remove('_active');
									peculiaritiesSubject.classList.remove('_active-underline');
								} else {
									for (let index = 0; index < documentItemHolders.length; index++) {
										const documentItemHolder = documentItemHolders[index];
										documentItemHolder.classList.remove('_active');
										const parentDocumentItemHolder = documentItemHolder.closest('[data-sync-hover]');
										parentDocumentItemHolder.querySelector('.peculiarities__subject').classList.remove('_active-underline');
									}
									itemHolder.classList.add('_active');
									peculiaritiesSubject.classList.add('_active-underline');
									const holderPeculiarities = itemHolder.closest('.holder-peculiarities');
									if (holderPeculiarities) {
										holderPeculiarities.classList.add('_active');
									}
								}
							}
						}
					}
				});
			}
		}
	}


	function closeSubMenu() {
		if (document.documentElement.clientWidth > 991.98) {
			for (let index = 0; index < itemHolderBottons.length; index++) {
				const itemHolderBotton = itemHolderBottons[index];
				itemHolderBotton.addEventListener('click', function (e) {
					let btnHolder = e.target.closest('.item-holder__btn');
					let closeHolder = e.target.closest('.item-holder__close');
					if (btnHolder || closeHolder) {
						for (let index = 0; index < documentItemHolders.length; index++) {
							const documentItemHolder = documentItemHolders[index];
							documentItemHolder.classList.remove('_active');
							const parentDocumentItemHolder = documentItemHolder.closest('[data-sync-hover]');
							parentDocumentItemHolder.querySelector('.peculiarities__subject').classList.remove('_active-underline');
							const holderPeculiarities = documentItemHolder.closest('.holder-peculiarities');
							holderPeculiarities.classList.remove('_active');
						}
					}
				});
			}
		}
	}
}

//===================================================================================================================


function ibgi() {
	let ibgi = document.querySelector("._ibgi");
	if (ibgi.querySelector('img') && ibgi.querySelector('img').getAttribute('src') != null) {
		const ibgiParent = ibgi.closest('.main');
		ibgiParent.style.backgroundImage = 'url(' + ibgi.querySelector('img').getAttribute('src') + ')';
		ibgiParent.classList.add('_bg');
	}
}
ibgi();

//============================================================================================================

var ua = window.navigator.userAgent;
var msie = ua.indexOf("MSIE");

var isMobile = {
	Android: function () {
		return navigator.userAgent.match(/Android/i);
	},
	BlackBerry: function () {
		return navigator.userAgent.match(/BlackBerry/i);
	},
	iOS: function () {
		return navigator.userAgent.match(/iPhone|iPad|iPod/i);
	},
	Opera: function () {
		return navigator.userAgent.match(/Opera Mini/i);
	},
	Windows: function () {
		return navigator.userAgent.match(/IEMobile/i);
	},
	any: function () {
		return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
	}
};

function isIE() {
	ua = navigator.userAgent;
	var is_ie = ua.indexOf("MSIE ") > -1 || ua.indexOf("Trident/") > -1;
	return is_ie;
}

if (isIE()) {
	document.querySelector('html').classList.add('ie');
}

if (isMobile.any()) {
	document.querySelector('html').classList.add('_touch');
}

//======================

//testWebp
function testWebP(callback) {
	var webP = new Image();
	webP.onload = webP.onerror = function () {
		callback(webP.height == 2);
	};
	webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
}

testWebP(function (support) {
	if (support === true) {
		document.querySelector('html').classList.add('_webp');
	} else {
		document.querySelector('html').classList.add('_no-webp');
	}
});

//======================

//_ibg
function ibg() {
	if (isIE()) {
		let ibg = document.querySelectorAll("._ibg");
		for (var i = 0; i < ibg.length; i++) {
			if (ibg[i].querySelector('img') && ibg[i].querySelector('img').getAttribute('src') != null) {
				ibg[i].style.backgroundImage = 'url(' + ibg[i].querySelector('img').getAttribute('src') + ')';
			}
		}
	}
}
ibg();

//======================

//wrapper_loaded
window.addEventListener("load", function () {
	if (document.querySelector('.wrapper')) {
		setTimeout(function () {
			document.querySelector('.wrapper').classList.add('_loaded');
		}, 0);
	}
});

let unlock = true;

//=====================

//Menu
let iconMenu = document.querySelector(".icon-header");
if (iconMenu != null) {
	let delay = 200;
	let menuBody = document.querySelector(".menu-header");
	iconMenu.addEventListener("click", function (e) {
		if (unlock) {
			body_lock(delay);
			iconMenu.classList.toggle("_active");
			menuBody.classList.toggle("_active");
		}
	});
};

//=====================

//BodyLock
function body_lock(delay) {
	let body = document.querySelector("body");
	if (body.classList.contains('_lock')) {
		body_lock_remove(delay);
	} else {
		body_lock_add(delay);
	}
}
function body_lock_remove(delay) {
	let body = document.querySelector("body");
	if (unlock) {
		let lock_padding = document.querySelectorAll("._lp");
		setTimeout(() => {
			for (let index = 0; index < lock_padding.length; index++) {
				const el = lock_padding[index];
				el.style.paddingRight = '0px';
			}
			body.style.paddingRight = '0px';
			body.classList.remove("_lock");
		}, delay);

		unlock = false;
		setTimeout(function () {
			unlock = true;
		}, delay);
	}
}
function body_lock_add(delay) {
	let body = document.querySelector("body");
	if (unlock) {
		let lock_padding = document.querySelectorAll("._lp");
		for (let index = 0; index < lock_padding.length; index++) {
			const el = lock_padding[index];
			el.style.paddingRight = window.innerWidth - document.querySelector('.wrapper').offsetWidth + 'px';
		}
		body.style.paddingRight = window.innerWidth - document.querySelector('.wrapper').offsetWidth + 'px';
		body.classList.add("_lock");

		unlock = false;
		setTimeout(function () {
			unlock = true;
		}, delay);
	}
}

//=====================

//Tabs
let tabs = document.querySelectorAll("._tabs");
for (let index = 0; index < tabs.length; index++) {
	let tab = tabs[index];
	let tabs_items = tab.querySelectorAll("._tabs-item");
	let tabs_blocks = tab.querySelectorAll("._tabs-block");
	for (let index = 0; index < tabs_items.length; index++) {
		let tabs_item = tabs_items[index];
		tabs_item.addEventListener("click", function (e) {
			for (let index = 0; index < tabs_items.length; index++) {
				let tabs_item = tabs_items[index];
				tabs_item.classList.remove('_active');
				tabs_blocks[index].classList.remove('_active');
			}
			tabs_item.classList.add('_active');
			tabs_blocks[index].classList.add('_active');
			e.preventDefault();
		});
	}
}


//sub-Tabs
let subTabs = document.querySelectorAll("._sub-tabs");
for (let index = 0; index < subTabs.length; index++) {
	let subTab = subTabs[index];
	let subTabs_items = subTab.querySelectorAll("._sub-tabs-item");
	let subTabs_blocks = subTab.querySelectorAll("._sub-tabs-block");
	for (let index = 0; index < subTabs_items.length; index++) {
		let subTabs_item = subTabs_items[index];
		subTabs_item.addEventListener("click", function (e) {
			for (let index = 0; index < subTabs_items.length; index++) {
				let subTabs_item = subTabs_items[index];
				subTabs_item.classList.remove('_active');
				subTabs_blocks[index].classList.remove('_active');
			}
			subTabs_item.classList.add('_active');
			subTabs_blocks[index].classList.add('_active');
			e.preventDefault();
		});
	}
}

//=====================

//* Spollers custom
const spollersArray = document.querySelectorAll('[data-spollers]');
if (spollersArray.length > 0) {
	// Получение обычных слойлеров
	const spollersRegular = Array.from(spollersArray).filter(function (item, index, self) {
		return !item.dataset.spollers.split(",")[0];
	});
	// Инициализация обычных слойлеров
	if (spollersRegular.length > 0) {
		initSpollers(spollersRegular);
	}

	// Получение слойлеров с медиа запросами
	const spollersMedia = Array.from(spollersArray).filter(function (item, index, self) {
		return item.dataset.spollers.split(",")[0];
	});

	// Инициализация слойлеров с медиа запросами
	if (spollersMedia.length > 0) {
		const breakpointsArray = [];
		spollersMedia.forEach(item => {
			const params = item.dataset.spollers;
			const breakpoint = {};
			const paramsArray = params.split(",");
			breakpoint.value = paramsArray[0];
			breakpoint.type = paramsArray[1] ? paramsArray[1].trim() : "max";
			breakpoint.item = item;
			breakpointsArray.push(breakpoint);
		});

		// Получаем уникальные брейкпоинты
		let mediaQueries = breakpointsArray.map(function (item) {
			return '(' + item.type + "-width: " + item.value + "px)," + item.value + ',' + item.type;
		});
		mediaQueries = mediaQueries.filter(function (item, index, self) {
			return self.indexOf(item) === index;
		});

		// Работаем с каждым брейкпоинтом
		mediaQueries.forEach(breakpoint => {
			const paramsArray = breakpoint.split(",");
			const mediaBreakpoint = paramsArray[1];
			const mediaType = paramsArray[2];
			const matchMedia = window.matchMedia(paramsArray[0]);

			// Объекты с нужными условиями
			const spollersArray = breakpointsArray.filter(function (item) {
				if (item.value === mediaBreakpoint && item.type === mediaType) {
					return true;
				}
			});
			// Событие
			matchMedia.addListener(function () {
				initSpollers(spollersArray, matchMedia);
			});
			initSpollers(spollersArray, matchMedia);
		});
	}
	// Инициализация
	function initSpollers(spollersArray, matchMedia = false) {
		spollersArray.forEach(spollersBlock => {
			spollersBlock = matchMedia ? spollersBlock.item : spollersBlock;
			if (matchMedia.matches || !matchMedia) {
				spollersBlock.classList.add('_init');
				initSpollerBody(spollersBlock);
				spollersBlock.addEventListener("click", setSpollerAction);
			} else {
				spollersBlock.classList.remove('_init');
				initSpollerBody(spollersBlock, false);
				spollersBlock.removeEventListener("click", setSpollerAction);
			}
		});
	}
	// Работа с контентом
	function initSpollerBody(spollersBlock, hideSpollerBody = true) {
		const spollerTitles = spollersBlock.querySelectorAll('[data-spoller]');
		if (spollerTitles.length > 0) {
			spollerTitles.forEach(spollerTitle => {
				if (hideSpollerBody) {
					spollerTitle.removeAttribute('tabindex');
					if (!spollerTitle.classList.contains('_active')) {
						spollerTitle.nextElementSibling.hidden = true;
					}
				} else {
					spollerTitle.setAttribute('tabindex', '-1');
					spollerTitle.nextElementSibling.hidden = false;
				}
			});
		}
	}
	function setSpollerAction(e) {
		const el = e.target;
		if (el.hasAttribute('data-spoller') || el.closest('[data-spoller]')) {
			const spollerTitle = el.hasAttribute('data-spoller') ? el : el.closest('[data-spoller]');
			const spollersBlock = spollerTitle.closest('[data-spollers]');
			const oneSpoller = spollersBlock.hasAttribute('data-one-spoller') ? true : false;
			if (!spollersBlock.querySelectorAll('._slide').length) {
				if (oneSpoller && !spollerTitle.classList.contains('_active')) {
					hideSpollersBody(spollersBlock);
				}
				spollerTitle.classList.toggle('_active');
				_slideToggle(spollerTitle.nextElementSibling, 500);
			}
			e.preventDefault();
		}
	}
	function hideSpollersBody(spollersBlock) {
		const spollerActiveTitle = spollersBlock.querySelector('[data-spoller]._active');
		if (spollerActiveTitle) {
			spollerActiveTitle.classList.remove('_active');
			_slideUp(spollerActiveTitle.nextElementSibling, 500);
		}
	}
}

//=====================

//* SlideToggle custom
// Анимирует скрытие
let _slideUp = (target, duration = 500) => {
	if (!target.classList.contains('_slide')) {
		target.classList.add('_slide');
		target.style.transitionProperty = 'height, margin, padding';
		target.style.transitionDuration = duration + 'ms';
		target.style.height = target.offsetHeight + 'px';
		target.offsetHeight;
		target.style.overflow = 'hidden';
		target.style.height = 0;
		target.style.paddingTop = 0;
		target.style.paddingBottom = 0;
		target.style.marginTop = 0;
		target.style.marginBottom = 0;
		window.setTimeout(() => {
			target.hidden = true;
			target.style.removeProperty('height');
			target.style.removeProperty('padding-top');
			target.style.removeProperty('padding-bottom');
			target.style.removeProperty('margin-top');
			target.style.removeProperty('margin-bottom');
			target.style.removeProperty('overflow');
			target.style.removeProperty('transition-duration');
			target.style.removeProperty('transition-property');
			target.classList.remove('_slide');
		}, duration);
	}
}
// Анимирует показ
let _slideDown = (target, duration = 500) => {
	if (!target.classList.contains('_slide')) {
		target.classList.add('_slide');
		if (target.hidden) {
			target.hidden = false;
		}
		let height = target.offsetHeight;
		target.style.overflow = 'hidden';
		target.style.height = 0;
		target.style.paddingTop = 0;
		target.style.paddingBottom = 0;
		target.style.marginTop = 0;
		target.style.marginBottom = 0;
		target.offsetHeight;
		target.style.transitionProperty = "height, margin, padding";
		target.style.transitionDuration = duration + 'ms';
		target.style.height = height + 'px';
		target.style.removeProperty('padding-top');
		target.style.removeProperty('padding-bottom');
		target.style.removeProperty('margin-top');
		target.style.removeProperty('margin-bottom');
		window.setTimeout(() => {
			target.style.removeProperty('height');
			target.style.removeProperty('overflow');
			target.style.removeProperty('transition-duration');
			target.style.removeProperty('transition-property');
			target.classList.remove('_slide');
		}, duration);
	}
}
// Комдинация двох функций
let _slideToggle = (target, duration = 500) => {
	if (target.hidden) {
		return _slideDown(target, duration);
	} else {
		return _slideUp(target, duration);
	}
}


//=====================

//RemoveClasses
function _removeClasses(el, class_name) {
	for (var i = 0; i < el.length; i++) {
		el[i].classList.remove(class_name);
	}
}

//=====================

//IsHidden
function _is_hidden(el) {
	return (el.offsetParent === null)
}

//=====================

//Полифилы
(function () {
	// проверяем поддержку
	if (!Element.prototype.closest) {
		// реализуем
		Element.prototype.closest = function (css) {
			var node = this;
			while (node) {
				if (node.matches(css)) return node;
				else node = node.parentElement;
			}
			return null;
		};
	}
})();
(function () {
	// проверяем поддержку
	if (!Element.prototype.matches) {
		// определяем свойство
		Element.prototype.matches = Element.prototype.matchesSelector ||
			Element.prototype.webkitMatchesSelector ||
			Element.prototype.mozMatchesSelector ||
			Element.prototype.msMatchesSelector;
	}
})();
//let btn = document.querySelectorAll('button[type="submit"],input[type="submit"]');
let forms = document.querySelectorAll('form');
if (forms.length > 0) {
	for (let index = 0; index < forms.length; index++) {
		const el = forms[index];
		el.addEventListener('submit', form_submit);
	}
}
async function form_submit(e) {
	let btn = e.target;
	let form = btn.closest('form');
	let error = form_validate(form);
	if (error == 0) {
		let formAction = form.getAttribute('action') ? form.getAttribute('action').trim() : '#';
		let formMethod = form.getAttribute('method') ? form.getAttribute('method').trim() : 'GET';
		const message = form.getAttribute('data-message');
		const ajax = form.getAttribute('data-ajax');
		const test = form.getAttribute('data-test');

		//SendForm
		if (ajax) {
			e.preventDefault();
			let formData = new FormData(form);
			form.classList.add('_sending');
			let response = await fetch(formAction, {
				method: formMethod,
				body: formData
			});
			if (response.ok) {
				let result = await response.json();
				form.classList.remove('_sending');
				if (message) {
					popup_open(message + '-message');
				}
				form_clean(form);
			} else {
				alert("Ошибка");
				form.classList.remove('_sending');
			}
		}
		// If test
		if (test) {
			e.preventDefault();
			popup_open(message + '-message');
			form_clean(form);
		}
	} else {
		let form_error = form.querySelectorAll('._error');
		if (form_error && form.classList.contains('_goto-error')) {
			_goto(form_error[0], 1000, 50);
		}
		e.preventDefault();
	}
}
function form_validate(form) {
	let error = 0;
	let form_req = form.querySelectorAll('._req');
	if (form_req.length > 0) {
		for (let index = 0; index < form_req.length; index++) {
			const el = form_req[index];
			if (!_is_hidden(el)) {
				error += form_validate_input(el);
			}
		}
	}
	return error;
}
function form_validate_input(input) {
	let error = 0;
	let input_g_value = input.getAttribute('data-value');

	if (input.getAttribute("name") == "email" || input.classList.contains("_email")) {
		if (input.value != input_g_value) {
			let em = input.value.replace(" ", "");
			input.value = em;
		}
		if (email_test(input) || input.value == input_g_value) {
			form_add_error(input);
			error++;
		} else {
			form_remove_error(input);
		}
	} else if (input.getAttribute("type") == "checkbox" && input.checked == false) {
		form_add_error(input);
		error++;
	} else {
		if (input.value == '' || input.value == input_g_value) {
			form_add_error(input);
			error++;
		} else {
			form_remove_error(input);
		}
	}
	return error;
}
function form_add_error(input) {
	input.classList.add('_error');
	input.parentElement.classList.add('_error');

	let input_error = input.parentElement.querySelector('.form__error');
	if (input_error) {
		input.parentElement.removeChild(input_error);
	}
	let input_error_text = input.getAttribute('data-error');
	if (input_error_text && input_error_text != '') {
		input.parentElement.insertAdjacentHTML('beforeend', '<div class="form__error">' + input_error_text + '</div>');
	}
}
function form_remove_error(input) {
	input.classList.remove('_error');
	input.parentElement.classList.remove('_error');

	let input_error = input.parentElement.querySelector('.form__error');
	if (input_error) {
		input.parentElement.removeChild(input_error);
	}
}
//* можно без но ето чистка валидации
//* Не отключится червоний бордер
function form_clean(form) {
	let inputs = form.querySelectorAll('input,textarea');
	for (let index = 0; index < inputs.length; index++) {
		const el = inputs[index];
		el.parentElement.classList.remove('_focus');
		el.classList.remove('_focus');
		el.value = el.getAttribute('data-value');
	}
	let checkboxes = form.querySelectorAll('.checkbox__input');
	if (checkboxes.length > 0) {
		for (let index = 0; index < checkboxes.length; index++) {
			const checkbox = checkboxes[index];
			checkbox.checked = false;
		}
	}
	let selects = form.querySelectorAll('select');
	if (selects.length > 0) {
		for (let index = 0; index < selects.length; index++) {
			const select = selects[index];
			const select_default_value = select.getAttribute('data-default');
			select.value = select_default_value;
			select_item(select);
		}
	}
}


//======================

//Placeholers
let inputs = document.querySelectorAll('input[data-value],textarea[data-value]');
inputs_init(inputs);
function inputs_init(inputs) {
	if (inputs.length > 0) {
		for (let index = 0; index < inputs.length; index++) {
			const input = inputs[index];
			const input_g_value = input.getAttribute('data-value');
			input_placeholder_add(input);
			if (input.value != '' && input.value != input_g_value) {
				input_focus_add(input);
			}
			input.addEventListener('focus', function (e) {
				if (input.value == input_g_value) {
					input_focus_add(input);
					input.value = '';
				}
				if (input.getAttribute('data-type') === "pass") {
					input.setAttribute('type', 'password');
				}
				if (input.classList.contains('_date')) {
					/*
					input.classList.add('_mask');
					Inputmask("99.99.9999", {
						//"placeholder": '',
						clearIncomplete: true,
						clearMaskOnLostFocus: true,
						onincomplete: function () {
							input_clear_mask(input, input_g_value);
						}
					}).mask(input);
					*/
				}
				if (input.classList.contains('_phone')) {
					//'+7(999) 999 9999'
					//'+38(999) 999 9999'
					//'+375(99)999-99-99'
					input.classList.add('_mask');
					Inputmask("+375 (99) 9999999", {
						//"placeholder": '',
						clearIncomplete: true,
						clearMaskOnLostFocus: true,
						onincomplete: function () {
							input_clear_mask(input, input_g_value);
						}
					}).mask(input);
				}
				if (input.classList.contains('_digital')) {
					input.classList.add('_mask');
					Inputmask("9{1,}", {
						"placeholder": '',
						clearIncomplete: true,
						clearMaskOnLostFocus: true,
						onincomplete: function () {
							input_clear_mask(input, input_g_value);
						}
					}).mask(input);
				}
				form_remove_error(input);
			});
			input.addEventListener('blur', function (e) {
				if (input.value == '') {
					input.value = input_g_value;
					input_focus_remove(input);
					if (input.classList.contains('_mask')) {
						input_clear_mask(input, input_g_value);
					}
					if (input.getAttribute('data-type') === "pass") {
						input.setAttribute('type', 'text');
					}
				}
			});
			if (input.classList.contains('_date')) {
				const calendarItem = datepicker(input, {
					customDays: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
					customMonths: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
					overlayButton: 'Применить',
					overlayPlaceholder: 'Год (4 цифры)',
					startDay: 1,
					formatter: (input, date, instance) => {
						const value = date.toLocaleDateString()
						input.value = value
					},
					onSelect: function (input, instance, date) {
						input_focus_add(input.el);
					}
				});
				const dataFrom = input.getAttribute('data-from');
				const dataTo = input.getAttribute('data-to');
				if (dataFrom) {
					calendarItem.setMin(new Date(dataFrom));
				}
				if (dataTo) {
					calendarItem.setMax(new Date(dataTo));
				}
			}
		}
	}
}
function input_placeholder_add(input) {
	const input_g_value = input.getAttribute('data-value');
	if (input.value == '' && input_g_value != '') {
		input.value = input_g_value;
	}
}
function input_focus_add(input) {
	input.classList.add('_focus');
	input.parentElement.classList.add('_focus');
}
function input_focus_remove(input) {
	input.classList.remove('_focus');
	input.parentElement.classList.remove('_focus');
}
//*чистка маски номера
function input_clear_mask(input, input_g_value) {
	input.inputmask.remove();
	input.value = input_g_value;
	input_focus_remove(input);
}


function updateSwiper() {
	if (document.querySelector('.item-kitchen__slider')) {
		new Swiper('.item-kitchen__slider', {

			slidesPerView: 1,
			slidesPerGroup: 1,
			initialSlide: 0,

			simulateTouch: true,
			touthRadio: 1,
			touthAngle: 45,
			grabCursor: true,

			observer: true,
			observeParents: true,
			observerSlideChildren: true,

			autoHeight: false,
			speed: 600,

			pagination: {
				el: '.item-kitchen__pagination',
				clickable: true,
			},

			parallax: true,

		});
	}
};
updateSwiper();

