
var margin = {top: 20, right: 100, bottom: 100, left: 100};

var width = $(window).width() - margin.left - margin.right - 30,
    height =  $(window).height() - 2*margin.top - 2*margin.bottom - 20;

var svg;
var data;

var selected = [];
var selectedCnt = 0;

var links = [];

var selectedLine;
var deleteable = false;

$(document).ready(function(){

	svg = d3.select("#graph").append("svg")
	    .attr("width", width + margin.left + margin.right )
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append('g').attr('class','links')
  svg.append('g').attr('class','nodes')

	// d3.json("data.json", function(dataIn, err) {
	  data = dataIN;


	  //Organise data function
	  organiseData();
	
	  // Visualise Data
	  makeVis();

	});
  
function organiseData(){

}

function makeVis() {

  dd = d3.scaleLinear().domain([0 , 1]).range([margin.left , width])
  ee = d3.scaleLinear().domain([0 , 1]).range([margin.top , height])

  nodes = svg.select('.nodes').selectAll('.concept')
        .data(data)
        .enter().append('g')
        .attr('class','concept')
  nodes.append('rect')
        .attr('width', 90).attr('height', 40)
        .attr('x', function() { return dd( Math.random() ); })
        .attr('y',  function() { return ee( Math.random() ); })
        .attr('fill','#fff')
        .attr('stroke', function(d){
          if( d.Type == 'data' ){ return 'green'; }
          else{ return '#aaa'}
        })
        .attr('id', 'id0');
  nodes.append('text').text(function(d){ return d.id})
        .attr('transform', function(){
          rectSib = d3.select(this.parentNode).select('rect');
          x = parseInt( rectSib.attr('x') ) + 45;
          y = parseInt( rectSib.attr('y') ) + 22;
          return 'translate('+ x +','+ y +')';
        })
        .attr('text-anchor', 'middle')
        .attr('fill', function(d){
        })
        .call(wrap,80)


  d3.selectAll('.concept')
    .on('mouseup', function(d) {
         if( selectedCnt == 0) {
              selected[0] = d3.select(this).select('rect');
              selected[0].attr('fill', '#0022ff')
              selectedCnt = 1;
            }else if( selectedCnt == 1) {
              selected[1] = d3.select(this).select('rect');
              selected[1].attr('fill', '#0022ff')

              // check if link already exists
              p = { "source": selected[0].datum()["id"] , "target": selected[1].datum()["id"] , 'value': 0};
              console.log(getIndexofLinks(p))

              if ( getIndexofLinks(p) == -1 ) {
                makeConnection(p);
                saveConnection();
              }
              
              setTimeout( function(){ 
                selectedCnt = 0;                
                selected[0].attr('fill', '#fff');
                selected[1].attr('fill', '#fff');
              },600);
          } 
    })
    // .call(d3.drag().on("drag", function dragged(d) {
    //                   d3.select(this).attr("x", d.x = d3.event.x - 30)
    //                         .attr("y", d.y = d3.event.y - 15);
    //                 })
    //                .on('start', function(d){ 
    //                  if( selectedCnt == 0) {
    //                     selected[0] = d3.select(this);
    //                     selected[0].attr('fill', '#0022ff')
    //                  }else if( selectedCnt == 1) {
    //                     selected[1] = d3.select(this);
    //                     selected[1].attr('fill', '#0022ff')
    //                   }
    //                })
    //                .on('end', function(d){
    //                  if( selectedCnt == 0) {
    //                       selected[0] = d3.select(this);
    //                       // selected[0].attr('fill', '#0022ff')
    //                       selectedCnt = 1;
    //                     }else if( selectedCnt == 1) {
    //                       selected[1] = d3.select(this);
    //                       // selected[1].attr('fill', '#0022ff')

    //                       // check if link already exists
    //                       p = { "source": selected[0].datum()["id"] , "target": selected[1].datum()["id"] , 'value': 0};
    //                       console.log(getIndexofLinks(p))

    //                       if ( getIndexofLinks(p) == -1 ) {
    //                         makeConnection(p);
    //                         saveConnection();
    //                       }
                          
    //                       setTimeout( function(){ 
    //                         selectedCnt = 0;                
    //                         selected[0].attr('fill', '#fff');
    //                         selected[1].attr('fill', '#fff');
    //                       },600);
    //                   }
    //                })
    //               );
}


function makeConnection(p) {
  svg.select('g.links').append('line')
      .attr('x1', parseInt(selected[0].attr('x')) + 30)
      .attr('y1', parseInt(selected[0].attr('y')) + 15)
      .attr('x2', parseInt(selected[1].attr('x')) + 30)
      .attr('y2', parseInt(selected[1].attr('y')) + 15)
      .attr('stroke','#000').attr('stroke-width',3.5)
      .datum(p)
      .on('mouseup', function(){
        if( deleteable == false) {
          d3.select(this).attr('stroke','#0022ff')
          selectedLine = d3.select(this);
          deleteable = true;
        }else{
          d3.select(this).attr('stroke','#000')
          selectedLine = null;
          deleteable = false;                
        }
      })
}

function saveConnection() {
  var a = { "source":selected[0].datum()["id"] , "target":selected[1].datum()["id"] , "value": 0 }

  if( getIndexofLinks(a) == -1 ) {
    links.push(a)
  }
}
  
function deleteConnection(b) {
  
  toDel = getIndexofLinks(b.datum()); 
  if( toDel > 0 ) {
    links.splice(toDel, 1);
  }

}


function getIndexofLinks(z){
  indx = -1; 
  console.log(z)
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
    }
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
