// 03.29.16
// DAS
//
function drawMySankey(AfluxList, $jsonObj, controlID) {
    var divID = $("#" + controlID).find("div[id*=ChartContainer]").attr('id');

    //Strip standard chart style from Sankey div
    // $("#" + divID).attr("style", "position:relative; top:25px;");
    $("#" + divID).attr("style", "");

    // get the parent height if it is their
    var defaultHeight = 440;
    var thetargetdiv = document.getElementById(divID);
    if (thetargetdiv.parentElement) {
        if (thetargetdiv.parentElement.clientHeight) {
            defaultHeight = thetargetdiv.parentElement.clientHeight;
        }
    }

    //console.log($jsonObj, controlID, divID);
    //return;

    var options = {
         width: 700, //SVG width
         svgHeight: defaultHeight, // QUAY EDIT 4/5/16 500, //SVG height
         linkColorScheme: 0, //0 (Source), 1 (Target), 2 (Gradient)
         units: "MGD", //units displayed with values
         nodeWidth: 50, //width of rects
         imgWidth: 60,// QUAY EDIT 4/5/16  80, //width of image
         imgHeight: 60, // QUAY EDIT 4/5/16 80, //height of image
         nodePadding: 8, // QUAY EDIT 4/5/16 80, 50, //vertical space between nodes
         // QUAY EDIT 4/5/16 BEGIN
         // this keeps the scale the same for all rectangles
         //useQS: true, //use custom scaling to make rects match links
         useQS: false, //use custom scaling to make rects match links
        // QUAY EDIT 4/5/16 END
         autoScaleImgHeight: false, //scale image based on rect height
         showText: true, //show text label beside Resource/Consumer
         imgPath: "/Images/Sankey/", //User defined path for Resource/Consumer images
        // QUAY EDIT 4/7/16
         titlefontsize: "24px",
         titleOffset: 20,
         bucketfontsize: "16px"
        //--------------------
        

    };
    //
    CreateSankey(AfluxList, $jsonObj, "#" + divID, options);
    //
}
function CreateSankey(TheFluxList, TheModelOutput, divID, options){

    //var SandKeyCreated;
    if (typeof (mySankey) == "undefined") {
        //Create a new Sankey
        mySankey = new Sankey(TheFluxList, TheModelOutput, divID, options);
        //drawSandkey(TheFluxList, TheModelOutput, divID, options);
    }
    else {
        //Update a current Sankey with new data
        mySankey.update(TheFluxList, TheModelOutput);
    }
}