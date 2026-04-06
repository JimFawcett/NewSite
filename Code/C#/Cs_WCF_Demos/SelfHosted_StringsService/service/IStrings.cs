/////////////////////////////////////////////////////////////////////
// IStrings.cs - WCF Strings Service in Self Hosted Configuration  //
//                                                                 //
// Jim Fawcett, CSE775 - Distributed Objects, Spring 2009          //
/////////////////////////////////////////////////////////////////////

using CoreWCF;

namespace CSE775
{
  [ServiceContract(Namespace = "http://CSE775")]
  public interface IStrings
  {
    [OperationContract(IsOneWay = true)]
    void putString(string str);
    [OperationContract]
    void putRefString(ref string str);
    [OperationContract]
    string getString();
    [OperationContract]
    void getOutString(out string str);
  }
}
