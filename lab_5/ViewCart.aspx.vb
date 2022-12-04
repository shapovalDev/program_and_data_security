'''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
'
'  File:           ViewCart.aspx.vb
'
'  Facility:       The unit contains the ViewCart class
'
'  Abstract:       This class is responsible for display of goods in a cart,
'                  for interaction with user, and for redirect to PayPal.
'
'  Environment:    VC 8.0
'
'  Author:         KB_Soft Group Ltd.
'
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

Imports System.IO
Imports System.Xml
Imports System.Globalization

Partial Class ViewCart
    Inherits System.Web.UI.Page

    Private Sub Page_Load(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles MyBase.Load        
        ' if the cart identifier is not passed in the request string
        If Request.QueryString.Count = 0 Then
            Response.Write("Invalid format of query string: cart_id is missed.")
            Me.ibPayPal.Visible = False
            Me.gvCarts.Visible = False
        End If

    End Sub

    Protected Sub ibPayPal_Click(ByVal sender As Object, ByVal e As System.Web.UI.ImageClickEventArgs) Handles ibPayPal.Click
        Dim ci As CultureInfo = New CultureInfo("en-us")        
        ' getting the total cost of the cart
        Dim cost As Decimal = CalculateTotalAmount()
        If cost = 0 Then
            Response.Redirect("~/Default.aspx")
        End If

        Try
            Session("Amount") = cost.ToString(ci)

            ' creating a record about the payment request
            Dim request_id As String = CreatePaymentRequest(Request.QueryString("cart_id").ToString, cost)
            If request_id <> Nothing Then
                Session("request_id") = request_id.ToString
            Else
                Return
            End If

        Catch ex As Exception
            KBSoft.Carts.WriteFile("Error in ViewCart.ibPayPal_Click(): " + ex.Message)
            Response.Redirect("~/Default.aspx")
        End Try

        Response.Redirect("~/PayPal.aspx")
    End Sub

    ''' <summary>
    ''' creating a record about the payment request
    ''' </summary>
    ''' <param name="cart_id">the cart identifier</param>
    ''' <param name="cost">the total cost of the cart</param>
    ''' <returns>the identifier of the request_id request</returns>
    Protected Function CreatePaymentRequest(ByVal cart_id As String, ByVal cost As Decimal) As Integer

        Dim xmlFile As String = Server.MapPath("~/App_Data/PaymentRequests.xml")
        Dim doc As New XmlDocument()
        Dim ci As CultureInfo = New CultureInfo("en-us")

        Dim reader As XmlTextReader

        If File.Exists(xmlFile) Then
            reader = New XmlTextReader(xmlFile)
            reader.Read()
        Else
            KBSoft.Carts.CreateXml(xmlFile, "Requests")
            reader = New XmlTextReader(xmlFile)
            reader.Read()
        End If

        doc.Load(reader)
        reader.Close()

        ' getting a unique request identifier
        Dim nodes As XmlNodeList = doc.GetElementsByTagName("Request")
        Dim request_id As Integer
        If nodes.Count <> 0 Then
            request_id = KBSoft.Carts.GetIdentity(nodes, "request_id")
        Else
            request_id = 0
        End If

        ' creating a new element containing information about the payment request
        Dim myrequest As XmlElement = doc.CreateElement("Request")
        myrequest.SetAttribute("request_id", request_id)
        myrequest.SetAttribute("cart_id", cart_id)
        myrequest.SetAttribute("price", cost.ToString(ci))
        myrequest.SetAttribute("request_date", DateTime.Now.ToString(ci))
        doc.DocumentElement.AppendChild(myrequest)

        Try
            doc.Save(xmlFile)
        Catch ex As Exception
            KBSoft.Carts.WriteFile("Error in ViewCart.CreatePaymentRequest(): " + ex.Message)
            Return Nothing
        End Try

        Return request_id
    End Function

    Protected Sub gvCarts_DataBound(ByVal sender As Object, ByVal e As System.EventArgs) Handles gvCarts.DataBound
        Try            
            ' adding a footer with information about the total cost of goods in the cart
            Dim ci As CultureInfo = New CultureInfo("en-us")
            Dim footer As GridViewRow = gvCarts.FooterRow
            footer.Cells(0).ColumnSpan = 2
            footer.Cells(0).HorizontalAlign = HorizontalAlign.Center
            footer.Cells.RemoveAt(1)
            footer.Cells(0).Text = "Total amount for payment: " + CalculateTotalAmount().ToString("C", ci)
        Catch ex As Exception
            KBSoft.Carts.WriteFile("Error in ViewCart.gvCarts_DataBound(): " + ex.Message)
        End Try
    End Sub

    ''' <summary>    
    ''' getting the total cost of goods in the cart
    ''' </summary>
    ''' <returns>the total cost of goods in the cart</returns>
    Protected Function CalculateTotalAmount() As Decimal
        Dim total As Decimal = 0
        Dim ci As CultureInfo = New CultureInfo("en-us")
        Try
            For Each row As GridViewRow In Me.gvCarts.Rows
                Dim price As Decimal = Decimal.Parse(row.Cells(1).Text, ci)
                Dim quantity As Integer = Decimal.Parse(row.Cells(2).Text, ci)
                total = total + (price * quantity)
            Next
            Return total
        Catch ex As Exception
            KBSoft.Carts.WriteFile("Error in ViewCart.CalculateTotalAmount(): Input string was not in a correct format")
            Return 0
        End Try
    End Function
End Class
