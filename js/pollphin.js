var BASE_URL = 'http://www.pollphin.de/';
var STYLESHEET = BASE_URL + 'theme/css/embedded.css';
var CONTENT_URL = BASE_URL + 'seam/resource/rest/pollphin/';
var ROOT = 'pollphin_poll_';
var USER_COOKIE = 'com.pollphin.user';

// request stylesheets
function requestStylesheet() {
  var stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.type = 'text/css';
  stylesheet.href = STYLESHEET;
  stylesheet.media = 'all';
  document.getElementsByTagName("head")[0].appendChild(stylesheet);
}

// request poll
function requestContent() {
  // read user cookie
  var userId = readCookie(USER_COOKIE);

  // How you'd pass the current URL into the request
  var poll_id_param = pollphinVars.pollid;
  var srcurl = '';
  // request with userid or not...
  if (!userId) {
    srcurl = CONTENT_URL + "poll/" + poll_id_param + ".json?callback=response";
  }
  else {
    srcurl = CONTENT_URL + "poll/" + poll_id_param + "/" + userId + ".json?callback=response";
  }
  var script = document.createElement('script');
  script.src = srcurl;
  document.getElementsByTagName('head')[0].appendChild(script);
}

// GENERIC RESPONSE
function response(data) {
  if (!data) {
    errorResponse('Der Poll konnte nicht geladen werden.');
    return;
  }

  if (data.errorMsg !== null) {
    errorResponse(data.errorMsg);
    return;
  }

  var site = data.site;
  var loc = window.location.host;
  var voted = data.user.voted;

  if (site !== null) {
    // there is no String.contains(String) in js, so use indexOf instead
    if (loc.indexOf(site) != -1) {
      if (voted) {
        voteResponse(data);
      }
      else {
        pollResponse(data);
      }
    }
    else {
      errorResponse('Diese Umfrage darf nur auf ' + loc + ' eingebettet werden');
    }
  }
  else {
    if (voted) {
      voteResponse(data);
    }
    else {
      pollResponse(data);
    }
  }
}

// response to vote for poll
function pollResponse(data) {
  if (!data) {
    return;
  }

  var pollid = data.pollid;
  var selectableOption = data.maxAnswers;
  var usercookie = data.user.cookie;
  var question = data.question;
  var introduction = data.description;

  var inputtype = 'radio';
  var funct = 'singleOption(this,' + pollid + ');';
  if (selectableOption > 1) {
    inputtype = 'checkbox';
    funct = 'multiOption(' + pollid + ');';
  }

  // set cookie
  var userId = readCookie(USER_COOKIE);
  if (!userId) {
    writeCookie(USER_COOKIE, usercookie, 1000 * 60 * 60 * 24 * 365);
  }

  var div = document.getElementById(ROOT + pollid);
  var htmlContent_1 = '<div id="pollphincontent"><div class="box teaserpoll"> <div class="boxbody">	<h4>';
  var poll_img_tag = data.qImgPath != '' ? '<img class="embeddedImgAnswerOpt" src="' + data.qImgPath + '">' : '';
  var htmlContent_2 = question + '</h4><!-- show vote --><form id="pollVote" method="POST"><input id="selectableOptionCount" type="hidden" value="' + selectableOption + '" /><div id="opm0" style="display: none"><p> Sie koennen ' + selectableOption + ' Stimmen verteilen. </p> </div> <div id="opm1" style="display: none"><p> Sie haben noch nicht alle Ihrer ' + selectableOption + ' Stimmen verteilt. </p> </div><div id="opm2" style="display: none"><p> Sie haben alle Ihre Stimmen verteilt. </p></div><div id="opm3" style="display: none"><p> Sie haben zu viele Stimmen verteilt. Entfernen Sie bitte eine Stimme. </p></div><div><ul class="rich-datalist">';

  var list = '';
  var list_item_1 = '<li class="rich-list-item"><table><tr><td><input type="' + inputtype + '" onclick="' + funct + '" id="option' + pollid + '_';
  var list_item_2 = '" value="';
  var list_item_5 = '" />';
  var img_tag = '<img class="embeddedImgAnswerOpt" src="sourcePath">';
  var list_item_6 = '<label for="option' + pollid + '_';
  var list_item_3 = '">';
  var list_item_4 = '</label></td></tr></table></li>';
  for (var i = 0; i < data.answers.length; i = i + 1) {
    list += list_item_1;
    list += i;
    list += list_item_2;
    list += data.answers[i].id;
    list += list_item_5;
    list += list_item_6;
    list += i;
    list += list_item_3;
    if (data.answers[i].imgPath != '') {
      list += img_tag.replace(/sourcePath/, data.answers[i].imgPath);
    }
    list += data.answers[i].answer;
    list += list_item_4;
  }

  var pollhints = '';
  if (introduction != '' && introduction != 'Warum ist diese Umfrage interessant?') {
    pollhints = '<div class="pollhints"><span class="pollhintstitle">Hintergrund der Umfrage</span> <p>' + introduction + '</p></div>';
  }

  var htmlContent_3 = '</ul>' + pollhints + '<div class="submitinput"><table><tbody><tr><td class="buttonrow-R"><div class="buttonrow"><span class="submit" id="voteButton' + pollid + '" style="display: none"><a href="#' + ROOT + pollid + '" onclick="voteForPoll(' + pollid + ');">Abstimmen</a></span><span class="submit preview" id="voteButtonDisabled' + pollid + '"><a href="#">Abstimmen</a></span></div></td></tr></tbody></table></div></div></form></div><div class="boxfooter"><div class="bf-right"><a href="' + BASE_URL + 'poll/' + pollid + '">Zur Umfrage auf Pollphin.de</a></div></div></div></div>';

  div.innerHTML = htmlContent_1 + poll_img_tag + htmlContent_2 + list + htmlContent_3;  // assign new HTML into #ROOT
  div.style.display = 'block'; // make element visible
}

