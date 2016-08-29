function isPhone(){
    if ((navigator.userAgent.indexOf('iPhone') != -1) || (navigator.userAgent.indexOf('iPod') != -1) || (navigator.userAgent.indexOf('iPad') != -1)) {
        return true;
    }
    if(navigator.userAgent.match(/Android/i)) {
        return true;
    }
    return false;
}

function iosV(){
    var agent = navigator.userAgent.toLowerCase() ;
    var version;
    if(agent.indexOf("like mac os x") > 0){
        //ios
        var regStr_saf = /os [\d._]*/gi ;
        var verinfo = agent.match(regStr_saf) ;
        version = (verinfo+"").replace(/[^0-9|_.]/ig,"").replace(/_/ig,".");
    }

    var version_str = version+"";
    if(version_str != "undefined" && version_str.length >0){
        version=version.substring(0,1);
        return version;
    }
    return false;
}


var app = angular.module( 'app', [ 'ngMaterial','ngWebSocket'] );
app.run(function($timeout) {
        //$('.cli').on("click","span[i]", function(event){
        //    var $this = $(this);
        //    buttonSend($this.attr('i'));
        //    $this.addClass('onclick');
        //    event.stopPropagation();
        //    return false;
        //});
    });


var msgDiv = document.getElementById("messagewindow")
app.directive('stringMsg' , function($compile){
    return function(scope , el , attr){
        if(attr.stringMsg){
            scope.$watch(attr.stringMsg , function(html){
                html.msg = "<div>"+html.msg+"</div>";
                var msg = html.msg
                    .replace(/<a/g, "<span")
                    .replace(/<\/a/g, "</span")
                    .replace(/i="(\w*?)"/g, "ng-click='buttonSend(\"$1\",$event)'")
                    .replace(/c="(\w+).(\w+).(\w+).(\w+)"/g, "style='color:rgba($2,$3,$4,1)'")
                    .replace(/  /g, "　");
                el.html($compile(msg)(scope));
            });
        }
    };
});
app.directive('c' , function(){
    return function(scope , el , attr){
        if(attr.c){
            console.log(el);
        }
    };
});
app.directive("ngMobileClick", [function () {
    return function (scope, elem, attrs) {
        elem.bind("touchend click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            scope.$apply(attrs["ngMobileClick"]);
        });
    }
}]);


