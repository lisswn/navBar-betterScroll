$(function () {  
    new Vue({
        el: '#homePage',
        data: function () {  
            return {
                navList: [
                    {key: true, val:'个人所得税'},
                    {key: false, val:'社保费'},
                    {key: false, val:'车船税'},
                    {key: false, val:'房产交易'},
                    {key: false, val:'缴款'},
                    {key: false, val:'完税证明'},
                    {key: false, val: '住房公积金'},
                    {key: false, val: '医疗'},
                    {key: false, val: '交通'},
                    {key: false, val: '政务'},
                    {key: false, val:'综合应用'},
                ],
                navScroll: '',   //导航滚动实例
                menuScroll: '',  //菜单列表滚动实例
                liNum: 0,      //记录当前屏幕宽度下正常展示导航条的li的个数
                menuItemTop: [],     //记录每个菜单的offsetTop值
                liDisX: 0,    //li每次滑动距离
                clickFlag: false,   //控制在点击导航栏时就禁用滚动事件中触发的导航栏滑动
                navLiLeft: [],    //记录导航栏每个li的offsetLeft值
                navLiActive: 0,   //记录当前导航菜单激活的索引值

                navLeftFlag: false,   //控制导航栏左向滚动时机
                navRightFlag: false,  //控制导航栏右向滚动时机

            }

        },
        methods: {
            //导航栏与内容滚动实例
            betterScroll: function (options) {  
                var that = this;
                //切换导航栏li
                function changeNavList() {  
                    var navUl = $(options.hosEl).children(0).get(0);
                    // 只能使用原生的click事件才能保证绑定事件不被触发多次 
                    navUl.onclick = function (e) {
                        var e = event||window.event;
                        if (e.stopPropagation) {
                            e.stopPropagation();
                        } else {
                            e.cancelBubble = true;
                        }
                        //当在执行点击导航栏li时就禁用内容滚动区域导致的导航栏滑动事件
                        that.clickFlag = true;
                        var index = $(options.hosEl).children().children().index(e.target);
                        that.navList.forEach((ele,num) => {
                            ele.key = false;
                            if (index == num) {
                                ele.key = true;
                            }
                        });

                        var windowWidth = window.innerWidth/2;
                        var ulWidth = $(options.hosEl).children().width();
                        var disX = ulWidth - window.innerWidth;
                        if (e.clientX > windowWidth) {
                            if (that.navScroll.x > that.navScroll.maxScrollX) {
                                if (that.liNum == 0) {
                                    //当屏幕较宽导致导航栏最后一个li不完全展示时，此时that.liNum的值为0，
                                    // 点击滑动时滑动距离需要使用导航条的宽度减去屏幕宽度值
                                    that.navScroll.scrollBy(-disX, 0, 100);
                                }else{
                                    that.navScroll.scrollBy(-that.liDisX, 0, 100);
                                }
                            }
                        }else{
                            if (that.navScroll.x < 0) {
                                if (that.liNum == 0) {
                                    that.navScroll.scrollBy(disX, 0, 100);
                                }else{
                                    that.navScroll.scrollBy(that.liDisX, 0, 100);
                                }
                            }
                        }

                        that.menuItemTop.forEach((ele,num)=>{
                            if (index == num) {
                                that.menuScroll.scrollTo(0, -that.menuItemTop[num],200);
                            }
                        })
                    }
                }

                var controlUse = true;
                function showUl() { 
                    //页面初始化只让该函数执行一次
                    if (controlUse) {
                        controlUse = false;
                        var lis = $(options.hosEl).children().children();
                        var len = lis.length;
                        var width = 0;
                        var breakFlag = true;
                        for (var i = 0; i < len; i++) {
                            width += $(lis[i]).innerWidth();
                            //当显示的最后一个li距离屏幕距离很近时特殊处理
                            if (Math.abs(width - window.innerWidth) < 15) {
                                that.liNum = i + 1;
                                breakFlag = false;
                            }
                        };
                        
                        for (var j = 0; j < len; j++) {
                            if (breakFlag) {
                                //当当前屏幕宽度处在某两个li的offsetLeft范围之间时，就记录当前li的索引值，用于计算超出屏幕的li的个数
                                if ($(lis[i]).offset().left > window.innerWidth && $(lis[i-1]).offset().left <= window.innerWidth) {
                                    that.liNum = i;
                                } 
                            }
                            
                        };
                        //判断当前移动系统安卓或者ios
                        function confirmOS() {  
                            var u = navigator.userAgent;
                            if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) {//安卓手机
                                return 1;
                            } else if (u.indexOf('iPhone') > -1) {//苹果手机
                                return 2
                            } else if (u.indexOf('Windows Phone') > -1) {//winphone手机
                                return 3
                            }
                        }
                        //由于在ios上ul的宽度设置后偏小，一行放不下，所以在ios上多加几个像素
                        var navUlWidth = confirmOS() == 1 ? (width + 2) : (width + 4);
                        //创建导航栏水平滚动实例
                        $(options.hosEl).children().css('width', navUlWidth);
                        var wrapper = $(options.hosEl).get(0);
                        that.navScroll = new BScroll(wrapper,{
                            scrollX: true,
                            scrollY: false,
                            freeScroll:true,
                            click: true,
                            bounce: {
                                left: false,
                                right: false
                            }
                        });

                        //绑定导航栏li的点击事件
                        changeNavList(); 
                        //当点击导航栏li结束时就放开对内容滚动区域导致的导航栏滑动事件的限制
                        that.navScroll.on('touchEnd',function () {  
                            //此处加上延时是关键，因为移动端的click事件比touchend事件延迟300ms，
                            // 所以当点击过li时，如果不加延迟就会先触发touchend事件后触发click事件使得clickFlag=true，
                            // 导致点击过后就无法响应内容滚动时导航栏的滑动了
                            setTimeout(function () {  
                                that.clickFlag = false;
                            },400)
                        })
                        //获取导航栏菜单的li的个数
                        var lisLen = $(options.hosEl).children().children().length;
                        //计算每次滑动应该滑动的距离（ul的最大可滑动距离除以未展示的li的个数）
                        that.liDisX = -that.navScroll.maxScrollX/(lisLen - that.liNum);
                        //获取导航栏每个li的offsetLeft的值为了在内容滚动时确定导航栏应该滚动的时间
                        for (var i = 0; i < lisLen; i++) {
                            if (that.navLiLeft.indexOf($(lis[i]).offset().left) == -1) {
                                that.navLiLeft.push($(lis[i]).offset().left);
                            }
                        };
                    }
                }

                //注册垂直滚动实例及绑定内容滚动事件
                that.$nextTick(function () {
                    if (!document.querySelector(options.posTopEl)) {
                        $('.placeholder-header').hide();
                    }  
                    var windowHeight = $(window).height();
                    //获取顶部固定定位元素的高度
                    var fixedTopH = $(options.posTopEl).height() || 0;
                    //获取底部固定定位元素的高度
                    var fixedBottom = $(options.posBottomEl).height() || 0;
                    var fixedH = fixedTopH + fixedBottom;
                    //获取顶部固定定位元素的初始定位值
                    var fixedTopPos = $(options.posTopEl) ? $(options.posTopEl).css('top') : '-50';
                    $(options.verEl).height(windowHeight - fixedH);
                    //创建垂直滚动实例
                    var box = document.querySelector(options.verEl);
                    that.menuScroll = new BScroll(box,{
                        scrollX: false,
                        scrollY: true,
                        freeScroll: true,
                        probeType: 3,   //派发实时scroll事件，只能设置为3
                        bounce: {
                            top: false
                        }
                    });

                    var coverH = $(options.coverEl) ? $(options.coverEl).height() : 0;
                    //注册滚动事件
                    that.menuScroll.on('scroll', function (pos) {  
                        var disY = Math.abs(pos.y);
                        if (pos.y <= -coverH) {
                            if ($(options.hosEl).attr('scroll') == '0') {
                                //此处不使用显示与隐藏的原因是，当导航栏隐藏后之前添加的事件会失效，
                                // 但是如果每次显示时再绑定事件又会出现事件多次绑定的问题，所以使导航栏初始存在，位置在屏幕之外
                                showUl();  //内部只执行一次
                                $(options.hosEl).attr('scroll', '1');
                                $(options.hosEl).animate({'top': fixedTopH, 'opacity':'1', 'zIndex': '800'}, 10);
                            }
                        }else{
                            $(options.hosEl).attr('scroll', '0');
                            $(options.hosEl).animate({'top': fixedTopPos, 'opacity':'0', 'zIndex': '0'}, 10);
                        }
                        //设置当前被激活的索引值
                        that.navList.forEach((ele, index)=>{
                            ele.key = false;
                            //判断时减5的原因是滚动时对应的值会比获取到的内容菜单的值要大一点，不符合要求
                            if (disY < (that.menuItemTop[index+1] - 5) && disY >= (that.menuItemTop[index] - 5)) {
                                that.navList[index].key = true;
                                that.navLiActive = index;
                            }else if (disY >= (that.menuItemTop[that.navList.length-1] - 5)) {
                                that.navList[that.navList.length-1].key = true;
                                that.navLiActive = that.navList.length-1;
                            }
                            
                        })

                        //当内容区域从下往上滑时，当激活索引值变化时，就让菜单栏滚动一次
                        if (that.menuScroll.movingDirectionY == 1) {
                            // 当前激活索引值的li到左侧屏幕的距离，大于屏幕宽度一半时才允许滑动
                            if (that.navLiLeft[that.navLiActive] > window.innerWidth/2) {
                                if (that.navLeftFlag) {
                                    that.navLeftFlag = false;
                                    if (that.navScroll.x > that.navScroll.maxScrollX && !that.clickFlag) {
                                        that.navScroll.scrollBy(-that.liDisX, 0, 200);
                                    }
                                }         
                            }
                        }

                        //获取当前激活索引值的li到左侧屏幕的距离，小于屏幕宽度一半时才允许滑动
                        var pageX = that.navLiLeft[that.navLiActive] - Math.abs(that.navScroll.x);
                        //当内容区域从上往下滑时，当激活索引值变化时，就让菜单栏滚动一次
                        if (that.menuScroll.movingDirectionY == -1) {
                            if (pageX < window.innerWidth/2) {
                                if (that.navRightFlag) {
                                    that.navRightFlag = false;
                                    if (that.navScroll.x < 0 && !that.clickFlag) {
                                        that.navScroll.scrollBy(that.liDisX, 0, 200);
                                    }
                                }
                            }
                        }
                    })
                    //记录每个内容菜单项的offsetTop值
                    var menuItem = $(options.contentEl).children();
                    var len = menuItem.length;
                    //获取需要被覆盖的元素的高度
                    var coverH = $(options.coverEl) ? $(options.coverEl).height() : 0;
                    //获取顶部固定定位元素的高度和被覆盖的元素高度之和
                    var topHeight = $(options.posTopEl).height() || 0;
                    var height = topHeight + coverH;
                    for (var i = 0; i < len; i++) {
                        that.menuItemTop.push($(menuItem[i]).offset().top - height - 5);
                    };
                    //设置最后一个菜单项的多余高度，使其可以滚动到顶部
                    var lastLiH = $(options.contentEl).children().size()-1;
                    var space = options.contentListSpace || 0;
                    var setLastLiH = windowHeight - fixedH - $(options.hosEl).height() - space;
                    $(options.contentEl).children().eq(lastLiH).height(setLastLiH);
                })
            }
        },

        watch: {
            navLiActive: function (newVal,oldVal) { 
                var numL = 0;
                var numR = 0;
                //判断左滑时当某个li的offsetLeft值大于屏幕宽度一半时就开始滑动
                if (this.menuScroll.movingDirectionY == 1) {
                    for (var i = 0; i < this.navLiLeft.length; i++) {
                        if (this.navLiLeft[i] > window.innerWidth/2) {
                            numL = i;
                            break;
                        }
                    };
                    // 当某个li的offsetLeft值大于屏幕宽度一半时才允许滑动
                    if (newVal >= numL ) {
                        this.navLeftFlag = true;
                    }
                }

                //当右滑时进行反向判断，当索引所在li距离屏幕左侧距离小于屏幕宽度一半时就开始滑动
                if (this.menuScroll.movingDirectionY == -1) {
                    for (var i = this.navLiLeft.length - 1; i > 0; i--) {
                        var pageX = this.navLiLeft[i] - Math.abs(this.navScroll.x);
                        if (pageX < window.innerWidth/2) {
                            numR = i;
                            break;
                        }
                    };
                    // 索引所在li距离屏幕左侧距离小于屏幕宽度一半时才允许滑动
                    if (newVal <= numR) {
                        this.navRightFlag = true;
                    }
                }
            }
        },

        created: function () { 
            //实例化滚动插件
            this.betterScroll({
                hosEl: '#navFixed',   //水平方向导航菜单滚动元素
                verEl: '.tax-content',    //垂直方向内容滚动元素
                // posTopEl: '.user-title',  //存在的顶部固定定位元素，不存在可不传
                // posBottomEl: '.bar-tab',  //存在的底部固定定位元素，不存在可不传
                contentEl: '.menu-wrap',  //内容滚动列表的外层包裹元素
                coverEl: '.search',   //存在的需要被导航栏覆盖的元素，不存在可不传
                contentListSpace: 18  //内容列表之间的间距，随自己的设置调整
            });
            

        }
    })
})