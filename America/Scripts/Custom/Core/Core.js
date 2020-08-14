// From  Scripts/Custom/Core
/// <reference path="/Scripts/Custom/Charts/ChartTools.js" />
/// <reference path="/Scripts/Custom/Charts/AreaChart.js" />
/// <reference path="/Scripts/Custom/Charts/DrillDownChartBO.js" />
/// <reference path="/Scripts/Custom/Charts/DrillDownColumnChartBO.js" />
/// <reference path="/Scripts/Custom/Charts/DrillDownLineChartTEMP.js" />
/// <reference path="/Scripts/Custom/Charts/DrillDownPieColumnChartMF.js" />
/// <reference path="/Scripts/Custom/Charts/DrillDownPieColumnChartMP.js" />
/// <reference path="/Scripts/Custom/Charts/DrillDownSingleColumnChart.js" />
/// <reference path="/Scripts/Custom/Charts/HighStocks.js" />
/// <reference path="/Scripts/Custom/Charts/LineChartMP.js" />
/// <reference path="/Scripts/Custom/Charts/ProviderChart.js" />
/// <reference path="/Scripts/Custom/Charts/StackedAreaChart.js" />
/// <reference path="/Scripts/Custom/Charts/StackedColumnChart.js" />
/// <reference path="/Assets/indicators/Scripts/IndicatorControl_v_4.js" />
/// <reference path="/Assets/indicators/Scripts/reportindicator.js" />
/// <reference path="/Assets/indicators/Scripts/indicatorsCore_v2.js" />

// Version DAS 02.24.16 
//
//If the page is not a charts page setup the base scenario and
//get list of available providers and their names
if (getWindowType() != 'Charts') {
    var infoRequestJSON = $('input[id$=JSONData]').val();
    localStorage.clear();
    //setting a default name to active scenario
    if (!localStorage.actvScenario) {
        localStorage.BaseScenario = "Base";
        localStorage.actvScenario = "Base";
        localStorage.scenarioList = "";
    }

    //STEPTOE EDIT BEGIN 11/08/15
    //Remove initial json information from html page 
    remove_hvJSONData();

    var providerInfo = {};
    var providersAdded = false;
    //store all available providers and their codes 
    function setupProviderInfo() {
        var options = $('.chosen-select option');

        for (var i in options) {
            providerInfo[options[i].value] = options[i].text;
        }
    }
    setupProviderInfo();
    //STEPTOE EDIT END 11/08/15
}

//If the page is not Charts.aspx then setup the Chosen-JS Selector
//and the 'Load Selected Providers' button
//if (getWindowType() != 'Charts') {
//    $(document).ready(function () {
//        //Initialize selector to be a Chosen selector
//        $('.chosen-select').chosen({
//            width: "100%",
//            max_selected_options: 6
//        });

//        //When the selecter's values change enable the 'Load Selected Providers' button
//        //if there are providers available.
//        $('.chosen-select').chosen().change(function (evt, params) {
//            var providers = $(this).chosen().val();

//            //Use this code segment to update the provider lists as the selects and deselects
//            for (var i in params) {
//                if (i == 'selected') {
//                }
//                else if (providers != null && providers.length > 0) {

//                }
//                else {
//                    $(".ddlflds option[value='" + params[i] + "']").remove();
//                    toggleLoadProviders(true);
//                }
//            }

//            //If there are proivders selected and the 'Load Selected Providers' button is disabled
//            //then enable the button
//            if (providers != null && $('#loadProviders').prop('disabled')) {
//                toggleLoadProviders();
//            }
//        });

//        //When 'Load Selected Providers' button is clicked setup each chart's selector,
//        //disable the load button, and then run the model
//        $('#loadProviders').click(function () {
//            var providers = $('.chosen-select').chosen().val();

//            //Get the current selected provider for each chart
//            var selectedOptions = $(".ddlflds option:selected"),
//            valArray = [];
//            for (var i = 0; i < selectedOptions.length; i++) {
//                valArray.push(selectedOptions[i].value);
//            }

//            //Remove all providers from each chart and set them to the proivders
//            //recieved
//            $(".ddlflds").html('');
//            for (var i in providers) {
//                $('.ddlflds')
//                    .append($("<option></option>")
//                    .attr("value", providers[i])
//                    .text(providerInfo[providers[i]]));
//            }

//            //Set the selected proivder to the previous selection if available
//            //for each chart
//            for (var i = 0; i < valArray.length; i++) {
//                $('.ddlflds')[i].value = valArray[i];
//            }

//            //'Load Selected Providers' button and then run the model
//            toggleLoadProviders();
//            runModel();
//        });
//    });
//}
// STEPTOE EDIT END 11/08/15

// Set up Scenario Buttons

