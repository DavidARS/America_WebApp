//  Gets the Input and Output JSON to pass to the Web Service
//  inputType can be three values 
//  ''  or anything
//  'ALL'
//  'empty'
//  'DEP'
//  'parent'

//  For inputType = 'ALL"    
//      This will set STOPYR and STARTYR based on temporal controls
//      pushes all input fields as input and for output

//  For inout Type = 'parent'
//      This will end up setting STOPYR to 2050 and STARTYR is not specified
//      Only pushes inputfields that are parents, no dependent fields

//  For inout Type = 'DEP'
//      This will end up setting STOPYR to 2050 and STARTYR is not specified
//      Only pushes inputfields that are dependents no parent fields


// for all inoutType = all values
//      loops through and gathers all input control values



function getJSONData(inputType) {

    var inputData = {};
    var outputData = {};
    var eyr = {};
    var inputFields = [];
    var duplicate = {};
    var jsonData = {};
    var input = {};
    var output = [];
    var outputFields = [];
    var dependent = {};

    //start year and end year
    /*$('input[name="temporal"]:checked').each(function () {        

        if (this.value == "point-in-time") {
            eyr["FLD"] = "STOPYR";
            eyr["VAL"] = parseInt($("#point-in-time").html());
            inputFields.push(eyr);
        }
        else {
            eyr["FLD"] = "STOPYR";
              eyr["VAL"] = 2040;//parseInt($("#range-in-time-slider").attr("data-endyr"));
            inputFields.push(eyr);
        }
    });*/

    if (inputType == 'ALL') {

        $('input[name="temporal"]:checked').each(function () {

            if (this.value == "point-in-time") {
                eyr["FLD"] = "STARTYR";
                eyr["VAL"] = parseInt($("#point-in-time").html());
                inputFields.push(eyr);

                eyr = {};

                eyr["FLD"] = "STOPYR";
                eyr["VAL"] = parseInt($("#point-in-time").html());
                inputFields.push(eyr);
            }
            else {
                eyr["FLD"] = "STARTYR";
                eyr["VAL"] = parseInt($("#range-in-time-slider").attr("data-strtyr"));
                inputFields.push(eyr);

                eyr = {};

                eyr["FLD"] = "STOPYR";
                eyr["VAL"] = parseInt($("#range-in-time-slider").attr("data-endyr"));
                inputFields.push(eyr);
            }
        });
    }
    else {
        eyr["FLD"] = "STOPYR";
        eyr["VAL"] = 2050;//parseInt($("#range-in-time-slider").attr("data-endyr"));
        inputFields.push(eyr);

        //das
        eyr = {};
        eyr["FLD"] = "DECSNGAME";
        eyr["VAL"] = 0;
        inputFields.push(eyr);
        // QUAY EDIT

    }

    //getting input controls
    $('.InputControl').each(function () {
        input = {};

        input["FLD"] = $(this).attr("data-key");
        var FooTest = $(this).find("span[id*=lblSliderVal]");
        var FooStr = $(this).find("span[id*=lblSliderVal]").html();
        input["VAL"] = parseInt($(this).find("span[id*=lblSliderVal]").html());


        var dep = ($(this).attr("data-Subs")).toString().split(',');

        $.each(dep, function () {
            dependent[this] = true;
        });

        //checking for duplicate       
        if (!duplicate[$(this).attr("data-key")]) {

            if (inputType == 'parent' && !dependent[input["FLD"]]) {
                inputFields.push(input);
            } else if (inputType == 'DEP' && $(this).attr("data-Subs") == "") {
                inputFields.push(input);
            } else if (inputType == 'ALL') {
                inputFields.push(input);
            }

            outputFields.push(input["FLD"]);

        }
        duplicate[$(this).attr("data-key")] = true;

    });

    if (inputType == 'empty') {
        var DefaultInputs = [];
        eyr = {};

        // DAS edit, 04.20.15
        eyr = {};
        eyr["FLD"] = "DECSNGAME";
        eyr["VAL"] = 0;
        inputFields.push(eyr);
        // QUAY EDIT
        // Forcing this to true
        eyr = {};
        eyr["FLD"] = "AWSLIMIT";
        eyr["VAL"] = 1;
        DefaultInputs.push(eyr);

        //// get flow years
        // create object
        eyr = {};
        // assign field and value
        eyr["FLD"] = "COEXTSTYR";
        eyr["VAL"] = CORiverFlowValue;
        // push this as an input value
        DefaultInputs.push(eyr);
        // request this as a data field
        outputFields.push(eyr["FLD"]);

        eyr = {};
        eyr["FLD"] = "SVEXTSTYR";
        eyr["VAL"] = SVRiverFlowValue;
        DefaultInputs.push(eyr);
        outputFields.push(eyr["FLD"]);

        // DAS edits 10.15.14
        eyr = {};
        eyr["FLD"] = "COUSRSTR";
        eyr["VAL"] = CODroughtStartValue;
        DefaultInputs.push(eyr);
        outputFields.push(eyr["FLD"]);

        eyr = {};
        eyr["FLD"] = "COUSRSTP";
        eyr["VAL"] = CODroughtStopValue;
        DefaultInputs.push(eyr);
        outputFields.push(eyr["FLD"]);

        eyr = {};
        eyr["FLD"] = "SVUSRSTR";
        eyr["VAL"] = STVDroughtStartValue;
        DefaultInputs.push(eyr);
        outputFields.push(eyr["FLD"]);

        eyr = {};
        eyr["FLD"] = "SVUSRSTP";
        eyr["VAL"] = STVDroughtStopValue;
        DefaultInputs.push(eyr);
        outputFields.push(eyr["FLD"]);

        inputData["Inputs"] = DefaultInputs;
        // QUAY EDIT

        //inputData["Inputs"] = [];

    } else {

        // DAS edit. 04.20.15
        eyr = {};
        eyr["FLD"] = "DECSNGAME";
        eyr["VAL"] = 0;
        inputFields.push(eyr);
        // QUAY EDIT

        eyr = {};
        eyr["FLD"] = "AWSLIMIT";
        eyr["VAL"] = 1;
        inputFields.push(eyr);

        // get flow years
        eyr = {};
        eyr["FLD"] = "COEXTSTYR";
        eyr["VAL"] = CORiverFlowValue;
        inputFields.push(eyr);
        // request this as a data field
        outputFields.push(eyr["FLD"]);

        eyr = {};
        eyr["FLD"] = "SVEXTSTYR";
        eyr["VAL"] = SVRiverFlowValue;
        inputFields.push(eyr);
        // request this as a data field
        outputFields.push(eyr["FLD"]);
        //  QUAY EDIT
        // DAS edits
        // 02.27.15
        // This is the bool for the deltat burden to Arizona; false we share the burden, true AZ covers all
        // CO delta water
        eyr = {};
        eyr["FLD"] = "CODELTAB";
        eyr["VAL"] = 0;
        inputFields.push(eyr);
        // request this as a data field
        outputFields.push(eyr["FLD"]);
        // eyr = {};
        //
        var COstart_array = $('input[id="COUSRSTR_v"]');
        var COstart = undefined;
        if ($('input[id="COUSRSTR_v"]').length > 0)
            COstart = COstart_array[0].value;
        var MinDifference = "10";

        if (COstart != undefined) {
        }
        else {
            var COstart = "2010";
        }
        if (COstart != "") {
            eyr = {};
            eyr["FLD"] = "COUSRSTR";
            eyr["VAL"] = COstart;
            inputFields.push(eyr);
        }

        var COstop_array = $('input[id="COUSRSTP_v"]');
        var COstop = undefined;
        if ($('input[id="COUSRSTP_v"]').length > 0)
            COstop = COstop_array[0].value;

        if (COstop != undefined) {
            if (COstart != "") {

                if (COstop == "") {
                    alert("No drought stop year: Colorado River- was entered!");
                    COstop = COstart;
                }
            }

        }
        else {
            COstop = "2015";
        }

        if (COstop != "") {
            eyr = {};
            eyr["FLD"] = "COUSRSTP";
            eyr["VAL"] = COstop;
            inputFields.push(eyr);
        }

        var STVstart_array = $('input[id="SVUSRSTR_v"]');
        var STVstart = undefined;
        if ($('input[id="SVUSRSTR_v"]').length > 0)
            STVstart = STVstart_array[0].value;

        if (STVstart != undefined) {

            if (STVstart != "") {
                if (STVstop == "") {
                    alert("No drought stop year: Salt-Verde Rivers- was entered!");
                    STVstop = STVstart;
                }
            }
        }
        else {
            STVstart = "2010";
        }
        if (STVstart != "") {
            eyr = {};
            eyr["FLD"] = "SVUSRSTR";
            eyr["VAL"] = STVstart;
            inputFields.push(eyr);
        }

        var STVstop_array = $('input[id="SVUSRSTP_v"]');
        var STVstop = undefined;
        if ($('input[id="SVUSRSTP_v"]').length > 0)
            STVstop = STVstop_array[0].value;


        if (STVstop != undefined) {
        }
        else {
            STVstop = "2015";
        }
        if (STVstop != "") {
            eyr = {};
            eyr["FLD"] = "SVUSRSTP";
            eyr["VAL"] = STVstop;
            inputFields.push(eyr);
        }


        inputData["Inputs"] = inputFields;
    }

    //getting output controls
    $('.OutputControl').each(function () {
        output = [];
        output = ($(this).attr("data-fld")).split(',');

        //checking for duplicate
        $.each(output, function () {

            if (!duplicate[this]) {
                outputFields.push(this);
            }
            duplicate[this] = true;
        });
    });

    //Skip if window is Charts
    if (getWindowType() != 'Charts') {
        //getting dependent fields
        var infoRequest = JSON.parse(infoRequestJSON);

        $.each(infoRequest.FieldInfo, function () {

            if (this.DEP)
                $.each(this.DEP, function () {

                    if (!duplicate[this]) {
                        outputFields.push(this);
                    }
                    duplicate[this] = true;
                });
        });
    }
    $('.IndicatorControl').each(function () {
        output = [];
        output = ($(this).attr("data-fld")).split(',');

        //checking for duplicate
        $.each(output, function () {

            if (!duplicate[this]) {
                outputFields.push(this);
            }
            duplicate[this] = true;
        });

        if (outputFields["name"] == "SINPCTGW ") {
            var val = this.VALS[0];
            var GW = val;
            One(GW);

        };
    });

    outputData["Outputs"] = outputFields;//['all'];

    //getting providers
    var providers = [];

    //STEPTOE EDIT BEGIN 11/08/15
    //If chosen is not empty then use the selected providers as input
    //otherwise use the default values
    if ($('.chosen-select').val() != null)
        providers = $('.chosen-select').val();
    else
        providers = ["reg", "bu", "ch", "gi", "ph", "sc"];
    //STEPTOE EDIT END 11/08/15

    outputData["Providers"] = providers;

    jsonData['inputJsonArray'] = JSON.stringify(inputData);
    jsonData['outputJsonArray'] = JSON.stringify(outputData);

    return JSON.stringify(jsonData);
}
// End of function getJSONData(inputType) {