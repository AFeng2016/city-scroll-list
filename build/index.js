/*!
 * city-scroll v1.0
 * (c) 2016-2018 kaiji
 * Released under the MIT License.
 */

'use strict';

CITY_SCROLL.cityObj = {
    fixedElm:null,
    timer:null,
    listItem:null,
    listChild:null,
    titleHeight: 0,
    childHeight:0,
    sideOffset:0,
    isChange:false,
    tempTime:300,
    startTempTime:0,
    init:function(){
        var self = CITY_SCROLL.cityObj;
        var touchE = 'ontouchstart' in window ? 'tap' : 'click';
        var touchUp = 'ontouchstart' in window ? 'touchend' : 'mouseup';
        var touchMove = 'ontouchstart' in window ? 'touchmove' : 'mousemove';
        var touchDown = 'ontouchstart' in window ? 'touchstart' : 'mousedown';

        window.onload = function(){

            // 初始化组件
            self.render();

            self.fixedElm = $('.city-fixed');
            self.listItem = $('.list-group-title');
            self.listChild = $('.list-group-item');
            self.titleHeight = self.fixedElm.height();
            self.childHeight = self.listChild.height();

            // https://ustbhuangyi.github.io/better-scroll/doc/zh-hans/options.html#probetype
            var scroll = new BScroll(document.querySelector('#J_listContent'),{
                probeType: 3, // 3 滚动过程中 实时返回滚动数据 scroll事件接收参数的时机
                click: true, // 阻止浏览器的原生 click 事件 重新派发事件绑定 用以支持 自定义事件 scroll等
                tap: true, // 它会在区域被点击的时候派发一个 tap 事件，你可以像监听原生事件那样去监听它
                scrollY: true, // 开启纵向滚动
                scrollX: false // 关闭横向滚动 更多配置参数请移步api
            });

            // 自定义事件 滚动事件
            scroll.on('scroll',function(e){
                toggleFixed(e);
            });
            
            // 自定义事件 滚动结束
            scroll.on('scrollEnd',function(e){
                toggleFixed(e);
                self.tempTime = 300;
            });

            // 自定义事件 滚动开始
            $('#J_listContent').on(touchDown,function(e){
                self.startTempTime = e.timeStamp;
            });

            // 自定义事件 触摸结束
            $('#J_listContent').on(touchUp,function(e){
                self.tempTime = e.timeStamp - self.startTempTime;
                // console.log(self.tempTime)
            });

            // 点击事件
            $('.list-group-item').on(touchE,function(){
                alert('您选择了'+$(this).data('city'))
            });

            // 导航侧栏
            $('.city-shortcut li').on('touchmove',function(event){
                var $this =$(this);
                var e = event.originalEvent.touches[0];
                var pageY = e.pageY;
                var endIndex = 0;

                // 单个按钮高度
                var itemHeight = $this.outerHeight();

                // 鼠标偏移量 + 当前按下的按钮索引*单个按钮高度
                var sideHeight = pageY + $this.outerHeight() * event.target.dataset.index;

                if(!self.isChange){
                    self.sideOffset = sideHeight;
                    self.isChange = true;
                }

                
                if (sideHeight > self.sideOffset){

                    endIndex = parseInt(event.target.dataset.index) + Math.floor((sideHeight - self.sideOffset) / itemHeight);

                    scroll.scrollTo(0, -self.listItem[(endIndex < 0 ? 0 : endIndex > 24 ? 24 : endIndex)].offsetTop);
                }else{
                    
                    endIndex = parseInt(event.target.dataset.index) - Math.floor((self.sideOffset - sideHeight) / itemHeight);

                    scroll.scrollTo(0, -self.listItem[(endIndex < 0 ? 0 :endIndex > 24 ? 24: endIndex)].offsetTop);
                }
                
                return false;
            });
            
            // 导航侧栏
            $('.city-shortcut li').on(touchUp,function(e){
                self.isChange = false;
                return false;
            });

            // 导航侧栏
            $('.city-shortcut li').on(touchDown,function(e){
                self.tempTime = 100;
                scroll.scrollTo(0, -self.listItem[e.target.dataset.index].offsetTop);
                return false;
            });
        }

        /**
         * 切换显示 城市分组的标题
         * 
         * @param {any} e scroll事件对象
         */
        function toggleFixed(e){

            var isfixed = self.fixedElm.hasClass('active');

            if (e.y < -self.titleHeight && !isfixed) {

                self.fixedElm.addClass('active');
            } else if (e.y > -self.titleHeight && isfixed) {

                self.fixedElm.removeClass('active');
            }

            // 滑动切换分组标题
            self.listItem.each(function (index,item){

                var offset = item.offsetTop + e.y;
 
                if (offset <= self.titleHeight){

                    offset = (self.titleHeight - offset);
                    if (offset >= self.titleHeight){
                        if (self.tempTime < 300) {
                            
                            showToastText(subStr($('.list-group').eq(index).find('.list-group-item'), e.y));
                            // return false;
                        }
                        self.fixedElm.attr('style', 'transform:translate3d(0,0,0)').find('.fixed-title').html($(item).html());
                    }else{
                        
                        self.fixedElm.attr('style', 'transform:translate3d(0,-' + offset + 'px,0)');
                    }
                    
                    
                }
                

            });
        }
        
        /**
         * 展示 首字符
         * 
         * @param {any} str 
         */
        function showToastText(str){
            var oToast = $('.name-text');
            
            if(str == '') return false;
            
            clearTimeout(self.timer);
            oToast.addClass('show').html(str);
            self.timer = setTimeout(function(){
                oToast.removeClass('show');
                
            },500)
        }

        /**
         * 截取字符串
         * 
         * @param {any} strObj 
         * @param {any} scrollY
         */
        function subStr(strObj, scrollY){
            var result = '';
            var tempId = '';
            
            strObj.each(function (index, item){
                var $this = $(item);
                var offset = item.offsetTop + scrollY;
                var offsetCalc = (self.childHeight - offset);

                if (offsetCalc >= self.childHeight && tempId != $this.data('id')) {

                    tempId = $this.data('id');
                    result = $this.data('city').split('')[0];
                    
                }
            });
            return result;
        }
        
    },
    /**
     * 初始化组件
     * 
     */
    render:function(){
        var tpl = [];
            tpl.push('<div class="content city-list-content">');
            
            tpl.push('    <ul>');

            CITY_SCROLL.city.data.forEach(function(item,index){
                
                tpl.push('        <li class="list-group">');
                tpl.push('            <h2 class="list-group-title">'+item.name+'</h2>');
                tpl.push('            <ul>');

                item.cities.forEach(function (items, indexs) {
                    
                    tpl.push('                <li class="list-group-item" data-lng="' + items.lng + '" data-lat="' + items.lat +'" data-id="' + items.cityid +'" data-city="' + items.name+'">');

                    tpl.push('                    '+items.name);
                    tpl.push('                </li>');
                });
                
                tpl.push('            </ul>');
                tpl.push('        </li>');
            });

            tpl.push('    </ul>');
            tpl.push('</div>');
            tpl.push('<div class="city-shortcut">');
            tpl.push('    <ul>');

            CITY_SCROLL.city.data.forEach(function(item,index){

                if(index == 0){

                    tpl.push('        <li data-index="'+index+'" class="item">★</li>');
                }else{
                    
                    tpl.push('        <li data-index="'+index+'" class="item">'+item.name+'</li>');
                }
            });
            tpl.push('    </ul>');
            tpl.push('</div>');
            tpl.push('<div class="city-fixed">');
            tpl.push('    <h2 class="fixed-title">');
            tpl.push('    ★热门城市');
            tpl.push('    </h2>');
            tpl.push('</div>');
            tpl.push('<div class="name-text">南');
            tpl.push('</div>');

        $('#J_listContent').html(tpl.join(''));
    }
};

CITY_SCROLL.cityObj.init();