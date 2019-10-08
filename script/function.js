// +----------------------------------------------------------------------
// | 公共函数
// +----------------------------------------------------------------------
// | Author: 唐飞 <tangfei@cnmiaosu.com>
// +----------------------------------------------------------------------

//图片资源地址
var imgSrc   = 'http://120.194.4.131:8281/drs/json-rpc/';

'use strict';

var func = {

	//默认加载公共方法
	init:function(header)
	{
		func.header(header || '#header'); //沉浸式状态栏 header为节点
		func.navbar();  		   //状态栏 light dark
		func.offline();  		   //监控网络异常
	},

	//查询权限设置
	hasPermission:function(){
		var rets = api.hasPermission({
			list:[
				'camera',
				// 'contacts',
				'microphone',
				'photos',
				'location',
				'locationAlways',
				'notification',
				// 'calendar',
				'phone',
				'storage'
			],
		});
		var tips = [
			{'name':'camera','tips':'相机'},
			// {'name':'contacts','tips':'通讯录'},
			{'name':'microphone','tips':'麦克风'},
			{'name':'photos','tips':'相册'},
			{'name':'location','tips':'定位'},
			{'name':'locationAlways','tips':'后台定位'},
			{'name':'notification','tips':'通知'},
			// {'name':'calendar','tips':'日历'},
			{'name':'phone','tips':'电话'},
			{'name':'storage','tips':'存储空间'}
		]
		var _str = [];
		for(var i = 0; i < rets.length; i++){
			if(!rets[i].granted){
				_str.push(tips[i].tips)
			}
		}
		if(_str.length > 0){
			api.confirm({
				title: '提醒',
				msg: '您未允许APP获得' + _str.join('、') + "权限是否前往设置？",
				buttons: ['去设置', '取消']
			}, function(ret, err) {
				if(1 == ret.buttonIndex){
					api.openApp({
						iosUrl:"app-settings:﻿",
						androidPkg:'com.android.settings'
					},function(ret,err){});
				}
			});
		}
	},

	closeWin:function(){
		api.closeWin();
	},

	isIos:function(){
		return api.systemType === 'ios' ? true : false;
		// return true;
	},

	//正则关键词标颜色
	resetWordColor:function(keywords,str){
		if(str.indexOf(keywords.toUpperCase()) > -1){
			var reg = new RegExp(""+keywords.toUpperCase()+"","g");
			return str.replace(reg,"<mark>"+keywords.toUpperCase()+"</mark>");
		}else{
			var reg = new RegExp(""+keywords.toLowerCase()+"","g");
			return str.replace(reg,"<mark>"+keywords.toLowerCase()+"</mark>");
		}
	},

	//定位-获取经纬度
	gps:function(fn){
		var aMap = api.require('aMap');
		aMap.getLocation(function(ret, err) {
			if (ret.status) {
				//经度,纬度
				if(typeof fn === 'function') fn({
					lon:ret.lon,
					lat:ret.lat
				})
			} else {
				func.msg(JSON.stringify(err));
			}
		});
	},

	//定位 - 根据经纬度获取位置 经度,纬度
	gpsLocation:function(lon,lat,fn){
		var aMap = api.require('aMap');
		aMap.getNameFromCoords({
			lon: lon,
			lat: lat
		}, function(ret, err) {
			if (ret.status) {
				if(typeof fn === 'function') fn(ret.address)
			} else {
				func.msg(JSON.stringify(err));
			}
		});
	},

	//要关闭的弹出层
	closeOpenWin:function(){
		api.execScript({
			name:'main',
			script: "close()"
		});
		api.execScript({
			name: api.winName,
			frameName: 'select_type',
			script: "close()"
		});
		api.execScript({
			name: api.winName,
			frameName: 'select_type2',
			script: "close()"
		});
		api.execScript({
			name: api.winName,
			frameName: 'filter',
			script: "close()"
		});
		api.execScript({
			name: api.winName,
			frameName: 'filter_brand',
			script: "close()"
		});
		api.execScript({
			name: api.winName,
			frameName: 'pick_paizhao',
			script: "close()"
		});
	},

	// +----------------------------------------------------------------------
	//  公共方法
	//	func.initFunc({
	//		//监听页面刷新
	//		listenReload(){},
	//		//下拉刷新
	//		refresh(){},
	//		//上拉加载
	//		loadMore(){}
	//	})
	// +----------------------------------------------------------------------
	initFunc:{
		//监听页面刷新
		listenReload:function(listenReload){
			if(typeof listenReload === 'function'){
				func.listen_reload(listenReload);
				func.online(listenReload);
				// func.listen(listenReload);
			}
		},
		//下拉刷新
		refresh:function(refresh){
			if(typeof refresh === 'function') func.refresh(refresh);
		},
		//上拉加载
		loadMore:function(loadMore){
			if(typeof loadMore === 'function') func.loadMore(loadMore);
		}
	},
	// initFunc({
	// 	//监听页面刷新
	// 	listenReload:listenReload,
	// 	//下拉刷新
	// 	refresh:refresh,
	// 	//上拉加载
	// 	loadMore:loadMore
	// }){
	// 	if(typeof listenReload === 'function') func.listen_reload(listenReload); func.online(listenReload); func.listen(listenReload);
	// 	if(typeof refresh === 'function') func.refresh(refresh);
	// 	if(typeof loadMore === 'function') func.loadMore(loadMore);
	// },

	//窗口背景色
	bgColor:function(){
		return "#ffffff";
	},

	//沉浸式状态栏 header为节点
	header:function(header){
		var _header = header || 'header';
		if($api.dom(_header)){
			$api.fixStatusBar($api.dom(_header));
		}
	},
	//win和frm不分离的时候需要使用到
	setBodyPt:function(header){
		var _header = header || '#header';
		if($api.dom(_header)){
			//自动给body加paddingtop
			var pt = $api.offset($api.dom(_header)).h;
			$api.setStorage('pt', pt);
			document.querySelector('body').style.paddingTop = pt+'px';
		}
	},
	//底部tabBar和内容不分离的时候需要用到
	setBodyPb:function(footer){
		var _footer = footer || '#footer';
		if($api.dom(_footer)){
			var pb = $api.offset($api.dom(_footer)).h;
            document.querySelector('body').style.paddingBottom = pb+'px';
		}
	},

	//美洽客服
	meiqia:function()
	{
		if(!func.session()){
			func.openWin('login_quick','login/login_quick.html');
			return;
		}
		//创建美洽
		var mq = api.require('meiQia');
		//配置初始化美洽需要的appkey
		var param = {
			appkey: "261ef0514ac9a08c0119fbc672d796ab"
		};
		//初始化美洽
		mq.initMeiQia(param, function(ret, err) {
			if (ret) {
				//设置title以及按钮颜色
				var titleColor = {
					color: "#000"
				};
				mq.setTitleColor(titleColor);
				//设置用户信息
				var infoParam = {
					name: func.session().nickName,
					tel: func.session().custPhone,
					avatar: imgSrc+func.session().headImg
				};
				mq.setClientInfo(infoParam);
				mq.setLoginCustomizedId({id:func.session().custId});
				mq.show({showAvatar:true,enableSyncServerMessage:true});
			} else {
				//初始化失败
				console.log(JSON.stringify(err));
			}
		})
	},

	//状态栏 light dark
	navbar:function(style){
		// api.addEventListener({
		// 	name:'viewappear'
		// }, function(ret, err){
			//设置状态栏 为亮色 字为白色
			api.setStatusBarStyle({
		        style: style || 'light'
		    });
		// });
	},

	//监控网络
	online:function(fn){
		//网络监控 2g、3g、4g、wifi
		api.addEventListener({
		    name: 'online'
		}, function(ret, err) {
		    switch(ret.connectionType.toLowerCase()){
		   		case '2g':
			   		func.msg('当前使用的是2g网络');
					func.reload();
		   			if(typeof fn == 'function') { fn();}
			   		break;
			   	case '3g':
			   		func.msg('当前使用的是3g网络');
					func.reload();
			   		if(typeof fn == 'function') { fn();}
			   		break;
			   	case '4g':
			   		func.msg('当前使用的是4g网络');
					func.reload();
			   		if(typeof fn == 'function') { fn();}
			   		break;
			   	case 'wifi':
			   		func.msg('当前使用的是wifi网络');
					func.reload();
			   		if(typeof fn == 'function') { fn();}
			   		break;
			   	case 'none':
			   		func.msg('网络连接断开');
					func.offline_page();
			   		break;
			   	case 'unknown':
			   		func.msg('当前网络未知');
					func.offline_page();
			   		break;
			   	case 'ethernet':
			   		func.msg('当前使用的是以太网');
					func.reload();
			   		if(typeof fn == 'function') { fn();}
			   		break;
		    }
		});
	},

	//监控网络异常
	offline:function(fn){
		api.addEventListener({
		    name:'offline'
		}, function(ret, err){
		    func.offline_page();
		    if(typeof fn == 'function') { fn();}
		});
	},

	//网络异常跳转
	offline_page:function(){
	  	func.msg('网络连接断开');
		api.execScript({
        	name: 'root',
        	script: "offline_page()"
    	});
	},

	//有网状态操作
	netWoring:function(success,error)
	{
		var connectionType = api.connectionType.toLowerCase();
		switch(connectionType){
			case '2g':
			case '3g':
			case '4g':
			case 'wifi':
			case 'ethernet':
				if(typeof success == 'function') success(connectionType);
				break;
			case 'none':
			case 'unknown':
				if(typeof error == 'function') error(connectionType);
				break;
		}
	},

	//打印json数据
	pj:function(data){
		return JSON.stringify(data);
	},

	//打开win窗口 有动画
	openWin3:function(name,url,pageParam,reload,bounces,bgColor,animation){
		console.log('************************ win窗口 - '+name+' start ************************');
		console.log('widget://html/'+ url);
		console.log('************************ win窗口 - '+name+' end   ************************');
		api.openWin({
			name:name || '404_page_win',
			url: 'widget://html/'+ url  || 'otherpage/404_page_win.html',
			bounces: bounces || false,
			reload:reload || false,
			slidBackEnabled:false,
			pageParam:pageParam || {},
			bgColor: bgColor || func.bgColor(),
			animation:animation || {}
		});
	},

	//打开win窗口 有动画
	openWin:function(name,url,pageParam,reload,bounces,bgColor,animation){
		console.log('************************ win窗口 - '+name+' start ************************');
		console.log('widget://html/'+ url);
		console.log('************************ win窗口 - '+name+' end   ************************');
		api.openWin({
          name:name || '404_page_win',
          url: 'widget://html/'+ url  || 'otherpage/404_page_win.html',
          bounces: bounces || false,
          reload:reload || false,
          slidBackEnabled:true,
          pageParam:pageParam || {},
          bgColor: bgColor || func.bgColor(),
          animation:animation || {}
        });
	},

	openWin2:function(name,url,pageParam,reload,bounces,bgColor,animation){
		if(func.session()){
			console.log('************************ win窗口 - '+name+' start ************************');
			console.log('widget://html/'+ url);
			console.log('************************ win窗口 - '+name+' end   ************************');
			api.openWin({
				name:name || '404_page_win',
				url: 'widget://html/'+ url  || 'otherpage/404_page_win.html',
				bounces: bounces || false,
				reload:reload || false,
				slidBackEnabled:true,
				pageParam:pageParam || {},
				bgColor: bgColor || func.bgColor(),
				softInputBarEnabled:false,  //去除输入法工具条
				animation:animation || {}
	        });
		}else{
            api.confirm({
                msg: '您还未登录，快去登录吧！',
                buttons:[ '确定', '取消']
            },function(ret,err){
                if(ret.buttonIndex == 1){
                    func.openWin('login_quick','login/login_quick.html');
                }
            });
		}
	},

	//除头部的满屏
	// {
	//     x: 0,
	//     y: $api.offset($api.dom('#header')).h,
	//     w: "auto",
	//     h: "auto"
	// }
	//除头部和iphoneX底部的满屏ss
	// {
	// 	x: 0,
	// 	y: $api.offset($api.dom('#header')).h,
	// 	w: "auto",
	// 	h: api.winHeight-$api.offset($api.dom('#header')).h-api.safeArea.bottom
	// }

	//打开frame窗口 无动画
	openFrame:function(name,url,pageParam,reload,bounces,rect,allowEdit){
		console.log('************************ frame窗口 - '+name+' start ************************');
		console.log('widget://html/'+ url);
		console.log('************************ frame窗口 - '+name+' end   ************************');
		api.openFrame({
          name:name || '404_page_win',
          url: 'widget://html/'+ url  || 'otherpage/404_page_win.html',
          rect: rect || {
			x: 0,
			y: 0,
			w: "auto",
			h: "auto"
          },
          bounces:bounces===true ? true : false,
          reload:reload===true ? true : false,
          slidBackEnabled:true,
          pageParam:pageParam || {},
	      allowEdit:allowEdit===true ? true : false
      });
	},

	//下拉刷新
	refresh:function(fn){
		api.setRefreshHeaderInfo({
		    loadingImg: 'widget://image/home_navbar_55.png',
		    bgColor: '#f7f7f7',
		    textColor: '#ccc',
		    textDown: '下拉刷新...',
		    textUp: '松开刷新...'
		}, function(ret, err) {
		    //在这里从服务器加载数据，加载完成后调用api.refreshHeaderLoadDone()方法恢复组件到默认状态
		    if(typeof fn == 'function') { fn();}
		});
	},

	//结束下拉刷新
	refreshDone:function(){
		api.refreshHeaderLoadDone()
	},

	//上拉加载更多
	loadMore:function(fn){
		//监听滚动到底部
		api.addEventListener({
		    name:'scrolltobottom',
		    extra:{
		        threshold:0
		    }
		}, function(ret, err){
			if(typeof fn == 'function') { fn();}
		})
	},

	//main页面 nav tab 窗口组切换 index为索引
	changeGroupIndex:function(index,name,reload){
		var name    = name || '',
			reload  = reload === true ? true : false;  //默认false
		if(name){
			api.setFrameGroupIndex({
		        name: name,
		        index: index,
		        scroll: false,
		        reload:reload
	    	});
		}
	},

	//打开页面监听
	listen:function(fn,viewappear){
		var viewappear = viewappear || 'viewappear'; //默认显示页面就监听
		api.addEventListener({name:viewappear},function(ret, err){
			if(typeof fn == 'function') { fn();}
		});
	},

	//设置刷新
	reload:function(name,frameName){
		api.sendEvent({
		    name: 'reload',
		    extra:{value:true}
		});
	},

	//监测是否要刷新 执行函数
	listen_reload:function(fn){
		api.addEventListener({name:'reload'},function(ret, err){
			if(typeof fn == 'function') { fn();}
		});
	},

	//获取登陆信息
	session:function(){
		return $api.getStorage('userInfo') || '';
	},

	//判断是否需要登陆
	check_login:function(){
		//检测是否需要登陆
		var userInfo = func.session();
		if(userInfo){
			return true;
		}else{
			return false;
		}
	},

	//判断是否token过期或者账号被其他人登录
	checkTimeOut:function(r){
		if(r.code === 301 || r.code === 303 || r.message === 'token不能为空'){
			return true;
		}
		return false;
	},

	// 验证手机号
	checkphone: function(str) {
		if (str.match(/^(13[0-9]|14[5-9]|15[012356789]|166|17[0-8]|18[0-9]|19[8-9])[0-9]{8}$/)) {
			return true;
		} else {
			return false;
		}
	},

    // 验证url
    checkurl: function(str) {
        if (str.match(/^http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/)) {
            return true;
        } else {
            return false;
        }
    },

	//去除首尾空格
	trim : function(obj) {
		if(typeof obj === 'string'){
			return obj.replace(/^\s+|\s+$/gm,'');
		}else{
			return obj
		}
	},

	//验证密码 - 密码字数限制（6-16位英文，数字。可混组）
	checkPassword : function(s){
		var regu = /^[a-zA-Z0-9]{6,16}$/;
		var re = new RegExp(regu);
		if (re.test(s)) {
	       return true;
	    }else{
	       return false;
	    }
	},

	//验证密码 - 密码字数限制（6-16位字母数字组合）
	checkPassword2 : function(s){
		var regu = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,16}$/;
		var re = new RegExp(regu);
		if (re.test(s)) {
		   return true;
		}else{
		   return false;
		}
	},

	//直接页面输出
	echo:function(data){
		document.write(data);
	},

	//返回上一页
	back:function(page){
		var name = page || '';
		if(name){
			api.closeWin({
				name:name
			})
		}
	},

	//toast提示
	msg:function(msg){
		api.toast({
		    msg: msg,
		    duration: 2000,
		    location: 'bottom'
		});
	},

	//toast提示
	msg2:function(msg){
		api.toast({
		    msg: msg,
		    duration: 2000,
		    location: 'middle'
		});
	},

	//格式化手机号，中间省略
	formatPhone:function(phone){
		return phone.substr(0,3)+'****'+phone.substr(-4,4);
	},

	//按两次退出应用
	keyback:function(){
		//监听
	    api.addEventListener({
	        name : 'keyback'
	    }, function(ret, err) {
	      	func.msg('再点一次退出应用');
	      	//第二次点击退出
	        api.addEventListener({
	          name : 'keyback'
	        }, function(ret, err) {
	            api.closeWidget({
	              silent : true
	            });
	        });
	    });
	},

	//格式化日期
	formateDate : function(timestamp){
		var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
	    var Y = date.getFullYear() + '-';
	    var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
	    var D = date.getDate() < 10 ?  '0'+date.getDate()+ ' ' : date.getDate()+ ' ';
	    var h = date.getHours() < 10 ? '0'+date.getHours()+ ':' : date.getHours()+ ':';
	    var m = date.getMinutes() < 10 ? '0'+date.getMinutes()+ ':' : date.getMinutes()+ ':';
	    var s = date.getSeconds()< 10 ? '0'+date.getSeconds() : date.getSeconds();
	    return Y+M+D+h+m+s;
	},

	formateDate2 : function(time){
		var arr= time.split('');
		var year = arr[0]+arr[1]+arr[2]+arr[3];
		var mon = arr[4]+arr[5];
		var day = arr[6]+arr[7];
		var hour = arr[8]+arr[9];
		var minu = arr[10]+arr[11];
		var sec = arr[12]+arr[13];
		return year+"-"+mon+"-"+day+" "+hour+":"+minu+":"+sec
	},

	formateDate3 : function(time){
		var arr= time.split('');
		var year = arr[0]+arr[1]+arr[2]+arr[3];
		var mon = arr[4]+arr[5];
		var day = arr[6]+arr[7];
		return year+"-"+mon+"-"+day
	},

	//设置滚动li被点击后显示在正中间
	setTargetCenter:function(obj){
		//当前span如果要到中间，必须将当前span到屏幕左边的距离减去屏幕的一半
		var targetSpan = obj;
		var offsetLeft = func.getOffsetLeft(targetSpan);
		var offsetWidth = targetSpan.offsetWidth;
		var parentDiv = targetSpan.parentNode;
		parentDiv.scrollLeft = offsetWidth/2+offsetLeft-api.winWidth/2;
	},

	//获取容器距离屏幕左边距离
	getOffsetLeft:function(obj){
		var tmp = obj.offsetLeft;
		var val = obj.offsetParent;
		while(val != null){
			tmp += val.offsetLeft;
			val = val.offsetParent;
		}
		return tmp;
	},

	//获取容器距离屏幕顶部距离
	getOffsetTop : function(obj){
		var tmp = obj.offsetTop;
		var val = obj.offsetParent;
		while(val != null){
			tmp += val.offsetTop;
			val = val.offsetParent;
		}
		return tmp;
	},

	//打开地图
	openmap:function(lon,lat,addr){
		var systemType = api.systemType;
		var buttons = new Array();
		var amap_installed = false;
		var bmap_installed = false;
		//判断是否安装了高德和百度地图
		if(systemType=='ios'){
		  var installed = api.appInstalled({
			  sync: true,
			  appBundle:'iosamap://'
		  });
		  // if (installed) {
			//   amap_installed = true;
			//   buttons.push('高德地图');
		  // }
		  var installed = api.appInstalled({
			  sync: true,
			  appBundle:'baidumap://'
		  });
		  if (installed) {
			  bmap_installed = true;
			  buttons.push('百度地图');
		  }
		}else{
		  var installed = api.appInstalled({
			  sync: true,
			  appBundle: 'com.autonavi.minimap'
		  });
		  // if (installed) {
			//   amap_installed = true;
			//   buttons.push('高德地图');
		  // }
		  var installed = api.appInstalled({
			  sync: true,
			  appBundle: 'com.baidu.BaiduMap'
		  });
		  if (installed) {
			  bmap_installed = true;
			  buttons.push('百度地图');
		  }
		}
		if(bmap_installed==false && amap_installed==false){
		  api.toast({
			msg:'您没有安装百度地图软件，请下载安装'
		  });
		  return false;
		}
		var address = addr;
		var latbaidu = lat;
		var lngbaidu = lon;
		var latgaode = func.bd2gd(lon,lat).lat;
		var lnggaode = func.bd2gd(lon,lat).lng;
		api.actionSheet({
			cancelTitle: '取消',
			buttons: buttons
		}, function(ret, err) {
			var index = ret.buttonIndex;
			if(buttons[index-1]){   //这里要排除‘取消’按钮
				switch (index) {
					case 1:
						//t=0出行方式 0，1，2，3，4  dev是否开发模式
						if(amap_installed && bmap_installed){
							if(systemType=='ios'){
								api.openApp({
									iosUrl: 'iosamap://path?sourceApplication=applicationName&sid=BGVIS1&did=BGVIS2&dlat='+latgaode+'&dlon='+lnggaode+'&dname='+address+'&dev=0&t=0',
								}, function(ret, err) {
								});
							}else{
								api.openApp({
									androidPkg: 'android.intent.action.VIEW',
									uri: 'amapuri://route/plan/?dlat='+latgaode+'&dlon='+lnggaode+'&dname='+address+'&dev=0&t=0'
								}, function(ret, err) {
								});
							}
						}else{
							if(amap_installed){
								if(systemType=='ios'){
									api.openApp({
										iosUrl: 'iosamap://path?sourceApplication=applicationName&sid=BGVIS1&did=BGVIS2&dlat='+latgaode+'&dlon='+lnggaode+'&dname='+address+'&dev=0&t=0',
									}, function(ret, err) {
									});
								}else{
									api.openApp({
										androidPkg: 'android.intent.action.VIEW',
										uri: 'amapuri://route/plan/?dlat='+latgaode+'&dlon='+lnggaode+'&dname='+address+'&dev=0&t=0'
									}, function(ret, err) {
									});
								}
							}
							if(bmap_installed){
								if(systemType=='ios'){
									api.openApp({
										iosUrl: 'baidumap://map/direction?destination=latlng:'+latbaidu+','+lngbaidu+'|name:'+address+'&mode=riding',
									}, function(ret, err) {
										if (err) {
											//alert(JSON.stringify(err));
										}
									});
								}else{
									api.openApp({
										androidPkg: 'android.intent.action.VIEW',
										uri: 'baidumap://map/direction?destination=latlng:'+latbaidu+','+lngbaidu+'|name:'+address+'&mode=riding'
									}, function(ret, err) {

									});
								}
							}
							break;
						}
					case 2:
						if(systemType=='ios'){
							api.openApp({
								iosUrl: 'baidumap://map/direction?destination=latlng:'+latbaidu+','+lngbaidu+'|name:'+address+'&mode=riding',
							}, function(ret, err) {
								if (err) {
									//alert(JSON.stringify(err));
								}
							});
						}else{
							api.openApp({
								androidPkg: 'android.intent.action.VIEW',
								uri: 'baidumap://map/direction?destination=latlng:'+latbaidu+','+lngbaidu+'|name:'+address+'&mode=riding'
							}, function(ret, err) {
								if (err) {
									//alert(JSON.stringify(err));
								}
							});
						}
						break;
				}
			}
		});
	},

	//设置中文星期
	formateWeek:function(n){
		switch (n) {
			case 0:
				return '周日';
				break;
			case 1:
				return '周一';
				break;
			case 2:
				return '周二';
				break;
			case 3:
				return '周三';
				break;
			case 4:
				return '周四';
				break;
			case 5:
				return '周五';
				break;
			case 6:
				return '周六';
				break;
			default:break;
		}
	},

	//有效期  startDate  开始日期  howLong 有效天数
	calcYXQ:function(startDate,howLong){
		var startTimestamp = new Date(func.timeDiff(startDate)).getTime();
		var endTimestamp = startTimestamp+(howLong*24*60*60*1000);
		return new Date(endTimestamp).format("yyyy.MM.dd")
	},

    //格式化数字
    formateNum:function(value){
        if(value >= 0 && value < 10000){
            //未满足
            return value;
        }else if(isNaN(value)){
			return 0;
		}else{
            return (value/10000).toFixed(1) + 'W';
        }
    },

	//限制字数
	limitTxtLen:function(txt,len,showDot){
		if(!txt) return;
		//判断是否emoj表情
		if(func.isEmojiCharacter(txt)){
			return txt;
		}
		//让字母和汉字统一长度
		for (var i = 0; i < txt.length; i++){
            var son_char = txt.charAt(i);
            if(encodeURI(son_char).length < 3){  //英文encodeURI一般长度1~3，汉字encodeURI一般长度是 9
				len += 1;  //英文占一位字符，中文占两位字符，所以英文要加一
			}
        }
		if(txt.length>len){
			if(showDot){
				txt = txt.substr(0,len)+'...';
			}else{
				txt = txt.substr(0,len);
			}
		}
		return txt;
	},

	//判断是否emoji表情
	isEmojiCharacter:function(substring) {
	    for ( var i = 0; i < substring.length; i++) {
	        var hs = substring.charCodeAt(i);
	        if (0xd800 <= hs && hs <= 0xdbff) {
	            if (substring.length > 1) {
	                var ls = substring.charCodeAt(i + 1);
	                var uc = ((hs - 0xd800) * 0x400) + (ls - 0xdc00) + 0x10000;
	                if (0x1d000 <= uc && uc <= 0x1f77f) {
	                    return true;
	                }
	            }
	        } else if (substring.length > 1) {
	            var ls = substring.charCodeAt(i + 1);
	            if (ls == 0x20e3) {
	                return true;
	            }
	        } else {
	            if (0x2100 <= hs && hs <= 0x27ff) {
	                return true;
	            } else if (0x2B05 <= hs && hs <= 0x2b07) {
	                return true;
	            } else if (0x2934 <= hs && hs <= 0x2935) {
	                return true;
	            } else if (0x3297 <= hs && hs <= 0x3299) {
	                return true;
	            } else if (hs == 0xa9 || hs == 0xae || hs == 0x303d || hs == 0x3030
	                    || hs == 0x2b55 || hs == 0x2b1c || hs == 0x2b1b
	                    || hs == 0x2b50) {
	                return true;
	            }
	        }
	    }
	},

	//显示数字超过99个显示99+
	limitNum:function(n){
		if(n>99){
			return '99+';
		}else{
			return n;
		}
	},

	//zero
	addZero : function(n){
		var ret=null;
		ret = n>9 ? (''+n) : ('0'+n);
		return ret;
	},

	//将时间转换成IOS和安卓都能识别
	timeDiff : function(str){
		if(str){
			return str.replace(/\-/g, "/");
		}
	},

	//去除字符串的html
	delHtmlTag : function(str){
	    return str.replace(/<[^>]+>/g,"");
	},

	//去除 &nbsp 空格符号
	delNbsp : function(str){
		return str.replace(/&nbsp;/ig, "");;
	},

	time2desc:function(passDate){
		passDate = func.timeDiff(passDate);
		var passTime = Date.parse(passDate);
		if(isNaN(passTime)){
			return '';
		}
		var newTime = new Date().getTime();
		var shicha = newTime-passTime;
		//计算出相差天数
	    var days=Math.floor(shicha/(24*3600*1000));
	    //计算出小时数
	    var leave1=shicha%(24*3600*1000);    //计算天数后剩余的毫秒数
	    var hours=Math.floor(leave1/(3600*1000));
	    //计算相差分钟数
	    var leave2=leave1%(3600*1000);        //计算小时数后剩余的毫秒数
	    var minutes=Math.floor(leave2/(60*1000));
	    //计算相差秒数
	    var leave3=leave2%(60*1000);      //计算分钟数后剩余的毫秒数
	    var seconds=Math.round(leave3/1000);
	    //判断返回
	    var d = new Date(passDate);
	    // if(days>=366){
	    // 	return d.getFullYear()+'年'+func.addZero(d.getMonth()+1)+'月'+func.addZero(d.getDate())+'日';
	    // }else if(days>1 && days<366){
	    // 	return func.addZero(d.getMonth()+1)+'月'+func.addZero(d.getDate())+'日';
	    // }else if(days === 1){
	    // 	return '昨天'+;
	    // }else if(hours>=1 && hours<24){
	    // 	return hours+'小时前';
	    // }else if(hours<1 && minutes>=1){
	    // 	return minutes+'分钟前';
	    // }else{
	    // 	return '刚刚';
	    // }
		// return passDate;
		if(days>=366){
			return d.getFullYear()+'-'+func.addZero(d.getMonth()+1)+'-'+func.addZero(d.getDate());
		}else if(days>1 && days<366){
			return func.addZero(d.getMonth()+1)+'-'+func.addZero(d.getDate());
		}else if(days === 1){
			return '昨天 '+func.addZero(d.getHours())+':'+func.addZero(d.getMinutes());
		}else{
			return func.addZero(d.getHours())+':'+func.addZero(d.getMinutes());
		}
	},

	getCustTypeName:function(custType){
		switch (custType) {
			case 1:
				return '普通会员';
				break;
			case 7:
				return '车主';
				break;
			case 9:
				return '代理商';
				break;
			default:
				return '普通会员';
				break;
		}
	},

	rem2px:function(n){
		return n*(document.documentElement.getBoundingClientRect().width * 100 / 720);
	},

	// +----------------------------------------------------------------------
	// | 文件读写 - 缓存文件 - 主要用于存储ajax获取的json数据 - 便于无网查看
	// +----------------------------------------------------------------------
			//读文件
			readFile : function readFile(fileName, callBack) {
			    api.readFile({
			        path : 'cache://cachejson/' + fileName + '.json',
			    }, function(ret, err) {
			        callBack(ret, err);
			    });
			},
			//写文件
			writeFile : function (json , fileName,fn)
			{
			    api.writeFile({
		            //保存路径
					path : 'cache://cachejson/' + fileName + '.json',
		            //保存数据，记得转换格式
		            data : JSON.stringify(json)
			    }, function(ret, err) {
					if (ret.status) {
						if(typeof fn === 'function'){
							fn(json);
						}
						//console.log("文件写入【成功】 - 文件名称："+ fileName + '.json')
					} else {
						//console.log('文件写入【错误】 - 错误信息：'+err.smg+"；错误代码："+err.code+"；文件名称："+ fileName + '.json')
					}
			    })
			},
			//判断文件是否存在 - 异步
			isHasFile : function (filePath,success,error){
                var fs = api.require('fs');
                fs.exist({
                    path: filePath
                }, function(ret, err) {
                    if (ret.exist) {
                        if(typeof success == 'function') success(ret, err);
                    } else {
                        if(typeof error == 'function') error(ret, err);
                    }
                });
			},
			//判断文件是否存在 - 同步
			isHasFileSync : function (filePath){
                var fs = api.require('fs');
                var ret = fs.existSync({
                    path: filePath
                });
                if (ret.exist) {
                    return true;
                } else {
                    return false;
                    console.log(JSON.stringify(err));
                }
			},
			//获取api地址 最后一个 单词 为了给对应接口存储的json文件命名
			getName:function(url){
				var _name = url.split('/');
				_name = _name[_name.length-1];
				return _name;
			},

	// +----------------------------------------------------------------------
	// | 下载多媒体文件 - 缓存图片
	// | 页面调用缓存图片方法：getCachePic(url)
	// +----------------------------------------------------------------------
			//获取本地缓存图片
			getCachePic : function(url)
			{
				//判断图片文件名是否获取成功
				if(func.getFileName(url))
				{
					var imgFile = api.cacheDir + "/cachepic/"+func.getPicName(url);
					if(func.isHasFileSync("fs://" + imgFile)){
						  if(api.systemType === 'ios'){
								return api.fsDir+imgFile;
							}else {
								return api.fsDir+imgFile;
							}
					}else{
						return url;
					}
				}else{
					return url;
				}
			},

			//下载图片
			downPic : function(url,currentFn,successFn,errorFn){
				//判断是否是图片资源
				if(func.isImg(url)){
					 //判断图片文件名是否获取成功 并且本地不存在本文件
					 if(func.getPicName(url))
					 {
						api.download({
							url : imgSrc+url,
							savePath :"fs://" + api.cacheDir + "/cachepic/" + func.getFileName(url),
							report : true,
							cache : true,
							allowResume : true
						}, function(ret, err) {
							//下载中
							if(typeof currentFn === 'function') currentFn(ret);
							// console.log('【下载中】- 图片名称：' + url +'；图片大小：' + ret.fileSize + '；下载进度：' + ret.percent + '；下载状态' + ret.state);
							//下载成功
							if (ret.state == 1) {
								if(typeof successFn === 'function') successFn(ret);
								//console.log('【下载成功】- 图片名称：' + url +'；图片大小：' + ret.fileSize + '；下载进度：' + ret.percent + '；下载状态' + ret.state + '；存储路径: ' + ret.savePath);
								//下载失败
							} else {
								if(typeof errorFn === 'function') errorFn(err);
							}
						});
					 }else{
						 //console.log("【图片文件名获取失败】："+url);
					 }
			  }
			},
			//判断是否图片资源
			isImg : function (src){
			    if(!/.(gif|jpg|jpeg|png|tiff|bmp|pcx)$/.test(src)){
			        return false;
			    }else{
			        return true;
			    }
			},
			//获取图片名称
			getPicName : function(url){
				if(url){
		            if(url.indexOf("?")>0){
		                var _name = url.split('?');
		                _name = _name[0];
		                _name = _name.split('/');
		                _name = _name[_name.length-1];
		                return _name;
		            }else{
		                if(url.indexOf("/")>0){
		                    return url.substring(url.lastIndexOf("/")+1,url.length);
		                }else{
		                    return false;
		                }
		            }
		        }
			},
			//遍历解析Json - 进行数据操作 - 主要为了提取 多媒体链接信息 - 下载多媒体
			parseJsonDwonPic : function (jsonObj) {
				// 循环所有键
				for(var key in jsonObj) {
					//如果对象类型为object类型且数组长度大于0 或者 是对象 ，继续递归解析
					var element = jsonObj[key];
					if(element.length > 0 && typeof(element) == "object" || typeof(element) == "object") {
						func.parseJsonDwonPic(element);
					} else { //不是对象或数组、直接输出
						// console.log(key + ":" + element);
						func.downPic(element);
					}
				}
			},

    // +----------------------------------------------------------------------
    // | 下载多媒体文件 - 缓存文件
    // | 页面调用缓存图片方法：getCacheFile(url)
    // +----------------------------------------------------------------------
		//获取本地缓存文件
		getCacheFile : function(url){
			//判断图片文件名是否获取成功
			if(func.getFileName(url))
			{
					var fileFile = api.cacheDir + "/cachefile/"+func.getPicName(url);
					if(func.isHasFileSync("fs://" + fileFile)){
							if(api.systemType === 'ios'){
								return api.fsDir+fileFile;
							}else {
								return fileFile;
							}
					}else{
							return url;
					}
			}else{
					return url;
			}
		},

		//下载文件
		downFile : function(url,currentFn,successFn,errorFn){
			//判断是否是文件资源
			if(func.isFile(url)){
				//判断图片文件名是否获取成功 并且本地不存在本文件
				if(func.getFileName(url))
				{
					api.download({
						url : imgSrc+url,
						savePath :"fs://" + api.cacheDir + "/cachefile/" + func.getFileName(url),
						report : true,
						cache : true,
						allowResume : true
					}, function(ret, err) {
						//下载中
						if(typeof currentFn === 'function') currentFn(ret);
						//console.log('【下载中】- 文件名称：' + url +'；文件大小：' + ret.fileSize + '；下载进度：' + ret.percent + '；下载状态' + ret.state);
						//下载成功
						if (ret.state == 1) {
							if(typeof successFn === 'function') successFn(ret);
							//console.log('【下载成功】- 文件名称：' + url +'；文件大小：' + ret.fileSize + '；下载进度：' + ret.percent + '；下载状态' + ret.state + '；存储路径: ' + ret.savePath);
							//下载失败
						} else {
							if(typeof errorFn === 'function') errorFn(err);
						}
					});
				}else{
                    //console.log("【文件名获取失败】："+url);
				}
			}
		},
		//判断是否图片资源
		isFile : function (src){
			if(!/.(mp3|mp4|wma|flac|aac|mmf|amr|m4a|m4r|ogg|mp2|wav|wv)$/.test(src)){
				return false;
			}else{
				return true;
			}
		},
		//获取图片名称
    	getFileName : function(url){
    		if(url){
	            if(url.indexOf("?")>0){
	                var _name = url.split('?');
	                _name = _name[0];
	                _name = _name.split('/');
	                _name = _name[_name.length-1];
	                return _name;
	            }else{
	                if(url.indexOf("/")>0){
	                    return url.substring(url.lastIndexOf("/")+1,url.length);
	                }else{
	                    return false;
	                }
	            }
            }
		},
		//遍历解析Json - 进行数据操作 - 主要为了提取 多媒体链接信息 - 下载多媒体
		parseJsonDwonFile : function (jsonObj) {
          // 循环所有键
          for (var key in jsonObj) {
              //如果对象类型为object类型且数组长度大于0 或者 是对象 ，继续递归解析
              var element = jsonObj[key];
              if (element.length > 0 && typeof(element) == "object" || typeof(element) == "object") {
                  func.parseJsonDwonFile(element);
              } else { //不是对象或数组、直接输出
                  // console.log(key + ":" + element);
                  func.downPic(element);
                  func.downFile(element);
              }
          }
        },
	/**
	 * @Auther 洪学枝
	 * 判断是否过期，过去跳到登录界面
	 * @param r array 接收的数据
	 * @return
	 */
	checkOverdue:function(r){
		//判断是否过期
		var check = func.checkTimeOut(r);
		if(check){
			// $api.rmStorage('noOpen');
			$api.rmStorage('userInfo');
			api.closeWin({
				name:'main'
			})
			setTimeout(function() {
				func.openWin3('main','main.html',{},true);
			}, 1000)
		}
	},

	//退出登录
	loginOut:function(){
		func.showProgress();
		func.api(router.doLoginOut,{
			token : func.session().token
		},function(r){
			if(!r.statusCode){
				func.msg(r.message);
			}else{
				$api.rmStorage('userInfo');
				//删除美恰本地聊天记录
				if(api.systemType === 'android'){
					var mq = api.require("meiQia");
					mq.deleteAllMessage(function(ret){
						if(ret.status){
							console.log('删除美恰聊天记录成功');
						}else{
							console.log(JSON.stringify(err));
						}
					});
				}
				//注销融云登陆
				var rong = api.require('UIRongCloud');
				func.rongLoginOut(rong);
				api.closeToWin({
					name: 'main'
				});
				api.execScript({
					name:'main',
					script: "window.rootVue.onChangeTab(0)"
				})
				api.sendEvent({
				    name: 'setUnReadCount'
				});

				func.msg("退出成功");
				func.hideProgress();
			}
		})
	},
	//显示加载动画
	showProgress:function(){
		api.showProgress({
		    title: '加载中...',
		    text: '请稍后...',
		    modal: true
		});
	},

	//关闭加载动画
	hideProgress:function(){
		api.hideProgress();
	},

	/**
	 * 使用 router.js 中的接口
	 * @param router_name ：接口地址
	 * @param data ：接口参数（JSON格式），此参数不传递时默认为空（{}）
	 * @param fn ：回调函数，返回JSON对象或者异常信息，接口请求异常时返回null，接口请求不通时返回error，外部调用需判断是否为null或者error
	 * 执行 ajax 方法
	 */
	api:function(router_name,data,fn,fn2,type,loads)
	{
		//判断是否有网
		func.netWoring(function(connectionType)
		{
			//调用ajax
			func.ajax(router[router_name],data,function(r){
				if(typeof fn == 'function') {fn(r);}
			},function(r){
				if(typeof fn2 == 'function') {fn2(r);}
			},type || 'post',loads)

		},function(){
			func.msg('网络链接断开');
			func.hideProgress();
			func.refreshDone();
		})
	},

	//去除数组
	remove : function(val,list) {
		var index = list.indexOf(val); 
		if (index > -1) { 
			list.splice(index, 1); 
		}
		return list;
	},

	/**
	 * ajax提交封装
	 * @param url ：接口地址
	 * @param router_name ：功能描述，便于提示信息容易理解，如：首页公告获取、商品信息获取等等
	 * @param data ：接口参数（JSON格式），此参数不传递时默认为空（{}）
	 * @param fn ：回调函数，返回JSON对象或者异常信息，接口请求异常时返回null，接口请求不通时返回error，外部调用需判断是否为null或者error
	 * @param uploapic ： 默认值 false    布尔值  如果是true上传图片  false普通数据上传
	 * @param type ：异步请求方法类型 默认post
	 */
	ajax:function(router_name,data,fn,fn2,type,loads,loading,uploapic)
	{
		//如果session不存在 则 重新获取
		if(!$api.getStorage('sessionId') || !$api.getStorage('userInfo')){
			//重新获取
			func.connect(function(){
				func.ajax(router_name,data,fn,fn2,uploapic,type,loads,loading);
			})
			return false;
		}

		//定义默认值
		var type     = type || 'post',//默认post
			data     = data || {},    //接口参数不传递时默认为空
			uploapic = uploapic === true   ? true  : false,  //默认false  true上传图片  false普通数据
			loads    = loads    === false  ? false : true,   //默认true
			loading  = loading  === false  ? false : true;   //默认true
		
		//加载动画
		if(loading != false){
			func.hideProgress();
			func.showProgress({
				title: '努力加载中...'
			});
		}

		//参数
		var _headers = {'Content-Type':'application/json;charset=utf-8'}, ajaxData = {};

		// 请求参数
		var baseData = {
			"jsonrpc": host.jsonrpc,
			"id": "id_1",
			"method": router_name.method,
			"params": {
				"data": {
					"version": host.version,
					"sessionId": $api.getStorage('sessionId'),
					"userInfo": {
						"userId": func.session().userId,
						"userName": func.session().userName,
						"userDeptNo": func.session().userDeptNo,
						"sn": func.session().sn,
						"sfzh": func.session().sfzh,
						"extAttr": {
							"baseService":  router_name.baseService,
							"className":  router_name.className,
							"condition": data.condition || '',
							"orderBy":data.orderBy || '',
          					"fields":data.fields || '',
							"data":JSON.stringify(data.data),
							"qxdm":data.qxdm,
							"ip":api.deviceId
						}
					},
					"source": {
						"sourceId": "",
						"strategy": ""
					},
					"dataObjId": "",
					"page": {
						"pageSize": data.pageSize,
						"pageNo": data.pageNo
					}
				},
				"sign": ""
			}
		}

		//判断参数进行组合
		if(router_name.query && router_name.query != ''){
			baseData.params.data.userInfo.extAttr.query = router_name.query;
			baseData.params.data.dataObjId = 'queryresource'; //operateresource 、authentication 、operateresource'
		}else if(router_name.operate && router_name.operate != ''){
			baseData.params.data.userInfo.extAttr.operate = router_name.operate;
			baseData.params.data.dataObjId = 'operateresource'; //operateresource 、authentication 、operateresource'
			baseData.params.data.operations = [
				{
					"operationType": 1,
					"operationId": "578",
					"sourceId": "",
					"dataObjId": "operateresource",
					"condition": "",
					"data": [
						{
							"fieldValues": [
								{
									"field": "result",
									"value": "result"
								}
							]
						}
					]
				}
			]
		}

		// 判断是否是上传
		if(!uploapic)
		{
			//ajax参数
			ajaxData = {
				url:host.url,
				method: type,
				timeout:60,
				data: { body : baseData},
				headers:_headers
			};
		}else{
			ajaxData = {
				url: host.url,
				method: type,
				timeout:60,
				data: {files : baseData}
			};
		}

		//发起ajax
		api.ajax(ajaxData,function(ret,err)
		{
			if(loading != false){ func.hideProgress(); }
			
			console.log('************************ 请求开始 start ************************');
			console.log('接口描述：' + router_name.description);
			console.log('请求URL：' + host.url);
			console.log('请求参数：' + JSON.stringify(baseData));
			console.log('你的参数：' + JSON.stringify(data));

			//请求服务器成功
			if (ret) { 
				console.log('实际接口返回：' + JSON.stringify(ret));
				if(ret.result.code == 1){ // 1:成功
					
					//判断是操作 还是 查询 
					if(router_name.query && router_name.query != ''){ //查询

						//格式化数据
						var fieldValues = JSON.parse(ret.result.data[0].fieldValues[0].value);
						
						//组装数据
						var newData = {
							code:ret.result.code,
							msg:ret.result.msg,
							page:ret.result.page,
							data:fieldValues
						}
						console.log('组装接口返回：' + JSON.stringify(newData));

						//正常回调
						if(typeof fn == 'function') {fn(newData);}
						
					}else if(router_name.operate && router_name.operate != ''){ //操作

						//格式化数据
						var fieldValues = JSON.parse(ret.result.data[0].operationMsg);
						
						//组装数据
						var newData = {
							code:ret.result.code,
							msg:ret.result.msg,
							data:fieldValues
						}
						console.log('组装接口返回：' + JSON.stringify(newData));

						//正常回调
						if(typeof fn == 'function') {fn(newData);}

					}else{
						func.msg('路由参数错误！')
					}

				}else if(ret.result.code == 2){ //2：请求失败
					if(ret.result.msg === '无效会话'){
						//重新获取
						func.connect(function(){
							func.ajax(router_name,data,fn,fn2,uploapic,type,loads,loading);
						})
					}else{
						func.msg(ret.result.msg)
					}
				}else if(ret.result.code == 3){ //3：无效会话
					//重新获取
					func.connect(function(){
						func.ajax(router_name,data,fn,fn2,uploapic,type,loads,loading);
					})
				}
			} else { //请求服务器失败
				//错误回调
				if(typeof fn2 == 'function') {fn2(ret);}
			}

			//隐藏加载进度条
			func.hideProgress();
			api.hideProgress();

			//判断是否错误
			if(err){
				if(loads == true) console.log('错误信息：' + JSON.stringify(err));
			}
			
			if(loads == true) console.log('************************ 请求结束 end ************************');
		});
	},

	// 建立链接
	connect:function(fn)
	{
		//参数
		var data = {
			"jsonrpc": host.jsonrpc,
			"id": "id_1",
			"method": "connect",
			"params": {
			  "data": {
				"version": host.version,
				"appId": host.appid,
				"timestamp": "20180611142246134",
				"nonce": "vMksKOwd"
			  },
			  "sign": ""
			}
		};

		//判断会话是否失效
		api.ajax({
			url: host.url,
			method: 'post',
			timeout:60,
			headers:{'Content-Type':'application/json;charset=utf-8'},
			data: { 
				body : data
			}
		},function(ret,err)
		{
			console.log('************************ 请求开始 start ************************');
			console.log('接口描述：建立链接会话');
			console.log('请求URL：' + host.url);
			console.log('请求参数：' + JSON.stringify(data));
			if (ret) {//请求服务器成功
				console.log('接口返回：' + JSON.stringify(ret));
				if(ret.result.code == 1){ // 1:成功   2：失败   3：无效会话
					//存储会话id
					$api.setStorage('sessionId',ret.result.data.sessionId)
					//票据认证
					func.authentication(function(res){
						//正常回调
						if(typeof fn == 'function') {fn(res,ret.result.data);}
					})
				}else if(ret.result.code == 3){
					func.msg('无效会话');
				}else{
					func.msg('请求失败');
				}
			} else { //请求服务器失败
				func.msg('服务器请求错误');
			}
			console.log('************************ 请求结束 end ************************');
		})
	},

	// 票据认证
	authentication:function(fn)
	{
		//首先调用统一认证
		func.tyAuth(function(str){

			//请求参数
			var data = {
				"jsonrpc": host.jsonrpc,
				"id": "id_1",
				"method": router.commonsService.method,
				"params": {
					"data": {
						"version": host.version,
						"sessionId": $api.getStorage('sessionId'),
						"userInfo": {
							"userId": "u_id",
							"userName": "u_name",
							"userDeptNo": "41245712",
							"sn": "sn_1",
							"sfzh": "1111111111111111",
							"extAttr": {
								"baseService": router.commonsService.baseService,
								"className": router.commonsService.className,
								"query":router.commonsService.query,
								"data":JSON.stringify({
									"strBill":str
								})
							}
						},
						"source": {
							"sourceId": "",
							"strategy": ""
						},
						"dataObjId": isDev ? 'queryresource' : 'authentication'
					},
					"sign": ""
				}
			};

			//判断会话是否失效
			api.ajax({
				url: host.url,
				method: 'post',
				timeout:60,
				headers:{'Content-Type':'application/json;charset=utf-8'},
				data: { 
					body : data
				}
			},function(ret,err)
			{
				console.log('************************ 请求开始 start ************************');
				console.log('接口描述：票据认证');
				console.log('请求URL：' + host.url);
				console.log('请求参数：' + JSON.stringify(data));
				if (ret) {//请求服务器成功
					console.log('接口返回：' + JSON.stringify(ret));
					if(ret.result.code == 1){ // 1:成功   2：失败   3：无效会话
						//获取相关参数
						var fieldValues = JSON.parse(ret.result.data[0].fieldValues[0].value);
							fieldValues = JSON.parse(fieldValues[0].obj.result.data[0].fieldValues[0].value)[0];
						//存储会话id
						$api.setStorage('userInfo',{
							"userId" : fieldValues.obj.id,
							"userName" : fieldValues.obj.name,
							"userDeptNo" : fieldValues.obj.depcode,
							"sn" : fieldValues.obj.depid,
							"sfzh" : fieldValues.obj.identifier
						})
						//正常回调
						if(typeof fn == 'function') {fn(ret.result.data);}
					}else if(ret.result.code == 3){
						func.msg('无效会话');
					}else{
						func.msg('请求失败');
					}
				} else { //请求服务器失败
					func.msg('服务器请求错误');
				}
				console.log('************************ 请求结束 end ************************');
			})
		})
	},

	//统一认证
	tyAuth:function(fn,fn2){
		var str = "sksdasfaf";
		//正常回调
		if(typeof fn == 'function') {fn(str);}
	},

	
	/*上传图片*/
	uploadImg:function(fun_name,fn){
		func.uploadPic('url',function(ret){
			func.api(fun_name,ret.data,function(res){
				 //正常回调
				 if(typeof fn == 'function') {fn(res);}
				func.hideProgress();
			},'',true)
		})
	},

	/*上传图片*/
	uploadBase64Img2:function(fn){
		func.uploadPic('base64',function(ret){
			var data = {};
			data.img64 = ret.base64Data;
			data.token = func.session().token;
			api.showProgress({
			    title: '上传中',
			    modal: true
			});
			setTimeout(function(){
				func.api(router.upImg,data,function(r){
					if(!r.statusCode){
						func.msg(r.message);
					}else{
						func.msg('上传成功！');
						if(typeof fn == 'function') {fn(r.type);}
					}
					api.hideProgress();
				})
			},500)
		})
	},

	uploadBase64Img:function(fun_name,data,fn){
		func.uploadPic('base64',function(ret){
			for(var vo in data){
				if(data[vo] === 'imgBase64Data'){
					data[vo] = ret.base64Data;
				}
			}
			if(data.img64 != ''){
				func.api(fun_name,data,function(res){
					//正常回调
					if(typeof fn == 'function') {fn(res);}
					func.hideProgress();
				})
			}
		})
	},

	/*上传图片*/
	// uploadImg:function(fun_name,fn){
	// 	func.uploadPic('url',function(ret){
	// 		func.api(fun_name,ret.data,function(res){
	// 			 //正常回调
	// 			 if(typeof fn == 'function') {fn(res);}
	// 			func.hideProgress();
	// 		},'',true)
	// 	})
	// },

	/*上传图片*/
	// uploadBase64Img2:function(fn){
	// 	func.uploadPic('base64',function(ret){
	// 		var data = {};
	// 		data.img64 = ret.base64Data;
	// 		data.token = func.session().token;
	// 		api.showProgress({
	// 		    title: '上传中',
	// 		    modal: true
	// 		});
	// 		setTimeout(function(){
	// 			func.api(router.upImg,data,function(r){
	// 				if(!r.statusCode){
	// 					func.msg(r.message);
	// 				}else{
	// 					func.msg('上传成功！');
	// 					if(typeof fn == 'function') {fn(r.type);}
	// 				}
	// 				api.hideProgress();
	// 			})
	// 		},500)
	// 	})
	// },

	// uploadBase64Img:function(fun_name,data,fn){
	// 	func.uploadPic('base64',function(ret){
	// 		for(var vo in data){
	// 			if(data[vo] === 'imgBase64Data'){
	// 				data[vo] = ret.base64Data;
	// 			}
	// 		}
	// 		if(data.img64 != ''){
	// 			func.api(fun_name,data,function(res){
	// 				//正常回调
	// 				if(typeof fn == 'function') {fn(res);}
	// 				func.hideProgress();
	// 			})
	// 		}
	// 	})
	// },

	/**
	 * 获取图片
	 * @param sourceType ：类型  camera  library
	 * @param fn ：回调函数
	 */
	getPicture:function(sourceType,destinationType,fn){
			var sourceType = sourceType || 'library',  //默认相册
				allowEdit  = false;
			if(api.systemType == 'ios'){
				allowEdit = true;
			}
			api.getPicture({
				sourceType: sourceType,
				encodingType: 'jpg',
				mediaValue: 'pic',
				destinationType: destinationType,
				allowEdit:false,
				quality: 100
			}, function(ret, err) {
				if (ret) {
					//正常回调
					if (ret.data != '')
					if(typeof fn == 'function') {fn(ret);}
				} else {
					console.log(JSON.stringify(err));
				}
			});
	},

	/**
	 * 图片上传接口
	 * @param url ：接口地址
	 * @param description ：功能描述，便于提示信息容易理解，如：首页公告获取、商品信息获取等等
	 * @param data ：接口参数（JSON格式），此参数不传递时默认为空（{}）
	 * @param fn ：回调函数，返回JSON对象或者异常信息，接口请求异常时返回null，接口请求不通时返回error，外部调用需判断是否为null或者error
	 * @param type ：异步请求方法类型 默认post
	 */
	uploadPic:function(destinationType,fn){
		//弹出图片上传
		api.actionSheet({
			 cancelTitle: '取消',
			 buttons: ['拍照','从手机相册选择']
		 }, function(ret, err) {
			 if (ret) {
				 //获取类型
				 var buttonIndex = ret.buttonIndex;
				 //判断
				 if(buttonIndex==1){ //拍照
					//获取图片
					func.getPicture('camera',destinationType,function(ret){
						if(typeof fn == 'function') {fn(ret);}
					});
				 }else if(buttonIndex==2){ //从相机中选择
					 //获取图片
					 func.getPicture('library',destinationType,function(ret){
						if(typeof fn == 'function') {fn(ret);}
					 });
				 }
			 }
		 });
	},

	//百度坐标转高德（传入经度、纬度）
	bd2gd:function(bd_lng, bd_lat) {
	    var X_PI = Math.PI * 3000.0 / 180.0;
	    var x = bd_lng - 0.0065;
	    var y = bd_lat - 0.006;
	    var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * X_PI);
	    var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * X_PI);
	    var gg_lng = z * Math.cos(theta);
	    var gg_lat = z * Math.sin(theta);
	    return {lng: gg_lng, lat: gg_lat};
	},
	//高德坐标转百度（传入经度、纬度）
	gd2bd:function(gg_lng, gg_lat) {
	    var X_PI = Math.PI * 3000.0 / 180.0;
	    var x = gg_lng, y = gg_lat;
	    var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * X_PI);
	    var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * X_PI);
	    var bd_lng = z * Math.cos(theta) + 0.0065;
	    var bd_lat = z * Math.sin(theta) + 0.006;
	    return {bd_lat: bd_lat, bd_lng: bd_lng};
	},

}

