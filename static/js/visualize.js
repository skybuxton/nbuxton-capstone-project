require(['knockout','jquery','d3','topojson','queue','underscore', 'bootstrap'],
    function (ko,$,d3,topojson,queue,_,bootstrap)
{
    "use strict";

    $(function ()
    {


        var barData = null; // hack
        // Setup word stuff
	    var regions = ["East Coast","West Coast","Midwest","Southern"];
      	var width = 960,
		    height = 420;
		
		var barChartWidth = 120;
        var barChartHeight = 100;
        console.log("loading visulaize.js");
 
		var path = d3.geo.path();
		var statesToRegion = d3.map();

		var svg = d3.select("#map").append("svg")
		    .attr("width", width)
		    .attr("height", height);

        
        	queue()
			    .defer(d3.csv, "data/query_result.csv")
			    .await(dataLoaded);

        // // bar
        // // Enter data (this could have been imported)
        // const socialMedia = [
        //     {
        //         month: 'April',
        //         counts: { Facebook: 7045, YouTube: 4816, Twitter: 4717, Instagram: 96 }
        //     },
        //     {
        //         month: 'May',
        //         counts: { Facebook: 11401, YouTube: 1708, Twitter: 10433, Instagram: 129 }
        //     },
        //     {
        //         month: 'June',
        //         counts: { Facebook: 16974, YouTube: 3190, Twitter: 9874, Instagram: 471 }
        //     }
        // ];

        // // Add a total value for each month
        // const smTotal = socialMedia.map(d => {
        //     const counts = d3.entries(d.counts);
        //     const total = d3.sum(counts, c => c.value);
        //     return { month: d.month, counts, total };
        // });

        // // create a Y scale for the data
        // const scaleY = d3
        //     .scaleLinear()
        //     .range([0, 200])
        //     .domain([0, d3.max(smTotal, d => d.total)]);

        // // create a color scale for the data where Facebook is red
        // const scaleColor = d3
        //     .scaleOrdinal()
        //     .range(['#FE4A49', '#cccccc', '#dddddd', '#eeeeee'])
        //     .domain(['Facebook', 'YouTube', 'Twitter', 'Instagram']);

        // // Select the figure element
        // const stack = d3.select('.stack');

        // // Add a div for each month
        // const group = stack
        //     .selectAll('.group')
        //     .data(smTotal)
        //     .enter()
        //     .append('div')
        //     .attr('class', 'group');

        // // Add a block for each social media type
        // const block = group
        //     .selectAll('.block')
        //     .data(d => d.counts)
        //     .enter()
        //     .append('div')
        //     .attr('class', 'block')
        //     // And scale the height of the box based on the value
        //     .style('height', d => `${scaleY(d.value)}px`)
        //     // Scale the color based on the social media type
        //     .style('background-color', d => scaleColor(d.key));

        // // Add a month label
        // const label = group
        //     .append('text')
        //     .text(d => d.month)
        //     .attr('class', 'label');

        // // Add a total count label
        // const count = group
        //     .append('text')
        //     .text(d => d3.format('0.2s')(d.total))
        //     .attr('class', 'count');
        // // end bar

        function monthNumToName(mn) {
            var d = {
                '01': 'Jan',
                '02': 'Feb',
                '03': 'Mar',
                '04': 'Apr',
                '05': 'May',
                '06': 'Jun',
                '07': 'Jul',
                '08': 'Aug',
                '09': 'Sep',
                '10': 'Oct',
                '11': 'Nov',
                '12': 'Dec'
            }
            return d[mn];
        }

        function monthNameToNum(mn) {
            var d = {
                'jan': '01',
                'feb': '02',
                'mar': '03',
                'march': '03',
                'apr': '04',
                'april': '04',
                'may': '05',
                'jun': '06',
                'june': '06',
                'jul': '07',
                'july': '07',
                'aug': '08',
                'sep': '09',
                'sept': '09',
                'oct': '10',
                'nov': '11',
                'dec': '12'
            }
            // if (d[mn] === undefined) {
            //     console.log(mn);
            // }
            return d[mn];
        }


        function populateBarCharts(barchartData) {
            var margin = {top: 20, right: 160, bottom: 35, left: 30};
            // var width = 760 - margin.left - margin.right, // 960

            var width = 760 - margin.left - margin.right,
                height = 500 - margin.top - margin.bottom;



            var svgContainer = d3.select("#barchart")
                svgContainer.html("");    // if(svg.select('svg')) {
                //     svg.select('svg').remove();
                // }

                var contWidth = $('#barchart').width();
                // console.log("size = " + )
               var svg = svgContainer.append("svg")
              .attr("width", contWidth + (margin.left + margin.right))
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var data = barchartData;

            var parse = d3.time.format("%Y").parse;

            var minorCorrectionsOn = $('#minorCorrectionCheck').is(':checked');
            var majorCorrectionsOn = $('#majorCorrectionCheck').is(':checked');
            var updateCheckOn = $('#updateCheck').is(':checked');

            var clist = [];
            var colors = [];
            var labels = [];
            if(minorCorrectionsOn) {
              clist.push("minorCorrections");
              colors.push("#d25c4d");
              labels.push("Minor Corrections")
            }
            if(majorCorrectionsOn) {
              clist.push("majorCorrections");
              colors.push("#b33040")
              labels.push("Major Corrections")
            }
            if(updateCheckOn) {
              clist.push("updates")
              colors.push("f2b447")
              labels.push("Breaking News")
            }

            // Transpose the data into layers
            var dataset = d3.layout.stack()(clist.map(function(ctype) {
              return data.map(function(d) {
                return {x: d.month, y: +d[ctype]};
              });
            }));


            // Set x, y and colors
            var x = d3.scale.ordinal()
              .domain(dataset[0].map(function(d) { return d.x; }))
              .rangeRoundBands([10, width-10], 0.02);

            var y = d3.scale.linear()
              .domain([0, d3.max(dataset, function(d) {  return d3.max(d, function(d) { return d.y0 + d.y; });  })])
              .range([height, 0]);


            // Define and draw axes
            var yAxis = d3.svg.axis()
              .scale(y)
              .orient("left")
              .ticks(5)
              .tickSize(-width, 0, 0)
              .tickFormat( function(d) { return d } );

            var xAxis = d3.svg.axis()
              .scale(x)
              .orient("bottom")
              // .tickFormat(d3.time.format("%Y"));

            svg.append("g")
              .attr("class", "y axis")
              .call(yAxis);

            svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis);


            // Create groups for each series, rects for each segment 
            var groups = svg.selectAll("g.cost")
              .data(dataset)
              .enter().append("g")
              .attr("class", "cost")
              .style("fill", function(d, i) { return colors[i]; });

            var rect = groups.selectAll("rect")
              .data(function(d) { return d; })
              .enter()
              .append("rect")
              .attr("x", function(d) { return x(d.x); })
              .attr("y", function(d) { return y(d.y0 + d.y); })
              .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
              .attr("width", x.rangeBand())
              .on("mouseover", function() { tooltip.style("display", null); })
              .on("mouseout", function() { tooltip.style("display", "none"); })
              .on("mousemove", function(d) {
                var xPosition = d3.mouse(this)[0] - 15;
                var yPosition = d3.mouse(this)[1] - 25;
                tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
                tooltip.select("text").text(d.y);
              });


            // Draw legend
            // var legend = svg.selectAll(".legend")
            //   .data(colors)
            //   .enter().append("g")
            //   .attr("class", "legend")
            //   .attr("transform", function(d, i) { return "translate(30," + i * 19 + ")"; });
             
            // legend.append("rect")
            //   .attr("x", width - 18)
            //   .attr("width", 18)
            //   .attr("height", 18)
            //   .style("fill", function(d, i) {return colors.slice()[i];});
             
            // legend.append("text")
            //   .attr("x", width + 5)
            //   .attr("y", 9)
            //   .attr("dy", ".35em")
            //   .style("text-anchor", "start")
            //   .text(function(d, i) { 
            //     return labels[i];
            //     // switch (i) {
            //     //   case 0: return "Major Corrections";
            //     //   case 1: return "Minor Corrections";
            //     //   case 2: return "Breaking News Updates";
            //     // }
            //   });


            // Prep the tooltip bits, initial display is hidden
            var tooltip = svg.append("g")
              .attr("class", "tooltip")
              .style("display", "none");
                
            tooltip.append("rect")
              .attr("width", 30)
              .attr("height", 20)
              .attr("fill", "white")
              .style("opacity", 0.5);

            tooltip.append("text")
              .attr("x", 15)
              .attr("dy", "1.2em")
              .style("text-anchor", "middle")
              .attr("font-size", "12px")
              .attr("font-weight", "bold");

        }


        function top10words(dict) {
            var items = Object.keys(dict).map(function(key) {
              return [key, dict[key]];
            });

            // Sort the array based on the second element
            items.sort(function(first, second) {
              return second[1] - first[1];
            });

            // Create a new array with only the first 5 items
            var top10 = items.slice(0, 10);
            var ret = [];
            for (var idx in top10) {
                var actualWord = top10[idx][0];
                var wordObj = {
                    "commonWord": actualWord,
                    "rank": idx,
                    "frequentAppears": []
                };
                ret.push(wordObj);
            }
            return ret;
        }

        function barDictToList(dict) {
            var items = Object.keys(dict).map(function(key) {
              return [key, dict[key]];
            });

            // Sort the array based on the key
            items.sort(function(first, second) {
              return second[0] < first[0];
            });
            return items;
        }

        function transformToBarData(correctionData) {
            var minorCorrectionData = {};
            var majorCorrectionData = {};
            var updateData = {};

            for(var idx in correctionData) {
                var item = correctionData[idx];
                // console.log(item);
                var text = item["body"];
                var correctionType = item["correction_type"];
                var year = item["year"];
                var month = item["month"];
                var mnum = monthNameToNum(month);
                if(mnum !== undefined) {
                    var ymkey = year + "-" + monthNameToNum(month);

                    var dict = updateData;
                    if(correctionType == 2) {
                        dict = minorCorrectionData;
                    } else if (correctionType == 1) {
                        dict = majorCorrectionData;
                    } else {
                        dict = updateData;
                    }

                    if (ymkey in dict) {
                        dict[ymkey] = dict[ymkey] + 1;
                    } else {
                        dict[ymkey] = 1;
                    }
                }
            }


            var result = {
                "Minor Corrections": barDictToList(minorCorrectionData),
                "Major Corrections": barDictToList(majorCorrectionData),
                "Breaking News Updates": barDictToList(updateData)
            }
            return result;
        }

        function transformToLyricData(corectionData) {
            var minorCorrectionWords = {};
            var majorCorrectionWords = {};
            var updateWords = {};

            var stopWords = ["isn't", 'just', 'wouldn', 'not', "hadn't", 'yours', 'i', 'then', 'to', 'she', 'can', "you'd", "weren't", 'or', "you're", 'd', 'who', 'her', 'these', 'how', 'do', 'was', 'm', 'and', 'because', 'won', 'am', 'until', 'the', 'our', 'this', 'such', 'herself', 'didn', 'for', 'does', 'mustn', 'but', 'off', "should've", 'did', 'by', 'his', 'few', 'their', "that'll", 'out', 'shouldn', 'haven', 'at', 'when', 'its', "won't", 'no', 'why', 'above', 'over', 'if', 'now', 'don', 'had', 'you', 'be', 'o', 'each', 'll', 'him', 'more', 'aren', 'ourselves', 'once', 'further', 'as', 're', 'a', 'hers', 'have', 'on', 'whom', 'mightn', 'in', 'has', 'hasn', 'shan', 'been', 'which', 'yourself', "don't", 'weren', 'were', 'they', 'again', 'both', 'while', 'me', 'my', 'up', 'own', 'same', 'your', 'before', 'an', 'needn', 'it', 'most', 'any', 'doing', 'so', 'with', 'through', 'after', "wouldn't", "needn't", 'having', 'what', 'hadn', 'into', "she's", 'he', 'all', "you'll", 'we', 'during', "haven't", 'being', "doesn't", 'below', 'under', 'than', "couldn't", 'ours', 't', 'down', "shouldn't", "mightn't", 'wasn', 'doesn', 've', 'yourselves', "wasn't", 'couldn', 'about', 'here', 'where', 'ain', 'from', 'against', 'nor', 'too', 'is', 'only', 'itself', 'himself', 'them', 's', 'some', "didn't", "it's", 'will', "you've", 'there', 'between', 'are', 'myself', 'y', 'theirs', 'that', 'those', 'other', 'should', "aren't", 'isn', 'of', 'very', "hasn't", 'ma', 'themselves', "mustn't", "shan't", 'â€”'];
            stopWords.push("said");
            stopWords.push("would");
            stopWords.push("one");
            stopWords.push("state");
            stopWords.push("new");
            stopWords.push("also");
            stopWords.push("said.");
            stopWords.push("u.s.");

            var prevWord = null;
            for(var idx in corectionData) {
                var item = corectionData[idx];
                // console.log(item);
                var text = item["body"];
                var correctionType = item["correction_type"];
                // console.log(correctionType);
                var allWordsInBody = text.split(" ");
                var dict = minorCorrectionWords;
                if(correctionType == 1) {
                    dict = minorCorrectionWords;
                } else if(correctionType == 2) {
                    dict = majorCorrectionWords;
                } else {
                    dict = updateWords;
                }
                for (var wordIdx in allWordsInBody) {
                    var word = allWordsInBody[wordIdx];
                    word = word.toLowerCase();
                    word = word.replace(/[^a-z]/gi, '');
                    if(word != '') {
                        if(stopWords.indexOf(word) == -1) {
                            if(prevWord != null) {
                                var newWord = prevWord + "_" + word;
                                if (newWord in dict) {
                                    dict[newWord] = dict[newWord] + 1;
                                } else {
                                    dict[newWord] = 1;
                                }
                            }
                            prevWord = word;
                        }
                    }
                }
            }
            // console.log(updateWords);
            // console.log(top10words(updateWords));
            // console.log(minorCorrectionWords);
            // console.log(majorCorrectionWords);


            var result = {
                "Minor Corrections": {
                    "commonWords": top10words(minorCorrectionWords),
                    // "numArticles": 0
                },
                "Major Corrections": {
                    "commonWords": top10words(majorCorrectionWords),
                    // "numArticles": 0
                },
                "Breaking News Updates": {
                    "commonWords": top10words(updateWords),
                    // "numArticles": 0
                },
            }
            return result
        }

        function filterYear(bardata, year) {
            var barDataDict = {};
            for (var idx in bardata) {
                var item = bardata[idx];
                barDataDict[item[0]] = item[1];
            }

            var newBarData = [];
            for (var i = 1; i<=12; i++) {
                var key = year + "-" + String(i).padStart(2, "0");
                if(key in barDataDict) {
                    var monthName = monthNumToName(key.substr(-2));
                    newBarData.push([monthName, barDataDict[key]]);
                } else {
                    var monthName = monthNumToName(key.substr(-2));
                    newBarData.push([monthName, 0]);
                }
            }
            return newBarData;
        }



        function updateBarChart() {
            var correctionType = null;
            var year = null;

            var radios = document.getElementsByName('barchart_radio');
            for (var i = 0, length = radios.length; i < length; i++)
            {
             if (radios[i].checked)
             {
              // do whatever you want with the checked radio
              // alert(radios[i].value);
              correctionType = radios[i].value;

              // only one radio can be logically checked, don't check the rest
              break;
             }
            }

            var radios = document.getElementsByName('barchart_year');
            for (var i = 0, length = radios.length; i < length; i++)
            {
             if (radios[i].checked)
             {
              // do whatever you want with the checked radio
              // alert(radios[i].value);
              year = radios[i].value;

              // only one radio can be logically checked, don't check the rest
              break;
             }
            }

            var data = [];
            for (var i = 1; i<=12; i++) {
                var key = year + "-" + String(i).padStart(2, "0");
                var monthName = monthNumToName(key.substr(-2));
                var majorNum = 0;
                var minorNum = 0;
                var breakingNum = 0;

                // console.log(barData['Minor Corrections']);
                var minorBarDataDict = {};
                for (var idx in barData['Minor Corrections']) {
                    var item = barData['Minor Corrections'][idx];
                    minorBarDataDict[item[0]] = item[1];
                }

                var majorBarDataDict = {};
                for (var idx in barData['Major Corrections']) {
                    var item = barData['Major Corrections'][idx];
                    majorBarDataDict[item[0]] = item[1];
                }

                var breakingBarDataDict = {};
                for (var idx in barData['Breaking News Updates']) {
                    var item = barData['Breaking News Updates'][idx];
                    breakingBarDataDict[item[0]] = item[1];
                }

                if(key in minorBarDataDict) {
                    minorNum = minorBarDataDict[key];
                }
                if(key in majorBarDataDict) {
                    majorNum = majorBarDataDict[key];
                }

                if(key in breakingBarDataDict) {
                    breakingNum = breakingBarDataDict[key];
                }
                data.push({
                    "month": monthName, 
                    "minorCorrections": String(minorNum),
                    "majorCorrections": String(majorNum),
                    "updates": String(breakingNum)
                });
            }
            populateBarCharts(data);
        }

        window.addEventListener('resize', updateBarChart);

        function dataLoaded(error, correctionData) {
            $('#big-spinner').show();
            if(error) {
                console.log(error);
            } else {
                console.log("no errr")
            }
            var res = transformToLyricData(correctionData);
            barData = transformToBarData(correctionData);


            createWordBarGraphs(res);
            buildTopWordLists(res);
            renderWordBarCharts(res);
            initRegionChecks(res);

            updateBarChart();

            $(".barchart_radio").change(function() {
                updateBarChart();
            });
            $(".barchart_year").change(function() {
                updateBarChart();
            });
            $('#big-spinner').hide();
        }

        function initRegionChecks(lyricData){
        	$("#minorCorrectionCheck").change(function() {
                updateBarChart();
                if(this.checked) {
                   handleChecked('Minor Corrections',lyricData);
                   $("#minorCorrectionFreq").removeClass("wordFade");
                } else {
                   handleUnChecked('Minor Corrections',lyricData);
                   $("#minorCorrectionFreq").addClass("wordFade");
                }
            });
            $("#majorCorrectionCheck").change(function() {
                updateBarChart();
                if(this.checked) {
                   handleChecked('Major Corrections',lyricData);
                   $("#majorCorrectionFreq").removeClass("wordFade");
                } else {
                   handleUnChecked('Major Corrections',lyricData);
                   $("#majorCorrectionFreq").addClass("wordFade");
           
                }
            });
            $("#updateCheck").change(function() {
                updateBarChart();
                if(this.checked) {
                    handleChecked('Breaking News Updates',lyricData);
                    $("#updatesFreq").removeClass("wordFade");
                } else {
                    handleUnChecked('Breaking News Updates', lyricData);
                    $("#updatesFreq").addClass("wordFade");
           
                }
            });
        }

        function handleChecked(region, lyricData){
            var words = lyricData[region].commonWords;
                  for(var i=0;i<words.length;i++){
                  	words[i].rank = words[i].rank_orig;
                  }
                renderWordBarCharts(lyricData);
        }

        function handleUnChecked(region, lyricData){
            var words = lyricData[region].commonWords;
                  for(var i=0;i<words.length;i++){
                  	words[i].rank_orig = words[i].rank;
                  	words[i].rank = 21;
                  }
                  renderWordBarCharts(lyricData);
        }

        function renderWordBarCharts(lyricData){

            var words = createWordUnion(lyricData);
            for (var word in words){
            	renderWordBars(word,words[word]);
            }   
        }

        function createWordBarGraphs(lyricData) {
        	
            var words = createWordUnion(lyricData);
             for (var word in words){
            	d3.select("#wordBars").append("li").append("svg")
        	                .attr("width", barChartWidth)
        	                .attr("height", barChartHeight)
        	                .attr("id", word)
        	                .attr("class", "bars");

            }  

        }

        function renderWordBars(word,wordData){
        	
           var barWidth = barChartWidth/wordData.length;
           var barGraph = d3.select("#"+word);
           
           var hiddenCount = 0;
           for(var i=0;i<wordData.length;i++){
               var data = wordData[i];
               if(data.rank == 21){
               	    hiddenCount++;
               }
           }

           var x = d3.scale.linear().domain([0, wordData.length]).range([0, barChartWidth]);
           var x1 = d3.scale.linear().domain([0, wordData.length-hiddenCount]).range([0,barChartWidth-(hiddenCount*barWidth)]);
  	       var y = d3.scale.linear().domain([21, 1])
          			  .range([0, barChartHeight]);

      		var barGroup = barGraph.selectAll("g");
    	    if(barGroup.empty()){
    		    barGroup = barGraph.append("g");
            // barGroup.on("click",function(d){handleBarChartClicked(wordData);});
    		    
    	    }
      	
      	  var bars = barGroup.selectAll("rect").data(wordData,function(d){return d.region;});
      	
      	  bars
      	   .enter()
      	   .append("rect")
      	   .attr("x", function(d, i) { return x(i); })
      	   .attr("y",  function(d) { return barChartHeight; })
             .attr("height", function(d) { return y(d.rank); })
      	   .attr("width", barChartWidth/3)
      	   .attr("stroke", "black")
      	   .attr("class", function(d){
                  if(d.region === "Minor Corrections")
                  	return "minor-correction";
                  if(d.region === "Major Corrections")
                  	return "major-correction";
                  if(d.region === "Breaking News Updates")
                  	return "update-correction";
      	    });

             var updatedIndex = 0;
             bars.transition().duration(1000)
      	     .attr("y", function(d) { return barChartHeight - y(d.rank); })
               .attr("height", function(d) { return y(d.rank); })
               .attr("x", function(d,i){ var result = (d.rank < 21) ? x1(updatedIndex++) : x(i); return result});

             

             var wordText = barGroup.selectAll("text");

             if(wordText.empty()){
      	       barGroup.append("text")
                   // .attr("x", 0)
                   .attr("y", barChartHeight + 15)
                   .attr("class", "barWord")
                   .text(word.replace("_", " "))
                   .style("fill", "black")
                   .style("text-align", "center")
                   .style("text-anchor", "beginning")
                   .style("font-size", 12)
                   .style("stroke", "black");
         }
         else{
         	if(wordData.length-hiddenCount == 0){
         		wordText.attr("class", "barWord wordFade");
         	} else {
         		wordText.attr("class", "barWord");
         	}
         }
        	
        }

 
        

        function createWordUnion(lyricData){
        	var words = {};
        	var minorCorrectionCommonWords = lyricData["Minor Corrections"].commonWords;
            var majorCorrectionCommonWords = lyricData["Major Corrections"].commonWords;
            var updateCommonWords = lyricData["Breaking News Updates"].commonWords;

            for (var i=0; i<minorCorrectionCommonWords.length;i++){
                 var word = minorCorrectionCommonWords[i];
                 word.region = "Minor Corrections";
                 words[word.commonWord] = [word];
            }
            
            for (var i=0;i<majorCorrectionCommonWords.length;i++){
            	var word = majorCorrectionCommonWords[i];
            	word.region = "Major Corrections";
            	if(words[word.commonWord]){
            		words[word.commonWord].push(word);
            	}
            	else {
            		words[word.commonWord] = [word];
            	}
            }
            for (var i=0;i<updateCommonWords.length;i++){
            	var word = updateCommonWords[i];
            	word.region = "Breaking News Updates";
            	if(words[word.commonWord]){
            		words[word.commonWord].push(word);
            	}
            	else {
            		words[word.commonWord] = [word];
            	}
            }

            return words;
        }

        // function handleBarChartClicked(wordData){
            
        //     $("#minorCorrectionFreq").html("");
        //     $("#majorCorrectionFreq").html("");
        //     $("#updatesFreq").html("");
        	
        //     for(var i=0;i<wordData.length;i++){
        // 		var word = wordData[i];
        // 		var frequentAppears = word.frequentAppears;
        // 		if(frequentAppears.length > 10){
        // 			frequentAppears = _.first(frequentAppears, [10]);
        // 		}
        //         frequentAppears = _.uniq(frequentAppears);
        //         console.log(frequentAppears);
        // 		var frequentAppearsStr = frequentAppears.join();
        // 		var commonWord = word.commonWord;
        //         if(word.region === 'Midwest'){
        //           $("#midwestFreq").html("In the "+"<span class='midwest'>"+"Midwest</span>, <span class='wordHover'>"+commonWord+"</span> frequently appears with: "+frequentAppearsStr);
        //         }
        //         else if(word.region === 'Southern'){
        //           $("#southernFreq").html("In the "+"<span class='southern'>"+"South</span>, <span class='wordHover'>"+commonWord+"</span> frequently appears with: "+frequentAppearsStr);
        //         }
        //         else if(word.region === 'East Coast'){
        //           $("#eastCoastFreq").html("On the "+"<span class='east-coast'>"+"East Coast</span>, <span class='wordHover'>"+commonWord+"</span> frequently appears with: "+frequentAppearsStr);
        //         }
        //         else if(word.region === 'West Coast'){
        //           $("#westCoastFreq").html("On the "+"<span class='west-coast'>"+"West Coast</span>, <span class='wordHover'>"+commonWord+"</span> frequently appears with: "+frequentAppearsStr);
        //         }
        // 	}
        // }

        function buildTopWordLists(lyricData){
        	var minorCorrectionWords = lyricData["Minor Corrections"];
        	var majorCorrectionWords = lyricData["Major Corrections"];
        	var updateWords = lyricData["Breaking News Updates"];

            console.log(minorCorrectionWords);
            console.log(majorCorrectionWords);
            console.log(updateWords);

            buildTopWordList($("#minorCorrectionTop20"),minorCorrectionWords);
            buildTopWordList($("#majorCorrectionTop20"),majorCorrectionWords);
            buildTopWordList($("#updateTop20"),updateWords);

             var wordListItems = $('#top20Lists li');

             function mouseEnter(){

             	var word = $(this).text();
             	var matchingWords =  _.filter(wordListItems, function(item){return $(item).text() === word;});
             	var restOfWords = _.difference(wordListItems,matchingWords);
             	$(matchingWords).addClass("wordHover");
             	$(restOfWords).addClass("wordFade");
             	
             }

             function mouseLeave(){
             	wordListItems.removeClass("wordHover");
             	wordListItems.removeClass("wordFade");
             }

            wordListItems.hover(mouseEnter, mouseLeave);
        	

        }
         
        function buildTopWordList(list,words){
        	for(var i=0;i<words.commonWords.length;i++){
        		list.append('<li>'+words.commonWords[i]['commonWord'].replace("_", " ")+'</li>')
        	}
        }

    });
});