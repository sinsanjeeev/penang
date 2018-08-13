/*
 * IBM Confidential
 *
 * OCO Source Material
 *
 * 5725H94
 *
 * (C) Copyright IBM Corp. 2013, 2016
 *
 * The source code for this program is not published or otherwise divested
 * of its trade secrets, irrespective of what has been deposited with the
 * U. S. Copyright Office.
 *
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with
 * IBM Corp.
 */	
 
 
var currentContext = {
		vmsMode: "",
		vmsId: "",
		vmsServer: "",
		vmsUserid: "",
		vmsPassword: "",
		vmsCameraId: "",
		viewName: "",
		alertName: "",
		alertType: "",
		preRollTime: "",
		playbackStartDate: "",
		playbackStartTicks: "",
		playbackEndDate: "",
		playbackEndTicks: "",
		playbackTzOffsetMins: "",
		loaded: false,
		connected: "",
		livePlaying: false,
		curcam: "",
		uiManager: "",
		compoundAlertItemList: "",
		liveParms: "",
		archiveParms: ""
};


var archiveTopDivNode;
var liveTopDivNode;
var playerDivNode;
var noTimelineDivNode;
var archivePlayerDivNode;
var livePlayerDivNode;
var partList;

var starttime;
var startVarDate;

var videoPlayer;
var profile;
var streamTransport = 2;  //set default Reliable, can be overridden in liveParms
var accessUrl;
var liveUser;
var livePassword;
var archiveUser;
var archivePassword;

var liveParams;
var archiveParams;
var camSVCID;
var nvrSVCID;
var currCombinedSVCID;
var lastCombinedSVCID = "";


function ivInit(){
	
	/*Div nodes utilized for toggling players*/
	/*archiveTopDivNode = document.getElementById("archiveTopDivNode");
	liveTopDivNode = document.getElementById("liveTopDivNode");
	playerDivNode = document.getElementById("playerDivNode");
	noTimelineDivNode = document.getElementById("noTimelineDivNode");*/
	archivePlayerDivNode = document.getElementById("archivePlayerDivNode");
	livePlayerDivNode = document.getElementById("livePlayerDivNode");
	//partList = document.getElementById("partList");
	togglePlayers("archive");

}

function ivSetPlayerContext(args){
	currentContext.vmsMode = args.vmsMode;
	currentContext.vmsServer = args.vmsServer;
	currentContext.vmsUserid = args.vmsUserId;
	currentContext.vmsPassword = args.vmsPassword;
	currentContext.vmsCameraId = args.cameraId;
	currentContext.viewName =	args.viewName;
	currentContext.alertName = args.alertName;
	currentContext.alertType = args.alertType;
	currentContext.preRollTime = args.preRollTime;
	currentContext.playbackStartDate = args.playbackStartDate;
	currentContext.playbackStartTicks = args.playbackStartTicks;
	currentContext.playbackEndDate = args.playbackEndDate;
	currentContext.playbackEndTicks = args.playbackEndTicks;
	currentContext.playbackTzOffsetMins = args.timezoneOffsetMins;
	currentContext.liveParms = args.liveParms;
	currentContext.archiveParms =	args.archiveParms;
    //currentContext.uiManager = getCurrentContext().UIProfileManager;
	  
	if (args.compoundAlertItemList == "") {
	}else{
		currentContext.compoundAlertItemList = args.compoundAlertItemList;
	}
	
	if(currentContext.vmsMode == "archive"){
		setPlaybackParams();
		/*
		Compound Alert Stuff
		*/	
		if (currentContext.alertType == "C") {
			// Compound Alert
			populateArchivePartsList(currentContext.compoundAlertItemList);
		} else {
			if (currentContext.alertType == "") {
				// Event
				simpleArchivePartList(currentContext.viewName + " - " + currentContext.playbackStartDate, "");
			} else {
				//non-compound Alert
				simpleArchivePartList(currentContext.alertName + "[" + currentContext.viewName + "]", "");
			}
		}
	}

	//playerDivNode.style.display="table";
	//noTimelineDivNode.style.display="table";
	//togglePlayers(currentContext.vmsMode);
	
	liveParams = parseQueryStringToObject(currentContext.liveParms);
	archiveParams = parseQueryStringToObject(currentContext.archiveParms);
	liveUser = liveParams.user;
	livePassword = liveParams.password;
	profile = liveParams.profile;
	accessUrl = "http://" + currentContext.vmsCameraId + "/onvif/device_service";

	/*if (liveParams.transport) {
		streamTransport = liveParams.transport;
	}*/

	archiveUser = currentContext.vmsUserid;
	archivePassword = currentContext.vmsPassword
	camSVCID = archiveParams.camSVCID;
	nvrSVCID = "iv://" + currentContext.vmsServer + "/nvr";
	
	if (currentContext.mode == "live") {
		currCombinedSVCID = currentContext.vmsCameraId + ":" + profile;
	} else {
		currCombinedSVCID = currentContext.vmsServer + ":" + camSVCID;
	}
	
	if (!(currentContext.loaded))
	{
		ivLoad();
	}
	
	ivConnect();

}

