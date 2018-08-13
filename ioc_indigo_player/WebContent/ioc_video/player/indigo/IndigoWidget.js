/*
 * Licensed Materials - Property of IBM
 *
 * 5725-D69
 *
 * (C) Copyright IBM Corp. 2016 All rights reserved.
 *
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with
 * IBM Corp.
 */
define([ 
         "dojo/_base/declare", 
         "dojo/date/locale",
         "dojo/dom-style", 
         "dojo/dom-attr",
         "dojo/dom-class", 
         "dojo/dom-construct", 
         "dojo/has", 
         "dojo/on",
         "dojo/json", 
         "dojo/request", 
         "dojo/request/handlers",
         "dojo/topic", 
         "dojo/_base/lang",
         "dojo/text!./template/indigoWidget.html", 
         "dojox/timing/doLater",
         "ioc/i18n!Video",
         "ioc/Library", 
         "ioc/sysprop", 
         "dijit/layout/ContentPane",
         "dijit/Tooltip", 
         "dijit/_WidgetBase", 
         "dijit/_TemplatedMixin"
        ],
		function(declare, dateLocale, domStyle, domAttr, domClass, domConstruct, dHas, dOn,
				JSON, dRequest, dRequestHandlers, dTopic, dLang, template, doLater,
				i18nRes, Library, SysProp, ContentPane, Tooltip) {
			return declare(
					"ioc_video.player.indigo.IndigoWidget",
					[ dijit._WidgetBase, dijit._TemplatedMixin ],
					{
						templateString : template,
						// widgetsInTemplate:true,
						archiveTopDivNode : null,

						/** mxVmsPlayer.js* */
						mxEngineManager : null,
						mxImageViewer : null,
						mxMSXML4 : null,
						archiveControlsDivNode : null,
						liveControlsDivNode : null,
						archiveTopDivNode : null,
						liveTopDivNode : null,

						engineName : null,
						camName : null,
						option : null,
						Count : null,
						camera : null,
						Xml : null,
						Url : null,

						xpcotstart : null,
						xpcotend : null,
						xpcoport : 80,
						xpcodebug : false,
						xpcoauthtype : 1,
						xptype : "XPCo",
						xpco_speed : 1,
						xpcoplaymode : 0,
						xpco_delay : 100,

						ticktime : 0,
						imgstarttime : 0,
						timeid : 0,
						time : 0,
						timenow : 0,
						tokenRefreshMsecs : 3540000,
						// tokenRefreshMsecs : 120000,
						tokenHandle : 0,

						LoginCount : 0,

						currentContext : {
							vmsMode : "",
							vmsId : "",
							vmsServer : "",
							vmsUserid : "",
							vmsPassword : "",
							vmsCameraId : "",
							viewName : "",
							alertName : "",
							alertType : "",
							preRollTime : "",
							playbackStartDate : "",
							playbackEndDate : "",
							playbackTzOffsetMins : "",
							loaded : false,
							connected : "",
							livePlaying : false,
							curcam : "",
							uiManager : "",
							compoundAlertItemList : "",
							liveParms : "",
							archiveParms : ""
						},
						indigoContext:null,
						//Unlisted globals
						xmlText: null,
						nv: null,
						PLAYERCONTEXTID : "Genetec_5_2",
						framework_CURRENTCONTEXT : {},



						constructor : function(/* Object */kwArgs) {
							this.i18nRes = i18nRes;
							this._library = new Library();
							this.contextData = null;
							this.playerIFrame = null;
							this.errorMessage = "";
						},

						postCreate : function() {
							var fnName = "postCreate";
							this.inherited(arguments);
//							var value = domConstruct.create("div", {innerHTML: '<iframe name="Player_iFrame" id="Player_iFrame" src="/GenetecPlayer/Playerwrapper.html" frameBorder="0" scrolling="no" style="width: 375px; height: 400px; overflow: hidden; border-top-color: currentColor; border-right-color: currentColor; border-bottom-color: currentColor; border-left-color: currentColor; border-top-width: 0px; border-right-width: 0px; border-bottom-width: 0px; border-left-width: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none;"></iframe>' });
							var value = domConstruct.create("iframe", {id: "IndigoPlayer_iFrame",
								src: "/ioc_indigo_player/objectDetailsVmsPlayersVideoWall.html",
								frameBorder: "0",
								scrolling: "no",
								style: "width: 100%; height: 100%; overflow: hidden; border-top-color: currentColor; border-right-color: currentColor; border-bottom-color: currentColor; border-left-color: currentColor; border-top-width: 0px; border-right-width: 0px; border-bottom-width: 0px; border-left-width: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none;"
							});
							domConstruct.place(value, this.indigoPlayerDiv);
							this.playerIFrame = value;
							/* Div nodes utilized for players */
							this.archiveControlsDivNode = document.getElementById("archivePlayerDivNode");
							this.liveControlsDivNode = document.getElementById("livePlayerDivNode");
							//this.archiveTopDivNode = document.getElementById("archiveTopDivNode");
							//this.liveTopDivNode = document.getElementById("liveTopDivNode");
						},
						destroy : function() {

						},
						startup : function() {
							var fnName = "startup";
							this.inherited(arguments);
							// this.checkForVideoLoad();
						},

						initalizeVideoPane : function() {
							console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
							//if (dHas("activex")) {
							if (true) {
								// 110893 - The video width is not adjustable for the Video window
								domStyle.set(this.indigoPlayerDiv.parentNode.parentNode, "width", "100%");
								domStyle.set(this.indigoPlayerDiv.parentNode.parentNode, "height", "100%");
								
								dojo.byId('playerTopDivNode').parentNode.parentNode.style.overflow = 'hidden';
								return true;
							} else {
								console.log("Unsupported browser");
								this.errorMessage = this.i18nRes.video_err_unsupported_browser
										+ "<br><br>"
										+ this._library
												.i18nFormat(
														this.i18nRes.video_err_requires_activex,
														"Genetec 5.2");
								return false;
							}
						},
						
						setPlayerContext: function(data) {
							this.contextData = data;
							data_record=data.data_record
							if (data.alert != undefined) {
								 var param=JSON.parse(data_record.alert_author)
							        archiveParms=param.archiveParms
							        liveParams=param.liveParms
							        cameraId=data_record.CAMERA_ID
							        zone=data_record.Property_AREA
							        cameraName=data_record.CAMERA_NAME
							        var playbackdate=data_record.PLAYBACKSTARTDATE
							        var playbackdateText=playbackdate.text
							        startPlayBackTick=playbackdate.value
							        vmsServerId=data_record.VMS_NAME
							        alertName=data_record.Name
							        cameraView=zone+"("+cameraName+")_" +playbackdateText
								var playerContext = {
									 "vmsServer":vmsServerId,
					    			    "archiveParms":archiveParms,
					    			    "vmsMode":"archive",
					    				"playbackStartTicks":startPlayBackTick,
					    				"vmsUserId":"Admin",
					    				"vmsPassword":"1234",
					    				"preRollTime":30,
					    				"liveParms":liveParams,
					    				"cameraId":cameraId,
					    				"alertName":alertName,
					    				"viewName":cameraView
									}
							} else {
								var playerContext = {
										vmsMode: "live",
										vmsId: data.vms.vmsServerId,
										vmsServer: data.vms.vmsServerUrl,
										vmsUserId: data.vms.vmsServerParameters.user,
										vmsPassword: data.vms.vmsServerParameters.password,
										cameraId: data.cameraId,
										viewName: data.cameraName, //used for drop-down display
										alertName: "",
										alertType: "",
										preRollTime: 0,
										playbackStartDate: "",
										playbackStartLabel: "",
										playbackEndDate: "", //required but not used
										timezoneOffsetMins: 0,
										liveParms: "",
										archiveParms: "",
										mediaBase: ""
									}
							}
							console.log(playerContext);

							dojo.hitch(this,this.setActiveContent(playerContext));
						},
						
						setActiveContent: function(content) {
							this.indigoContext=content
							setTimeout(this.setActiveContentAfterTimeDelay, 3000);
							//this.indigoPlayerDiv.firstElementChild.ivSetPlayerContext(content);
							
						},
						setActiveContentAfterTimeDelay:function (){
							/*if (doLater(this.indigoPlayerDiv, this)) {return;}
							if (doLater(this.indigoPlayerDiv.firstElementChild, this)) {return;}
							if (doLater(this.indigoPlayerDiv.firstElementChild.contentWindow.IndigoPlayer_iFrame, this)) {return;}
							if (doLater(this.indigoPlayerDiv.firstElementChild.contentWindow.IndigoPlayer_iFrame.setActiveContent, this)) {return;}*/
							var playerContext = {
									 "vmsServer":vmsServerId,
					    			    "archiveParms":archiveParms,
					    			    "vmsMode":"archive",
					    				"playbackStartTicks":startPlayBackTick,
					    				"vmsUserId":"Admin",
					    				"vmsPassword":"1234",
					    				"preRollTime":30,
					    				"liveParms":liveParams,
					    				"cameraId":cameraId,
					    				"alertName":alertName,
					    				"viewName":cameraView
									}
							this.IndigoPlayer_iFrame.ivSetPlayerContext(playerContext);
						},

						stopVideo : function() {
							this.indigoPlayerDiv.firstElementChild.contentWindow.ivStopLive()
						},

						fastReverseVideo : function() {},

						reverseVideo : function() {},

						pauseVideo : function() {
							
							this.indigoPlayerDiv.firstElementChild.contentWindow.ivPause();
						},

						playVideo : function() {
							this.indigoPlayerDiv.firstElementChild.contentWindow.ivPlay()
						},

						fastForwardVideo : function() {},

						startLiveVideo : function() {
							
							this.indigoPlayerDiv.firstElementChild.contentWindow.ivStartLive()
						},

						stopLiveVideo : function() {
							
							this.indigoPlayerDiv.firstElementChild.contentWindow.ivStopLive()
						},

						startArchiveVideo : function() {
							
							this.indigoPlayerDiv.firstElementChild.contentWindow.goBackToArchive()
						},
						
						showLivePlayer: function() {
							//domStyle.set(this.archivePlayerDivNode, "display", "none");
							//domStyle.set(this.livePlayerDivNode, "display", "none");
							//domStyle.set(this.archiveTopDivNode, "display", "none");
							//domStyle.set(this.liveTopDivNode, "display", "none");
						},
						
						showArchivePlayer: function() {
							//domStyle.set(this.archivePlayerDivNode, "display", "none");
							//domStyle.set(this.livePlayerDivNode, "display", "none");
							//domStyle.set(this.archiveTopDivNode, "display", "none");
							//domStyle.set(this.liveTopDivNode, "display", "none");
						},

						XPCoimageReceived : function(sender, e) {

							if (this.xpcodebug)
								console.log("Image Received : " + sender);
							this.imgstarttime = new Date((+sender));

							this.disableImageReceivedEvent();

							if (this.xpcoplaymode == 1) {
								// start playback of archived video
								this.playVideo();
							}
						},

						showXPCoNextFrame : function() {

							this.ticktime = new Date();
							if (this.mxImageViewer.Goto(this.imgstarttime.getTime())) {
								this.timeid = setInterval("XPCoVideoLooper()",
										this.xpco_delay);
							}
						},

						showXPCoPrevFrame : function() {

							this.ticktime = new Date();
							if (this.mxImageViewer.Goto(this.imgstarttime.getTime())) {
								this.timeid = setInterval("XPCoVideoLooper()",
										this.xpco_delay);
							}
						},

						togglePlayers : function(indicator) {
							// playerDivNode.style.display="inline";
							if (indicator == "live") {
								this.liveTopDivNode.innerHTML = this._library
										.i18nFormat(
												this.i18nRes.video_live_camera_label,
												this.currentContext.viewName);
								this.disableImageReceivedEvent();
							} else if (indicator == "archive") {
								this.currentContext.vmsMode = "archive";
							}
						},

						/** *************************************************** */
						/** __________________milsFramework.js________________* */
						/** *************************************************** */
						API : function() {
							return ({
								setActiveContent : function(args) {
									message = args;
									if (doLater(AlertHandler, this)) {return;}
									AlertHandler(message);
								},
								getActiveContent : function() {
									var aMsg = this.message;
									message = null; // null the message once consumed
									return aMsg;
								}
							});
						},

						/*
						 * *************************************************************
						 * The following routines are standard for Video
						 * Integration
						 * *************************************************************
						 * The following functions perform a standard set of
						 * operations. They should not be significantly altered
						 * other than to change the function and variables names
						 * as appropriate for the selected video provider (EG
						 * XPCo stands for Xprotect Corporate). The functions
						 * that are called below shoud also be changed to match
						 * the function names defined earlier in the page.
						 */

						formatDate : function(dateObject) {
							return dateLocale.format(dateObject, {selector: "date", datePattern: "yyyy-MM-dd'T'HH.mm.ss.SSS"});
						},
						
						// take time string (yyyy-mm-dd hh:mm:ss) and output a
						// Date object.
						parseXPCoJavaDate : function(timestamp) {

							var parseresulttop = timestamp.split("T");
							var dateresult = parseresulttop[0].split("-");
							var timeresult = parseresulttop[1].split(".");
							if (dateresult != null) {
								var xpcoyear = dateresult[0];
								var xpcomonth = dateresult[1];
								var xpcoday = dateresult[2];
								var xpcohour = timeresult[0];
								var xpcominute = timeresult[1];
								var xpcosecond = timeresult[2];
								var xpcomsec = timeresult[3];
								/*
								 * This section is handling a case where msecs
								 * comes in with a trailing "-0400" which is an
								 * invalid value but is being handled here
								 * because it does happen when alerts are played
								 * back from alerts queue
								 */
								var parsemsec = xpcomsec.split("-");
								xpcomsec = parsemsec[0];

								// convert from UT
								var loc_time = new Date(Date.UTC(xpcoyear,
										xpcomonth - 1, xpcoday, xpcohour,
										xpcominute, xpcosecond, xpcomsec));

								return loc_time;
							}
						},

						togglePlayers : function(indicator) {
							// playerDivNode.style.display="inline";
							if (indicator == "live") {
								this.liveTopDivNode.innerHTML = this.currentContext.viewName
										+ " - Live"; // this.currentContext.uiManager.getString("liveplayer").replace("${0}",this.currentContext.viewName);
								dojo.hitch(this,this.disableImageReceivedEvent());
							}
						},

						parseQueryStringToObject : function(aQueryStr) {
							var nvps = aQueryStr.split("&");
							var nvs = {}
							for (i in nvps) {
								this.nv = nvps[i].split("=");
								nvs[this.nv[0]] = this.nv[1];
							}
							return nvs;
						},

						reConnect : function() {
							/*
							 * this.mxEngineManager.SetAuthentication(this.xpcoauthtype);
							 * if (this.xptype == "XPCo") { Url = "http://" +
							 * this.currentContext.vmsServer +
							 * "/RCServer/systeminfo.xml"; // XProtect XPCo Url
							 * }else { Url = "http://" +
							 * this.currentContext.vmsServer + "/systeminfo.xml"; //
							 * XProtect XPE Url } alert("Refresh Token"); if
							 * (this.mxEngineManager.QueryEngine(this.currentContext.vmsUserid,
							 * this.currentContext.vmsPassword, Url)) {
							 * alert("Successfully Refreshed Token"); } else {
							 * this.currentContext.connected = "";
							 * alert(this.currentContext.uiManager.getString("vmsError") +
							 * "5"); }
							 */
							// alert("Clearing Connection State");
							this.currentContext.loaded = false;
							this.currentContext.connected = "";
							clearInterval(this.tokenHandle);
							this.mxImageViewer.Close();
							this.currentContext.curcam = "";
							this.mxEngineManager.ClearInvalidToken();
						},

						MxDestroy : function() {
							clearInterval(this.tokenHandle);
						}
					});
		});
