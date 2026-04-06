///////////////////////////////////////////////////////////////////////////
// IStreamService.cs - WCF StreamService in Self Hosted Configuration    //
//                                                                       //
// Jim Fawcett, CSE681 - Software Modeling and Analysis, Summer 2009     //
///////////////////////////////////////////////////////////////////////////

using System;
using System.IO;
using System.ServiceModel;

namespace CSE681
{
  [ServiceContract(Namespace = "http://CSE681")]
  public interface IStreamService
  {
    [OperationContract]
    bool upLoadFile(string filename, byte[] data);
    [OperationContract]
    byte[] downLoadFile(string filename);
  }
}