function setPlaybackParams() {

	var localtime = new Date(currentContext.playbackStartTicks - (currentContext.preRollTime * 1000));
	var tzoffset = localtime.getTimezoneOffset();
	
	starttime = new Date(localtime.getTime() + tzoffset * 60000);
}

function getPane()
{
	var control = document.getElementById("ivVideoControl").object;
	return control.Pane;
}

function ivLoad() {
	
	currentContext.loaded = true;
}   
		
function ivConnect() 
{
	var pane = getPane();
	if (currentContext.vmsMode == "archive") {
		
		if (currCombinedSVCID != lastCombinedSVCID) {
			pane.SetCredentials(archiveUser, archivePassword);
			lastCombinedSVCID = currCombinedSVCID;
		}
		startPlayBack();
	} else {
		
		if (currCombinedSVCID != lastCombinedSVCID)
		{
			accessUrl = "http://" + currentContext.vmsCameraId + "/onvif/device_service";

			pane.SetCredentials(liveUser, livePassword);
			lastCombinedSVCID = currCombinedSVCID;
				
		} 
		ivStartLive();
	}
}

//	Event Handlers

function onStreamConnected() {
	lastCombinedSVCID = currCombinedSVCID;
}

function onPlaybackStarted() {
	lastCombinedSVCID = currCombinedSVCID;
}

function onStreamError() {

	alert("Stream Error");
}


function onStreamDisconnected() {
	//alert("Stream Disconnected");
}

function onStreamStarted() {
	//alert("Stream Started");
}

function onStreamStateChanged() {
	//alert("Stream State Changed");
}

function startPlayBack()
{
		var pane = getPane();
		startVarDate = starttime.getVarDate();
		
		
		console.log("user:"+archiveUser+"\n password: "+archivePassword+"\n startdate: "+startVarDate + "\n scvid: " + nvrSVCID + "\n camSVCID: " + camSVCID);
		pane.SetCredentials(archiveUser,archivePassword);
		pane.StartPlaybackVideo(camSVCID, nvrSVCID, startVarDate);
		pane.PlaybackSpeed = 9;
}
function parseDate(timestamp) {

		var parseresulttop = timestamp.split(" ");
		var dateresult = parseresulttop[0].split("-");
		var timeresult = parseresulttop[1].split(":");
		if (dateresult != null) 
		{
		  var parseyear = dateresult[0];
		  var parsemonth = dateresult[1];
		  var parseday = dateresult[2];
		  var parsehour = timeresult[0];
		  var parseminute = timeresult[1];
		  var parsesecond = timeresult[2];


		  var startDate = new Date(parseyear,parsemonth-1,parseday,parsehour,parseminute,parsesecond);
		  
		  //alert(startDate);
		  
		  return startDate;
		}
	}
/*
*	*************************************************************
*	Provide Control buttons for the user to control playback
*	*************************************************************
*/   
function goBackToArchive(){
	//togglePlayers("archive");
	startPlayBack()
}	
function ivPlay() {
	var pane = getPane();
	pane.PlaybackSpeed = 9;
}

function ivStop() {
	var pane = getPane();
	pane.PlaybackSpeed = 6;
	//pane.PlaybackTime = startVarDate;
}

function ivPause() {
	var pane = getPane();
	pane.PlaybackSpeed = 6;
}
function ivReverse(){
	var pane = getPane();
	pane.PlaybackSpeed = 4;
}

