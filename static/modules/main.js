
$(function() {
    
    var selected = null;
    
    
        
var TACTIC_TAGS_TARGET = [];
var TACTIC_TAGS_VALUE_TAG = [];
var TACTIC_SIGN_SIGN_TAG = [];
var TACTIC_ACTION_TAG = [];
    
    

    




    $('#users-list').on('click', 'li', function() {
        if (selected == this){
            $(selected).removeClass('selected');
            selected = null;
        } else if (selected != null) {
            $(selected).removeClass('selected');
            $(this).addClass('selected');
            selected = this;
        } else {
            $(this).addClass('selected');
            selected = this;
        }
    });

    




    
    
    

    // socket.on('new-user-online', msg => {
    //     $('#users-list').append($('<li>').text(msg));
    // });

    socket.on('users-online', msg => {
        $('#users-list').empty();
        msg.forEach(item => {
            $('#users-list').append($('<li>').text(msg));
        })
    });

    

    
});