// response, which shows the result of the poll
function voteResponse(data) {
  if (!data) {
    return;
  }

  var pollid = data.pollid;
  var question = data.question;
  var introduction = data.description;
  var selectables = data.maxAnswers;

  var div = document.getElementById(ROOT + pollid);

  var htmlContent_1 = '<div id="pollphincontent"><div class="main"> <div class="box pollresult"> <div class="boxbody"><form id="pollForm" method="post" ><div><h4>';
  var poll_img_tag = data.qImgPath != '' ? '<img class="embeddedImgAnswerOpt" src="' + data.qImgPath + '">' : '';
  var htmlContent_2 = question + '</h4></div><div class="pollresulttable"><table class="rich-table pollresult" border="0" cellpadding="0" cellspacing="0"><colgroup span="2"></colgroup><tbody>';

  var list = '';
  var list_item_1_1 = ' <tr class="rich-table-row rich-table-firstrow"><td class="rich-table-cell graphcell" ><div class="graph blue';
  var list_item_1_2 = '" style="width: ';
  var list_item_2 = 'px"></div><span class="graphnum">';
  var img_tag = '<img class="embeddedImgAnswerOptRes" src="sourcePath">';
  var list_item_3 = '&nbsp;%</span></td><td class="rich-table-cell"><span class="graphoption">';
  var list_item_4 = '</span></td></tr>';
  // answers
  for (var i = 0; i < data.answers.length; i = i + 1) {
    var isHigh = isHighest(data.answers[i].percent, data.answers, selectables);

    if (isHigh === true) {
      list += list_item_1_1 + ' highest ' + list_item_1_2;
    }
    else {
      list += list_item_1_1 + list_item_1_2;
    }
    list += data.answers[i].width;

    list += list_item_2;
    list += data.answers[i].percent;
    list += list_item_3;
    if (data.answers[i].imgPath != '') {
      list += img_tag.replace(/sourcePath/, data.answers[i].imgPath);
    }
    list += data.answers[i].answer;
    list += list_item_4;
  }

  var pollhints = '';
  if (introduction != '' && introduction != 'Warum ist diese Umfrage interessant?') {
    pollhints = '<div class="pollhints"><span class="pollhintstitle">Hintergrund der Umfrage</span> <p>' + introduction + '</p></div>';
  }

  var htmlContent_3 = '</tbody></table></div>' + pollhints + '</form></div><div class="boxfooter"> <div class="bf-right"> <a href="' + BASE_URL + 'poll/' + pollid + '">Mehr Umfragen auf Pollphin.de</a></div> </div></div></div></div>';

  div.innerHTML = htmlContent_1 + poll_img_tag + htmlContent_2 + list + htmlContent_3;  // assign new HTML into #ROOT
  div.style.display = 'block'; // make element visible
}

function errorResponse(message) {
  var div = document.getElementById(ROOT + pollphinVars.pollid);
  var htmlContent_1 = '<div id="pollphincontent"><div class="main"> <div class="box pollresult"> <div class="boxbody"><form id="pollForm" method="post" ><div><h4>Es ist ein Fehler aufgetreten!';
  var htmlContent_2 = '</h4></div><div class="pollresulttable">';
  var htmlContent_3 = '</div><div class="pollhints"><span class="pollhintstitle">Grund:</span> <p>' + message + '</p></div></form></div><div class="boxfooter"> <div class="bf-right"> <a href="' + BASE_URL + '">Mehr Umfragen auf Pollphin.de</a></div></div></div></div></div>';
  div.innerHTML = htmlContent_1 + htmlContent_2 + htmlContent_3;  // assign new HTML into #ROOT
  div.style.display = 'block'; // make element visible
}

