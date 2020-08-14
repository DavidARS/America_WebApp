// Intial code 
//Sampson edit 08.13.14,08.28.14,10.01.14,03.09.15
// Moved to 16.1.1. on 1 October, 2014
// 16a.1.2 on 10 October, 2014
// to 19.3.2 on 5 March, 2015
// 06.01.15 - version 20.0.0
// ----------------------------------------------------------
// UI Version
var WaterSimVersion = "UI: 23.3.0  ";
var UI = WaterSimVersion.fontsize(1);
function SetVersion(theVersion) {
    $("#VersionInfo").html(theVersion);

}

function API(theVersion) {
    $("#Version").html(theVersion);
}

function Model(theVersion) {
    $("#Model").html(theVersion);
}
// ---------------------------------------------------------
//getting inforequest json data

//Remove inforequest from the body of the page
function remove_hvJSONData() {
    $('#hvJSONData').remove();
}

// STEPTOE EDIT BEGIN 11/08/15
//Enable/Disable the 'Load Selected Providers' button
function toggleLoadProviders(condition) {
    if (!$('#loadProviders').prop('disabled') || condition) {
        $('#loadProviders').switchClass("button-no-hover-active", "button-no-hover");
        $('#loadProviders').prop('disabled', true);
    }
    else {
        $('#loadProviders').switchClass("button-no-hover", "button-no-hover-active");
        $('#loadProviders').prop('disabled', false);
    }
}

//setting the controls with the data from the local storage
function setInputControlsFromScenario(JSONData) {

    var jsonstr = JSON.parse(JSONData);
    var jsonInputs = JSON.parse(jsonstr.inputJsonArray);
    // QUAY EDIT BEGIN 3/12/14 3:20
    //var strtYr = 0;
    //var endYr = 0;
    var strtYr = 2000;
    var endYr = 2085;
    // QUAY EDIT BEGIN 3/12/14 3:20

    $.each(jsonInputs.Inputs, function () {

        var fld = this.FLD;
        var val = this.VAL;

        if (fld == 'STARTYR') {
            strtYr = val;
        }
        else if (fld == 'STOPYR')
            endYr = val;

        else {
            // Quay Edit 6/4/14
            setSpecialInputControls(fld, val);
            //=================================
            //setting input controls
            $('.InputControl').each(function () {

                if ($(this).attr("data-key") == fld) {
                    $(this).find("div[id*=divslider]").attr("data-def", val);
                }
            });
        }
        //DASS


    });

    //setting temporal controls    
    if (strtYr == endYr) {

        $("#point-in-time").html(strtYr);
        $("#point").prop("checked", true)
    }

    else {
        $("#range-in-time-slider").attr("data-strtyr", strtYr);
        $("#range-in-time-slider").attr("data-endyr", endYr);
        $("#range").prop("checked", true)
    }

    setSlider();
}

//Moved process executed when run model is clicked to a function
function runModel() {

    if (!Sideshow.active){
        var subControls;
        var sum = 0;// to hold the sum if the sub controls value
        var subControlsValid;

        if ($(this).attr('id') == 'run-model-Pop') {

            //getting the sub contrls values and adding them
            /*$('.InputControl').each(function () {
            
                if ($(this).attr("data-Subs") != "") {
            
                    subControls = $(this).attr("data-Subs").split(',');
            
                    $.each(subControls, function () {
                        sum = sum + parseInt($('#' + this + '_lblSliderVal').html());
                    });
            
                    if (sum != 100) {
                        subControlsValid = false;
                    }
                    else
                        subControlsValid = true;
                }
            });*/
            subControlsValid = true;

            //if sum of sub controls is not equal to 100
            if (!subControlsValid) {
                alert("Please Ensure that the sum of sub controls is 100");
            }

            else {
                $('div[id*=panelDependents]').dialog("close");

                //hiding all sub controls
                jsonStr = JSON.parse(infoRequestJSON);

                $.each(jsonStr.FieldInfo, function () {
                    if (this.DEP != "") {
                        $.each(this.DEP, function () {
                            $('#' + this + "_ControlContainer").attr("style", "display:none");
                        });
                    }
                });
                callWebService(getJSONData('DEP'));
            }
        }
        else
            callWebService(getJSONData('parent'));
    }
    else {
        SetRunButtonState();
        $(".sideshow-subject-arrow").fadeOut();
        Sideshow.actionComplete = true;
    }

}
//STEPTOE END EDIT 11/09/15


