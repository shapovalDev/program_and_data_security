'''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
'
'  File:           IPNHandler.aspx.vb
'
'  Facility:       The unit contains the IPNHandler class
'
'  Abstract:       This class processes IPN requests, creates payment reports,
'                  and records the process of interaction with the PayPal server.
'
'  Environment:    VC 8.0
'
'  Author:         KB_Soft Group Ltd.
'
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

Imports System.Net
Imports System.IO
Imports System.Globalization
Imports System.Configuration.ConfigurationManager
Imports System.Data
Imports System.Xml

Partial Class IPNHandler
    Inherits System.Web.UI.Page

    Private business As String = AppSettings("BusinessEmail")
    Private currency_code As String = AppSettings("CurrencyCode")
    Shared requests As DataSet = New DataSet()
    Shared responses As DataSet = New DataSet()

    Private Sub Page_Load(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles MyBase.Load

        Dim ci As CultureInfo = New CultureInfo("en-us")
        Dim requestsFile As String = Server.MapPath("~/App_Data/PaymentRequests.xml")
        requests.Clear()

        If File.Exists(requestsFile) Then
            requests.ReadXml(requestsFile)
        Else
            KBSoft.Carts.CreateXml(requestsFile, "Requests")
            requests.ReadXml(requestsFile)
        End If

        Dim responseFile As String = Server.MapPath("~/App_Data/PaymentResponses.xml")
        responses.Clear()

        If File.Exists(responseFile) Then
            responses.ReadXml(responseFile)
        Else
            KBSoft.Carts.CreateXml(responseFile, "Responses")
            responses.ReadXml(responseFile)
        End If

        Dim strFormValues As String = Encoding.ASCII.GetString(Request.BinaryRead(Request.ContentLength))
        Dim strNewValue

        ' getting the URL to work with
        Dim URL As String
        If AppSettings("UseSandbox").ToString = "true" Then
            URL = "https://www.sandbox.paypal.com/cgi-bin/webscr"
        Else
            URL = "https://www.paypal.com/cgi-bin/webscr"
        End If

        ' Create the request back
        Dim req As HttpWebRequest = CType(WebRequest.Create(URL), HttpWebRequest)


        ' Set values for the request back
        req.Method = "POST"
        req.ContentType = "application/x-www-form-urlencoded"
        strNewValue = strFormValues + "&cmd=_notify-validate"
        req.ContentLength = strNewValue.Length

        ' Write the request back IPN strings
        Dim stOut As StreamWriter = New StreamWriter(req.GetRequestStream(), _
        Encoding.ASCII)
        stOut.Write(strNewValue)
        stOut.Close()

        'send the request, read the response
        Dim strResponse As HttpWebResponse = CType(req.GetResponse(), HttpWebResponse)
        Dim IPNResponseStream As Stream = strResponse.GetResponseStream
        Dim encode As Encoding = System.Text.Encoding.GetEncoding("utf-8")
        Dim readStream As New StreamReader(IPNResponseStream, encode)

        Dim read(256) As [Char]
        ' Reads 256 characters at a time.
        Dim count As Integer = readStream.Read(read, 0, 256)

        While count > 0
            ' Dumps the 256 characters to a string
            Dim IPNResponse As New [String](read, 0, count)
            count = readStream.Read(read, 0, 256)
            Dim amount As String
            Try                
                ' getting the total cost of the goods in cart for an identifier of the request stored in the "custom"
                ' variable
                amount = GetRequestPrice(Request("custom").ToString)
                If amount = "" Then
                    KBSoft.Carts.WriteFile("Error in IPNHandler: amount = """)
                    readStream.Close()
                    strResponse.Close()
                    Return
                End If

            Catch ex As Exception
                KBSoft.Carts.WriteFile("Error in IPNHandler: " + ex.Message)
                readStream.Close()
                strResponse.Close()
                Return
            End Try

            Dim provider As NumberFormatInfo = New NumberFormatInfo()
            provider.NumberDecimalSeparator = "."
            provider.NumberGroupSeparator = ","
            provider.NumberGroupSizes = New Integer() {3}

            ' if the request is verified
            If IPNResponse = "VERIFIED" Then                
                ' check the receiver's e-mail (login is user's identifier in PayPal) and the transaction type
                If Request("receiver_email") <> business Or Request("txn_type") <> "web_accept" Then
                    Try                        
                        ' parameters are not correct. Write a response from PayPal and create a record in the Log file.
                        CreatePaymentResponses(Request("txn_id"), Convert.ToDecimal(Request("mc_gross"), provider), _
                        Request("payer_email"), Request("first_name"), Request("last_name"), Request("address_street"), _
                        Request("address_city"), Request("address_state"), Request("address_zip"), Request("address_country"), _
                        Convert.ToInt32(Request("custom")), False, "INVALID paymetn's parameters (receiver_email or txn_type)")
                        KBSoft.Carts.WriteFile("Error in IPNHandler: INVALID paymetn's parameters (receiver_email or txn_type)")
                    Catch ex As Exception
                        KBSoft.Carts.WriteFile("Error in IPNHandler: " + ex.Message)
                    End Try
                    readStream.Close()
                    strResponse.Close()
                    Return
                End If                
                ' check whether this request was performed earlier for its identifier
                If IsDuplicateID(Request("txn_id")) Then                    
                    ' the current request is processed. Write a response from PayPal and create a record in the Log file.
                    CreatePaymentResponses(Request("txn_id"), Convert.ToDecimal(Request("mc_gross"), provider), _
                    Request("payer_email"), Request("first_name"), Request("last_name"), Request("address_street"), _
                    Request("address_city"), Request("address_state"), Request("address_zip"), Request("address_country"), _
                    Convert.ToInt32(Request("custom")), False, "Duplicate txn_id found")
                    KBSoft.Carts.WriteFile("Error in IPNHandler: Duplicate txn_id found")
                    readStream.Close()
                    strResponse.Close()
                    Return
                End If
                ' the amount of payment, the status of the payment, amd a possible reason of delay
                ' The fact that Getting txn_type=web_accept or txn_type=subscr_payment are got odes not mean that
                ' seller will receive the payment.
                ' That's why we check payment_status=completed. The single exception is when the seller's account in
                ' not American and pending_reason=intl
                If Request("mc_gross").ToString(ci) <> amount Or Request("mc_currency") <> currency_code Or _
                (Request("payment_status") <> "Completed" And Request("pending_reason") <> "intl") Then
                    ' parameters are incorrect or the payment was delayed. A response from PayPal should not be
                    ' written to DB of an XML file
                    ' because it may lead to a failure of uniqueness check of the request identifier.
                    ' Create a record in the Log file with information about the request.
                    KBSoft.Carts.WriteFile("Error in IPNHandler: INVALID paymetn's parameters. Request: " + strFormValues)
                    readStream.Close()
                    strResponse.Close()
                    Return
                End If

                Try                    
                    ' write a response from PayPal
                    CreatePaymentResponses(Request("txn_id"), Convert.ToDecimal(Request("mc_gross"), provider), _
                    Request("payer_email"), Request("first_name"), Request("last_name"), Request("address_street"), _
                    Request("address_city"), Request("address_state"), Request("address_zip"), Request("address_country"), _
                    Convert.ToInt32(Request("custom")), True, "")
                    KBSoft.Carts.WriteFile("Success in IPNHandler: PaymentResponses created")
                    '''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
                    ' Here we notify the person responsible for goods delivery that 
                    ' the payment was performed and providing him with all needed information about
                    ' the payment. Some flags informing that user paid for a services can be also set here.
                    ' For example, if user paid for registartion on the site, then the flag should be set 
                    ' allowing the user who paid to access the site
                    '''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

                Catch ex As Exception
                    KBSoft.Carts.WriteFile("Error in IPNHandler: " + ex.Message)
                End Try

            Else
                KBSoft.Carts.WriteFile("Error in IPNHandler. IPNResponse = 'INVALID'")
            End If
        End While

        readStream.Close()
        strResponse.Close()
    End Sub

    ''' <summary>    
    ''' creating a record about the response to the payment request
    ''' </summary>
    ''' <param name="txn_id">A unique transaction number</param>
    ''' <param name="payment_price">The total cost of the cart</param>
    ''' <param name="email">buyer's email</param>
    ''' <param name="first_name">buyer's name</param>
    ''' <param name="last_name">buyer's last name</param>
    ''' <param name="street">buyer's street</param>
    ''' <param name="city">buyer's city</param>
    ''' <param name="state">buyer's state</param>
    ''' <param name="zip">buyer's ZIP</param>
    ''' <param name="country">buyer's country</param>
    ''' <param name="request_id">an identifier of the payment request</param>
    ''' <param name="is_success">a flag indicating whether the payment was successfully performed</param>
    ''' <param name="reason_fault">a possible reason of the payment failure</param>
    Public Sub CreatePaymentResponses(ByVal txn_id As String, ByVal payment_price As Decimal, ByVal email As String, ByVal first_name As String, ByVal last_name As String, ByVal street As String, ByVal city As String, ByVal state As String, ByVal zip As String, ByVal country As String, ByVal request_id As Integer, ByVal is_success As Boolean, ByVal reason_fault As String)

        Try
            Dim ci As CultureInfo = New CultureInfo("en-us")
            Dim xmlFile As String = Server.MapPath("~/App_Data/PaymentResponses.xml")
            Dim doc As New XmlDocument()
            Dim payment_id As Integer
            Dim reader As XmlTextReader

            If File.Exists(xmlFile) Then
                reader = New XmlTextReader(xmlFile)
                reader.Read()
            Else
                KBSoft.Carts.CreateXml(xmlFile, "Responses")
                reader = New XmlTextReader(xmlFile)
                reader.Read()
            End If

            doc.Load(reader)
            reader.Close()

            ' getting a unique identifier of the payment_id payment
            Dim nodes As XmlNodeList = doc.GetElementsByTagName("Response")
            If nodes.Count <> 0 Then
                payment_id = KBSoft.Carts.GetIdentity(nodes, "payment_id")
            Else
                payment_id = 0
            End If

            ' creating a new element containing information about the payment
            Dim myresponse As XmlElement = doc.CreateElement("Response")
            myresponse.SetAttribute("payment_id", payment_id)
            myresponse.SetAttribute("txn_id", txn_id)
            myresponse.SetAttribute("payment_date", DateTime.Now.ToString(ci))
            myresponse.SetAttribute("payment_price", payment_price.ToString(ci))
            myresponse.SetAttribute("email", email)
            myresponse.SetAttribute("first_name", first_name)
            myresponse.SetAttribute("last_name", last_name)
            myresponse.SetAttribute("street", street)
            myresponse.SetAttribute("city", city)
            myresponse.SetAttribute("state", state)
            myresponse.SetAttribute("zip", zip)
            myresponse.SetAttribute("country", country)
            myresponse.SetAttribute("request_id", request_id)
            myresponse.SetAttribute("is_success", is_success)
            myresponse.SetAttribute("reason_fault", reason_fault)

            doc.DocumentElement.AppendChild(myresponse)

            doc.Save(xmlFile)
        Catch ex As Exception
            KBSoft.Carts.WriteFile("Error in IPNHandler.CreatePaymentResponses(): " + ex.Message)
        End Try

    End Sub

    ''' <summary>    
    ''' getting a cart identifier for the identifier of the current request_id request
    ''' </summary>
    ''' <param name="request_id">the request identifier</param>
    ''' <returns>the identifier of the cart for the current request</returns>
    Public Shared Function GetIDCart(ByVal request_id As String) As String

        Try
            Dim expression As String
            expression = "request_id = '" + request_id + "'"
            Dim tempRow As DataRow() = requests.Tables(0).Select(expression)
            If tempRow.Length = 1 Then
                Return tempRow(0).Item("cart_id").ToString
            End If
        Catch ex As Exception
            KBSoft.Carts.WriteFile("Error in IPNHandler.GetIDCart(): " + ex.Message)
        End Try

        Return ""
    End Function

    ''' <summary>    
    ''' getting the total cost for an identifier of the current request_id request
    ''' </summary>
    ''' <param name="request_id">the request identifier</param>
    ''' <returns>the total cost of the identifier</returns>
    Public Shared Function GetRequestPrice(ByVal request_id As String) As String
        Try
            Dim expression As String
            expression = "request_id = '" + request_id + "'"
            Dim tempRow As DataRow() = requests.Tables(0).Select(expression)
            If tempRow.Length = 1 Then
                Return tempRow(0).Item("price").ToString
            End If

        Catch ex As Exception
            KBSoft.Carts.WriteFile("Error in IPNHandler.GetRequestPrice(): " + ex.Message)
        End Try

        Return ""
    End Function

    ''' <summary>
    ''' checking whether the current request is duplicated for the unique number of the txn_id transaction
    ''' </summary>
    ''' <param name="txn_id">the unique transaction number</param>
    ''' <returns>true if the current request has already been processed</returns>
    Public Function IsDuplicateID(ByVal txn_id As String) As Boolean
        Try
            Dim expression As String
            expression = "txn_id = '" + txn_id + "'"
            Dim tempRow As DataRow() = responses.Tables(0).Select(expression)
            If tempRow.Length = 0 Then
                Return False
            End If
            Return True
        Catch ex As Exception
            KBSoft.Carts.WriteFile("Error in IPNHandler.IsDuplicateID(): " + ex.Message)
            Return False
        End Try
    End Function
End Class