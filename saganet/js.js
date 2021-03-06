
// red costs more
// black costs less. 

var margin = {top: 20, right: 100, bottom: 50, left: 100};

var width = $(window).width() - margin.left - margin.right - 30,
    height =  $(window).height() - 2*margin.top - 2*margin.bottom - 20;

var svg;
var data;

var selected = [];
var selectedCnt = 0;

var links = [];

var selectedLine;
var deleteable = false;

var GroupName;
var GroupScore = 0; 
var groupdScoreDiverse = 0;

// GRID
var  dd = d3.scaleLinear().domain([1,9]).range([0 , width])
var  ee = d3.scaleLinear().domain([1,8]).range([margin.top , height + margin.top + margin.bottom + 20])

$(document).ready(function(){

	svg = d3.select("#graph").append("svg")
	    .attr("width", width + margin.left + margin.right )
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append('g').attr('class','links')
  svg.append('g').attr('class','nodes')
  svg.append('g').attr('class','events')

  // d3.json("data.json", function(dataIn, err) {
  data = dataIN;

  //Organise data function
  organiseData();

  // Visualise Data
  makeVis();
});
  
function organiseData(){

  data = data.filter(function(d){
     return (d.Type == 'concept' || d.Type == 'event')
  })
  data.forEach(function(k,i){
    k['connectedLinksCnt'] = 0
  });
}

function makeVis() {

  dataNd = data.filter(function(d){   return (d.Type == 'concept' )  })
  nodes = svg.select('.nodes').selectAll('.concept')
        .data(dataNd)
        .enter().append('g')
        .attr('class','concept')

  dataEvnts = data.filter(function(d){   return (d.Type == 'event')  })
  evnts = svg.select('.events').selectAll('.event')
        .data(dataEvnts)
        .enter().append('g')
        .attr('class','event')

  drawHex(nodes);
  drawCircl(evnts)  

  nodes.append('text').text(function(d){ return d.id; })
        .attr('transform', function(){
          rectSib = d3.select(this.parentNode).select('path').attr('transform');
          return rectSib;
        })
        .attr('text-anchor', 'middle')
        .attr('fill', function(d){ return textColor(d); })
        .call(wrap,70)
  evnts.append('text').text(function(d){ return d.id; })
        .attr('transform', function(){
          rectSib = d3.select(this.parentNode).select('circle').attr('transform');
          return rectSib;
        })
        .attr('text-anchor', 'middle')
        .attr('fill', function(d){ return '#000'}) // textColor(d); })
        .style('visibility','hidden')
        .call(wrap,80)

  d3.selectAll('.concept')
    .on('mouseup', function(d) {
      interAct( d3.select(this), 'path' )
    });
  
  d3.selectAll('.event')
    .on('mouseup', function(){
        d3.select(this).classed('active', true);
        d3.select(this).moveToFront();
        d3.select(this).datum()['pos_x'] = 2.2;
        d3.select(this).datum()['pos_y'] = 1;
        d3.select(this).select('text').style('visibility','visible')
        d3.select(this)
                    .transition()
                    .attr('transform', function(d,i){ 
                      return 'translate('+ (dd(2.5) )+','+ ( ee(1) - 20 )+')' 
                    })
                    .select('circle')
                    .attr('fill','#fff')
                    .attr('stroke','#00bcd4')

      d3.selectAll('.event.active')
      .on('mouseup', function(){ interAct( d3.select(this), 'circle') } );

    });
    function interAct(aa, elem) {
      if( selectedCnt == 0) {
        selected[0] = aa.select(elem);
        selected[0].attr('fill', hexColorHighLight() )
        aa.select('text').attr('fill', textColorHighLight() );

        selectedCnt = 1;
      }else if( selectedCnt == 1) {
        selected[1] = aa.select(elem);
        selected[1].attr('fill', hexColorHighLight() )
        aa.select('text').attr('fill', textColorHighLight() );

        // check if link already exists
        p = { "source": selected[0].datum()["id"] , "target": selected[1].datum()["id"] , 'value': 0};

        if ( getIndexofLinks(p) == -1  && (selected[0].datum()['id'] != selected[1].datum()['id'] ) ) {
          selected[0].datum()['connectedLinksCnt']++;
          selected[1].datum()['connectedLinksCnt']++;
          makeConnection(p);
          saveConnection();
        }
          
        setTimeout( function(){ 
          selectedCnt = 0;                
          selected[0].attr('fill', function(d){ return hexColor(d); });
          selected[1].attr('fill', function(d){ return hexColor(d); });
            
          d3.select(selected[1].node().parentNode).select('text').attr('fill', function(d){ return textColor(d);})
          d3.select(selected[0].node().parentNode).select('text').attr('fill', function(d){ return textColor(d);})
        
        },500);
      } 
    }
}