//setting Provider check boxes
function setProviderCheckBoxes() {

    var jsonstr = JSON.parse(localStorage[localStorage.actvScenario]);
    var jsonOutputs = JSON.parse(jsonstr.outputJsonArray);
    var prvdrs = {};

    $.each(jsonOutputs.Providers, function () {
        prvdrs[this] = true;
    });

    //STEPTOE EDIT BEGIN 11/08/15
    //Update chosen select with initial values from the model
    var chosenSelect = $('.chosen-select');
    chosenSelect.val(jsonOutputs.Providers);
    chosenSelect.trigger('chosen:updated');
    //STEPTOE EDIT END

}


//reading and setting the scenario names as optons of dropdown list
function setLoadScenarios() {

    if (localStorage.scenarioList != "") {

        var name = localStorage.actvScenario;

        var scenarios = (localStorage.scenarioList).split(',');

        //setting scenarios
        $('#adj-scenarios-list').empty();
        $.each(scenarios, function (count) {
            if (scenarios[count] != "")
                $('#adj-scenarios-list').append('<li><input type="radio" class="saved-scenario" name="saved-scenario" value="' + count + '" /><label id="' + count + '">' + scenarios[count] + '</label></li>');
        });

        if (name != 'Base') {
            $('.saved-scenario').each(function (count) {
                if ($(this).siblings('label').html() == name)
                    $(this).attr('checked', true);
            });
        }
    }
}

//Setting the slider value by reading the property value property value
function setSliderValues() {

    var valCount = 0;
    var jsonStr;

    //looping through the input controls and setting the slider values by calling the meta data service
    $('.InputControl').each(function () {
        var controlID = $(this).attr('id');
        var fldName = "";
        var min = "";
        var max = "";
        var def = "";
        var subs = "";
        // ======BEGIN QUAY EDIT 6/17/14
        var tooltipstr = "";
        // ======END QUAY EDIT 

        //parsing the json
        jsonStr = JSON.parse(infoRequestJSON);

        //Getting the key word to compare and get the respective values of the slider
        var keyWord = $(this).attr("data-key");

        //setting the values of the sliders from the json
        $.each(jsonStr.FieldInfo, function () {

            //comparing the JSON to get its details
            if (this.FLD == keyWord) {

                fldName = this.LAB; //Getting Field Name
                min = this.MIN; //Getting Min Value
                max = this.MAX; //Getting Max Value
                subs = this.DEP; //Getting Sub control details
                def = this.DEFAULT;
                // ======BEGIN QUAY EDIT 6/17/14
                tooltipstr = this.LNG;
                // ======END QUAY EDIT 


                if (this.DEP != "") {

                    //var subid = ($(this).closest("div[id*=ControlContainer]").attr("data-Subs")).split(',');
                    $.each(this.DEP, function () {
                        $('#' + this + "_ControlContainer").attr("style", "display:none");
                    });
                }
                else
                    $("#" + controlID).find('div[id*=PopupButton]').hide();
            }
        });

        $('div[id*=panelDependents]').attr("style", "display:none");

        //Assigning the values obtained from the service
        $(this).find("span[id*=lblSliderfldName]").html(fldName);
        $(this).attr("data-fld", fldName);
        $(this).find("span[id*=lblSliderVal]").html(def);
        $(this).attr("data-Subs", subs);
        $(this).find("div[id*=divslider]").attr("data-min", min);
        $(this).find("div[id*=divslider]").attr("data-max", max);
        $(this).find("div[id*=divslider]").attr("data-def", def);
        // ======BEGIN QUAY EDIT 6/17/14
        $(this).find("div[id*=SliderTitle]").attr("title", tooltipstr);
        // ======END QUAY EDIT 


    });

    //saving the baase scenario
    localStorage[localStorage.BaseScenario] = getJSONData('ALL');

    //if ther is any data in local storage
    if (localStorage.actvScenario == "Base") {
        setSlider();
    }

    else {
        setInputControlsFromScenario(localStorage[localStorage.actvScenario]);
    }
}


//calling webservice and getting the json string
function callWebService(jsonData) {

    //STEPTOE ADD 07/15/15 BEGIN
    //If CoreAdd.js is included and window is Default.aspx send loading to all windows
    if (getWindowType() == 'Default')
        sendLoading()
    //STEPTOE ADD 07/15/15 END

    //auto-saving the scenario in local storage
    //localStorage[localStorage.actvScenario] = jsonData;

    //calling webservice
    $.ajax({

        type: "POST",
        url: "WaterSimService.asmx/GetData",
        data: jsonData,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: false,
        success: function ($res) {
            setInputControls($res.d);
            drawOutputCharts($res.d);

            //console.log($res.d);

            //STEPTOE ADD 07/15/15 BEGIN
            //If window is Default.aspx send webService data to windows
            if (getWindowType() == 'Default')
                sendWebServData($res.d);
            //STEPTOE ADD 07/15/15 END

            // QUAY EDIT 3/14/14 noon BEGIN
            SetRunButtonState();
            // QUAY EDIT 3/14/14 noon END;
        },
        error: function (xhr, status, error) {
            alert("Ajax : " + status + "\n" + error + "\n" + "status : " + xhr.status);
            alert(xhr.responseText);
        }
    });
}

