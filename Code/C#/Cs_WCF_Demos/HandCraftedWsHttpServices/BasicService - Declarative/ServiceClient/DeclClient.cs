/////////////////////////////////////////////////////////////////////////
// DeclClient.cs - Service Client for Declarative BasicService demo    //
//                                                                     //
// Jim Fawcett, CSE681 - Software Modeling and Analysis, Fall 2010     //
/////////////////////////////////////////////////////////////////////////
//
// - Started with C# Console Application Project
// - Made reference to .Net System.ServiceModel
// - Added using System.ServiceModel
// - Made reference to IService dll
// - Project->Add New Item->Application Configuration File
// - Added config settings

using System;
using System.ServiceModel;
using HandCraftedService;

namespace ServiceClient
{
  // proxy wraps ClientBase<T> with programmatic WSHttpBinding (SecurityMode.None)
  public class proxy :
    System.ServiceModel.ClientBase<HandCraftedService.IBasicService>,
    HandCraftedService.IBasicService
  {
    public proxy(System.ServiceModel.Channels.Binding binding, EndpointAddress address)
      : base(binding, address) { }

    public void sendMessage(string msg) { base.Channel.sendMessage(msg); }
    public string getMessage() { return base.Channel.getMessage(); }
  }

  class DeclClient
  {
    static void Main(string[] args)
    {
      Console.Write("\n  Starting Declarative WsHttp BasicService Client");
      Console.Write("\n =================================================\n");

      string url = "http://localhost:8080/BasicService";
      var binding = new WSHttpBinding(SecurityMode.None);
      var address = new EndpointAddress(url);

      Console.Write("\n  using first proxy");
      Console.Write("\n -------------------");
      proxy proxy1 = new proxy(binding, address);
      string msg = "This is a test message from first client";
      proxy1.sendMessage(msg);
      msg = proxy1.getMessage();
      Console.Write("\n  Message received from Service: {0}\n", msg);

      Console.Write("\n  using second proxy");
      Console.Write("\n --------------------");
      proxy proxy2 = new proxy(binding, address);
      msg = "This is a test message from second client";
      proxy2.sendMessage(msg);
      msg = proxy2.getMessage();
      Console.Write("\n  Message received from Service: {0}\n\n", msg);
    }
  }
}
