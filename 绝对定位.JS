pub.setPosition = function(){
        
        var position=$('.sub_content').offset();
        $('.sub_content').css('position','fixed');
        $('.sub_content').css('left',position.left);
        $('.sub_content').css('top',position.top);
        
        window.onresize = function(){
            $('.sub_content').css('position','static');
            var position2=$('.sub_content').offset();
            $('.sub_content').css('position','fixed');
            $('.sub_content').css('left',position2.left);
            $('.sub_content').css('top',position2.top);        
         }        
}