function makeConnection(p) {
  svg.select('g.links').append('line')
    .attr('x1', dd(selected[0].datum()['pos_x']) + selected[0].datum()['jitt'].jitX)
    .attr('y1', ee(selected[0].datum()['pos_y']) + selected[0].datum()['jitt'].jitY)
    .attr('x2', dd(selected[1].datum()['pos_x']) + selected[1].datum()['jitt'].jitX)
    .attr('y2', ee(selected[1].datum()['pos_y']) + selected[1].datum()['jitt'].jitY)
    .attr('stroke','#000').attr('stroke-width',3.5)
    .datum(p)
    .on('mouseup', function(){
      if( deleteable == false) {
        d3.select(this).attr('stroke','#0022ff')
        selectedLine = d3.select(this);
        deleteable = true;
        d3.select('#deleteBtn').classed('show',true)

      }else{
        d3.select(this).attr('stroke','#000')
        selectedLine = null;
        deleteable = false;                
        d3.select('#deleteBtn').classed('show',false)
      }
  })
}

function saveConnection() {
  GroupName = d3.select('input#groupName').property('value');

  var a = { "source":selected[0].datum()["id"] , "target":selected[1].datum()["id"] , "value": 0 }
  var nod = { "source":selected[0] , "target":selected[1] }
 
  if( getIndexofLinks(a) == -1 ) {
    links.push(a);
    updateScore(nod);
    download('t', 'data_'+ GroupName +'_'+(new Date).getTime()+'.txt', 'text/plain');
  }
}

// when delete and crossing over the treshhold some points get lost
function updateScore(newLink, removePoints ){
  groupScore = links.length;
  d3.select('#groupScore-links').html( groupScore)

  if( removePoints != true){
    groupdScoreDiverse += scoreNodeConnectivty(newLink.source.datum()) +  scoreNodeConnectivty(newLink.target.datum());
  }else{
    groupdScoreDiverse -= scoreNodeConnectivty(newLink.source.datum()) +  scoreNodeConnectivty(newLink.target.datum());
  }
  d3.select('#groupScore-nodes').html(scoreNodeConnectivty(newLink.source.datum()) +  scoreNodeConnectivty(newLink.target.datum()))

  // groupdScore-interdiscipline = checkInterdisciplinaryNodes(newLink);
  d3.select('#groupScore-total').html((groupdScoreDiverse + groupScore ) )
}

/* Max connectivity: 27 is all nodes count - or 16 in more relative terms
  If the node is already traversed 
  13-16 1 pnts  0.5
  10-12   1 pnts  1 
  5-9     4 pnts  4
  0-5     5 pnts   7.5 */
function scoreNodeConnectivty(a) {
  if ( a['level'] == 1 ){
    if( a['connectedLinksCnt'] < 3 ){
      return 2;
    }else if( a['connectedLinksCnt'] < 8 ) {
      return 1;
    }else if( a['connectedLinksCnt'] < 13 ) {
      return 1;
    }else if( a['connectedLinksCnt'] ) {
      return 0;
    }
  } else if(  a['oblig'] == 'TRUE' ){
    if( a['connectedLinksCnt'] < 3 ){
      return 5;
    }else if( a['connectedLinksCnt'] < 8 ) {
      return 4;
    }else if( a['connectedLinksCnt'] < 13 ) {
      return 1.5;
    }else if( a['connectedLinksCnt'] ) {
      return 1;
    }
  } else{
    if( a['connectedLinksCnt'] < 3 ){
      return 4;
    }else if( a['connectedLinksCnt'] < 8  ) {
      return 3;
    }else if( a['connectedLinksCnt'] < 13 ) {
      return 1.5;
    }else if( a['connectedLinksCnt'] ) {
      return 1;
    }
  }
}

function download(text, name, type) {
  var a = document.getElementById("a");

  obj = { 'name': GroupName,
          'score': d3.select('#groupScore-total').html(),
          'timestamp': (new Date).getTime(),
          'links': links, 
        }

  tt = JSON.stringify(obj)

  var file = new Blob([tt], {type: type});
  a.href = URL.createObjectURL(file);
  a.download = name;
}

