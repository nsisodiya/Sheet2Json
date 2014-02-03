var Sheet = function(){
  this.rows = 0;
  this.columns = 0;
  this.data = {};
}
Sheet.prototype = {
  get: function(r, c){
    return this.data[r+"-"+c];
  },
  set: function(r,c, val){
    if(r > this.getHeight()){
      this.setHeight(r);
    }
    if(c > this.getWidth()){
      this.setWidth(c);
    }
    this.data[r+"-"+c] = val;
  },
  log: function(r,c){
    console.log(r+"-"+c, this.get(r,c));
  },
  parseJson : function(){
    return this.parseSection(1,1,this.getHeight());
  },
  getHeight: function(){
    return this.rows;
  },
  getWidth: function(){
    return this.columns;
  },
  setHeight: function(r){
    this.rows = r;
  },
  setWidth: function(c){
    this.columns = c;
  },
  findBoundry: function(row, col, maxHeight){
    if(this.get(row,col) === undefined){
      console.error("findBoundry was called on a cell with is undefined");
      return {height:0, width: 0};
    }
    var height = 1;
    if(maxHeight !== 1){
      while(this.get(row+height,col) === undefined){
        height = height + 1;
        if(height === maxHeight){
          break;
        }
        if(row+height > this.getHeight()){
          break;
        }
      }
    }
    var width = 1;
    var a = [];
    var isColumnEmpty = false;
    while(isColumnEmpty === false){
      isColumnEmpty = true;
      for(var i=0; i<height; i++){
        if(this.get(row+i,col+width-1) !== undefined){
          isColumnEmpty = false;
        }
      }
      a[width] = isColumnEmpty;
      width = width + 1;
    }
    width = a.length-2;

    var b = [];
    for (var j=0;j<height;j++){

      var RowIsEmpty = true;
      for (var k=0;k<width;k++){
        if(this.get(row+j,col+k) === undefined){
          RowIsEmpty = RowIsEmpty && true;
        }else{
          RowIsEmpty = false;
        };
      }
      if(RowIsEmpty === true){
        break;
      }else{
        b[j] = RowIsEmpty;
      }
    }
    console.log("Row Object is ", b);
    return {height:height, width: width};
  },
  parseSection:function(row, col, maxHeight){
    console.log("Now Scanning for sheet(" + row + "," +(col)  + ")=" + this.get(row,col) + "  Height = " +  maxHeight);
    var finalData = {};
    var currentColIndex = col;
    var currentRowIndex=row;

    if(this.get(currentRowIndex,currentColIndex)==="0" || this.get(currentRowIndex,currentColIndex)===0){
      finalData = [];
    }
    var outOfBoundryRowIndex = row + maxHeight;
    for(;currentRowIndex < outOfBoundryRowIndex;){
      var cell = this.findBoundry(currentRowIndex, currentColIndex, maxHeight);
      if(cell.height === 1 && cell.width === 2){
        finalData[this.get(currentRowIndex,currentColIndex)] = this.get(currentRowIndex,currentColIndex+1);
      }else{
        if(cell.height > 0){
          //console.log("Now Scanning for "+ this.get(currentRowIndex,currentColIndex) +" " + currentRowIndex + "-" +(currentColIndex+1)  + " Height -" +  cell.height);
          finalData[this.get(currentRowIndex,currentColIndex)] = this.parseSection(currentRowIndex, currentColIndex + 1 , cell.height);
        }else{
          //console.log("0 Height "+ this.get(currentRowIndex,currentColIndex) +" " + currentRowIndex + "-" +(currentColIndex+1)  + " Height -" +  cell.height);
          //finalData[this.get(currentRowIndex,currentColIndex)] = undefined;
          currentRowIndex = currentRowIndex + 1;
        }

      }
      currentRowIndex = currentRowIndex + cell.height;
      maxHeight = maxHeight - cell.height ;
    }
    return finalData;
  }
};


var Sheet2Json = (function(){

  var ajaxCall = function(config){


    var oReq = new XMLHttpRequest();
    oReq.open("GET", config.url, true);
    oReq.onload = function(data){
      config.callback(JSON.parse(this.responseText));
    };
    oReq.send();

  };

  var ABCD2Index = {"A":1,"B":2, "C":3, "D":4, "E": 5};

  return function(obj){
    ajaxCall({
      ///url:"http://spreadsheets.google.com/feeds/cells/" + obj.key + "/1/public/basic?alt=json",
      url:"/js/dummydata.json",
      callback: function(data){
        var sheet = new Sheet();
        data.feed.entry.map(function(v,i){
          var ColumnId = ABCD2Index[v.title.$t.charAt(0)];
          var RowId = window.parseInt(v.title.$t.substr(1), 10);
          sheet.set(RowId,ColumnId, v.content.$t);
        });
        obj.callback(sheet.parseJson());
      }
    })

  };
})();

//
//Sheet2Json({
//  key:"0ApCbcxGL31zndGNVcndJdGduelZCNVVXYTY1NmVDR1E",
//  type:"google",
//  callback:function(json){
//    console.log("Json is ",json);
//  }
//});

function test1(){
  var a = new Sheet();
  a.set(1,1,0);a.set(1,2,"name");a.set(1,3,"Narendra");
               a.set(2,2,"job"); a.set(2,3,"Engineer");

  a.set(4,1,1);a.set(4,2,"name");a.set(4,3,"Deepak");
              a.set(5,2,"job"); a.set(5,3,"Engineer");
  console.log(a.parseJson());
};
test1();


