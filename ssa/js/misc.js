$(function() {    
    $('pre code').each(function(i, block) {
        hljs.highlightBlock(block);
    });
    $("#snippet-1").click(function() {
        $("#code").text($("#snippet-1").text())
    });

    $("#snippet-2").click(function() {
        $("#code").text($("#snippet-2").text())
    });

    $("#snippet-3").click(function() {
        $("#code").text($("#snippet-3").text())
    });
});