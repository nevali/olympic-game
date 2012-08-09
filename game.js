$(function() {
	var i, posX = $(document).width();

	i = setInterval(function() {
		$('#lanes,.camera').css('left', posX + 'px');
		posX -= 10;
		if(posX + $('#lanes').outerWidth() + 20 < 0)
		{
			posX = $(document).width() + 100;
		}
	}, 50);

});

$(function() {
	var i;

	i = setInterval(function() {
		$('.trees.background').each(function(index,el) {
			var l = $(el).offset().left;
			l -= 10;
			if(l + $(el).outerWidth() < 0)
			{
				l = $(document).width() + 20;
			}
			$(el).css('left', l + 'px');  
		});
	}, 150);

});

$(function() {
	var i;

	i = setInterval(function() {
		$('.trees.foreground').each(function(index,el) {
			var l = $(el).offset().left;
			l -= 10;
			if(l + $(el).outerWidth() < 0)
			{
				l = $(document).width() + 20;
			}
			$(el).css('left', l + 'px');  
		});
	}, 100);

});

$(function() {
	var i;

	i = setInterval(function() {
		$('.cloud').each(function(index,el) {
			var l = $(el).offset().left;
			l -= 10;
			if(l + $(el).outerWidth() < 0)
			{
				l = $(document).width() + 20;
			}
			$(el).css('left', l + 'px');  
		});
	}, 5000);

});