/**
 * 非常用函数方法
 * Auther:枫lt
 * QQ：957987132
 * COMPANY:合肥多元速网络科技有限公司 <www.doysu.net>
 * E-MAIL：<957987132@qq.com> <tangfei@doysu.net>
 */

//任意移动元素
function moveAnyway(id) {
	// 获取节点
	var block = document.getElementById(id)
	if (block) {
		var oW, oH
		// 绑定touchstart事件
		block.addEventListener('touchstart', function (e) {
			var touches = e.touches[0]
			oW = touches.clientX - block.offsetLeft
			oH = touches.clientY - block.offsetTop
			// 阻止页面的滑动默认事件
			document.addEventListener('touchmove', defaultEvent, { passive: false })
		}, false)

		block.addEventListener('touchmove', function (e) {
			var touches = e.touches[0]
			var oLeft = touches.clientX - oW
			var oTop = touches.clientY - oH
			if (oLeft < 10) {
				oLeft = 10
				if (oTop <= 10) {
					oTop = 10
				} else if (oTop >= document.documentElement.clientHeight - block.offsetHeight - 10) {
					oTop = document.documentElement.clientHeight - block.offsetHeight - 10
				}
			} else if (oLeft > document.documentElement.clientWidth - block.offsetWidth - 10) {
				oLeft = (document.documentElement.clientWidth - block.offsetWidth - 10)
				if (oTop <= 10) {
					oTop = 10
				} else if (oTop >= document.documentElement.clientHeight - block.offsetHeight - 10) {
					oTop = document.documentElement.clientHeight - block.offsetHeight - 10
				}
			} else if (oTop < 10) {
				oTop = 10
			} else if (oTop > document.documentElement.clientHeight - block.offsetHeight - 10) {
				oTop = document.documentElement.clientHeight - block.offsetHeight - 10
			}
			block.style.left = oLeft + 'px'
			block.style.top = oTop + 'px'
		}, false)

		block.addEventListener('touchend', function () {
			document.removeEventListener('touchmove', defaultEvent, { passive: false })

		}, false)
	}

	function defaultEvent (e) {
		e.preventDefault();
		e.cancelBubble = true;
		e.stopPropagation();
	}
}

