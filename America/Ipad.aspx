<%@ Page Title="iPad Home" Language="C#" MasterPageFile="~/Ipad.Master" AutoEventWireup="true" CodeBehind="Ipad.aspx.cs" Inherits="WaterSimUI._Ipad" %>

<%@ Register Src="UserControls/OutputUserControl.ascx" TagName="OutputUserControl" TagPrefix="Wsmo" %>

<%@ Register Src="UserControls/InputUserControl.ascx" TagName="InputUserControl" TagPrefix="Wsmi" %>

<asp:Content runat="server" ID="BodyContent" ContentPlaceHolderID="GraphControls">


    <%--QUAY EDIT 3/29/16 Begin--%>
    <link href="Content/WSA_Assessment.css" rel="stylesheet" />
    <div id="idAssessment" style="background-color: #e6e6e6; width: 100%; height: 100%; border-radius: 24px; left: 24px; right: 24px; top: 24px/*; bottom: 24px; */">
    </div>

    <%--QUAY EDIT 3/29/16 Begin--%>

    <div id="tabs">
        <ul>
            <li><a href="#tabs-1">Flow Diagram</a></li>
            <li><a href="#tabs-2">Bar Charts</a></li>
        </ul>
        <div id="tabs-1">
            <div class="frame" id="basic-supply-data">
                <div id="isotope-supply-container">
                    <div class="item transition WaterSupply">
                        <div class="chart">
                            <Wsmo:OutputUserControl runat="server" ID="OutputUserControl4" Type="WSASK" FieldName="" Title="Sandkey" SeriesColors="5" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div id="tabs-2">
            <div class="frame" id="basic-demand-data">
                <div id="isotope-demand-container">
                    <div class="item transition WaterSupply">
                        <div class="chart">
                            <Wsmo:OutputUserControl runat="server" ID="OutputUserControl2" Type="WSASC" FieldName="UD,AD,ID,PD,UDN,ADN,IDN,PDN" Title="Consumers Total Demand" SeriesColors="5" />
                        </div>
                    </div>
                    <div class="item transition WaterSupply">
                        <div class="chart">
                            <Wsmo:OutputUserControl runat="server" ID="OutputUserControl1" Type="WSASF" FieldName="SUR_UD,SUR_AD,SUR_ID,SUR_PD,SURL_UD,SURL_AD,SURL_ID,SURL_PD,GW_UD,GW_AD,GW_ID,GW_PD,SAL_UD,SAL_AD,SAL_ID,SAL_PD,REC_UD,REC_AD,REC_ID,REC_PD" Title="Consumers" SeriesColors="5" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <audio id="idsound-1" src="Content/Audio/challenge 1_2e3_01.mp3"></audio>
    <audio id="idsound-2" src="Content/Audio/challenge 2_2e3_01.mp3"></audio>
    <audio id="idsound-3" src="Content/Audio/challenge 3_2e3_01.mp3"></audio>
    <script src="Scripts/Custom/load-files.js"></script>

</asp:Content>


