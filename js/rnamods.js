// rnamods
// JavaScript functions
// written by Jef Rozenski 2026
//
var thedata = []; // array of the entries
var thesele = []; // array of found records
var baseurl = "";
//------------------------------------------
function addRow(txt) {
txt = txt.replace(/\<.+?\>/,""); //remove sorting prepend string
var txtarr = txt.split("|");
var table = document.getElementById("myTable");	
var tbody = table.getElementsByTagName("tbody")[0];
var tr = document.createElement('tr');
var cell1 = document.createElement("td");
var cell2 = document.createElement("td");
var cell3 = document.createElement("td");
var cell4 = document.createElement("td");
cell1.innerHTML = "<A HREF='#' onCLick='showDetail(\"" + txtarr[0] + "\")'>" + txtarr[0] + "</A>";
cell2.innerHTML = formatName(txtarr[2]);
cell3.innerHTML = formatName(txtarr[3]);
cell4.innerHTML = txtarr[4];
tr.appendChild(cell1);
tr.appendChild(cell2);
tr.appendChild(cell3);
tr.appendChild(cell4);
tbody.appendChild(tr);
}
//------------------------------------------
function doDetail(txt,nr) {
var txtarr = txt.split("\n");
var i = txtarr.length;
while (i--) {
  var thevar = txtarr[i].substring(0,6);
  var mycompo, mycanam, mycanur, mycanub, myupdat;
  if (thevar == "COMPO=") {mycompo = txtarr[i].substring(6);txtarr.splice(i,1);}
  if (thevar == "CANAM=") {mycanam = txtarr[i].substring(6);txtarr.splice(i,1);}
  if (thevar == "CANUR=") {mycanur = txtarr[i].substring(6);txtarr.splice(i,1);}
  if (thevar == "CANUB=") {mycanub = txtarr[i].substring(6);txtarr.splice(i,1);}
  if (thevar == "UPDAT=") {myupdat = txtarr[i].substring(6);txtarr.splice(i,1);}
  }
var fn = baseurl + "txt/rnawrap.txt";
var rc = thedata.filter(option => option.startsWith(nr));
rc = rc[0].split("|");
fetch(fn)
  .then( r => r.text() )
  .then( t => {
	let outtext = t;
    outtext = outtext.replace("|COMPO|", formatCompo(mycompo));
	outtext = outtext.replace("|CANAM|", formatName(mycanam));
	outtext = outtext.replace("|CANUR|", mycanur);
	outtext = outtext.replace("|CANUB|", mycanub);
	outtext = outtext.replace("|UPDAT|", myupdat);
	outtext = outtext.replace("|FILE|", txtarr.join("\n"));
	outtext = outtext.replaceAll("|ID|", rc[0]);
	outtext = outtext.replaceAll("|NAME|", formatName(rc[3]));
	outtext = outtext.replaceAll("|SYMB|", formatName(rc[2]));
	outtext = outtext.replaceAll("|MASS|", rc[4]);
	doMenu('output',outtext);
	})
}
//------------------------------------------
function doMenu(thediv,txt) {
var cols = document.getElementsByClassName("divs");
for(i=0; i<cols.length; i++) {                            // hide all pages
  cols[i].style.display = 'none';
  }
if (txt != "") {
  document.getElementById(thediv).innerHTML = txt;        // fill selected page
  }
document.getElementById(thediv).style.display = 'block' ; // show selected page
}
//------------------------------------------
function fillData(t) {
var mydata = []; // local array
thedata = t.split("\n");
for (const element of thedata) {
  if (element[0] != "*") mydata.push(element);  // remove comment lines
  }
thedata = mydata.sort(); // copy to global array, sorted by id
}
//------------------------------------------
function formatCompo(compo) { // format elemental composition
return compo.replace(/(\d+)/g,"<SUB>$1</SUB>");
}
//------------------------------------------
function formatName(name) { // format name with html
name = name.replace(/\#(.)/g,"<SUP>$1</SUP>");
name = name.replace(/\_(.)/g,"<SUB>$1</SUB>");
name = name.replace(/\?(.)/g,"<I>$1</I>");
name = name.replace(/\!(.)/g,"<FONT face='symbol'>$1</FONT>");
name = name.replace(/\&(.)/g,"<SPAN style='font-family:monospace'>$1</SPAN>");
return name;
}
//------------------------------------------
function getRadioVal(radioName) { // get value for the selected radiobutton
var rads = document.getElementsByName(radioName);
for(var rad in rads) {
  if(rads[rad].checked) return rads[rad].value;
  }
return '.';
}
//------------------------------------------
function getSearchtxt() {
var textInput = document.getElementById('searchtxt');
return textInput.value;
}
//------------------------------------------
function genTable() { // generate search list table
// clear table
const thetable = document.getElementById("myTable");
const tbody = thetable.tBodies[0] || thetable.createTBody();
tbody.replaceChildren();
// sort table
thesele = thesele.sort();
// generate new table
for (const element of thesele) {
  var myelem = element;
  addRow(myelem);
  }
// fill in records found
document.getElementById("numresults").innerHTML = "found " + thesele.length + " records";
// show table
doMenu("outtable","");
}
//------------------------------------------
function loadInit() {
var fn;
fn = baseurl + "txt/rnabase.txt"; // load database
fetch(fn)
  .then( r => r.text() )
  .then( t => fillData(t) ) 
fn = baseurl + "txt/rnasear.txt"; // load search page
fetch(fn)
  .then( r => r.text() )
  .then( t => doMenu('input',t) )
if (window.location.href.search(/\?\d\d\d/) > 0) {
  var nr = window.location.href.match(/\?\d\d\d/)[0];
  nr = nr.replace(/\?/,"");
  showDetail(nr);
  }
else {
  loadShow('txt/rnahome.txt'); // load homepage and show
  }
}
//------------------------------------------
function loadShow(fn) { // read file and show in output window
fn = baseurl + fn;
fetch(fn)
  .then( r => r.text() )
  .then( t => doMenu('output',t) )
}
//------------------------------------------
function showDetail(nr) {
fn = baseurl + "txt/" + nr + ".txt";
fetch(fn)
  .then( r => r.text() )
  .then( t => doDetail(t,nr) )
}//------------------------------------------
function showTable() {
thesele = thedata.slice(); // make copy of the data
// read search form
const thenuc = getRadioVal("NUC");
const therna = getRadioVal("RNA");
const thephy = getRadioVal("PHY");
const theboth = therna + thephy;
const thesrt = getRadioVal("SRT");
const searchtxt = getSearchtxt();
const searchterm = searchtxt.split(' ');
var mybool;
var therecord;
// filter
var i = thesele.length;
while (i--) {
  if (thesele[i].length <= 0) { // remove blank lines
	thesele.splice(i, 1);
	continue;
    }
  var therecord = thesele[i].split("|");
  mybool = 0;
  if (theboth.search(/\.\./) < 0) { // if not all from all
	var re = new RegExp(thephy + "(.*)" + therna);
 	thesubrecord = therecord[1].substring(2).split(".");
	for (const element of thesubrecord) {
	  if (re.test(element)) {
		mybool = 0;
        break;
	    }
	  mybool++;
      }
    }
  if (thenuc != "." && therecord[1].substring(0,2).search(thenuc) < 0) mybool++;
  if (therna != "." && therecord[1].substring(1).search(therna) < 0) mybool++;
  if (thephy != "." && therecord[1].substring(1).search("." + thephy) < 0) mybool++;
  if (searchterm.length > 0) {
	for (const element of searchterm) {
      if (therecord[3].search(element.toLowerCase()) < 0) mybool++;
	}
  }
  if (mybool > 0) { 
    thesele.splice(i, 1);
    }
  else { // prepend for sorting
	thesele[i] = sortPrepend(thesrt,thesele[i]);
    }
}
// generate and show table
genTable();
}
//------------------------------------------
function sortName(nucname) { // remove unwanted characters for name sorting
var srtname = nucname;
srtname = srtname.replace(/[\?\#\_](.)/g,"");
srtname = srtname.replace(/[\,\.\-\d\'\(\)\ ]/g,"");
return srtname;
}
//------------------------------------------
function sortPrepend(thesrt,myrec) {
myrec = myrec.replace(/\<.+?\>/,""); //remove old sorting prepend string
var	therecord = myrec.split("|");
if (thesrt == "B") return "<!--" + therecord[1][0] + sortName(therecord[3]) + "-->" + myrec;
if (thesrt == "N") return "<!--" + sortName(therecord[3]) + "-->" + myrec;
if (thesrt == "M") return "<!--" + therecord[4] + "-->" + myrec;
return myrec; // by id
}
//------------------------------------------
function sortTable(thesrt) {
var i = thesele.length;
while (i--) {
  thesele[i] = sortPrepend(thesrt,thesele[i]);
 }
genTable();
}