//比较日期大小
function compareTime(beginTime){
  if(beginTime == undefined){
  	  return false;
  }else{
  	  var d = new Date(),times = d.getFullYear()+"/"+(d.getMonth()+1)+"/"+d.getDate();//实例化时间
	  	var beginTime = beginTime.replace(/-/g,'/');
	  	var a = (Date.parse(beginTime)-Date.parse(times))/3600/1000;
		  if(a < 0){
		  	return true;
		  }else{
		  	return false;
		  }
  }
}

/*
 * 格式化时间 - 误删除
 * Author：tangfei
 * new Date(value).format("yyyy-MM-dd h:m:s");
 * */
Date.prototype.format = function(fmt) {
	var o = {
		"M+": this.getMonth() + 1, //月份
		"d+": this.getDate(), //日
		"h+": this.getHours(), //小时
		"m+": this.getMinutes(), //分
		"s+": this.getSeconds(), //秒
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度
		"S": this.getMilliseconds() //毫秒
	};
	if (/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	}
	for (var k in o) {
		if (new RegExp("(" + k + ")").test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		}
	}
	return fmt;
};

/**
* 将秒数换成时分秒格式
*/
function formatSeconds(value) {
    var theTime = parseInt(value);// 秒
    var theTime1 = 0;// 分
    var theTime2 = 0;// 小时
    if(theTime > 60) {
        theTime1 = parseInt(theTime/60);
        theTime = parseInt(theTime%60);
        if(theTime1 > 60) {
        	theTime2 = parseInt(theTime1/60);
        	theTime1 = parseInt(theTime1%60);
        }
    }
    var result = ""+parseInt(theTime)+"秒";
    if(theTime1 > 0) {
    	result = ""+parseInt(theTime1)+"分"+result;
    }
    if(theTime2 > 0) {
    	result = ""+parseInt(theTime2)+"小时"+result;
    }
    return result;
}