function deleteConnection(b) {

  toDel = getIndexofLinks(b.datum()); 
  if( toDel >= 0 ) {
    links.splice(toDel, 1);

    source = d3.select('.nodes').selectAll('.concept').filter( function(d) {
      return d.id == b.datum()['source']
    })
    if( source.nodes().length == 0 ){
      source = d3.select('.events').selectAll('.event').filter( function(d) {
        return d.id == b.datum()['source']
      })
    }
    console.log(source.nodes())

    source.datum()['connectedLinksCnt']--;

    target = d3.select('.nodes').selectAll('.concept').filter( function(d) {
      return d.id == b.datum()['target']
    })
    if( target.nodes().length == 0 ){
      source = d3.select('.events').selectAll('.event').filter( function(d) {
        return d.id == b.datum()['target']
      })
    }
    target.datum()['connectedLinksCnt']--;

    updateScore({'source': source, "target": target}, true );
    download('t', 'data_'+ GroupName +'_'+(new Date).getTime()+'.txt', 'text/plain');

  }
}

function getIndexofLinks(z){
  indx = -1; 
  links.forEach( function(tt, index) {
    if( tt.source == z.source && tt.target == z.target
      || tt.target == z.source && tt.source == z.target ) {
        indx = index;
      }
    })  
    return indx;
}

function removeConnection() {
  if( deleteable == true ){
    deleteConnection(selectedLine);
    selectedLine.remove();

    d3.select('#deleteBtn').classed('show',false)
    d3.select('.info .msg').html('Link Deleted..')
    d3.select('.info .msg').classed('sendMsg', true)

    setTimeout( function(){
      d3.select('.info .msg').classed('sendMsg', false);
    }, 1200)
  }
}

function textColorHighLight(){
  return '#fff';
}

function hexColorHighLight(){
  return '#0022ff';
}

function textColor(d){
  if( d.oblig == 'TRUE' ){ return "#fff"; }
  else if( d.level == 1 ){ return "#fff"; }
  else { return '#082b1a' }
}

function hexColor(d){
  if( d.oblig == 'TRUE' ){ return "rgba(252,179,26,0.9)"; }
  else if( d.level == 1 ){ return "#082b1a"; }
  else { return '#fff' }
}

function drawHex(nodes) {

  var h = (Math.sqrt(3)/2),
    radius = 40,
    xp =  0,
    yp =  0,
    hexagonData = [
      { "x": radius+xp,   "y": yp}, 
      { "x": radius/2+xp,  "y": radius*h+yp},
      { "x": -radius/2+xp,  "y": radius*h+yp},
      { "x": -radius+xp,  "y": yp},
      { "x": -radius/2+xp,  "y": -radius*h+yp},
      { "x": radius/2+xp, "y": -radius*h+yp}
    ];

  drawHexagon = 
  d3.line().x(function(d) { return d.x; })
          .y(function(d) { return d.y; })
          .curve( d3.curveLinearClosed )

  nodes.append('path')
        .attr("d", drawHexagon(hexagonData))
        .attr('transform', function(d,i){ 
          jitX = jitter();
          jitY = jitter();
          d['jitt'] = { "jitX": jitX, "jitY": jitY };
          return 'translate('+ (dd(d.pos_x) + jitX )+','+ (ee(d.pos_y) + jitY)+')' 
        })
        .attr('fill', function(d){ 
          if( d.oblig == 'TRUE' ){ return "rgba(252,179,26,0.9"; }
          else if( d.level == 1 ){ return "#082b1a"; }
          else { return '#fff' }
        })
        .attr('stroke', function(d){
          if( d.Type == 'data' ){ return 'green'; }
          else{ return '#aaa'}
        })
}

function drawCircl(evnts) {

  evnts.append('circle')
    .attr('r', 51)
    .attr('transform', function(d,i){ 
      jitX = 0 ;
      jitY = 15;
      d['jitt'] = { "jitX": jitX, "jitY": jitY };
      return 'translate('+ (dd(d.pos_x-0.3) + jitX )+','+ (ee(d.pos_y) + jitY)+')' 
    })
    .attr('fill', function(d){ 
        return '#00bcd4' 
    })
    .attr('stroke', function(d){
      return '#fff'
    })
    .attr('stroke-width', 1.5)
    .classed('active',false)
}


d3.selection.prototype.moveToFront = function() {  
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};
d3.selection.prototype.moveToBack = function() {  
    return this.each(function() { 
        var firstChild = this.parentNode.firstChild; 
        if (firstChild) { 
            this.parentNode.insertBefore(this, firstChild); 
        } 
    });
};

function jitter(){
  return Math.random()*17;
}

// http://bl.ocks.org/mbostock/7555321
// Wrap text labels - a bit modified
//call with text... .call(wrap, MAXLABELWIDTH)
function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
    	dy = 0, // CHANGED from dy = parseFloat(text.attr("dy")), since it might not be defined already
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
       //  Changed the  ++lineNumber * lineHeight TO lineHeight only why increase the line height everytime?
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy",lineHeight + dy + "em").text(word);
      }
    }
  });
}