function loading() {
  var div = document.getElementById(ROOT + pollphinVars.pollid);
  var htmlContent_1 = '<div id="pollphincontent"><div class="main"> <div class="box pollresult"> <div class="boxbody"><form id="pollForm" method="post"><div class="pollresulttable">';
  var htmlContent_3 = '</div><div class="pollload">Poll wird geladen...</div></form></div><div class="boxfooter"> <div class="bf-right"> <a href="' + BASE_URL + '">Mehr Umfragen auf Pollphin</a></div></div></div></div></div>';
  div.innerHTML = htmlContent_1 + htmlContent_3;  // assign new HTML into #ROOT
  div.style.display = 'block'; // make element visible
}

// request stylesheet and content
if (pollphinVars.pollphinStyle == 'true') {
  requestStylesheet();
}

loading();
requestContent();

function isHighest(value, list, selectables) {
  var temp = selectables;
  var intValue = parseInt(value);
  for (var i = 0; i < list.length; i = i + 1) {
    var act = parseInt(list[i].percent);
    if (intValue < act) {
      if (temp == 1) {
        return false;
      }
      else {
        temp = temp - 1;
      }
    }
  }
  return true;
}

function readCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) == 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
}

// function to vote for poll
function voteForPoll(pollid) {
  var val = '';
  var i = 0;
  var element = document.getElementById('option' + pollid + '_' + i);
  while (element) {
    if (element.checked === true) {
      val += '/' + element.value;
    }
    i = i + 1;
    element = document.getElementById('option' + pollid + '_' + i);
  }

  var script = document.createElement('script');
  var site_id_param = window.location.host; // let's just use the current host
  var userId = readCookie(USER_COOKIE);
  var srcurl = '';
  if (userId) {
    srcurl = CONTENT_URL + 'voteuser/' + site_id_param + '/' + userId + '/' + pollid + val + ".json?callback=response";
  }
  else {
    srcurl = CONTENT_URL + 'vote/' + site_id_param + '/' + pollid + val + ".json?callback=response";
  }
  script.src = srcurl;
  document.getElementsByTagName('head')[0].appendChild(script);
}

function radioButton(radio) {
  var id = radio.name.substring(radio.name.lastIndexOf(':'));
  var el = radio.form.elements;
  for (var i = 0; i < el.length; i++) {
    if (el[i].name.substring(el[i].name.lastIndexOf(':')) == id) {
      el[i].checked = false;
    }
  }
  radio.checked = true;
}

function writeCookie(name, value, time) {
  var a = new Date();
  a = new Date(a.getTime() + time);
  document.cookie = name + '=' + value + '; expires=' + a.toGMTString() + '; path=/;';
}

function singleOption(act, pollid) {
  radioButton(act);

  var max = parseInt(document.getElementById('selectableOptionCount').value);
  var checked = 0;
  var i = 0;
  var element = document.getElementById('option' + pollid + '_' + i);
  while (element) {
    if (element.checked === true) {
      checked ++;
    }
    i = i + 1;
    element = document.getElementById('option' + pollid + '_' + i);
  }

  if (checked >= 1 && checked <= max) {
    document.getElementById('voteButtonDisabled' + pollid).style.display = 'none';
    document.getElementById('voteButton' + pollid).style.display = '';
  }
  else {
    document.getElementById('voteButtonDisabled' + pollid).style.display = '';
    document.getElementById('voteButton' + pollid).style.display = 'none';
  }
}

function multiOption(pollid) {
  var max = parseInt(document.getElementById('selectableOptionCount').value);
  var checked = 0;
  var i = 0;
  var element = document.getElementById('option' + pollid + '_' + i);
  while (element) {
    if (element.checked === true) {
      checked ++;
    }
    i = i + 1;
    element = document.getElementById('option' + pollid + '_' + i);
  }

  if (checked >= 1 && checked <= max) {
    document.getElementById('voteButtonDisabled' + pollid).style.display = 'none';
    document.getElementById('voteButton' + pollid).style.display = '';
  }
  else {
    document.getElementById('voteButtonDisabled' + pollid).style.display = '';
    document.getElementById('voteButton' + pollid).style.display = 'none';
  }

  if (max > 1) {
    document.getElementById('opm0').style.display = 'none';
    document.getElementById('opm1').style.display = 'none';
    document.getElementById('opm2').style.display = 'none';
    document.getElementById('opm3').style.display = 'none';

    if (checked === 0) {
      document.getElementById('opm0').style.display = '';
    }
    else if (checked > 0 && checked < max) {
      document.getElementById('opm1').style.display = '';
    }
    else if (checked == max) {
      document.getElementById('opm2').style.display = '';
    }
    else {
      document.getElementById('opm3').style.display = '';
    }
  }
}
