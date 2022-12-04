'''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
'
'  File:           PayPal.aspx.vb
'
'  Facility:       The unit contains the PayPal class
'
'  Abstract:       This class is intended for interacting with PayPal with the
'                  help of the form of the payment request this class creates.
'
'  Environment:    VC 8.0
'
'  Author:         KB_Soft Group Ltd.
'
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

Imports System.Configuration.ConfigurationManager

Partial Class PayPal
    Inherits System.Web.UI.Page
    Protected cmd As String = "_xclick"
    Protected business As String = AppSettings("BusinessEmail")
    Protected item_name As String = "Payment for goods"
    Protected amount As String
    Protected return_url As String = AppSettings("ReturnUrl")
    Protected notify_url As String = AppSettings("NotifyUrl")
    Protected cancel_url As String = AppSettings("CancelPurchaseUrl")
    Protected currency_code As String = AppSettings("CurrencyCode")
    Protected no_shipping As String = "1"
    Protected URL As String
    Protected request_id As String
    Protected rm As String

    Private Sub Page_Load(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles Me.Load

        ' determining the URL to work with depending on whether sandbox or a real PayPal account should be used
        If AppSettings("UseSandbox").ToString = "true" Then
            URL = "https://www.sandbox.paypal.com/cgi-bin/webscr"
        Else
            URL = "https://www.paypal.com/cgi-bin/webscr"
        End If

        'This parameter determines the was information about successfull transaction will be passed to the script
        ' specified in the return_url parameter.
        ' "1" - no parameters will be passed.
        ' "2" - the POST method will be used.
        ' "0" - the GET method will be used. 
        ' The parameter is "0" by deault.
        If AppSettings("SendToReturnURL").ToString = "true" Then
            rm = "2"
        Else
            rm = "1"
        End If

        ' the total cost of the cart
        amount = Session("Amount")
        ' the identifier of the payment request
        request_id = Session("request_id")

    End Sub
End Class