function ivStepBack() {
	var pane = getPane();
	pane.StepVideo(1)
	
}

function ivStepForward() {
	var pane = getPane();
	pane.StepVideo(0)
}

function ivRewind() {
	var pane = getPane();
	pane.PlaybackSpeed = 2;
}

function ivForward() {
	var pane = getPane();
	pane.PlaybackSpeed = 10;

}

function ivStartLive(){
	var pane = getPane();
	//togglePlayers("live");
	pane.SetCredentials(liveUser, livePassword);
	lastCombinedSVCID = currentContext.vmsCameraId + ":" + profile;
	pane.StartLiveVideo(accessUrl, profile, streamTransport);
	currentContext.livePlaying = true;
}

function ivStopLive(){
	var pane = getPane();
	pane.StopVideo()
	currentContext.livePlaying = false;
}
/*
*	*************************************************************
*	The following routines are standard for Video Integration
*	*************************************************************
*	The following functions perform a standard set of operations. They should not
*	be significantly altered other than to change the function and variables names as
*	appropriate for the selected video provider (EG XPCo stands for Xprotect Corporate).
*	The functions that are called below shoud also be changed to match the function
*	names defined earlier in the page.
*/

function parseQueryStringToObject(aQueryStr) {
	if(aQueryStr==null)
		return;
    var nvps=aQueryStr.split("&");
    var nvs={}
    for(i in nvps) {
       nv = nvps[i].split("=");
       nvs[nv[0]] = nv[1];
    }
    return nvs;
}

function togglePlayers (indicator){
	//playerDivNode.style.display="inline";
	
	if (indicator == "live"){
		//liveTopDivNode.innerHTML = currentContext.uiManager.getString("liveplayer").replace("${0}",currentContext.viewName);
		//livePlayerTimelineNode.innerHTML = uiManager.getString("livetimeline")
		//archiveTopDivNode.style.display = "none";
		//liveTopDivNode.style.display = "inline";
		archivePlayerDivNode.style.display = "none";
		livePlayerDivNode.style.display = "inline";
	}else{
		//liveTopDivNode.style.display = "none";
		//archiveTopDivNode.style.display = "inline";
		archivePlayerDivNode.style.display = "inline";
		livePlayerDivNode.style.display = "none";		
	}
}
//Called for Compound Alerts with multiple parts
function populateArchivePartsList(itemList,tzOffset){
	var partList = document.getElementById("partList");
	
	partList.options.length = 0;
	for (i=0;i<itemList.length;++i){
		partList.options[partList.options.length] = new Option(itemList[i].alertSummary.identity + "[" + itemList[i].channelTitle + "]", "");
		//itemList[i].cameraPort + "||" + itemList[i].initialAlertStartTimestamp + "||" + itemList[i].end.timestamp + "||" + tzOffset + "||" + preRollTime);
		if ((itemList[i].channelTitle == currentContext.viewName) && (itemList[i].cameraPort == currentContext.vmsCameraId) && (itemList[i].initialAlertStartTimestamp == currentContext.playbackStartDate)) 
				partList.selectedIndex = i;
	}

}

//Called for Events & Non-CA Alerts without parts (therefore one part)
function simpleArchivePartList (label, value){
	var partList = document.getElementById("partList");
	
	partList.options.length = 0;	
	partList.options[partList.options.length] = new Option (label,value);	
}

function switchPartPlayback (){
	var partList = document.getElementById("partList");
	
	var partIndex = partList.selectedIndex;
	currentContext.vmsCameraId = currentContext.compoundAlertItemList[partIndex].cameraPort;
	currentContext.preRollTime = currentContext.compoundAlertItemList[partIndex].preRollTime;
	currentContext.playbackStartDate = currentContext.compoundAlertItemList[partIndex].initialAlertStartTimestamp;
    currentContext.playbackStartTicks = currentContext.compoundAlertItemList[partIndex].initialAlertStartTicks;
	currentContext.playbackEndDate = currentContext.compoundAlertItemList[partIndex].end.timestamp;
	currentContext.playbackEndTicks = currentContext.compoundAlertItemList[partIndex].end.ticks;
	
	setPlaybackParams();
	if (!(currentContext.loaded))
	{
		ivLoad();
	}
	
	ivConnect();
}	

function ivDestroy()
{
}
