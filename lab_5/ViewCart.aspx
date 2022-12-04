<!----------------------------------------------------------------------------
'
'  File:           ViewCart.aspx
'
'  Facility:       The unit contains a form to display goods in a cart.
'
'  Abstract:       It is responsible for the interface that displays goods
'                  in a cart, deletes an item from the cart, and performs
'                  a redirect to PayPal.
'
'  Environment:    VC 8.0
'
'  Author:         KB_Soft Group Ltd.
'
----------------------------------------------------------------------------->

<%@ Page Language="VB" AutoEventWireup="false" CodeFile="ViewCart.aspx.vb" Inherits="ViewCart" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
    <title>View Basket</title>
</head>
<body>
    <form id="form1" runat="server">
        <div>
        <!-- The GridView to display a list of goods in the current cart -->
            <asp:GridView ID="gvCarts" runat="server" DataSourceID="odsCarts" DataKeyNames="rec_id"
                CellPadding="5" ForeColor="#333333" AutoGenerateColumns="False" ShowFooter="True">
                <Columns>
                    <asp:BoundField DataField="Name" HeaderText="Name" />
                    <asp:BoundField DataField="price" HeaderText="Price, $"/>
                    <asp:BoundField DataField="quantity" HeaderText="Quantity" />
                    <asp:ButtonField CommandName="Delete" ButtonType="Button" Text="Delete" HeaderText="Delete" />
                </Columns>
                <FooterStyle BackColor="#507CD1" Font-Bold="True" ForeColor="White" />
                <RowStyle BackColor="#EFF3FB" />
                <EditRowStyle BackColor="#2461BF" />
                <SelectedRowStyle BackColor="#D1DDF1" Font-Bold="True" ForeColor="#333333" />
                <PagerStyle BackColor="#2461BF" ForeColor="White" HorizontalAlign="Center" />
                <HeaderStyle BackColor="#507CD1" Font-Bold="True" ForeColor="White" />
                <AlternatingRowStyle BackColor="White" />
            </asp:GridView>
            <asp:Panel ID="pnlPayPal" runat="server" Width="100%">
                <asp:ImageButton ImageUrl="./Images/paybutton.gif" runat="server" ID="ibPayPal" />
            </asp:Panel>
            <!-- The ObjectDataSource to work with the current cart -->
            <asp:ObjectDataSource ID="odsCarts" runat="server" TypeName="KBSoft.Carts" SelectMethod="LoadCart"
                DeleteMethod="Delete">
                <SelectParameters>
                    <asp:QueryStringParameter DefaultValue="1" Name="cart_id" QueryStringField="cart_id"
                        Type="Int32" />
                </SelectParameters>
                <DeleteParameters>
                    <asp:Parameter Name="rec_id" Type="Int32" />
                </DeleteParameters>
            </asp:ObjectDataSource>
        </div>
    </form>
</body>
</html>
