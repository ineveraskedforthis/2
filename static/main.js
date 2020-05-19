
$(function() {
    
    var selected = null;
    
    
        
var TACTIC_TAGS_TARGET = [];
var TACTIC_TAGS_VALUE_TAG = [];
var TACTIC_SIGN_SIGN_TAG = [];
var TACTIC_ACTION_TAG = [];
    
    

    


    $('#buy-form-con').submit(e => {
        e.preventDefault();
        socket.emit('buy', {tag: $('#buy-tag-select').val(),
                            amount: $('#buy-amount').val(),
                            money: $('#buy-money').val(),
                            max_price: $('#buy-max-price').val()});
    });

    $('#sell-form-con').submit(e => {
        e.preventDefault();
        socket.emit('sell', {tag: $('#sell-tag-select').val(),
                             amount: $('#sell-amount').val(),
                             price: $('#sell-price').val()});
    });

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

    



    socket.on('tags', msg => {
        for (var tag of msg) {
            $('#buy-tag-select').append($('<option>').val(tag).text(tag));
            $('#sell-tag-select').append($('<option>').val(tag).text(tag));
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