// Save Screnario
$(document).ready(function () {

    //dialog box
    $("#dialog").dialog({
        autoOpen: false,
        height: 175,
        width: 350,
        modal: true,

        buttons: {

            "Save Scenario": function () {

                if (typeof (Storage) !== "undefined") {

                    var name = $("#tbdialogScenarioName").val();
                    $("#tbdialogScenarioName").val("");

                    localStorage.actvScenario = name;
                    localStorage[localStorage.actvScenario] = getJSONData('ALL');

                    localStorage.scenarioList += "," + name;
                    setLoadScenarios();

                    alert("You saved a scenario successfully!!!");
                }

                else {
                    alert("Sorry, your browser does not support web storage...");
                }

                $(this).dialog("close");
            }
        },
        open: function (event) {
            $('.ui-dialog-buttonpane').find('button:contains("Save Scenario")').addClass('button');
        }
    });

    //saving the data in local storage
    $('#savebutton').click(function () {

        if (localStorage.actvScenario == "Base")

            $("#dialog").dialog("open");

        else {

            if (typeof (Storage) !== "undefined") {

                var name = localStorage.actvScenario;

                localStorage[localStorage.actvScenario] = getJSONData('ALL');

                alert("You saved the scenario to " + name + " successfully!!!");
            }

            else {
                alert("Sorry, your browser does not support web storage...");
            }
        }
    });

    //Creating new copy
    $("#createbutton").click(function () {
        $("#dialog").dialog("open");
    });

    //loading Adjusted Scenario from local storage
    $("#loadASbutton").click(function () {

        if ($('input[name="saved-scenario"]:checked').val()) {

            var scenarioName = $('input[name="saved-scenario"]:checked').siblings("label").html();

            if (typeof (Storage) !== "undefined") {

                if (localStorage[scenarioName]) {

                    //loading the scenario and calling the web service
                    setInputControlsFromScenario(localStorage[scenarioName]);
                    localStorage.actvScenario = scenarioName;
                    setProviderCheckBoxes();
                    callWebService(getJSONData('parent'));

                    alert("You loaded a scenario successfully!!!");
                }
                else {
                    alert("Sorry, you don't have any saved scenarios...");
                }
            }
            else {
                alert("Sorry, your browser does not support web storage...");
            }
        }
        else {

            if ($('#adj-scenarios-list').find("input[type=radio]"))
                alert("Sorry, you don't have any saved scenarios...");

            else
                alert("Please select any of the saved scenarios...");
        }

    });


    //loading Base Scenario from local storage
    $("#loadBSbutton").click(function () {

        if (typeof (Storage) !== "undefined") {

            var scenarioName = localStorage.BaseScenario;

            //loading the Base scenario and calling the web service
            setInputControlsFromScenario(localStorage[scenarioName]);
            localStorage.actvScenario = scenarioName;
            setLoadScenarios();
            setProviderCheckBoxes();
            SetFlowRadio("default")
            // QUAY EDIT 6/13/14
            //callWebService(getJSONData('parent'));
            callWebService(getJSONData('empty'));
            //
            setDefaultDrought();
            // STEPTOE EDIT 08/04/15 BEGIN
            //Reset all previous indicator values to '...'
            $('.IndicatorControl_OLD').each(function () {
                this.innerHTML = " ... "
            });
            // STEPTOE EDIT 08/04/15 BEGIN

            //====================================
            alert("You loaded a scenario successfully!!!");
        }

        else {
            alert("Sorry, your browser does not support web storage...");
        }

    });

});

$(document).ready(function () {
    $('div[id*=panelDependents]').dialog({
        modal: true,
        autoOpen: false,
        height: 275,
        width: 360
    });
});

//hiding labels of the user controls used as properties and assigning to their respective div properties
(function () {

    //hiding the keyword property label in input
    $('.InputControl').each(function () {

        //assigning        
        $(this).attr("data-key", $(this).find("span[id*=lblSliderKeyWord]").html());

        //hiding labels
        $(this).find("span[id*=lblSliderKeyWord]").hide();
    });

    //hiding the type property label in output
    $('.OutputControl').each(function () {

        //assigning
        $(this).attr("data-Type", $(this).find("span[id*=lblChartOption]").html());
        $(this).attr("data-fld", $(this).find("span[id*=lblFldName]").html());
        $(this).attr("data-title", $(this).find("span[id*=lblTitle]").html());
        $(this).attr("data-series", $(this).find("span[id*=lblSeries]").html());
        //hiding labels
        $(this).find("span[id*=lblChartOption]").hide();
        $(this).find("span[id*=lblFldName]").hide();
        $(this).find("span[id*=lblTitle]").hide();
    });
})();

//Getting the div ID drop down list selected item changed
$(".ddlType").change(function () {
    drawChart($(this).closest('div[id*=OutputControl]').attr('id'));
});

//Getting the div ID drop down list selected item changed
$(".ddlflds").change(function () {
    drawChart($(this).closest('div[id*=OutputControl]').attr('id'));
});