/** 输出空格函数 */
function kong(num) {
  var res = '';
  for (var i = 0; i < num; i++) {
    res += ' ';
  }
  return res;
}

/** 计算JSON对象数据个数 */
function jsonLen(jsonObj) {
  var length = 0;
  for (var item in jsonObj) {
    	length++;
  }
  return length;
}

/** 解析JSON对象函数 */
function printObj(obj) {
  // JSON对象层级深度
  var deep = (typeof(deep)=='undefined') ? 0: deep;
  var html = "Array\n"; // 返回的HTML
  html += kong(deep) + "(\n";
  var i = 0;
  // JSON对象，不能使用.length获取数据的个数，故需自定义一个计算函数
  var len = typeof(obj) == 'array' ? obj.length : jsonLen(obj);
  for(var key in obj){
    // 判断数据类型，如果是数组或对象，则进行递归
    // 判断object类型时，&&jsonLen(obj[key])是由于
    // 1、值（类似：email:）为null的时候，typeof(obj[key])会把这个key当做object类型
    // 2、值为null的来源是，数据库表中某些字段没有数据，查询之后直接转为JSON返回过来
    if(typeof(obj[key])=='array'|| (typeof(obj[key])=='object' && jsonLen(obj[key]) > 0) ){
      deep += 3;
      html += kong(deep) + '[' + key + '] => ';
      // 递归调用本函数
      html += printObj(obj[key],deep);
      deep -= 3;
    }else{
      html += kong(deep + 3) + '[' + key + '] => ' + obj[key] + '\n';
    }
    if (i == len -1) {
      html += kong(deep) + ")\n";
    };
    i++;
  }
  return html;
}