app.controller("con", function($scope, $mdDialog, $mdMedia,$location,$websocket,$window) {

    $scope.winRotateCss = {};
    $scope.standalone=false;
    if (
        ("standalone" in window.navigator) &&
        window.navigator.standalone
    ){
        $scope.standalone=true;
    }
    angular.element($window).bind('resize', function() {
        $scope.onresize();
        $scope.$apply();
    });
    angular.element($window).bind('orientationchange', function() {
        $scope.onresize();
        $scope.$apply();
    });
    $scope.onresize = function(){
        var w = angular.element($window);
        $scope.windowHeight = w.height()
        $scope.windowWidth = w.width()
        if($scope.config.rotate){
            $scope.winRotateCss['width']  = $scope.windowHeight;
            $scope.winRotateCss['height'] = $scope.windowWidth;
            $scope.winRotateCss['margin-left'] = 0-($scope.windowHeight-$scope.windowWidth)/2;
            $scope.winRotateCss['margin-top']  = 0-($scope.windowWidth-$scope.windowHeight)/2;
        }else{
            $scope.winRotateCss['width']  = $scope.windowWidth ;
            $scope.winRotateCss['height'] = $scope.windowHeight;
            $scope.winRotateCss['margin'] = '0 auto';
        }
    };
        $scope.msgList = [];
        var io = $scope.io = null;
        function echo(type, msg,noapply){
            $scope.msgList.push({type:type,msg:msg});
            if($scope.config.autoClear){
                var max = $scope.config.autoClearNumber;
                if($scope.msgList.length>max){
                    $scope.msgList.splice(0,$scope.msgList.length-max);
                }
            }
            if($scope.$apply&&!noapply)$scope.$apply();
            msgDiv.scrollTop = msgDiv.scrollHeight;
        }
        function webclient_init (wsurl){
            echo("sys",'<i class="material-icons" style="color:#03a9f4">info_outline</i> 尝试连接服务器',true);

            io = $scope.io = $websocket(wsurl);
            io.onMessage(function(message) {
                echo("text", message.data);
            });
            io.onOpen(function(message) {
                //console.log(message);
                addSaver($scope.server.ip+':'+ $scope.server.port);
                echo("sys",'<i class="material-icons" style="color:#03a9f4">info_outline</i> 已建立连接');
                io.send('ErAXiN');
            });
            io.onClose(function(message) {
                //console.log(message);
                echo("sys",'<i class="material-icons" style="color:#f43f1c">error_outline</i> 连接已断开');
                ioerr();
            });
            io.onError(function(message) {
                //console.log(message);
                echo("sys",'<i class="material-icons" style="color:#f43f1c">error_outline</i> 连接失败');
            });
        }
        function ioerr(){
            var confirm = $mdDialog.confirm()
                .title('连接已断开')
                .textContent('连接断开 可能是网络不稳定，输入的ip或端口错误 以及人品问题 ')
                .ok('重连!')
                .cancel('修改ip');
            $mdDialog.show(confirm).then(function() {
                webclient_init('ws://'+  $scope.server.ip+':'+ $scope.server.port);
            }, function() {
                $scope.openSetIp();
            });
        }


       $scope.kb=function(n){
           if(isNaN(n)){
               if(n=='empty'){
                   $scope.msg='';
               }else if(n=='backspace'){
                   $scope.msg = $scope.msg.substring(0,$scope.msg.length-1);
               }
           }else{
               $scope.msg+=''+n;
           }
       }

       function addSaver(wsurl){

           if(window.localStorage) {
               if (localStorage.getItem('serverList')) {
                   $scope.serverList = JSON.parse(localStorage.getItem('serverList'));
               } else {
                   $scope.serverList = [];
               }
               if ($scope.serverList.indexOf(wsurl) == -1) {
                   $scope.serverList.splice(0, 0, wsurl);
                   localStorage.setItem('serverList', JSON.stringify($scope.serverList))
               }
           }
       }
       $scope.virtualKeyboardShow = false;

       $scope.inputClick = function(){
           if($scope.config.virtualKeyboard){
               $scope.virtualKeyboardShow =!$scope.virtualKeyboardShow;
           }
       };


        $scope.server={
            ip:'127.0.0.1',
            port:9000
        };

        var defaultConfig = {
            'digitalKeyboard':true,
            'autoClear':true,
            'autoClearNumber':100,
            'fontSize':0,
            'virtualKeyboard':isPhone(),
            'singleHandedly':false,
            'singleHandedlyLeft':false,
            'noEffect':false,
            'lineHeight':0,
            'rotate':false,
            'rotate90':false,
            'letterSpacing':-1,
            'color':{
                'background' : {r:50,g:50,b:50},
                'text'   : {r:230,g:230,b:230},
                'button'     : {r:255,g:240,b:180}
            }
        };
       if(window.localStorage) {
           if (localStorage.getItem('config')) {
               $scope.config = JSON.parse(localStorage.getItem('config'));
           } else {
               $scope.config = JSON.parse(JSON.stringify(defaultConfig));
           }
       }else{
           $scope.config = JSON.parse(JSON.stringify(defaultConfig));
       }
        $scope.openConfig = function(ev) {
            $mdDialog.show({
                controller:['$scope', '$mdDialog', function($scopeIn, $mdDialogIn){
                    if(window.localStorage) {
                        if (localStorage.getItem('serverList')) {
                            $scopeIn.serverList = JSON.parse(localStorage.getItem('serverList'));
                        } else {
                            $scopeIn.serverList = [];
                        }
                    }

                    $scopeIn.old = JSON.parse(JSON.stringify($scope.config));
                    $scopeIn.config = $scope.config;
                    $scopeIn.default = function() {
                        $scopeIn.config = $scope.config = JSON.parse(JSON.stringify(defaultConfig));
                    };
                    $scopeIn.isDefault = function(){
                       return JSON.stringify(defaultConfig) == JSON.stringify( $scope.config);
                    };
                    $scopeIn.isEdit = function(){
                        return  JSON.stringify($scopeIn.config) == JSON.stringify( $scopeIn.old );
                    };
                    $scopeIn.save = function() {
                        if(window.localStorage) {
                            localStorage.setItem("config", JSON.stringify($scopeIn.config));
                        }
                        $scope.config = JSON.parse(JSON.stringify($scopeIn.config ));
                        $scope.onresize();
                        $mdDialogIn.cancel();
                    };
                    $scopeIn.cancel = function() {
                        $scope.config =  JSON.parse(JSON.stringify($scopeIn.old ));
                        $scope.onresize();
                        $mdDialogIn.cancel();
                    };
                    $scopeIn.emptyServerList = function(){
                        if(window.localStorage) {
                            localStorage.removeItem('serverList');
                        }
                        $scopeIn.serverList = false;
                    }
                }],
                templateUrl: 'config',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:true,
                escapeToClose:true,
                fullscreen:true
            });
        };
        $scope.openSetIp = function(ev) {
            $mdDialog.show({
                controller:['$scope', '$mdDialog', function($scopeIn, $mdDialogIn){


                    if(window.localStorage) {
                        if (localStorage.getItem('serverList')) {
                            $scopeIn.serverList = JSON.parse(localStorage.getItem('serverList'));
                        } else {
                            $scopeIn.serverList = [];
                        }
                    }

                    $scopeIn.serverListIndex = '';
                    $scopeIn.serverListIndexChange = function(){
                        if($scopeIn.serverListIndex){

                            var wsurl = $scopeIn.serverListIndex.split(':');
                            $scopeIn.server.ip = wsurl[0];
                            $scopeIn.server.port = wsurl[1];

                        }
                    };


                    $scopeIn.server = $scope.server;
                    $scopeIn.save = function() {
                        //todo：连接服务器
                        $location.hash( $scope.server.ip+':'+ $scope.server.port);
                        webclient_init('ws://'+ $scope.server.ip+':'+ $scope.server.port);
                        $mdDialog.show(
                            $mdDialog.alert()
                                .parent(angular.element(document.body))
                                .clickOutsideToClose(true)
                                .title('提示：')
                                .textContent('你现在可以吧该页面保存到书签，下次打开将不再需要输入服务器地址')
                                .ok('知道啦')
                        );


                        $mdDialogIn.cancel();
                    };
                }],
                templateUrl: 'setIp',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:false,
                escapeToClose:false
            });
        };

        $scope.msg = '';
        $scope.send = function(msg){
            if(io){
                if(msg){
                    io.send(msg);
                }else{
                    io.send('\0');
                }
                $scope.msg = ''
            }
        }
       $scope.send0 = function(){
           if(io){
               io.send('\0');
           }
       };
       $scope.buttonSend = function(msg,$event){
           $event.currentTarget.className='onclick';
           if(io){
               if(msg){
                   io.send(msg);
               }else{
                   io.send('\0');
               }
           }
           $event.stopPropagation();
       }

       window.buttonSend = function(msg){
           if(io){
               if(msg){
                   io.send(msg);
               }else{
                   io.send('\0');
               }
           }
           $scope.$apply();
       };

       $scope.mykKeypress = function(e){
           var keycode = window.event?e.keyCode:e.which;
           if(keycode==13){
               $scope.send($scope.msg);
           }
       };


       echo("sys",'<i class="material-icons" style="color:#03a9f4">info_outline</i> 系统初始化完毕',true);

       if($location.hash()){
           var hash = $location.hash().split(':');
           $scope.server.ip = hash[0];
           $scope.server.port = hash[1]
           webclient_init('ws://'+  $scope.server.ip+':'+ $scope.server.port);
       }else{
           $scope.openSetIp();
       }
        $scope.onresize();
   });
