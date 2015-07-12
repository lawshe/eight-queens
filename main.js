if (Meteor.isClient) {
	Session.setDefault('solved',false);
	Session.setDefault('longLatAttack',false);
	Session.setDefault('diagonalAttack',false);

	Template.chessBoard.rendered = function(){
		$('.queen').draggable({ 
			containment: 'table', 
			revert: 'invalid' 
		});
		$('td').droppable({
			drop: function(ev, ui) {
				var dropped = ui.draggable;
				var droppedOn = $(this);
				$(droppedOn).droppable('disable');
				$(dropped).parent().droppable('enable');
				$(dropped).detach().css({top: 0, left: 0}).appendTo(droppedOn);
				Meteor.fxns.check();
			}
		});   

		$('td').not('td:empty').droppable("disable");
	};
	Template.chessBoard.helpers({
		complete: function(){
			return Session.get('complete');
		},
		longLatAttack: function(){
			return Session.get('longLatAttack');
		},
		diagonalAttack: function(){
			return Session.get('diagonalAttack');
		}
	});	
	Template.queen.helpers({
		complete: function(){
			return Session.get('complete');
		}
	});	
}

Meteor.fxns = {
	check: function(){
		//reset variables for showing attack message or complete message
		Session.set('complete',false);
		Session.set('longLatAttack',false);
		Session.set('diagonalAttack',false);
		var complete = false;

		//queen positions
		var longitudes = [],
			latitudes = [],
			pairs = [],
			slopes = [];
		
		$('.queen').each(function(i){
			var longitude = $(this).parent().prevAll().length + 1;
			var latitude = $(this).closest('tr').attr('id');
				latitude = parseInt(latitude);
			var pair = {x:longitude, y:latitude};
			
			longitudes.push(longitude);
			latitudes.push(latitude);
			pairs.push(pair);
		});
		
		//first check if any queens are on the same column or row, if so then the challenge is incomplete
		var uniqueLongitudes = jQuery.unique(longitudes);
		var uniqueLatitudes = jQuery.unique(latitudes);
		if(uniqueLongitudes.length != 8 || uniqueLatitudes.length != 8){
			Session.set('longLatAttack',true);
			Session.set('complete',false);
		}else{
			Session.set('longLatAttack',false);
			
			$(pairs).each(function(idx){
				$(pairs).each(function(index){
					var slope = Meteor.fxns.findSlope(pairs[idx],pairs[index]);
					slopes.push(slope);
				});
			});
			if(slopes.indexOf(1) === -1){
				Session.set('complete',true);
				Session.set('diagonalAttack',false);
				return true;
			}else{
				Session.set('complete',false);
				Session.set('diagonalAttack',true);
				return false;
			}
		}
	},
	findSlope: function(pointOne, pointTwo){
		if(pointOne.x === pointTwo.x && pointOne.y  === pointTwo.y){
			return 0;
		}else{
			//slope of 1 means that the two points are in the same line / the same diagonal of the board
			var m = Math.abs(pointTwo.y - pointOne.y) / Math.abs(pointTwo.x - pointOne.x);
			return m;
		}
	}
};