/** 向HTML页面追加打印JSON数据 */
function p(obj) {
  var div = document.getElementById('print-json-html');
  if (div != null) {
    document.body.removeChild(div);
  };
  var node = document.createElement("div");//创建一个div标签
  node.id = 'print-json-html';
  node.innerHTML = '<pre>' + printObj(obj) + '</pre>';
  document.body.appendChild(node);
}

/**
 * js md5加密代码
 */

/**
 * 对象按照字典顺序md5
 * @param data
 * @constructor
 */
function MD5Obj(data) {
    var sdic = Object.keys(data).sort();
    var strSignBefore = "";
    for(var i in sdic){
      if (data[sdic[i]] !== '' && data[sdic[i]] != undefined) {
        strSignBefore += sdic[i] + "=" + data[sdic[i]];
        if (i != sdic.length - 1) {
            strSignBefore += "&";
        }
      }
    }
	// console.log('签名字符串：'+strSignBefore);
	var lastStr = strSignBefore.substr(strSignBefore.length-1,strSignBefore.length);
	if(lastStr === "&"){
		strSignBefore = strSignBefore.substr(0,strSignBefore.length-1);
	}
    return MD5(strSignBefore);
}

function MD5(instring) {
    var hexcase = 0;
    /* hex output format. 0 - lowercase; 1 - uppercase      */
    var b64pad = "";
    /* base-64 pad character. "=" for strict RFC compliance   */

    /*
     * These are the functions you'll usually want to call
     * They take string arguments and return either hex or base-64 encoded strings
     */
    function hex_md5(s) {
        return rstr2hex(rstr_md5(str2rstr_utf8(s)));
    }

    function b64_md5(s) {
        return rstr2b64(rstr_md5(str2rstr_utf8(s)));
    }

    function any_md5(s, e) {
        return rstr2any(rstr_md5(str2rstr_utf8(s)), e);
    }

    function hex_hmac_md5(k, d) {
        return rstr2hex(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)));
    }

    function b64_hmac_md5(k, d) {
        return rstr2b64(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)));
    }

    function any_hmac_md5(k, d, e) {
        return rstr2any(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)), e);
    }

    /*
     * Perform a simple self-test to see if the VM is working
     */
    function md5_vm_test() {
        return hex_md5("abc").toLowerCase() == "900150983cd24fb0d6963f7d28e17f72";
    }

    /*
     * Calculate the MD5 of a raw string
     */
    function rstr_md5(s) {
        return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
    }

    /*
     * Calculate the HMAC-MD5, of a key and some data (raw strings)
     */
    function rstr_hmac_md5(key, data) {
        var bkey = rstr2binl(key);
        if (bkey.length > 16) bkey = binl_md5(bkey, key.length * 8);

        var ipad = Array(16), opad = Array(16);
        for (var i = 0; i < 16; i++) {
            ipad[i] = bkey[i] ^ 0x36363636;
            opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }

        var hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
        return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
    }

    /*
     * Convert a raw string to a hex string
     */
    function rstr2hex(input) {
        try {
            hexcase
        } catch (e) {
            hexcase = 0;
        }
        var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
        var output = "";
        var x;
        for (var i = 0; i < input.length; i++) {
            x = input.charCodeAt(i);
            output += hex_tab.charAt((x >>> 4) & 0x0F)
                + hex_tab.charAt(x & 0x0F);
        }
        return output;
    }

    /*
     * Convert a raw string to a base-64 string
     */
    function rstr2b64(input) {
        try {
            b64pad
        } catch (e) {
            b64pad = '';
        }
        var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var output = "";
        var len = input.length;
        for (var i = 0; i < len; i += 3) {
            var triplet = (input.charCodeAt(i) << 16)
                | (i + 1 < len ? input.charCodeAt(i + 1) << 8 : 0)
                | (i + 2 < len ? input.charCodeAt(i + 2) : 0);
            for (var j = 0; j < 4; j++) {
                if (i * 8 + j * 6 > input.length * 8) output += b64pad;
                else output += tab.charAt((triplet >>> 6 * (3 - j)) & 0x3F);
            }
        }
        return output;
    }

    /*
     * Convert a raw string to an arbitrary string encoding
     */
    function rstr2any(input, encoding) {
        var divisor = encoding.length;
        var i, j, q, x, quotient;

        /* Convert to an array of 16-bit big-endian values, forming the dividend */
        var dividend = Array(Math.ceil(input.length / 2));
        for (i = 0; i < dividend.length; i++) {
            dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1);
        }

        /*
         * Repeatedly perform a long division. The binary array forms the dividend,
         * the length of the encoding is the divisor. Once computed, the quotient
         * forms the dividend for the next step. All remainders are stored for later
         * use.
         */
        var full_length = Math.ceil(input.length * 8 /
            (Math.log(encoding.length) / Math.log(2)));
        var remainders = Array(full_length);
        for (j = 0; j < full_length; j++) {
            quotient = Array();
            x = 0;
            for (i = 0; i < dividend.length; i++) {
                x = (x << 16) + dividend[i];
                q = Math.floor(x / divisor);
                x -= q * divisor;
                if (quotient.length > 0 || q > 0)
                    quotient[quotient.length] = q;
            }
            remainders[j] = x;
            dividend = quotient;
        }

        /* Convert the remainders to the output string */
        var output = "";
        for (i = remainders.length - 1; i >= 0; i--)
            output += encoding.charAt(remainders[i]);

        return output;
    }

    /*
     * Encode a string as utf-8.
     * For efficiency, this assumes the input is valid utf-16.
     */
    function str2rstr_utf8(input) {
        var output = "";
        var i = -1;
        var x, y;

        while (++i < input.length) {
            /* Decode utf-16 surrogate pairs */
            x = input.charCodeAt(i);
            y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
            if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
                x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
                i++;
            }

            /* Encode output as utf-8 */
            if (x <= 0x7F)
                output += String.fromCharCode(x);
            else if (x <= 0x7FF)
                output += String.fromCharCode(0xC0 | ((x >>> 6) & 0x1F),
                    0x80 | (x & 0x3F));
            else if (x <= 0xFFFF)
                output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
                    0x80 | ((x >>> 6) & 0x3F),
                    0x80 | (x & 0x3F));
            else if (x <= 0x1FFFFF)
                output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
                    0x80 | ((x >>> 12) & 0x3F),
                    0x80 | ((x >>> 6) & 0x3F),
                    0x80 | (x & 0x3F));
        }
        return output;
    }

    /*
     * Encode a string as utf-16
     */
    function str2rstr_utf16le(input) {
        var output = "";
        for (var i = 0; i < input.length; i++)
            output += String.fromCharCode(input.charCodeAt(i) & 0xFF,
                (input.charCodeAt(i) >>> 8) & 0xFF);
        return output;
    }

    function str2rstr_utf16be(input) {
        var output = "";
        for (var i = 0; i < input.length; i++)
            output += String.fromCharCode((input.charCodeAt(i) >>> 8) & 0xFF,
                input.charCodeAt(i) & 0xFF);
        return output;
    }

    /*
     * Convert a raw string to an array of little-endian words
     * Characters >255 have their high-byte silently ignored.
     */
    function rstr2binl(input) {
        var output = Array(input.length >> 2);
        for (var i = 0; i < output.length; i++)
            output[i] = 0;
        for (var i = 0; i < input.length * 8; i += 8)
            output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
        return output;
    }

    /*
     * Convert an array of little-endian words to a string
     */
    function binl2rstr(input) {
        var output = "";
        for (var i = 0; i < input.length * 32; i += 8)
            output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
        return output;
    }

    /*
     * Calculate the MD5 of an array of little-endian words, and a bit length.
     */
    function binl_md5(x, len) {
        /* append padding */
        x[len >> 5] |= 0x80 << ((len) % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;

        var a = 1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d = 271733878;

        for (var i = 0; i < x.length; i += 16) {
            var olda = a;
            var oldb = b;
            var oldc = c;
            var oldd = d;

            a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
            d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
            c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
            b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
            a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
            d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
            c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
            b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
            a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
            d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
            c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
            b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
            a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
            d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
            c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
            b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);

            a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
            d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
            c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
            b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
            a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
            d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
            c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
            b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
            a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
            d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
            c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
            b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
            a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
            d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
            c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
            b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

            a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
            d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
            c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
            b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
            a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
            d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
            c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
            b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
            a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
            d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
            c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
            b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
            a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
            d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
            c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
            b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

            a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
            d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
            c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
            b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
            a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
            d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
            c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
            b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
            a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
            d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
            c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
            b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
            a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
            d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
            c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
            b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

            a = safe_add(a, olda);
            b = safe_add(b, oldb);
            c = safe_add(c, oldc);
            d = safe_add(d, oldd);
        }
        return Array(a, b, c, d);
    }

    /*
     * These functions implement the four basic operations the algorithm uses.
     */
    function md5_cmn(q, a, b, x, s, t) {
        return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
    }

    function md5_ff(a, b, c, d, x, s, t) {
        return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }

    function md5_gg(a, b, c, d, x, s, t) {
        return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }

    function md5_hh(a, b, c, d, x, s, t) {
        return md5_cmn(b ^ c ^ d, a, b, x, s, t);
    }

    function md5_ii(a, b, c, d, x, s, t) {
        return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    /*
     * Add integers, wrapping at 2^32. This uses 16-bit operations internally
     * to work around bugs in some JS interpreters.
     */
    function safe_add(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }

    /*
     * Bitwise rotate a 32-bit number to the left.
     */
    function bit_rol(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    }

    return hex_md5(instring);
}

