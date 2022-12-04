'''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
'
'  File:           Carts.vb
'
'  Facility:       The unit contains the Carts class
'
'  Abstract:       This class is responsible for work with carts and provides
'                  additional functions that are used in the entire site.
'
'  Environment:    VC 8.0
'
'  Author:         KB_Soft Group Ltd.
'
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

Imports Microsoft.VisualBasic
Imports System.Data
Imports System.Xml
Imports System.IO
Imports System.Globalization

Namespace KBSoft
    Public Class Carts
        Shared carts As DataSet = New DataSet()
        Shared goods As DataSet = New DataSet()

        ''' <summary>
        ''' Loads the full list of goods from an XML file into DataSet
        ''' </summary>
        ''' <returns>The DataSet that contains the list of goods.</returns>
        Public Shared Function LoadAllGoods() As DataSet
            Dim goodsFile As String = HttpContext.Current.Server.MapPath("~/App_Data/Goods.xml")
            goods.Clear()

            If File.Exists(goodsFile) Then
                goods.ReadXml(goodsFile)
            Else
                KBSoft.Carts.CreateXml(goodsFile, "Goods")
                goods.ReadXml(goodsFile)
            End If

            Return goods
        End Function

        ''' <summary>
        ''' Loads the list of goods in a cart with a definite cart_id from an XML file into DataSet
        ''' </summary>
        ''' <param name="cart_id">the cart idetntifier</param>
        ''' <returns>The DataSet with the list of goods in the cart with the cart_id.</returns>
        Public Shared Function LoadCart(ByVal cart_id As Integer) As DataSet

            Dim currentCart As DataSet = New DataSet()
            Dim cartsFile As String = HttpContext.Current.Server.MapPath("~/App_Data/Carts.xml")
            carts.Clear()

            If File.Exists(cartsFile) Then
                carts.ReadXml(cartsFile)
            Else
                KBSoft.Carts.CreateXml(cartsFile, "Carts")
                carts.ReadXml(cartsFile)
            End If

            Dim goodsFile As String = HttpContext.Current.Server.MapPath("~/App_Data/Goods.xml")
            goods.Clear()

            If File.Exists(goodsFile) Then
                goods.ReadXml(goodsFile)
            Else
                KBSoft.Carts.CreateXml(goodsFile, "Goods")
                goods.ReadXml(goodsFile)
            End If

            ' creates a copy of all carts
            currentCart = carts.Copy()
            Dim expression As String
            Dim foundRows() As DataRow

            'an expression for searching for a cart with a cart_id
            expression = "cart_id <> '" + cart_id.ToString + "'"

            If currentCart.Tables.Count = 0 Then
                WriteFile("Error in Carts.LoadCart(): " + "currentCart.Tables.Count = 0")
                HttpContext.Current.Response.Redirect("~/Default.aspx")
            End If

            If currentCart.Tables(0).Rows.Count = 0 Then
                WriteFile("Error in Carts.LoadCart(): " + "currentCart.Rows.Count = 0")
                HttpContext.Current.Response.Redirect("~/Default.aspx")
            End If
            Try                
                ' remove all goods from the current cart with the cart_id that does not ocincide with the specified one
                foundRows = currentCart.Tables(0).Select(expression)
                Dim i As Integer
                For i = 0 To foundRows.GetUpperBound(0)
                    foundRows(i).Delete()
                Next i

                ' getting a name of item for its item_id in order to display it further in GridView
                Dim column As DataColumn = currentCart.Tables(0).Columns("item_id")
                currentCart.Tables(0).Columns.Add("Name", System.Type.GetType("System.String"))
                For Each row As DataRow In currentCart.Tables(0).Rows
                    Dim name As String = SearchIDGoods(row.Item("item_id").ToString)
                    If name <> "" Then
                        row.Item("Name") = name
                    End If
                Next

                Return currentCart
            Catch ex As Exception
                currentCart.Clear()
                WriteFile("Error in Carts.LoadCart(): " + ex.Message)
                HttpContext.Current.Response.Redirect("~/Default.aspx")
                Return Nothing
            End Try
        End Function

        ''' <summary>
        ''' searching an item name for its item_id
        ''' </summary>
        ''' <param name="item_id">the item identifier</param>
        ''' <returns>the item name</returns>
        Public Shared Function SearchIDGoods(ByVal item_id As String) As String
            Try                
                'an expression for searching for an item for its id
                Dim expression As String
                expression = "id = '" + item_id + "'"

                Dim tempRow As DataRow() = goods.Tables(0).Select(expression)
                If tempRow.Length = 1 Then
                    Return tempRow(0).Item("name").ToString
                End If
            Catch ex As Exception
                WriteFile("Error in Carts.SearchIDGoods(): " + ex.Message)
            End Try
            Return ""
        End Function

        ''' <summary>
        ''' removing an item with rec_id from cart
        ''' </summary>
        ''' <param name="rec_id">the record identifier</param>
        Public Shared Sub Delete(ByVal rec_id As Integer)
            Try
                Dim xmlFile As String = HttpContext.Current.Server.MapPath("~/App_Data/Carts.xml")

                'An expression for searching for an item for its record identifier in the Carts.xml file
                Dim expression As String
                expression = "rec_id = '" + rec_id.ToString + "'"

                Dim tempRow As DataRow() = carts.Tables(0).Select(expression)
                If tempRow.Length = 1 Then
                    tempRow(0).Delete()
                    carts.WriteXml(xmlFile)
                End If
            Catch ex As Exception
                WriteFile("Error in Carts.Delete(): " + ex.Message)
                HttpContext.Current.Response.Redirect("~/Default.aspx")
            End Try
        End Sub

        ''' <summary>        
        ''' crating different XML files using a file name and a root element
        ''' </summary>
        ''' <param name="xmlFile">the file name</param>
        ''' <param name="element">a name of the root element</param>
        Public Shared Sub CreateXml(ByVal xmlFile As String, ByVal element As String)

            'Create the XmlDocument.
            Dim doc As XmlDocument = New XmlDocument()
            Dim xmlData As String = "<" + element + "></" + element + ">"

            doc.Load(New StringReader(xmlData))

            ' create an item by default
            If element = "Goods" Then
                Dim good As XmlElement = doc.CreateElement("Good")
                good.SetAttribute("id", "0")
                good.SetAttribute("name", "Sample of good")
                good.SetAttribute("price", "10.99")
                doc.DocumentElement.AppendChild(good)

            End If

            Try
                doc.Save(xmlFile)
            Catch ex As Exception
                WriteFile("Error in Carts.CreateXml(): " + ex.Message)
            End Try

        End Sub

        ''' <summary>        
        ''' getting a unique identification number
        ''' </summary>
        ''' <param name="nodes">a list of existing nodes</param>
        ''' <param name="columnName">a name of the column where the unique identifier is searched</param>
        ''' <returns>the unque record identifier for the specified column</returns>
        ''' <remarks></remarks>
        Public Shared Function GetIdentity(ByVal nodes As XmlNodeList, ByVal columnName As String) As Integer
            Try
                Dim max_rec As Integer = 0
                For Each node As XmlNode In nodes
                    Dim currentRec As Integer = CType(node.Attributes(columnName).InnerText, Integer)
                    If (currentRec > max_rec) Then
                        max_rec = currentRec
                    End If
                Next
                Return max_rec + 1
            Catch ex As Exception
                WriteFile("Error in Carts.GetIdentity(): " + ex.Message)
                Return 0
            End Try

        End Function
        ''' <summary>
        ''' creating a Log file
        ''' </summary>
        ''' <param name="text">a text to be written in the Log file</param>
        Public Shared Sub WriteFile(ByVal text As String)
            Dim ci As CultureInfo = New CultureInfo("en-us")
            Dim sw As New StreamWriter(HttpContext.Current.Server.MapPath("Log") + "\" + "Log.txt", True, Encoding.ASCII)
            sw.Write(DateTime.Now.ToString(ci))
            sw.Write(": ")
            sw.Write(text)
            sw.Write(Environment.NewLine)
            sw.Close()
        End Sub
    End Class
End Namespace
