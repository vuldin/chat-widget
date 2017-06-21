import events,{ subscribe, publish, reset } from '../../events'

function livePerson() {
	var chat, chatArea, tabIndex = 7, chatInput;
	
	var IBMForm;
	var LivePersonForm;
	
	var lastLine = ""

    
    var lpNumber = "83150611";    
    var appKey = "721c180b09eb463d9f3191c41762bb68"
    var domain = "va.convep.liveperson.net";
    
    
    function onInit(){
    	console.log("onInit called", chat)
    	if (chat) { 
            var chatRequest = {
                skill : "wva"
            };
            chat.requestChat(chatRequest);
        }
    }
    
  //create chat on the widget
    function getText(text) {
        var div = document.createElement("DIV");
        div.appendChild(document.createTextNode(text));
        return div.innerText || div.textContent;
    }

    function createLine(line) {
        var div1 = document.createElement("DIV");
        var div2 = document.createElement("DIV");
        var div3 = document.createElement("DIV");
        var div4 = document.createElement("SPAN");
        
        if (line.source === 'visitor') {
            div1.className = 'IBMChat-user-message-container IBMChat-user-message-container-theme';
            div2.className = 'IBMChat-user-message IBMChat-user-message-theme IBMChat-secondary-colors';
            div3.appendChild(document.createTextNode(line.text));
        }
        if (line.source === 'system') {
        	div1.className = 'system'
        	div1.setAttribute("style","align-items: center;height: 35px;color:#BA8FF7;")
        	div1.innerHTML += line.text;
        }
        if (line.source === 'agent') {
        	var fontAwesome = document.createElement("I")
        	
        	var tempDiv1 = document.createElement("DIV")
        	var tempDiv2 = document.createElement("DIV")
        	
        	
        	div1.setAttribute("style","display: flex;align-items: center;height: 40px;margin-bottom:40px;")
        	tempDiv1.setAttribute("style","flex: 0 0 25px;height: 25px;margin-right:10px;")
        	fontAwesome.setAttribute("class", "fa fa-user-circle fa-2x")
        	fontAwesome.setAttribute("aria-hidden", "true")
        	tempDiv1.appendChild(fontAwesome)
        	tempDiv2.innerHTML += line.text;
        	
        	lastLine = line.text
        	
        	lastLine = lastLine.replace(/^[\s*\n*\r*\t\*]*$[\s*\n*\r*\t\*]*/g, "");
        	
        	div1.appendChild(tempDiv1)
        	div1.appendChild(tempDiv2)
        	
        	console.log("DIVDIV", div1)
        }

        tabIndex = tabIndex + 1;
        
        div2.appendChild(div3);
        div1.appendChild(div2);

        return div1;
    }

    //Add a line to the chat view DOM
    function addLineToDom(line) {
        if (!chatArea) {
            chatArea = document.querySelector(".IBMChat-messages");
        }
         chatArea.appendChild(line);
    }

    //Scroll to the bottom of the chat view
    function scrollToBottom() {

        if (!chatArea) {
            chatArea = document.querySelector(".IBMChat-messages");
        }

        chatArea.scrollTop = chatArea.scrollHeight;
    }

    
    //enables the text input for chat
    function bindEvent(element, eventName, callback) {
    	console.log("bindevent", eventName)
        if (element.addEventListener) {
            element.addEventListener(eventName, callback, false);
        } else {
            element.attachEvent("on" + eventName, callback);
        }

    }
    
  //Unbinds  method from DOM
    function unBindEvent(element, eventName, callback) {

        if (element.addEventListener) {
            element.removeEventListener(eventName, callback, false);
        } else {
            element.detachEvent("on" + eventName, callback);
        }

    }
    
    
  //Sends a chat line

    function sendLine() {

        var text = getTrimmedValue(".IBMChat-chat-textbox", true);
        

        if (text && chat) {

            var line = createLine({
                by: chat.getVisitorName(),
                text: text,
                source: 'visitor'
            });

            chat.addLine({

                text: text,
                error: function () {
                    line.className = "error";
                }

            });

            addLineToDom(line);

            // Disable scrollToBottom
            //scrollToBottom();
            focusInput();
            //resize();

        }

    }


    //Listener for enter events in the text area
    function keyChanges(e) {

        e = e || window.event;

        var key = e.keyCode || e.which;

        if (key == 13) {
            if (e.type == "keyup") {
                sendLine();
                setVisitorTyping(false);
            }

            return false;

        } else {
            setVisitorTyping(true);
        }

    }
    
  //Set the visitor typing state
    function setVisitorTyping(typing) {

        if (chat) {
            chat.setVisitorTyping({ typing: typing });
        }

    }

    
    function focusInput() {

        if (!chatInput) {
            chatInput = document.querySelector('.IBMChat-chat-textbox');
        }

        chatInput.focus();
    }

    
  //Get a cleaned input value from the DOM by id

    function getTrimmedValue(inputId, clearValue) {
        var res = "";
        var element = document.querySelector(inputId);

        if (element && element.value) {
            res = element.value;
            res = res.replace(/^[\s*\n*\r*\t\*]*$[\s*\n*\r*\t\*]*/g, "");

            if (clearValue) {
                element.value = '';
            }
        }

        return res;
    }


    function updateChatState(data) {
    	//console.log("updateChatState called", data)
        //chatState = data.state;
    }
    
    function hideChatRequest() {
    	//console.log("hideChatRequest called")
        //hideElementById("startAChat");
    }
    
    function bindInputForChat() {
    	console.log("bindInputForChat called")
        IBMForm = document.querySelector(".IBMChat-input-form");
        LivePersonForm = IBMForm.cloneNode(true);
        IBMForm.parentNode.replaceChild(LivePersonForm, IBMForm);

        bindEvent(document.querySelector(".IBMChat-input-form"), "submit", sendLine);
        bindEvent(document.querySelector(".IBMChat-chat-textbox"), "keyup", keyChanges);
        bindEvent(document.querySelector(".IBMChat-chat-textbox"), "keydown", keyChanges);
    }
    
    function sendWVA() {
    	var s = "";
        $( ".IBMChat-messages>div>div" ).each(function( index ) {
        	console.log("TEST", $(this))
        	if($(this).hasClass("system")){
        		console.log("TEST", $(this))
        	}
        	if($(this).hasClass("IBMChat-user-message")){
    			s += "Visitor: " + $( this ).text() + "\n\n";
    		}
    		else{
    			s += "WVA: " + $( this ).text() + "\n\n";
    		}
        	
            /*s += ($(this).hasClass("IBMChat-user-message") ? "Visitor" : "WVA") 
                + ": " + $( this ).text() + "\n\n";*/
        });
        
        chat.addLine({
            text: s,
            error: function () {
                line.className = "error";
            }
        });
        
    }
    
    function showChatRequest(data) {
    	var failedRequest = chat.endChat({
    		success: chat.chatEnded,
		    error: chat.chatEndFailed,
		    context: chat,
		    disposeVisitor: true
    	});

    	//console.log("TEXT", lastLine)
    	
    	publish('send', { silent: true, text: lastLine });
    	if (failedRequest && failedRequest.error) {
    		console.log("ERROR:", failedRequest.error);
    	}
    	
    }

    function unBindInputForChat() {
        unBindEvent(document.querySelector(".IBMChat-input-form"), "submit", sendLine);
        unBindEvent(document.querySelector(".IBMChat-chat-textbox"), "keyup", keyChanges);
        unBindEvent(document.querySelector(".IBMChat-chat-textbox"), "keydown", keyChanges);

        LivePersonForm.parentNode.replaceChild(IBMForm, LivePersonForm);
    	console.log("unBindInputForChat called")
    }
    
    function addLines(data) {
    	//console.log("addLines called", data)
    	var linesAdded = false;
    	var systemProperty = false;
        for(var i = 0; i < data.lines.length; i++) {
            if (data.lines[i].source == 'system') {
                systemProperty = true;
                break;
            }
        }
        for (var i = 0; i < data.lines.length; i++) {
            var line = data.lines[i];
            if ((line.source !== 'visitor' && line.source !== 'system') || (systemProperty && data.lines.length == 1 && line.source == 'system')) {
                var chatLine = createLine(line);
                addLineToDom(chatLine);
                linesAdded = true;
            }
        }
        if (linesAdded) {
            scrollToBottom();
        }
    }
    
    chat = new lpTag.taglets.ChatOverRestAPI({
        lpNumber: lpNumber,
        appKey: appKey,
        domain: domain,
        onInit: [onInit, function (data) { writeLog("onInit", data)}],
        onLoad: function (data) { console.log(JSON.stringify(data));},
        //onInfo: function (data) { writeLog("onInfo", data); },
        onLine: addLines,
        onState: [updateChatState, function (data) { writeLog("onState", data); }],
        onStart: [hideChatRequest, updateChatState, bindInputForChat, sendWVA, function (data) { console.log("onStart called"); }],
        onStop: [showChatRequest, updateChatState, unBindInputForChat],
        //onAgentTyping: [agentTyping, function (data) { writeLog("onAgentTyping", data); }],
        //onRequestChat: function (data) { writeLog("onRequestChat", data); }
    });
	
}

module.exports = livePerson;