//fastclick  解决点击延迟问题  官方的tapmode没什么用
!function(){"use strict";function a(b,d){function f(a,b){return function(){return a.apply(b,arguments)}}var e,g,h,i,j;if(d=d||{},this.trackingClick=!1,this.trackingClickStart=0,this.targetElement=null,this.touchStartX=0,this.touchStartY=0,this.lastTouchIdentifier=0,this.touchBoundary=d.touchBoundary||10,this.layer=b,this.tapDelay=d.tapDelay||200,this.tapTimeout=d.tapTimeout||700,!a.notNeeded(b)){for(g=["onMouse","onClick","onTouchStart","onTouchMove","onTouchEnd","onTouchCancel"],h=this,i=0,j=g.length;j>i;i++)h[g[i]]=f(h[g[i]],h);c&&(b.addEventListener("mouseover",this.onMouse,!0),b.addEventListener("mousedown",this.onMouse,!0),b.addEventListener("mouseup",this.onMouse,!0)),b.addEventListener("click",this.onClick,!0),b.addEventListener("touchstart",this.onTouchStart,!1),b.addEventListener("touchmove",this.onTouchMove,!1),b.addEventListener("touchend",this.onTouchEnd,!1),b.addEventListener("touchcancel",this.onTouchCancel,!1),Event.prototype.stopImmediatePropagation||(b.removeEventListener=function(a,c,d){var e=Node.prototype.removeEventListener;"click"===a?e.call(b,a,c.hijacked||c,d):e.call(b,a,c,d)},b.addEventListener=function(a,c,d){var e=Node.prototype.addEventListener;"click"===a?e.call(b,a,c.hijacked||(c.hijacked=function(a){a.propagationStopped||c(a)}),d):e.call(b,a,c,d)}),"function"==typeof b.onclick&&(e=b.onclick,b.addEventListener("click",function(a){e(a)},!1),b.onclick=null)}}var b=navigator.userAgent.indexOf("Windows Phone")>=0,c=navigator.userAgent.indexOf("Android")>0&&!b,d=/iP(ad|hone|od)/.test(navigator.userAgent)&&!b,e=d&&/OS 4_\d(_\d)?/.test(navigator.userAgent),f=d&&/OS [6-7]_\d/.test(navigator.userAgent),g=navigator.userAgent.indexOf("BB10")>0;a.prototype.needsClick=function(a){switch(a.nodeName.toLowerCase()){case"button":case"select":case"textarea":if(a.disabled)return!0;break;case"input":if(d&&"file"===a.type||a.disabled)return!0;break;case"label":case"iframe":case"video":return!0}return/\bneedsclick\b/.test(a.className)},a.prototype.needsFocus=function(a){switch(a.nodeName.toLowerCase()){case"textarea":return!0;case"select":return!c;case"input":switch(a.type){case"button":case"checkbox":case"file":case"image":case"radio":case"submit":return!1}return!a.disabled&&!a.readOnly;default:return/\bneedsfocus\b/.test(a.className)}},a.prototype.sendClick=function(a,b){var c,d;document.activeElement&&document.activeElement!==a&&document.activeElement.blur(),d=b.changedTouches[0],c=document.createEvent("MouseEvents"),c.initMouseEvent(this.determineEventType(a),!0,!0,window,1,d.screenX,d.screenY,d.clientX,d.clientY,!1,!1,!1,!1,0,null),c.forwardedTouchEvent=!0,a.dispatchEvent(c)},a.prototype.determineEventType=function(a){return c&&"select"===a.tagName.toLowerCase()?"mousedown":"click"},a.prototype.focus=function(a){var b;d&&a.setSelectionRange&&0!==a.type.indexOf("date")&&"time"!==a.type&&"month"!==a.type&&"email"!==a.type?(b=a.value.length,a.setSelectionRange(b,b)):a.focus()},a.prototype.updateScrollParent=function(a){var b,c;if(b=a.fastClickScrollParent,!b||!b.contains(a)){c=a;do{if(c.scrollHeight>c.offsetHeight){b=c,a.fastClickScrollParent=c;break}c=c.parentElement}while(c)}b&&(b.fastClickLastScrollTop=b.scrollTop)},a.prototype.getTargetElementFromEventTarget=function(a){return a.nodeType===Node.TEXT_NODE?a.parentNode:a},a.prototype.onTouchStart=function(a){var b,c,f;if(a.targetTouches.length>1)return!0;if(b=this.getTargetElementFromEventTarget(a.target),c=a.targetTouches[0],d){if(f=window.getSelection(),f.rangeCount&&!f.isCollapsed)return!0;if(!e){if(c.identifier&&c.identifier===this.lastTouchIdentifier)return a.preventDefault(),!1;this.lastTouchIdentifier=c.identifier,this.updateScrollParent(b)}}return this.trackingClick=!0,this.trackingClickStart=a.timeStamp,this.targetElement=b,this.touchStartX=c.pageX,this.touchStartY=c.pageY,a.timeStamp-this.lastClickTime<this.tapDelay&&a.preventDefault(),!0},a.prototype.touchHasMoved=function(a){var b=a.changedTouches[0],c=this.touchBoundary;return Math.abs(b.pageX-this.touchStartX)>c||Math.abs(b.pageY-this.touchStartY)>c?!0:!1},a.prototype.onTouchMove=function(a){return this.trackingClick?((this.targetElement!==this.getTargetElementFromEventTarget(a.target)||this.touchHasMoved(a))&&(this.trackingClick=!1,this.targetElement=null),!0):!0},a.prototype.findControl=function(a){return void 0!==a.control?a.control:a.htmlFor?document.getElementById(a.htmlFor):a.querySelector("button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea")},a.prototype.onTouchEnd=function(a){var b,g,h,i,j,k=this.targetElement;if(!this.trackingClick)return!0;if(a.timeStamp-this.lastClickTime<this.tapDelay)return this.cancelNextClick=!0,!0;if(a.timeStamp-this.trackingClickStart>this.tapTimeout)return!0;if(this.cancelNextClick=!1,this.lastClickTime=a.timeStamp,g=this.trackingClickStart,this.trackingClick=!1,this.trackingClickStart=0,f&&(j=a.changedTouches[0],k=document.elementFromPoint(j.pageX-window.pageXOffset,j.pageY-window.pageYOffset)||k,k.fastClickScrollParent=this.targetElement.fastClickScrollParent),h=k.tagName.toLowerCase(),"label"===h){if(b=this.findControl(k)){if(this.focus(k),c)return!1;k=b}}else if(this.needsFocus(k))return a.timeStamp-g>100||d&&window.top!==window&&"input"===h?(this.targetElement=null,!1):(this.focus(k),this.sendClick(k,a),d&&"select"===h||(this.targetElement=null,a.preventDefault()),!1);return d&&!e&&(i=k.fastClickScrollParent,i&&i.fastClickLastScrollTop!==i.scrollTop)?!0:(this.needsClick(k)||(a.preventDefault(),this.sendClick(k,a)),!1)},a.prototype.onTouchCancel=function(){this.trackingClick=!1,this.targetElement=null},a.prototype.onMouse=function(a){return this.targetElement?a.forwardedTouchEvent?!0:a.cancelable?!this.needsClick(this.targetElement)||this.cancelNextClick?(a.stopImmediatePropagation?a.stopImmediatePropagation():a.propagationStopped=!0,a.stopPropagation(),a.preventDefault(),!1):!0:!0:!0},a.prototype.onClick=function(a){var b;return this.trackingClick?(this.targetElement=null,this.trackingClick=!1,!0):"submit"===a.target.type&&0===a.detail?!0:(b=this.onMouse(a),b||(this.targetElement=null),b)},a.prototype.destroy=function(){var a=this.layer;c&&(a.removeEventListener("mouseover",this.onMouse,!0),a.removeEventListener("mousedown",this.onMouse,!0),a.removeEventListener("mouseup",this.onMouse,!0)),a.removeEventListener("click",this.onClick,!0),a.removeEventListener("touchstart",this.onTouchStart,!1),a.removeEventListener("touchmove",this.onTouchMove,!1),a.removeEventListener("touchend",this.onTouchEnd,!1),a.removeEventListener("touchcancel",this.onTouchCancel,!1)},a.notNeeded=function(a){var b,d,e,f;if("undefined"==typeof window.ontouchstart)return!0;if(d=+(/Chrome\/([0-9]+)/.exec(navigator.userAgent)||[,0])[1]){if(!c)return!0;if(b=document.querySelector("meta[name=viewport]")){if(-1!==b.content.indexOf("user-scalable=no"))return!0;if(d>31&&document.documentElement.scrollWidth<=window.outerWidth)return!0}}if(g&&(e=navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/),e[1]>=10&&e[2]>=3&&(b=document.querySelector("meta[name=viewport]")))){if(-1!==b.content.indexOf("user-scalable=no"))return!0;if(document.documentElement.scrollWidth<=window.outerWidth)return!0}return"none"===a.style.msTouchAction||"manipulation"===a.style.touchAction?!0:(f=+(/Firefox\/([0-9]+)/.exec(navigator.userAgent)||[,0])[1],f>=27&&(b=document.querySelector("meta[name=viewport]"),b&&(-1!==b.content.indexOf("user-scalable=no")||document.documentElement.scrollWidth<=window.outerWidth))?!0:"none"===a.style.touchAction||"manipulation"===a.style.touchAction?!0:!1)},a.attach=function(b,c){return new a(b,c)},"function"==typeof define&&"object"==typeof define.amd&&define.amd?define(function(){return a}):"undefined"!=typeof module&&module.exports?(module.exports=a.attach,module.exports.FastClick=a):window.FastClick=a}(),"addEventListener"in document&&document.addEventListener("DOMContentLoaded",function(){FastClick.attach(document.body)},!1);

