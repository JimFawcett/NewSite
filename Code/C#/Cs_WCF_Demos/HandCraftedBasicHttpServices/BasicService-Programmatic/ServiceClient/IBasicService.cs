using System.ServiceModel;

namespace HandCraftedService
{
  [ServiceContract(Namespace="HandCraftedService")]
  public interface IBasicService
  {
    [OperationContract]
    void sendMessage(string msg);

    [OperationContract]
    string getMessage();
  }
}
