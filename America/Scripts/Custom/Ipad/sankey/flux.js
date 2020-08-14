// FluxData List Class   Stores FluxData
function FluxDataList() {
    // the list of Flux Data
    this.List = new Array();
    // add a fluxdata item
    this.AddFlux = function (FluxDataItem) { this.List.push(FluxDataItem); };
    // finds a fluxdata item based on field name  Returns a FluxData object or null if not found
    this.FindByField = function (Fieldname) {
        founditem = null;
        for (FDLi = 0; FDLi < List.length; FDLi++) {
            if (List[FDLi].FieldName == Fieldname) {
                founditem = List[FDLi];
                break;
            }
        };
    };
    // Will process a function over all items in the list
    // do this must have form DoThis(FluxData)
    this.ForEach = function (DoThis) {
        if (DoThis != undefined) {
            for (FDLi = 0; FDLi < this.List.length; FDLi++) {
                DoThis(this.List[FDLi]);
            }
        }
    };
    // returns an array of FluxData items that match the ResourceFieldname
    this.GetResourceFluxes = function (ResourceFieldname) {
        results = new FluxDataList();
        for (FDLi = 0; FDLi < this.List.length; FDLi++) {
            if (this.List[FDLi].Resource == ResourceFieldname) {
                results.AddFlux(this.List[FDLi]);
            }
        };
        return results;
    };
    // returns an array of FluxData items that match the ConsumerFieldname
    this.GetConsumerFluxes = function (ConsumerFieldname) {
        results = new FluxDataList();
        for (FDLi = 0; FDLi < this.List.length; FDLi++) {
            if (this.List[FDLi].Consumer == ConsumerFieldname) {
                results.AddFlux(this.List[FDLi]);
            }
        };
        return results;
    };
}

//===========================================================================
// Flux Data Class

// Constructor
// Fieldname : String, the name of the fieldname for this fluxdata
// values: [Array].  array of values, one for each year
// Source: string, this is the fieldname of the Fluc Source (Resource)
// Target: string, this is the fieldname of the Flux Target (consumer)

function FluxData(FieldName, values, Source, Target) {
    // The fieldname coming from web service foir this flux data
    this.Fieldname = FieldName;
    // The array of Values (should be an array) may be just a single value
    this.Values = values;
    // the Resource Fieldname
    this.Resource = Source;
    // the Consumer Fieldname
    this.Consumer = Target;
    // gets the Lastvalue of teh array
    this.LastValue = function () {
        if (this.Values.length != undefined) {
            return this.Values[this.Values.length - 1];
        }
        else {
            return this.Values;
        }
    };
}
//-------------------------------------------------------------------
// This is where the flux data is stored 
var TheFluxList = new FluxDataList();

function ProcessFluxData(TheOutput) {
    if (TheOutput.RESULTS != undefined) {
        TheFluxList.List = [];
        var TheResultsArray = TheOutput.RESULTS;
        for (ori = 0; ori < TheResultsArray.length; ori++) {
            theitem = TheResultsArray[ori];
            theFLD = theitem.FLD;
            theVALS = theitem.VALS;
            switch (theFLD) {
                case "SUR_UD":
                    FluxDataItem = new FluxData(theFLD, theVALS, "SUR", "UD");
                    TheFluxList.AddFlux(FluxDataItem);
                    break;
                case "SUR_AD":
                    FluxDataItem = new FluxData(theFLD, theVALS, "SUR", "AD");
                    TheFluxList.AddFlux(FluxDataItem);
                    break;
                case "SUR_ID":
                    FluxDataItem = new FluxData(theFLD, theVALS, "SUR", "ID");
                    TheFluxList.AddFlux(FluxDataItem);
                    break;
                case "SUR_PD":
                    FluxDataItem = new FluxData(theFLD, theVALS, "SUR", "PD");
                    TheFluxList.AddFlux(FluxDataItem);
                    break;
                case "SURL_UD":
                    FluxDataItem = new FluxData(theFLD, theVALS, "SURL", "UD");
                    TheFluxList.AddFlux(FluxDataItem);
                    break;
                case "SURL_AD":
                    FluxDataItem = new FluxData(theFLD, theVALS, "SURL", "AD");
                    TheFluxList.AddFlux(FluxDataItem);
                    break;
                case "SURL_ID":
                    FluxDataItem = new FluxData(theFLD, theVALS, "SURL", "ID");
                    TheFluxList.AddFlux(FluxDataItem);
                    break;
                case "SURL_PD":
                    FluxDataItem = new FluxData(theFLD, theVALS, "SURL", "PD");
                    TheFluxList.AddFlux(FluxDataItem);
                    break;
                case "GW_UD":
                    FluxDataItem = new FluxData(theFLD, theVALS, "GW", "UD");
                    TheFluxList.AddFlux(FluxDataItem);
                    break;
                case "GW_AD":
                    FluxDataItem = new FluxData(theFLD, theVALS, "GW", "AD");
                    TheFluxList.AddFlux(FluxDataItem);
                    break;
                case "GW_ID":
                    FluxDataItem = new FluxData(theFLD, theVALS, "GW", "ID");
                    TheFluxList.AddFlux(FluxDataItem);
                    break;
                case "GW_PD":
                    FluxDataItem = new FluxData(theFLD, theVALS, "GW", "PD");
                    TheFluxList.AddFlux(FluxDataItem);
                    break;
                case "REC_UD":
                    FluxDataItem = new FluxData(theFLD, theVALS, "REC", "UD");
                    TheFluxList.AddFlux(FluxDataItem);
                    break;
                case "REC_AD":
                    FluxDataItem = new FluxData(theFLD, theVALS, "REC", "AD");
                    TheFluxList.AddFlux(FluxDataItem);
                    break;
                case "REC_ID":
                    FluxDataItem = new FluxData(theFLD, theVALS, "REC", "ID");
                    TheFluxList.AddFlux(FluxDataItem);
                    break;
                case "REC_PD":
                    FluxDataItem = new FluxData(theFLD, theVALS, "REC", "PD");
                    TheFluxList.AddFlux(FluxDataItem);
                    break;
                case "SAL_UD":
                    FluxDataItem = new FluxData(theFLD, theVALS, "SAL", "UD");
                    TheFluxList.AddFlux(FluxDataItem);
                    break;
                case "SAL_AD":
                    FluxDataItem = new FluxData(theFLD, theVALS, "SAL", "AD");
                    TheFluxList.AddFlux(FluxDataItem);
                    break;
                case "SAL_ID":
                    FluxDataItem = new FluxData(theFLD, theVALS, "SAL", "ID");
                    TheFluxList.AddFlux(FluxDataItem);
                    break;
                case "SAL_PD":
                    FluxDataItem = new FluxData(theFLD, theVALS, "SAL", "PD");
                    TheFluxList.AddFlux(FluxDataItem);
                    break;

            }
        }
    }
}

total = 0;
function SumAll(FluxItem) {
    total = total + FluxItem.LastValue();
}
//=========================================================
function ReportFluxData() {
    mySurfaceList = TheFluxList.GetResourceFluxes("SUR");
    mySurfaceList.ForEach(SumAll);
    SurfaceValue = total;


}