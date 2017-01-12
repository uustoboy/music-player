var Music = {
	init            : function( data ){
		this.data = [];//存储数据;
		this.randomArr = [];
		for( var i=0,len=data.length;i<len;i++ ) {
			if( data[i].src ){
				this.data.push( data[i] ); 
				this.randomArr.push(i);
			}
		}
		this._getElement(); //获取dom;
		this.createAudio()//创建音频;
		this.createMusicList(); //创建歌单;
	},
	_getElement    : function(){
		this.list_ul = $('#list_ul');
		this.music_switch = $('#music_switch');
		this.music_before = $('#music_before');
		this.music_after = $('#music_after');
		this.time_start = $('#time_start');
		this.time_end = $('#time_end');
		this.process_line = $('#process_line');
		this.line_after = $('#line_after');
		this.window = $(window);
		this.bodybg = $('.body_bg');
		this.dot = $('#dot');
		this.turn = $('#turn');
		this.trunNum = 0;
		this._dot = document.getElementById('dot');
		this._process_line = document.getElementById('process_line');
		this.Time = null;
		this.startPic = this.bodybg.css('backgroundImage');
		this.dragBtn = false;
		this.playing = false;
	},
	_bindElement   : function(){

		var that = this;

		this.turn.tap(function(){ 
			that.trunNum++;
			var status = that.trunNum % 3;
			switch(status){
				case 0: 
					that.turn.html('顺');
				break;
				case 1:
					that.randomArr.sort(function(){
						return Math.random()>0.5?-1:1;
					});
					that.turn.html('随');
				break;
				case 2: 
					that.turn.html('单');
				break;
			}
		});

		
		//下一首歌
		this.music_before.tap(function(){
			that._beforeMusic();
		});
		
		//上一首歌
		this.music_after.tap(function(){
			that._afterMusic()
		});

		//歌单
		this.music_switch.on('tap',function(){
			that._fnPlay();
		});

		
	    this.lineW = this.process_line.width() - this.dot.width();
		function _touchstart( event ){ 
			
			that.dragBtn = true;

			that.maxX = that.process_line.width() - that.dot.width();
			
			event.stopPropagation();  
		}

		function _touchmove( event ){
			var touch = event.targetTouches[0];
			var moverX = touch.pageX; 
			that.dragBtn = true;
			moverX = moverX < 0 ? 0 : moverX;
			moverX = moverX > that.maxX  ? that.maxX : moverX;
			
			that.dot.css('left',moverX);
			that.line_after.css('width',moverX);
			that.dragX = touch.pageX;
			event.stopPropagation();
		}

		function _touchend( event ){
			var touch = event.targetTouches[0];
			event.stopPropagation();
			_tapLine();
		}
		this.process_line.click(function(event){
			var eX = event.clientX > that.lineW ? that.lineW : event.clientX;

			that.dot.css('left',eX);
			that.line_after.css('width',eX);
			_tapLine();
		});
		function _tapLine(){
			var l = parseFloat(that.dot.css('left'));
			var maxL = parseFloat(that.lineW);
			that._audio.currentTime = that._percentage( l,maxL,that._audio.duration);
			clearInterval(that.Time);
			that._musicTimer();			
			that.dragBtn = false; 
		}

		this._dot.addEventListener('touchstart',_touchstart,false);
		this._dot.addEventListener('touchmove',_touchmove,false);
		this._dot.addEventListener('touchend',_touchend,false);
	},
	createAudio   : function(){
		var html = '<audio id="audio" >您的浏览器不支持音频元素。</audio>';
		$('body').append(html);
		this._audio = document.getElementById('audio');
	},
	createMusicList  : function(){
		var that = this;
		var html = '';
		var data = this.data;
	    this._getHeight();
		for( var i=0,len=data.length;i<len;i++ ){
			var name,singer,src,pic;
			
			if( toStrings(data[i].name).length > 0){
				name = toStrings(data[i].name);
			}else{
				name = '未知';
			}
			if( toStrings(data[i].singer).length > 0){
				singer = toStrings(data[i].singer);
			}else{
				singer = '未知';
			}

			/*
			if( data[i].cover ){
				pic = data[i].cover;
			}else{
				pic = this.startPic;
			}
			*/
			pic = data[i].cover;
			src = data[i].src;

			html += '<li music_index='+i+' music_name='+ name +'  music_singer='+ singer +'  music_src='+src+' music_pic='+ pic +'>'  
					 +'<div class="music_mian">'
					 +	'<p class="music_name">'+name+'</p>'
					 +	'<p class="music_singer">'+singer+'</p>'
					 +  '</div>'
					 + '<div class="list_line"></div>'
					 +'</li>';
					 
		}
		this.list_ul.html(html);

		//列表绑定事件；
		this.list_ul.on('tap','li',function(){
			
			that._bindElement();//创建事件;
			that._cutSongs(this);

		});
		
		//转换字符去掉空格；
		function toStrings( txt ){
			return txt.split(' ').join('&nbsp;').toString();
		}
	},
	_afterMusic : function(){
		var status = this.trunNum % 3;
		var current = this.list_ul.find('.cur');
		var index = current.index();
		var maxLen = this.data.length-1;
		var obj;

		if( status == 0 || status == 2 ){
			if( index == 0 ){

			  obj = this.list_ul.find('li').last();

			}else if( index > 0 ){

			  obj = current.prev();

			}
		}else if( status == 1 ){
			for(var i=0;i<maxLen;i++){
				if( this.randomArr[i] == index ){
					var num = i;
					num--;
					if( num <= 0 ){
						num = maxLen;
					}
					obj = this.list_ul.find('li').eq(this.randomArr[num]);
				}
			}
		}
		this._cutSongs(obj);
	},
	_beforeMusic : function(){
		var status = this.trunNum % 3;
		var current = this.list_ul.find('.cur');
		var index = current.index();
		var maxLen = this.data.length-1;
		var obj;

			if( status == 0 || status == 2){
				if( index == maxLen ){

				  obj = this.list_ul.find('li').first();

				}else if( index < maxLen ){

				  obj = current.next();

				}
			}else if( status == 1 ){
				for(var i=0;i<maxLen;i++){
					if( this.randomArr[i] == index ){
						var num = i;
						num++;
						if( num >= maxLen ){
							num = 0
						}
						obj = this.list_ul.find('li').eq(this.randomArr[num]);
					}
				}	
			}
			
		this._cutSongs(obj);
	},
	_cutSongs : function( obj ){
		 this.playing = true;
		$(obj).addClass('cur').siblings('li').removeClass('cur');
		var music_src = $(obj).attr('music_src');
		var music_pic = $(obj).attr('music_pic');
		var music_name = $(obj).attr('music_name');
		var music_singer = $(obj).attr('music_singer');

		$('#name_txt').html(music_name);
		$('#singer_txt').html(music_singer);
		
		if( music_pic ){
			this.bodybg.attr('style','background-image:url('+music_pic+');' );
		}else{
			this.bodybg.css('backgroundImage',this.startPic+';');
		}
		this.bodybg.addClass('cur');
		
		this._audio.src = music_src;
		
		this._fnPlay();
	},
	_getHeight :function(){
		var wH = $(window).height();
		var mH = $('#audio_main').height();
		var $musicMain = $('#list_main');
		var h = wH - mH;
		$musicMain.height(h);
		
	},
	_fnPlay  : function(){
		var that = this;
		
			if( this._audio.paused ){

				//判断是否重新加载歌曲    
				if(this.playing){
					this._audio.load();
					this.playing = false;
				}
				
				this._audio.play();
				this.music_switch.addClass('cur');
				this._audio.addEventListener('loadeddata',function(){
					var timerMain = that._toTime(that._audio.duration);
					var len = timerMain.split(':').length;
					
					switch(len){
						case 1: 
							that.time_start.html('00');
						break;
						case 2: 
							that.time_start.html('00:00');
						break;
					}
					
					that.time_end.html(timerMain);
					that._musicTimer();
					
				 },false);
				
			}else{
				clearInterval(that.Time);
				this._audio.pause();
				this.music_switch.removeClass('cur');
				
			}
		
		
	},
	_percentage:function( a,b,c ){
		return	a/b*c;
	},
	_musicTimer : function(){
		var that = this;
		this.Time = setInterval(_snowTime,1000);
		var timerMain = that._toTime(that._audio.duration);
		var len = timerMain.split(':').length;
		function _snowTime(){
			
			if( that._audio.currentTime == that._audio.duration ){
				clearInterval(that.Time);
				var status = that.trunNum % 3;
				switch(status){
					case 0: 
						that._beforeMusic();
					break;
					case 1:
						that._beforeMusic();
					break;
					case 2: 
						var current = that.list_ul.find('.cur');
						that._cutSongs(current);
					break;
				}
			}
			if(!that.dragBtn){
				var timerMain = that._toTime(that._audio.currentTime);
				var l = that._percentage( that._audio.currentTime,that._audio.duration,parseFloat(that.lineW) );
				that.dot.css('left',l);
				that.line_after.css('width',l);
			}
			switch( len ){
				case 1: 
					that.time_start.html(timerMain);
				break;
				case 2: 
					if(timerMain){
						var timer = timerMain.indexOf(':')>0?timerMain:'00:'+timerMain;
						that.time_start.html(timer);
					}
				break;
			}
		} 
	},
	_toTime : function( time ){
		var hour  = Math.floor(time/3600);
		var min   = Math.floor(time%3600/60);
		var sec   = Math.floor(time%60);
		
		var ih = hour <= 9 ? '0'+hour : hour;
		var im = min <= 9 ? '0'+min :min; 
		var is = sec <= 9 ? '0'+sec :sec;
		return ( ih > 0 ? ih+':' : '') + (im >0 ? im+':' :'') +is;
	}
}