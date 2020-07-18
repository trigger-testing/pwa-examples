function logError(kind, ex) {
	if (typeof ex === "undefined") {
		ex = "undefined";
	}
	let span = document.createElement("p");
	//span.innerText = "[" + kind.toString().toUpperCase() + "]: " + ex.toString();
	span.innerText = "[" + kind.toString() + "]: " + ex.toString();
	//document.getElementById("error-log").children.insert(0, span);
	document.getElementById("error-log").prepend(span);
}
logError('Secure Context', window.isSecureContext);
try {
	var meterCanvas = document.getElementById("meter-canvas");
	var codeInputForm = document.getElementById("meter-input-form");
	meterBlob = null;

	function Size(width, height) {
		if (typeof width === "Size") {
			size = width;
			width  = size.width;
			height = size.height;
		}
		else if (typeof width === "Point") {
			point = width;
			width  = point.x;
			height = point.y;
		}
		this.width = Math.floor(width);
		this.height = Math.floor(height);
		this.toString = function() { return `Size(${this.x}, ${this.height})`; };
	}
	function Point(x, y) {
		if (typeof width === "Size") {
			size = width;
			x = size.width;
			y = size.height;
		}
		else if (typeof width === "Point") {
			point = width;
			x = point.x;
			y = point.y;
		}
		this.x = Math.floor(x);
		this.y = Math.floor(y);
		this.toString = function() { return `Point(${this.x}, ${this.y})`; };
	}
	// function MtThickness(left, top, right, bottom) {

	//     Object.defineProperty(this, 'horizontal', {
	//         get: function() { return this.left + this.right },
	//         configurable: false,
	//     });
	//     this.left   = Math.floor(left);
	//     this.top    = Math.floor(top);
	//     this.right  = Math.floor(right);
	//     this.bottom = Math.floor(bottom);
	// }
	// Object.defineProperty(MtThickness, 'horizontal', {
	//     get: function() { return this.left + this.right },
	// });
	// MtThickness(0,1,2,3);
	class Thickness {
		constructor(left, top, right, bottom) {
			if (typeof left === "Thickness") {
				thickness = left;
				left   = thickness.left;
				top    = thickness.top;
				right  = thickness.right;
				bottom = thickness.bottom;
			}
			else if (typeof right === "undefined" && typeof bottom === "undefined") {
				if (typeof top === "undefined") {
					if (typeof left === "undefined") {
						left   = 0;
					}
					top    = left;
				}
				right  = left;
				bottom = top;
			}
			this.left   = Math.floor(left);
			this.top    = Math.floor(top);
			this.right  = Math.floor(right);
			this.bottom = Math.floor(bottom);
		}
		get values() { return [this.left, this.top, this.right, this.bottom ]; }

		get topLeft() { return new Size(this.left, this.top); }
		get topRight() { return new Size(this.right, this.top); }
		get bottomLeft() { return new Size(this.left, this.bottom); }
		get bottomRight() { return new Size(this.right, this.bottom); }
		get total() { return this.left + this.top + this.right + this.bottom; }
		get horizontal() { return this.left + this.right; }
		get vertical() { return this.top + this.bottom; }

		toString() {
			return `Thickness(${this.left}, ${this.top}, ${this.right}, ${this.bottom})`;
		}
	};

	const Dimensions = {
		Columns: 19,
		Rows: 5,

		SideWidth: 10,
		TubeWidth: 132,
		TubeHeight: 428,
		CharOffsetX: 6,
		CharOffsetY: 58,
		CharWidth: 120,
		CharHeight: 290,

		
		FontAStart: 32,
		FontAEnd: 126,
		FontBStart: 161,
		FontBEnd: 255,
		Unsupported: "¤§¬¯µ¶¼½¾Þð",
		HasFontA(s) {
			for (let i = 0; i < s.length; i++) {
				let char = s.charCodeAt(i);
				if (char >= this.FontAStart && char <= this.FontAEnd)
					return true;
			}
			return false;
		},
		HasFontB(s) {
			for (let i = 0; i < s.length; i++) {
				let char = s.charCodeAt(i);
				if (char >= this.FontBStart && char <= this.FontBEnd)
					return true;
			}
			return false;
		},
		HasAuthentic(s) {
			for (let i = 0; i < s.length; i++) {
				let char = s.charCodeAt(i);
				if (char === ".".charCodeAt(0) || (char >= "0".charCodeAt(0) && char <= "9".charCodeAt(0)))
					return true;
			}
			return false;
		},
		IsFontA(s) {
			for (let i = 0; i < s.length; i++) {
				if (!this.HasFontA(s[i]))
					return false;
			}
			return true;
		},
		IsFontB(s) {
			for (let i = 0; i < s.length; i++) {
				if (!this.HasFontB(s[i]))
					return false;
			}
			return true;
		},
		IsAuthentic(s) {
			for (let i = 0; i < s.length; i++) {
				if (!this.HasAuthentic(s[i]))
					return false;
			}
			return true;
		},
	};
	const Scale = {
		Large: "Large",
		Medium: "Medium",
		Small: "Small",
		Names: { 1.0: "Large", 0.5: "Medium", 0.25: "Small"},
		Ratios: { Large: 1.0, Medium: 0.5, Small: 0.25 },
		getName(scale) {
			if (typeof scale === "number" || typeof scale === "Number") {
				return this.Names[scale];
			}
			else {
				return this.Names[this.Ratios[scale]];
			}
			return null;
		},
		getRatio(scale) {
			if (typeof scale === "number" || typeof scale === "Number") {
				return this.Ratios[this.Names[scale]];
			}
			else {
				return this.Ratios[scale];
			}
		},
	};
	class ImageCache {
		static get Instance() {
			//https://stackoverflow.com/a/51382165
			if (typeof ImageCache.instance === "undefined" || ImageCache.instance === null) {
				ImageCache.instance = new ImageCache();
			}
			return ImageCache.instance;
		}
		// static Instance = null;
		constructor(cache=null) {
			if (cache !== null) {
				if (cache.refCache !== null) {
					cache = cache.refCache;
				}
				cache.refs.push(this);
			}
			this.refCache = cache;
			this.refs = [ this ];
			
			this.imageSets = {
				Large: {
					Authentic: null, FontA: null, FontB: null, TubeLeft: null, TubeRight: null, TubeMid: null, TubeSingle:null,
				},
				Medium: {
					Authentic: null, FontA: null, FontB: null, TubeLeft: null, TubeRight: null, TubeMid: null, TubeSingle:null,
				},
				Small: {
					Authentic: null, FontA: null, FontB: null, TubeLeft: null, TubeRight: null, TubeMid: null, TubeSingle:null,
				},
			};
			// Stupid thing to keep linting clean
			(function(s){ if (s.refCache !== null) s.imageSets = s.refCache.imageSets; })(this);
		}
		
		get refRoot() {
			return (this.refCache !== null ? this.refCache : this);
		}
		addRef(ref) {
			if (this.refCache !== null) {
				return this.refCache.addRef(this);
			}
			if (this.refs.indexOf(ref) === -1) {
				this.refs.push(ref);
			}

			return this.refs.length;
		}
		removeRef(ref) {
			if (this.refCache !== null) {
				return this.refCache.removeRef(this);
			}
			if (this.refs.indexOf(ref) !== -1) {
				this.refs.splice(this.refs.indexOf(ref), 1);
				if (this.refs.length === 0) {
					this.unloadAll();
				}
			}
			//Scale\.(Large|Medium|Small)\.toString\(\) 
			return this.refs.length;
		}
		close() {
			this.removeRef(this);
		}
		getImageURL(name, scale) {
			let urlprot = (document.location.protocol === "file:" ? "" : "/pwa-examples/divergence-meter/");
			document.getElementById("image-store")
			return `${urlprot}data/img/${scale}/Nixie${name}.png`;
		}
		loadImage(name, scale, unloadOther=false) {
			if (unloadOther) {
				if (scale !== Scale.Large)
					this.unloadImage(name, Scale.Large);
				if (scale !== Scale.Medium)
					this.unloadImage(name, Scale.Medium);
				if (scale !== Scale.Small)
					this.unloadImage(name, Scale.Small);
			}
			var url = this.getImageURL(name, scale);
			var ratio = Scale.getRatio(scale);
			var cache = this;
			var imageSet = this.imageSets[scale];
			var image = this.imageSets[scale][name];
			image = document.getElementById(`image-store-${scale}-${name}`);
			this.imageSets[scale][name] = image;
			var result = { name: name, scale: scale, ratio: ratio, image: image, cache: cache };
			//this.imageSets[scale][name] = document.getElementById(`image-store-${scale}-${name}`);
			return new Promise(resolve => {resolve(result);});
			return new Promise(resolve => {
				/*
				* Create the image that we are going to use to
				* to hold the resource
				*/
				let loaded = false;
				if (typeof image !== "undefined" && image !== null) {
					loaded = true;
				}
				else {
					image = new Image();
				}
				var result = { name: name, scale: scale, ratio: ratio, image: image, cache: cache };
				if (loaded) {
					resolve(result);
				}
				// const image = new Image();
				imageSet[name] = image;
				/*
				* The Image API deals in even listeners and callbacks
				* we attach a listener for the "load" event which fires
				* when the Image has finished the network request and
				* populated the Image with data
				*/
				image.addEventListener("load", () => {
					/*
					* You have to manually tell the Promise that you are
					* done dealing with asynchronous stuff and you are ready
					* for it to give anything that attached a callback
					* through .then a realized value.  We do that by calling
					* resolve and passing it the realized value
					*/
					//imageSet[name] = image;
					resolve(result);
				});
				/*
				* Setting the Image.src is what starts the networking process
				* to populate an image.  After you set it, the browser fires
				* a request to get the resource.  We attached a load listener
				* which will be called once the request finishes and we have
				* image data
				*/
				if (document.location.protocol !== "file:")
					image.crossOrigin = "anonymous";  // This enables CORS
				image.src = url;
			});
			//return loadImage(this.getImagePath(name, scale));
		}
		loadNames(scale, names) {
			let promises = [];
			for (let i = 0; i < names.length; i++) {
				promises.push(this.loadImage(names[i], scale));
			}
			return Promise.all(promises);
		}
		unloadNames(scale, names) {
			let unloadedCount = 0;
			for (let i = 0; i < names.length; i++) {
				unloadedCount += this.unloadImage(names[i], scale);
			}
			return unloadedCount;
		}
		loadScale(scale, unloadOther=false) {
			if (unloadOther) {
				if (scale !== Scale.Large)
					this.unloadScale(Scale.Large);
				if (scale !== Scale.Medium)
					this.unloadScale(Scale.Medium);
				if (scale !== Scale.Small)
					this.unloadScale(Scale.Small);
			}
			let promises = [];
			let keys = Object.keys(this.imageSets[scale]);
			for (let i = 0; i < keys.length; i++) {
				promises.push(this.loadImage(keys[i], scale));
			}
			return Promise.all(promises);
		}
		loadAll() {
			return Promise.all([
				...this.loadScale(Scale.Large, false),
				...this.loadScale(Scale.Medium, false),
				...this.loadScale(Scale.Small, false),
			]);
		}
		unloadImage(name, scale) {
			if (scale === null) {
				return this.unloadImage(name, Scale.Large)
					+ this.unloadImage(name, Scale.Medium)
					+ this.unloadImage(name, Scale.Small);
			}
			else {
				let image = this.imageSets[scale][name];
				if (image !== "undefined" && image !== null) {
					image.close();
					this.imageSets[scale][name] = null;
					return 1;
				}
				return 0;
			}
		}
		unloadScale(scale) {
			let unloadedCount = 0;
			let imageSet = this.imageSets[scale];
			let keys = Object.keys(imageSet);
			for (let i = 0; i < keys.length; i++) {
				unloadedCount += this.unloadImage(keys[i], scale);
				// let image = imageSet[keys[i]];
				// if (image !== "undefined" && image !== null) {
				//     image.close();
				//     unloadedCount += 1;
				// }
			}
			return unloadedCount;
		}
		unloadAll() {
			return this.unloadScale(Scale.Large)
				+ this.unloadScale(Scale.Medium)
				+ this.unloadScale(Scale.Small);
		}
	};
	// ImageCache.Instance = new ImageCache();
	class Drawer {
		constructor(text, scale=Scale.Large, authentic=true, spacing=null, lineSpacing=0, imageCache=null) {
			if (imageCache === null) {
				imageCache = ImageCache.Instance;
			}
			// if (imageCache === null) {
			//     imageCache = new ImageCache();
			// }
			if (spacing === null) {
				spacing = new Thickness(0, 0, 0, 0);
			}
			else if (typeof spacing === "number" || typeof spacing === "Number") {
				spacing = new Thickness(spacing, spacing, spacing, spacing);
			}
			this.imageCache = imageCache;
			this.text = String(text);
			this.scale = scale;
			this.spacing = spacing;
			this.lineSpacing = Math.floor(lineSpacing);
			this.authentic = Boolean(authentic);
		}
		get ratio()       { return Scale.getRatio(this.scale); }
		get sideWidth()   { return this.getSize(Dimensions.SideWidth); }
		get tubeWidth()   { return this.getSize(Dimensions.TubeWidth); }
		get tubeHeight()  { return this.getSize(Dimensions.TubeHeight); }
		get tubeSize()    { return new Size(this.tubeWidth, this.tubeHeight); }
		get charOffsetX() { return this.getSize(Dimensions.CharOffsetX); }
		get charOffsetY() { return this.getSize(Dimensions.CharOffsetY); }
		get charOffset()  { return new Point(this.charOffsetX, this.charOffsetY); }
		get charWidth()   { return this.getSize(Dimensions.CharWidth); }
		get charHeight()  { return this.getSize(Dimensions.CharHeight); }
		get charSize()    { return new Size(this.charWidth, this.charHeight); }

		get lines()       { return this.text.split(/\n/); }
		get cols()        {
			return Math.max(...this.lines.map(function(line) { return line.length; }));
		}
		get minCols()        {
			return Math.min(...this.lines.map(function(line) { return line.length; }));
		}
		get rows() {
			return this.lines.length;
		}
		get textSize() {
			return new Size(this.cols, this.rows);
		}
		clearCanvas(canvas) {
			let ctx = canvas.getContext("2d");
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		}
		drawToCanvas(canvas) {
			// let tubeNames = [];
			// let fontNames = [];
			// let lines = this.lines;
			// if (this.authentic && Dimensions.HasAuthentic(this.text))
			//     fontNames.push("Authentic");
			// if (Dimensions.HasFontA(this.text))
			//     fontNames.push("FontA");
			// if (Dimensions.HasFontB(this.text))
			//     fontNames.push("FontB");
			// for (let i = 0; i < lines.length; i++) {
			//     length = lines[i].length;
			//     if (length === 1 && tubeNames.indexOf("TubeSingle") === -1) {
			//         tubeNames.push("TubeSingle");
			//     }
			//     else if (length >=2 && tubeNames.indexOf("TubeMid") === -1) {
			//         tubeNames.push("TubeLeft", "TubeRight");

			//         if (length >=3 && tubeNames.indexOf("TubeMid") === -1) {
			//             tubeNames.push("TubeMid");
			//         }
			//     }
			// }
			// let imageNames = [...tubeNames, ...fontNames];
			// this.imageCache.loadNames(this.scale, imageNames).then(function(imageList) {
			//     let images = {};
			//     for (let i = 0; i < imageList.length; i++) {
			//         images[imageList[i].name] = imageList[i];
			//     }
			// });
			let size = this.calculateDimensions();
			return new Promise(function(resolve) {
				this.loadImages().then(function(imageList) {
					let images = {};
					for (let i = 0; i < imageList.length; i++) {
						images[imageList[i].name] = imageList[i];
					}
					//new HTMLCanvasElement().getContext("2d")
					//canvas = canvas as HTMLCanvasElement;
					canvas.width  = size.width;
					canvas.height = size.height;
					
					let ctx = canvas.getContext("2d");
					ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
					for (let i = 0; i < this.lines.length; i++) {
						this.drawLine(ctx, i, images);
					}
					resolve(this);
					//ctx.save();
				}.bind(this));
			}.bind(this));
			//new Promise().the
		}
		drawLine(ctx, index, res) {
			let line = this.lines[index];
			let point = new Point(
				this.spacing.left + this.sideWidth,
				this.spacing.top + index * (this.tubeHeight + this.lineSpacing),
			);

			for (let i = 0; i < line.length; i++) {
				let c = line[i];
				this.drawTube(ctx, i, line.length, point, res);
				this.drawChar(ctx, c, line.length, point, res);
				point.x += this.tubeWidth;
			}
		}
		drawTube(ctx, index, length, point, res) {
			point = new Point(point.x, point.y);
			let tube = null;
			if (index === 0) {
				point.x -= this.sideWidth;
				tube = (length === 1 ? res.TubeSingle : res.TubeLeft);
			}
			else if (index + 1 < length) {
				tube = res.TubeMid;
			}
			else {
				tube = res.TubeRight;
			}
			// console.log(`tube[${index}]`);
			// console.log(tube.image)
			ctx.drawImage(tube.image, point.x, point.y);
		}
		drawChar(ctx, c, length, point, res) {
			point = new Point(point.x, point.y);
		   
			point.x += this.charOffset.x;
			point.y += this.charOffset.y;
			let index = 0;
			let source = null;
			console.log(`DrawChar: c=${c} (${c.charCodeAt(0)})`);
			if (c === " " || c === "\t" || c === "") {
				console.log("is whitespace");
				return; // Skip whitespace
			}
			else if (this.authentic && Dimensions.IsAuthentic(c)) {
				source = res.Authentic;
				if (c !== ".") { //c.charCodeAt(0) >= "0".charCodeAt(0) && c.charCodeAt(0) <= "9".charCodeAt(0)) {
					index = ((c.charCodeAt(0) - "0".charCodeAt(0)) + 1);
				}
				console.log("is authentic");
			}
			else if (Dimensions.IsFontA(c)) {
				source = res.FontA;
				index = c.charCodeAt(0) - Dimensions.FontAStart;
				console.log("is FontA");
			}
			else if (Dimensions.IsFontB(c)) {
				source = res.FontB;
				index = c.charCodeAt(0) - Dimensions.FontBStart;
				console.log("is FontB");
			}
			else {
				console.log(`else return DrawChar: c=${c} i=${index}`);
				return;
			}
			let sourceIndex = new Point(
				Math.floor(index % Dimensions.Columns),
				Math.floor(index / Dimensions.Columns),
			);
			let sourcePos = new Point(
				Math.floor(Math.floor(index % Dimensions.Columns) * this.charWidth),
				Math.floor(Math.floor(index / Dimensions.Columns) * this.charHeight),
			);
			console.log(`   index=${index} source=${source.name} ${source.image.width}x${source.image.height} @ ${sourcePos} ${this.charWidth}x${this.charHeight} [${sourceIndex}]`);
			ctx.drawImage(source.image, sourcePos.x, sourcePos.y, this.charWidth, this.charHeight, point.x, point.y, this.charWidth, this.charHeight);
		}
		loadImages() {
			let tubeNames = [];
			let fontNames = [];
			let lines = this.lines;
			if (this.authentic && Dimensions.HasAuthentic(this.text))
				fontNames.push("Authentic");
			if (Dimensions.HasFontA(this.text))
				fontNames.push("FontA");
			if (Dimensions.HasFontB(this.text))
				fontNames.push("FontB");
			for (let i = 0; i < lines.length; i++) {
				length = lines[i].length;
				if (length === 1 && tubeNames.indexOf("TubeSingle") === -1) {
					tubeNames.push("TubeSingle");
				}
				else if (length >=2 && tubeNames.indexOf("TubeMid") === -1) {
					tubeNames.push("TubeLeft", "TubeRight");

					if (length >=3 && tubeNames.indexOf("TubeMid") === -1) {
						tubeNames.push("TubeMid");
					}
				}
			}
			let imageNames = [...tubeNames, ...fontNames];
			return this.imageCache.loadNames(this.scale, imageNames)/*.then(function(imageList) {
				let images = {};
				for (let i = 0; i < imageList.length; i++) {
					images[imageList[i].name] = imageList[i];
				}
			});*/
		}

		getSize(pixels) {
			return Math.ceil(pixels * this.ratio)
		}

		calculateDimensions() {
			return new Size(
				Math.max(1, this.spacing.horizontal + this.sideWidth * 2 + this.tubeWidth * this.cols),
				Math.max(1, this.spacing.vertical + this.tubeHeight * this.rows),
			);
		}
	};
	/* Converts canvas to an image */
	function convertCanvasToImage(canvas) {
		var image = new Image();
		image.src = canvas.toDataURL("image/png");
		return image;
	}
	var drawer = new Drawer(codeInputForm.text.value, Scale.Large, true, new Thickness(0, 0, 0, 0), 0);

	function clearDrawer(e) {
		logError('Secure Context', window.isSecureContext);
		logError('Clear drawer');

		document.getElementById("meter-canvas-container").classList.remove("mirrored");
		meterCanvas.classList.remove("mirrored");
		meterCanvas.removeAttribute("width");
		meterCanvas.removeAttribute("height");
		drawer.clearCanvas(meterCanvas);
		
		let image = document.getElementById("meter-canvas-mirror");
		image.src = "";
		image.removeAttribute("width");
		image.removeAttribute("height");

		codeInputForm.downloadButton.disabled = true;
	}
	function runDrawer(e) {
		logError('Secure Context', window.isSecureContext);
		//https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
		try {
			drawer.authentic = codeInputForm.authentic.checked;
			drawer.scale = codeInputForm.scale.value;
			drawer.text = codeInputForm.text.value;
			// drawer.text = codeInputForm.text.value;
			meterCanvas.classList.remove("mirrored");
			document.getElementById("meter-canvas-container").classList.remove("mirrored");

			// document.getElementById("meter-canvas-mirror").width = 0;
			// document.getElementById("meter-canvas-mirror").height = 0;
			drawer.drawToCanvas(meterCanvas).then(function() {
				logError("DRAW SUCCESS", "");
		//         try {
					// var image = new Image();
					let image = document.getElementById("meter-canvas-mirror");
					// let a = document.getElementById("direct-image-download");
					logError('Secure Context', window.isSecureContext);
					// var canvas = document.createElement("canvas");
					// canvas.width  = meterCanvas.width;
					// canvas.height = meterCanvas.height;
					// var ctx = canvas.getContext("2d");
					// ctx.drawImage(meterCanvas, 0, 0);
					
		// if (document.location.protocol !== "file:")
		//     image.crossOrigin = "anonymous";  // This enables CORS
		//     image.crossOrigin = "use-credentials";  // This enables CORS
		image.src = meterCanvas.toDataURL("image/png");
		image.width = meterCanvas.width;
		image.height = meterCanvas.height;
		document.getElementById("meter-canvas-container").classList.add("mirrored");
		codeInputForm.downloadButton.disabled = false;
				logError("MIRRORED", "");
		// a.href = image.src;
		// meterCanvas.toBlob(function (blob) {
		// 	meterBlob = blob;
		// 	logError('typeof blob', typeof blob);
		// 	logError('blob', blob);
		// 	//logError('typeof blob', typeof blob);
		// }, "image/png");
		// document.body.append(image);
		// image.src = canvas.toDataURL("image/png");

		//             let mir = document.getElementById("meter-canvas-mirror");
		//             mir.src = image.src;
		//             // let mir = document.createElement('img');
		//             // document.body.append(mir);
		//             // mir.src = image.src;
		// //return image;
		//             // let ima = convertCanvasToImage(meterCanvas);
		//             // // let mir = document.getElementById("meter-canvas-mirror");
		//             // let mir = document.createElement('img');
		//             // document.body.append(mir);
		//             // mir.onload = function() {
		//             //     console.log('onload')
		//             // }
		//             // mir.onerror = function() {
		//             //     console.log('onerror')
		//             // }
		//             // mir.src = ima.src;
		//             // url = meterCanvas.toDataURL("image/png", 1.0);
		//             // mirror.src = meterCanvas.toDataURL("image/png", 1.0);
		//             logError("convertCanvasToImage SUCCESS", "");
		//         } catch (ex3) {
		//             logError("convertCanvasToImage ERROR", ex3.toString());
		//         }
		//         // try {
					
		//         //     // meterCanvas.toBlob(function(blob) {
		//         //     // var mirror = document.getElementById("meter-canvas-mirror");
		//         //     // var mirror = new Image();
		//         //     var mirror = document.createElement('img');
		//         //     // var url = URL.createObjectURL(blob);

		//         //     mirror.onload = function() {
		//         //         logError("MIRROR ONLOAD", "");
		//         //         let url = "";
		//         // try {
		//         //     url = meterCanvas.toDataURL("image/png", 1.0);
		//         //        // mirror.src = meterCanvas.toDataURL("image/png", 1.0);
		//         //     logError("TODATAURL SUCCESS", "");
		//         // } catch (ex3) {
		//         //     logError("TODATAURL ERROR", ex3.toString());
		//         // }
		//         // try {
		//         //         mirror.src = url;
		//         //     logError("TODATAURL MIRROR SUCCESS", "");
		//         // } catch (ex4) {
		//         //     logError("TODATAURL MIRROR ERROR", ex4.toString());
		//         // }
		//         //         // console.log(url);
		//         //         // // no longer need to read the blob so it's revoked
		//         //         // URL.revokeObjectURL(url);
		//         //     };
		//         //     let urlprot = (document.location.protocol === "file:" ? "" : "/pwa-examples/divergence-meter/");
		//         //     mirror.src = `${urlprot}assets/icon.png`;
		//         //     //mirror.src = url;
		//         //     document.body.appendChild(mirror);
		//         //     // }, "image/png");
		//         //     logError("TOBLOB SUCCESS", "");
		//         // } catch (ex2) {
		//         //     logError("TOBLOB ERROR", ex2.toString());
		//         // }
			});
		} catch (ex) {
			logError("DRAW ERROR", ex.toString());
			console.log(ex);
		}
	}
	//runDrawer({name:'none'});
	codeInputForm.addEventListener("submit", function(e) {
		console.log('meter-input-form.onsubmit');
		console.log(e);
		runDrawer(e);
		e.preventDefault();
	});
} catch (ex) {
	logError("INIT ERROR", ex.toString());
} finally {
	logError("INIT FINALLY", "");
}