$(function() {
	var athletes = [], npcs = [], headers = [], numLanes = 5, player, stats;
	
	$('#athletes-data tr').each(function(index,el) {
		var row = {};
		if(index == 0)
		{
			$(el).find('th').each(function(i,e) {
				var c;
				c = $(e).attr('class');
				if(c === undefined)
				{
					headers.push('col' + i);
				}
				else
				{
					headers.push(c.split(' ')[0]);
				}
			});
			return;
		}
		$(el).find('td').each(function(i,e) {
			if(headers[i] === undefined)
			{
				return;
			}
			row[headers[i]] = $(e).text();
		});
		athletes.push(row);	
	});

	function startPlayer(el)
	{
		var laneNum;

		$(el).attr('class', 'runner you');
		do
		{
			laneNum = Math.ceil(Math.random() * numLanes);		
		}
		while(laneNum == 0)
		$(el).addClass('lane' + laneNum);
		$(el).css('left', '40%');
		el.athleteData = {};
		el.athleteData.laneNum = laneNum;
		el.scoreData = { confirmedScore: 0 };
	}

	function gameOver()
	{
		$('body').append('<div id="game-over"><p>Game Over</p><p>Your score is ' + player[0].scoreData.confirmedScore + '</p><p><a href="">Do you want to play again?</a></div>');
	}

	function startAthlete(el)
	{
		var index, laneNum, l, before = [], after = [];
		$(el).attr('class', 'runner npc');
		if(!athletes.length)
		{
			return;
		}
		do
		{
			index = Math.floor(Math.random() * athletes.length);
		}
		while(index == athletes.length)
		do
		{
			laneNum = Math.ceil(Math.random() * numLanes);		
		}
		while(laneNum == 0)
		el.athleteData = athletes[index];
		el.athleteData.active = true;
		el.athleteData.laneNum = laneNum;
		el.scoreData = { trip: false, proxim: false, risky: false };
		$(el).addClass('lane' + laneNum);
		$(el).addClass('good');
		l = $('#track').width() + $(el).outerWidth() + 20;
		$(el).css('left', l + 'px');
		if(index > 0)
		{
			before = athletes.slice(0, index);
		}
		if(index < athletes.length - 1)
		{
			after = athletes.slice(index + 1);
		}
		athletes = before.concat(after);
	}

	function calcNPCScore(npc)
	{
		if(!npc.athleteData.active)
		{
			return 0;
		}
		if(npc.scoreData.trip)
		{
			return -75;
		}
		if(npc.scoreData.risky)
		{
			return 50;
		}
		if(npc.scoreData.proxim)
		{
			return 10;
		}
		return 0;
	}

	function presentScore()
	{
		var i, total;

		total = player[0].scoreData.confirmedScore;
		for(i in npcs)
		{
			total += calcNPCScore(npcs[i]);
		}
		$('#score').text(total);
	}

	function updateScore(npc)
	{
		player[0].scoreData.confirmedScore += calcNPCScore(npc);
		npc.athleteData.active = false;
	}

	function moveAthleteUp(el)
	{
		var old = el.athleteData.laneNum;
		
		if(old == 1)
		{
			return;
		}
		el.athleteData.laneNum--;
		$(el).removeClass('lane' + old);
		$(el).addClass('lane' + el.athleteData.laneNum);
	}

	function moveAthleteDown(el)
	{
		var old = el.athleteData.laneNum;
		
		if(old == numLanes)
		{
			return;
		}
		el.athleteData.laneNum++;
		$(el).removeClass('lane' + old);
		$(el).addClass('lane' + el.athleteData.laneNum);		
	}

	$(document).bind('keyup', function(ev) {
		if(ev.keyCode == 38)
		{
			/* Move up (previous lane) */
			moveAthleteUp(player[0]);
		}
		else if(ev.keyCode == 40)
		{
			/* Move down (next lane) */
			moveAthleteDown(player[0]);
		}	
	});

	function checkHorizontalProximity(npc, zone)
	{
		var no, nl, nr, po, pl, pr;
		
		no = $(npc).offset();
		nl = no.left;
		nr = no.left + $(npc).outerWidth() - 1;
		po = player.offset();
		pl = po.left;
		pr = po.left + $(npc).outerWidth() - 1;
		if(pl >= nl - zone && pl <= nr + zone)
		{
			return true;
		}
		if(pr >= nl - zone && pr <= nr + zone)
		{
			return true;
		}
		return false; 
	}

	function populateStats(npc)
	{
		var d, lines;

		d = npc.athleteData;
		stats[0].npc = npc;
		stats.empty();
		lines = [];
		lines.push('<dl>');
		lines.push('<dt>Name</dt>');
		lines.push('<dd>' + d.name + '</dd>');
		lines.push('</dl>');
		lines.push('<dt>Nationality</dt>');
		lines.push('<dd>' + d.nation + '</dd>');
		lines.push('<dd><img src="' + d.nation + '".svg /></dd>');
		lines.push('</dl>');
		lines.push('<dt>Date of Birth</dt>');
		lines.push('<dd>' + d.dob + '</dd>');
		lines.push('</dl>');
		lines.push('<dt>Gold medals</dt>');
		lines.push('<dd>' + d.gold + '</dd>');
		lines.push('</dl>');
		lines.push('<dt>Silver medals</dt>');
		lines.push('<dd>' + d.silver + '</dd>');
		lines.push('</dl>');
		lines.push('<dt>Bronze medals</dt>');
		lines.push('<dd>' + d.Bronze + '</dd>');
		lines.push('</dl>');
		lines.push('<dt>Personal best</dt>');
		lines.push('<dd>' + d.pb + '</dd>');
		lines.push('</dl>');
		lines.push('<dt>Other events</dt>');
		lines.push('<dd>' + d.ob + '</dd>');
		lines.push('</dl>');
		lines.push('<dt>height</dt>');
		lines.push('<dd>' + d.height + '</dd>');
		lines.push('</dl>');
		lines.push('<dt>weight</dt>');
		lines.push('<dd>' + d.weight + '</dd>');
		stats.append(lines.join(''));
	}
	
	function checkProximity(npc)
	{
		var activeZone = 80, dangerZone = 4;

		player.removeClass('activeZone');
		player.removeClass('dangerZone');
		stats.hide();
		if(!checkHorizontalProximity(npc, activeZone))
		{	
			return;
		}
		if(player[0].athleteData.laneNum < npc.athleteData.laneNum - 1 ||
			player[0].athleteData.laneNum > npc.athleteData.laneNum + 1)
		{
			return;
		}
		npc.scoreData.proxim = true;
		if(stats[0].npc !== npc)
		{
			populateStats(npc);
		}
		stats.show();
		if(player[0].athleteData.laneNum == npc.athleteData.laneNum)
		{
			npc.scoreData.risky = true;
			if(checkHorizontalProximity(npc, dangerZone))
			{
				npc.scoreData.trip = true;
				player.addClass('dangerZone');
			}
		}		
		player.addClass('activeZone');
		presentScore();
	}

	function activeNpcs()
	{
		var c;

		for(c in npcs)
		{
			if(npcs[c].athleteData.active)
			{
				return true;
			}
		}
		return false;
	}

	var i;

	i = setInterval(function() {
		$('.npc').each(function(index,el) {
			var l = $(el).offset().left;
			l -= 4;
			if(l + $(el).outerWidth() < 0)
			{
				updateScore(el);
				startAthlete(el);
				presentScore();
				return;
			}
			$(el).css('left', l + 'px');
			checkProximity(el);  
		});
	}, 40);

	i = setInterval(function() {
		var l = $('#lanes');

		if(athletes.length || activeNpcs())
		{
			return;
		}
		if(l.offset().left < player.offset().left)
		{
			clearInterval(i);
			gameOver();
		}
	}, 100);

	function createNPC()
	{
		var npc, index;

		index = npcs.length;
		$('.athletes').append('<span id="npc' + index + '"></span>');
		var npc = $('#npc' + index);
		npcs.push(npc[0]);
		startAthlete(npc[0]);
	}
	$('#athletes-data').hide();
	$('.athletes').append('<span id="player1"></span>');
	player = $('#player1');
	startPlayer(player[0]);
	createNPC();
	$('body').append('<p id="score"></p>');
	$('body').append('<div id="statsdisplay"></div>');
	stats = $('#statsdisplay');
	stats.hide();
	stats[0].npc = null;
	presentScore();
	}
);
