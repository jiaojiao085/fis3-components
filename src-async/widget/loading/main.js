/**
 * main
 * @require './index.scss' // 无需在页面中控制 css
 */
/**
 * 
    name    type    default description
    content string  '加载中...'    提示内容，用来填充模板
 */
 
var loading = {
    $el: $('.ui-search-bar'),
    init: function() {

        this._renderData();
        this._bindEvent();
    },

    _renderData: function() {
        this._ajaxData();
    },

    _ajaxData: function() {

    },

    _bindEvent: function() {
        var el = $.loading({
            content:'加载中...',
        })
        setTimeout(function(){
            el.loading("hide");
        },100);

        el.on("loading:hide",function(){
            console.log("loading hide");
        });
    }
}


module.exports = loading;