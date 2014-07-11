document.write('<div id="leaveComment" style="width:80%;height:500px;top:50px;left:80px;position:absolute;z-index:1120;background-color:#fff;padding:10px;OVERFLOW-Y: auto; OVERFLOW-X:hidden;display:none;"><!-- <iframe src="http://www.baidu.com" width="100%" height="100%" ></iframe> --><!-- 多说评论框 start --><div class="ds-thread" data-thread-key="gh_kedou" data-title="在线互动聊天" data-url="http://tandaly.github.io/game/kedou"></div><!-- 多说评论框 end --></div><div id="modal" class="modal-backdrop fade in" style="display:none;"></div>');

//全局变量
var t_maxMomentum = 8;//tan
var currentTadpole =  new Array();//tan


$(function(){
    $("#modal").click(function(){  
        $("#modal").hide();
        $("#leaveComment").hide();
        $("#chat").show().focus();
    });
    
});

//留言
function leaveComment(){ 
    $("#modal").show();
    $("#leaveComment").height($(window).height() * 0.8).show();
    $("#chat").hide();
}



/************************start画图****************************/
var circleX = 200;
var circleY = 200;
function drawMyArea(context){
    
    var g1 = context.createRadialGradient(circleX, circleY-50, 0, circleY, circleY-50, 140);
             g1.addColorStop(0.1, 'rgb(255,0,0)');  
              g1.addColorStop(1, 'rgb(50,0,0)');
             context.fillStyle = g1;
             context.beginPath();
             context.arc(circleX, circleY, 140, 0, Math.PI * 2, true);
             context.closePath();
             context.fill();

}

function create5Star(context) {
            var n = 0;
            var dx = 0;
            var dy = -200;

            var s = 50;
            //创建路径
            context.beginPath();
            context.fillStyle = 'rgba(255,0,0,0.5)';
             var x = Math.sin(0);
             var y = Math.cos(0);
             var dig = Math.PI / 5 * 4;
             for (var i = 0; i < 5; i++) {
                 var x = Math.sin(i * dig);
                 var y = Math.cos(i * dig);
                 context.lineTo(dx + x * s, dy + y * s);
 
             }
             context.closePath();
 
         }
 
         function drawStar(context) {
             context.shadowOffsetX = 10;
             context.shadowOffsetY = 10;
             context.shadowColor = 'rgba(100,100,100,0.5)';
             context.shadowBlur =5;
             //图形绘制
             context.translate(0, 50);
             for (var i = 0; i < 3; i++) {
                 context.translate(50, 50);
                 create5Star(context);
                 context.fill();
             }
         }

/************************end画图****************************/












<!--start鼠标左键显示♥-->
$("html,body").click(function(e){
    anp(e);
});

function anp(e){
    var n=Math.round(Math.random()*10);
    var $i=$("<b>").html("<font size=28>♥</font>"); //"E94F06"
    var x=e.pageX,y=e.pageY;
    $i.css({top:y-20,left:x,position:"absolute",color:"#"+(Math.random()*0xfff<<0).toString(16)});
    $("body").append($i);
    $i.animate({top:y-400,opacity:0,"font-size":"24px"},1500,function(){
        $i.remove();
    });
    e.stopPropagation();
}
<!--end鼠标左键显示♥-->


<!-- 多说公共JS代码 start (一个网页只需插入一次) -->
      var duoshuoQuery = {short_name:"tandalygithub"};
        (function() {
          var ds = document.createElement('script');
          ds.type = 'text/javascript';ds.async = true;
          ds.src = (document.location.protocol == 'https:' ? 'https:' : 'http:') + '//static.duoshuo.com/embed.unstable.js';
          ds.charset = 'UTF-8';
          (document.getElementsByTagName('head')[0] 
           || document.getElementsByTagName('body')[0]).appendChild(ds);
        })();
<!-- 多说公共JS代码 end -->

<!--start百度统计-->
var _bdhmProtocol = (("https:" == document.location.protocol) ? " https://" : " http://");
document.write(unescape("%3Cscript src='" + _bdhmProtocol + "hm.baidu.com/h.js%3Fb5b71592574767d796a6f654023dbba6' type='text/javascript'%3E%3C/script%3E"));
<!--end百度统计-->
//http://it264.pw/