$(function() {    
    hljs.initHighlighting.called = false;
    hljs.initHighlightingOnLoad();
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