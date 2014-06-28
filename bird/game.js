var CRENDER_DEBUG = false;

function ImagesPreloader() {
	var self = this;
	this.curItem = -1;
	this.loadedImages = {};
	this.data = null;
	this.endCallback = null;
	this.processCallback = null;
	this.load = function(data, endCallback, processCallback) {
		this.data = data;
		this.endCallback = endCallback;
		this.processCallback = processCallback;
		for(var i = 0; i < this.data.length; i++) {
			var item = this.data[i];
			var img = new Image();
			img.src = item.src;
			this.loadedImages[item.name] = img;
		}
		wait();
	};

	function wait() {
		var itemsLoaded = 0;
		var itemsTotal = 0;
		for(var key in self.loadedImages) {
			if(self.loadedImages[key].complete) itemsLoaded++;
			itemsTotal++;
		}
		if(itemsLoaded >= itemsTotal) {
			if(self.endCallback) self.endCallback(self.loadedImages);
			return;
		} else {
			if(self.processCallback) self.processCallback(Math.floor(itemsLoaded / itemsTotal * 100));
			setTimeout(wait, 50);
		}
	}
}
var Utils = {
	touchScreen: ("ontouchstart" in window),
	globalScale: 1,
	setCookie: function(name, value) {
		window.localStorage.setItem(name, value);
	},
	getCookie: function(name) {
		return window.localStorage.getItem(name);
	},
	bindEvent: function(el, eventName, eventHandler) {
		if(el.addEventListener) {
			el.addEventListener(eventName, eventHandler, false);
		} else if(el.attachEvent) {
			el.attachEvent('on' + eventName, eventHandler);
		}
	},
	getObjectLeft: function(element) {
		var result = element.offsetLeft;
		if(element.offsetParent) result += Utils.getObjectLeft(element.offsetParent);
		return result;
	},
	getObjectTop: function(element) {
		var result = element.offsetTop;
		if(element.offsetParent) result += Utils.getObjectTop(element.offsetParent);
		return result;
	},
	parseGet: function() {
		var get = {};
		var s = new String(window.location);
		var p = s.indexOf("?");
		var tmp, params;
		if(p != -1) {
			s = s.substr(p + 1, s.length);
			params = s.split("&");
			for(var i = 0; i < params.length; i++) {
				tmp = params[i].split("=");
				get[tmp[0]] = tmp[1];
			}
		}
		return get;
	},
	globalPixelScale: 1,
	getMouseCoord: function(event, object) {
		var e = event || window.event;
		if(e.touches) e = e.touches[0];
		if(!e) return {
			x: 0,
			y: 0
		};
		var x = 0;
		var y = 0;
		var mouseX = 0;
		var mouseY = 0;
		if(object) {
			x = Utils.getObjectLeft(object);
			y = Utils.getObjectTop(object);
		}
		if(e.pageX || e.pageY) {
			mouseX = e.pageX;
			mouseY = e.pageY;
		} else if(e.clientX || e.clientY) {
			mouseX = e.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft) - document.documentElement.clientLeft;
			mouseY = e.clientY + (document.documentElement.scrollTop || document.body.scrollTop) - document.documentElement.clientTop;
		}
		var retX = (mouseX - x);
		var retY = (mouseY - y);
		return {
			x: retX,
			y: retY
		};
	},
	extend: function(Child, Parent) {
		var F = function() {};
		F.prototype = Parent.prototype;
		Child.prototype = new F();
		Child.prototype.constructor = Child;
		Child.superclass = Parent.prototype;
	},
	removeFromArray: function(arr, item) {
		var tmp = [];
		for(var i = 0; i < arr.length; i++) {
			if(arr[i] != item) tmp.push(arr[i]);
		}
		return tmp;
	},
	showLoadProgress: function(val) {
		var scl = Utils.globalScale;
		var s = 'Loading: ' + val + '%';
		s += '<br><br>';
		s += '<div style="display: block; background: #000; width: ' + (val * scl * 2) + 'px; height: ' + (10 * scl) + 'px;">&nbsp;</div>';
		document.getElementById('progress').innerHTML = s;
	},
	hideAddressBarLock: false,
	mobileHideAddressBar: function() {
		if(Utils.hideAddressBarLock) return;
		window.scrollTo(0, 1);
	},
	mobileCheckIphone4: function() {
		if(window.devicePixelRatio) {
			if(navigator.userAgent.indexOf('iPhone') != -1 && window.devicePixelRatio == 2) return true;
		}
		return false;
	},
	checkSpilgamesEnvironment: function() {
		return(typeof ExternalAPI != "undefined" && ExternalAPI.type == "Spilgames" && ExternalAPI.check());
	},
	mobileCorrectPixelRatio: function() {
		var meta = document.createElement('meta');
		meta.name = "viewport";
		var content = "target-densitydpi=device-dpi, user-scalable=no";
		if(Utils.checkSpilgamesEnvironment()) {
			if(window.devicePixelRatio > 1) content += ", initial-scale=0.5, maximum-scale=0.5, minimum-scale=0.5";
			else content += ", initial-scale=1, maximum-scale=1, minimum-scale=1";
		} else {
			if(Utils.mobileCheckIphone4()) content += ", initial-scale=0.5, maximum-scale=0.5, minimum-scale=0.5";
			else content += ", initial-scale=1, maximum-scale=1, minimum-scale=1";
		}
		meta.content = content;
		document.getElementsByTagName('head')[0].appendChild(meta);
	},
	getMobileScreenResolution: function(landscape) {
		var scale = 1;
		var w = 0;
		var h = 0;
		var container = {
			width: window.innerWidth,
			height: window.innerHeight
		};
		if(!Utils.touchScreen || container.height > container.width) {
			w = container.width;
			h = container.height;
		} else {
			w = container.height;
			h = container.width;
		}
		if(Utils.touchScreen) {
			if(w > 320 && w <= 480) scale = 1.5;
			if(w > 480) scale = 2;
			if(Utils.mobileCheckIphone4() && window == window.parent) scale = 2;
		} else {
			if(landscape) {
				if(h >= 640) scale = 2;
				if(h < 640 && h >= 480) scale = 1.5;
			} else {
				if(h >= 800 && h < 960) scale = 1.5;
				if(h >= 960) scale = 2;
			}
		}
		return Utils.getScaleScreenResolution(scale, landscape);
	},
	getScaleScreenResolution: function(scale, landscape) {
		var w, h;
		w = Math.round(320 * scale);
		h = Math.round(480 * scale);
		if(landscape) {
			var tmp = w;
			w = h;
			h = tmp;
		}
		return {
			width: w,
			height: h,
			scale: scale
		};
	},
	imagesRoot: 'images',
	createLayout: function(container, resolution) {
		var scl = Utils.globalScale;
		var height = window.innerHeight;
		if("orientation" in window) height = 2048;
		else document.body.style.overflow = "hidden";
		var s = "";
		s += '<div id="progress_container" align="center" style="width: 100%; height: ' + height + 'px; display: block; width: 100%; position: absolute; left: 0px; top: 0px;">';
		s += '<table cellspacing="0" cellpadding="0"><tr><td id="progress" align="center" valign="middle" style="width: ' + resolution.width + 'px; height: ' + resolution.height + 'px; color: #000; background: #fff; font-weight: bold; font-family: Verdana; font-size: ' + (12 * scl) + 'px; vertical-align: middle;"></td></tr></table>';
		s += '</div>';
		s += '<div id="screen_background_container" align="center" style="width: 100%; height: ' + height + 'px; position: absolute; left: 0px; top: 0px; display: none; z-index: 2;">'
		s += '<div id="screen_background_wrapper" style="width: ' + resolution.width + 'px; height: ' + resolution.height + 'px; overflow: hidden; position: relative;">';
		s += '<canvas id="screen_background" width="' + resolution.width + '" height="' + resolution.height + '"></canvas>';
		s += '</div>';
		s += '</div>';
		s += '<div id="screen_container" align="center" style="width: 100%; height: ' + height + 'px; position: absolute; left: 0px; top: 0px; display: none; z-index: 3;">';
		s += '<div id="screen_wrapper" style="width: ' + resolution.width + 'px; height: ' + resolution.height + 'px; overflow: hidden; position: relative;">';
		s += '<canvas id="screen" style="position: absolute; left: 0px; top: 0px; z-index: 1000000;" width="' + resolution.width + '" height="' + resolution.height + '">You browser does not support this application :(</canvas>';
		s += '</div>';
		s += '</div>';
		container.innerHTML = s;
		var p = document.createElement("div");
		p.setAttribute("id", "p2l_container");
		p.setAttribute("align", "center");
		var w = resolution.width;
		p.setAttribute("style", "width: 100%; height: " + height + "px; position: absolute; left: 0px; top: 0px; display: none; z-index: 1000; background: #fff;");
		p.innerHTML = '<img id="p2l" src="' + Utils.imagesRoot + '/p2l.jpg" style="padding-top: ' + ((w - 240) / 2) + 'px" />';
		document.body.appendChild(p);
	},
	preventEvent: function(e) {
		e.preventDefault();
		e.stopPropagation();
		e.cancelBubble = true;
		e.returnValue = false;
		return false;
	},
	addMobileListeners: function(landscape) {
		Utils.bindEvent(document.body, "touchstart", Utils.preventEvent);
		Utils.bindEvent(window, "scroll", function(e) {
			setTimeout(Utils.mobileHideAddressBar, 300);
		});
		setInterval("Utils.checkOrientation(" + (landscape ? "true" : "false") + ")", 500);
		setTimeout(Utils.mobileHideAddressBar, 500);
	},
	storeOrient: null,
	checkOrientation: function(landscape) {
		if(!Utils.touchScreen) return;
		if(!document.getElementById('screen_container')) return;
		var getParams = Utils.parseGet();
		if(getParams.nocheckorient == 1) return;
		var orient = false;
		if(window == window.parent) {
			orient = (window.innerWidth > window.innerHeight);
		} else {
			var longSide = Math.max(screen.width, screen.height);
			var shortSide = Math.min(screen.width, screen.height);
			var lc = Math.abs(window.innerWidth - longSide);
			var sc = Math.abs(window.innerWidth - shortSide);
			orient = (lc < sc);
		}
		if(Utils.storeOrient === orient) return;
		Utils.storeOrient = orient;
		var ok = (orient == landscape);
		if(!ok) {
			Utils.dispatchEvent("lockscreen");
			document.getElementById('p2l_container').style.display = 'block';
			document.getElementById('screen_background_container').style.display = 'none';
			document.getElementById('screen_container').style.display = 'none';
		} else {
			Utils.dispatchEvent("unlockscreen");
			document.getElementById('p2l_container').style.display = 'none';
			document.getElementById('screen_background_container').style.display = 'block';
			document.getElementById('screen_container').style.display = 'block';
		}
		if(Utils.checkSpilgamesEnvironment()) document.getElementById('p2l_container').style.display = 'none';
		setTimeout(Utils.mobileHideAddressBar, 50);
		setTimeout(Utils.fitLayoutToScreen, 100);
	},
	fitLayoutTimer: null,
	addFitLayoutListeners: function() {
		Utils.fitLayoutTimer = setInterval(Utils.fitLayoutToScreen, 500);
	},
	removeFitLayoutListeners: function() {
		clearInterval(Utils.fitLayoutTimer);
	},
	fitLayoutLock: false,
	fitLayoutCorrectHeight: 0,
	fitLayoutToScreen: function(container) {
		if(Utils.fitLayoutLock) return;
		var p, s, width, height;
		if(typeof container != "object" || !container.width) {
			width = window.innerWidth;
			height = window.innerHeight;
			if(Utils.checkSpilgamesEnvironment()) height -= 25;
			height += Utils.fitLayoutCorrectHeight;
			container = {
				width: width,
				height: height
			};
		}
		s = document.getElementById("screen");
		if(!s) return;
		if(!s.initWidth) {
			s.initWidth = s.width;
			s.initHeight = s.height;
		}
		width = s.initWidth;
		height = s.initHeight;
		var scale = 1;
		var scaleX = container.width / width;
		var scaleY = container.height / height;
		scale = (scaleX < scaleY ? scaleX : scaleY);
		Utils.globalPixelScale = scale;
		width = Math.floor(width * scale);
		height = Math.floor(height * scale);
		if(s.lastWidth == width && s.lastHeight == height) return;
		s.lastWidth = width;
		s.lastHeight = height;
		Utils.resizeElement("screen", width, height);
		Utils.resizeElement("screen_background", width, height);
		s = document.getElementById("progress");
		if(s) {
			s.style.width = (~~width) + "px";
			s.style.height = (~~height) + "px";
		}
		s = document.getElementById("screen_wrapper");
		s.style.width = (~~width) + "px";
		s.style.height = (~~height) + "px";
		s = document.getElementById("screen_background_wrapper");
		s.style.width = (~~width) + "px";
		s.style.height = (~~height) + "px";
		s = document.getElementById("p2l_container");
		s.style.width = (~~window.innerWidth) + "px";
		s.style.height = "2048px";
		Utils.dispatchEvent("fitlayout");
		setTimeout(Utils.mobileHideAddressBar, 50);
	},
	resizeElement: function(id, width, height) {
		var s = document.getElementById(id);
		if(!s) return;
		s.setAttribute("width", width);
		s.setAttribute("height", height);
	},
	drawIphoneLimiter: function(stage, landscape) {
		if(landscape) stage.drawRectangle(240, 295, 480, 54, "#f00", true, 0.5, true);
		else stage.drawRectangle(160, 448, 320, 64, "#f00", true, 0.5, true);
	},
	drawGrid: function(stage, landscape, col) {
		if(typeof landscape == 'undefined') landscape = false;
		var dx = 10;
		var dy = 10;
		if(typeof col == 'undefined') col = '#FFF';
		var w = 1 / Utils.globalScale / Utils.globalPixelScale;
		var s = {
			w: (landscape ? 480 : 320),
			h: (landscape ? 320 : 480)
		}
		for(var x = dx; x < s.w; x += dx) {
			var o = 0.1 + 0.1 * (((x - dx) / dx) % 10);
			stage.drawLine(x, 0, x, s.h, w, col, o);
		}
		for(var y = dy; y < s.h; y += dy) {
			var o = 0.1 + 0.1 * (((y - dy) / dy) % 10);
			stage.drawLine(0, y, s.w, y, w, col, o);
		}
	},
	drawScaleFix: function(stage, landscape) {
		if(Utils.globalScale == 0.75) {
			if(landscape) stage.drawRectangle(507, 160, 54, 320, "#000", true, 1, true);
			else stage.drawRectangle(160, 507, 320, 54, "#000", true, 1, true);
		}
		if(Utils.globalScale == 1.5) {
			if(landscape) stage.drawRectangle(510, 160, 60, 320, "#000", true, 1, true);
			else stage.drawRectangle(160, 510, 320, 60, "#000", true, 1, true);
		}
	},
	grad2radian: function(val) {
		return val / (180 / Math.PI);
	},
	radian2grad: function(val) {
		return val * (180 / Math.PI);
	},
	eventsListeners: [],
	onlockscreen: null,
	onunlockscreen: null,
	onfitlayout: null,
	addEventListener: function(type, callback) {
		EventsManager.addEvent(Utils, type, callback);
	},
	removeEventListener: function(type, callback) {
		EventsManager.removeEvent(Utils, type, callback);
	},
	dispatchEvent: function(type, params) {
		return EventsManager.dispatchEvent(Utils, type, params);
	}
}
var EventsManager = {
	addEvent: function(obj, type, callback) {
		if(!obj.eventsListeners) return;
		for(var i = 0; i < obj.eventsListeners.length; i++) {
			if(obj.eventsListeners[i].type === type && obj.eventsListeners[i].callback === callback) return;
		}
		obj.eventsListeners.push({
			type: type,
			callback: callback
		});
	},
	removeEvent: function(obj, type, callback) {
		if(!obj.eventsListeners) return;
		for(var i = 0; i < obj.eventsListeners.length; i++) {
			if(obj.eventsListeners[i].type === type && obj.eventsListeners[i].callback === callback) {
				obj.eventsListeners = Utils.removeFromArray(obj.eventsListeners, obj.eventsListeners[i]);
				return;
			}
		}
	},
	dispatchEvent: function(obj, type, params) {
		if(!obj.eventsListeners) return;
		var ret;
		if(typeof obj["on" + type] == "function") {
			ret = obj["on" + type](params);
			if(ret === false) return false;
		}
		for(var i = 0; i < obj.eventsListeners.length; i++) {
			if(obj.eventsListeners[i].type === type) {
				ret = obj.eventsListeners[i].callback(params);
				if(ret === false) return false;
			}
		}
	}
}
var ANCHOR_ALIGN_LEFT = -1;
var ANCHOR_ALIGN_CENTER = 0;
var ANCHOR_ALIGN_RIGHT = 1;
var ANCHOR_VALIGN_TOP = -1;
var ANCHOR_VALIGN_MIDDLE = 0;
var ANCHOR_VALIGN_BOTTOM = 1;

function Sprite(img, w, h, f, l) {
	this.uid = 0;
	this.stage = null;
	this.x = 0;
	this.y = 0;
	this.width = w;
	this.height = h;
	this.offset = {
		left: 0,
		top: 0
	};
	this.anchor = {
		x: 0,
		y: 0
	}
	this.scaleX = 1;
	this.scaleY = 1;
	this.rotation = 0;
	this.zIndex = 0;
	this.visible = true;
	this.opacity = 1;
	this['static'] = false;
	this.ignoreViewport = false;
	this.animated = true;
	this.currentFrame = 0;
	this.totalFrames = Math.max(1, ~~f);
	if(this.totalFrames <= 1) this.animated = false;
	this.currentLayer = 0;
	this.totalLayers = Math.max(1, ~~l);
	this.bitmap = img;
	this.mask = null;
	this.fillColor = false;
	this.destroy = false;
	this.animStep = 0;
	this.animDelay = 1;
	this.drawAlways = false;
	this.dragged = false;
	this.dragX = 0;
	this.dragY = 0;
	this.getX = function() {
		return Math.round(this.x * Utils.globalScale);
	};
	this.getY = function() {
		return Math.round(this.y * Utils.globalScale);
	};
	this.getWidth = function() {
		return this.width * this.scaleX * Utils.globalScale;
	};
	this.getHeight = function() {
		return this.height * this.scaleY * Utils.globalScale;
	};
	this.startDrag = function(x, y) {
		this.dragged = true;
		this.dragX = x;
		this.dragY = y;
	}
	this.stopDrag = function() {
		this.dragged = false;
		this.dragX = 0;
		this.dragY = 0;
	}
	this.play = function() {
		this.animated = true;
	};
	this.stop = function() {
		this.animated = false;
	};
	this.gotoAndStop = function(frame) {
		this.currentFrame = frame;
		this.stop();
	};
	this.gotoAndPlay = function(frame) {
		this.currentFrame = frame;
		this.play();
	};
	this.removeTweens = function() {
		if(!this.stage) return;
		this.stage.clearObjectTweens(this);
	};
	this.addTween = function(prop, end, duration, ease, onfinish, onchange) {
		if(!this.stage) return;
		var val = this[prop];
		if(isNaN(val)) return;
		var t = stage.createTween(this, prop, val, end, duration, ease);
		t.onchange = onchange;
		t.onfinish = onfinish;
		return t;
	};
	this.moveTo = function(x, y, duration, ease, onfinish, onchange) {
		duration = ~~duration;
		if(duration <= 0) {
			this.setPosition(x, y);
		} else {
			var t1 = this.addTween('x', x, duration, ease, onfinish, onchange);
			if(t1) t1.play();
			var t2 = this.addTween('y', y, duration, ease, (t1 ? null : onfinish), (t1 ? null : onchange));
			if(t2) t2.play();
		}
		return this;
	}
	this.moveBy = function(x, y, duration, ease, onfinish, onchange) {
		return this.moveTo(this.x + x, this.y + y, duration, ease, onfinish, onchange);
	}
	this.fadeTo = function(opacity, duration, ease, onfinish, onchange) {
		duration = ~~duration;
		if(duration <= 0) {
			this.opacity = opacity;
		} else {
			var t = this.addTween('opacity', opacity, duration, ease, onfinish, onchange);
			if(t) t.play();
		}
		return this;
	}
	this.fadeBy = function(opacity, duration, ease, onfinish, onchange) {
		var val = Math.max(0, Math.min(1, this.opacity + opacity));
		return this.fadeTo(val, duration, ease, onfinish, onchange);
	}
	this.rotateTo = function(rotation, duration, ease, onfinish, onchange) {
		duration = ~~duration;
		if(duration <= 0) {
			this.rotation = rotation;
		} else {
			var t = this.addTween('rotation', rotation, duration, ease, onfinish, onchange);
			if(t) t.play();
		}
		return this;
	}
	this.rotateBy = function(rotation, duration, ease, onfinish, onchange) {
		return this.rotateTo(this.rotation + rotation, duration, ease, onfinish, onchange);
	}
	this.scaleTo = function(scale, duration, ease, onfinish, onchange) {
		duration = ~~duration;
		if(duration <= 0) {
			this.scaleX = this.scaleY = scale;
		} else {
			var t1 = this.addTween('scaleX', scale, duration, ease, onfinish, onchange);
			if(t1) t1.play();
			var t2 = this.addTween('scaleY', scale, duration, ease, (t1 ? null : onfinish), (t1 ? null : onchange));
			if(t2) t2.play();
		}
		return this;
	}
	this.nextFrame = function() {
		this.dispatchEvent("enterframe", {
			target: this
		});
		if(!this.history.created) this.updateHistory();
		if(!this.animated) return;
		this.animStep++;
		if(this.animStep >= this.animDelay) {
			this.currentFrame++;
			this.animStep = 0;
		}
		if(this.currentFrame >= this.totalFrames) this.currentFrame = 0;
	};
	this.updateHistory = function() {
		this.history.x = this.getX();
		this.history.y = this.getY();
		this.history.rotation = this.rotation;
		this.history.frame = this.currentFrame;
		var rect = new Rectangle(this.history.x, this.history.y, this.getWidth(), this.getHeight(), this.rotation);
		rect.AABB[0].x -= 1;
		rect.AABB[0].y -= 1;
		rect.AABB[1].x += 1;
		rect.AABB[1].y += 1;
		this.history.AABB = rect.AABB;
		this.history.created = true;
		this.history.changed = false;
	};
	this.history = {
		created: false,
		drawed: false,
		changed: false,
		x: 0,
		y: 0,
		rotation: 0,
		frame: 0,
		AABB: []
	};
	this.eventsWhenInvisible = false;
	this.onmouseover = null;
	this.onmouseout = null;
	this.onmousedown = null;
	this.onmouseup = null;
	this.onclick = null;
	this.oncontextmenu = null;
	this.onmousemove = null;
	this.onenterframe = null;
	this.onrender = null;
	this.onadd = null;
	this.onremove = null;
	this.onbox2dsync = null;
	this.mouseOn = false;
	this.getPosition = function() {
		return {
			x: this.x + 0,
			y: this.y + 0
		}
	}
	this.setPosition = function(x, y) {
		if((typeof y == 'undefined') && (typeof x['x'] != 'undefined') && (typeof x['y'] != 'undefined')) {
			return this.setPosition(x.x, x.y);
		}
		this.x = parseFloat(x);
		this.y = parseFloat(y);
	}
	this.getAnchor = function() {
		return new Vector(this.anchor.x, this.anchor.y);
	}
	this.setAnchor = function(x, y) {
		if((typeof y == 'undefined') && (typeof x['x'] != 'undefined') && (typeof x['y'] != 'undefined')) {
			return this.setAnchor(x.x, x.y);
		}
		this.anchor.x = parseFloat(x);
		this.anchor.y = parseFloat(y);
	}
	this.alignAnchor = function(h, v) {
		h = parseInt(h);
		if(isNaN(h)) h = ANCHOR_ALIGN_CENTER;
		if(h < 0) h = ANCHOR_ALIGN_LEFT;
		if(h > 0) h = ANCHOR_ALIGN_RIGHT;
		v = parseInt(v);
		if(isNaN(v)) v = ANCHOR_VALIGN_MIDDLE;
		if(v < 0) v = ANCHOR_VALIGN_TOP;
		if(v > 0) v = ANCHOR_VALIGN_BOTTOM;
		var anchor = new Vector(this.width * h / 2, this.height * v / 2).add(this.getPosition());
		this.setAnchor(anchor.x, anchor.y);
		return this.getAnchor();
	}
	this.getAbsoluteAnchor = function() {
		return new Vector(this.x, this.y);
	}
	this.getRelativeCenter = function() {
		var a = this.getAnchor();
		var c = new Vector(-this.anchor.x * this.scaleX, -this.anchor.y * this.scaleY);
		c.rotate(-this.rotation);
		return c;
	}
	this.getAbsoluteCenter = function() {
		return this.getRelativeCenter().add(this.getPosition());
	}
	this.getCenter = function() {
		return this.getAbsoluteCenter();
	}
	this.getDrawRectangle = function() {
		var c = this.getCenter(),
			r = new Rectangle(0, 0, this.width * this.scaleX, this.height * this.scaleY, this.rotation);
		r.move(c.x, c.y);
		return r;
	}
	this.getAABBRectangle = function() {
		var r = this.getDrawRectangle(),
			w = r.AABB[1].x - r.AABB[0].x,
			h = r.AABB[1].y - r.AABB[0].y;
		return new Rectangle(r.AABB[0].x + (w / 2), r.AABB[0].y + (h / 2), w, h, 0);
	}
	this.localToGlobal = function(x, y) {
		var p = ((typeof x == 'object') && (typeof x['x'] != 'undefined') && (typeof x['y'] != 'undefined')) ? new Vector(x.x + 0, x.y + 0) : new Vector(x, y);
		p.rotate(this.rotation).add(this.getPosition());
		return p;
	}
	this.globalToLocal = function(x, y) {
		var p = ((typeof x == 'object') && (typeof x['x'] != 'undefined') && (typeof x['y'] != 'undefined')) ? new Vector(x.x + 0, x.y + 0) : new Vector(x, y);
		p.subtract(this.getPosition()).rotate(-this.rotation);
		return p;
	}
	this.allowDebugDrawing = true;
	this.debugDraw = function() {
		if(!this.visible) return;
		if(!this.allowDebugDrawing) return;
		var a = this.getPosition(),
			c = this.getCenter(),
			r = this.getDrawRectangle(),
			aabb = this.getAABBRectangle();
		stage.drawCircle(a.x, a.y, 1, 1, 'rgba(255,0,0,0.9)');
		stage.drawCircle(c.x, c.y, 1, 1, 'rgba(0,255,0,0.9)');
		stage.drawLine(a.x, a.y, c.x, c.y, 1, 'rgba(255,255,255,0.5)');
		stage.drawPolygon(r.vertices, 0.5, 'rgba(255,0,255,0.5)', 1);
		stage.drawLine(aabb.vertices[0].x, aabb.vertices[0].y, aabb.vertices[2].x, aabb.vertices[2].y, 0.1, 'rgba(255,255,255,0.5)');
		stage.drawLine(aabb.vertices[2].x, aabb.vertices[0].y, aabb.vertices[0].x, aabb.vertices[2].y, 0.1, 'rgba(255,255,255,0.5)');
		stage.drawPolygon(aabb.vertices, 0.5, 'rgba(255,255,255,0.5)');
	}
	this.setZIndex = function(z) {
		this.zIndex = ~~z;
		if(!this.stage) return;
		this.stage.setZIndex(this, ~~z);
	}
	this.eventsListeners = [];
	this.addEventListener = function(type, callback) {
		EventsManager.addEvent(this, type, callback);
	}
	this.removeEventListener = function(type, callback) {
		EventsManager.removeEvent(this, type, callback);
	}
	this.dispatchEvent = function(type, params) {
		return EventsManager.dispatchEvent(this, type, params);
	}
	this.hitTestPoint = function(x, y, checkPixel, checkDragged, debug) {
		if(!this.stage) return false;
		return this.stage.hitTestPointObject(this, x, y, checkPixel, checkDragged, debug);
	}
}