// QUAY EDIT 3/19/14 Begin
// DAS edits 08.15.14 I added the parsing of the string for Web Service, API, and Model versions
function callWebServiceVersion() {

    //auto-saving the scenario in local storage
    //localStorage[localStorage.actvScenario] = jsonData;

    //calling webservice
    $.ajax({

        type: "POST",
        url: "WaterSimService.asmx/GetVersion",
        contentType: "application/json; charset=utf-8",
        //data:{},
        //dataType: "text",
        dataType: "json",
        //data: jsonData,
        //contentType: "application/json; charset=utf-8",
        async: false,
        success: function ($res) {
            var verdata = $.parseJSON($res.d);

            if (verdata.VERSION) {
                var MyVersion = verdata.VERSION.substring(10, verdata.length).fontsize(1);
                //
                var index_2 = MyVersion.indexOf("API");
                var Web = MyVersion.substring(0, index_2 - 1);
                SetVersion(UI + " " + Web);

                var index_3 = MyVersion.indexOf("Model");
                var APIv = MyVersion.substring(index_2, index_3 - 1).fontsize(1);
                API(APIv);

                var Modelv = MyVersion.substring(index_3 - 2, verdata.length).fontsize(1);

                Model(Modelv);

            }
        },
        error: function (xhr, status, error) {
            alert("Ajax : " + status + "\n" + error + "\n" + "status : " + xhr.status);
            alert(xhr.responseText);
        }
    });
}
function getSustainabilityIndicatorValues() {



}





//setTimeout(function () { alert("Drought Stop year not entered") }, 2000);

// Special code to handle customized input controls
// Quay 6/4/14

function setSpecialInputControls(aFLD, aval) {
    switch (aFLD) {
        case "COEXTSTYR":
            SetCoFlow(aval);
            break;
        case "SVEXTSTYR":
            SetSVFlow(aval)
            break;
    }
}


//Setting the slider with values obtained from the service
function setInputControls(outputJSON) {

    var jsonstr = $.parseJSON(outputJSON);

    $.each(jsonstr.RESULTS, function () {

        var fld = this.FLD;
        var val = this.VALS[0];
        var found = false;

        $('.InputControl').each(function () {

            if ($(this).attr("data-key") == fld) {
                //var fooid = $(this).find("div[id*=divslider]");
                $(this).find("div[id*=divslider]").attr("data-def", val);
                found = true;
            }
        });


        // QUAY EDIT 6/4/14
        // If an input control for this field was not found, then pass to special routine;
        if (!found) {
            setSpecialInputControls(fld, val);
        }
        //=========================
    });
    setSlider();
}

var jsondata;

var subControls;
var fldNames;
// QUAY EDIT BEGIN 3/12/14 4:00
var fldMAXes;
var fldMINes;
var fldUnits;
var fldLongunits;
// QUAY EDIT END 3/12/14 4:00
var fldValues;
var providerName;
var inputJSONStr;
var strtYr;
var endYr;
var $jsonObj;


function setStrtandEndYr() {
    //STEPTOE EDIT 07/15/15 Begin
    //If page is Default.aspx perform normal operations otherwise skip
    //If CoreAdd.js is included send data to tabs
    if (getWindowType() != "Charts") {
        $('input[name="temporal"]:checked').each(function () {

            if (this.value == "point-in-time") {
                strtYr = parseInt($("#point-in-time").html());
                endYr = parseInt($("#point-in-time").html());
            }
            else {
                strtYr = parseInt($("#range-in-time-slider").attr("data-strtyr"));
                endYr = parseInt($("#range-in-time-slider").attr("data-endyr"));
            }
        });
        if (getWindowType() == "Default")
            sendTemporalRadioChange();
    }
    //STEPTOE EDIT 07/15/15 END
}

//STEPTOE ADD 07/15/15 BEGIN
//Added to determine if Com is defined and if so return the window type
//if it is not defined assume window is Default.aspx without CoreAdd.js included
function getWindowType() {
    if (typeof (Com) != "undefined" && Com != null)
        return Com.windowType;
    else
        return null;
}
//STEPTOE ADD 07/15/15 END