//sha1加密
!function(){"use strict";function t(t){t?(f[0]=f[16]=f[1]=f[2]=f[3]=f[4]=f[5]=f[6]=f[7]=f[8]=f[9]=f[10]=f[11]=f[12]=f[13]=f[14]=f[15]=0,this.blocks=f):this.blocks=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],this.h0=1732584193,this.h1=4023233417,this.h2=2562383102,this.h3=271733878,this.h4=3285377520,this.block=this.start=this.bytes=0,this.finalized=this.hashed=!1,this.first=!0}var h="object"==typeof window?window:{},i=!h.JS_SHA1_NO_NODE_JS&&"object"==typeof process&&process.versions&&process.versions.node;i&&(h=global);var s=!h.JS_SHA1_NO_COMMON_JS&&"object"==typeof module&&module.exports,e="function"==typeof define&&define.amd,r="0123456789abcdef".split(""),o=[-2147483648,8388608,32768,128],n=[24,16,8,0],a=["hex","array","digest","arrayBuffer"],f=[],u=function(h){return function(i){return new t(!0).update(i)[h]()}},c=function(){var h=u("hex");i&&(h=p(h)),h.create=function(){return new t},h.update=function(t){return h.create().update(t)};for(var s=0;s<a.length;++s){var e=a[s];h[e]=u(e)}return h},p=function(t){var h=require("crypto"),i=require("buffer").Buffer,s=function(s){if("string"==typeof s)return h.createHash("sha1").update(s,"utf8").digest("hex");if(s.constructor===ArrayBuffer)s=new Uint8Array(s);else if(void 0===s.length)return t(s);return h.createHash("sha1").update(new i(s)).digest("hex")};return s};t.prototype.update=function(t){if(!this.finalized){var i="string"!=typeof t;i&&t.constructor===h.ArrayBuffer&&(t=new Uint8Array(t));for(var s,e,r=0,o=t.length||0,a=this.blocks;o>r;){if(this.hashed&&(this.hashed=!1,a[0]=this.block,a[16]=a[1]=a[2]=a[3]=a[4]=a[5]=a[6]=a[7]=a[8]=a[9]=a[10]=a[11]=a[12]=a[13]=a[14]=a[15]=0),i)for(e=this.start;o>r&&64>e;++r)a[e>>2]|=t[r]<<n[3&e++];else for(e=this.start;o>r&&64>e;++r)s=t.charCodeAt(r),128>s?a[e>>2]|=s<<n[3&e++]:2048>s?(a[e>>2]|=(192|s>>6)<<n[3&e++],a[e>>2]|=(128|63&s)<<n[3&e++]):55296>s||s>=57344?(a[e>>2]|=(224|s>>12)<<n[3&e++],a[e>>2]|=(128|s>>6&63)<<n[3&e++],a[e>>2]|=(128|63&s)<<n[3&e++]):(s=65536+((1023&s)<<10|1023&t.charCodeAt(++r)),a[e>>2]|=(240|s>>18)<<n[3&e++],a[e>>2]|=(128|s>>12&63)<<n[3&e++],a[e>>2]|=(128|s>>6&63)<<n[3&e++],a[e>>2]|=(128|63&s)<<n[3&e++]);this.lastByteIndex=e,this.bytes+=e-this.start,e>=64?(this.block=a[16],this.start=e-64,this.hash(),this.hashed=!0):this.start=e}return this}},t.prototype.finalize=function(){if(!this.finalized){this.finalized=!0;var t=this.blocks,h=this.lastByteIndex;t[16]=this.block,t[h>>2]|=o[3&h],this.block=t[16],h>=56&&(this.hashed||this.hash(),t[0]=this.block,t[16]=t[1]=t[2]=t[3]=t[4]=t[5]=t[6]=t[7]=t[8]=t[9]=t[10]=t[11]=t[12]=t[13]=t[14]=t[15]=0),t[15]=this.bytes<<3,this.hash()}},t.prototype.hash=function(){var t,h,i,s=this.h0,e=this.h1,r=this.h2,o=this.h3,n=this.h4,a=this.blocks;for(h=16;80>h;++h)i=a[h-3]^a[h-8]^a[h-14]^a[h-16],a[h]=i<<1|i>>>31;for(h=0;20>h;h+=5)t=e&r|~e&o,i=s<<5|s>>>27,n=i+t+n+1518500249+a[h]<<0,e=e<<30|e>>>2,t=s&e|~s&r,i=n<<5|n>>>27,o=i+t+o+1518500249+a[h+1]<<0,s=s<<30|s>>>2,t=n&s|~n&e,i=o<<5|o>>>27,r=i+t+r+1518500249+a[h+2]<<0,n=n<<30|n>>>2,t=o&n|~o&s,i=r<<5|r>>>27,e=i+t+e+1518500249+a[h+3]<<0,o=o<<30|o>>>2,t=r&o|~r&n,i=e<<5|e>>>27,s=i+t+s+1518500249+a[h+4]<<0,r=r<<30|r>>>2;for(;40>h;h+=5)t=e^r^o,i=s<<5|s>>>27,n=i+t+n+1859775393+a[h]<<0,e=e<<30|e>>>2,t=s^e^r,i=n<<5|n>>>27,o=i+t+o+1859775393+a[h+1]<<0,s=s<<30|s>>>2,t=n^s^e,i=o<<5|o>>>27,r=i+t+r+1859775393+a[h+2]<<0,n=n<<30|n>>>2,t=o^n^s,i=r<<5|r>>>27,e=i+t+e+1859775393+a[h+3]<<0,o=o<<30|o>>>2,t=r^o^n,i=e<<5|e>>>27,s=i+t+s+1859775393+a[h+4]<<0,r=r<<30|r>>>2;for(;60>h;h+=5)t=e&r|e&o|r&o,i=s<<5|s>>>27,n=i+t+n-1894007588+a[h]<<0,e=e<<30|e>>>2,t=s&e|s&r|e&r,i=n<<5|n>>>27,o=i+t+o-1894007588+a[h+1]<<0,s=s<<30|s>>>2,t=n&s|n&e|s&e,i=o<<5|o>>>27,r=i+t+r-1894007588+a[h+2]<<0,n=n<<30|n>>>2,t=o&n|o&s|n&s,i=r<<5|r>>>27,e=i+t+e-1894007588+a[h+3]<<0,o=o<<30|o>>>2,t=r&o|r&n|o&n,i=e<<5|e>>>27,s=i+t+s-1894007588+a[h+4]<<0,r=r<<30|r>>>2;for(;80>h;h+=5)t=e^r^o,i=s<<5|s>>>27,n=i+t+n-899497514+a[h]<<0,e=e<<30|e>>>2,t=s^e^r,i=n<<5|n>>>27,o=i+t+o-899497514+a[h+1]<<0,s=s<<30|s>>>2,t=n^s^e,i=o<<5|o>>>27,r=i+t+r-899497514+a[h+2]<<0,n=n<<30|n>>>2,t=o^n^s,i=r<<5|r>>>27,e=i+t+e-899497514+a[h+3]<<0,o=o<<30|o>>>2,t=r^o^n,i=e<<5|e>>>27,s=i+t+s-899497514+a[h+4]<<0,r=r<<30|r>>>2;this.h0=this.h0+s<<0,this.h1=this.h1+e<<0,this.h2=this.h2+r<<0,this.h3=this.h3+o<<0,this.h4=this.h4+n<<0},t.prototype.hex=function(){this.finalize();var t=this.h0,h=this.h1,i=this.h2,s=this.h3,e=this.h4;return r[t>>28&15]+r[t>>24&15]+r[t>>20&15]+r[t>>16&15]+r[t>>12&15]+r[t>>8&15]+r[t>>4&15]+r[15&t]+r[h>>28&15]+r[h>>24&15]+r[h>>20&15]+r[h>>16&15]+r[h>>12&15]+r[h>>8&15]+r[h>>4&15]+r[15&h]+r[i>>28&15]+r[i>>24&15]+r[i>>20&15]+r[i>>16&15]+r[i>>12&15]+r[i>>8&15]+r[i>>4&15]+r[15&i]+r[s>>28&15]+r[s>>24&15]+r[s>>20&15]+r[s>>16&15]+r[s>>12&15]+r[s>>8&15]+r[s>>4&15]+r[15&s]+r[e>>28&15]+r[e>>24&15]+r[e>>20&15]+r[e>>16&15]+r[e>>12&15]+r[e>>8&15]+r[e>>4&15]+r[15&e]},t.prototype.toString=t.prototype.hex,t.prototype.digest=function(){this.finalize();var t=this.h0,h=this.h1,i=this.h2,s=this.h3,e=this.h4;return[t>>24&255,t>>16&255,t>>8&255,255&t,h>>24&255,h>>16&255,h>>8&255,255&h,i>>24&255,i>>16&255,i>>8&255,255&i,s>>24&255,s>>16&255,s>>8&255,255&s,e>>24&255,e>>16&255,e>>8&255,255&e]},t.prototype.array=t.prototype.digest,t.prototype.arrayBuffer=function(){this.finalize();var t=new ArrayBuffer(20),h=new DataView(t);return h.setUint32(0,this.h0),h.setUint32(4,this.h1),h.setUint32(8,this.h2),h.setUint32(12,this.h3),h.setUint32(16,this.h4),t};var d=c();s?module.exports=d:(h.sha1=d,e&&define(function(){return d}))}();