function Tween(obj, prop, start, end, duration, callback) {
	var self = this;
	if(typeof obj != 'object') obj = null;
	if(obj) {
		if(typeof obj[prop] == 'undefined') throw new Error('Trying to tween undefined property "' + prop + '"');
		if(isNaN(obj[prop])) throw new Error('Tweened value can not be ' + (typeof obj[prop]));
	} else {
		if(isNaN(prop)) throw new Error('Tweened value can not be ' + (typeof prop));
	}
	if(typeof callback != 'function') callback = Easing.linear.easeIn;
	this.obj = obj;
	this.prop = prop;
	this.onchange = null;
	this.onfinish = null;
	this.start = start;
	this.end = end;
	this.duration = ~~duration;
	this.callback = callback;
	this.playing = false;
	this._pos = -1;
	this.play = function() {
		self.playing = true;
		self.tick();
	}
	this.pause = function() {
		self.playing = false;
	}
	this.rewind = function() {
		self._pos = -1;
	}
	this.forward = function() {
		self._pos = this.duration;
	}
	this.stop = function() {
		self.pause();
		self.rewind();
	}
	this.updateValue = function(val) {
		if(self.obj) {
			self.obj[self.prop] = val;
		} else {
			self.prop = val;
		}
	}
	this.tick = function() {
		if(!self.playing) return false;
		self._pos++;
		if(self._pos < 0) return false;
		if(self._pos > self.duration) return self.finish();
		var func = self.callback;
		var val = func(self._pos, self.start, self.end - self.start, self.duration);
		this.updateValue(val);
		self.dispatchEvent("change", {
			target: self,
			value: val
		});
		return false;
	}
	this.finish = function() {
		self.stop();
		self.updateValue(self.end);
		return self.dispatchEvent("finish", {
			target: self,
			value: self.end
		});
	}
	this.eventsListeners = [];
	this.addEventListener = function(type, callback) {
		EventsManager.addEvent(this, type, callback);
	}
	this.removeEventListener = function(type, callback) {
		EventsManager.removeEvent(this, type, callback);
	}
	this.dispatchEvent = function(type, params) {
		return EventsManager.dispatchEvent(this, type, params);
	}
}
var Easing = {
	back: {
		easeIn: function(t, b, c, d) {
			var s = 1.70158;
			return c * (t /= d) * t * ((s + 1) * t - s) + b;
		},
		easeOut: function(t, b, c, d) {
			var s = 1.70158;
			return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
		},
		easeInOut: function(t, b, c, d) {
			var s = 1.70158;
			if((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
			return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
		}
	},
	bounce: {
		easeIn: function(t, b, c, d) {
			return c - Easing.bounce.easeOut(d - t, 0, c, d) + b;
		},
		easeOut: function(t, b, c, d) {
			if((t /= d) < (1 / 2.75)) return c * (7.5625 * t * t) + b;
			else if(t < (2 / 2.75)) return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + b;
			else if(t < (2.5 / 2.75)) return c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + b;
			else return c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375) + b;
		},
		easeInOut: function(t, b, c, d) {
			if(t < d / 2) return Easing.bounce.easeIn(t * 2, 0, c, d) * 0.5 + b;
			else return Easing.bounce.easeOut(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
		}
	},
	circular: {
		easeIn: function(t, b, c, d) {
			return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
		},
		easeOut: function(t, b, c, d) {
			return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
		},
		easeInOut: function(t, b, c, d) {
			if((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
			return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
		}
	},
	cubic: {
		easeIn: function(t, b, c, d) {
			return c * (t /= d) * t * t + b;
		},
		easeOut: function(t, b, c, d) {
			return c * ((t = t / d - 1) * t * t + 1) + b;
		},
		easeInOut: function(t, b, c, d) {
			if((t /= d / 2) < 1) return c / 2 * t * t * t + b;
			return c / 2 * ((t -= 2) * t * t + 2) + b;
		}
	},
	exponential: {
		easeIn: function(t, b, c, d) {
			return t == 0 ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
		},
		easeOut: function(t, b, c, d) {
			return t == d ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
		},
		easeInOut: function(t, b, c, d) {
			if(t == 0) return b;
			if(t == d) return b + c;
			if((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
			return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
		}
	},
	linear: {
		easeIn: function(t, b, c, d) {
			return c * t / d + b;
		},
		easeOut: function(t, b, c, d) {
			return c * t / d + b;
		},
		easeInOut: function(t, b, c, d) {
			return c * t / d + b;
		}
	},
	quadratic: {
		easeIn: function(t, b, c, d) {
			return c * (t /= d) * t + b;
		},
		easeOut: function(t, b, c, d) {
			return -c * (t /= d) * (t - 2) + b;
		},
		easeInOut: function(t, b, c, d) {
			if((t /= d / 2) < 1) return c / 2 * t * t + b;
			return -c / 2 * ((--t) * (t - 2) - 1) + b;
		}
	},
	quartic: {
		easeIn: function(t, b, c, d) {
			return c * (t /= d) * t * t * t + b;
		},
		easeOut: function(t, b, c, d) {
			return -c * ((t = t / d - 1) * t * t * t - 1) + b;
		},
		easeInOut: function(t, b, c, d) {
			if((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
			return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
		}
	},
	quintic: {
		easeIn: function(t, b, c, d) {
			return c * (t /= d) * t * t * t * t + b;
		},
		easeOut: function(t, b, c, d) {
			return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
		},
		easeInOut: function(t, b, c, d) {
			if((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
			return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
		}
	},
	sine: {
		easeIn: function(t, b, c, d) {
			return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
		},
		easeOut: function(t, b, c, d) {
			return c * Math.sin(t / d * (Math.PI / 2)) + b;
		},
		easeInOut: function(t, b, c, d) {
			return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
		}
	}
}

function StageTimer(callback, timeout, repeat) {
	this.repeat = repeat;
	this.initialTimeout = timeout;
	this.timeout = timeout;
	this.callback = callback;
	this.paused = false;
	this.update = function() {
		if(this.paused) return;
		this.timeout--;
		if(this.timeout == 0) {
			if(typeof this.callback == "function") this.callback();
			if(typeof this.callback == "string") eval(this.callback);
			if(this.repeat) this.timeout = this.initialTimeout;
			else return true;
		}
		return false;
	};
	this.resume = function() {
		this.paused = false;
	};
	this.pause = function() {
		this.paused = true;
	};
}

function Stage(cnsId, w, h) {
	var self = this;
	this.canvas = document.getElementById(cnsId);
	this.canvas.renderController = this;
	this.canvas.ctx = this.canvas.getContext('2d');
	this.screenWidth = w;
	this.screenHeight = h;
	this.viewport = {
		x: 0,
		y: 0
	};
	this.objects = [];
	this.objectsCounter = 0;
	this.buffer = document.createElement('canvas');
	this.buffer.width = w * Utils.globalScale;
	this.buffer.height = h * Utils.globalScale;
	this.buffer.ctx = this.buffer.getContext('2d');
	this.delay = 40;
	this.fillColor = false;
	this.started = false;
	this.fps = 0;
	this.lastFPS = 0;
	this.showFPS = false;
	this.pixelClickEvent = false;
	this.pixelMouseUpEvent = false;
	this.pixelMouseDownEvent = false;
	this.pixelMouseMoveEvent = false;
	this.ceilSizes = false;
	this.tmMain
	this.tmFPS
	this.partialUpdate = false;
	this.clearLock = false;
	this.destroy = function() {
		clearTimeout(this.tmMain);
		clearTimeout(this.tmFPS);
		this.stop();
		this.clear();
		this.clearScreen(this.canvas);
	}
	this.clearScreen = function(canvas) {
		canvas.ctx.clearRect(0, 0, this.screenWidth * Utils.globalScale * Utils.globalPixelScale, this.screenHeight * Utils.globalScale * Utils.globalPixelScale);
	}
	this.findMaxZIndex = function() {
		var max = -1;
		var ix = false;
		for(var i = 0; i < this.objects.length; i++) {
			if(this.objects[i].zIndex > max) {
				max = this.objects[i].zIndex;
				ix = i;
			}
		}
		return {
			index: ix,
			zIndex: max
		};
	};
	this.findMinZIndex = function() {
		var min = -1;
		var ix = false;
		for(var i = 0; i < this.objects.length; i++) {
			if(i == 0) {
				min = this.objects[i].zIndex;
				ix = 0;
			}
			if(this.objects[i].zIndex < min) {
				min = this.objects[i].zIndex;
				ix = i;
			}
		}
		return {
			index: ix,
			zIndex: min
		};
	};
	this.addChild = function(item) {
		var f = this.findMaxZIndex();
		var z = item.zIndex;
		if(f.index !== false) item.zIndex = f.zIndex + 1;
		else item.zIndex = 0;
		this.objectsCounter++;
		item.uid = this.objectsCounter;
		item.stage = this;
		this.objects.push(item);
		if(z != 0) {
			this.setZIndex(item, ~~z);
		}
		item.dispatchEvent("add", {
			target: item
		});
		return item;
	};
	this.removeChild = function(item) {
		if(item) {
			this.clearObjectTweens(item);
			item.dispatchEvent("remove", {
				target: item
			});
			item.stage = null;
			this.objects = Utils.removeFromArray(this.objects, item);
		}
	};
	this.setZIndex = function(item, index) {
		var bSort = true;
		var i, tmp;
		item.zIndex = index;
		while(bSort) {
			bSort = false;
			for(i = 0; i < this.objects.length - 1; i++) {
				if(this.objects[i].zIndex > this.objects[i + 1].zIndex) {
					tmp = this.objects[i];
					this.objects[i] = this.objects[i + 1];
					this.objects[i + 1] = tmp;
					bSort = true;
				}
			}
		}
	}
	this.hitTestPointObject = function(obj, x, y, pixelCheck, includeDragged, debug) {
		var cX, cY, cW, cH, mX, mY, r, present, imageData;
		cW = obj.width * Math.abs(obj.scaleX);
		cH = obj.height * Math.abs(obj.scaleY);
		cX = obj.x - cW / 2;
		cY = obj.y - cH / 2;
		mX = x;
		mY = y;
		if(!obj.ignoreViewport) {
			mX += this.viewport.x;
			mY += this.viewport.y;
		}
		present = false;
		if(obj.rotation == 0) {
			if(cX <= mX && cY <= mY && cX + cW >= mX && cY + cH >= mY) present = true;
		} else {
			r = obj.getDrawRectangle();
			if(r.hitTestPoint(new Vector(mX, mY))) present = true;
		}
		if(present && pixelCheck) {
			this.buffer.width = this.screenWidth * Utils.globalScale * Utils.globalPixelScale;
			this.buffer.height = this.screenHeight * Utils.globalScale * Utils.globalPixelScale;
			this.clearScreen(this.buffer);
			this.renderObject(this.buffer, obj);
			var pX = Math.floor(x * Utils.globalScale * Utils.globalPixelScale);
			var pY = Math.floor(y * Utils.globalScale * Utils.globalPixelScale);

			//jinlongz
			// imageData = this.buffer.ctx.getImageData(pX, pY, 1, 1);
			// if(imageData.data[3] == 0) present = false;
		}
		if(!present && includeDragged && obj.dragged) present = true;
		return present;
	}
	this.getObjectsStackByCoord = function(x, y, pixelCheck, includeDragged, debug) {
		var obj;
		var tmp = [];
		for(var i = 0; i < this.objects.length; i++) {
			if(this.objects[i].visible || this.objects[i].eventsWhenInvisible) {
				obj = this.objects[i];
				if(this.hitTestPointObject(obj, x, y, pixelCheck, includeDragged, debug)) {
					tmp.push(obj);
				}
			}
		}
		return tmp;
	};
	this.getMaxZIndexInStack = function(stack) {
		var max = -1;
		var ix = 0;
		for(var i = 0; i < stack.length; i++) {
			if(stack[i].zIndex > max) {
				max = stack[i].zIndex;
				ix = i;
			}
		}
		return ix;
	};
	this.sortStack = function(stack, revert) {
		var bSort = true;
		var ok;
		var i, tmp;
		while(bSort) {
			bSort = false;
			for(i = 0; i < stack.length - 1; i++) {
				ok = false;
				if(stack[i].zIndex < stack[i + 1].zIndex && !revert) ok = true;
				if(stack[i].zIndex > stack[i + 1].zIndex && revert) ok = true;
				if(ok) {
					tmp = stack[i];
					stack[i] = stack[i + 1];
					stack[i + 1] = tmp;
					bSort = true;
				}
			}
		}
		return stack;
	}
	this.finalizeMouseCoords = function(obj, m) {
		if(!obj) return m;
		var eX = this.prepareMouseCoord(m.x);
		var eY = this.prepareMouseCoord(m.y);
		if(!obj.ignoreViewport) {
			eX += this.viewport.x;
			eY += this.viewport.y;
		}
		eX = eX - obj.x;
		eY = eY - obj.y;
		return {
			x: eX,
			y: eY
		};
	}
	this.prepareMouseCoord = function(val) {
		return val / Utils.globalScale / Utils.globalPixelScale;
	}
	this.checkClick = function(event) {
		var m = Utils.getMouseCoord(event, this.canvas);
		var stack = this.getObjectsStackByCoord(this.prepareMouseCoord(m.x), this.prepareMouseCoord(m.y), this.pixelClickEvent, false, true);
		var ret, f;
		if(stack.length > 0) {
			stack = this.sortStack(stack);
			for(var i = 0; i < stack.length; i++) {
				f = this.finalizeMouseCoords(stack[i], m);
				ret = stack[i].dispatchEvent("click", {
					target: stack[i],
					x: f.x,
					y: f.y
				});
				if(ret === false) return;
			}
		}
	};
	this.checkContextMenu = function(event) {
		var m = Utils.getMouseCoord(event, this.canvas);
		var stack = this.getObjectsStackByCoord(this.prepareMouseCoord(m.x), this.prepareMouseCoord(m.y), this.pixelClickEvent);
		var ret, f;
		if(stack.length > 0) {
			stack = this.sortStack(stack);
			for(var i = 0; i < stack.length; i++) {
				f = this.finalizeMouseCoords(stack[i], m);
				ret = stack[i].dispatchEvent("contextmenu", {
					target: stack[i],
					x: f.x,
					y: f.y
				});
				if(ret === false) return;
			}
		}
	};
	this.checkMouseMove = function(event) {
		var m = Utils.getMouseCoord(event, this.canvas);
		for(i = 0; i < this.objects.length; i++) {
			if(this.objects[i].dragged) {
				var eX = m.x / Utils.globalScale / Utils.globalPixelScale;
				var eY = m.y / Utils.globalScale / Utils.globalPixelScale;
				if(!this.objects[i].ignoreViewport) {
					eX += this.viewport.x;
					eY += this.viewport.y;
				}
				this.objects[i].x = eX - this.objects[i].dragX;
				this.objects[i].y = eY - this.objects[i].dragY;
			}
		}
		var stack = this.getObjectsStackByCoord(this.prepareMouseCoord(m.x), this.prepareMouseCoord(m.y), this.pixelMouseMoveEvent);
		var i, n, ret, bOk, f;
		var overStack = [];
		if(stack.length > 0) {
			stack = this.sortStack(stack);
			for(i = 0; i < stack.length; i++) {
				overStack.push(stack[i]);
				f = this.finalizeMouseCoords(stack[i], m);
				if(!stack[i].mouseOn) ret = stack[i].dispatchEvent("mouseover", {
					target: stack[i],
					x: f.x,
					y: f.y
				});
				stack[i].mouseOn = true;
				if(ret === false) break;
			}
			for(i = 0; i < stack.length; i++) {
				f = this.finalizeMouseCoords(stack[i], m);
				ret = stack[i].dispatchEvent("mousemove", {
					target: stack[i],
					x: f.x,
					y: f.y
				});
				if(ret === false) break;
			}
		}
		for(i = 0; i < this.objects.length; i++) {
			if(this.objects[i].mouseOn) {
				bOk = false;
				for(n = 0; n < overStack.length; n++) {
					if(overStack[n] == this.objects[i]) bOk = true;
				}
				if(!bOk) {
					this.objects[i].mouseOn = false;
					f = this.finalizeMouseCoords(stack[i], m);
					ret = this.objects[i].dispatchEvent("mouseout", {
						target: this.objects[i],
						x: f.x,
						y: f.y
					});
					if(ret === false) break;
				}
			}
		}
	};
	this.checkMouseDown = function(event) {
		var m = Utils.getMouseCoord(event, this.canvas);
		var stack = this.getObjectsStackByCoord(this.prepareMouseCoord(m.x), this.prepareMouseCoord(m.y), this.pixelMouseDownEvent);
		var ret, f;
		if(stack.length > 0) {
			stack = this.sortStack(stack);
			for(var i = 0; i < stack.length; i++) {
				f = this.finalizeMouseCoords(stack[i], m);
				ret = stack[i].dispatchEvent("mousedown", {
					target: stack[i],
					x: f.x,
					y: f.y
				});
				if(ret === false) return;
			}
		}
	};
	this.checkMouseUp = function(event) {
		var m = Utils.getMouseCoord(event, this.canvas);
		var stack = this.getObjectsStackByCoord(this.prepareMouseCoord(m.x), this.prepareMouseCoord(m.y), this.pixelMouseUpEvent, true);
		var ret, f;
		if(stack.length > 0) {
			stack = this.sortStack(stack);
			for(var i = 0; i < stack.length; i++) {
				f = this.finalizeMouseCoords(stack[i], m);
				ret = stack[i].dispatchEvent("mouseup", {
					target: stack[i],
					x: f.x,
					y: f.y
				});
				if(ret === false) return;
			}
		}
	};
	this.clear = function() {
		for(var i = 0; i < this.objects.length; i++) {
			this.objects[i].dispatchEvent("remove", {
				target: this.objects[i]
			});
		}
		this.objects = [];
		this.tweens = [];
		this.timers = [];
		this.eventsListeners = [];
		this.objectsCounter = 0;
	};
	this.hitTest = function(obj1, obj2) {
		if(obj1.rotation == 0 && obj2.rotation == 0) {
			var cX1 = obj1.getX() - obj1.getWidth() / 2;
			var cY1 = obj1.getY() - obj1.getHeight() / 2;
			var cX2 = obj2.getX() - obj2.getWidth() / 2;
			var cY2 = obj2.getY() - obj2.getHeight() / 2;
			var top = Math.max(cY1, cY2);
			var left = Math.max(cX1, cX2);
			var right = Math.min(cX1 + obj1.getWidth(), cX2 + obj2.getWidth());
			var bottom = Math.min(cY1 + obj1.getHeight(), cY2 + obj2.getHeight());
			var width = right - left;
			var height = bottom - top;
			if(width > 0 && height > 0) return true;
			else return false;
		} else {
			var r1 = obj1.getDrawRectangle(),
				r2 = obj2.getDrawRectangle();
			return r1.hitTestRectangle(r2);
		}
	};
	this.drawRectangle = function(x, y, width, height, color, fill, opacity, ignoreViewport) {
		var cns = this.canvas;
		if(typeof opacity != 'undefined') cns.ctx.globalAlpha = opacity;
		else cns.ctx.globalAlpha = 1;
		cns.ctx.fillStyle = color;
		cns.ctx.strokeStyle = color;
		if(!ignoreViewport) {
			x -= this.viewport.x;
			y -= this.viewport.y;
		}
		x = x * Utils.globalScale * Utils.globalPixelScale;
		y = y * Utils.globalScale * Utils.globalPixelScale;
		width = width * Utils.globalScale * Utils.globalPixelScale;
		height = height * Utils.globalScale * Utils.globalPixelScale;
		if(fill) cns.ctx.fillRect(x - width / 2, y - height / 2, width, height);
		else cns.ctx.strokeRect(x - width / 2, y - height / 2, width, height);
	};
	this.drawCircle = function(x, y, radius, width, color, opacity, ignoreViewport) {
		this.drawArc(x, y, radius, 0, Math.PI * 2, false, width, color, opacity, ignoreViewport);
	};
	this.drawArc = function(x, y, radius, startAngle, endAngle, anticlockwise, width, color, opacity, ignoreViewport) {
		var cns = this.canvas;
		var oldLW = cns.ctx.lineWidth;
		if(typeof color == "undefined") color = "#000"
		cns.ctx.strokeStyle = color;
		if(typeof width == "undefined") width = 1;
		cns.ctx.lineWidth = width * Utils.globalScale * Utils.globalPixelScale;
		if(typeof opacity == "undefined") opacity = 1;
		cns.ctx.globalAlpha = opacity;
		if(!ignoreViewport) {
			x -= this.viewport.x;
			y -= this.viewport.y;
		}
		x = x * Utils.globalScale * Utils.globalPixelScale;
		y = y * Utils.globalScale * Utils.globalPixelScale;
		radius = radius * Utils.globalScale * Utils.globalPixelScale;
		cns.ctx.beginPath();
		cns.ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
		cns.ctx.stroke();
		cns.ctx.lineWidth = oldLW;
	};
	this.drawPolygon = function(points, width, color, opacity, ignoreViewport) {
		if((typeof points != "object") || !(points instanceof Array) || points.length < 2) return;
		for(var i = 0; i < points.length - 1; i++) {
			this.drawLine(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y, width, color, opacity, ignoreViewport);
		}
		this.drawLine(points[i].x, points[i].y, points[0].x, points[0].y, width, color, opacity, ignoreViewport);
	}
	this.drawLine = function(x1, y1, x2, y2, width, color, opacity, ignoreViewport) {
		var cns = this.canvas;
		var oldLW = cns.ctx.lineWidth;
		if(color) cns.ctx.strokeStyle = color;
		else cns.ctx.strokeStyle = '#000';
		if(width) cns.ctx.lineWidth = width * Utils.globalScale * Utils.globalPixelScale;
		else cns.ctx.lineWidth = 1 * Utils.globalScale * Utils.globalPixelScale;
		if(opacity) cns.ctx.globalAlpha = opacity;
		else cns.ctx.globalAlpha = 1;
		if(!ignoreViewport) {
			x1 -= this.viewport.x;
			y1 -= this.viewport.y;
			x2 -= this.viewport.x;
			y2 -= this.viewport.y;
		}
		x1 = x1 * Utils.globalScale * Utils.globalPixelScale;
		y1 = y1 * Utils.globalScale * Utils.globalPixelScale;
		x2 = x2 * Utils.globalScale * Utils.globalPixelScale;
		y2 = y2 * Utils.globalScale * Utils.globalPixelScale;
		cns.ctx.beginPath();
		cns.ctx.moveTo(x1, y1);
		cns.ctx.lineTo(x2, y2);
		cns.ctx.closePath();
		cns.ctx.stroke();
		cns.ctx.lineWidth = oldLW;
	};
	this.start = function() {
		if(this.started) return;
		this.started = true;
		clearFPS();
		render();
	}
	this.forceRender = function() {
		if(this.started) render();
	}
	this.stop = function() {
		this.started = false;
	}

	function clearFPS() {
		self.lastFPS = self.fps;
		self.fps = 0;
		if(self.started) self.tmFPS = setTimeout(clearFPS, 1000);
	}
	this.setTextStyle = function(font, size, style, color, borderColor, canvas) {
		var cns = (canvas ? canvas : this.canvas);
		cns.ctx.fillStyle = color;
		cns.ctx.strokeStyle = borderColor;
		var s = "";
		if(style) s += style + " ";
		if(size) s += Math.floor(size * Utils.globalScale * Utils.globalPixelScale) + "px ";
		if(font) s += font;
		cns.ctx.font = s;
	}
	this.drawText = function(text, x, y, opacity, ignoreViewport, alignCenter, canvas) {
		var cns = (canvas ? canvas : this.canvas);
		if(typeof opacity == "undefined") cns.ctx.globalAlpha = 1;
		else cns.ctx.globalAlpha = opacity;
		if(!ignoreViewport) {
			x -= this.viewport.x;
			y -= this.viewport.y;
		}
		x = x * Utils.globalScale * Utils.globalPixelScale;
		y = y * Utils.globalScale * Utils.globalPixelScale;
		if(alignCenter) x = x - this.getTextWidth(text) / 2;
		cns.ctx.fillText(text, x, y);
	}
	this.strokeText = function(text, x, y, opacity, ignoreViewport, alignCenter, canvas) {
		var cns = (canvas ? canvas : this.canvas);
		if(typeof opacity == "undefined") cns.ctx.globalAlpha = 1;
		else cns.ctx.globalAlpha = opacity;
		if(!ignoreViewport) {
			x -= this.viewport.x;
			y -= this.viewport.y;
		}
		x = x * Utils.globalScale * Utils.globalPixelScale;
		y = y * Utils.globalScale * Utils.globalPixelScale;
		if(alignCenter) x = x - this.getTextWidth(text) / 2;
		cns.ctx.strokeText(text, x, y);
	}
	this.getTextWidth = function(str, canvas) {
		var cns = (canvas ? canvas : this.canvas);
		return cns.ctx.measureText(str).width;
	}
	this.allowDebugDrawing = false;
	this.allowStaticDebugDrawing = false;
	this.renderObject = function(cns, obj) {
		var
		r = obj.getDrawRectangle(),
			ow = obj.width * Utils.globalScale,
			oh = obj.height * Utils.globalScale,
			ox = r.center.x * Utils.globalPixelScale * Utils.globalScale - Math.floor(ow / 2),
			oy = r.center.y * Utils.globalPixelScale * Utils.globalScale - Math.floor(oh / 2),
			or = obj.rotation,
			scX = obj.scaleX * Utils.globalPixelScale,
			scY = obj.scaleY * Utils.globalPixelScale,
			canvasMod = Boolean(or != 0 || scX != 1 || scY != 1);
		if(!obj.ignoreViewport) {
			ox -= this.viewport.x * Utils.globalPixelScale * Utils.globalScale;
			oy -= this.viewport.y * Utils.globalPixelScale * Utils.globalScale;
		}
		if(canvasMod) {
			cns.ctx.save();
			cns.ctx.translate(ox + Math.floor(ow / 2), oy + Math.floor(oh / 2));
			cns.ctx.rotate(or);
			cns.ctx.scale(scX, scY);
			ox = -Math.floor(ow / 2);
			oy = -Math.floor(oh / 2);
		}
		cns.ctx.globalAlpha = obj.opacity;
		if(this.ceilSizes) {
			ow = Math.ceil(ow);
			oh = Math.ceil(oh);
		}
		if(obj.fillColor) {
			cns.ctx.fillStyle = obj.fillColor;
			cns.ctx.strokeStyle = obj.fillColor;
			cns.ctx.fillRect(ox, oy, ow, oh);
		}
		if(obj.bitmap) {
			var iw = obj.bitmap.width,
				ih = obj.bitmap.height;
			var fx = obj.currentLayer * ow + obj.offset.left * Utils.globalScale,
				fy = obj.currentFrame * oh + obj.offset.top * Utils.globalScale;
			if(fx < iw && fy < ih) {
				var fw = ow,
					fh = oh,
					masked = false;
				if(fx + fw > iw) fw = iw - fx;
				if(fy + fh > ih) fh = ih - fy;
				if(obj.mask) {
					this.buffer.ctx.save();
					this.buffer.ctx.clearRect(0, 0, fw, fh);
					this.buffer.ctx.drawImage(obj.bitmap, fx, fy, fw, fh, 0, 0, fw, fh);
					this.buffer.ctx.globalCompositeOperation = "destination-in";
					this.buffer.ctx.drawImage(obj.mask, 0, 0);
					fx = 0;
					fy = 0;
					masked = true;
				}
				try {
					cns.ctx.drawImage((masked ? this.buffer : obj.bitmap), ~~fx, ~~fy, ~~fw, ~~fh, ~~ox, ~~oy, ~~ow, ~~oh);
				} catch(e) {}
				if(masked) this.buffer.ctx.restore();
			}
		}
		if(canvasMod) cns.ctx.restore();
		if(this.allowDebugDrawing && obj.allowDebugDrawing) {
			if(this.allowStaticDebugDrawing || !obj.static) {
				obj.debugDraw();
			}
		}
		obj.dispatchEvent("render", {
			target: obj,
			canvas: cns
		});
	}
	this.clearObjectAABB = function(cns, obj) {
		var w = obj.history.AABB[1].x - obj.history.AABB[0].x;
		var h = obj.history.AABB[1].y - obj.history.AABB[0].y;
		if(!this.fillColor) cns.ctx.clearRect((obj.history.AABB[0].x - this.viewport.x) * Utils.globalPixelScale, (obj.history.AABB[0].y - this.viewport.y) * Utils.globalPixelScale, w * Utils.globalPixelScale, h * Utils.globalPixelScale);
		else {
			cns.ctx.fillStyle = this.fillColor;
			cns.ctx.fillRect((obj.history.AABB[0].x - this.viewport.x) * Utils.globalPixelScale, (obj.history.AABB[0].y - this.viewport.y) * Utils.globalPixelScale, w * Utils.globalPixelScale, h * Utils.globalPixelScale);
		}
	};
	this.addPartialDraw = function(partialDraw, obj) {
		partialDraw.push(obj);
		obj.history.drawed = true;
		obj.history.changed = true;
		for(var i = 0; i < this.objects.length; i++) {
			if(!this.objects[i].history.changed && this.objects[i].visible && !this.objects[i]['static']) {
				var top = Math.max(obj.history.AABB[0].y, this.objects[i].history.AABB[0].y);
				var left = Math.max(obj.history.AABB[0].x, this.objects[i].history.AABB[0].x);
				var right = Math.min(obj.history.AABB[1].x, this.objects[i].history.AABB[1].x);
				var bottom = Math.min(obj.history.AABB[1].y, this.objects[i].history.AABB[1].y);
				var width = right - left;
				var height = bottom - top;
				if(width > 0 && height > 0) this.addPartialDraw(partialDraw, this.objects[i]);
			}
		}
		return partialDraw;
	};
	this.drawScenePartial = function(cns) {
		var partialDraw = [];
		var rect, obj;
		if(!cns.ctx) cns.ctx = cns.getContext("2d");
		for(var i = 0; i < this.objects.length; i++) {
			this.objects[i].nextFrame();
		}
		for(i = 0; i < this.objects.length; i++) {
			obj = this.objects[i];
			if(obj.visible && !obj['static']) {
				if(obj.destroy || obj.drawAlways || !obj.history.drawed || obj.currentFrame != obj.history.frame || obj.getX() != obj.history.x || obj.getY() != obj.history.y || obj.rotation != obj.history.rotation) {
					partialDraw = this.addPartialDraw(partialDraw, obj);
				}
			}
		}
		partialDraw = this.sortStack(partialDraw, true);
		var w, h;
		for(i = 0; i < partialDraw.length; i++) {
			this.clearObjectAABB(cns, partialDraw[i]);
		}
		for(i = 0; i < partialDraw.length; i++) {
			obj = partialDraw[i];
			if(obj.destroy) {
				this.removeChild(obj);
			} else {
				this.renderObject(cns, obj);
				obj.updateHistory();
			}
		}
	}
	this.drawScene = function(cns, drawStatic) {
		var obj, ok;
		if(!cns.ctx) cns.ctx = cns.getContext("2d");
		if(!this.fillColor) {
			if(!this.clearLock) this.clearScreen(cns);
		} else {
			cns.ctx.fillStyle = this.fillColor;
			cns.ctx.fillRect(0, 0, this.screenWidth * Utils.globalScale * Utils.globalPixelScale, this.screenHeight * Utils.globalScale * Utils.globalPixelScale);
		}
		for(var i = 0; i < this.objects.length; i++) {
			obj = this.objects[i];
			ok = false;
			if(!drawStatic && !obj['static']) ok = true;
			if(drawStatic && obj['static']) ok = true;
			if(ok) {
				if(obj.destroy) {
					this.removeChild(obj);
					i--;
				} else {
					obj.nextFrame();
					if(obj.visible) this.renderObject(cns, obj);
				}
			}
		}
	};
	this.tweens = [];
	this.createTween = function(obj, prop, start, end, duration, ease) {
		var t = new Tween(obj, prop, start, end, duration, ease);
		self.tweens.push(t);
		return t;
	}
	this.removeTween = function(t) {
		var id = null;
		if(isNaN(t)) {
			for(var i = 0; i < self.tweens.length; i++) {
				if(self.tweens[i] === t) {
					id = i;
					break;
				}
			}
		} else id = t;
		self.tweens[id].pause();
		self.tweens.splice(id, 1);
		return id;
	}
	this.clearObjectTweens = function(obj) {
		for(var i = 0; i < self.tweens.length; i++) {
			if(self.tweens[i].obj === obj) {
				i = self.removeTween(i);
			}
		}
	}
	this.updateTweens = function() {
		for(var i = 0; i < self.tweens.length; i++) {
			if(self.tweens[i].tick()) {
				i = self.removeTween(i);
			}
		}
	}
	this.timers = [];
	this.setTimeout = function(callback, timeout) {
		var t = new StageTimer(callback, timeout);
		this.timers.push(t);
		return t;
	};
	this.clearTimeout = function(t) {
		this.timers = Utils.removeFromArray(this.timers, t);
	};
	this.setInterval = function(callback, timeout) {
		var t = new StageTimer(callback, timeout, true);
		this.timers.push(t);
		return t;
	};
	this.clearInterval = function(t) {
		this.clearTimeout(t);
	};
	this.updateTimers = function() {
		for(var i = 0; i < this.timers.length; i++) {
			if(this.timers[i].update()) {
				this.clearTimeout(this.timers[i]);
				i--;
			}
		}
	};

	function render() {
		clearTimeout(self.tmMain);
		var tm_start = new Date().getTime();
		self.updateTweens();
		self.updateTimers();
		self.dispatchEvent("pretick");
		if(self.partialUpdate) self.drawScenePartial(self.canvas);
		else self.drawScene(self.canvas, false);
		if(self.showFPS) {
			self.setTextStyle("sans-serif", 10, "bold", "#fff", "#000");
			self.drawText("FPS: " + self.lastFPS, 2, 10, 1, true);
		}
		self.dispatchEvent("posttick");
		var d = new Date().getTime() - tm_start;
		d = self.delay - d - 1;
		if(d < 1) d = 1;
		self.fps++;
		if(self.started) self.tmMain = setTimeout(render, d);
	};
	this.box2dSync = function(world) {
		var p;
		for(b = world.m_bodyList; b; b = b.m_next) {
			if(b.sprite) {
				b.sprite.rotation = b.GetRotation();
				p = b.GetPosition();
				b.sprite.x = p.x;
				b.sprite.y = p.y;
				b.sprite.dispatchEvent("box2dsync", {
					target: b.sprite
				});
			}
		}
	}
	this.processTouchEvent = function(touches, controller) {
		for(var i = 0; i < touches.length; i++) {
			var e = {
				clientX: touches[i].clientX,
				clientY: touches[i].clientY
			};
			self[controller](e);
		}
	}
	var ffOS = (navigator.userAgent.toLowerCase().indexOf("firefox") != -1 && navigator.userAgent.toLowerCase().indexOf("mobile") != -1);
	ffOS = false;
	if(("ontouchstart" in this.canvas) && !ffOS) {
		this.canvas.ontouchstart = function(event) {
			this.renderController.processTouchEvent(event.touches, "checkMouseDown");
			this.renderController.processTouchEvent(event.touches, "checkClick");
		};
		this.canvas.ontouchmove = function(event) {
			this.renderController.processTouchEvent(event.touches, "checkMouseMove");
		};
		this.canvas.ontouchend = function(event) {
			this.renderController.processTouchEvent(event.changedTouches, "checkMouseUp");
		};
	} else {
		this.canvas.onclick = function(event) {
			this.renderController.checkClick(event);
		};
		this.canvas.onmousemove = function(event) {
			this.renderController.checkMouseMove(event);
		};
		this.canvas.onmousedown = function(event) {
			if(event.button == 0) this.renderController.checkMouseDown(event);
		};
		this.canvas.onmouseup = function(event) {
			if(event.button == 0) this.renderController.checkMouseUp(event);
		};
		this.canvas.oncontextmenu = function(event) {
			this.renderController.checkContextMenu(event);
		};
	}
	this.onpretick = null;
	this.onposttick = null;
	this.eventsListeners = [];
	this.addEventListener = function(type, callback) {
		EventsManager.addEvent(this, type, callback);
	}
	this.removeEventListener = function(type, callback) {
		EventsManager.removeEvent(this, type, callback);
	}
	this.dispatchEvent = function(type, params) {
		return EventsManager.dispatchEvent(this, type, params);
	}
}

function Vector(x, y) {
	if(typeof(x) == 'undefined') x = 0;
	this.x = x;
	if(typeof(y) == 'undefined') y = 0;
	this.y = y;
	this.clone = function() {
		return new Vector(this.x, this.y);
	}
	this.add = function(p) {
		this.x += p.x;
		this.y += p.y;
		return this;
	}
	this.subtract = function(p) {
		this.x -= p.x;
		this.y -= p.y;
		return this;
	}
	this.mult = function(n) {
		this.x *= n;
		this.y *= n;
		return this;
	}
	this.invert = function() {
		this.mult(-1);
		return this;
	}
	this.rotate = function(angle, offset) {
		if(typeof(offset) == 'undefined') offset = new Vector(0, 0);
		var r = this.clone();
		r.subtract(offset);
		r.x = this.x * Math.cos(angle) + this.y * Math.sin(angle);
		r.y = this.x * -Math.sin(angle) + this.y * Math.cos(angle);
		r.add(offset);
		this.x = r.x;
		this.y = r.y;
		return this;
	}
	this.normalize = function(angle, offset) {
		if(typeof(offset) == 'undefined') offset = new Vector(0, 0);
		this.subtract(offset);
		this.rotate(-angle);
		return this;
	}
	this.getLength = function() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
	this.distanceTo = function(p) {
		p2 = this.clone();
		p2.subtract(p);
		return p2.getLength();
	}
}
var Rectangle = function(x, y, w, h, angle) {
		this.center = new Vector(x, y);
		this.width = w;
		this.height = h;
		this.angle = angle;
		this.vertices = [];
		this.AABB = [];
		this.clone = function() {
			return new Rectangle(this.center.x, this.center.y, this.width, this.height, this.angle);
		}
		this.refreshVertices = function() {
			var w = this.width / 2;
			var h = this.height / 2;
			this.vertices = [];
			this.vertices.push(new Vector(-w, h));
			this.vertices.push(new Vector(w, h));
			this.vertices.push(new Vector(w, -h));
			this.vertices.push(new Vector(-w, -h));
			this.AABB = [this.center.clone(), this.center.clone()];
			for(var i = 0; i < 4; i++) {
				this.vertices[i].rotate(-this.angle, this.center);
				if(this.vertices[i].x < this.AABB[0].x) this.AABB[0].x = this.vertices[i].x;
				if(this.vertices[i].x > this.AABB[1].x) this.AABB[1].x = this.vertices[i].x;
				if(this.vertices[i].y < this.AABB[0].y) this.AABB[0].y = this.vertices[i].y;
				if(this.vertices[i].y > this.AABB[1].y) this.AABB[1].y = this.vertices[i].y;
			}
		}
		this.move = function(x, y) {
			this.center.add(new Vector(x, y));
			this.refreshVertices();
		}
		this.rotate = function(angle) {
			this.angle += angle;
			this.refreshVertices();
		}
		this.hitTestPoint = function(point) {
			var p = point.clone();
			p.normalize(-this.angle, this.center);
			return((Math.abs(p.x) <= (this.width / 2)) && (Math.abs(p.y) <= (this.height / 2)));
		}
		this.hitTestRectangle = function(rect) {
			var r1 = this.clone();
			var r2 = rect.clone();
			var len, len1, len2;
			r1.move(-this.center.x, -this.center.y);
			r2.move(-this.center.x, -this.center.y);
			r2.center.rotate(this.angle);
			r1.rotate(-this.angle);
			r2.rotate(-this.angle);
			len = Math.max(r1.AABB[0].x, r1.AABB[1].x, r2.AABB[0].x, r2.AABB[1].x) - Math.min(r1.AABB[0].x, r1.AABB[1].x, r2.AABB[0].x, r2.AABB[1].x);
			len1 = r1.AABB[1].x - r1.AABB[0].x;
			len2 = r2.AABB[1].x - r2.AABB[0].x;
			if(len > len1 + len2) return false;
			len = Math.max(r1.AABB[0].y, r1.AABB[1].y, r2.AABB[0].y, r2.AABB[1].y) - Math.min(r1.AABB[0].y, r1.AABB[1].y, r2.AABB[0].y, r2.AABB[1].y);
			len1 = r1.AABB[1].y - r1.AABB[0].y;
			len2 = r2.AABB[1].y - r2.AABB[0].y;
			if(len > len1 + len2) return false;
			r1.move(-r2.center.x, -r2.center.y);
			r2.move(-r2.center.x, -r2.center.y);
			r1.center.rotate(r2.angle);
			r1.refreshVertices();
			r1.rotate(-r2.angle);
			r2.rotate(-r2.angle);
			len = Math.max(r1.AABB[0].x, r1.AABB[1].x, r2.AABB[0].x, r2.AABB[1].x) - Math.min(r1.AABB[0].x, r1.AABB[1].x, r2.AABB[0].x, r2.AABB[1].x);
			len1 = r1.AABB[1].x - r1.AABB[0].x;
			len2 = r2.AABB[1].x - r2.AABB[0].x;
			if(len > len1 + len2) return false;
			len = Math.max(r1.AABB[0].y, r1.AABB[1].y, r2.AABB[0].y, r2.AABB[1].y) - Math.min(r1.AABB[0].y, r1.AABB[1].y, r2.AABB[0].y, r2.AABB[1].y);
			len1 = r1.AABB[1].y - r1.AABB[0].y;
			len2 = r2.AABB[1].y - r2.AABB[0].y;
			if(len > len1 + len2) return false;
			return true;
		}
		this.refreshVertices();
	}
var Asset = function(name, src, w, h, f, l) {
		this.name = name + '';
		this.src = src + '';
		this.width = w;
		this.height = h;
		this.frames = f;
		this.layers = l;
		this.bitmap = null;
		this.object = null;
		this.ready = (this.width && this.height);
		this.detectSize = function() {
			if(!this.bitmap) return false;
			try {
				if(isNaN(this.width)) {
					this.width = this.bitmap.width ? parseInt(this.bitmap.width) : 0;
				}
				if(isNaN(this.height)) {
					this.height = this.bitmap.height ? parseInt(this.bitmap.height) : 0;
				}
			} catch(e) {
				if(CRENDER_DEBUG) console.log(e);
			}
			return(!isNaN(this.width) && !isNaN(this.height));
		}
		this.normalize = function(scale) {
			if(this.ready) return;
			if(!this.detectSize()) return;
			if(isNaN(this.frames) || this.frames < 1) this.frames = 1;
			if(isNaN(this.layers) || this.layers < 1) this.layers = 1;
			this.width = Math.ceil((this.width / this.layers) / scale);
			this.height = Math.ceil((this.height / this.frames) / scale);
			this.ready = true;
		}
	}
var AssetsLibrary = function(path, scale, assets) {
		var self = this;
		this.path = 'images';
		this.scale = 1;
		this.items = {};
		this.bitmaps = {};
		this.loaded = false;
		this.onload = null;
		this.onloadprogress = null;
		this.spriteClass = Sprite;
		this.init = function(path, scale) {
			if(typeof path != 'undefined') {
				this.path = path + '';
			}
			if(typeof scale != 'undefined') {
				this.scale = parseFloat(scale);
				if(isNaN(this.scale)) this.scale = 1;
			}
		}
		this.addAssets = function(data) {
			if(typeof data == 'undefined') return;
			if(typeof data != 'object') return;
			for(var i = 0; i < data.length; i++) {
				var item = data[i];
				item.noscale = (typeof item.noscale == 'undefined') ? false : item.noscale;
				if(!item.noscale) item.src = '%SCALE%/' + item.src;
				this.addAsset(item.src, item.name, item.width, item.height, item.frames, item.layers);
			}
		}
		this.addAsset = function(src, name, w, h, f, l) {
			function src2name(src) {
				var name = src.split('/');
				name = name.pop();
				name = name.split('.');
				name = name.shift() + '';
				return name;
			}
			src = src.replace('%SCALE%', '%PATH%/' + this.scale);
			src = src.replace('%PATH%', this.path);
			if(typeof name == 'undefined') name = src2name(src);
			var asset = new Asset(name, src, w, h, f, l);
			this.items[name] = asset;
			return asset;
		}
		this.addObject = function(obj) {
			var asset = this.addAsset('%SCALE%/' + obj.image, obj.name, obj.width * this.scale, obj.height * this.scale, obj.frames, obj.layers);
			if(asset) asset.object = obj;
			return asset;
		}
		this.load = function(onload, onloadprogress) {
			this.onload = onload;
			this.onloadprogress = onloadprogress;
			var preloader = new ImagesPreloader();
			var data = [];
			for(var n in this.items)
			data.push(this.items[n]);
			preloader.load(data, self.onLoadHandler, self.onLoadProgressHandler);
		}
		this.onLoadProgressHandler = function(val) {
			if(typeof self.onloadprogress == 'function') {
				self.onloadprogress(val);
			}
		}
		this.onLoadHandler = function(data) {
			self.loaded = true;
			for(var n in data) {
				var bmp = data[n];
				var asset = self.items[n];
				asset.bitmap = bmp;
				asset.normalize(self.scale);
			}
			if(typeof self.onload == 'function') {
				self.onload(self.items);
			}
		}
		this.getAsset = function(name, checkLoad) {
			var asset = null;
			if((typeof this.items[name] != 'undefined') && (this.items[name].bitmap)) {
				checkLoad = (typeof checkLoad == 'undefined') ? true : checkLoad;
				asset = (!checkLoad || this.items[name].ready) ? this.items[name] : null;
			}
			if(!asset) {
				throw new Error('Trying to get undefined asset "' + name + '"');
			}
			return asset;
		}
		this.getSprite = function(name, params) {
			var mc = null;
			try {
				var asset = this.getAsset(name, true);
				mc = new this.spriteClass(asset.bitmap, asset.width, asset.height, asset.frames, asset.layers);
			} catch(e) {
				mc = new this.spriteClass(null, 1, 1, 1, 1);
			}
			if(typeof params == 'object') {
				for(var prop in params) mc[prop] = params[prop];
			}
			return mc;
		}
		this.getBitmap = function(name) {
			try {
				var asset = this.getAsset(name, true);
				return asset.bitmap;
			} catch(e) {
				return null;
			}
		}
		this.init(path, scale);
		this.addAssets(assets);
	}
if(typeof console == 'undefined') {
	console = {
		log: function() {}
	}
};
var TTLoader = {
	endCallback: null,
	loadedData: null,
	landscapeMode: false,
	skipPlayButton: false,
	create: function(callback, landscape, skipButton) {
		TTLoader.endCallback = callback;
		TTLoader.landscapeMode = landscape;
		TTLoader.skipPlayButton = skipButton;
		TTLoader.fillLogo();
		document.getElementById("progress_container").style.background = "#666";
		document.getElementById("progress_container").style.zIndex = "1000";
		var c = document.getElementById("progress");
		c.setAttribute("valign", "top");
		c.style.verticalAlign = "top";
		c.style.background = "#666";
		var d = document.createElement("div");
		var a = document.createElement("a");
		a.setAttribute("id", "tt_load_logo_c");
		a.setAttribute("href", "http://justplaymobile.com");
		a.setAttribute("target", "_blank");
		var logo = new Image();
		logo.setAttribute("id", "tt_load_logo");
		logo.setAttribute("border", "");
		logo.src = TTLoader.logoSrc[0];
		logo.style.cursor = "pointer";
		a.appendChild(logo);
		d.appendChild(a);
		c.appendChild(d);
		var d = document.createElement("div");
		d.setAttribute("id", "tt_load_progress_cont");
		d.setAttribute("align", "left");
		d.setAttribute("style", "padding: 1px; border: 2px solid #0478b8; background: #fff");
		var d2 = document.createElement("div");
		d2.setAttribute("id", "tt_load_progress");
		d2.setAttribute("style", "width: 0px; background: #0088cd;");
		d2.innerHTML = "&nbsp;";
		d.appendChild(d2);
		c.appendChild(d);
		var d = document.createElement("div");
		d.setAttribute("id", "tt_load_play");
		var button = new Image();
		button.setAttribute("id", "tt_load_button");
		button.src = TTLoader.buttonDisabledSrc;
		d.appendChild(button);
		c.appendChild(d);
		Utils.addEventListener("fitlayout", TTLoader.setSizes);
		TTLoader.setSizes();
		TTLoader.animateLogo();
	},
	setSizes: function() {
		document.getElementById("progress_container").style.width = window.innerWidth + "px";
		document.getElementById("progress_container").style.height = "2048px";
		var c = Utils.globalScale * Utils.globalPixelScale;
		if(!TTLoader.landscapeMode) document.getElementById("progress").style.paddingTop = Math.floor(c * 80) + "px";
		document.getElementById("tt_load_progress_cont").style.width = Math.floor(c * 200) + "px";
		document.getElementById("tt_load_progress").style.height = Math.floor(c * 12) + "px";
		document.getElementById('tt_load_progress').style.width = (c * TTLoader.progressVal * 2) + "px";
		document.getElementById("tt_load_logo").setAttribute("width", Math.floor(c * 180) + "px");
		document.getElementById("tt_load_logo").setAttribute("height", Math.floor(c * 180) + "px");
		document.getElementById("tt_load_button").setAttribute("height", Math.floor(c * 29) + "px");
		document.getElementById("tt_load_button").style.marginTop = Math.floor(c * 20) + "px";
	},
	progressVal: 0,
	showLoadProgress: function(val) {
		TTLoader.progressVal = val;
		TTLoader.setSizes();
	},
	loadComplete: function(data) {
		TTLoader.showLoadProgress(100);
		TTLoader.loadedData = data;
		var b = document.getElementById("tt_load_button");
		if(Utils.touchScreen) {
			document.body.removeEventListener("touchstart", Utils.preventEvent);
			b.ontouchstart = TTLoader.close;
		} else b.onclick = TTLoader.close;
		b.style.cursor = "pointer";
		b.src = TTLoader.buttonSrc;
		b = document.getElementById("tt_load_progress");
		b.style.background = "transparent";
		b = document.getElementById("tt_load_progress_cont");
		b.style.border = "2px solid transparent";
		b.style.background = "transparent";
		document.getElementById("tt_load_button").style.display = "block";
		if(TTLoader.skipPlayButton) TTLoader.close();
	},
	close: function() {
		TTLoader.endCallback(TTLoader.loadedData);
		if(Utils.touchScreen) document.body.addEventListener("touchstart", Utils.preventEvent, false);
	},
	logoSrc: [],
	currentLogoFrame: 0,
	logoOpacity: 0,
	animateLogo: function() {
		if(TTLoader.logoOpacity < 1) {
			TTLoader.logoOpacity += 0.33;
			document.getElementById("tt_load_logo").style.opacity = TTLoader.logoOpacity;
			document.getElementById("tt_load_logo").style.filter = 'alpha(opacity=' + TTLoader.logoOpacity * 10 + ')';
		}
		if(TTLoader.logoOpacity >= 1) {
			document.getElementById("tt_load_logo").src = TTLoader.logoSrc[TTLoader.currentLogoFrame];
			TTLoader.currentLogoFrame++;
			if(TTLoader.currentLogoFrame >= TTLoader.logoSrc.length) TTLoader.currentLogoFrame = TTLoader.logoSrc.length - 1;
		}
		setTimeout(TTLoader.animateLogo, 100);
	},
	fillLogo: function() {
		var tmp = [];
		tmp.push("data:image/png;base64,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");
		tmp.push("data:image/png;base64,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");
		tmp.push("data:image/png;base64,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");
		tmp.push("data:image/png;base64,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");
		tmp.push("data:image/png;base64,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");
		tmp.push("data:image/png;base64,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");
		tmp.push("data:image/png;base64,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");
		tmp.push("data:image/png;base64,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");
		TTLoader.logoSrc = tmp;
	},
	buttonDisabledSrc: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPUAAAA5CAYAAADum22qAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkQ1QTNBNkU3QjYyQTExRTFCOTFEOEE4MERBQkY4RkI5IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkQ1QTNBNkU4QjYyQTExRTFCOTFEOEE4MERBQkY4RkI5Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDVBM0E2RTVCNjJBMTFFMUI5MUQ4QTgwREFCRjhGQjkiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RDVBM0E2RTZCNjJBMTFFMUI5MUQ4QTgwREFCRjhGQjkiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6GWrnZAAAcKklEQVR42sxdW6xVVXde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",
	buttonSrc: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPUAAAA5CAYAAADum22qAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkFCRjBBQUNCQjYxRjExRTFCOTYxODNDQTQ3QUVGNDJDIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkFCRjBBQUNDQjYxRjExRTFCOTYxODNDQTQ3QUVGNDJDIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6QUJGMEFBQzlCNjFGMTFFMUI5NjE4M0NBNDdBRUY0MkMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6QUJGMEFBQ0FCNjFGMTFFMUI5NjE4M0NBNDdBRUY0MkMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6WuWFeAAAao0lEQVR42uxda5AcV3U+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"
};;
var levels = [{
	objects: [{
		type: "star",
		x: 16,
		y: 140,
		rotation: 0
	}, {
		type: "star",
		x: 47,
		y: 118,
		rotation: 0
	}, {
		type: "star",
		x: 89,
		y: 94,
		rotation: 0
	}, {
		type: "star",
		x: 113,
		y: 117,
		rotation: 0
	}, {
		type: "star",
		x: 145,
		y: 146,
		rotation: 0
	}, {
		type: "round1",
		x: 200,
		y: 161,
		rotation: 0
	}, {
		type: "bonus1",
		x: 253,
		y: 178,
		rotation: 0
	}, {
		type: "bomb",
		x: 334,
		y: 40,
		rotation: 0
	}, {
		type: "life",
		x: 399,
		y: 137,
		rotation: 0
	}, {
		type: "mount3",
		x: 341,
		y: 259,
		rotation: 0
	}, {
		type: "tree1",
		x: 34,
		y: 262,
		rotation: 0
	}, {
		type: "round1",
		x: 89,
		y: 92,
		rotation: 0
	}, ],
	joints: []
}, {
	objects: [{
		type: "mount1",
		x: 177,
		y: 222,
		rotation: 0
	}, {
		type: "round1",
		x: 46,
		y: 107,
		rotation: 0
	}, {
		type: "round1",
		x: 330,
		y: 110,
		rotation: 0
	}, {
		type: "mount1",
		x: 422,
		y: 267,
		rotation: 0
	}, {
		type: "cheast",
		x: 161,
		y: 97,
		rotation: 0
	}, {
		type: "star",
		x: 86,
		y: 108,
		rotation: 0
	}, {
		type: "star",
		x: 124,
		y: 103,
		rotation: 0
	}, {
		type: "star",
		x: 378,
		y: 120,
		rotation: 0
	}, {
		type: "star",
		x: 421,
		y: 145,
		rotation: 0
	}, {
		type: "bonus1",
		x: 253,
		y: 98,
		rotation: 0
	}, ],
	joints: []
}, {
	objects: [{
		type: "mount1",
		x: 92,
		y: 229,
		rotation: 0
	}, {
		type: "star",
		x: 34,
		y: 151,
		rotation: 0
	}, {
		type: "star",
		x: 97,
		y: 129,
		rotation: 0
	}, {
		type: "cheast",
		x: 254,
		y: 28,
		rotation: 0
	}, {
		type: "round1",
		x: 259,
		y: 158,
		rotation: 0
	}, {
		type: "star",
		x: 302,
		y: 153,
		rotation: 0
	}, {
		type: "bonus1",
		x: 344,
		y: 129,
		rotation: 0
	}, {
		type: "star",
		x: 384,
		y: 107,
		rotation: 0
	}, {
		type: "enemy",
		x: 455,
		y: 34,
		rotation: 0
	}, {
		type: "round1",
		x: 166,
		y: 158,
		rotation: 0
	}, ],
	joints: []
}, {
	objects: [{
		type: "mount1",
		x: 386,
		y: 230,
		rotation: 0
	}, {
		type: "mount2",
		x: 98,
		y: 69,
		rotation: 0
	}, {
		type: "round1",
		x: 221,
		y: 156,
		rotation: 0
	}, {
		type: "star",
		x: 173,
		y: 189,
		rotation: 0
	}, {
		type: "cheast",
		x: 120,
		y: 175,
		rotation: 0
	}, {
		type: "star",
		x: 66,
		y: 197,
		rotation: 0
	}, {
		type: "star",
		x: 28,
		y: 173,
		rotation: 0
	}, {
		type: "star",
		x: 316,
		y: 142,
		rotation: 0
	}, {
		type: "star",
		x: 456,
		y: 74,
		rotation: 0
	}, {
		type: "enemy",
		x: 305,
		y: 76,
		rotation: 0
	}, {
		type: "round1",
		x: 385,
		y: 91,
		rotation: 0
	}, ],
	joints: []
}, {
	objects: [{
		type: "enemy",
		x: 36,
		y: 148,
		rotation: 0
	}, {
		type: "round1",
		x: 144,
		y: 158,
		rotation: 0
	}, {
		type: "enemy",
		x: 240,
		y: 38,
		rotation: 0
	}, {
		type: "round1",
		x: 314,
		y: 84,
		rotation: 0
	}, {
		type: "enemy",
		x: 357,
		y: 177,
		rotation: 0
	}, {
		type: "round1",
		x: 437,
		y: 206,
		rotation: 0
	}, {
		type: "bonus1",
		x: 16,
		y: 201,
		rotation: 0
	}, {
		type: "bomb",
		x: 232,
		y: 229,
		rotation: 0
	}, {
		type: "mount2",
		x: 427,
		y: 4,
		rotation: 0
	}, {
		type: "cheast",
		x: 232,
		y: 106,
		rotation: 0
	}, {
		type: "star",
		x: 60,
		y: 194,
		rotation: 0
	}, {
		type: "star",
		x: 98,
		y: 175,
		rotation: 0
	}, {
		type: "star",
		x: 190,
		y: 147,
		rotation: 0
	}, {
		type: "star",
		x: 335,
		y: 141,
		rotation: 0
	}, {
		type: "star",
		x: 405,
		y: 214,
		rotation: 0
	}, {
		type: "bonus1",
		x: 270,
		y: 99,
		rotation: 0
	}, {
		type: "star",
		x: 385,
		y: 198,
		rotation: 0
	}, {
		type: "mount1",
		x: 145,
		y: 270,
		rotation: 0
	}, ],
	joints: []
}, {
	objects: [{
		type: "tree1",
		x: 31,
		y: 262,
		rotation: 0
	}, {
		type: "tree1",
		x: 157,
		y: 262,
		rotation: 0
	}, {
		type: "mount1",
		x: 404,
		y: 222,
		rotation: 0
	}, {
		type: "cheast",
		x: 89,
		y: 196,
		rotation: 0
	}, {
		type: "star",
		x: 10,
		y: 112,
		rotation: 0
	}, {
		type: "star",
		x: 53,
		y: 138,
		rotation: 0
	}, {
		type: "star",
		x: 105,
		y: 122,
		rotation: 0
	}, {
		type: "star",
		x: 150,
		y: 138,
		rotation: 0
	}, {
		type: "star",
		x: 255,
		y: 96,
		rotation: 0
	}, {
		type: "round1",
		x: 315,
		y: 74,
		rotation: 0
	}, {
		type: "star",
		x: 406,
		y: 77,
		rotation: 0
	}, {
		type: "mount3",
		x: 276,
		y: 258,
		rotation: 0
	}, {
		type: "bomb",
		x: 214,
		y: 137,
		rotation: 0
	}, {
		type: "enemy",
		x: 376,
		y: 25,
		rotation: 0
	}, {
		type: "enemy",
		x: 84,
		y: 23,
		rotation: 0
	}, ],
	joints: []
}, {
	objects: [{
		type: "mount2",
		x: 265,
		y: 6,
		rotation: 0
	}, {
		type: "mount2",
		x: 96,
		y: 67,
		rotation: 0
	}, {
		type: "mount2",
		x: 444,
		y: 50,
		rotation: 0
	}, {
		type: "life",
		x: 188,
		y: 125,
		rotation: 0
	}, {
		type: "enemy",
		x: 352,
		y: 166,
		rotation: 0
	}, {
		type: "bonus1",
		x: 260,
		y: 104,
		rotation: 0
	}, {
		type: "star",
		x: 30,
		y: 192,
		rotation: 0
	}, {
		type: "star",
		x: 54,
		y: 180,
		rotation: 0
	}, {
		type: "star",
		x: 76,
		y: 167,
		rotation: 0
	}, {
		type: "star",
		x: 100,
		y: 158,
		rotation: 0
	}, {
		type: "star",
		x: 128,
		y: 154,
		rotation: 0
	}, {
		type: "star",
		x: 156,
		y: 143,
		rotation: 0
	}, {
		type: "star",
		x: 227,
		y: 143,
		rotation: 0
	}, {
		type: "star",
		x: 267,
		y: 143,
		rotation: 0
	}, {
		type: "star",
		x: 296,
		y: 157,
		rotation: 0
	}, {
		type: "tree1",
		x: 176,
		y: 262,
		rotation: 0
	}, {
		type: "tree1",
		x: 429,
		y: 263,
		rotation: 0
	}, {
		type: "cheast",
		x: 390,
		y: 206,
		rotation: 0
	}, {
		type: "star",
		x: 435,
		y: 173,
		rotation: 0
	}, {
		type: "round1",
		x: 466,
		y: 175,
		rotation: 0
	}, {
		type: "mount3",
		x: 39,
		y: 259,
		rotation: 0
	}, ],
	joints: []
}, {
	objects: [{
		type: "mount1",
		x: 164,
		y: 221,
		rotation: 0
	}, {
		type: "round1",
		x: 24,
		y: 185,
		rotation: 0
	}, {
		type: "round1",
		x: 85,
		y: 109,
		rotation: 0
	}, {
		type: "star",
		x: 127,
		y: 83,
		rotation: 0
	}, {
		type: "star",
		x: 146,
		y: 93,
		rotation: 0
	}, {
		type: "star",
		x: 164,
		y: 103,
		rotation: 0
	}, {
		type: "star",
		x: 185,
		y: 116,
		rotation: 0
	}, {
		type: "star",
		x: 261,
		y: 186,
		rotation: 0
	}, {
		type: "star",
		x: 279,
		y: 175,
		rotation: 0
	}, {
		type: "star",
		x: 296,
		y: 163,
		rotation: 0
	}, {
		type: "star",
		x: 313,
		y: 150,
		rotation: 0
	}, {
		type: "round1",
		x: 342,
		y: 133,
		rotation: 0
	}, {
		type: "round1",
		x: 427,
		y: 194,
		rotation: 0
	}, {
		type: "star",
		x: 386,
		y: 178,
		rotation: 0
	}, {
		type: "cheast",
		x: 252,
		y: 59,
		rotation: 0
	}, {
		type: "bomb",
		x: 462,
		y: 246,
		rotation: 0
	}, ],
	joints: []
}, {
	objects: [{
		type: "mount1",
		x: 414,
		y: 230,
		rotation: 0
	}, {
		type: "mount1",
		x: 294,
		y: 270,
		rotation: 0
	}, {
		type: "mount1",
		x: 168,
		y: 307,
		rotation: 0
	}, {
		type: "mount3",
		x: 45,
		y: 291,
		rotation: 0
	}, {
		type: "tree1",
		x: 416,
		y: 134,
		rotation: 0
	}, {
		type: "tree1",
		x: 294,
		y: 173,
		rotation: 0
	}, {
		type: "tree1",
		x: 166,
		y: 211,
		rotation: 0
	}, {
		type: "tree1",
		x: 43,
		y: 231,
		rotation: 0
	}, {
		type: "star",
		x: 91,
		y: 160,
		rotation: 0
	}, {
		type: "star",
		x: 342,
		y: 105,
		rotation: 0
	}, {
		type: "star",
		x: 216,
		y: 134,
		rotation: 0
	}, {
		type: "enemy",
		x: 281,
		y: 51,
		rotation: 0
	}, {
		type: "enemy",
		x: 405,
		y: 39,
		rotation: 0
	}, {
		type: "enemy",
		x: 146,
		y: 104,
		rotation: 0
	}, {
		type: "life",
		x: 209,
		y: 30,
		rotation: 0
	}, ],
	joints: []
}, {
	objects: [{
		type: "mount1",
		x: 414,
		y: 230,
		rotation: 0
	}, {
		type: "mount2",
		x: 134,
		y: 68,
		rotation: 0
	}, {
		type: "star",
		x: 209,
		y: 126,
		rotation: 0
	}, {
		type: "star",
		x: 187,
		y: 207,
		rotation: 0
	}, {
		type: "star",
		x: 67,
		y: 161,
		rotation: 0
	}, {
		type: "bonus1",
		x: 38,
		y: 107,
		rotation: 0
	}, {
		type: "round1",
		x: 298,
		y: 123,
		rotation: 0
	}, {
		type: "star",
		x: 364,
		y: 86,
		rotation: 0
	}, {
		type: "star",
		x: 421,
		y: 39,
		rotation: 0
	}, {
		type: "cheast",
		x: 134,
		y: 240,
		rotation: 0
	}, {
		type: "round1",
		x: 235,
		y: 191,
		rotation: 0
	}, ],
	joints: []
}, {
	objects: [{
		type: "mount1",
		x: 414,
		y: 230,
		rotation: 0
	}, {
		type: "star",
		x: 108,
		y: 156,
		rotation: 0
	}, {
		type: "star",
		x: 85,
		y: 141,
		rotation: 0
	}, {
		type: "star",
		x: 64,
		y: 128,
		rotation: 0
	}, {
		type: "round1",
		x: 298,
		y: 123,
		rotation: 0
	}, {
		type: "cheast",
		x: 170,
		y: 244,
		rotation: 0
	}, {
		type: "mount2",
		x: 294,
		y: -7,
		rotation: 0
	}, {
		type: "mount2",
		x: 100,
		y: -6,
		rotation: 0
	}, {
		type: "round1",
		x: 136,
		y: 158,
		rotation: 0
	}, {
		type: "star",
		x: 213,
		y: 212,
		rotation: 0
	}, {
		type: "star",
		x: 229,
		y: 190,
		rotation: 0
	}, {
		type: "star",
		x: 249,
		y: 171,
		rotation: 0
	}, {
		type: "star",
		x: 266,
		y: 152,
		rotation: 0
	}, {
		type: "star",
		x: 192,
		y: 230,
		rotation: 0
	}, {
		type: "enemy",
		x: 365,
		y: 97,
		rotation: 0
	}, {
		type: "bomb",
		x: 432,
		y: 128,
		rotation: 0
	}, {
		type: "life",
		x: 428,
		y: 51,
		rotation: 0
	}, {
		type: "bomb",
		x: 210,
		y: 146,
		rotation: 0
	}, ],
	joints: []
}, {
	objects: [{
		type: "enemy",
		x: 49,
		y: 145,
		rotation: 0
	}, {
		type: "mount1",
		x: 246,
		y: 221,
		rotation: 0
	}, {
		type: "tree1",
		x: 247,
		y: 122,
		rotation: 0
	}, {
		type: "round1",
		x: 249,
		y: 45,
		rotation: 0
	}, {
		type: "star",
		x: 154,
		y: 84,
		rotation: 0
	}, {
		type: "star",
		x: 172,
		y: 73,
		rotation: 0
	}, {
		type: "star",
		x: 192,
		y: 63,
		rotation: 0
	}, {
		type: "star",
		x: 211,
		y: 51,
		rotation: 0
	}, {
		type: "star",
		x: 284,
		y: 51,
		rotation: 0
	}, {
		type: "star",
		x: 303,
		y: 60,
		rotation: 0
	}, {
		type: "star",
		x: 321,
		y: 69,
		rotation: 0
	}, {
		type: "star",
		x: 339,
		y: 80,
		rotation: 0
	}, {
		type: "enemy",
		x: 429,
		y: 89,
		rotation: 0
	}, {
		type: "mount3",
		x: 59,
		y: 258,
		rotation: 0
	}, {
		type: "mount3",
		x: 415,
		y: 258,
		rotation: 0
	}, {
		type: "tree1",
		x: 415,
		y: 196,
		rotation: 0
	}, ],
	joints: []
}, {
	objects: [{
		type: "mount1",
		x: 360,
		y: 244,
		rotation: 0
	}, {
		type: "round1",
		x: 185,
		y: 178,
		rotation: 0
	}, {
		type: "cheast",
		x: 323,
		y: 112,
		rotation: 0
	}, {
		type: "round1",
		x: 100,
		y: 227,
		rotation: 0
	}, {
		type: "enemy",
		x: 44,
		y: 145,
		rotation: 0
	}, {
		type: "mount2",
		x: 359,
		y: 6,
		rotation: 0
	}, {
		type: "round1",
		x: 268,
		y: 125,
		rotation: 0
	}, {
		type: "bonus1",
		x: 142,
		y: 202,
		rotation: 0
	}, {
		type: "star",
		x: 364,
		y: 118,
		rotation: 0
	}, {
		type: "star",
		x: 388,
		y: 125,
		rotation: 0
	}, {
		type: "star",
		x: 410,
		y: 136,
		rotation: 0
	}, {
		type: "star",
		x: 431,
		y: 150,
		rotation: 0
	}, {
		type: "star",
		x: 450,
		y: 163,
		rotation: 0
	}, {
		type: "star",
		x: 468,
		y: 176,
		rotation: 0
	}, ],
	joints: []
}, {
	objects: [{
		type: "mount1",
		x: 37,
		y: 241,
		rotation: 0
	}, {
		type: "mount1",
		x: 109,
		y: 241,
		rotation: 0
	}, {
		type: "round1",
		x: 295,
		y: 62,
		rotation: 0
	}, {
		type: "mount1",
		x: 183,
		y: 241,
		rotation: 0
	}, {
		type: "mount1",
		x: 255,
		y: 241,
		rotation: 0
	}, {
		type: "mount1",
		x: 327,
		y: 242,
		rotation: 0
	}, {
		type: "mount1",
		x: 395,
		y: 242,
		rotation: 0
	}, {
		type: "mount1",
		x: 450,
		y: 243,
		rotation: 0
	}, {
		type: "tree1",
		x: 244,
		y: 145,
		rotation: 0
	}, {
		type: "tree1",
		x: 26,
		y: 145,
		rotation: 0
	}, {
		type: "tree1",
		x: 351,
		y: 144,
		rotation: 0
	}, {
		type: "tree1",
		x: 131,
		y: 143,
		rotation: 0
	}, {
		type: "round1",
		x: 403,
		y: 63,
		rotation: 0
	}, {
		type: "round1",
		x: 188,
		y: 64,
		rotation: 0
	}, {
		type: "round1",
		x: 77,
		y: 63,
		rotation: 0
	}, {
		type: "star",
		x: 243,
		y: 93,
		rotation: 0
	}, {
		type: "star",
		x: 130,
		y: 32,
		rotation: 0
	}, {
		type: "star",
		x: 456,
		y: 94,
		rotation: 0
	}, {
		type: "star",
		x: 23,
		y: 92,
		rotation: 0
	}, {
		type: "bomb",
		x: 248,
		y: 26,
		rotation: 0
	}, {
		type: "bomb",
		x: 355,
		y: 85,
		rotation: 0
	}, {
		type: "bomb",
		x: 136,
		y: 86,
		rotation: 0
	}, {
		type: "bomb",
		x: 460,
		y: 29,
		rotation: 0
	}, {
		type: "bomb",
		x: 28,
		y: 30,
		rotation: 0
	}, {
		type: "life",
		x: 350,
		y: 34,
		rotation: 0
	}, ],
	joints: []
}, {
	objects: [{
		type: "mount1",
		x: 90,
		y: 282,
		rotation: 0
	}, {
		type: "star",
		x: 100,
		y: 137,
		rotation: 0
	}, {
		type: "round1",
		x: 200,
		y: 186,
		rotation: 0
	}, {
		type: "cheast",
		x: 201,
		y: 249,
		rotation: 0
	}, {
		type: "mount2",
		x: 258,
		y: -7,
		rotation: 0
	}, {
		type: "mount2",
		x: 100,
		y: -6,
		rotation: 0
	}, {
		type: "round1",
		x: 138,
		y: 137,
		rotation: 0
	}, {
		type: "star",
		x: 167,
		y: 166,
		rotation: 0
	}, {
		type: "enemy",
		x: 336,
		y: 202,
		rotation: 0
	}, {
		type: "bomb",
		x: 413,
		y: 228,
		rotation: 0
	}, {
		type: "life",
		x: 199,
		y: 111,
		rotation: 0
	}, {
		type: "mount2",
		x: 415,
		y: 66,
		rotation: 0
	}, {
		type: "round1",
		x: 262,
		y: 147,
		rotation: 0
	}, {
		type: "bonus1",
		x: 336,
		y: 66,
		rotation: 0
	}, ],
	joints: []
}, {
	objects: [{
		type: "tree1",
		x: 34,
		y: 264,
		rotation: 0
	}, {
		type: "tree1",
		x: 377,
		y: 263,
		rotation: 0
	}, {
		type: "tree1",
		x: 448,
		y: 261,
		rotation: 0
	}, {
		type: "enemy",
		x: 456,
		y: 203,
		rotation: 0
	}, {
		type: "enemy",
		x: 325,
		y: 151,
		rotation: 0
	}, {
		type: "enemy",
		x: 174,
		y: 154,
		rotation: 0
	}, {
		type: "enemy",
		x: 36,
		y: 199,
		rotation: 0
	}, {
		type: "tree1",
		x: 123,
		y: 263,
		rotation: 0
	}, {
		type: "round1",
		x: 105,
		y: 150,
		rotation: 0
	}, {
		type: "round1",
		x: 176,
		y: 60,
		rotation: 0
	}, {
		type: "round1",
		x: 242,
		y: 139,
		rotation: 0
	}, {
		type: "round1",
		x: 329,
		y: 46,
		rotation: 0
	}, {
		type: "round1",
		x: 397,
		y: 133,
		rotation: 0
	}, {
		type: "cheast",
		x: 255,
		y: 50,
		rotation: 0
	}, {
		type: "cheast",
		x: 140,
		y: 105,
		rotation: 0
	}, {
		type: "cheast",
		x: 364,
		y: 88,
		rotation: 0
	}, {
		type: "mount1",
		x: 252,
		y: 282,
		rotation: 0
	}, ],
	joints: []
}, {
	objects: [{
		type: "cheast",
		x: 369,
		y: 128,
		rotation: 0
	}, {
		type: "enemy",
		x: 116,
		y: 170,
		rotation: 0
	}, {
		type: "mount2",
		x: 307,
		y: 30,
		rotation: 0
	}, {
		type: "bonus1",
		x: 315,
		y: 150,
		rotation: 0
	}, {
		type: "star",
		x: 430,
		y: 50,
		rotation: 0
	}, {
		type: "star",
		x: 58,
		y: 204,
		rotation: 0
	}, {
		type: "star",
		x: 182,
		y: 187,
		rotation: 0
	}, {
		type: "mount1",
		x: 427,
		y: 229,
		rotation: 0
	}, {
		type: "mount1",
		x: 307,
		y: 265,
		rotation: 0
	}, {
		type: "mount1",
		x: 182,
		y: 300,
		rotation: 0
	}, {
		type: "mount1",
		x: 60,
		y: 326,
		rotation: 0
	}, {
		type: "mount2",
		x: 183,
		y: 61,
		rotation: 0
	}, {
		type: "mount2",
		x: 61,
		y: -2,
		rotation: 0
	}, {
		type: "enemy",
		x: 246,
		y: 159,
		rotation: 0
	}, {
		type: "star",
		x: 59,
		y: 170,
		rotation: 0
	}, {
		type: "star",
		x: 58,
		y: 134,
		rotation: 0
	}, {
		type: "tree1",
		x: 426,
		y: 132,
		rotation: 0
	}, {
		type: "bonus1",
		x: 182,
		y: 163,
		rotation: 0
	}, ],
	joints: []
}, {
	objects: [{
		type: "mount2",
		x: 311,
		y: -26,
		rotation: 0
	}, {
		type: "star",
		x: 430,
		y: 50,
		rotation: 0
	}, {
		type: "star",
		x: 58,
		y: 204,
		rotation: 0
	}, {
		type: "mount1",
		x: 417,
		y: 254,
		rotation: 0
	}, {
		type: "mount1",
		x: 311,
		y: 308,
		rotation: 0
	}, {
		type: "mount1",
		x: 182,
		y: 305,
		rotation: 0
	}, {
		type: "mount1",
		x: 44,
		y: 253,
		rotation: 0
	}, {
		type: "mount2",
		x: 179,
		y: -24,
		rotation: 0
	}, {
		type: "mount2",
		x: 44,
		y: 34,
		rotation: 0
	}, {
		type: "mount2",
		x: 416,
		y: 33,
		rotation: 0
	}, {
		type: "bonus1",
		x: 38,
		y: 141,
		rotation: 0
	}, {
		type: "bomb",
		x: 179,
		y: 102,
		rotation: 0
	}, {
		type: "bomb",
		x: 312,
		y: 206,
		rotation: 0
	}, {
		type: "life",
		x: 421,
		y: 144,
		rotation: 0
	}, {
		type: "round1",
		x: 244,
		y: 156,
		rotation: 0
	}, {
		type: "star",
		x: 92,
		y: 155,
		rotation: 0
	}, {
		type: "star",
		x: 112,
		y: 169,
		rotation: 0
	}, {
		type: "star",
		x: 191,
		y: 152,
		rotation: 0
	}, {
		type: "star",
		x: 208,
		y: 165,
		rotation: 0
	}, {
		type: "star",
		x: 293,
		y: 161,
		rotation: 0
	}, {
		type: "star",
		x: 314,
		y: 150,
		rotation: 0
	}, {
		type: "round1",
		x: 353,
		y: 146,
		rotation: 0
	}, ],
	joints: []
}, {
	objects: [{
		type: "enemy",
		x: 156,
		y: 107,
		rotation: 0
	}, {
		type: "mount1",
		x: 45,
		y: 229,
		rotation: 0
	}, {
		type: "enemy",
		x: 329,
		y: 107,
		rotation: 0
	}, {
		type: "tree1",
		x: 117,
		y: 262,
		rotation: 0
	}, {
		type: "tree1",
		x: 178,
		y: 261,
		rotation: 0
	}, {
		type: "tree1",
		x: 242,
		y: 261,
		rotation: 0
	}, {
		type: "tree1",
		x: 310,
		y: 262,
		rotation: 0
	}, {
		type: "tree1",
		x: 375,
		y: 261,
		rotation: 0
	}, {
		type: "mount1",
		x: 440,
		y: 230,
		rotation: 0
	}, {
		type: "round1",
		x: 245,
		y: 182,
		rotation: 0
	}, {
		type: "enemy",
		x: 439,
		y: 32,
		rotation: 0
	}, {
		type: "enemy",
		x: 46,
		y: 32,
		rotation: 0
	}, {
		type: "life",
		x: 247,
		y: 41,
		rotation: 0
	}, {
		type: "star",
		x: 388,
		y: 70,
		rotation: 0
	}, {
		type: "star",
		x: 289,
		y: 146,
		rotation: 0
	}, {
		type: "star",
		x: 202,
		y: 147,
		rotation: 0
	}, {
		type: "star",
		x: 98,
		y: 72,
		rotation: 0
	}, ],
	joints: []
}, {
	objects: [{
		type: "bomb",
		x: 57,
		y: 99,
		rotation: 0
	}, {
		type: "bomb",
		x: 205,
		y: 177,
		rotation: 0
	}, {
		type: "bomb",
		x: 330,
		y: 95,
		rotation: 0
	}, {
		type: "bomb",
		x: 459,
		y: 177,
		rotation: 0
	}, {
		type: "bonus1",
		x: 21,
		y: 203,
		rotation: 0
	}, {
		type: "star",
		x: 55,
		y: 186,
		rotation: 0
	}, {
		type: "star",
		x: 6,
		y: 229,
		rotation: 0
	}, {
		type: "star",
		x: 121,
		y: 139,
		rotation: 0
	}, {
		type: "star",
		x: 204,
		y: 118,
		rotation: 0
	}, {
		type: "star",
		x: 246,
		y: 142,
		rotation: 0
	}, {
		type: "star",
		x: 277,
		y: 172,
		rotation: 0
	}, {
		type: "star",
		x: 312,
		y: 196,
		rotation: 0
	}, {
		type: "round1",
		x: 356,
		y: 201,
		rotation: 0
	}, {
		type: "star",
		x: 396,
		y: 181,
		rotation: 0
	}, {
		type: "star",
		x: 427,
		y: 149,
		rotation: 0
	}, {
		type: "star",
		x: 472,
		y: 100,
		rotation: 0
	}, {
		type: "tree1",
		x: 57,
		y: 263,
		rotation: 0
	}, {
		type: "tree1",
		x: 432,
		y: 263,
		rotation: 0
	}, {
		type: "mount2",
		x: 179,
		y: -21,
		rotation: 0
	}, {
		type: "mount2",
		x: 436,
		y: -21,
		rotation: 0
	}, {
		type: "round1",
		x: 162,
		y: 125,
		rotation: 0
	}, {
		type: "round1",
		x: 86,
		y: 167,
		rotation: 0
	}, {
		type: "round1",
		x: 449,
		y: 119,
		rotation: 0
	}, ],
	joints: []
}, {
	objects: [{
		type: "enemy",
		x: 19,
		y: 22,
		rotation: 0
	}, {
		type: "enemy",
		x: 69,
		y: 85,
		rotation: 0
	}, {
		type: "enemy",
		x: 132,
		y: 141,
		rotation: 0
	}, {
		type: "enemy",
		x: 362,
		y: 125,
		rotation: 0
	}, {
		type: "enemy",
		x: 313,
		y: 193,
		rotation: 0
	}, {
		type: "enemy",
		x: 250,
		y: 253,
		rotation: 0
	}, {
		type: "mount3",
		x: 35,
		y: 262,
		rotation: 0
	}, {
		type: "mount2",
		x: 436,
		y: 13,
		rotation: 0
	}, {
		type: "star",
		x: 98,
		y: 261,
		rotation: 0
	}, {
		type: "star",
		x: 119,
		y: 252,
		rotation: 0
	}, {
		type: "star",
		x: 141,
		y: 239,
		rotation: 0
	}, {
		type: "star",
		x: 160,
		y: 223,
		rotation: 0
	}, {
		type: "star",
		x: 182,
		y: 211,
		rotation: 0
	}, {
		type: "star",
		x: 203,
		y: 199,
		rotation: 0
	}, {
		type: "star",
		x: 223,
		y: 184,
		rotation: 0
	}, {
		type: "star",
		x: 242,
		y: 171,
		rotation: 0
	}, {
		type: "star",
		x: 261,
		y: 158,
		rotation: 0
	}, {
		type: "round1",
		x: 201,
		y: 196,
		rotation: 0
	}, {
		type: "star",
		x: 282,
		y: 144,
		rotation: 0
	}, {
		type: "star",
		x: 298,
		y: 130,
		rotation: 0
	}, {
		type: "star",
		x: 317,
		y: 120,
		rotation: 0
	}, {
		type: "star",
		x: 336,
		y: 107,
		rotation: 0
	}, {
		type: "round1",
		x: 394,
		y: 186,
		rotation: 0
	}, {
		type: "tree1",
		x: 450,
		y: 261,
		rotation: 0
	}, ],
	joints: []
}, {
	objects: [{
		type: "round1",
		x: 390,
		y: 155,
		rotation: 0
	}, {
		type: "round1",
		x: 66,
		y: 152,
		rotation: 0
	}, {
		type: "round1",
		x: 244,
		y: 46,
		rotation: 0
	}, {
		type: "tree1",
		x: 100,
		y: 263,
		rotation: 0
	}, {
		type: "mount1",
		x: 241,
		y: 232,
		rotation: 0
	}, {
		type: "mount1",
		x: 241,
		y: 161,
		rotation: 0
	}, {
		type: "tree1",
		x: 393,
		y: 263,
		rotation: 0
	}, {
		type: "tree1",
		x: 325,
		y: 263,
		rotation: 0
	}, {
		type: "tree1",
		x: 450,
		y: 263,
		rotation: 0
	}, {
		type: "tree1",
		x: 163,
		y: 263,
		rotation: 0
	}, {
		type: "tree1",
		x: 38,
		y: 263,
		rotation: 0
	}, {
		type: "star",
		x: 148,
		y: 98,
		rotation: 0
	}, {
		type: "cheast",
		x: 188,
		y: 70,
		rotation: 0
	}, {
		type: "cheast",
		x: 293,
		y: 68,
		rotation: 0
	}, {
		type: "star",
		x: 338,
		y: 102,
		rotation: 0
	}, {
		type: "bonus1",
		x: 150,
		y: 149,
		rotation: 0
	}, {
		type: "bomb",
		x: 339,
		y: 148,
		rotation: 0
	}, {
		type: "enemy",
		x: 446,
		y: 29,
		rotation: 0
	}, {
		type: "enemy",
		x: 67,
		y: 30,
		rotation: 0
	}, ],
	joints: []
}, {
	objects: [{
		type: "mount2",
		x: 57,
		y: 34,
		rotation: 0
	}, {
		type: "mount2",
		x: 130,
		y: 55,
		rotation: 0
	}, {
		type: "mount2",
		x: 203,
		y: 55,
		rotation: 0
	}, {
		type: "mount2",
		x: 274,
		y: 56,
		rotation: 0
	}, {
		type: "mount2",
		x: 348,
		y: 55,
		rotation: 0
	}, {
		type: "mount2",
		x: 422,
		y: 56,
		rotation: 0
	}, {
		type: "mount1",
		x: 57,
		y: 290,
		rotation: 0
	}, {
		type: "mount1",
		x: 130,
		y: 272,
		rotation: 0
	}, {
		type: "mount1",
		x: 203,
		y: 273,
		rotation: 0
	}, {
		type: "mount1",
		x: 276,
		y: 274,
		rotation: 0
	}, {
		type: "mount1",
		x: 349,
		y: 274,
		rotation: 0
	}, {
		type: "mount1",
		x: 422,
		y: 274,
		rotation: 0
	}, {
		type: "mount1",
		x: 274,
		y: 28,
		rotation: 0
	}, {
		type: "round1",
		x: 30,
		y: 164,
		rotation: 0
	}, {
		type: "round1",
		x: 95,
		y: 166,
		rotation: 0
	}, {
		type: "round1",
		x: 161,
		y: 166,
		rotation: 0
	}, {
		type: "bonus1",
		x: 193,
		y: 163,
		rotation: 0
	}, {
		type: "round1",
		x: 282,
		y: 168,
		rotation: 0
	}, {
		type: "round1",
		x: 361,
		y: 167,
		rotation: 0
	}, {
		type: "life",
		x: 433,
		y: 169,
		rotation: 0
	}, {
		type: "bomb",
		x: 63,
		y: 186,
		rotation: 0
	}, {
		type: "bomb",
		x: 128,
		y: 136,
		rotation: 0
	}, {
		type: "star",
		x: 254,
		y: 176,
		rotation: 0
	}, {
		type: "star",
		x: 233,
		y: 161,
		rotation: 0
	}, {
		type: "star",
		x: 216,
		y: 141,
		rotation: 0
	}, {
		type: "bomb",
		x: 321,
		y: 190,
		rotation: 0
	}, {
		type: "bomb",
		x: 404,
		y: 141,
		rotation: 0
	}, ],
	joints: []
}, {
	objects: [{
		type: "mount1",
		x: 37,
		y: 312,
		rotation: 0
	}, {
		type: "mount1",
		x: 107,
		y: 297,
		rotation: 0
	}, {
		type: "mount1",
		x: 177,
		y: 283,
		rotation: 0
	}, {
		type: "mount1",
		x: 248,
		y: 271,
		rotation: 0
	}, {
		type: "mount1",
		x: 314,
		y: 258,
		rotation: 0
	}, {
		type: "mount1",
		x: 380,
		y: 245,
		rotation: 0
	}, {
		type: "mount1",
		x: 450,
		y: 231,
		rotation: 0
	}, {
		type: "tree1",
		x: 178,
		y: 185,
		rotation: 0
	}, {
		type: "tree1",
		x: 311,
		y: 160,
		rotation: 0
	}, {
		type: "tree1",
		x: 246,
		y: 173,
		rotation: 0
	}, {
		type: "tree1",
		x: 107,
		y: 201,
		rotation: 0
	}, {
		type: "tree1",
		x: 380,
		y: 147,
		rotation: 0
	}, {
		type: "tree1",
		x: 449,
		y: 133,
		rotation: 0
	}, {
		type: "mount2",
		x: 448,
		y: -34,
		rotation: 0
	}, {
		type: "life",
		x: 448,
		y: 72,
		rotation: 0
	}, {
		type: "bonus1",
		x: 102,
		y: 139,
		rotation: 0
	}, {
		type: "bomb",
		x: 350,
		y: 133,
		rotation: 0
	}, {
		type: "bomb",
		x: 280,
		y: 145,
		rotation: 0
	}, {
		type: "bomb",
		x: 214,
		y: 157,
		rotation: 0
	}, {
		type: "bomb",
		x: 143,
		y: 173,
		rotation: 0
	}, {
		type: "bomb",
		x: 73,
		y: 188,
		rotation: 0
	}, {
		type: "bomb",
		x: 417,
		y: 114,
		rotation: 0
	}, {
		type: "star",
		x: 35,
		y: 149,
		rotation: 0
	}, {
		type: "cheast",
		x: 177,
		y: 125,
		rotation: 0
	}, {
		type: "star",
		x: 244,
		y: 109,
		rotation: 0
	}, {
		type: "cheast",
		x: 310,
		y: 95,
		rotation: 0
	}, {
		type: "star",
		x: 380,
		y: 83,
		rotation: 0
	}, {
		type: "mount2",
		x: 377,
		y: -21,
		rotation: 0
	}, {
		type: "mount2",
		x: 305,
		y: -6,
		rotation: 0
	}, {
		type: "mount2",
		x: 245,
		y: 6,
		rotation: 0
	}, {
		type: "mount2",
		x: 171,
		y: 20,
		rotation: 0
	}, {
		type: "mount2",
		x: 101,
		y: 34,
		rotation: 0
	}, {
		type: "mount2",
		x: 31,
		y: 49,
		rotation: 0
	}, ],
	joints: []
}, {
	objects: [{
		type: "mount2",
		x: 38,
		y: 13,
		rotation: 0
	}, {
		type: "mount2",
		x: 112,
		y: 13,
		rotation: 0
	}, {
		type: "mount2",
		x: 256,
		y: 67,
		rotation: 0
	}, {
		type: "mount2",
		x: 445,
		y: 13,
		rotation: 0
	}, {
		type: "mount2",
		x: 387,
		y: 13,
		rotation: 0
	}, {
		type: "mount1",
		x: 115,
		y: 252,
		rotation: 0
	}, {
		type: "mount1",
		x: 388,
		y: 252,
		rotation: 0
	}, {
		type: "round1",
		x: 110,
		y: 133,
		rotation: 0
	}, {
		type: "round1",
		x: 391,
		y: 131,
		rotation: 0
	}, {
		type: "star",
		x: 21,
		y: 194,
		rotation: 0
	}, {
		type: "star",
		x: 47,
		y: 167,
		rotation: 0
	}, {
		type: "star",
		x: 76,
		y: 142,
		rotation: 0
	}, {
		type: "star",
		x: 428,
		y: 140,
		rotation: 0
	}, {
		type: "star",
		x: 462,
		y: 157,
		rotation: 0
	}, {
		type: "bonus1",
		x: 254,
		y: 182,
		rotation: 0
	}, {
		type: "enemy",
		x: 179,
		y: 149,
		rotation: 0
	}, {
		type: "cheast",
		x: 326,
		y: 146,
		rotation: 0
	}, ],
	joints: []
}, {
	objects: [{
		type: "enemy",
		x: 185,
		y: 29,
		rotation: 0
	}, {
		type: "enemy",
		x: 330,
		y: 28,
		rotation: 0
	}, {
		type: "tree1",
		x: 34,
		y: 264,
		rotation: 0
	}, {
		type: "tree1",
		x: 203,
		y: 262,
		rotation: 0
	}, {
		type: "tree1",
		x: 294,
		y: 263,
		rotation: 0
	}, {
		type: "tree1",
		x: 377,
		y: 263,
		rotation: 0
	}, {
		type: "tree1",
		x: 448,
		y: 261,
		rotation: 0
	}, {
		type: "enemy",
		x: 455,
		y: 29,
		rotation: 0
	}, {
		type: "enemy",
		x: 44,
		y: 27,
		rotation: 0
	}, {
		type: "life",
		x: 262,
		y: 48,
		rotation: 0
	}, {
		type: "star",
		x: 398,
		y: 50,
		rotation: 0
	}, {
		type: "star",
		x: 184,
		y: 126,
		rotation: 0
	}, {
		type: "star",
		x: 43,
		y: 131,
		rotation: 0
	}, {
		type: "star",
		x: 116,
		y: 54,
		rotation: 0
	}, {
		type: "enemy",
		x: 400,
		y: 126,
		rotation: 0
	}, {
		type: "enemy",
		x: 262,
		y: 127,
		rotation: 0
	}, {
		type: "enemy",
		x: 114,
		y: 124,
		rotation: 0
	}, {
		type: "enemy",
		x: 456,
		y: 211,
		rotation: 0
	}, {
		type: "enemy",
		x: 332,
		y: 213,
		rotation: 0
	}, {
		type: "enemy",
		x: 188,
		y: 211,
		rotation: 0
	}, {
		type: "enemy",
		x: 42,
		y: 213,
		rotation: 0
	}, {
		type: "tree1",
		x: 123,
		y: 263,
		rotation: 0
	}, {
		type: "star",
		x: 118,
		y: 205,
		rotation: 0
	}, {
		type: "star",
		x: 328,
		y: 128,
		rotation: 0
	}, {
		type: "star",
		x: 401,
		y: 206,
		rotation: 0
	}, {
		type: "star",
		x: 457,
		y: 131,
		rotation: 0
	}, {
		type: "life",
		x: 263,
		y: 203,
		rotation: 0
	}, ],
	joints: []
}, {
	objects: [{
		type: "mount2",
		x: 73,
		y: 65,
		rotation: 0
	}, {
		type: "mount2",
		x: 425,
		y: 65,
		rotation: 0
	}, {
		type: "mount1",
		x: 243,
		y: 238,
		rotation: 0
	}, {
		type: "bonus1",
		x: 251,
		y: 61,
		rotation: 0
	}, {
		type: "round1",
		x: 148,
		y: 153,
		rotation: 0
	}, {
		type: "round1",
		x: 346,
		y: 163,
		rotation: 0
	}, {
		type: "round1",
		x: 251,
		y: 60,
		rotation: 0
	}, {
		type: "tree1",
		x: 29,
		y: 262,
		rotation: 0
	}, {
		type: "tree1",
		x: 457,
		y: 262,
		rotation: 0
	}, {
		type: "bomb",
		x: 75,
		y: 223,
		rotation: 0
	}, {
		type: "bomb",
		x: 442,
		y: 149,
		rotation: 0
	}, {
		type: "star",
		x: 200,
		y: 109,
		rotation: 0
	}, {
		type: "star",
		x: 308,
		y: 109,
		rotation: 0
	}, {
		type: "star",
		x: 28,
		y: 177,
		rotation: 0
	}, {
		type: "star",
		x: 91,
		y: 168,
		rotation: 0
	}, {
		type: "star",
		x: 386,
		y: 184,
		rotation: 0
	}, {
		type: "star",
		x: 447,
		y: 206,
		rotation: 0
	}, {
		type: "bomb",
		x: 181,
		y: 59,
		rotation: 0
	}, {
		type: "bomb",
		x: 328,
		y: 59,
		rotation: 0
	}, ],
	joints: []
}, {
	objects: [{
		type: "mount2",
		x: 34,
		y: 63,
		rotation: 0
	}, {
		type: "mount2",
		x: 107,
		y: 63,
		rotation: 0
	}, {
		type: "mount2",
		x: 180,
		y: 63,
		rotation: 0
	}, {
		type: "mount2",
		x: 253,
		y: 63,
		rotation: 0
	}, {
		type: "mount3",
		x: 332,
		y: 258,
		rotation: 0
	}, {
		type: "mount3",
		x: 403,
		y: 258,
		rotation: 0
	}, {
		type: "mount3",
		x: 467,
		y: 258,
		rotation: 0
	}, {
		type: "round1",
		x: 33,
		y: 245,
		rotation: 0
	}, {
		type: "round1",
		x: 82,
		y: 205,
		rotation: 0
	}, {
		type: "round1",
		x: 138,
		y: 183,
		rotation: 0
	}, {
		type: "round1",
		x: 197,
		y: 179,
		rotation: 0
	}, {
		type: "round1",
		x: 342,
		y: 159,
		rotation: 0
	}, {
		type: "round1",
		x: 407,
		y: 107,
		rotation: 0
	}, {
		type: "round1",
		x: 459,
		y: 53,
		rotation: 0
	}, {
		type: "star",
		x: 235,
		y: 179,
		rotation: 0
	}, {
		type: "star",
		x: 301,
		y: 159,
		rotation: 0
	}, {
		type: "tree1",
		x: 150,
		y: 262,
		rotation: 0
	}, {
		type: "life",
		x: 266,
		y: 171,
		rotation: 0
	}, {
		type: "bomb",
		x: 80,
		y: 264,
		rotation: 0
	}, {
		type: "bomb",
		x: 105,
		y: 149,
		rotation: 0
	}, {
		type: "bomb",
		x: 202,
		y: 235,
		rotation: 0
	}, {
		type: "bomb",
		x: 345,
		y: 210,
		rotation: 0
	}, {
		type: "bomb",
		x: 347,
		y: 101,
		rotation: 0
	}, {
		type: "bomb",
		x: 415,
		y: 163,
		rotation: 0
	}, {
		type: "bomb",
		x: 409,
		y: 42,
		rotation: 0
	}, {
		type: "bomb",
		x: 465,
		y: 109,
		rotation: 0
	}, ],
	joints: []
}, {
	objects: [{
		type: "enemy",
		x: 34,
		y: 178,
		rotation: 0
	}, {
		type: "mount2",
		x: 116,
		y: 70,
		rotation: 0
	}, {
		type: "mount1",
		x: 229,
		y: 272,
		rotation: 0
	}, {
		type: "enemy",
		x: 312,
		y: 143,
		rotation: 0
	}, {
		type: "mount2",
		x: 400,
		y: 64,
		rotation: 0
	}, {
		type: "bomb",
		x: 459,
		y: 228,
		rotation: 0
	}, {
		type: "life",
		x: 160,
		y: 240,
		rotation: 0
	}, {
		type: "round1",
		x: 111,
		y: 193,
		rotation: 0
	}, {
		type: "round1",
		x: 383,
		y: 198,
		rotation: 0
	}, {
		type: "star",
		x: 171,
		y: 167,
		rotation: 0
	}, {
		type: "star",
		x: 198,
		y: 140,
		rotation: 0
	}, {
		type: "star",
		x: 237,
		y: 123,
		rotation: 0
	}, {
		type: "star",
		x: 32,
		y: 245,
		rotation: 0
	}, {
		type: "star",
		x: 332,
		y: 209,
		rotation: 0
	}, {
		type: "star",
		x: 455,
		y: 168,
		rotation: 0
	}, {
		type: "bomb",
		x: 270,
		y: 135,
		rotation: 0
	}, ],
	joints: []
}, {
	objects: [{
		type: "star",
		x: 39,
		y: 54,
		rotation: 0
	}, {
		type: "star",
		x: 455,
		y: 148,
		rotation: 0
	}, {
		type: "round1",
		x: 346,
		y: 179,
		rotation: 0
	}, {
		type: "round1",
		x: 291,
		y: 101,
		rotation: 0
	}, {
		type: "round1",
		x: 171,
		y: 68,
		rotation: 0
	}, {
		type: "round1",
		x: 102,
		y: 106,
		rotation: 0
	}, {
		type: "round1",
		x: 230,
		y: 143,
		rotation: 0
	}, {
		type: "round1",
		x: 405,
		y: 138,
		rotation: 0
	}, {
		type: "cheast",
		x: 100,
		y: 174,
		rotation: 0
	}, {
		type: "tree1",
		x: 295,
		y: 262,
		rotation: 0
	}, {
		type: "tree1",
		x: 244,
		y: 262,
		rotation: 0
	}, {
		type: "tree1",
		x: 194,
		y: 262,
		rotation: 0
	}, {
		type: "tree1",
		x: 143,
		y: 262,
		rotation: 0
	}, {
		type: "tree1",
		x: 91,
		y: 263,
		rotation: 0
	}, {
		type: "tree1",
		x: 41,
		y: 263,
		rotation: 0
	}, {
		type: "tree1",
		x: 350,
		y: 263,
		rotation: 0
	}, {
		type: "tree1",
		x: 402,
		y: 263,
		rotation: 0
	}, {
		type: "tree1",
		x: 453,
		y: 263,
		rotation: 0
	}, {
		type: "enemy",
		x: 40,
		y: 176,
		rotation: 0
	}, {
		type: "enemy",
		x: 452,
		y: 48,
		rotation: 0
	}, {
		type: "bomb",
		x: 240,
		y: 56,
		rotation: 0
	}, {
		type: "bomb",
		x: 173,
		y: 143,
		rotation: 0
	}, {
		type: "bomb",
		x: 110,
		y: 18,
		rotation: 0
	}, {
		type: "bomb",
		x: 292,
		y: 174,
		rotation: 0
	}, {
		type: "bomb",
		x: 355,
		y: 85,
		rotation: 0
	}, {
		type: "bomb",
		x: 406,
		y: 216,
		rotation: 0
	}, ],
	joints: []
}, {
	objects: [{
		type: "tree1",
		x: 237,
		y: 206,
		rotation: 0
	}, {
		type: "star",
		x: 237,
		y: 179,
		rotation: 0
	}, {
		type: "tree1",
		x: 329,
		y: 206,
		rotation: 0
	}, {
		type: "cheast",
		x: 255,
		y: 204,
		rotation: 0
	}, {
		type: "cheast",
		x: 221,
		y: 219,
		rotation: 0
	}, {
		type: "star",
		x: 328,
		y: 179,
		rotation: 0
	}, {
		type: "cheast",
		x: 313,
		y: 200,
		rotation: 0
	}, {
		type: "tree1",
		x: 154,
		y: 205,
		rotation: 0
	}, {
		type: "star",
		x: 154,
		y: 179,
		rotation: 0
	}, {
		type: "cheast",
		x: 172,
		y: 212,
		rotation: 0
	}, {
		type: "tree1",
		x: 65,
		y: 206,
		rotation: 0
	}, {
		type: "star",
		x: 65,
		y: 179,
		rotation: 0
	}, {
		type: "life",
		x: 87,
		y: 209,
		rotation: 0
	}, {
		type: "bonus1",
		x: 48,
		y: 189,
		rotation: 0
	}, {
		type: "tree1",
		x: 417,
		y: 206,
		rotation: 0
	}, {
		type: "star",
		x: 416,
		y: 179,
		rotation: 0
	}, {
		type: "cheast",
		x: 436,
		y: 198,
		rotation: 0
	}, {
		type: "cheast",
		x: 407,
		y: 222,
		rotation: 0
	}, {
		type: "enemy",
		x: 199,
		y: 125,
		rotation: 0
	}, {
		type: "enemy",
		x: 281,
		y: 70,
		rotation: 0
	}, {
		type: "enemy",
		x: 116,
		y: 72,
		rotation: 0
	}, {
		type: "bomb",
		x: 351,
		y: 210,
		rotation: 0
	}, {
		type: "mount3",
		x: 417,
		y: 267,
		rotation: 0
	}, {
		type: "mount3",
		x: 329,
		y: 267,
		rotation: 0
	}, {
		type: "mount3",
		x: 239,
		y: 267,
		rotation: 0
	}, {
		type: "mount3",
		x: 153,
		y: 267,
		rotation: 0
	}, {
		type: "mount3",
		x: 66,
		y: 267,
		rotation: 0
	}, {
		type: "round1",
		x: 449,
		y: 96,
		rotation: 0
	}, {
		type: "round1",
		x: 17,
		y: 175,
		rotation: 0
	}, {
		type: "enemy",
		x: 372,
		y: 125,
		rotation: 0
	}, ],
	joints: []
}, {
	objects: [{
		type: "round1",
		x: 251,
		y: 148,
		rotation: 0
	}, {
		type: "bomb",
		x: 295,
		y: 103,
		rotation: 0
	}, {
		type: "bomb",
		x: 327,
		y: 83,
		rotation: 0
	}, {
		type: "bomb",
		x: 362,
		y: 64,
		rotation: 0
	}, {
		type: "bomb",
		x: 431,
		y: 26,
		rotation: 0
	}, {
		type: "bomb",
		x: 291,
		y: 185,
		rotation: 0
	}, {
		type: "bomb",
		x: 440,
		y: 263,
		rotation: 0
	}, {
		type: "bomb",
		x: 412,
		y: 247,
		rotation: 0
	}, {
		type: "bomb",
		x: 350,
		y: 214,
		rotation: 0
	}, {
		type: "bomb",
		x: 320,
		y: 197,
		rotation: 0
	}, {
		type: "bomb",
		x: 214,
		y: 184,
		rotation: 0
	}, {
		type: "bomb",
		x: 181,
		y: 198,
		rotation: 0
	}, {
		type: "bomb",
		x: 150,
		y: 212,
		rotation: 0
	}, {
		type: "bomb",
		x: 116,
		y: 229,
		rotation: 0
	}, {
		type: "bomb",
		x: 84,
		y: 245,
		rotation: 0
	}, {
		type: "bomb",
		x: 52,
		y: 261,
		rotation: 0
	}, {
		type: "bomb",
		x: 215,
		y: 100,
		rotation: 0
	}, {
		type: "bomb",
		x: 42,
		y: 15,
		rotation: 0
	}, {
		type: "bomb",
		x: 74,
		y: 28,
		rotation: 0
	}, {
		type: "bomb",
		x: 102,
		y: 41,
		rotation: 0
	}, {
		type: "bomb",
		x: 133,
		y: 57,
		rotation: 0
	}, {
		type: "bomb",
		x: 160,
		y: 70,
		rotation: 0
	}, {
		type: "bomb",
		x: 185,
		y: 84,
		rotation: 0
	}, {
		type: "bomb",
		x: 397,
		y: 45,
		rotation: 0
	}, {
		type: "bomb",
		x: 380,
		y: 229,
		rotation: 0
	}, {
		type: "bomb",
		x: 400,
		y: 141,
		rotation: 0
	}, {
		type: "bomb",
		x: 433,
		y: 125,
		rotation: 0
	}, {
		type: "bomb",
		x: 433,
		y: 157,
		rotation: 0
	}, {
		type: "bomb",
		x: 89,
		y: 141,
		rotation: 0
	}, {
		type: "bomb",
		x: 55,
		y: 123,
		rotation: 0
	}, {
		type: "bomb",
		x: 54,
		y: 158,
		rotation: 0
	}, {
		type: "bonus1",
		x: 250,
		y: 42,
		rotation: 0
	}, {
		type: "bonus1",
		x: 249,
		y: 245,
		rotation: 0
	}, {
		type: "life",
		x: 251,
		y: 76,
		rotation: 0
	}, {
		type: "life",
		x: 249,
		y: 213,
		rotation: 0
	}, {
		type: "star",
		x: 251,
		y: 14,
		rotation: 0
	}, {
		type: "star",
		x: 300,
		y: 51,
		rotation: 0
	}, {
		type: "star",
		x: 192,
		y: 51,
		rotation: 0
	}, {
		type: "cheast",
		x: 300,
		y: 15,
		rotation: 0
	}, {
		type: "cheast",
		x: 353,
		y: 13,
		rotation: 0
	}, {
		type: "cheast",
		x: 193,
		y: 14,
		rotation: 0
	}, {
		type: "cheast",
		x: 135,
		y: 13,
		rotation: 0
	}, {
		type: "cheast",
		x: 290,
		y: 274,
		rotation: 0
	}, {
		type: "star",
		x: 250,
		y: 274,
		rotation: 0
	}, {
		type: "cheast",
		x: 193,
		y: 275,
		rotation: 0
	}, {
		type: "cheast",
		x: 345,
		y: 274,
		rotation: 0
	}, {
		type: "cheast",
		x: 138,
		y: 274,
		rotation: 0
	}, {
		type: "star",
		x: 293,
		y: 240,
		rotation: 0
	}, {
		type: "star",
		x: 201,
		y: 239,
		rotation: 0
	}, {
		type: "star",
		x: 345,
		y: 49,
		rotation: 0
	}, {
		type: "star",
		x: 153,
		y: 47,
		rotation: 0
	}, {
		type: "star",
		x: 404,
		y: 11,
		rotation: 0
	}, {
		type: "star",
		x: 86,
		y: 12,
		rotation: 0
	}, {
		type: "star",
		x: 81,
		y: 276,
		rotation: 0
	}, {
		type: "star",
		x: 397,
		y: 277,
		rotation: 0
	}, {
		type: "star",
		x: 331,
		y: 241,
		rotation: 0
	}, {
		type: "star",
		x: 156,
		y: 243,
		rotation: 0
	}, {
		type: "cheast",
		x: 461,
		y: 146,
		rotation: 0
	}, {
		type: "cheast",
		x: 16,
		y: 147,
		rotation: 0
	}, ],
	joints: []
}, {
	objects: [{
		type: "mount2",
		x: 46,
		y: 67,
		rotation: 0
	}, {
		type: "mount2",
		x: 178,
		y: 67,
		rotation: 0
	}, {
		type: "mount2",
		x: 312,
		y: 67,
		rotation: 0
	}, {
		type: "mount2",
		x: 442,
		y: 67,
		rotation: 0
	}, {
		type: "mount3",
		x: 112,
		y: 260,
		rotation: 0
	}, {
		type: "mount3",
		x: 246,
		y: 260,
		rotation: 0
	}, {
		type: "mount3",
		x: 380,
		y: 260,
		rotation: 0
	}, {
		type: "bomb",
		x: 111,
		y: 133,
		rotation: 0
	}, {
		type: "bomb",
		x: 314,
		y: 216,
		rotation: 0
	}, {
		type: "bomb",
		x: 244,
		y: 133,
		rotation: 0
	}, {
		type: "bomb",
		x: 377,
		y: 133,
		rotation: 0
	}, {
		type: "bomb",
		x: 177,
		y: 216,
		rotation: 0
	}, {
		type: "star",
		x: 66,
		y: 235,
		rotation: 0
	}, {
		type: "star",
		x: 146,
		y: 148,
		rotation: 0
	}, {
		type: "star",
		x: 217,
		y: 219,
		rotation: 0
	}, {
		type: "star",
		x: 280,
		y: 147,
		rotation: 0
	}, {
		type: "star",
		x: 353,
		y: 214,
		rotation: 0
	}, {
		type: "star",
		x: 411,
		y: 148,
		rotation: 0
	}, {
		type: "round1",
		x: 32,
		y: 204,
		rotation: 0
	}, {
		type: "round1",
		x: 458,
		y: 188,
		rotation: 0
	}, {
		type: "cheast",
		x: 117,
		y: 195,
		rotation: 0
	}, {
		type: "bonus1",
		x: 329,
		y: 179,
		rotation: 0
	}, ],
	joints: []
}, {
	objects: [{
		type: "bomb",
		x: 382,
		y: 77,
		rotation: 0
	}, {
		type: "bomb",
		x: 423,
		y: 78,
		rotation: 0
	}, {
		type: "bomb",
		x: 285,
		y: 188,
		rotation: 0
	}, {
		type: "bomb",
		x: 465,
		y: 78,
		rotation: 0
	}, {
		type: "bomb",
		x: 328,
		y: 189,
		rotation: 0
	}, {
		type: "bomb",
		x: 184,
		y: 190,
		rotation: 0
	}, {
		type: "bomb",
		x: 233,
		y: 188,
		rotation: 0
	}, {
		type: "bomb",
		x: 280,
		y: 78,
		rotation: 0
	}, {
		type: "bomb",
		x: 80,
		y: 79,
		rotation: 0
	}, {
		type: "bomb",
		x: 185,
		y: 79,
		rotation: 0
	}, {
		type: "bomb",
		x: 230,
		y: 79,
		rotation: 0
	}, {
		type: "bomb",
		x: 332,
		y: 77,
		rotation: 0
	}, {
		type: "bomb",
		x: 463,
		y: 188,
		rotation: 0
	}, {
		type: "bomb",
		x: 422,
		y: 187,
		rotation: 0
	}, {
		type: "bomb",
		x: 130,
		y: 192,
		rotation: 0
	}, {
		type: "bomb",
		x: 82,
		y: 191,
		rotation: 0
	}, {
		type: "enemy",
		x: 374,
		y: 194,
		rotation: 0
	}, {
		type: "enemy",
		x: 132,
		y: 84,
		rotation: 0
	}, {
		type: "life",
		x: 250,
		y: 138,
		rotation: 0
	}, {
		type: "bonus1",
		x: 75,
		y: 32,
		rotation: 0
	}, {
		type: "star",
		x: 179,
		y: 31,
		rotation: 0
	}, {
		type: "star",
		x: 226,
		y: 30,
		rotation: 0
	}, {
		type: "star",
		x: 275,
		y: 30,
		rotation: 0
	}, {
		type: "star",
		x: 326,
		y: 30,
		rotation: 0
	}, {
		type: "star",
		x: 378,
		y: 29,
		rotation: 0
	}, {
		type: "star",
		x: 420,
		y: 30,
		rotation: 0
	}, {
		type: "star",
		x: 460,
		y: 30,
		rotation: 0
	}, {
		type: "cheast",
		x: 78,
		y: 252,
		rotation: 0
	}, {
		type: "cheast",
		x: 127,
		y: 250,
		rotation: 0
	}, {
		type: "cheast",
		x: 178,
		y: 250,
		rotation: 0
	}, {
		type: "cheast",
		x: 229,
		y: 249,
		rotation: 0
	}, {
		type: "cheast",
		x: 279,
		y: 249,
		rotation: 0
	}, {
		type: "cheast",
		x: 325,
		y: 250,
		rotation: 0
	}, {
		type: "cheast",
		x: 417,
		y: 247,
		rotation: 0
	}, {
		type: "cheast",
		x: 459,
		y: 246,
		rotation: 0
	}, {
		type: "tree1",
		x: 373,
		y: 264,
		rotation: 0
	}, {
		type: "tree1",
		x: 30,
		y: 263,
		rotation: 0
	}, {
		type: "round1",
		x: 326,
		y: 137,
		rotation: 0
	}, {
		type: "round1",
		x: 179,
		y: 138,
		rotation: 0
	}, {
		type: "bonus1",
		x: 414,
		y: 135,
		rotation: 0
	}, ],
	joints: []
}];;
var stage;
var world;
var mc;
var fps = 30;
var bitmaps;
var GET;
var data = [];
var LANDSCAPE_MODE = true;
var STATE_LOAD = 0;
var STATE_SPLASH = 1;
var STATE_COVER = 2;
var STATE_MENU = 3;
var STATE_INSTRUCTIONS = 4;
var STATE_GAME = 5;
var STATE_POPUP = 6;
var STATE_ABOUT = 7;
var gameState = STATE_LOAD;
var screenWidthCoef = 1;
var screenWidthRatioPos = 0;
var TYPE_NORMAL = 0;
var TYPE_STAR = 1;
var TYPE_OBSTACLE = 2;
var TYPE_ENEMY = 3;
var TYPE_ROUND = 4;
var TYPE_PRESENT = 5;
var TYPE_SPHERE = 6;
var TYPE_LIFE = 7;
var TYPE_BOMB = 8;
var TYPE_END_OF_GAME = 9;
var TYPE_TREE_HITAREA = 10;
var TYPE_TREE = 11;
window.onload = function() {
	GET = Utils.parseGet();
	Utils.addMobileListeners(LANDSCAPE_MODE);
	Utils.mobileCorrectPixelRatio();
	Utils.addFitLayoutListeners();
	setTimeout(startLoad, 600);
};
var fire;
var unit;
var decors = [];
var lastObjectIX = -1;
var curLevel = 0;
var score;
var highscore = 0;

function startLoad() {
	var resolution = Utils.getMobileScreenResolution(LANDSCAPE_MODE);
	if(GET["debug"] == 1) resolution = Utils.getScaleScreenResolution(1, LANDSCAPE_MODE);
	Utils.globalScale = resolution.scale;
	var ratioCoefs = [1.5, 1.6, 1.66, 1.7, 1.78];
	var ratioWidth = [1, 1.0666, 1.106, 1.133, 1.187];
	if(window.innerWidth > window.innerHeight) var coef = window.innerWidth / window.innerHeight;
	else var coef = window.innerHeight / window.innerWidth;
	var min = 100000,
		minPos = -1,
		diff;
	for(var i = 0; i < ratioCoefs.length; i++) {
		diff = Math.abs(coef - ratioCoefs[i]);
		if(diff < min) {
			min = diff;
			minPos = i;
		}
	}
	screenWidthCoef = ratioWidth[minPos];
	screenWidthRatioPos = minPos;

	// alert(screenWidthRatioPos)
	//jinlongz
	screenWidthRatioPos = 4;

	resolution.width = Math.round(resolution.width * screenWidthCoef);
	Utils.createLayout(document.getElementById("main_container"), resolution);
	Utils.addEventListener("fitlayout", function() {
		if(stage) {
			stage.drawScene(document.getElementById("screen"));
			buildBackground();
		}
	});
	Utils.addEventListener("lockscreen", function() {
		if(stage && stage.started) stage.stop();
	});
	Utils.addEventListener("unlockscreen", function() {
		if(stage && !stage.started) stage.start();
	});
	Utils.mobileHideAddressBar();
	if(GET["debug"] != 1) Utils.checkOrientation(LANDSCAPE_MODE);
	var path = Utils.imagesRoot + "/" + Utils.globalScale + "/";

	//jinlongz
	// alert(path)

	var preloader = new ImagesPreloader();
	data.push({
		name: "hourglass",
		src: path + "hourglass.png"
	});
	data.push({
		name: "aboutscreen",
		src: path + "about.jpg"
	});
	data.push({
		name: "splash",
		src: path + "splash.png"
	});
	data.push({
		name: "cover_back",
		src: path + "ratios/" + screenWidthRatioPos + "/coverback.jpg"
	});
	data.push({
		name: "pause_back",
		src: path + "ratios/" + screenWidthRatioPos + "/pause.png"
	});
	data.push({
		name: "gamebackground1",
		src: path + "ratios/" + screenWidthRatioPos + "/gamebackground1.jpg"
	});
	data.push({
		name: "gamebackground2",
		src: path + "ratios/" + screenWidthRatioPos + "/gamebackground2.jpg"
	});
	data.push({
		name: "menu_back",
		src: path + "ratios/" + screenWidthRatioPos + "/menubackground.jpg"
	});
	data.push({
		name: "about",
		src: path + "about.png"
	});
	data.push({
		name: "moregames",
		src: path + "moregames.png"
	});
	data.push({
		name: "start",
		src: path + "start.png"
	});
	data.push({
		name: "instructions_back",
		src: path + "ratios/" + screenWidthRatioPos + "/instructionsback1.jpg"
	});
	data.push({
		name: "instructions",
		src: path + "/instructions.png"
	});
	data.push({
		name: "popuptext",
		src: path + "/popuptext.png"
	});
	data.push({
		name: "pausetext",
		src: path + "/pausetext.png"
	});
	data.push({
		name: "back",
		src: path + "back.jpg"
	});
	data.push({
		name: "bonus_sphere",
		src: path + "bonus_sphere.png"
	});
	data.push({
		name: "present",
		src: path + "present.png"
	});
	data.push({
		name: "enemy",
		src: path + "enemy.png"
	});
	data.push({
		name: "grass1",
		src: path + "grass1.png"
	});
	data.push({
		name: "grass2",
		src: path + "grass2.png"
	});
	data.push({
		name: "grass3",
		src: path + "grass3.png"
	});
	data.push({
		name: "grass4",
		src: path + "grass4.png"
	});
	data.push({
		name: "life",
		src: path + "life.png"
	});
	data.push({
		name: "sphere",
		src: path + "sphere.png"
	});
	data.push({
		name: "bomb",
		src: path + "bomb.png"
	});
	data.push({
		name: "mount1",
		src: path + "mount1.png"
	});
	data.push({
		name: "mount2",
		src: path + "mount2.png"
	});
	data.push({
		name: "mount3",
		src: path + "mount3.png"
	});
	data.push({
		name: "tree1",
		src: path + "tree1.png"
	});
	data.push({
		name: "tree2",
		src: path + "tree2.png"
	});
	data.push({
		name: "star",
		src: path + "star.png"
	});
	data.push({
		name: "unit",
		src: path + "unit.png"
	});
	data.push({
		name: "fire",
		src: path + "fire.png"
	});
	data.push({
		name: "round1",
		src: path + "round.png"
	});
	data.push({
		name: "round2",
		src: path + "round1.png"
	});
	data.push({
		name: "round3",
		src: path + "round2.png"
	});
	data.push({
		name: "star2",
		src: path + "star2.png"
	});
	data.push({
		name: "star3",
		src: path + "star3.png"
	});
	data.push({
		name: "plume",
		src: path + "plume.png"
	});
	data.push({
		name: "plumage1",
		src: path + "plumage1.png"
	});
	data.push({
		name: "plumage2",
		src: path + "plumage2.png"
	});
	data.push({
		name: "pause_btn",
		src: path + "pause_btn.png"
	});
	data.push({
		name: "crash",
		src: path + "crash.png"
	});
	data.push({
		name: "blackplumage",
		src: path + "blackplumage.png"
	});
	data.push({
		name: "p50",
		src: path + "p50.png"
	});
	data.push({
		name: "p100",
		src: path + "p100.png"
	});
	data.push({
		name: "p500",
		src: path + "p500.png"
	});
	data.push({
		name: "bang",
		src: path + "bang.png"
	});
	data.push({
		name: "bluebird",
		src: path + "bluebird.png"
	});
	data.push({
		name: "blackbird",
		src: path + "blackbird.png"
	});
	data.push({
		name: "length1",
		src: path + "length.png"
	});
	data.push({
		name: "score",
		src: path + "score.png"
	});
	data.push({
		name: "num1",
		src: path + "num1.png"
	});
	data.push({
		name: "num2",
		src: path + "num2.png"
	});
	data.push({
		name: "popupnum1",
		src: path + "popupnum1.png"
	});
	data.push({
		name: "popupnum2",
		src: path + "popupnum2.png"
	});
	preloader.load(data, loadImagesEnd, Utils.showLoadProgress);
}

function getStageWidth() {
	return Math.floor(480 * screenWidthCoef);
};

function getStageCenter() {
	return getStageWidth() / 2;
};

function loadImagesEnd(data) {
	document.getElementById('progress_container').style.display = 'none';
	document.getElementById('screen_container').style.display = 'block';
	document.getElementById('screen_background_container').style.display = 'block';
	bitmaps = data;
	if(GET["debug"] != 1) {
		gameState = STATE_SPLASH;
		createScene();
	}
}

function showMenu() {
	gameState = STATE_MENU;
	createScene();
}

function showGame() {
	gameState = STATE_GAME;
	createScene();
}

function setBackColor(color) {
	document.getElementById("screen_background_container").style.background = color;
}

function createStage() {
	if(stage) {
		stage.destroy();
		stage.stop();
	}
	stage = new Stage('screen', getStageWidth(), 320, false);
	stage.delay = 1000 / fps;
	stage.onpretick = preTick;
	stage.onposttick = postTick;
	stage.ceilSizes = true;
	stage.showFPS = false;
}

function createScene() {
	createStage();
	if(gameState == STATE_SPLASH) {
		setBackColor('#FEE101');
		showSplash();
	}
	if(gameState == STATE_COVER) {
		setBackColor('#021F1D');
		showCover();
	}
	if(gameState == STATE_ABOUT) {
		setBackColor('#FEE101');
		showAbout();
	}
	if(gameState == STATE_MENU) {
		setBackColor('#021F1D');
		createMenu();
	}
	if(gameState == STATE_INSTRUCTIONS) {
		setBackColor('#0A3500');
		createInstructions();
	}
	if(gameState == STATE_GAME) {
		setBackColor('#935105');
		startGame();
	}
	buildBackground();
	stage.start();
}

function buildBackground() {
	stage.drawScene(document.getElementById("screen_background"), true);
}
var pause = false;
var length;
var score;

function showSplash() {
	var spr = new Sprite(bitmaps.splash, 480, 320);
	spr.x = getStageCenter();
	spr.y = 160;
	stage.addChild(spr);
	setTimeout(function() {
		gameState = STATE_COVER;
		createScene();
	}, 3000);
}

function showCover() {
	var spr = new Sprite(bitmaps.cover_back, getStageWidth(), 320);
	spr.x = getStageCenter();
	spr.y = 160;
	spr.onclick = function() {
		gameState = STATE_MENU;
		createScene();
	}
	stage.addChild(spr);
}

function createMenu() {
	var spr = new Sprite(bitmaps.menu_back, getStageWidth(), 320);
	spr.x = getStageCenter();
	spr.y = 160;
	spr.static = true;
	stage.addChild(spr);
	mc = new Sprite(bitmaps.about, 79, 23);
	mc.x = getStageCenter() - 194;
	mc.y = 292;
	mc.static = true;
	mc.onclick = function() {
		gameState = STATE_ABOUT;
		createScene();
	}
	stage.addChild(mc);
	mc = new Sprite(bitmaps.start, 72, 23);
	mc.x = getStageCenter() - 30;
	mc.y = 292;
	mc.static = true;
	mc.onclick = function() {
		gameState = STATE_INSTRUCTIONS;
		createScene();
	}
	stage.addChild(mc);
	mc = new Sprite(bitmaps.moregames, 149, 24);
	mc.x = getStageCenter() + 160;
	mc.y = 292;
	mc.static = true;
	mc.onclick = function() {
		window.open(MORE_GAMES_URL);
	}
	stage.addChild(mc);
}

function showAbout() {
	var spr = new Sprite(bitmaps.aboutscreen, 480, 320);
	spr.x = getStageCenter();
	spr.y = 160;
	stage.addChild(spr);
	spr.onclick = function() {
		gameState = STATE_MENU;
		createScene();
	}
}

function createInstructions() {
	var spr = new Sprite(bitmaps.instructions_back, getStageWidth(), 320);
	spr.x = getStageCenter();
	spr.y = 160;
	spr.static = true;
	stage.addChild(spr);
	var spr = new Sprite(bitmaps.instructions, 480, 270);
	spr.x = getStageCenter();
	spr.y = 160;
	spr.static = true;
	stage.addChild(spr);
	var spr = new Sprite(null, 40, 40);
	spr.x = getStageCenter() + 210;
	spr.y = 265;
	spr.static = true;
	spr.onclick = function() {
		console.log('START GAME 2');
		gameState = STATE_GAME;
		createScene();
	}
	stage.addChild(spr);
}
var end_of_game = false;

function showPopup() {
	pause = true;
	end_of_game = true;
	stopTweens();
	var spr = new Sprite(null, getStageWidth(), 320);
	spr.x = getStageCenter();
	spr.y = 160;
	spr.fillColor = '31b909';
	spr.opacity = 0.5;
	spr.ignoreViewport = true;
	spr.onclick = function() {
		return false;
	}
	stage.addChild(spr);
	mc = new Sprite(bitmaps.popuptext, 304, 307);
	mc.x = getStageCenter();
	mc.y = 160;
	mc.ignoreViewport = true;
	stage.addChild(mc);
	var back = new Sprite(null, 50, 50);
	back.x = getStageCenter() - 60;
	back.y = 230 - 20;
	back.ignoreViewport = true;
	back.onclick = function() {
		gameState = STATE_MENU;
		createScene();
	}
	stage.addChild(back);
	var restart = new Sprite(null, 50, 50);
	restart.x = getStageCenter() + 50;
	restart.y = 230 - 20;
	restart.ignoreViewport = true;
	restart.onclick = function() {
		console.log('START GAME 3');
		gameState = STATE_GAME;
		createScene();
	}
	stage.addChild(restart);
	var totalscore = score + length * 10;
	pscore = new Text(bitmaps.popupnum1, 20, 30);
	pscore.x = getStageCenter() + 60;
	pscore.y = 83 - 12;
	pscore.align = pscore.ALIGN_LEFT;
	pscore.write(totalscore);
	plength = new Text(bitmaps.popupnum1, 20, 30);
	plength.x = getStageCenter() + 75;
	plength.y = 128 - 13;
	plength.align = plength.ALIGN_RIGHT;
	plength.write(length);
	pstars = new Text(bitmaps.popupnum1, 20, 30);
	pstars.x = getStageCenter() + 120;
	pstars.y = 172 - 12;
	pstars.align = pstars.ALIGN_LEFT;
	pstars.write(stars);
	if(totalscore > highscore) {
		highscore = totalscore;
	}
	phighscore = new Text(bitmaps.popupnum2, 22, 34);
	phighscore.x = getStageCenter() + 60;
	phighscore.y = 288 - 28;
	phighscore.align = phighscore.ALIGN_LEFT;
	phighscore.write(highscore);
	if(length > bestlength) {
		bestlength = length;
	}
	pbestlength = new Text(bitmaps.popupnum2, 22, 34);
	pbestlength.x = getStageCenter() + 103;
	pbestlength.y = 288 + 10;
	pbestlength.align = pbestlength.ALIGN_RIGHT;
	pbestlength.write(bestlength);
}
var stars;
var lives;
var length;
var bestlength = 0;
var speed;

function startGame() {
	console.log('START GAME');
	pause = false;
	lastObjectIX = -1;
	score = 0;
	length = 0;
	stars = 0;
	lives = 3;
	cnt = 0;
	sector = 0;
	end_of_game = false;
	choose = 0;
	speed = 2;
	decors = [];
	decors.push({
		bitmap: bitmaps.grass1,
		width: 15,
		height: 8
	});
	decors.push({
		bitmap: bitmaps.grass2,
		width: 15,
		height: 8
	});
	decors.push({
		bitmap: bitmaps.grass3,
		width: 9,
		height: 5
	});
	decors.push({
		bitmap: bitmaps.grass4,
		width: 9,
		height: 5
	});
	mc = new Sprite(bitmaps.gamebackground1, getStageWidth(), 320);
	mc.x = getStageCenter();
	mc.y = 160;
	mc.static = true;
	mc.ignoreViewport = true;
	mc.onmousedown = function() {
		if(pause) return false;
		goUp();
		return false;
	}
	mc.onmouseup = function() {
		if(pause) return false;
		goDown();
		return false;
	}
	stage.addChild(mc);
	unit = new Sprite(bitmaps.bluebird, 46, 36, 4);
	unit.x = 100;
	unit.y = 80;
	unit.protected = false;
	stage.addChild(unit);
	unit.stop();
	fire = new Sprite(bitmaps.fire, 48, 19);
	fire.x = unit.x - 33;
	fire.y = unit.y;
	fire.visible = false;
	stage.addChild(fire);
	mc = new Sprite(null, 20, 20);
	mc.visible = false;
	stage.addChild(mc);
	unit.hitArea = mc;
	mc.opacity = 0.5;
	stage.setZIndex(mc, 1001);
	unit.flag = true;
	fire.flag = true;
	unit.velocity = {
		x: speed,
		y: 2
	};
	fire.velocity = {
		x: speed,
		y: 2
	};
	stage.setZIndex(fire, 1000);
	stage.setZIndex(unit, 1000);
	for(var i = 0; i < 14; i++) addDecor(17 + i * 34);
	addObjects();
	mc = new Sprite(bitmaps.pause_btn, 32, 31);
	mc.x = 30;
	mc.y = 30;
	mc.ignoreViewport = true;
	mc.onclick = function() {
		if(end_of_game) return false;
		createPause();
		return false;
	}
	stage.addChild(mc);
	mc = new Sprite(bitmaps.length1, 111, 19);
	mc.x = getStageCenter() - 120 + 80;
	mc.y = 20;
	mc.ignoreViewport = true;
	stage.addChild(mc);
	tlength = new Text(bitmaps.num2, 9, 18);
	tlength.x = getStageCenter() - 90 + 85;
	tlength.y = 20;
	tlength.align = tlength.ALIGN_RIGHT;
	tlength.write(0);
	mc = new Sprite(bitmaps.score, 49, 19);
	mc.x = getStageCenter() + 160 - 40;
	mc.y = 20;
	mc.ignoreViewport = true;
	stage.addChild(mc);
	tscore = new Text(bitmaps.num2, 9, 18);
	tscore.x = getStageCenter() + 200 - 45;
	tscore.y = 20;
	tscore.align = tscore.ALIGN_LEFT;
	tscore.write(0);
	var spr = new Sprite(bitmaps.star2, 32, 31);
	spr.x = getStageWidth() - 25;
	spr.y = 20;
	spr.ignoreViewport = true;
	stage.addChild(spr);
	putCompleteStar();
	putLives();
}

function startPlumage() {}

function stopPlumage() {}

function putCompleteStar(start) {
	if(star) star.destroy = true;
	var c = 50 - (stars % 50);
	var b = c / 50 * 31;
	var a = (31 - b) / 2;
	if((c % 50 == 0) && (stars > 1)) {
		score = score + 1000;
	}
	star = new Sprite(bitmaps.star3, 32, b);
	star.x = getStageWidth() - 25;
	star.y = 20 - a;
	star.ignoreViewport = true;
	stage.addChild(star);
}
var star;
var lives_arr = [];

function putLives() {
	if(lives_arr.length > 0) {
		for(var i = 0; i < lives_arr.length; i++) lives_arr[i].destroy = true;
		lives_arr = [];
	}
	for(var i = 0; i < lives; i++) {
		var spr = new Sprite(bitmaps.life, 28, 26);
		spr.x = getStageCenter() - 170 + 10 * i;
		spr.y = 25;
		spr.ignoreViewport = true;
		stage.addChild(spr);
		lives_arr.push(spr);
	}
}

function runOnLife(obj) {
	if(lives > 4) return;
	lives++;
	console.log('lives' + lives);
	obj.ignoreViewport = true;
	var spr = new Sprite(bitmaps.life, 28, 26);
	spr.x = obj.x - 82 - 53;
	spr.x = 240 + obj.x - unit.x;
	spr.y = obj.y;
	spr.ignoreViewport = true;
	stage.addChild(spr);
	lives_arr.push(spr);
	obj.destroy = true;
	var x = getStageCenter() - 170 + 10 * (lives_arr.length - 1);
	var length = calculateLength(x, 25, spr.x, spr.y);
	var dur = length / 10;
	spr.moveTo(x, 25, dur, 50, null, null);
}

function missLife(missRound, obj) {
	lives--;
	end_of_game = true;
	if(lives < 0) lives = 0;
	var elem = lives_arr[lives_arr.length - 1];
	if(elem) {
		elem.moveBy(0, -40, 40, 20, function() {
			elem.destroy = true;
			end_of_game = false;
		}, null);
	}
	lives_arr.pop();
	for(var i = 0; i < lives_arr.length; i++) {}
	if(missRound) {
		var spr = new Sprite(bitmaps.round3, 41, 90);
		spr.x = obj.x;
		spr.y = obj.y;
		stage.addChild(spr);
		setTimeout(function() {
			spr.destroy = true;
		}, 200);
		if(lives == 0) {
			setTimeout(function() {
				showPopup();
			}, 1000);
		}
		return false;
	}
	unit.visible = false;
	fire.visible = false;
	pause = true;
	stopTweens();
	var bang = new Sprite(bitmaps.bang, 211, 193, 3);
	bang.x = unit.hitArea.x;
	bang.y = unit.hitArea.y;
	stage.addChild(bang);
	bang.onenterframe = function(en) {
		if(en.target.currentFrame == 2) {
			en.target.stop();
			en.target.destroy = true;
		}
	}
	var plumage;
	plumage = new Sprite(bitmaps.plumage1, 58, 42);
	plumage.x = unit.hitArea.x;
	plumage.y = unit.hitArea.y + 20;
	stage.addChild(plumage);
	plumage.moveBy(0, 30, 40, 20, function() {
		plumage.destroy = true;
		if(lives == 0) {
			showPopup();
			return false;
		}
		var spr = new Sprite(null, getStageWidth(), 320);
		spr.x = getStageCenter();
		spr.y = 160;
		spr.fillColor = '31b909';
		spr.opacity = 0.2;
		spr.ignoreViewport = true;
		spr.onclick = function() {
			if(obj) obj.destroy = true;
			unit.protected = true;
			setTimeout(function() {
				unit.protected = false;
			}, 100);
			spr.destroy = true;
			crash.destroy = true;
			if(unit.y > 260) {
				unit.y = 230;
			}
			fire.y = unit.y;
			unit.velocity.y = 2;
			fire.velocity.y = 2;
			unit.visible = true;
			pause = false;
			startTweens();
			return false;
		}
		stage.addChild(spr);
		var crash = new Sprite(bitmaps.crash, 332, 175);
		crash.x = getStageCenter();
		crash.y = 160;
		crash.ignoreViewport = true;
		stage.addChild(crash);
	}, null);
}

function destroyEnemy(obj) {
	var plumage;
	plumage = new Sprite(bitmaps.blackplumage, 58, 42);
	plumage.x = obj.x;
	plumage.y = obj.y + 20;
	stage.addChild(plumage);
	plumage.moveBy(0, 30, 40, 20, function() {
		plumage.destroy = true;
	}, null);
	obj.destroy = true;
	return false;
}

function calculateLength(x1, y1, x2, y2) {
	var a = x1 - x2;
	var b = y1 - y2;
	var length = Math.floor(Math.sqrt(a * a + b * b));
	return length;
}

function createPause() {
	pause = true;
	stopTweens();
	if(PROTECTED) clearTimeout(PROTECTED);
	var spr = new Sprite(null, getStageWidth(), 320);
	spr.x = getStageCenter();
	spr.y = 160;
	spr.fillColor = '31b909';
	spr.opacity = 0.5;
	spr.ignoreViewport = true;
	spr.onclick = function() {
		return false;
	}
	stage.addChild(spr);
	var pause1 = new Sprite(bitmaps.pausetext, 237, 262);
	pause1.x = getStageCenter();
	pause1.y = 160;
	pause1.ignoreViewport = true;
	stage.addChild(pause1);
	var back = new Sprite(null, 35, 35);
	back.x = getStageCenter() - 82;
	back.y = 257;
	back.ignoreViewport = true;
	back.onclick = function() {
		back.destroy = true;
		menu.destroy = true;
		spr.destroy = true;
		restart.destroy = true;
		pause1.destroy = true;
		pause = false;
		if(unit.protected) runOnBonus();
		startTweens();
	}
	stage.addChild(back);
	var restart = new Sprite(null, 35, 35);
	restart.x = getStageCenter();
	restart.y = 257;
	restart.ignoreViewport = true;
	restart.onclick = function() {
		console.log('START GAME 1');
		gameState = STATE_GAME;
		createScene();
		return false;
	}
	stage.addChild(restart);
	var menu = new Sprite(null, 35, 35);
	menu.x = getStageCenter() + 82;
	menu.y = 257;
	menu.ignoreViewport = true;
	menu.onclick = function() {
		gameState = STATE_MENU;
		createScene();
		return false;
	}
	stage.addChild(menu);
}

function createTapToContinue() {}

function addDecor(x) {
	var i = Math.floor(Math.random() * decors.length);
	mc = new Sprite(decors[i].bitmap, decors[i].width, decors[i].height);
	mc.x = x;
	mc.y = 292 - Math.floor(decors[i].height / 2);
	stage.addChild(mc);
	stage.setZIndex(mc, 1);
}

function createObject(name) {
	mc = {};
	if(name == "star") {
		mc = new Sprite(bitmaps.star, 19, 18);
		mc.obType = TYPE_STAR;
	}
	if(name == "bonus1") {
		mc = new Sprite(bitmaps.bonus_sphere, 19, 19);
		mc.obType = TYPE_SPHERE;
	}
	if(name == "cheast") {
		mc = new Sprite(bitmaps.present, 19, 21);
		mc.obType = TYPE_PRESENT;
	}
	if(name == "enemy") {
		mc = new Sprite(bitmaps.blackbird, 34, 42, 3);
		mc.obType = TYPE_ENEMY;
	}
	if(name == "mount1") {
		mc = new Sprite(bitmaps.mount1, 74, 139);
		mc.obType = TYPE_OBSTACLE;
	}
	if(name == "mount2") {
		mc = new Sprite(bitmaps.mount2, 74, 139);
		mc.obType = TYPE_OBSTACLE;
	}
	if(name == "mount3") {
		mc = new Sprite(bitmaps.mount3, 74, 65);
		mc.obType = TYPE_OBSTACLE;
	}
	if(name == "tree1") {
		mc = new Sprite(bitmaps.tree1, 46, 58);
		mc.obType = TYPE_TREE;
		mc.tree = true;
	}
	if(name == "tree2") {
		mc = new Sprite(bitmaps.tree2, 46, 58);
		mc.obType = TYPE_TREE;
		mc.tree = true;
	}
	if(name == "life") {
		mc = new Sprite(bitmaps.life, 28, 26);
		mc.obType = TYPE_LIFE;
	}
	if(name == "bomb") {
		mc = new Sprite(bitmaps.bomb, 28, 30);
		mc.obType = TYPE_BOMB;
	}
	if(name == "round1") {
		mc = new Sprite(bitmaps.round1, 41, 90);
		mc.obType = TYPE_ROUND;
		mc.complete = false;
	}
	if(name == "end") {
		mc = new Sprite(null, 2, 320);
		mc.obType = TYPE_END_OF_GAME;
	}
	return mc;
}
var enemyTween;
curLevel = 1;
var level = 0;
var sector_const = 7;
var choose = 0;

function addObjects() {
	var obj;
	var sector;
	sector = Math.floor(Math.random() * 5) + choose;
	while(sector == sector_const) {
		sector = Math.floor(Math.random() * 5) + choose;
	}
	sector_const = sector;
	if(sector == choose + 5) sector--;
	var a = choose + 4;
	console.log('sector ' + sector + ' диапазон от ' + choose + ' до ' + a);
	var sectorObjs;
	sectorObjs = levels[sector].objects;
	for(var i = lastObjectIX + 1; i < sectorObjs.length; i++) {
		obj = sectorObjs[i];
		if(obj.name) {
			mc = createObject(obj.name);
		} else {
			mc = createObject(obj.type);
		}
		if(unit.x < 200) {
			mc.x = obj.x + 240;
		} else {
			mc.x = obj.x + unit.x + getStageWidth();
		}
		mc.y = obj.y;
		if(lives > 4 && (mc.obType == TYPE_LIFE)) {} else {
			stage.addChild(mc);
		}
		stage.setZIndex(mc, 2);
		lastObjectIX = i;
		if(mc.obType == TYPE_ENEMY) {
			platEnemyAnim(mc, true, tween_num);
			tween_num++;
		}
		if(mc.obType == TYPE_TREE) {
			var spr = new Sprite(null, 25, 58);
			spr.x = mc.x;
			spr.y = mc.y;
			spr.opacity = 0.5;
			spr.obType = TYPE_TREE_HITAREA;
			stage.addChild(spr);
		}
	}
}
var tween_num = 0;

function makeNewSector() {}
var tween_arr = [];

function platEnemyAnim(obj, flag, num) {
	if(obj) {
		if(flag) {
			obj.play();
		} else {
			obj.stop();
		}
		tween_arr[num] = obj.addTween("y", ((flag) ? obj.y - 50 : obj.y + 50), ((flag) ? 50 : 50), Easing.linear.out);
		if(tween_arr[num]) {
			tween_arr[num].onfinish = function(e) {
				platEnemyAnim(e.target.obj, (flag) ? false : true, num);
			}
			tween_arr[num].play();
		} else {
			return;
		}
	}
}

function startTweens() {
	if(tween_arr.length > 0) {
		for(var i = 0; i < tween_arr.length; i++) {
			if(tween_arr[i]) {
				tween_arr[i].play();
			}
		}
	}
	return false;
}

function stopTweens() {
	for(var i = 0; i < tween_arr.length; i++) {
		if(tween_arr[i]) {
			tween_arr[i].pause();
		}
	}
	unit.stop();
	for(var i = 0; i < stage.objects.length; i++) {
		if(stage.objects[i].obType == TYPE_ENEMY) {
			stage.objects[i].stop();
		}
	}
	return false;
}

function goUp() {
	unit.velocity.y = -3;
	fire.velocity.y = -3;
	fire.visible = true;
	unit.play();
	return false;
}

function goDown() {
	unit.velocity.y = 2;
	fire.velocity.y = 2;
	fire.visible = false;
	unit.stop();
	return false;
}
var cnt;

function preTick() {
	if(pause) return false;
	if(gameState == STATE_GAME) {
		cnt++;
		if(cnt == 10) {
			length++;
			tlength.write(length);
			cnt = 0;
			if(length % 50 == 0) {
				choose++;
				console.log('сдвигаем сектора');
				if(choose > levels.length - 5) choose = levels.length - 5;
			}
			if(length % 80 == 0) {
				unit.velocity.x = unit.velocity.x + 0.1;
				fire.velocity.x = fire.velocity.x + 0.1;
				console.log('сдвигаем скорость на 0.1 = ' + unit.velocity.x);
			}
		}
		var obj;
		unit.x += unit.velocity.x;
		unit.y += unit.velocity.y;
		fire.x += fire.velocity.x;
		fire.y += fire.velocity.y;
		unit.hitArea.x = unit.x + 5;
		unit.hitArea.y = unit.y + 4;
		if(sphere) {
			sphere.x = unit.hitArea.x;
			sphere.y = unit.hitArea.y;
		}
		if(unit.y < 30) {
			unit.y = 30;
			fire.y = 30;
		}
		if(unit.y > 270) {
			if(unit.protected) {
				unit.y = 270;
				fire.y = 270;
			} else {
				missLife();
			}
		}
		if(unit.x >= getStageWidth() / 2) {
			stage.viewport.x = unit.x - getStageWidth() / 2;
		}
		if(stage.viewport.x > 0) {
			if(stage.viewport.x % 34 < unit.velocity.x) {
				addDecor(stage.viewport.x + getStageWidth());
			}
		}
		if(stage.viewport.x > 0) {
			if(unit.x % 480 < unit.velocity.x) {
				lastObjectIX = -1;
				addObjects();
			}
		}
		for(var i = 0; i < stage.objects.length; i++) {
			obj = stage.objects[i];
			if(obj.obType > 0) {
				if(obj.obType == TYPE_ROUND) {
					if((unit.hitArea.x >= obj.x - 5) && !obj.complete) {
						if((unit.hitArea.y > obj.y - 15) && (unit.hitArea.y < obj.y + 15)) {
							runOnRound(obj, 1);
						} else if((unit.hitArea.y > obj.y - obj.height / 2) && (unit.hitArea.y < obj.y + obj.height / 2)) {
							runOnRound(obj, 2);
						} else {
							missLife(true, obj);
						}
						obj.complete = true;
					}
				}
				if(stage.hitTest(unit.hitArea, obj)) {
					if(obj.obType == TYPE_STAR) {
						runOnStar(obj);
					}
					if(obj.obType == TYPE_PRESENT) {
						runOnPresent(obj);
					}
					if(obj.obType == TYPE_SPHERE) {
						runOnBonus(obj);
					}
					if(obj.obType == TYPE_LIFE) {
						runOnLife(obj);
					}
					if(obj.obType == TYPE_BOMB) {
						if(unit.protected) {} else {
							runOnBomb(obj);
						}
					}
					if(obj.obType == TYPE_ENEMY) {
						if(unit.protected) {
							destroyEnemy(obj);
						} else {
							missLife(false, obj);
							return false;
						}
					}
					if(obj.obType == TYPE_OBSTACLE) {
						if(unit.protected) {} else {
							missLife(false, obj);
							return false;
						}
					}
					if(obj.obType == TYPE_TREE_HITAREA) {
						if(unit.protected) {} else {
							missLife(false, obj);
							return false;
						}
					}
					if(obj.obType == TYPE_END_OF_GAME) {
						makeNewSector();
					}
				}
			}
		}
		for(var i = 0; i < stage.objects.length; i++) {
			obj = stage.objects[i];
			if((!obj.ignoreViewport && !obj.static)) {
				if(obj.x + obj.width / 2 < stage.viewport.x) {
					obj.destroy = true;
				} else {
					if(!obj.flag) {
						if(obj.x - obj.width / 2 > stage.viewport.x + getStageWidth()) {
							obj.visible = false;
						} else {
							obj.visible = true;
						}
					}
				}
			}
		}
	} else return false;
}

function postTick() {}

function runOnStar(obj) {
	var spr1;
	spr1 = new Sprite(bitmaps.p50, 24, 16);
	spr1.x = obj.x;
	spr1.y = obj.y - 10;
	stage.addChild(spr1);
	spr1.moveBy(0, -5, 10, 20, function() {
		spr1.destroy = true;
	}, null);
	obj.destroy = true;
	score = score + 50;
	tscore.write(score);
	stars++;
	putCompleteStar();
}
var sphere;
var PROTECTED;

function runOnBonus(obj) {
	if(PROTECTED) clearTimeout(PROTECTED);
	if(obj) {
		if(sphere) sphere.destroy = true;
		obj.destroy = true;
		sphere = new Sprite(bitmaps.sphere, 43, 43);
		sphere.x = unit.hitArea.x;
		sphere.y = unit.hitArea.y;
		stage.addChild(sphere);
	}
	unit.protected = true;
	PROTECTED = setTimeout(function() {
		unit.protected = false;
		sphere.destroy = true;
	}, 4000);
}

function runOnPresent(obj) {
	var spr1;
	spr1 = new Sprite(bitmaps.p100, 32, 16);
	spr1.x = obj.x;
	spr1.y = obj.y - 10;
	stage.addChild(spr1);
	spr1.moveBy(0, -5, 10, 20, function() {
		spr1.destroy = true;
	}, null);
	obj.destroy = true;
	score = score + 100;
	tscore.write(score);
}

function runOnBomb(obj) {
	obj.destroy = true;
	missLife();
}

function runOnRound(obj, num) {
	var spr1;
	if(num == 1) {
		spr1 = new Sprite(bitmaps.p500, 32, 16);
		score = score + 500;
	}
	if(num == 2) {
		spr1 = new Sprite(bitmaps.p100, 32, 16);
		score = score + 100;
	}
	spr1.x = obj.x;
	spr1.y = obj.y - 10;
	stage.addChild(spr1);
	tscore.write(score);
	spr1.moveBy(0, -5, 10, 20, function() {
		spr1.destroy = true;
	}, null);
	var spr = new Sprite(bitmaps.round2, 41, 90);
	spr.x = obj.x;
	spr.y = obj.y;
	stage.addChild(spr);
	setTimeout(function() {
		spr.destroy = true;
	}, 200);
}

function Text(font, width, height) {
	this.ALIGN_LEFT = 0;
	this.ALIGN_RIGHT = 1;
	this.ALIGN_CENTER = 2;
	this.font = font;
	this.x = 0;
	this.y = 0;
	this.width = width;
	this.height = height;
	this.align = this.ALIGN_LEFT;
	this.rotation = 0;
	this.static = false;
	this.charMap = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
	this.sprites = [];
	this.manageSprites = function(text) {
		var i, char;
		var len = text.length;
		var sp_len = this.sprites.length;
		if(sp_len < len) {
			for(i = 0; i < len - sp_len; i++) {
				char = new Sprite(this.font, this.width, this.height, this.charMap.length);
				this.sprites.push(char);
				stage.addChild(char);
			}
		}
		if(sp_len > len) {
			for(i = 0; i < sp_len - len; i++) stage.removeChild(this.sprites[i]);
			this.sprites.splice(0, sp_len - len);
		}
	}
	this.write = function(text) {
		var curX, curY, p, p2, n;
		text = text + "";
		this.manageSprites(text);
		curX = this.x;
		curY = this.y;
		if(this.align == this.ALIGN_CENTER) curX = this.x - (text.length - 1) / 2 * this.width;
		if(this.align == this.ALIGN_RIGHT) curX = this.x - (text.length - 1) * this.width;
		p = new Vector(curX - this.x, 0);
		p.rotate(-this.rotation);
		curX = p.x + this.x;
		curY = p.y + this.y;
		p = new Vector(0, 0);
		for(var i = 0; i < text.length; i++) {
			this.sprites[i].visible = true;
			n = this.charMap.indexOf(text.substr(i, 1));
			if(n < 0) this.sprites[i].visible = false;
			else {
				this.sprites[i].gotoAndStop(n);
				p2 = p.clone();
				p2.rotate(-this.rotation);
				this.sprites[i].x = p2.x + curX;
				this.sprites[i].y = p2.y + curY;
				this.sprites[i].rotation = this.rotation;
				this.sprites[i].static = this.static;
				p.x += this.width;
			}
		}
		for(var i = 0; i < this.sprites.length; i++) {
			this.sprites[i].ignoreViewport = true;
		}
	}
	this.moveTo = function(valueX, valueY, duration) {
		for(var i = 0; i < this.sprites.length; i++) {
			this.sprites[i].moveTo(valueX, valueY, duration, 30, function(e) {
				e.target.obj.moveTo(getStageCenter(), 165, 10, 30, function(ev) {
					ev.target.obj.destroy = true;
				});
				count = 0;
			}, null);
		}
	}
};
var Loader = {
	endCallback: null,
	loadedData: null,
	landscapeMode: false,
	create: function(callback, landscape) {
		Loader.endCallback = callback;
		Loader.landscapeMode = landscape;
		var c = document.getElementById("progress_container");
		c.style.zIndex = "1000";
		c = document.getElementById("progress");
		var img = document.createElement('img');
		img.src = 'images/' + Utils.globalScale + '/splash.png';
		img.id = 'loader_splash';
		c.appendChild(img);
		document.getElementById("screen_background_container").style.background = "#ffffff";
	},
	progressVal: 0,
	showLoadProgress: function(val) {
		Loader.progressVal = val;
	},
	loadComplete: function(data) {
		Loader.showLoadProgress(100);
		Loader.loadedData = data;
	},
	close: function() {
		Loader.endCallback(Loader.loadedData);
		if(Utils.touchScreen) document.body.addEventListener("touchstart", Utils.preventEvent, false);
		var c = document.getElementById("progress_container");
		c.style.display = 'none';
	}
};;