//drwaing charts on temporal slider(years) change
$(document).on('mouseup', '.temporal', function (event) {

    var refresh = false;
    $('input[name="temporal"]:checked').each(function () {

        if (this.value == "point-in-time" && event.currentTarget.id == "point-in-time-slider") {
            refresh = true;
        } else if (this.value == "range-in-time" && event.currentTarget.id == "range-in-time-slider") {
            refresh = true;
        }
    });

    if (!refresh) {
        return;
    }
    setStrtandEndYr();

    //looping through the output controls and getting the required data and populating the charts
    $('.OutputControl').each(function () {
        var controlID = $(this).attr('id');
        drawChart(controlID);
    });

    drawAllIndicators();
});



$(document).on('change', 'input[name="geography"]', function () {

    var provider = $(this).val();

    //looping through the output controls and getting the required data and populating the charts
    $('.OutputControl').each(function () {

        var controlID = $(this).attr('id');
        var type = $("#" + controlID).attr("data-Type");

        if (type == "MFOP") {
            $("#" + controlID).find("select[id*=ddlfld]").val(provider);
            drawChart(controlID);
        }
    });
    //STEPTOE EDIT 07/15/15 BEGIN
    //If Core.js is included and Window is Default.aspx send geography data to tabs
    if (getWindowType() == 'Default')
        sendGeographyRadioChange(provider);
    //STEPTOE EDIT 07/15/15 END
});

//drwaing charts on temporal radio change
$(document).on('change', 'input[name="temporal"]', function () {

    setStrtandEndYr();

    //looping through the output controls and getting the required data and populating the charts
    $('.OutputControl').each(function () {
        var controlID = $(this).attr('id');
        drawChart(controlID);
    });

    drawAllIndicators();
});

//STEPTOE BEGIN EDIT 11/09/15
//Raising "Run Model" button click event and calling web service
$(document).on('click', '.run-model', runModel);

//Toggling the sub controls
$(document).on('click', '.ui-slider-popup-button', function () {

    if ($(this).closest("div[id*=ControlContainer]").attr("data-Subs") != "") {

        var subid = ($(this).closest("div[id*=ControlContainer]").attr("data-Subs")).split(',');

        $.each(subid, function () {
            $('#' + this + "_ControlContainer").attr("style", "display:inline");
        });

        $('div[id*=panelDependents]').dialog("open");
    }
});
//Toggling the sub controls
$(document).on('click', '.trace-CO', function () {

    var subControls;
    var sum = 0;// to hold the sum if the sub controls value
    var subControlsValid;
    var inputData = {};

    var DefaultInputs = [];
    eyr = {};

    if ($(this).attr('id') == 'trace-CO-one') {
        eyr = {};
        eyr["FLD"] = "COEXTSTYR";
        // eyr["VAL"] = 1939;
        eyr["VAL"] = 1938;
        DefaultInputs.push(eyr);

        inputData["Inputs"] = DefaultInputs;


    };


});

////Self invoking function to set the input values and calling web service to populate the charts
(
    function () {
        //STEPTOE 07/11/14
        //If Com is defined and Window is a Charts tab overwrite Default functions
        if (getWindowType() == 'Charts') {
            setSliderValues = function () { };
            setProviderCheckBoxes = setSliderValues;
            initializeIndicators = setSliderValues;
            drawAllIndicators = setSliderValues;
            callWebService = callWebServiceCharts;
            var type = $.urlParam('type');
            if (type != null) {
                checkBoxValues[type] = true;
                $('#checkbox'+type).prop('checked', true);
            }
            callWebServiceVersion();
            return;
        }
        //STEPTOE EDIT 07/11/15 END

        //$(document).ready(function () {
        //$("#MainForm").show();
        //setting the slider values
        setSliderValues();

        //checking the provider list check boxes
        setProviderCheckBoxes();

        initializeIndicators();

        //calling the webservice
        if (localStorage.actvScenario == "Base") {
            callWebService(getJSONData('empty'));
        }

        else {
            callWebService(getJSONData('parent'));


        }
        // THis function I cannot FIND!!!
        // 01.31.17
        //
        // QUAY EDIT 3/18/14 Begin
        callWebServiceVersion();
        //SetVersion(WaterSimVersion);
        // QUAY EDIT 3/18/14 End;Begin

        //setting load scenarios list from local storage
        setLoadScenarios();
        // DAS ADDED 6/25/14
        // OK turn the walkthrough wizard off
        // 03.09.15 DAS
        // $("#wizard").fadeOut();
        //-------------------------

        //STEPTOE EDIT 12/08/2015
        //Hide input sliders and show buttons to select values
        inputControls2Radios();

        $("#WSLoading").hide();
        // DAS - this is a "cludge" as part of another funciton to stop the splash page from loading text
        // September, 2014
        $("#dashboard-header-h1").show();
       

        //STEPTOE 12/08/2015
        //Uncomment to start Sideshow
       // Sideshow.start();
        // 

    })();
// E.O.F.
