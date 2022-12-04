<!----------------------------------------------------------------------------
'
'  File:           Default.aspx
'
'  Facility:       The unit contains a form allowing goods to be added to a cart.
'
'  Abstract:       This class is used to display the interface of goods addition to a cart.
'
'  Environment:    VC 8.0
'
'  Author:         KB_Soft Group Ltd.
'
----------------------------------------------------------------------------->

<%@ Page Language="VB" AutoEventWireup="false" CodeFile="Default.aspx.vb" Inherits="_Default" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Untitled Page</title>
</head>
<body>
    <form id="form1" runat="server">
        <div>
            <table>
                <tr>
                    <td>
                    <!-- choosing an identifier of the cart where goods will be added -->
                        <span tabindex="0">Select Cart ID:</span>&nbsp;&nbsp;
                        <asp:DropDownList ID="ddlCartID" runat="server" Width="50">
                            <asp:ListItem Selected="True" Value="1">1</asp:ListItem>
                            <asp:ListItem Value="2">2</asp:ListItem>
                            <asp:ListItem Value="3">3</asp:ListItem>
                            <asp:ListItem Value="4">4</asp:ListItem>
                            <asp:ListItem Value="5">5</asp:ListItem>
                        </asp:DropDownList>
                    </td>
                </tr>
                <tr>
                    <td>
                    <!-- The GridView to display a list of goods -->
                        <asp:GridView ID="gvGoods" runat="server" AutoGenerateColumns="False" DataSourceID="odsGoods"
                            CellPadding="5" ForeColor="#333333" DataKeyNames="id">
                            <Columns>
                                <asp:BoundField DataField="id" HeaderText="#" SortExpression="id" />
                                <asp:BoundField DataField="name" HeaderText="Name" SortExpression="name" />
                                <asp:BoundField DataField="price" HeaderText="Price, $" SortExpression="price" />
                                <asp:TemplateField HeaderText="Quantity">
                                    <ItemTemplate>
                                        <table align="right">
                                            <tr>
                                                <td width="1" style="height: 24px">
                                                    <asp:RequiredFieldValidator ID="vrfQuantity" runat="server" ControlToValidate="txtQuantity"
                                                        CssClass="ValidatorMessage" Display="Dynamic" ErrorMessage="Quantity is required"
                                                        EnableClientScript="False" TabIndex="0">!&nbsp;</asp:RequiredFieldValidator>
                                                    <asp:CompareValidator ID="vQuantity" runat="server" ControlToValidate="txtQuantity"
                                                        Display="Dynamic" ErrorMessage="Quantity is invalid" Type="Integer" Operator="LessThan"
                                                        ValueToCompare="100000000" EnableClientScript="False" TabIndex="0">!</asp:CompareValidator>
                                                </td>
                                                <td align="right">
                                                    <asp:TextBox ID="txtQuantity" runat="server" ToolTip="Enter quantity" Width="40px"
                                                        Text="1">
                                                    </asp:TextBox>
                                                </td>
                                            </tr>
                                        </table>
                                    </ItemTemplate>
                                </asp:TemplateField>
                                <asp:ButtonField ButtonType="Button" CommandName="AddToBasket" Text="Add to Basket" />
                            </Columns>
                            <FooterStyle BackColor="#507CD1" Font-Bold="True" ForeColor="White" />
                            <RowStyle BackColor="#EFF3FB" />
                            <EditRowStyle BackColor="#2461BF" />
                            <PagerStyle BackColor="#2461BF" ForeColor="White" HorizontalAlign="Center" />
                            <HeaderStyle BackColor="#507CD1" Font-Bold="True" ForeColor="White" />
                            <AlternatingRowStyle BackColor="White" />
                        </asp:GridView>
                    </td>
                </tr>
                <tr>
                    <td align="right">
                        <asp:ImageButton ID="ibEdit" runat="server" ImageUrl="~/Images/viewcart.gif" />
                    </td>
                </tr>
            </table>
        </div>
        <!-- The ObjectDataSource to work with the list of goods -->
        <asp:ObjectDataSource ID="odsGoods" runat="server" TypeName="KBSoft.Carts" SelectMethod="LoadAllGoods">
        </asp:ObjectDataSource>
        &nbsp;&nbsp;
    </form>
</body>
</html>
