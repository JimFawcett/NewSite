/////////////////////////////////////////////////////////////////////
// ICommunicator.cs - Peer-To-Peer Communicator Service Contract   //
// ver 2.0                                                         //
// Jim Fawcett, CSE681 - Software Modeling & Analysis, Summer 2011 //
/////////////////////////////////////////////////////////////////////

using CoreWCF;

namespace WCF_Peer_Comm
{
  [ServiceContract]
  public interface ICommunicator
  {
    [OperationContract(IsOneWay = true)]
    void PostMessage(string msg);

    // used only locally so not exposed as service method
    string GetMessage();
  }
}
